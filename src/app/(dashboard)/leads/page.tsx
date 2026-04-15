'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { LeadsTable } from '@/components/leads/leads-table'
import { CreateLeadModal } from '@/components/leads/create-lead-modal'
import { EditLeadModal } from '@/components/leads/edit-lead-modal'
import { useLeads } from '@/hooks/use-leads'
import { useTranslation } from '@/lib/i18n'
import type { Lead } from '@/lib/types'

export default function LeadsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const { leads, loading, refetch } = useLeads()
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('leads.title')}</h1>
          <p className="text-sm text-muted mt-1">
            {t('leads.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all duration-200 hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          {t('dashboard.newLead')}
        </button>
      </div>

      <LeadsTable leads={leads} loading={loading} onRefetch={refetch} onLeadClick={setEditingLead} />

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
