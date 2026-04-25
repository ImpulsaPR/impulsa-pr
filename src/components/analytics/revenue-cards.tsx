import { DollarSign, TrendingUp, Wallet } from 'lucide-react'

interface RevenueCardsProps {
  pipelineValue: number
  closedValue: number
  avgPerLead: number
  labels: {
    pipeline: string
    closed: string
    avgPerLead: string
    pipelineHint: string
    closedHint: string
    avgHint: string
  }
}

function formatCurrency(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`
  return `$${Math.round(v).toLocaleString()}`
}

interface CardProps {
  label: string
  hint: string
  value: string
  Icon: typeof DollarSign
  accent: 'primary' | 'blue' | 'orange'
  delay: number
}

function Card({ label, hint, value, Icon, accent, delay }: CardProps) {
  const accentMap = {
    primary: {
      bar: 'bg-primary',
      bg: 'bg-primary/12',
      text: 'text-primary',
      gradient: 'from-primary/10 to-transparent',
    },
    blue: {
      bar: 'bg-blue-500',
      bg: 'bg-blue-500/12',
      text: 'text-blue-400',
      gradient: 'from-blue-500/10 to-transparent',
    },
    orange: {
      bar: 'bg-accent-orange',
      bg: 'bg-accent-orange/12',
      text: 'text-accent-orange',
      gradient: 'from-accent-orange/10 to-transparent',
    },
  }[accent]

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 glass-card hover:border-border-hover hover:-translate-y-0.5 transition-all duration-300 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${accentMap.bar} opacity-60`} />
      <div className={`absolute inset-0 bg-gradient-to-br ${accentMap.gradient} opacity-40`} />
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted font-medium">{label}</p>
          <p className="text-2xl sm:text-3xl font-black tracking-tighter mt-1 tabular-nums">
            {value}
          </p>
          <p className="text-[10px] text-muted/70 mt-1.5">{hint}</p>
        </div>
        <div
          className={`w-10 h-10 rounded-xl ${accentMap.bg} ${accentMap.text} flex items-center justify-center flex-shrink-0`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

export function RevenueCards({
  pipelineValue,
  closedValue,
  avgPerLead,
  labels,
}: RevenueCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card
        label={labels.pipeline}
        hint={labels.pipelineHint}
        value={formatCurrency(pipelineValue)}
        Icon={Wallet}
        accent="blue"
        delay={0}
      />
      <Card
        label={labels.closed}
        hint={labels.closedHint}
        value={formatCurrency(closedValue)}
        Icon={TrendingUp}
        accent="primary"
        delay={60}
      />
      <Card
        label={labels.avgPerLead}
        hint={labels.avgHint}
        value={formatCurrency(avgPerLead)}
        Icon={DollarSign}
        accent="orange"
        delay={120}
      />
    </div>
  )
}
