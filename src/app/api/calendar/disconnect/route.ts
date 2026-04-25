import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST() {
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

  // Get current creds to revoke at Google
  const { data: cred } = await admin
    .from('bot_credentials')
    .select('access_token, refresh_token')
    .eq('cliente_id', cliente.id)
    .eq('provider', 'google_calendar')
    .single()

  // Revoke at Google (best effort, no bloquea si falla)
  if (cred?.refresh_token || cred?.access_token) {
    try {
      const token = cred.refresh_token || cred.access_token
      await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token!)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    } catch {}
  }

  // Delete row
  await admin
    .from('bot_credentials')
    .delete()
    .eq('cliente_id', cliente.id)
    .eq('provider', 'google_calendar')

  return NextResponse.json({ ok: true })
}
