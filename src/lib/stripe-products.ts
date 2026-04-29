/**
 * Stripe product/price IDs por plan.
 * LIVE mode (regenerado 2026-04-25).
 */

export interface PlanConfig {
  slug: 'starter' | 'pro' | 'business' | 'founder' | 'setup'
  name: string
  description: string
  productId: string
  monthlyPriceId: string
  annualPriceId: string | null
  monthlyAmount: number // en USD
  annualAmount: number | null // total anual en USD
  conversationsLimit: number | null
  oneTime?: boolean
}

export const STRIPE_PLANS: Record<string, PlanConfig> = {
  starter: {
    slug: 'starter',
    name: 'Plan Starter',
    description: 'Hasta 500 conversaciones/mes — 1 agente, Calendar, KB hasta 50, Setup incluido',
    productId: 'prod_UP4xxLwfuvD1lx',
    monthlyPriceId: 'price_1TQGnX02u0Lqf3NoQdIhbMox',
    annualPriceId: 'price_1TQGnX02u0Lqf3NoVySxoXzS',
    monthlyAmount: 297,
    annualAmount: 2844,
    conversationsLimit: 500,
  },
  pro: {
    slug: 'pro',
    name: 'Plan Pro',
    description: 'Hasta 2,000 conversaciones/mes — KB ilimitada, multi-usuario, prioridad de soporte',
    productId: 'prod_UP4xE5ZoXuQPIA',
    monthlyPriceId: 'price_1TQGnY02u0Lqf3NohetGK6rd',
    annualPriceId: 'price_1TQGnY02u0Lqf3NoL2FuiRWj',
    monthlyAmount: 597,
    annualAmount: 5724,
    conversationsLimit: 2000,
  },
  business: {
    slug: 'business',
    name: 'Plan Business',
    description: 'Hasta 5,000 conversaciones/mes — 2 bots, API access, SLA, soporte prioritario',
    productId: 'prod_UP4xXJPon7v7Vw',
    monthlyPriceId: 'price_1TQGnY02u0Lqf3NogGaNwSJk',
    annualPriceId: 'price_1TQGnY02u0Lqf3NoTy6cVsKH',
    monthlyAmount: 1197,
    annualAmount: 11484,
    conversationsLimit: 5000,
  },
  founder: {
    slug: 'founder',
    name: 'Cliente Fundador',
    description: 'Plan Pro completo a $97/mes — primeros clientes con compromiso 6 meses + testimonio',
    productId: 'prod_UP4x5qcXkDCyRM',
    monthlyPriceId: 'price_1TQGnZ02u0Lqf3NoWoHcPKUI',
    annualPriceId: null,
    monthlyAmount: 97,
    annualAmount: null,
    conversationsLimit: 2000, // recibe lo del Pro
  },
  setup: {
    slug: 'setup',
    name: 'Setup Fee',
    description: 'Configuración inicial one-time — onboarding, conexión WhatsApp, training del bot',
    productId: 'prod_UP4x5nRRqSQ6PR',
    monthlyPriceId: 'price_1TQGnZ02u0Lqf3NojGN4Ly9v', // technically "oneTimePriceId"
    annualPriceId: null,
    monthlyAmount: 497,
    annualAmount: null,
    conversationsLimit: null,
    oneTime: true,
  },
}

export type PlanSlug = keyof typeof STRIPE_PLANS

export function getPlanByPriceId(priceId: string): PlanConfig | null {
  for (const plan of Object.values(STRIPE_PLANS)) {
    if (plan.monthlyPriceId === priceId || plan.annualPriceId === priceId) {
      return plan
    }
  }
  return null
}
