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
const YCLOUD_API_KEY = process.env.YCLOUD_API_KEY || ''
const NOTIFY_OWNER_PHONE = process.env.NOTIFY_OWNER_PHONE || ''
const YCLOUD_FROM_NUMBER = process.env.YCLOUD_FROM_NUMBER || '+19399052410'
const ADMIN_VENTAS_URL = 'https://cliente.impulsapr.com/admin/ventas'
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

// Notifica al dueño por WhatsApp via YCloud (fire-and-forget).
// Si falta YCLOUD_API_KEY o NOTIFY_OWNER_PHONE, simplemente no manda nada y loguea.
function notifyOwner(opts: {
  email: string
  customerName: string | null
  planLabel: string
  intervalSuffix: string
  amountUsd: string
  currency: string
}): void {
  if (!YCLOUD_API_KEY || !NOTIFY_OWNER_PHONE) {
    console.warn('[stripe/webhook] notif skip — YCLOUD_API_KEY o NOTIFY_OWNER_PHONE no configurado')
    return
  }
  const cliente = opts.customerName?.trim() || opts.email
  const body =
    `Nuevo pago Impulsa PR\n\n` +
    `Cliente: ${cliente}\n` +
    `Email: ${opts.email}\n` +
    `Plan: ${opts.planLabel}${opts.intervalSuffix}\n` +
    `Monto: $${opts.amountUsd} ${opts.currency.toUpperCase()}\n\n` +
    `Onboardealo aqui:\n${ADMIN_VENTAS_URL}`

  fetch('https://api.ycloud.com/v2/whatsapp/messages', {
    method: 'POST',
    headers: { 'X-API-Key': YCLOUD_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: YCLOUD_FROM_NUMBER,
      to: NOTIFY_OWNER_PHONE,
      type: 'text',
      text: { body },
    }),
  })
    .then(async (r) => {
      if (!r.ok) {
        console.error('[stripe/webhook] notif YCloud HTTP', r.status, await r.text().catch(() => ''))
      }
    })
    .catch((e) => console.error('[stripe/webhook] notif YCloud throw', e))
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

  // Notificar al dueño (best-effort, fire-and-forget — no bloquea response a Stripe)
  notifyOwner({
    email,
    customerName: session.customer_details?.name || null,
    planLabel: plan?.name || 'Plan',
    intervalSuffix:
      billingInterval === 'month' ? '/mes' : billingInterval === 'year' ? '/año' : ' (one-time)',
    amountUsd: ((session.amount_total ?? 0) / 100).toFixed(2),
    currency: session.currency || 'usd',
  })

  return NextResponse.json({ received: true })
}
