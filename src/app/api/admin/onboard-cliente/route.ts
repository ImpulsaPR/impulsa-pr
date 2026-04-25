import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ADMIN_EMAILS = new Set(
  (process.env.SUPERADMIN_EMAIL || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
)

// Webhook url fija — n8n routea por número de teléfono, no por path
const N8N_WEBHOOK_URL = 'https://n8n.impulsapr.com/webhook/bot-whatsapp'

interface OnboardBody {
  email?: string
  nombre?: string
  empresa?: string
  nicho?: string
  numero_whatsapp_bot?: string
  numero_dueno?: string
  email_dueno?: string
  nombre_agente?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+\d{10,15}$/

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'cliente'
}

function randomSuffix(len = 6): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  const bytes = crypto.getRandomValues(new Uint8Array(len))
  for (let i = 0; i < len; i++) out += alphabet[bytes[i] % alphabet.length]
  return out
}

function logErr(stage: string, err: unknown) {
  console.error(`[admin/onboard-cliente] ${stage}:`, err)
}

export async function POST(req: Request) {
  if (!SUPABASE_SERVICE_KEY || !SUPABASE_URL) {
    return NextResponse.json({ error: 'supabase no configurado' }, { status: 500 })
  }
  // ADMIN_EMAILS siempre tiene fallback hardcoded

  // 1. Auth: super-admin only
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (!ADMIN_EMAILS.has((user.email || '').toLowerCase())) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  // 2. Validar body
  let body: OnboardBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'json invalido' }, { status: 400 })
  }

  const email = (body.email || '').trim().toLowerCase()
  const nombre = (body.nombre || '').trim()
  const empresa = (body.empresa || '').trim()
  const nicho = (body.nicho || '').trim()
  const numero_whatsapp_bot = (body.numero_whatsapp_bot || '').trim()
  const numero_dueno = (body.numero_dueno || '').trim()
  const email_dueno = (body.email_dueno || '').trim() || null
  const nombre_agente = (body.nombre_agente || '').trim() || 'Asistente'

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'email invalido' }, { status: 400 })
  }
  if (!nombre) return NextResponse.json({ error: 'nombre requerido' }, { status: 400 })
  if (!empresa) return NextResponse.json({ error: 'empresa requerida' }, { status: 400 })
  if (!nicho) return NextResponse.json({ error: 'nicho requerido' }, { status: 400 })
  if (!PHONE_RE.test(numero_whatsapp_bot)) {
    return NextResponse.json(
      { error: 'numero_whatsapp_bot invalido (formato +1XXXXXXXXXX)' },
      { status: 400 }
    )
  }
  if (!PHONE_RE.test(numero_dueno)) {
    return NextResponse.json(
      { error: 'numero_dueno invalido (formato +1XXXXXXXXXX)' },
      { status: 400 }
    )
  }
  if (email_dueno && !EMAIL_RE.test(email_dueno)) {
    return NextResponse.json({ error: 'email_dueno invalido' }, { status: 400 })
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // 3. Validar nicho existe
  try {
    const { data: nichoRow, error: nichoErr } = await admin
      .from('nichos_templates')
      .select('nicho_id')
      .eq('nicho_id', nicho)
      .maybeSingle()
    if (nichoErr) {
      logErr('check_nicho', nichoErr)
      return NextResponse.json(
        { error: 'no se pudo validar el nicho' },
        { status: 500 }
      )
    }
    if (!nichoRow) {
      return NextResponse.json({ error: 'nicho no existe en nichos_templates' }, { status: 400 })
    }
  } catch (e) {
    logErr('check_nicho_throw', e)
    return NextResponse.json({ error: 'fallo al validar nicho' }, { status: 500 })
  }

  // 4. Validar que el numero_whatsapp_bot no exista ya
  {
    const { data: existing } = await admin
      .from('bots')
      .select('id')
      .eq('numero_whatsapp_bot', numero_whatsapp_bot)
      .maybeSingle()
    if (existing) {
      return NextResponse.json(
        { error: 'numero_whatsapp_bot ya esta en uso por otro bot' },
        { status: 409 }
      )
    }
  }

  // 5. Validar email no esté ya en clientes
  {
    const { data: existing } = await admin
      .from('clientes')
      .select('id')
      .eq('email', email)
      .maybeSingle()
    if (existing) {
      return NextResponse.json({ error: 'email ya registrado como cliente' }, { status: 409 })
    }
  }

  // 6. Crear auth user via inviteUserByEmail
  const url = new URL(req.url)
  const origin = req.headers.get('origin') || `${url.protocol}//${url.host}`
  const redirectTo = `${origin}/login`

  let authUserId: string | null = null
  try {
    const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: { nombre, empresa },
    })
    if (inviteErr || !invited?.user) {
      logErr('invite', inviteErr)
      return NextResponse.json(
        { error: 'no se pudo enviar invitacion' },
        { status: 500 }
      )
    }
    authUserId = invited.user.id
  } catch (e) {
    logErr('invite_throw', e)
    return NextResponse.json({ error: 'fallo invitacion' }, { status: 500 })
  }

  // 7-8. Insert cliente + bot ATÓMICO via RPC. Si falla cualquier paso,
  // Postgres hace rollback total. Solo queda rollback del auth user
  // que ya creamos arriba.
  const webhook_path = `${slugify(empresa)}-${randomSuffix(6)}`
  let clienteId: string | null = null
  let botId: string | null = null

  try {
    const { data: rpcResult, error: rpcErr } = await (admin.rpc as unknown as (
      fn: string,
      args: Record<string, unknown>
    ) => Promise<{ data: Array<{ cliente_id: string; bot_id: string }> | null; error: { message: string } | null }>)(
      'admin_onboard_cliente',
      {
        p_auth_user_id: authUserId,
        p_email: email,
        p_nombre: nombre,
        p_empresa: empresa,
        p_nicho: nicho,
        p_numero_whatsapp_bot: numero_whatsapp_bot,
        p_numero_dueno: numero_dueno,
        p_email_dueno: email_dueno || null,
        p_nombre_agente: nombre_agente,
        p_webhook_path: webhook_path,
      }
    )

    if (rpcErr || !rpcResult || rpcResult.length === 0) {
      logErr('rpc_onboard', rpcErr)
      if (authUserId) {
        await admin.auth.admin.deleteUser(authUserId).catch((e) => logErr('rollback_auth', e))
      }
      return NextResponse.json(
        { error: 'fallo al crear cliente/bot' },
        { status: 500 }
      )
    }

    clienteId = rpcResult[0].cliente_id
    botId = rpcResult[0].bot_id
  } catch (e) {
    logErr('rpc_onboard_throw', e)
    if (authUserId) {
      await admin.auth.admin.deleteUser(authUserId).catch((er) => logErr('rollback_auth', er))
    }
    return NextResponse.json({ error: 'fallo al crear cliente/bot' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    cliente_id: clienteId,
    bot_id: botId,
    webhook_path,
    webhook_url: N8N_WEBHOOK_URL,
    invite_sent: true,
  })
}
