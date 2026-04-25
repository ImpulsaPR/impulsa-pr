'use client'

interface DateSeparatorProps {
  iso: string
}

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DAYS_FULL_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export function formatDateSeparator(iso: string): string {
  const date = new Date(iso)
  const now = new Date()

  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = Math.round((todayOnly.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays >= 2 && diffDays <= 6) {
    return `${DAYS_ES[date.getDay()]} ${date.getDate()} ${date.toLocaleString('es', { month: 'short' })}`
  }
  // >= 7 días o futuro
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('es', { day: '2-digit', month: '2-digit' })
  }
  return date.toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Llave para agrupar por día (YYYY-MM-DD local)
export function dateKey(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function DateSeparator({ iso }: DateSeparatorProps) {
  return (
    <div className="flex items-center justify-center my-3" role="separator" aria-label={DAYS_FULL_ES[new Date(iso).getDay()]}>
      <span className="px-3 py-1 rounded-full bg-border/40 text-[10px] font-medium text-muted">
        {formatDateSeparator(iso)}
      </span>
    </div>
  )
}
