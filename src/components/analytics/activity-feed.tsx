import { UserPlus, CalendarCheck, CalendarX } from 'lucide-react'
import type { ActividadItem } from '@/hooks/use-metricas'

const ACTIVITY_ICON = {
  lead_nuevo: UserPlus,
  cita_agendada: CalendarCheck,
  cita_cancelada: CalendarX,
}

const ACTIVITY_COLOR = {
  lead_nuevo: 'bg-primary/12 text-primary',
  cita_agendada: 'bg-blue-500/12 text-blue-400',
  cita_cancelada: 'bg-accent-red/12 text-accent-red',
}

interface ActivityFeedProps {
  items: ActividadItem[]
  locale: string
  typeLabel: Record<ActividadItem['tipo'], string>
  groupLabels: { today: string; yesterday: string; earlier: string }
}

function dayKey(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function isToday(d: Date) {
  const n = new Date()
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  )
}

function isYesterday(d: Date) {
  const n = new Date()
  n.setDate(n.getDate() - 1)
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  )
}

function timeOnly(iso: string, locale: string) {
  return new Date(iso).toLocaleTimeString(locale === 'es' ? 'es-ES' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ActivityFeed({
  items,
  locale,
  typeLabel,
  groupLabels,
}: ActivityFeedProps) {
  const groups = new Map<string, { label: string; items: ActividadItem[] }>()

  for (const a of items) {
    const d = new Date(a.timestamp)
    const key = dayKey(a.timestamp)
    let label: string
    if (isToday(d)) label = groupLabels.today
    else if (isYesterday(d)) label = groupLabels.yesterday
    else
      label = d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
        day: 'numeric',
        month: 'short',
      })
    const existing = groups.get(key)
    if (existing) existing.items.push(a)
    else groups.set(key, { label, items: [a] })
  }

  return (
    <div className="space-y-5">
      {Array.from(groups.entries()).map(([key, group]) => (
        <div key={key}>
          <div className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-2 pl-1">
            {group.label}
          </div>
          <div className="space-y-1">
            {group.items.map((a, i) => {
              const Icon = ACTIVITY_ICON[a.tipo]
              return (
                <div
                  key={`${a.ref_id}-${i}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-card-hover transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${ACTIVITY_COLOR[a.tipo]}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {a.descripcion || '—'}
                    </p>
                    <p className="text-[10px] text-muted truncate">
                      {typeLabel[a.tipo]}
                      {a.detalle ? ` · ${a.detalle}` : ''}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted flex-shrink-0 tabular-nums">
                    {timeOnly(a.timestamp, locale)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
