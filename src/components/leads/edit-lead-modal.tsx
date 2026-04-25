'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Pencil, User, Phone, DollarSign, CheckCircle } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/toast'
import { useTranslation } from '@/lib/i18n'
import type { Lead, LeadEstado } from '@/lib/types'
import { Portal } from '@/components/ui/portal'

interface EditLeadModalProps {
  lead: Lead | null
  onClose: () => void
  onUpdated: () => void
}

export function EditLeadModal({ lead, onClose, onUpdated }: EditLeadModalProps) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [valorEstimado, setValorEstimado] = useState('')
  const [valorReal, setValorReal] = useState('')
  const [estado, setEstado] = useState<LeadEstado>('nuevo')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()
  const { t } = useTranslation()

  const estadoOptions: { value: LeadEstado; label: string }[] = [
    { value: 'nuevo', label: t('status.nuevo') },
    { value: 'contactado', label: t('status.contactado') },
    { value: 'interesado', label: t('status.interesado') },
    { value: 'cerrado', label: t('status.cerrado') },
  ]

  useEffect(() => {
    if (!lead) return

    let cancelled = false
    const fetchFresh = async () => {
      const { data } = await getSupabase()
        .from('leads')
        .select('*')
        .eq('id', lead.id)
        .single()

      if (cancelled) return

      const fresh = (data as Lead | null) ?? lead
      setNombre(fresh.nombre)
      setTelefono(fresh.telefono)
      setValorEstimado(String(fresh.valor_estimado || 0))
      setValorReal(String(fresh.valor_real || 0))
      setEstado(fresh.estado)
      setError('')
      setSuccess(false)
    }

    setNombre(lead.nombre)
    setTelefono(lead.telefono)
    setValorEstimado(String(lead.valor_estimado || 0))
    setValorReal(String(lead.valor_real || 0))
    setEstado(lead.estado)
    setError('')
    setSuccess(false)

    fetchFresh()

    return () => { cancelled = true }
  }, [lead])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lead) return
    setLoading(true)
    setError('')

    const { error: updateError } = await getSupabase()
      .from('leads')
      .update({
        nombre,
        telefono,
        valor_estimado: parseFloat(valorEstimado) || 0,
        valor_real: parseFloat(valorReal) || 0,
        estado,
      })
      .eq('id', lead.id)

    if (updateError) {
      setError(updateError.message)
      toast(updateError.message, 'error')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    toast(t('editLead.updated'))
    onUpdated()

    setTimeout(() => {
      onClose()
    }, 1000)
  }

  if (!lead) return null

  const inputClass = 'w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 transition-all'

  return (
    <Portal>
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-border bg-card shadow-2xl animate-scale-in theme-transition">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center">
              <Pencil className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t('editLead.title')}</h2>
              <p className="text-xs text-muted truncate max-w-[200px]">{lead.nombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-border/40 text-muted hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold">{t('editLead.success')}</h3>
            <p className="text-sm text-muted mt-1">
              {t('editLead.successMsg')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="text-xs text-muted mb-1.5 block font-medium">{t('createLead.name')}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted mb-1.5 block font-medium">{t('createLead.phone')}</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted mb-1.5 block font-medium">{t('createLead.estValue')}</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="number"
                    value={valorEstimado}
                    onChange={(e) => setValorEstimado(e.target.value)}
                    min="0"
                    step="0.01"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted mb-1.5 block font-medium">{t('editLead.realValue')}</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="number"
                    value={valorReal}
                    onChange={(e) => setValorReal(e.target.value)}
                    min="0"
                    step="0.01"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted mb-1.5 block font-medium">{t('editLead.status')}</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as LeadEstado)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 transition-all appearance-none cursor-pointer"
              >
                {estadoOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="rounded-xl bg-accent-red/10 border border-accent-red/20 px-4 py-2.5 text-sm text-accent-red">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-foreground text-background py-2.5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Pencil className="w-4 h-4" />
                  {t('editLead.submit')}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
    </Portal>
  )
}
