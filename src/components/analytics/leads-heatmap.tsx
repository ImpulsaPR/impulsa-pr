'use client'

import { useMemo, useState } from 'react'
import { Grid3x3 } from 'lucide-react'
import type { Lead } from '@/lib/types'

interface Props {
  leads: Lead[]
  labels: {
    title: string
    subtitle: string
    less: string
    more: string
    leadsSuffix: string
    emptyTitle: string
    emptyHint: string
    weekdays: [string, string, string, string, string, string, string]
  }
}

export function LeadsHeatmap({ leads, labels }: Props) {
  const { grid, max, peak } = useMemo(() => {
    const g: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
    for (const l of leads) {
      const d = new Date(l.fecha_primer_contacto)
      if (Number.isNaN(d.getTime())) continue
      const dow = d.getDay()
      const h = d.getHours()
      g[dow][h]++
    }
    let m = 0
    let pk: { dow: number; h: number; n: number } | null = null
    for (let dow = 0; dow < 7; dow++) {
      for (let h = 0; h < 24; h++) {
        if (g[dow][h] > m) {
          m = g[dow][h]
          pk = { dow, h, n: g[dow][h] }
        }
      }
    }
    return { grid: g, max: m, peak: pk }
  }, [leads])

  const [hover, setHover] = useState<{ dow: number; h: number } | null>(null)

  const hourTicks = [0, 6, 12, 18, 23]
  const total = leads.length

  const colorFor = (n: number) => {
    if (n === 0) return 'var(--color-border)'
    const intensity = Math.min(1, 0.15 + (n / max) * 0.85)
    return `color-mix(in srgb, var(--color-primary) ${Math.round(intensity * 100)}%, transparent)`
  }

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 theme-transition">
        <div className="flex items-center gap-2 mb-4">
          <Grid3x3 className="w-4 h-4 text-primary" />
          <div>
            <h3 className="text-sm font-semibold">{labels.title}</h3>
            <p className="text-[10px] text-muted">{labels.subtitle}</p>
          </div>
        </div>
        <div className="text-center py-8 text-xs text-muted">
          <p className="font-medium text-foreground mb-0.5">{labels.emptyTitle}</p>
          <p>{labels.emptyHint}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 theme-transition">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Grid3x3 className="w-4 h-4 text-primary" />
          <div>
            <h3 className="text-sm font-semibold">{labels.title}</h3>
            <p className="text-[10px] text-muted">{labels.subtitle}</p>
          </div>
        </div>
        {peak && (
          <span className="text-[10px] text-muted tabular-nums">
            {labels.weekdays[peak.dow]} · {String(peak.h).padStart(2, '0')}:00 —{' '}
            <span className="text-foreground font-semibold">{peak.n}</span>
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="flex gap-1 mb-1 pl-10">
            {Array.from({ length: 24 }).map((_, h) => (
              <div
                key={h}
                className="w-3.5 text-center text-[8px] text-muted/70 tabular-nums"
              >
                {hourTicks.includes(h) ? h : ''}
              </div>
            ))}
          </div>
          {grid.map((row, dow) => (
            <div key={dow} className="flex items-center gap-1 mb-1">
              <div className="w-9 text-[10px] text-muted text-right pr-1">
                {labels.weekdays[dow].slice(0, 3)}
              </div>
              {row.map((n, h) => {
                const isHover = hover?.dow === dow && hover?.h === h
                return (
                  <div
                    key={h}
                    onMouseEnter={() => setHover({ dow, h })}
                    onMouseLeave={() => setHover(null)}
                    className="w-3.5 h-3.5 rounded-[3px] transition-all duration-150 cursor-default relative"
                    style={{
                      background: colorFor(n),
                      outline: isHover ? '1.5px solid var(--color-foreground)' : 'none',
                      outlineOffset: '1px',
                    }}
                    title={`${labels.weekdays[dow]} ${String(h).padStart(2, '0')}:00 — ${n} ${labels.leadsSuffix}`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-3 text-[10px] text-muted">
        <span>{labels.less}</span>
        {[0.1, 0.3, 0.5, 0.75, 1].map((v, i) => (
          <div
            key={i}
            className="w-3.5 h-3.5 rounded-[3px]"
            style={{
              background: `color-mix(in srgb, var(--color-primary) ${Math.round(v * 100)}%, transparent)`,
            }}
          />
        ))}
        <span>{labels.more}</span>
      </div>
    </div>
  )
}
