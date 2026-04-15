'use client'

import { useLeads } from '@/hooks/use-leads'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/lib/i18n'

const stageConfig = [
  { key: 'nuevo', labelKey: 'status.nuevo' as const, color: 'bg-blue-400', textColor: 'text-blue-400' },
  { key: 'contactado', labelKey: 'status.contactado' as const, color: 'bg-accent-yellow', textColor: 'text-accent-yellow' },
  { key: 'interesado', labelKey: 'status.interesado' as const, color: 'bg-accent-orange', textColor: 'text-accent-orange' },
  { key: 'cerrado', labelKey: 'status.cerrado' as const, color: 'bg-primary', textColor: 'text-primary' },
]

export function ConversionFunnel() {
  const { leads, loading } = useLeads()
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4 theme-transition">
        <Skeleton className="h-4 w-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    )
  }

  const stages = stageConfig.map((s) => {
    const count = leads.filter((l) => l.estado === s.key).length
    return { ...s, count }
  })

  const totalLeads = stages.reduce((sum, s) => sum + s.count, 0)
  const maxCount = Math.max(stages[0]?.count || 0, 1)

  return (
    <div className="rounded-2xl border border-border bg-card p-6 theme-transition hover:shadow-lg hover:shadow-foreground/5 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-foreground">
          {t('pipeline.salesPipeline')}
        </h3>
        <span className="text-xs text-muted">{totalLeads} total</span>
      </div>

      {/* Funnel visualization */}
      <div className="space-y-2">
        {stages.map((stage, i) => {
          const widthPct = maxCount > 0 ? Math.max((stage.count / maxCount) * 100, stage.count > 0 ? 15 : 5) : 5
          const dropRate = i > 0 && stages[i - 1].count > 0
            ? Math.round(((stages[i - 1].count - stage.count) / stages[i - 1].count) * 100)
            : null

          return (
            <div key={stage.key}>
              {/* Drop rate between stages */}
              {dropRate !== null && dropRate > 0 && (
                <div className="flex items-center justify-center py-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted">
                    <svg width="10" height="10" viewBox="0 0 10 10" className="text-muted/40">
                      <path d="M5 0 L5 7 M2 5 L5 8 L8 5" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>-{dropRate}%</span>
                  </div>
                </div>
              )}

              {/* Funnel bar */}
              <div className="flex items-center gap-3 group">
                <div className="w-20 sm:w-24 flex-shrink-0 text-right">
                  <span className="text-xs text-muted font-medium">{t(stage.labelKey)}</span>
                </div>
                <div className="flex-1 relative">
                  <div
                    className={`h-10 rounded-lg ${stage.color} transition-all duration-700 ease-out flex items-center justify-end pr-3 group-hover:opacity-90`}
                    style={{
                      width: `${widthPct}%`,
                      minWidth: stage.count > 0 ? '48px' : '24px',
                      opacity: 0.15 + (0.85 * (i === stages.length - 1 ? 1 : (stages.length - i) / stages.length)),
                    }}
                  >
                    <span className={`text-xs font-bold ${stage.textColor}`}>
                      {stage.count}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Conversion summary */}
      {totalLeads > 0 && (
        <div className="mt-5 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">{t('dashboard.overallConversion')}</span>
            <span className="text-sm font-bold text-primary">
              {totalLeads > 0
                ? Math.round((stages[stages.length - 1].count / totalLeads) * 100)
                : 0}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
