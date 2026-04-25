import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ADMIN_EMAILS = new Set(
  (process.env.SUPERADMIN_EMAIL || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
)

interface ClienteRow {
  id: string
  email: string
  nombre: string | null
  empresa: string | null
  plan: string | null
  created_at: string | null
  bot?: { id: string; activo: boolean | null; nicho: string | null } | null
}

export async function GET() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (!ADMIN_EMAILS.has((user.email || '').toLowerCase())) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // Pedimos clientes y bots en 2 queries para no depender del FK relationship hint
  const [clientesRes, botsRes, nichosRes] = await Promise.all([
    admin
      .from('clientes')
      .select('id, email, nombre, empresa, plan, created_at')
      .order('created_at', { ascending: false }),
    admin.from('bots').select('id, cliente_id, activo, nicho'),
    admin
      .from('nichos_templates')
      .select('nicho_id, nombre_display')
      .then((r) => r, () => ({ data: [], error: null })),
  ])

  if (clientesRes.error) {
    console.error('[admin_list_clientes]', clientesRes.error.message)
    return NextResponse.json({ error: 'Error consultando clientes' }, { status: 500 })
  }

  const botsByCliente = new Map<string, { id: string; activo: boolean | null; nicho: string | null }>()
  for (const b of (botsRes.data || []) as Array<{
    id: string
    cliente_id: string
    activo: boolean | null
    nicho: string | null
  }>) {
    botsByCliente.set(b.cliente_id, { id: b.id, activo: b.activo, nicho: b.nicho })
  }

  const nichoMap = new Map<string, string>()
  for (const n of (nichosRes.data || []) as Array<{ nicho_id: string; nombre_display: string }>) {
    nichoMap.set(n.nicho_id, n.nombre_display)
  }

  const clientes: ClienteRow[] = ((clientesRes.data || []) as ClienteRow[]).map((c) => ({
    ...c,
    bot: botsByCliente.get(c.id) || null,
  }))

  return NextResponse.json({
    ok: true,
    clientes,
    nichos: Object.fromEntries(nichoMap),
  })
}
