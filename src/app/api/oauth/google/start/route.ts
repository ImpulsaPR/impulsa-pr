import { NextResponse } from 'next/server'
import { randomBytes, createHmac } from 'crypto'
import { createSupabaseServer } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const CLIENT_ID = (process.env.GOOGLE_CLIENT_ID || '').trim()
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://cliente.impulsapr.com').trim()
const STATE_SECRET = (
  process.env.OAUTH_STATE_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  ''
).trim()

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ')

export async function GET() {
  if (!CLIENT_ID) {
    return NextResponse.json({ error: 'GOOGLE_CLIENT_ID no configurado' }, { status: 500 })
  }

  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const redirectUri = `${APP_URL}/api/oauth/google/callback`

  // CSRF protection: nonce random + HMAC-firmado, almacenado en cookie
  // HttpOnly que solo el callback puede leer. Expiry 10 min.
  const nonce = randomBytes(32).toString('base64url')
  const expiresAt = Date.now() + 10 * 60 * 1000
  const payload = `${user.id}|${nonce}|${expiresAt}`
  const sig = createHmac('sha256', STATE_SECRET).update(payload).digest('base64url')
  const state = Buffer.from(`${payload}|${sig}`).toString('base64url')

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', CLIENT_ID)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', SCOPES)
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('prompt', 'consent')
  url.searchParams.set('state', state)
  url.searchParams.set('include_granted_scopes', 'true')

  const response = NextResponse.redirect(url.toString())
  response.cookies.set('oauth_nonce', nonce, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/api/oauth/google/callback',
    maxAge: 10 * 60,
  })

  return response
}
