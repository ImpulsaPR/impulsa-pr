import { Clock, CheckCircle2 } from 'lucide-react'
import type { ProximaCita } from '@/hooks/use-metricas'

interface UpcomingCardsProps {
  citas: ProximaCita[]
  locale: string
  labelReminder: string
}

function splitDate(iso: string, locale: string) {
  const d = new Date(iso)
  const lang = locale === 'es' ? 'es-ES' : 'en-US'
  return {
    day: d.toLocaleDateString(lang, { day: '2-digit' }),
    month: d.toLocaleDateString(lang, { month: 'short' }).toUpperCase().replace('.', ''),
    time: d.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }),
  }
}

export function UpcomingCards({ citas, locale, labelReminder }: UpcomingCardsProps) {
  return (
    <div className="space-y-2">
      {citas.map((c) => {
        const parts = splitDate(c.fecha, locale)
        return (
          <div
            key={c.id}
            className="flex items-center gap-4 p-3 rounded-xl border border-border/60 bg-card/50 hover:bg-card-hover hover:border-border-hover transition-all duration-200 group"
          >
            <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex-shrink-0">
              <span className="text-lg font-black leading-none text-primary tabular-nums">
                {parts.day}
              </span>
              <span className="text-[9px] font-semibold text-primary/80 mt-0.5 tracking-wide">
                {parts.month}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {c.nombre_cliente || c.telefono_cliente}
              </p>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-muted">
                <Clock className="w-3 h-3" />
                <span>{parts.time}</span>
                {c.titulo && (
                  <>
                    <span className="text-muted/50">·</span>
                    <span className="truncate">{c.titulo}</span>
                  </>
                )}
                {c.tipo_negocio && (
                  <>
                    <span className="text-muted/50">·</span>
                    <span className="capitalize truncate">{c.tipo_negocio}</span>
                  </>
                )}
              </div>
            </div>
            {c.recordatorio_24h_enviado && (
              <div
                className="flex items-center gap-1 text-[10px] text-primary flex-shrink-0"
                title={labelReminder}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
