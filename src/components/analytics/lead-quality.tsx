'use client'

import { useMemo } from 'react'
import { Flame, UserCog } from 'lucide-react'
import type { Lead } from '@/lib/types'

interface Props {
  leads: Lead[]
  labels: {
    qualityTitle: string
    qualitySubtitle: string
    qualityHigh: string
    qualityMedium: string
    qualityLow: string
    takeoverTitle: string
    takeoverSubtitle: string
    takeoverOf: string
    takeoverLeads: string
  }
}

export function LeadQuality({ leads, labels }: Props) {
  const { high, medium, low, total, takeover } = useMemo(() => {
    let high = 0
    let medium = 0
    let low = 0
    let takeover = 0
    for (const l of leads) {
      if (l.nivel_interes === 'alto') high += 1
      else if (l.nivel_interes === 'medio') medium += 1
      else if (l.nivel_interes === 'bajo') low += 1
      if (l.humano_activo) takeover += 1
    }
    return { high, medium, low, total: leads.length, takeover }
  }, [leads])

  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0)
  const takeoverPct = total > 0 ? (takeover / total) * 100 : 0

  const rows = [
    { key: 'high', count: high, label: labels.qualityHigh, color: 'var(--color-primary)' },
    {
      key: 'medium',
      count: medium,
      label: labels.qualityMedium,
      color: 'var(--color-accent-orange)',
    },
    { key: 'low', count: low, label: labels.qualityLow, color: 'var(--color-muted)' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="sm:col-span-2 rounded-2xl border border-border bg-card p-5 theme-transition">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-4 h-4 text-primary" />
          <div>
            <h3 className="text-sm font-semibold">{labels.qualityTitle}</h3>
            <p className="text-[10px] text-muted">{labels.qualitySubtitle}</p>
          </div>
        </div>
        <div className="space-y-2.5">
          {rows.map((r) => {
            const p = pct(r.count)
            return (
              <div key={r.key}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-muted">{r.label}</span>
                  <span className="tabular-nums">
                    <span className="font-semibold text-foreground">{r.count}</span>{' '}
                    <span className="text-muted">· {p.toFixed(0)}%</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${p}%`, backgroundColor: r.color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 theme-transition">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-accent-orange/15 text-accent-orange flex items-center justify-center">
            <UserCog className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{labels.takeoverTitle}</h3>
          </div>
        </div>
        <p className="text-3xl font-black tracking-tighter tabular-nums mt-1">
          {takeoverPct.toFixed(1)}
          <span className="text-xl">%</span>
        </p>
        <p className="text-[10px] text-muted mt-1">
          {takeover} {labels.takeoverOf} {total} {labels.takeoverLeads}
        </p>
        <p className="text-[10px] text-muted mt-0.5">{labels.takeoverSubtitle}</p>
      </div>
    </div>
  )
}
