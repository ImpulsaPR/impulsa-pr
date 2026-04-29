import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'
import { getPlanByPriceId } from '@/lib/stripe-products'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ''
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ''
const SIGNATURE_TOLERANCE_S = 300 // 5 min

// Verifica la firma del header Stripe-Signature usando crypto puro.
// Formato: t=<timestamp>,v1=<sig1>,v1=<sig2>,...
function verifyStripeSignature(payload: string, header: string, secret: string): boolean {
  if (!header || !secret) return false
  const parts = header.split(',').reduce<Record<string, string[]>>((acc, kv) => {
    const [k, v] = kv.split('=')
    if (!k || !v) return acc
    acc[k] = acc[k] || []
    acc[k].push(v)
    return acc
  }, {})
  const ts = parts.t?.[0]
  const sigs = parts.v1 || []
  if (!ts || sigs.length === 0) return false

  const tsNum = Number(ts)
  if (!Number.isFinite(tsNum)) return false
  const ageS = Math.abs(Date.now() / 1000 - tsNum)
  if (ageS > SIGNATURE_TOLERANCE_S) return false

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${ts}.${payload}`, 'utf8')
    .digest('hex')
  const expectedBuf = Buffer.from(expected, 'hex')
  return sigs.some((s) => {
    try {
      const buf = Buffer.from(s, 'hex')
      return buf.length === expectedBuf.length && crypto.timingSafeEqual(buf, expectedBuf)
    } catch {
      return false
    }
  })
}

// Llama al API Stripe para expandir line_items (no vienen en el evento).
async function fetchStripe(path: string): Promise<Record<string, unknown> | null> {
  if (!STRIPE_SECRET_KEY) return null
  try {
    const r = await fetch(`https://api.stripe.com/v1/${path}`, {
      headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
    })
    if (!r.ok) return null
    return (await r.json()) as Record<string, unknown>
  } catch {
    return null
  }
}

interface StripeSession {
  id: string
  customer?: string | null
  customer_email?: string | null
  customer_details?: { email?: string | null; name?: string | null } | null
  subscription?: string | null
  amount_total?: number | null
  currency?: string | null
  mode?: string | null
}

interface StripeLineItem {
  price?: { id?: string; product?: string; recurring?: { interval?: string } | null } | null
}

export async function POST(req: Request) {
  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('[stripe/webhook] STRIPE_WEBHOOK_SECRET no configurado')
    return NextResponse.json({ error: 'config' }, { status: 500 })
  }
  if (!SUPABASE_SERVICE_KEY || !SUPABASE_URL) {
    console.error('[stripe/webhook] supabase no configurado')
    return NextResponse.json({ error: 'config' }, { status: 500 })
  }

  const sigHeader = req.headers.get('stripe-signature') || ''
  const payload = await req.text()

  if (!verifyStripeSignature(payload, sigHeader, STRIPE_WEBHOOK_SECRET)) {
    console.warn('[stripe/webhook] firma invalida')
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
  }

  let event: { id: string; type: string; data: { object: unknown } }
  try {
    event = JSON.parse(payload)
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  // Solo procesamos checkout.session.completed por ahora.
  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true, ignored: event.type })
  }

  const session = event.data.object as StripeSession
  const email =
    session.customer_details?.email?.toLowerCase() ||
    session.customer_email?.toLowerCase() ||
    null

  if (!email) {
    console.warn('[stripe/webhook] session sin email', session.id)
    return NextResponse.json({ received: true, warning: 'no email' })
  }

  // Expandir line_items para extraer price_id (no viene en checkout.session.completed por defecto)
  const lineItemsResp = await fetchStripe(`checkout/sessions/${session.id}/line_items?limit=10`)
  const lineItems = (lineItemsResp?.data as StripeLineItem[] | undefined) || []
  const firstItem = lineItems[0]
  const priceId = firstItem?.price?.id || null
  const productId = firstItem?.price?.product || null
  const interval = firstItem?.price?.recurring?.interval || null

  const plan = priceId ? getPlanByPriceId(priceId) : null
  const planSlug = plan?.slug || null
  const billingInterval = interval ? interval : session.mode === 'payment' ? 'one_time' : null

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { error: insertErr } = await admin.from('stripe_purchases').insert({
    stripe_event_id: event.id,
    stripe_session_id: session.id,
    stripe_customer_id: session.customer || null,
    stripe_subscription_id: session.subscription || null,
    email,
    customer_name: session.customer_details?.name || null,
    amount_total_cents: session.amount_total ?? 0,
    currency: session.currency || 'usd',
    price_id: priceId,
    product_id: typeof productId === 'string' ? productId : null,
    plan_slug: planSlug,
    billing_interval: billingInterval,
    mode: session.mode || 'subscription',
    status: 'pending_onboarding',
    raw_event: event,
  })

  if (insertErr) {
    // 23505 = unique_violation en stripe_event_id → idempotencia, ya lo procesamos antes.
    if (insertErr.code === '23505') {
      return NextResponse.json({ received: true, duplicate: true })
    }
    console.error('[stripe/webhook] insert fallo', insertErr)
    return NextResponse.json({ error: 'db' }, { status: 500 })
  }

  console.log('[stripe/webhook] purchase registrado', { email, planSlug, session: session.id })
  return NextResponse.json({ received: true })
}
