'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Download } from 'lucide-react'
import { LeadsTable } from '@/components/leads/leads-table'
import { CreateLeadModal } from '@/components/leads/create-lead-modal'
import { EditLeadModal } from '@/components/leads/edit-lead-modal'
import { useLeads } from '@/hooks/use-leads'
import { useToast } from '@/components/ui/toast'
import { useTranslation } from '@/lib/i18n'
import type { Lead } from '@/lib/types'

function exportLeadsCSV(leads: Lead[]) {
  const headers = ['Name', 'Phone', 'Status', 'Interest', 'Business', 'Est. Value', 'Real Value', 'Last Contact', 'Source']
  const rows = leads.map((l) => [
    l.nombre,
    l.telefono.replace('@c.us', '').replace('@s.whatsapp.net', ''),
    l.estado,
    l.nivel_interes,
    l.tipo_negocio || '',
    l.valor_estimado,
    l.valor_real,
    l.fecha_ultimo_contacto,
    l.source,
  ])
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `impulsa-leads-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function LeadsPage() {
  return (
    <Suspense fallback={null}>
      <LeadsPageContent />
    </Suspense>
  )
}

function LeadsPageContent() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const { leads, loading, refetch } = useLeads()
  const { toast } = useToast()
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('q') ?? undefined

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('leads.title')}</h1>
          <p className="text-sm text-muted mt-1">
            {t('leads.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              exportLeadsCSV(leads)
              toast(t('export.success'))
            }}
            disabled={leads.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted hover:text-foreground hover:border-border-hover active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{t('export.csv')}</span>
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all duration-200 hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            {t('dashboard.newLead')}
          </button>
        </div>
      </div>

      <LeadsTable
        leads={leads}
        loading={loading}
        onRefetch={refetch}
        onLeadClick={setEditingLead}
        initialSearch={initialSearch}
      />

      <CreateLeadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={refetch}
      />
      <EditLeadModal
        lead={editingLead}
        onClose={() => setEditingLead(null)}
        onUpdated={refetch}
      />
    </div>
  )
}
