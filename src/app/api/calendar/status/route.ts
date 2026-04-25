import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: cliente } = await admin
    .from('clientes')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (!cliente) return NextResponse.json({ error: 'cliente_no_encontrado' }, { status: 403 })

  const { data: cred } = await admin
    .from('bot_credentials')
    .select('google_email, calendar_id, calendar_name, expires_at, created_at, updated_at')
    .eq('cliente_id', cliente.id)
    .eq('provider', 'google_calendar')
    .single()

  if (!cred) {
    return NextResponse.json({ connected: false })
  }

  return NextResponse.json({
    connected: true,
    google_email: cred.google_email,
    calendar_id: cred.calendar_id,
    calendar_name: cred.calendar_name,
    expires_at: cred.expires_at,
    connected_at: cred.created_at,
  })
}
