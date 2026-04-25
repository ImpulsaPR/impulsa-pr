import { Bot, MessagesSquare, AlertTriangle } from 'lucide-react'
import type { RendimientoBot } from '@/hooks/use-metricas'

interface BotPerformanceCardsProps {
  data: RendimientoBot | null
  labels: {
    noReply: string
    noReplyHint: string
    msgsToAppt: string
    msgsToApptHint: string
    msgsNoAppt: string
    msgsNoApptHint: string
  }
}

interface CardProps {
  Icon: typeof Bot
  label: string
  hint: string
  value: string
  tone: 'good' | 'neutral' | 'warn'
  delay: number
}

function SmallCard({ Icon, label, hint, value, tone, delay }: CardProps) {
  const tones = {
    good: 'bg-primary/12 text-primary',
    neutral: 'bg-blue-500/12 text-blue-400',
    warn: 'bg-accent-orange/12 text-accent-orange',
  }
  return (
    <div
      className="rounded-2xl border border-border bg-card p-5 hover:border-border-hover hover:-translate-y-0.5 transition-all duration-300 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${tones[tone]}`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-black tracking-tighter tabular-nums">{value}</p>
      <p className="text-xs font-medium text-foreground mt-1">{label}</p>
      <p className="text-[10px] text-muted mt-0.5">{hint}</p>
    </div>
  )
}

export function BotPerformanceCards({ data, labels }: BotPerformanceCardsProps) {
  const noReply = data?.conversaciones_sin_respuesta ?? 0
  const toAppt = data?.msgs_promedio_hasta_cita ?? 0
  const noAppt = data?.msgs_promedio_sin_cita ?? 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <SmallCard
        Icon={AlertTriangle}
        tone={noReply > 0 ? 'warn' : 'good'}
        label={labels.noReply}
        hint={labels.noReplyHint}
        value={String(noReply)}
        delay={0}
      />
      <SmallCard
        Icon={Bot}
        tone="good"
        label={labels.msgsToAppt}
        hint={labels.msgsToApptHint}
        value={toAppt.toFixed(1)}
        delay={60}
      />
      <SmallCard
        Icon={MessagesSquare}
        tone="neutral"
        label={labels.msgsNoAppt}
        hint={labels.msgsNoApptHint}
        value={noAppt.toFixed(1)}
        delay={120}
      />
    </div>
  )
}
