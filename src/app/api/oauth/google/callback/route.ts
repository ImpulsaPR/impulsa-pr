import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const CLIENT_ID = (process.env.GOOGLE_CLIENT_ID || '').trim()
const CLIENT_SECRET = (process.env.GOOGLE_CLIENT_SECRET || '').trim()
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://cliente.impulsapr.com').trim()
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
const SUPABASE_SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()

interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
  token_type: string
  id_token?: string
}

interface UserInfo {
  email: string
  name?: string
  picture?: string
}

function settingsRedirect(query: Record<string, string>) {
  const url = new URL(`${APP_URL}/settings`)
  Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v))
  return NextResponse.redirect(url.toString())
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return settingsRedirect({ calendar_error: error })
  }
  if (!code) {
    return settingsRedirect({ calendar_error: 'sin_codigo' })
  }

  // Decode state for sanity check (anti-CSRF light)
  let stateData: { user_id?: string; ts?: number } = {}
  try {
    stateData = JSON.parse(Buffer.from(state || '', 'base64url').toString('utf8'))
  } catch {}

  // Auth current session
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return settingsRedirect({ calendar_error: 'sesion_expirada' })
  }
  if (stateData.user_id && stateData.user_id !== user.id) {
    return settingsRedirect({ calendar_error: 'state_mismatch' })
  }

  // Exchange code for tokens
  const redirectUri = `${APP_URL}/api/oauth/google/callback`
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    const detail = await tokenRes.text().catch(() => '')
    return settingsRedirect({ calendar_error: 'token_exchange_failed', detail: detail.slice(0, 80) })
  }

  const tokens = (await tokenRes.json()) as TokenResponse

  // Fetch user info to know which Google account got connected
  let googleEmail: string | null = null
  try {
    const meRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    if (meRes.ok) {
      const me = (await meRes.json()) as UserInfo
      googleEmail = me.email || null
    }
  } catch {}

  // Resolve cliente_id
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: cliente } = await admin
    .from('clientes')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (!cliente) {
    return settingsRedirect({ calendar_error: 'cliente_no_encontrado' })
  }

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

  // Upsert credentials
  const { error: upsertErr } = await admin
    .from('bot_credentials')
    .upsert(
      {
        cliente_id: cliente.id,
        provider: 'google_calendar',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        expires_at: expiresAt,
        scope: tokens.scope,
        google_email: googleEmail,
        calendar_id: 'primary',
        calendar_name: googleEmail ? `Calendario principal de ${googleEmail}` : 'Calendario principal',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'cliente_id,provider' }
    )

  if (upsertErr) {
    return settingsRedirect({ calendar_error: 'db_save_failed', detail: upsertErr.message.slice(0, 80) })
  }

  return settingsRedirect({ calendar_connected: '1' })
}
