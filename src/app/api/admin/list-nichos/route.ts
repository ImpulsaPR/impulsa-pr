import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ADMIN_EMAILS = new Set(
  (process.env.SUPERADMIN_EMAIL || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
)

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

  const { data, error } = await admin
    .from('nichos_templates')
    .select('nicho_id, nombre_display')
    .order('nombre_display', { ascending: true })

  if (error) {
    console.error('[admin_list_nichos]', error.message)
    return NextResponse.json({ error: 'Error consultando nichos', nichos: [] }, { status: 500 })
  }

  return NextResponse.json({ ok: true, nichos: data || [] })
}
