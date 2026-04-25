import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase-server'
import { encryptToken } from '@/lib/token-crypto'

export const runtime = 'nodejs'

const CLIENT_ID = (process.env.GOOGLE_CLIENT_ID || '').trim()
const CLIENT_SECRET = (process.env.GOOGLE_CLIENT_SECRET || '').trim()
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://cliente.impulsapr.com').trim()
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
const SUPABASE_SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
const STATE_SECRET = (
  process.env.OAUTH_STATE_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  ''
).trim()

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
  const res = NextResponse.redirect(url.toString())
  // Clear the nonce cookie regardless of outcome
  res.cookies.set('oauth_nonce', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/api/oauth/google/callback',
    maxAge: 0,
  })
  return res
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

  // Verify CSRF state: HMAC-signed payload + nonce from HttpOnly cookie + expiry.
  if (!state) return settingsRedirect({ calendar_error: 'no_state' })
  let stateUserId = ''
  let stateNonce = ''
  let stateExpires = 0
  try {
    const decoded = Buffer.from(state, 'base64url').toString('utf8')
    const parts = decoded.split('|')
    if (parts.length !== 4) throw new Error('bad parts')
    const [uid, nonce, expStr, sig] = parts
    const expectedSig = createHmac('sha256', STATE_SECRET)
      .update(`${uid}|${nonce}|${expStr}`)
      .digest('base64url')
    const a = Buffer.from(expectedSig, 'utf8')
    const b = Buffer.from(sig, 'utf8')
    if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error('bad sig')
    stateUserId = uid
    stateNonce = nonce
    stateExpires = Number(expStr)
  } catch {
    return settingsRedirect({ calendar_error: 'state_invalid' })
  }
  if (Date.now() > stateExpires) {
    return settingsRedirect({ calendar_error: 'state_expirado' })
  }

  // Verify nonce against HttpOnly cookie (prevents replay even if state leaks)
  const cookieNonce = req.headers
    .get('cookie')
    ?.split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('oauth_nonce='))
    ?.slice('oauth_nonce='.length)
  if (!cookieNonce || cookieNonce !== stateNonce) {
    return settingsRedirect({ calendar_error: 'nonce_mismatch' })
  }

  // Auth current session
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return settingsRedirect({ calendar_error: 'sesion_expirada' })
  }
  if (stateUserId !== user.id) {
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
        access_token: encryptToken(tokens.access_token),
        refresh_token: tokens.refresh_token ? encryptToken(tokens.refresh_token) : null,
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
    console.error('[oauth_callback]', upsertErr.message)
    return settingsRedirect({ calendar_error: 'db_save_failed' })
  }

  return settingsRedirect({ calendar_connected: '1' })
}
