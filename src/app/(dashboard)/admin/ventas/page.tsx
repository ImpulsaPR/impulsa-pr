'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ShieldCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  CreditCard,
  AlertTriangle,
  UserPlus,
  X,
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
  const [onboardingPurchase, setOnboardingPurchase] = useState<Purchase | null>(null)

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
                    onClick={() => setOnboardingPurchase(p)}
                    disabled={marking === p.id}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 disabled:opacity-50"
                  >
                    <UserPlus className="size-4" />
                    Onboardear ahora
                  </button>
                  <button
                    onClick={() => markAs(p.id, 'onboarded')}
                    disabled={marking === p.id}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-foreground/5 text-muted text-sm font-medium hover:text-foreground disabled:opacity-50"
                    title="Marcar como onboardeado sin crear cuenta (si ya lo creaste manualmente)"
                  >
                    {marking === p.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    Marcar manual
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

      {onboardingPurchase && (
        <OnboardFromPurchaseModal
          purchase={onboardingPurchase}
          onClose={() => setOnboardingPurchase(null)}
          onSuccess={() => {
            setOnboardingPurchase(null)
            toast('Cliente onboardeado y compra marcada', 'success')
            refresh()
          }}
        />
      )}
    </div>
  )
}

// ============================================================
// Modal: onboard pre-llenado desde stripe_purchase
// ============================================================

interface NichoOption {
  nicho_id: string
  nombre_display: string
}

interface PrefillForm {
  empresa: string
  nicho: string
  numero_whatsapp_bot: string
  numero_dueno: string
  email_dueno: string
  nombre_agente: string
}

const PHONE_RE = /^\+\d{10,15}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const inputCls =
  'w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-foreground/40 transition-colors'

function OnboardFromPurchaseModal({
  purchase,
  onClose,
  onSuccess,
}: {
  purchase: Purchase
  onClose: () => void
  onSuccess: () => void
}) {
  const [nichos, setNichos] = useState<NichoOption[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [form, setForm] = useState<PrefillForm>({
    empresa: '',
    nicho: '',
    numero_whatsapp_bot: '+1',
    numero_dueno: '+1',
    email_dueno: '',
    nombre_agente: 'Asistente',
  })

  useEffect(() => {
    fetch('/api/admin/list-nichos', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => setNichos(j.nichos || []))
      .catch(() => setNichos([]))
  }, [])

  const update = <K extends keyof PrefillForm>(k: K, v: PrefillForm[K]) => {
    setForm((s) => ({ ...s, [k]: v }))
    setErrMsg(null)
  }

  const validate = (): string | null => {
    if (!form.empresa.trim()) return 'Empresa requerida'
    if (!form.nicho.trim()) return 'Selecciona un nicho'
    if (!PHONE_RE.test(form.numero_whatsapp_bot.trim())) {
      return 'Número WhatsApp del bot inválido (formato +1XXXXXXXXXX)'
    }
    if (!PHONE_RE.test(form.numero_dueno.trim())) {
      return 'Número del dueño inválido (formato +1XXXXXXXXXX)'
    }
    if (form.email_dueno.trim() && !EMAIL_RE.test(form.email_dueno.trim())) {
      return 'Email del dueño inválido'
    }
    return null
  }

  const submit = async () => {
    const err = validate()
    if (err) {
      setErrMsg(err)
      return
    }
    setSubmitting(true)
    setErrMsg(null)

    try {
      // 1) Crear cliente + bot
      const onboardRes = await fetch('/api/admin/onboard-cliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: purchase.email,
          nombre: purchase.customer_name || purchase.email.split('@')[0],
          empresa: form.empresa.trim(),
          nicho: form.nicho,
          numero_whatsapp_bot: form.numero_whatsapp_bot.trim(),
          numero_dueno: form.numero_dueno.trim(),
          email_dueno: form.email_dueno.trim() || undefined,
          nombre_agente: form.nombre_agente.trim() || 'Asistente',
        }),
      })
      const onboardJson = await onboardRes.json()
      if (!onboardRes.ok) {
        setErrMsg(onboardJson.error || 'Error al crear cliente')
        return
      }

      // 2) Marcar purchase como onboardeado y ligar cliente_id
      const markRes = await fetch('/api/admin/mark-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: purchase.id,
          status: 'onboarded',
          cliente_id: onboardJson.cliente_id,
        }),
      })
      if (!markRes.ok) {
        const j = await markRes.json().catch(() => ({}))
        setErrMsg(`Cliente creado pero falló marcar compra: ${j.error || 'error'}`)
        return
      }

      onSuccess()
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose()
      }}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-xl flex flex-col"
        style={{ maxHeight: 'min(90vh, 720px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="font-semibold text-foreground">Onboardear cliente</h2>
            <p className="text-xs text-muted mt-0.5">
              Pre-llenado desde el checkout Stripe — completa los datos faltantes
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg hover:bg-foreground/5 text-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {/* Datos pre-llenados (readonly) */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-1.5 text-sm">
            <div className="flex items-center gap-2 text-xs text-primary font-medium mb-1">
              <CheckCircle2 className="size-3.5" />
              Datos del checkout Stripe
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted text-xs">Email:</span>
              <span className="text-foreground text-right break-all">{purchase.email}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted text-xs">Nombre:</span>
              <span className="text-foreground text-right">
                {purchase.customer_name || '—'}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted text-xs">Plan:</span>
              <span className="text-foreground text-right">
                {purchase.plan_slug || '—'}
                {purchase.billing_interval && ` (${purchase.billing_interval})`}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted text-xs">Monto:</span>
              <span className="text-foreground text-right">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: (purchase.currency || 'usd').toUpperCase(),
                  minimumFractionDigits: 0,
                }).format(purchase.amount_total_cents / 100)}
              </span>
            </div>
          </div>

          {/* Campos a completar */}
          <label className="block">
            <span className="text-xs font-medium text-foreground block mb-1.5">
              Empresa *
            </span>
            <input
              type="text"
              className={inputCls}
              value={form.empresa}
              onChange={(e) => update('empresa', e.target.value)}
              placeholder="Mi Barbería LLC"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-foreground block mb-1.5">Nicho *</span>
            <select
              className={inputCls}
              value={form.nicho}
              onChange={(e) => update('nicho', e.target.value)}
            >
              <option value="">Selecciona...</option>
              {nichos.map((n) => (
                <option key={n.nicho_id} value={n.nicho_id}>
                  {n.nombre_display}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-foreground block mb-1.5">
              Número WhatsApp del bot *
            </span>
            <input
              type="tel"
              className={inputCls}
              value={form.numero_whatsapp_bot}
              onChange={(e) => update('numero_whatsapp_bot', e.target.value)}
              placeholder="+17875551234"
            />
            <span className="text-[11px] text-muted mt-1 block">
              El número WhatsApp Business del cliente, donde correrá Quasar
            </span>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-foreground block mb-1.5">
              Número del dueño *
            </span>
            <input
              type="tel"
              className={inputCls}
              value={form.numero_dueno}
              onChange={(e) => update('numero_dueno', e.target.value)}
              placeholder="+17875551234"
            />
            <span className="text-[11px] text-muted mt-1 block">
              Teléfono personal del dueño, para escalamientos del bot
            </span>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-foreground block mb-1.5">
              Email del dueño (opcional)
            </span>
            <input
              type="email"
              className={inputCls}
              value={form.email_dueno}
              onChange={(e) => update('email_dueno', e.target.value)}
              placeholder="dueño@empresa.com"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-foreground block mb-1.5">
              Nombre del agente (bot)
            </span>
            <input
              type="text"
              className={inputCls}
              value={form.nombre_agente}
              onChange={(e) => update('nombre_agente', e.target.value)}
              placeholder="Quasar"
            />
          </label>

          {errMsg && (
            <div className="mt-3 p-3 rounded-xl border border-accent-red/30 bg-accent-red/10 text-accent-red text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errMsg}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-border gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-3 py-2 rounded-xl text-sm text-muted hover:text-foreground hover:bg-foreground/5 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background hover:opacity-90 text-sm font-medium disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Crear cuenta y onboardear
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
