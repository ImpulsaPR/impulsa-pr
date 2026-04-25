import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
const SUPABASE_SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
const GOOGLE_CLIENT_ID = (process.env.GOOGLE_CLIENT_ID || '').trim()
const GOOGLE_CLIENT_SECRET = (process.env.GOOGLE_CLIENT_SECRET || '').trim()

export interface CalendarCredentials {
  access_token: string
  refresh_token: string | null
  expires_at: string
  calendar_id: string
  google_email: string | null
}

let cachedAdmin: SupabaseClient | null = null
function admin(): SupabaseClient {
  if (cachedAdmin) return cachedAdmin
  cachedAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cachedAdmin
}

/**
 * Returns a valid access_token for the cliente, refreshing if expired.
 * Throws if no credentials or refresh fails.
 */
export async function getValidGoogleToken(clienteId: string): Promise<CalendarCredentials> {
  const { data: cred, error } = await admin()
    .from('bot_credentials')
    .select('access_token, refresh_token, expires_at, calendar_id, google_email')
    .eq('cliente_id', clienteId)
    .eq('provider', 'google_calendar')
    .single()

  if (error || !cred) {
    throw new Error('Cliente no tiene Google Calendar conectado')
  }

  const expiresAt = new Date(cred.expires_at).getTime()
  const expiringSoon = Date.now() > expiresAt - 60_000 // 1 min buffer

  if (!expiringSoon) {
    return cred as CalendarCredentials
  }

  if (!cred.refresh_token) {
    throw new Error('Token expirado y sin refresh_token. Reconecta Calendar.')
  }

  // Refresh
  const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: cred.refresh_token,
      grant_type: 'refresh_token',
    }),
  })

  if (!refreshRes.ok) {
    const detail = await refreshRes.text().catch(() => '')
    throw new Error(`Refresh fallo: ${detail.slice(0, 200)}`)
  }

  const tokens = (await refreshRes.json()) as {
    access_token: string
    expires_in: number
    refresh_token?: string
    scope?: string
  }

  const newExpiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

  await admin()
    .from('bot_credentials')
    .update({
      access_token: tokens.access_token,
      expires_at: newExpiresAt,
      // Google may issue a new refresh_token; keep old if not
      ...(tokens.refresh_token ? { refresh_token: tokens.refresh_token } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('cliente_id', clienteId)
    .eq('provider', 'google_calendar')

  return {
    ...cred,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token || cred.refresh_token,
    expires_at: newExpiresAt,
  } as CalendarCredentials
}

const CAL_BASE = 'https://www.googleapis.com/calendar/v3'

interface GoogleCalEvent {
  id?: string
  summary?: string
  description?: string
  start?: { dateTime?: string; date?: string; timeZone?: string }
  end?: { dateTime?: string; date?: string; timeZone?: string }
  attendees?: Array<{ email: string }>
  conferenceData?: unknown
  status?: string
  hangoutLink?: string
  htmlLink?: string
}

export async function calendarCreate(
  clienteId: string,
  event: GoogleCalEvent,
  opts?: { sendUpdates?: 'all' | 'externalOnly' | 'none'; conferenceDataVersion?: 0 | 1 }
): Promise<GoogleCalEvent> {
  const cred = await getValidGoogleToken(clienteId)
  const url = new URL(`${CAL_BASE}/calendars/${encodeURIComponent(cred.calendar_id)}/events`)
  if (opts?.sendUpdates) url.searchParams.set('sendUpdates', opts.sendUpdates)
  if (opts?.conferenceDataVersion !== undefined)
    url.searchParams.set('conferenceDataVersion', String(opts.conferenceDataVersion))

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cred.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Calendar create failed (${res.status}): ${detail.slice(0, 300)}`)
  }
  return (await res.json()) as GoogleCalEvent
}

export async function calendarUpdate(
  clienteId: string,
  eventId: string,
  patch: Partial<GoogleCalEvent>,
  opts?: { sendUpdates?: 'all' | 'externalOnly' | 'none' }
): Promise<GoogleCalEvent> {
  const cred = await getValidGoogleToken(clienteId)
  const url = new URL(
    `${CAL_BASE}/calendars/${encodeURIComponent(cred.calendar_id)}/events/${encodeURIComponent(eventId)}`
  )
  if (opts?.sendUpdates) url.searchParams.set('sendUpdates', opts.sendUpdates)

  const res = await fetch(url.toString(), {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${cred.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patch),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Calendar update failed (${res.status}): ${detail.slice(0, 300)}`)
  }
  return (await res.json()) as GoogleCalEvent
}

export async function calendarDelete(
  clienteId: string,
  eventId: string,
  opts?: { sendUpdates?: 'all' | 'externalOnly' | 'none' }
): Promise<{ ok: true }> {
  const cred = await getValidGoogleToken(clienteId)
  const url = new URL(
    `${CAL_BASE}/calendars/${encodeURIComponent(cred.calendar_id)}/events/${encodeURIComponent(eventId)}`
  )
  if (opts?.sendUpdates) url.searchParams.set('sendUpdates', opts.sendUpdates)

  const res = await fetch(url.toString(), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${cred.access_token}` },
  })
  if (!res.ok && res.status !== 410) {
    // 410 Gone = already deleted, treat as success
    const detail = await res.text().catch(() => '')
    throw new Error(`Calendar delete failed (${res.status}): ${detail.slice(0, 300)}`)
  }
  return { ok: true }
}

export async function calendarSearch(
  clienteId: string,
  params: {
    q?: string
    time_min?: string // ISO
    time_max?: string // ISO
    max_results?: number
    single_events?: boolean
  }
): Promise<{ items: GoogleCalEvent[] }> {
  const cred = await getValidGoogleToken(clienteId)
  const url = new URL(`${CAL_BASE}/calendars/${encodeURIComponent(cred.calendar_id)}/events`)
  if (params.q) url.searchParams.set('q', params.q)
  if (params.time_min) url.searchParams.set('timeMin', params.time_min)
  if (params.time_max) url.searchParams.set('timeMax', params.time_max)
  if (params.max_results) url.searchParams.set('maxResults', String(params.max_results))
  if (params.single_events) url.searchParams.set('singleEvents', 'true')
  url.searchParams.set('orderBy', 'startTime')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${cred.access_token}` },
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Calendar search failed (${res.status}): ${detail.slice(0, 300)}`)
  }
  const data = (await res.json()) as { items?: GoogleCalEvent[] }
  return { items: data.items || [] }
}

export async function calendarGet(
  clienteId: string,
  eventId: string
): Promise<GoogleCalEvent> {
  const cred = await getValidGoogleToken(clienteId)
  const url = `${CAL_BASE}/calendars/${encodeURIComponent(cred.calendar_id)}/events/${encodeURIComponent(eventId)}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${cred.access_token}` },
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Calendar get failed (${res.status}): ${detail.slice(0, 300)}`)
  }
  return (await res.json()) as GoogleCalEvent
}
