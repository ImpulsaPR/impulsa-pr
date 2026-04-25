'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ShieldCheck,
  Users,
  Plus,
  X,
  Loader2,
  Copy,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'
import { useAdmin } from '@/hooks/use-admin'
import { useToast } from '@/components/ui/toast'
import { useTranslation } from '@/lib/i18n'

interface ClienteRow {
  id: string
  email: string
  nombre: string | null
  empresa: string | null
  plan: string | null
  created_at: string | null
  bot: { id: string; activo: boolean | null; nicho: string | null } | null
}

interface NichoOption {
  nicho_id: string
  nombre_display: string
}

interface OnboardSuccess {
  cliente_id: string
  bot_id: string
  webhook_path: string
  webhook_url: string
  email: string
  empresa: string
  numero_whatsapp_bot: string
}

const PHONE_RE = /^\+\d{10,15}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('es-PR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return iso.slice(0, 10)
  }
}

export default function AdminClientesPage() {
  const { isSuperAdmin, loading: adminLoading } = useAdmin()
  const { t } = useTranslation()
  const { toast } = useToast()

  const [clientes, setClientes] = useState<ClienteRow[]>([])
  const [nichoMap, setNichoMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/admin/list-clientes', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) {
        setErrorMsg(json.error || 'error')
        setClientes([])
      } else {
        setClientes(json.clientes || [])
        setNichoMap(json.nichos || {})
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'error')
      setClientes([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!isSuperAdmin) return
    refresh()
  }, [isSuperAdmin, refresh])

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    )
  }

  if (!isSuperAdmin) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 rounded-2xl border border-border bg-card text-center">
        <ShieldCheck className="w-10 h-10 text-accent-orange mx-auto mb-3" />
        <h1 className="text-lg font-semibold text-foreground">
          {t('admin.unauthorized.title')}
        </h1>
        <p className="text-sm text-muted mt-1">{t('admin.unauthorized.desc')}</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {t('admin.clientes.title')}
            </h1>
            <p className="text-sm text-muted mt-0.5">{t('admin.clientes.subtitle')}</p>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          {t('admin.clientes.new')}
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl border border-accent-red/30 bg-accent-red/10 text-accent-red text-sm flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-foreground/[0.02]">
              <tr className="text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium">{t('admin.col.email')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.col.empresa')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.col.nicho')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.col.botActivo')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.col.creado')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted">
                    <Loader2 className="w-5 h-5 animate-spin inline-block" />
                  </td>
                </tr>
              ) : clientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted text-sm">
                    {t('admin.clientes.empty')}
                  </td>
                </tr>
              ) : (
                clientes.map((c) => {
                  const nichoId = c.bot?.nicho || ''
                  const nichoLabel = nichoMap[nichoId] || nichoId || '—'
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-border/50 last:border-b-0 hover:bg-foreground/[0.02]"
                    >
                      <td className="px-4 py-3 text-foreground">{c.email}</td>
                      <td className="px-4 py-3 text-foreground">{c.empresa || '—'}</td>
                      <td className="px-4 py-3 text-muted">{nichoLabel}</td>
                      <td className="px-4 py-3">
                        {c.bot ? (
                          c.bot.activo ? (
                            <span className="inline-flex items-center gap-1 text-primary text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {t('admin.bot.activo')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-muted text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-muted" />
                              {t('admin.bot.inactivo')}
                            </span>
                          )
                        ) : (
                          <span className="text-muted text-xs">{t('admin.bot.sinBot')}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted text-xs">{fmtDate(c.created_at)}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <OnboardModal
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            refresh()
            toast(t('admin.success.toast'), 'success')
          }}
        />
      )}
    </div>
  )
}

// ============================================================
// Modal con steps
// ============================================================

interface FormState {
  email: string
  nombre: string
  empresa: string
  nicho: string
  nombre_agente: string
  numero_whatsapp_bot: string
  numero_dueno: string
  email_dueno: string
}

const emptyForm: FormState = {
  email: '',
  nombre: '',
  empresa: '',
  nicho: '',
  nombre_agente: 'Asistente',
  numero_whatsapp_bot: '+1',
  numero_dueno: '+1',
  email_dueno: '',
}

function OnboardModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [nichos, setNichos] = useState<NichoOption[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<OnboardSuccess | null>(null)
  const [stepError, setStepError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/list-nichos', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => setNichos(j.nichos || []))
      .catch(() => setNichos([]))
  }, [])

  const update = useCallback(<K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((s) => ({ ...s, [k]: v }))
    setStepError(null)
  }, [])

  const validateStep1 = (): string | null => {
    if (!form.email.trim() || !EMAIL_RE.test(form.email.trim())) return t('admin.err.email')
    if (!form.nombre.trim()) return t('admin.err.nombre')
    if (!form.empresa.trim()) return t('admin.err.empresa')
    return null
  }

  const validateStep2 = (): string | null => {
    if (!form.nicho.trim()) return t('admin.err.nicho')
    if (!PHONE_RE.test(form.numero_whatsapp_bot.trim())) return t('admin.err.numWhatsapp')
    if (!PHONE_RE.test(form.numero_dueno.trim())) return t('admin.err.numDueno')
    if (form.email_dueno.trim() && !EMAIL_RE.test(form.email_dueno.trim())) {
      return t('admin.err.emailDueno')
    }
    return null
  }

  const next = () => {
    const err = step === 1 ? validateStep1() : step === 2 ? validateStep2() : null
    if (err) {
      setStepError(err)
      return
    }
    setStep((s) => (s === 3 ? s : ((s + 1) as 1 | 2 | 3)))
  }

  const submit = async () => {
    const err1 = validateStep1()
    const err2 = validateStep2()
    if (err1 || err2) {
      setStepError(err1 || err2)
      return
    }
    setSubmitting(true)
    setStepError(null)
    try {
      const res = await fetch('/api/admin/onboard-cliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          nombre: form.nombre.trim(),
          empresa: form.empresa.trim(),
          nicho: form.nicho,
          numero_whatsapp_bot: form.numero_whatsapp_bot.trim(),
          numero_dueno: form.numero_dueno.trim(),
          email_dueno: form.email_dueno.trim() || undefined,
          nombre_agente: form.nombre_agente.trim() || 'Asistente',
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setStepError(json.error || json.detail || 'error')
        toast(json.error || 'Error al crear cliente', 'error')
        return
      }
      setSuccess({
        cliente_id: json.cliente_id,
        bot_id: json.bot_id,
        webhook_path: json.webhook_path,
        webhook_url: json.webhook_url,
        email: form.email.trim(),
        empresa: form.empresa.trim(),
        numero_whatsapp_bot: form.numero_whatsapp_bot.trim(),
      })
      onSuccess()
    } catch (e) {
      setStepError(e instanceof Error ? e.message : 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose()
      }}
    >
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-xl my-4 flex flex-col"
          onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="font-semibold text-foreground">
              {success ? t('admin.success.title') : t('admin.create.title')}
            </h2>
            {!success && (
              <p className="text-xs text-muted mt-0.5">
                {t('admin.create.step')} {step} / 3
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg hover:bg-foreground/5 text-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {success ? (
            <SuccessView data={success} />
          ) : (
            <>
              <Stepper step={step} />
              {step === 1 && <Step1 form={form} update={update} />}
              {step === 2 && <Step2 form={form} update={update} nichos={nichos} />}
              {step === 3 && <Step3 form={form} nichos={nichos} />}
              {stepError && (
                <div className="mt-3 p-3 rounded-xl border border-accent-red/30 bg-accent-red/10 text-accent-red text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{stepError}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border gap-2">
          {success ? (
            <button
              onClick={onClose}
              className="ml-auto px-4 py-2 rounded-xl bg-foreground text-background hover:opacity-90 text-sm font-medium"
            >
              {t('admin.success.close')}
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  if (step === 1) onClose()
                  else setStep((s) => ((s - 1) as 1 | 2 | 3))
                }}
                disabled={submitting}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm text-muted hover:text-foreground hover:bg-foreground/5 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                {step === 1 ? t('admin.btn.cancel') : t('admin.btn.back')}
              </button>
              {step < 3 ? (
                <button
                  onClick={next}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-foreground text-background hover:opacity-90 text-sm font-medium"
                >
                  {t('admin.btn.next')}
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background hover:opacity-90 text-sm font-medium disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t('admin.btn.submit')}
                </button>
              )}
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const { t } = useTranslation()
  const labels: [string, string, string] = [
    t('admin.steps.identidad'),
    t('admin.steps.bot'),
    t('admin.steps.review'),
  ]
  return (
    <div className="flex items-center gap-2 mb-5">
      {labels.map((label, i) => {
        const idx = (i + 1) as 1 | 2 | 3
        const active = idx === step
        const done = idx < step
        return (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                done
                  ? 'bg-primary text-white'
                  : active
                    ? 'bg-foreground text-background'
                    : 'bg-foreground/5 text-muted'
              }`}
            >
              {done ? <Check className="w-3.5 h-3.5" /> : idx}
            </div>
            <span
              className={`text-xs hidden sm:inline ${
                active ? 'text-foreground font-medium' : 'text-muted'
              }`}
            >
              {label}
            </span>
            {i < 2 && <div className="flex-1 h-px bg-border" />}
          </div>
        )
      })}
    </div>
  )
}

function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-foreground block mb-1.5">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-muted mt-1 block">{hint}</span>}
    </label>
  )
}

const inputCls =
  'w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-foreground/40 transition-colors'

function Step1({
  form,
  update,
}: {
  form: FormState
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void
}) {
  const { t } = useTranslation()
  return (
    <div className="space-y-3">
      <Field label={t('admin.f.email')} hint={t('admin.f.emailHint')}>
        <input
          type="email"
          autoComplete="off"
          className={inputCls}
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="cliente@empresa.com"
        />
      </Field>
      <Field label={t('admin.f.nombre')}>
        <input
          type="text"
          className={inputCls}
          value={form.nombre}
          onChange={(e) => update('nombre', e.target.value)}
          placeholder="Juan Pérez"
        />
      </Field>
      <Field label={t('admin.f.empresa')}>
        <input
          type="text"
          className={inputCls}
          value={form.empresa}
          onChange={(e) => update('empresa', e.target.value)}
          placeholder="Mi Empresa LLC"
        />
      </Field>
    </div>
  )
}

function Step2({
  form,
  update,
  nichos,
}: {
  form: FormState
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void
  nichos: NichoOption[]
}) {
  const { t } = useTranslation()
  return (
    <div className="space-y-3">
      <Field label={t('admin.f.nicho')} hint={t('admin.f.nichoHint')}>
        <select
          className={inputCls}
          value={form.nicho}
          onChange={(e) => update('nicho', e.target.value)}
        >
          <option value="">{t('admin.f.nichoPlaceholder')}</option>
          {nichos.map((n) => (
            <option key={n.nicho_id} value={n.nicho_id}>
              {n.nombre_display}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t('admin.f.nombreAgente')} hint={t('admin.f.nombreAgenteHint')}>
        <input
          type="text"
          className={inputCls}
          value={form.nombre_agente}
          onChange={(e) => update('nombre_agente', e.target.value)}
          placeholder="Asistente"
        />
      </Field>
      <Field label={t('admin.f.numWhatsapp')} hint={t('admin.f.numWhatsappHint')}>
        <input
          type="tel"
          className={inputCls}
          value={form.numero_whatsapp_bot}
          onChange={(e) => update('numero_whatsapp_bot', e.target.value)}
          placeholder="+17875551234"
        />
      </Field>
      <Field label={t('admin.f.numDueno')} hint={t('admin.f.numDuenoHint')}>
        <input
          type="tel"
          className={inputCls}
          value={form.numero_dueno}
          onChange={(e) => update('numero_dueno', e.target.value)}
          placeholder="+17875551234"
        />
      </Field>
      <Field label={t('admin.f.emailDueno')} hint={t('admin.f.emailDuenoHint')}>
        <input
          type="email"
          className={inputCls}
          value={form.email_dueno}
          onChange={(e) => update('email_dueno', e.target.value)}
          placeholder="dueno@empresa.com"
        />
      </Field>
    </div>
  )
}

function Step3({ form, nichos }: { form: FormState; nichos: NichoOption[] }) {
  const { t } = useTranslation()
  const nichoLabel = useMemo(
    () => nichos.find((n) => n.nicho_id === form.nicho)?.nombre_display || form.nicho,
    [nichos, form.nicho]
  )
  const rows: Array<[string, string]> = [
    [t('admin.f.email'), form.email],
    [t('admin.f.nombre'), form.nombre],
    [t('admin.f.empresa'), form.empresa],
    [t('admin.f.nicho'), nichoLabel],
    [t('admin.f.nombreAgente'), form.nombre_agente || 'Asistente'],
    [t('admin.f.numWhatsapp'), form.numero_whatsapp_bot],
    [t('admin.f.numDueno'), form.numero_dueno],
    [t('admin.f.emailDueno'), form.email_dueno || '—'],
  ]
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">{t('admin.review.hint')}</p>
      <div className="rounded-xl border border-border bg-foreground/[0.02] divide-y divide-border">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-start justify-between gap-3 px-3 py-2.5 text-sm">
            <span className="text-muted text-xs flex-shrink-0">{k}</span>
            <span className="text-foreground text-right break-all">{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        })
      }}
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-muted hover:text-foreground hover:bg-foreground/5 transition-colors flex-shrink-0"
      type="button"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  )
}

function SuccessView({ data }: { data: OnboardSuccess }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/10">
        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
        <div className="text-sm">
          <p className="text-foreground font-medium">{t('admin.success.created')}</p>
          <p className="text-muted text-xs mt-0.5">
            {t('admin.success.invited').replace('{email}', data.email)}
          </p>
        </div>
      </div>

      <div>
        <span className="text-xs font-medium text-foreground block mb-1.5">
          {t('admin.success.webhookLabel')}
        </span>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-background">
          <code className="flex-1 text-xs text-foreground font-mono break-all">
            {data.webhook_url}
          </code>
          <CopyButton text={data.webhook_url} />
        </div>
        <p className="text-[11px] text-muted mt-1">{t('admin.success.webhookHint')}</p>
      </div>

      <div>
        <span className="text-xs font-medium text-foreground block mb-1.5">
          {t('admin.success.numeroLabel')}
        </span>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-background">
          <code className="flex-1 text-xs text-foreground font-mono">
            {data.numero_whatsapp_bot}
          </code>
          <CopyButton text={data.numero_whatsapp_bot} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-foreground/[0.02] p-3">
        <h3 className="text-sm font-medium text-foreground mb-2">
          {t('admin.success.nextSteps')}
        </h3>
        <ol className="text-xs text-muted space-y-1.5 list-decimal pl-4">
          <li>{t('admin.success.step1').replace('{numero}', data.numero_whatsapp_bot)}</li>
          <li>{t('admin.success.step2')}</li>
          <li>{t('admin.success.step3').replace('{email}', data.email)}</li>
          <li>{t('admin.success.step4')}</li>
        </ol>
      </div>
    </div>
  )
}
