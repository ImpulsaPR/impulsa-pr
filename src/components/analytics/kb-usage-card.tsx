'use client'

import { BookOpen, Sparkles, Layers, Target } from 'lucide-react'
import type { KbStats } from '@/hooks/use-metricas'

interface Props {
  data: KbStats | null
  locale: string
  onSelectEntry?: (id: string) => void
  labels: {
    title: string
    subtitle: string
    hitRate: string
    hitRateHint: string
    totalUses: string
    totalUsesHint: string
    coverage: string
    coverageHint: string
    topTitle: string
    topSubtitle: string
    uses: string
    lastUsed: string
    never: string
    empty: string
    emptyHint: string
    unused: string
  }
}

function formatRelative(iso: string | null, locale: string, neverLabel: string) {
  if (!iso) return neverLabel
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return locale === 'es' ? 'hace segundos' : 'just now'
  if (mins < 60) return locale === 'es' ? `hace ${mins}m` : `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return locale === 'es' ? `hace ${hours}h` : `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return locale === 'es' ? `hace ${days}d` : `${days}d ago`
  return d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    day: 'numeric',
    month: 'short',
  })
}

export function KbUsageCard({ data, locale, onSelectEntry, labels }: Props) {
  if (!data || data.total_entries === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 theme-transition">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-primary/12 text-primary flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold">{labels.empty}</h3>
        </div>
        <p className="text-xs text-muted ml-10">{labels.emptyHint}</p>
      </div>
    )
  }

  const coveragePct =
    data.total_entries > 0 ? (data.used_entries / data.total_entries) * 100 : 0
  const maxUses = Math.max(...data.top.map((t) => t.usage_count), 1)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="rounded-2xl border border-border bg-card p-5 theme-transition">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-primary/12 text-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold">{labels.hitRate}</h3>
        </div>
        <p className="text-3xl font-black tracking-tighter tabular-nums">
          {data.hit_rate_pct.toFixed(1)}
          <span className="text-xl">%</span>
        </p>
        <p className="text-[10px] text-muted mt-1">{labels.hitRateHint}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 theme-transition">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/12 text-blue-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold">{labels.totalUses}</h3>
        </div>
        <p className="text-3xl font-black tracking-tighter tabular-nums">
          {data.total_uses.toLocaleString()}
        </p>
        <p className="text-[10px] text-muted mt-1">{labels.totalUsesHint}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 theme-transition">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-accent-orange/12 text-accent-orange flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold">{labels.coverage}</h3>
        </div>
        <p className="text-3xl font-black tracking-tighter tabular-nums">
          {data.used_entries}
          <span className="text-base text-muted font-medium"> / {data.total_entries}</span>
        </p>
        <div className="h-1.5 mt-2 rounded-full bg-foreground/5 overflow-hidden">
          <div
            className="h-full bg-accent-orange rounded-full transition-all duration-500"
            style={{ width: `${coveragePct}%` }}
          />
        </div>
        <p className="text-[10px] text-muted mt-1">{labels.coverageHint}</p>
      </div>

      <div className="lg:col-span-3 rounded-2xl border border-border bg-card p-5 theme-transition">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-primary" />
          <div>
            <h3 className="text-sm font-semibold">{labels.topTitle}</h3>
            <p className="text-[10px] text-muted">{labels.topSubtitle}</p>
          </div>
        </div>
        <div className="space-y-1.5">
          {data.top.map((e) => {
            const ratio = e.usage_count / maxUses
            const isInteractive = !!onSelectEntry
            const Tag = isInteractive ? 'button' : 'div'
            return (
              <Tag
                key={e.id}
                type={isInteractive ? 'button' : undefined}
                onClick={isInteractive ? () => onSelectEntry!(e.id) : undefined}
                className={`w-full text-left grid grid-cols-[1fr_auto_auto] gap-x-4 items-center px-2 py-2 rounded-lg transition-colors ${
                  isInteractive ? 'hover:bg-card-hover cursor-pointer' : ''
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {e.category && (
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-foreground/5 text-muted font-medium">
                        {e.category}
                      </span>
                    )}
                    <span className="text-xs font-medium truncate">{e.question}</span>
                  </div>
                  <div className="h-1 rounded-full bg-foreground/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/70 transition-all duration-500"
                      style={{ width: `${Math.max(ratio * 100, e.usage_count > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-semibold tabular-nums text-right whitespace-nowrap">
                  {e.usage_count} <span className="text-muted font-normal">{labels.uses}</span>
                </span>
                <span className="text-[10px] text-muted text-right whitespace-nowrap tabular-nums">
                  {e.usage_count === 0
                    ? labels.unused
                    : `${labels.lastUsed} ${formatRelative(e.last_used_at, locale, labels.never)}`}
                </span>
              </Tag>
            )
          })}
        </div>
      </div>
    </div>
  )
}
