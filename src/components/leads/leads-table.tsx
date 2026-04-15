'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, Bot, ArrowUpDown, User, Trash2, Loader2 } from 'lucide-react'
import { StatusBadge, InteresBadge } from '@/components/ui/status-badge'
import { TableRowSkeleton } from '@/components/ui/skeleton'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { useToast } from '@/components/ui/toast'
import { useTranslation } from '@/lib/i18n'
import { getSupabase } from '@/lib/supabase'
import type { Lead, LeadEstado } from '@/lib/types'

interface LeadsTableProps {
  leads: Lead[]
  loading: boolean
  onRefetch?: () => void
  onLeadClick?: (lead: Lead) => void
}

export function LeadsTable({ leads, loading, onRefetch, onLeadClick }: LeadsTableProps) {
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmLead, setConfirmLead] = useState<Lead | null>(null)
  const [statusFilter, setStatusFilter] = useState<LeadEstado | 'all'>('all')
  const [sortField, setSortField] = useState<'nombre' | 'valor_estimado' | 'fecha_ultimo_contacto'>('fecha_ultimo_contacto')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const { toast } = useToast()
  const { t } = useTranslation()

  const statusFilters: { label: string; value: LeadEstado | 'all' }[] = [
    { label: t('leads.all'), value: 'all' },
    { label: t('status.nuevo'), value: 'nuevo' },
    { label: t('status.contactado'), value: 'contactado' },
    { label: t('status.interesado'), value: 'interesado' },
    { label: t('status.cerrado'), value: 'cerrado' },
  ]

  const filtered = useMemo(() => {
    let result = leads

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (l) =>
          l.nombre.toLowerCase().includes(q) ||
          l.telefono.includes(q) ||
          (l.tipo_negocio || '').toLowerCase().includes(q) ||
          (l.etapa || '').toLowerCase().includes(q)
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter((l) => l.estado === statusFilter)
    }

    result = [...result].sort((a, b) => {
      let cmp = 0
      if (sortField === 'nombre') cmp = a.nombre.localeCompare(b.nombre)
      else if (sortField === 'valor_estimado') cmp = (a.valor_estimado || 0) - (b.valor_estimado || 0)
      else cmp = new Date(a.fecha_ultimo_contacto).getTime() - new Date(b.fecha_ultimo_contacto).getTime()
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [leads, search, statusFilter, sortField, sortDir])

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const formatCurrency = (v: number) =>
    v > 0 ? `$${v.toLocaleString()}` : '\u2014'

  const formatDate = (iso: string | null) => {
    if (!iso) return '\u2014'
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const formatPhone = (phone: string) => {
    return phone.replace('@c.us', '').replace('@s.whatsapp.net', '')
  }

  const handleDelete = async () => {
    if (!confirmLead) return
    const lead = confirmLead
    setDeletingId(lead.id)

    const { error } = await getSupabase()
      .from('leads')
      .update({ deleted: true })
      .eq('id', lead.id)

    setDeletingId(null)
    setConfirmLead(null)

    if (error) {
      toast(t('delete.error'), 'error')
    } else {
      toast(`"${lead.nombre}" ${t('delete.success')}`)
      onRefetch?.()
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden theme-transition">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-border">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 w-full sm:w-72">
          <Search className="w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder={t('leads.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-foreground placeholder:text-muted outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-muted flex-shrink-0" />
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                statusFilter === f.value
                  ? 'bg-foreground text-background'
                  : 'text-muted hover:text-foreground hover:bg-border/40 border border-transparent'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background/50 sticky top-0 z-10 backdrop-blur-sm">
              <th className="text-left px-4 py-3.5">
                <button
                  onClick={() => toggleSort('nombre')}
                  className="flex items-center gap-1 text-xs font-medium text-muted hover:text-foreground transition-colors"
                >
                  {t('leads.name')} <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-medium text-muted">{t('leads.phone')}</th>
              <th className="text-left px-4 py-3.5 text-xs font-medium text-muted">{t('leads.status')}</th>
              <th className="text-left px-4 py-3.5 text-xs font-medium text-muted">{t('leads.interest')}</th>
              <th className="text-left px-4 py-3.5 text-xs font-medium text-muted">{t('leads.business')}</th>
              <th className="text-left px-4 py-3.5">
                <button
                  onClick={() => toggleSort('valor_estimado')}
                  className="flex items-center gap-1 text-xs font-medium text-muted hover:text-foreground transition-colors"
                >
                  {t('leads.estValue')} <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left px-4 py-3.5">
                <button
                  onClick={() => toggleSort('fecha_ultimo_contacto')}
                  className="flex items-center gap-1 text-xs font-medium text-muted hover:text-foreground transition-colors"
                >
                  {t('leads.lastContact')} <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-right px-4 py-3.5 text-xs font-medium text-muted">{t('leads.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-muted">
                  <User className="w-12 h-12 mx-auto mb-3 text-muted/20" />
                  <p className="text-sm font-medium">{t('leads.noLeads')}</p>
                  <p className="text-xs text-muted/60 mt-1">
                    {t('dashboard.newLead')}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => onLeadClick?.(lead)}
                  className="border-b border-border/50 hover:bg-card-hover/80 transition-all duration-200 cursor-pointer group"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground group-hover:text-foreground/80 transition-colors">
                        {lead.nombre}
                      </span>
                      {!lead.humano_activo && lead.historial_mensajes?.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20">
                          <Bot className="w-3 h-3" />
                          {t('general.ai')}
                        </span>
                      )}
                      {lead.humano_activo && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-accent-orange/10 text-accent-orange border border-accent-orange/20">
                          <User className="w-3 h-3" />
                          {t('general.human')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted font-mono text-xs">
                    {formatPhone(lead.telefono)}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={lead.estado} />
                  </td>
                  <td className="px-4 py-3.5">
                    <InteresBadge nivel={lead.nivel_interes} />
                  </td>
                  <td className="px-4 py-3.5 text-muted text-xs">
                    {lead.tipo_negocio || '\u2014'}
                  </td>
                  <td className="px-4 py-3.5 text-foreground font-medium">
                    {formatCurrency(lead.valor_estimado)}
                  </td>
                  <td className="px-4 py-3.5 text-muted text-xs">
                    {formatDate(lead.fecha_ultimo_contacto)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {lead.source === 'manual' ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmLead(lead) }}
                        disabled={deletingId === lead.id}
                        className="p-1.5 rounded-lg text-muted hover:text-accent-red hover:bg-accent-red/10 transition-all duration-200 disabled:opacity-50"
                        title={t('leads.deleteLead')}
                      >
                        {deletingId === lead.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    ) : (
                      <span className="text-[10px] text-muted">{t('leads.auto')}</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <span className="text-xs text-muted">
          {filtered.length} {t('leads.of')} {leads.length} {t('general.leads')}
        </span>
      </div>

      {/* Delete confirmation */}
      <ConfirmModal
        open={!!confirmLead}
        title={t('delete.title')}
        message={t('delete.message', { name: confirmLead?.nombre || '' })}
        confirmLabel={t('delete.confirm')}
        cancelLabel={t('delete.cancel')}
        loading={!!deletingId}
        onConfirm={handleDelete}
        onCancel={() => setConfirmLead(null)}
      />
    </div>
  )
}
