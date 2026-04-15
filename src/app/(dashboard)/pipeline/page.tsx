'use client'

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useLeads } from '@/hooks/use-leads'
import { getSupabase } from '@/lib/supabase'
import { PipelineColumn } from '@/components/pipeline/pipeline-column'
import { LeadCard } from '@/components/pipeline/lead-card'
import { EditLeadModal } from '@/components/leads/edit-lead-modal'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { useTranslation } from '@/lib/i18n'
import type { Lead } from '@/lib/types'

export default function PipelinePage() {
  const { leads, loading, refetch } = useLeads()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [optimisticMoves, setOptimisticMoves] = useState<Record<string, string>>({})
  const [editingLead, setEditingLead] = useState<Lead | null>(null)

  const stages = [
    { key: 'nuevo', labelKey: 'stage.nuevo' as const, color: 'bg-blue-400', border: 'border-blue-400/30', bg: 'bg-blue-400/5' },
    { key: 'contactado', labelKey: 'stage.contactado' as const, color: 'bg-accent-yellow', border: 'border-accent-yellow/30', bg: 'bg-accent-yellow/5' },
    { key: 'interesado', labelKey: 'stage.interesado' as const, color: 'bg-accent-orange', border: 'border-accent-orange/30', bg: 'bg-accent-orange/5' },
    { key: 'cerrado', labelKey: 'stage.cerrado' as const, color: 'bg-primary', border: 'border-primary/30', bg: 'bg-primary/5' },
  ]

  const validStages = new Set(stages.map((s) => s.key))

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null

  const displayLeads = leads.map((l) =>
    optimisticMoves[l.id] ? { ...l, estado: optimisticMoves[l.id] as Lead['estado'] } : l
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const resolveDropTarget = (overId: string): string | null => {
    if (validStages.has(overId)) return overId
    const targetLead = leads.find((l) => l.id === overId)
    if (targetLead && validStages.has(targetLead.estado)) return targetLead.estado
    return null
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const leadId = active.id as string
    const newEtapa = resolveDropTarget(over.id as string)

    if (!newEtapa) return

    const lead = leads.find((l) => l.id === leadId)
    if (!lead || lead.estado === newEtapa) return

    setOptimisticMoves((prev) => ({ ...prev, [leadId]: newEtapa }))
    setUpdating(leadId)

    const { error } = await getSupabase()
      .from('leads')
      .update({ estado: newEtapa })
      .eq('id', leadId)

    setOptimisticMoves((prev) => {
      const next = { ...prev }
      delete next[leadId]
      return next
    })
    setUpdating(null)

    if (error) {
      toast(t('pipeline.moveError'), 'error')
    } else {
      const stageLabel = t(stages.find((s) => s.key === newEtapa)?.labelKey || 'stage.nuevo')
      toast(`${t('pipeline.movedTo')} "${stageLabel}"`)
      refetch()
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[500px] rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('pipeline.title')}</h1>
        <p className="text-sm text-muted mt-1">
          {t('pipeline.subtitle')}
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {stages.map((stage) => {
            const stageLeads = displayLeads.filter((l) => l.estado === stage.key)
            const totalValue = stageLeads.reduce((sum, l) => sum + (l.valor_estimado || 0), 0)

            return (
              <PipelineColumn
                key={stage.key}
                id={stage.key}
                label={t(stage.labelKey)}
                count={stageLeads.length}
                totalValue={totalValue}
                color={stage.color}
                border={stage.border}
                bg={stage.bg}
                leads={stageLeads}
                updatingId={updating}
                onLeadClick={setEditingLead}
              />
            )
          })}
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: 'ease-out' }}>
          {activeLead ? <LeadCard lead={activeLead} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      <EditLeadModal
        lead={editingLead}
        onClose={() => setEditingLead(null)}
        onUpdated={refetch}
      />
    </div>
  )
}
