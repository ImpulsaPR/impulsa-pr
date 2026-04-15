'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Phone, DollarSign, GripVertical } from 'lucide-react'
import type { Lead } from '@/lib/types'

interface LeadCardProps {
  lead: Lead
  isDragging?: boolean
  isUpdating?: boolean
  onClick?: () => void
}

export function LeadCard({ lead, isDragging, isUpdating, onClick }: LeadCardProps) {
  const formatPhone = (phone: string) =>
    phone.replace('@c.us', '').replace('@s.whatsapp.net', '')

  const formatCurrency = (v: number) =>
    v > 0 ? `$${v.toLocaleString()}` : '—'

  return (
    <div
      onClick={onClick}
      className={`
        rounded-xl border bg-card p-3.5 cursor-grab active:cursor-grabbing
        transition-all duration-200 group
        ${isDragging
          ? 'border-primary/40 bg-card shadow-lg shadow-primary/10 scale-[1.02] rotate-1 opacity-90'
          : isUpdating
            ? 'border-primary/20 opacity-60'
            : 'border-border hover:border-border-hover hover:bg-card-hover'
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {lead.nombre}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Phone className="w-3 h-3 text-muted flex-shrink-0" />
            <span className="text-[11px] text-muted font-mono truncate">
              {formatPhone(lead.telefono)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <DollarSign className="w-3 h-3 text-muted flex-shrink-0" />
            <span className="text-[11px] text-foreground font-medium">
              {formatCurrency(lead.valor_estimado)}
            </span>
          </div>
        </div>
        <GripVertical className="w-4 h-4 text-muted/30 group-hover:text-muted transition-colors flex-shrink-0 mt-0.5" />
      </div>
    </div>
  )
}

export function DraggableLeadCard({ lead, isUpdating, onClick }: { lead: Lead; isUpdating?: boolean; onClick?: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <LeadCard lead={lead} isUpdating={isUpdating} onClick={onClick} />
    </div>
  )
}
