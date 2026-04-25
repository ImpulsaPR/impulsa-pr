'use client'

import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { LeadsPorDia, CitasPorDia, MetricasDeltas, ActividadHora } from '@/hooks/use-metricas'

type Kind = 'positive' | 'negative' | 'warning' | 'info'

interface Insight {
  kind: Kind
  text: string
}

interface Props {
  rango: number
  deltas: MetricasDeltas
  leadsPorDia: LeadsPorDia[]
  citasPorDia: CitasPorDia[]
  actividadHora: ActividadHora[]
  noShowRate: number
  responseSeconds: number | null
  responseDeltaPct: number | null
  takeoverPct: number | null
  pipelineValue: number
  labels: {
    title: string
    subtitle: string
    emptyTitle: string
    emptyHint: string
    leadsUp: string
    leadsDown: string
    leadsFlat: string
    citasUp: string
    citasDown: string
    conversionUp: string
    conversionDown: string
    cancellationHigh: string
    cancellationOk: string
    responseFast: string
    responseSlow: string
    noShowHigh: string
    peakHour: string
    takeoverHigh: string
    pipelineStrong: string
    bestDay: string
    worstDay: string
    noisyStreak: string
  }
}

function formatSeconds(s: number): string {
  if (s < 60) return `${Math.round(s)}s`
  if (s < 3600) return `${(s / 60).toFixed(1)}m`
  return `${(s / 3600).toFixed(1)}h`
}

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${Math.round(n)}`
}

export function InsightsCard({
  rango,
  deltas,
  leadsPorDia,
  citasPorDia,
  actividadHora,
  noShowRate,
  responseSeconds,
  responseDeltaPct,
  takeoverPct,
  pipelineValue,
  labels,
}: Props) {
  const insights: Insight[] = []

  if (deltas.leads_totales !== null) {
    if (deltas.leads_totales >= 15) {
      insights.push({
        kind: 'positive',
        text: labels.leadsUp.replace('{pct}', String(deltas.leads_totales)),
      })
    } else if (deltas.leads_totales <= -15) {
      insights.push({
        kind: 'negative',
        text: labels.leadsDown.replace('{pct}', String(Math.abs(deltas.leads_totales))),
      })
    } else if (Math.abs(deltas.leads_totales) < 5) {
      insights.push({ kind: 'info', text: labels.leadsFlat })
    }
  }

  if (deltas.citas_agendadas !== null) {
    if (deltas.citas_agendadas >= 15) {
      insights.push({
        kind: 'positive',
        text: labels.citasUp.replace('{pct}', String(deltas.citas_agendadas)),
      })
    } else if (deltas.citas_agendadas <= -15) {
      insights.push({
        kind: 'negative',
        text: labels.citasDown.replace('{pct}', String(Math.abs(deltas.citas_agendadas))),
      })
    }
  }

  if (deltas.tasa_conversion !== null) {
    if (deltas.tasa_conversion >= 3) {
      insights.push({
        kind: 'positive',
        text: labels.conversionUp.replace('{pct}', deltas.tasa_conversion.toFixed(1)),
      })
    } else if (deltas.tasa_conversion <= -3) {
      insights.push({
        kind: 'negative',
        text: labels.conversionDown.replace(
          '{pct}',
          Math.abs(deltas.tasa_conversion).toFixed(1)
        ),
      })
    }
  }

  if (deltas.tasa_cancelacion !== null) {
    if (deltas.tasa_cancelacion >= 5) {
      insights.push({
        kind: 'warning',
        text: labels.cancellationHigh.replace(
          '{pct}',
          deltas.tasa_cancelacion.toFixed(1)
        ),
      })
    } else if (deltas.tasa_cancelacion <= -5) {
      insights.push({
        kind: 'positive',
        text: labels.cancellationOk.replace(
          '{pct}',
          Math.abs(deltas.tasa_cancelacion).toFixed(1)
        ),
      })
    }
  }

  if (responseSeconds !== null && responseDeltaPct !== null) {
    if (responseDeltaPct <= -10) {
      insights.push({
        kind: 'positive',
        text: labels.responseFast
          .replace('{avg}', formatSeconds(responseSeconds))
          .replace('{pct}', String(Math.abs(responseDeltaPct))),
      })
    } else if (responseDeltaPct >= 20) {
      insights.push({
        kind: 'warning',
        text: labels.responseSlow
          .replace('{avg}', formatSeconds(responseSeconds))
          .replace('{pct}', String(responseDeltaPct)),
      })
    }
  }

  if (noShowRate >= 20) {
    insights.push({
      kind: 'warning',
      text: labels.noShowHigh.replace('{pct}', noShowRate.toFixed(1)),
    })
  }

  if (actividadHora.length > 0) {
    const peak = actividadHora.reduce((a, b) =>
      b.total_mensajes > a.total_mensajes ? b : a
    )
    if (peak.total_mensajes > 0) {
      insights.push({
        kind: 'info',
        text: labels.peakHour.replace('{hour}', `${peak.hora}:00`),
      })
    }
  }

  if (takeoverPct !== null && takeoverPct >= 30) {
    insights.push({
      kind: 'warning',
      text: labels.takeoverHigh.replace('{pct}', takeoverPct.toFixed(0)),
    })
  }

  if (pipelineValue >= 10000) {
    insights.push({
      kind: 'positive',
      text: labels.pipelineStrong.replace('{val}', formatMoney(pipelineValue)),
    })
  }

  if (leadsPorDia.length >= 3) {
    const best = leadsPorDia.reduce((a, b) =>
      b.leads_nuevos > a.leads_nuevos ? b : a
    )
    const worst = leadsPorDia.reduce((a, b) =>
      b.leads_nuevos < a.leads_nuevos ? b : a
    )
    if (best.leads_nuevos > 0 && best.leads_nuevos !== worst.leads_nuevos) {
      const bestDate = new Date(best.fecha)
      const dayName = bestDate.toLocaleDateString(undefined, { weekday: 'long' })
      insights.push({
        kind: 'info',
        text: labels.bestDay
          .replace('{day}', dayName)
          .replace('{n}', String(best.leads_nuevos)),
      })
    }

    let zeroStreak = 0
    let maxStreak = 0
    for (const d of leadsPorDia) {
      if (d.leads_nuevos === 0) {
        zeroStreak++
        maxStreak = Math.max(maxStreak, zeroStreak)
      } else {
        zeroStreak = 0
      }
    }
    if (maxStreak >= 3) {
      insights.push({
        kind: 'warning',
        text: labels.noisyStreak.replace('{days}', String(maxStreak)),
      })
    }
  }

  if (citasPorDia.length >= 5) {
    const cancelled = citasPorDia.reduce((s, d) => s + d.citas_canceladas, 0)
    const total = citasPorDia.reduce((s, d) => s + d.citas_agendadas, 0)
    if (total > 0 && cancelled / total > 0.35) {
      const worst = citasPorDia.reduce((a, b) =>
        b.citas_canceladas > a.citas_canceladas ? b : a
      )
      const worstDate = new Date(worst.fecha)
      const dayName = worstDate.toLocaleDateString(undefined, { weekday: 'long' })
      insights.push({
        kind: 'warning',
        text: labels.worstDay
          .replace('{day}', dayName)
          .replace('{n}', String(worst.citas_canceladas)),
      })
    }
  }

  const iconFor = (kind: Kind) =>
    kind === 'positive' ? (
      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
    ) : kind === 'negative' ? (
      <TrendingDown className="w-4 h-4 text-accent-red flex-shrink-0 mt-0.5" />
    ) : kind === 'warning' ? (
      <AlertTriangle className="w-4 h-4 text-accent-orange flex-shrink-0 mt-0.5" />
    ) : (
      <TrendingUp className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
    )

  const bgFor = (kind: Kind) =>
    kind === 'positive'
      ? 'bg-primary/5 border-primary/20'
      : kind === 'negative'
        ? 'bg-accent-red/5 border-accent-red/20'
        : kind === 'warning'
          ? 'bg-accent-orange/5 border-accent-orange/20'
          : 'bg-blue-500/5 border-blue-500/20'

  return (
    <div className="rounded-2xl border border-border bg-card p-5 theme-transition">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{labels.title}</h3>
            <p className="text-[10px] text-muted">
              {labels.subtitle.replace('{days}', String(rango))}
            </p>
          </div>
        </div>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted">
          <p className="font-medium text-foreground mb-0.5">{labels.emptyTitle}</p>
          <p>{labels.emptyHint}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {insights.map((ins, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-xs leading-relaxed ${bgFor(ins.kind)}`}
            >
              {iconFor(ins.kind)}
              <span className="text-foreground/90">{ins.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
