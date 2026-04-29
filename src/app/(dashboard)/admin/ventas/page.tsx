'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  ShieldCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  CreditCard,
  AlertTriangle,
} from 'lucide-react'
import { useAdmin } from '@/hooks/use-admin'
import { useToast } from '@/components/ui/toast'

interface Purchase {
  id: string
  email: string
  customer_name: string | null
  amount_total_cents: number
  currency: string
  plan_slug: string | null
  billing_interval: string | null
  mode: string
  status: 'pending_onboarding' | 'onboarded' | 'skipped'
  stripe_session_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  cliente_id: string | null
  created_at: string
  onboarded_at: string | null
}

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: 'pending_onboarding', label: 'Pendientes' },
  { value: 'onboarded', label: 'Onboardeados' },
  { value: 'skipped', label: 'Omitidos' },
  { value: '', label: 'Todos' },
]

function fmtMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: (currency || 'usd').toUpperCase(),
    minimumFractionDigits: 0,
  }).format(cents / 100)
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('es-PR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso.slice(0, 16)
  }
}

function CopyBtn({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      }}
      className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground transition"
      title={`Copiar ${label || 'valor'}`}
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {label}
    </button>
  )
}

export default function AdminVentasPage() {
  const { isSuperAdmin, loading: adminLoading } = useAdmin()
  const { toast } = useToast()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('pending_onboarding')
  const [marking, setMarking] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const url = statusFilter
        ? `/api/admin/list-stripe-purchases?status=${statusFilter}`
        : '/api/admin/list-stripe-purchases'
      const res = await fetch(url, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'fallo cargando')
      setPurchases(json.purchases || [])
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, toast])

  useEffect(() => {
    if (isSuperAdmin) refresh()
  }, [isSuperAdmin, refresh])

  const markAs = async (id: string, status: 'onboarded' | 'skipped') => {
    setMarking(id)
    try {
      const res = await fetch('/api/admin/mark-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || 'fallo')
      }
      toast(`Marcado como ${status}`, 'success')
      refresh()
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setMarking(null)
    }
  }

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted" />
      </div>
    )
  }

  if (!isSuperAdmin) {
    return (
      <div className="max-w-md mx-auto py-24 text-center">
        <ShieldCheck className="size-12 mx-auto text-muted mb-4" />
        <h1 className="text-xl font-semibold">Solo super-admin</h1>
        <p className="text-sm text-muted mt-2">No tienes permisos para ver esta página.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center gap-3 mb-2">
        <CreditCard className="size-7 text-foreground" />
        <h1 className="text-2xl md:text-3xl font-heading font-bold">Ventas Stripe</h1>
      </div>
      <p className="text-sm text-muted mb-6">
        Compras recibidas desde el sitio web. Cuando aparezcan pendientes, completa el onboarding
        manual desde{' '}
        <a href="/admin/clientes" className="underline hover:text-foreground">
          /admin/clientes
        </a>{' '}
        usando el email del cliente, luego marca como onboardeado.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              statusFilter === f.value
                ? 'bg-foreground text-background'
                : 'bg-foreground/5 text-muted hover:text-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={refresh}
          className="ml-auto px-3 py-1.5 rounded-lg text-sm font-medium bg-foreground/5 text-muted hover:text-foreground"
        >
          Actualizar
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted" />
        </div>
      ) : purchases.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border/50 rounded-2xl">
          <CreditCard className="size-10 mx-auto text-muted/50 mb-3" />
          <p className="text-muted">No hay compras en este filtro.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {purchases.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-border/50 bg-card p-5 flex flex-col md:flex-row md:items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold truncate">{p.email}</p>
                  {p.customer_name && (
                    <span className="text-sm text-muted">— {p.customer_name}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                  <span className="font-medium text-foreground">
                    {fmtMoney(p.amount_total_cents, p.currency)}
                  </span>
                  <span>
                    {p.plan_slug || '?'}{' '}
                    {p.billing_interval && (
                      <span className="text-xs">({p.billing_interval})</span>
                    )}
                  </span>
                  <span>{fmtDate(p.created_at)}</span>
                </div>
                <div className="flex flex-wrap gap-3 mt-2">
                  {p.stripe_customer_id && (
                    <CopyBtn text={p.stripe_customer_id} label={p.stripe_customer_id} />
                  )}
                  {p.stripe_subscription_id && (
                    <CopyBtn text={p.stripe_subscription_id} label={p.stripe_subscription_id} />
                  )}
                </div>
              </div>

              {p.status === 'pending_onboarding' ? (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => markAs(p.id, 'onboarded')}
                    disabled={marking === p.id}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 disabled:opacity-50"
                  >
                    {marking === p.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    Marcar onboardeado
                  </button>
                  <button
                    onClick={() => markAs(p.id, 'skipped')}
                    disabled={marking === p.id}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-foreground/5 text-muted text-sm font-medium hover:text-foreground disabled:opacity-50"
                  >
                    <XCircle className="size-4" />
                    Omitir
                  </button>
                </div>
              ) : (
                <div className="flex-shrink-0 text-sm">
                  {p.status === 'onboarded' ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-4" />
                      Onboardeado {p.onboarded_at && `· ${fmtDate(p.onboarded_at)}`}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-muted">
                      <AlertTriangle className="size-4" />
                      Omitido
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
