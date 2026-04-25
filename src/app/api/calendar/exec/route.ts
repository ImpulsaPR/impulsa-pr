import { NextResponse } from 'next/server'
import {
  calendarCreate,
  calendarUpdate,
  calendarDelete,
  calendarSearch,
  calendarGet,
} from '@/lib/google-calendar'

export const runtime = 'nodejs'

const PROXY_TOKEN = (process.env.CALENDAR_PROXY_TOKEN || '').trim()

interface ExecBody {
  cliente_id: string
  operation: 'create' | 'update' | 'delete' | 'search' | 'get'
  // Operation-specific:
  event?: Record<string, unknown>
  event_id?: string
  patch?: Record<string, unknown>
  q?: string
  time_min?: string
  time_max?: string
  max_results?: number
  single_events?: boolean
  send_updates?: 'all' | 'externalOnly' | 'none'
}

export async function POST(req: Request) {
  // Auth via shared secret token (n8n includes header)
  const token = req.headers.get('x-proxy-token') || ''
  if (!PROXY_TOKEN || token !== PROXY_TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: ExecBody
  try {
    body = (await req.json()) as ExecBody
  } catch {
    return NextResponse.json({ error: 'json invalido' }, { status: 400 })
  }

  if (!body.cliente_id || !body.operation) {
    return NextResponse.json({ error: 'cliente_id y operation requeridos' }, { status: 400 })
  }

  try {
    switch (body.operation) {
      // For create/update/get/search, return data shaped EXACTLY like Google
      // Calendar API would, so n8n downstream nodes that previously consumed
      // the GoogleCal node response continue to work without changes.
      case 'create': {
        if (!body.event) return NextResponse.json({ error: 'event requerido' }, { status: 400 })
        const result = await calendarCreate(body.cliente_id, body.event, {
          sendUpdates: body.send_updates,
          conferenceDataVersion: body.event.conferenceData ? 1 : 0,
        })
        return NextResponse.json(result)
      }

      case 'update': {
        if (!body.event_id || !body.patch)
          return NextResponse.json({ error: 'event_id y patch requeridos' }, { status: 400 })
        const result = await calendarUpdate(body.cliente_id, body.event_id, body.patch, {
          sendUpdates: body.send_updates,
        })
        return NextResponse.json(result)
      }

      case 'delete': {
        if (!body.event_id)
          return NextResponse.json({ error: 'event_id requerido' }, { status: 400 })
        await calendarDelete(body.cliente_id, body.event_id, {
          sendUpdates: body.send_updates,
        })
        return NextResponse.json({})
      }

      case 'get': {
        if (!body.event_id)
          return NextResponse.json({ error: 'event_id requerido' }, { status: 400 })
        const result = await calendarGet(body.cliente_id, body.event_id)
        return NextResponse.json(result)
      }

      case 'search': {
        const result = await calendarSearch(body.cliente_id, {
          q: body.q,
          time_min: body.time_min,
          time_max: body.time_max,
          max_results: body.max_results,
          single_events: body.single_events,
        })
        // Return array directly so the splitter Code node in n8n works
        return NextResponse.json(result.items)
      }

      default:
        return NextResponse.json({ error: 'operation no soportada' }, { status: 400 })
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error desconocido'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
