'use client'

import { Zap, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import type { TiempoRespuestaResumen } from '@/hooks/use-metricas'

interface Props {
  data: TiempoRespuestaResumen | null
  labels: {
    title: string
    hint: string
    emptyTitle: string
    emptyHint: string
    conversations: string
    faster: string
    slower: string
    unchanged: string
  }
}

function formatDuration(seconds: number) {
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return s === 0 ? `${m}m` : `${m}m ${s}s`
}

function MiniSparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1
  const w = 120
  const h = 32
  const step = w / (values.length - 1)
  const points = values
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
    .join(' ')
  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id="rtGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${points} ${w},${h}`}
        fill="url(#rtGrad)"
      />
      <polyline
        points={points}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ResponseTimeCard({ data, labels }: Props) {
  if (!data) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 theme-transition">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-primary/12 text-primary flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold">{labels.emptyTitle}</h3>
        </div>
        <p className="text-xs text-muted ml-10">{labels.emptyHint}</p>
      </div>
    )
  }

  const values = data.serie.map((d) => d.segundos_promedio_respuesta)
  const delta = data.delta_pct
  const isFaster = delta !== null && delta < 0
  const isSlower = delta !== null && delta > 0
  const Icon = isFaster ? TrendingDown : isSlower ? TrendingUp : Minus
  const trendColor = isFaster
    ? 'text-primary bg-primary/10'
    : isSlower
      ? 'text-accent-red bg-accent-red/10'
      : 'text-muted bg-foreground/5'
  const trendLabel = isFaster ? labels.faster : isSlower ? labels.slower : labels.unchanged

  return (
    <div className="rounded-2xl border border-border bg-card p-6 theme-transition hover:border-border-hover transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-primary/12 text-primary flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold">{labels.title}</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black tracking-tighter tabular-nums">
              {formatDuration(data.avg_segundos)}
            </p>
            {delta !== null && (
              <span
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${trendColor}`}
              >
                <Icon className="w-3 h-3" />
                {Math.abs(delta)}%
              </span>
            )}
          </div>
          <p className="text-xs text-muted mt-1">{labels.hint}</p>
          <p className="text-[10px] text-muted mt-0.5">
            {data.total_conversaciones.toLocaleString()} {labels.conversations}
            {delta !== null && ` · ${trendLabel}`}
          </p>
        </div>
        <div className="hidden sm:block flex-shrink-0">
          <MiniSparkline values={values} />
        </div>
      </div>
    </div>
  )
}
