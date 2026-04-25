'use client'

import { useMemo, useState } from 'react'
import { Target, Megaphone } from 'lucide-react'
import type { Lead } from '@/lib/types'

interface Props {
  leads: Lead[]
  labels: {
    title: string
    subtitle: string
    tabOrigen: string
    tabFuente: string
    unknown: string
    leads: string
    bookings: string
    conversion: string
    pipeline: string
    emptyTitle: string
    emptyHint: string
  }
  onSelect?: (mode: 'origen' | 'fuente', value: string) => void
}

type Mode = 'origen' | 'fuente'

interface Row {
  key: string
  total: number
  agendados: number
  conversion: number
  pipeline: number
}

function formatCurrency(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`
  return `$${Math.round(v)}`
}

export function SourceAttribution({ leads, labels, onSelect }: Props) {
  const [mode, setMode] = useState<Mode>('origen')

  const rows = useMemo<Row[]>(() => {
    const map = new Map<string, { total: number; agendados: number; pipeline: number }>()
    for (const l of leads) {
      const raw = mode === 'origen' ? l.origen : l.fuente
      const key = (raw && raw.trim()) || labels.unknown
      const cur = map.get(key) ?? { total: 0, agendados: 0, pipeline: 0 }
      cur.total += 1
      if (l.etapa === 'agendado' || l.etapa === 'cerrado' || l.estado === 'cerrado') {
        cur.agendados += 1
      }
      cur.pipeline += l.valor_estimado || 0
      map.set(key, cur)
    }
    return Array.from(map.entries())
      .map(([key, v]) => ({
        key,
        total: v.total,
        agendados: v.agendados,
        conversion: v.total > 0 ? (v.agendados / v.total) * 100 : 0,
        pipeline: v.pipeline,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)
  }, [leads, mode, labels.unknown])

  const max = Math.max(...rows.map((r) => r.total), 1)

  if (leads.length === 0 || rows.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 theme-transition">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-primary/12 text-primary flex items-center justify-center">
            <Megaphone className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold">{labels.emptyTitle}</h3>
        </div>
        <p className="text-xs text-muted ml-10">{labels.emptyHint}</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 theme-transition">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <div>
            <h3 className="text-sm font-semibold">{labels.title}</h3>
            <p className="text-[10px] text-muted">{labels.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center bg-background/60 border border-border rounded-lg p-0.5">
          {(['origen', 'fuente'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
                mode === m
                  ? 'bg-foreground text-background'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {m === 'origen' ? labels.tabOrigen : labels.tabFuente}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 gap-y-2 items-center text-[10px] text-muted mb-1 px-1">
        <span>{mode === 'origen' ? labels.tabOrigen : labels.tabFuente}</span>
        <span className="text-right tabular-nums">{labels.leads}</span>
        <span className="text-right tabular-nums">{labels.conversion}</span>
        <span className="text-right tabular-nums">{labels.pipeline}</span>
      </div>

      <div className="space-y-1.5">
        {rows.map((r) => {
          const ratio = r.total / max
          const isInteractive = !!onSelect && r.key !== labels.unknown
          const Tag = isInteractive ? 'button' : 'div'
          return (
            <Tag
              key={r.key}
              type={isInteractive ? 'button' : undefined}
              onClick={isInteractive ? () => onSelect!(mode, r.key) : undefined}
              className={`w-full text-left grid grid-cols-[1fr_auto_auto_auto] gap-x-4 items-center group/src px-1 py-1.5 rounded-lg transition-colors ${
                isInteractive
                  ? 'hover:bg-card-hover cursor-pointer'
                  : 'hover:bg-card-hover'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-medium truncate">{r.key}</span>
                </div>
                <div className="h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{
                      width: `${ratio * 100}%`,
                      backgroundColor: `color-mix(in srgb, var(--color-primary) ${
                        35 + ratio * 55
                      }%, transparent)`,
                    }}
                  />
                </div>
              </div>
              <span className="text-xs font-semibold tabular-nums text-right">
                {r.total}
              </span>
              <span className="text-xs tabular-nums text-right text-muted">
                {r.conversion.toFixed(0)}%
              </span>
              <span className="text-xs tabular-nums text-right text-foreground">
                {formatCurrency(r.pipeline)}
              </span>
            </Tag>
          )
        })}
      </div>
    </div>
  )
}
