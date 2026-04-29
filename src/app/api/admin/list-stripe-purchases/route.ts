import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ADMIN_EMAILS = new Set(
  (process.env.SUPERADMIN_EMAIL || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
)

export async function GET(req: Request) {
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (!ADMIN_EMAILS.has((user.email || '').toLowerCase())) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const url = new URL(req.url)
  const status = url.searchParams.get('status') // 'pending_onboarding' | 'onboarded' | null=todos
  const limit = Math.min(Number(url.searchParams.get('limit') || 50), 200)

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  let q = admin
    .from('stripe_purchases')
    .select(
      'id, email, customer_name, amount_total_cents, currency, plan_slug, billing_interval, mode, status, stripe_session_id, stripe_customer_id, stripe_subscription_id, cliente_id, created_at, onboarded_at'
    )
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) q = q.eq('status', status)

  const { data, error } = await q
  if (error) {
    console.error('[list-stripe-purchases] db', error)
    return NextResponse.json({ error: 'db' }, { status: 500 })
  }

  return NextResponse.json({ purchases: data || [] })
}
