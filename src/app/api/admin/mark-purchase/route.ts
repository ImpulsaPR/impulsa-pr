import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ADMIN_EMAILS = new Set(
  (process.env.SUPERADMIN_EMAIL || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
)

const VALID_STATUS = new Set(['pending_onboarding', 'onboarded', 'skipped'])

export async function POST(req: Request) {
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (!ADMIN_EMAILS.has((user.email || '').toLowerCase())) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  let body: { id?: string; status?: string; cliente_id?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'json invalido' }, { status: 400 })
  }

  const id = (body.id || '').trim()
  const status = (body.status || '').trim()
  const cliente_id = body.cliente_id?.trim() || null

  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
  if (!VALID_STATUS.has(status)) {
    return NextResponse.json({ error: 'status invalido' }, { status: 400 })
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const update: Record<string, unknown> = { status }
  if (status === 'onboarded') {
    update.onboarded_at = new Date().toISOString()
    if (cliente_id) update.cliente_id = cliente_id
  }

  const { error } = await admin.from('stripe_purchases').update(update).eq('id', id)
  if (error) {
    console.error('[mark-purchase] db', error)
    return NextResponse.json({ error: 'db' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
