/**
 * Stripe product/price IDs por plan.
 *
 * IMPORTANTE: estos IDs son de TEST MODE. Cuando vayamos a producción,
 * crear los productos en live mode y reemplazar abajo (o usar
 * NEXT_PUBLIC_STRIPE_MODE para alternar test/live).
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
    description: 'Hasta 500 conversaciones/mes, 1 agente, Calendar, KB hasta 50',
    productId: 'prod_UP4V2WuCfkA2r7',
    monthlyPriceId: 'price_1TQGMF12imLAToUqnjrGK3zo',
    annualPriceId: 'price_1TQGMF12imLAToUqC5s4bugv',
    monthlyAmount: 297,
    annualAmount: 2844,
    conversationsLimit: 500,
  },
  pro: {
    slug: 'pro',
    name: 'Plan Pro',
    description: 'Hasta 2,000 conversaciones/mes, KB ilimitada, multi-usuario',
    productId: 'prod_UP4VNoHOKZpbxO',
    monthlyPriceId: 'price_1TQGMF12imLAToUqJpfCFDY9',
    annualPriceId: 'price_1TQGMF12imLAToUqTIqA3riE',
    monthlyAmount: 597,
    annualAmount: 5724,
    conversationsLimit: 2000,
  },
  business: {
    slug: 'business',
    name: 'Plan Business',
    description: 'Hasta 5,000 conversaciones/mes, 2 bots, API access, SLA',
    productId: 'prod_UP4Vs13Kf9i7DU',
    monthlyPriceId: 'price_1TQGMG12imLAToUqwR4XErnd',
    annualPriceId: 'price_1TQGMG12imLAToUqnw1cNrsO',
    monthlyAmount: 1197,
    annualAmount: 11484,
    conversationsLimit: 5000,
  },
  founder: {
    slug: 'founder',
    name: 'Cliente Fundador',
    description: 'Plan Pro completo a $97/mes — primeros clientes con compromiso 6 meses + testimonio',
    productId: 'prod_UP4Vs3NYkAme4u',
    monthlyPriceId: 'price_1TQGMG12imLAToUqQhUZBf1t',
    annualPriceId: null,
    monthlyAmount: 97,
    annualAmount: null,
    conversationsLimit: 2000, // recibe lo del Pro
  },
  setup: {
    slug: 'setup',
    name: 'Setup Fee',
    description: 'Configuración inicial one-time',
    productId: 'prod_UP4VLwvjywTFDQ',
    monthlyPriceId: 'price_1TQGMH12imLAToUqsQ4X9nkc', // technically "oneTimePriceId"
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
