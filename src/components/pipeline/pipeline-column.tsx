'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DraggableLeadCard } from './lead-card'
import { useTranslation } from '@/lib/i18n'
import type { Lead } from '@/lib/types'

interface PipelineColumnProps {
  id: string
  label: string
  count: number
  totalValue: number
  color: string
  border: string
  bg: string
  leads: Lead[]
  updatingId: string | null
  onLeadClick?: (lead: Lead) => void
}

export function PipelineColumn({
  id,
  label,
  count,
  totalValue,
  color,
  border,
  bg,
  leads,
  updatingId,
  onLeadClick,
}: PipelineColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id })
  const { t } = useTranslation()

  return (
    <div
      ref={setNodeRef}
      className={`
        rounded-2xl border transition-all duration-300 flex flex-col min-h-[500px] overflow-hidden theme-transition
        ${isOver
          ? `${border} ${bg} scale-[1.01] shadow-lg`
          : 'border-border bg-card/50'
        }
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
            <h3 className="text-sm font-semibold text-foreground">{label}</h3>
          </div>
          <span className="text-xs font-medium text-muted bg-border/30 px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>
        {totalValue > 0 && (
          <p className="text-xs text-muted pl-[18px]">
            ${totalValue.toLocaleString()}
          </p>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 p-3 space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)]">
        <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          {leads.length === 0 ? (
            <div className={`
              rounded-xl border border-dashed p-6 text-center transition-colors
              ${isOver ? `${border}` : 'border-border/30'}
            `}>
              <p className="text-xs text-muted">
                {isOver ? t('pipeline.dropHere') : t('pipeline.noLeads')}
              </p>
            </div>
          ) : (
            leads.map((lead) => (
              <DraggableLeadCard
                key={lead.id}
                lead={lead}
                isUpdating={updatingId === lead.id}
                onClick={() => onLeadClick?.(lead)}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}
