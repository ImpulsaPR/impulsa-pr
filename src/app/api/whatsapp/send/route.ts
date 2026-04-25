import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase-server'

const YCLOUD_BASE = 'https://api.ycloud.com/v2'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const YCLOUD_API_KEY = process.env.YCLOUD_API_KEY!

export const runtime = 'nodejs'

interface SendBody {
  telefono: string
  mensaje: string
}

export async function POST(req: Request) {
  if (!YCLOUD_API_KEY) {
    return NextResponse.json({ error: 'YCLOUD_API_KEY not configured' }, { status: 500 })
  }
  if (!SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 })
  }

  // 1. Authenticate via SSR cookies
  const supabase = await createSupabaseServer()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // 2. Parse body
  let body: SendBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
  const telefono = (body.telefono || '').replace(/\D/g, '')
  const mensaje = (body.mensaje || '').trim()
  if (!telefono || !mensaje) {
    return NextResponse.json({ error: 'telefono y mensaje son requeridos' }, { status: 400 })
  }
  if (mensaje.length > 4096) {
    return NextResponse.json({ error: 'mensaje supera 4096 chars' }, { status: 400 })
  }

  // 3. Service-role client to bypass RLS for cross-table writes
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // 4. Resolve cliente_id from auth user
  const { data: cliente, error: cliErr } = await admin
    .from('clientes')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (cliErr || !cliente) {
    return NextResponse.json({ error: 'cliente no encontrado para usuario auth' }, { status: 403 })
  }
  const clienteId = cliente.id as string

  // 5. Get bot config (numero_whatsapp_bot to send from)
  const { data: bot } = await admin
    .from('bots')
    .select('numero_whatsapp_bot, nombre_agente')
    .eq('cliente_id', clienteId)
    .eq('activo', true)
    .limit(1)
    .single()
  if (!bot?.numero_whatsapp_bot) {
    return NextResponse.json(
      { error: 'bot no configurado o sin numero_whatsapp_bot' },
      { status: 422 }
    )
  }
  const fromPhone = String(bot.numero_whatsapp_bot)
  const toPhone = telefono.startsWith('+') ? telefono : `+${telefono}`

  // 6. Send via YCloud
  const ycloudRes = await fetch(`${YCLOUD_BASE}/whatsapp/messages`, {
    method: 'POST',
    headers: {
      'X-API-Key': YCLOUD_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromPhone,
      to: toPhone,
      type: 'text',
      text: { body: mensaje },
    }),
  })

  const ycloudJson = await ycloudRes.json().catch(() => ({}))
  if (!ycloudRes.ok) {
    return NextResponse.json(
      { error: 'YCloud send failed', detail: ycloudJson },
      { status: 502 }
    )
  }

  const messageId = ycloudJson?.id || null

  // 7. Register takeover so bot stays silent for 6h
  const phoneNoPlus = telefono.replace(/^\+/, '')
  const nowIso = new Date().toISOString()
  await admin
    .from('human_takeover')
    .upsert(
      {
        telefono: phoneNoPlus,
        timestamp_takeover: nowIso,
        cliente_id: clienteId,
      },
      { onConflict: 'telefono' }
    )

  // 8. Persist outbound msg in whatsapp_historial (rol=humano)
  await admin.from('whatsapp_historial').insert({
    telefono: phoneNoPlus,
    rol: 'humano',
    mensaje,
    cliente_id: clienteId,
  })

  // 9. Mark message_id in bot_sent_messages? No — this is a human, NOT bot.
  // The takeover detection in n8n: when YCloud webhooks back the 'sent' event,
  // Buscar Msg Bot finds nothing → No Era Bot? -> registers takeover (already
  // registered here). Idempotent.

  // 10. Mark lead.humano_activo=true if a lead exists
  await admin
    .from('leads')
    .update({ humano_activo: true, humano_timestamp: nowIso })
    .eq('telefono', phoneNoPlus)
    .eq('cliente_id', clienteId)

  return NextResponse.json({
    ok: true,
    message_id: messageId,
    sent_at: nowIso,
  })
}
