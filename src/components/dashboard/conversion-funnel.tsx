'use client'

import { useLeads } from '@/hooks/use-leads'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/lib/i18n'
import { Target } from 'lucide-react'

const stageConfig = [
  { key: 'nuevo', labelKey: 'status.nuevo' as const, color: 'bg-blue-400', bgColor: 'bg-blue-400/10', textColor: 'text-blue-400', dotColor: 'bg-blue-400' },
  { key: 'contactado', labelKey: 'status.contactado' as const, color: 'bg-accent-yellow', bgColor: 'bg-accent-yellow/10', textColor: 'text-accent-yellow', dotColor: 'bg-accent-yellow' },
  { key: 'interesado', labelKey: 'status.interesado' as const, color: 'bg-accent-orange', bgColor: 'bg-accent-orange/10', textColor: 'text-accent-orange', dotColor: 'bg-accent-orange' },
  { key: 'cerrado', labelKey: 'status.cerrado' as const, color: 'bg-primary', bgColor: 'bg-primary/10', textColor: 'text-primary', dotColor: 'bg-primary' },
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
            <Skeleton className="h-8 w-full rounded-lg" />
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
  const maxCount = Math.max(...stages.map((s) => s.count), 1)

  return (
    <div className="rounded-2xl border border-border bg-card p-6 theme-transition glass-card hover:shadow-lg hover:shadow-foreground/5 transition-all duration-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/3 to-transparent" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              {t('pipeline.salesPipeline')}
            </h3>
          </div>
          <span className="text-xs text-muted bg-border/30 px-2 py-0.5 rounded-full">{totalLeads} total</span>
        </div>

        {/* Funnel bars */}
        <div className="space-y-3">
          {stages.map((stage, i) => {
            const widthPct = maxCount > 0 ? Math.max((stage.count / maxCount) * 100, stage.count > 0 ? 15 : 5) : 5

            return (
              <div key={stage.key} className="group/bar">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${stage.dotColor}`} />
                    <span className="text-xs text-muted font-medium">{t(stage.labelKey)}</span>
                  </div>
                  <span className={`text-xs font-bold ${stage.textColor}`}>{stage.count}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-border/30 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${stage.color} transition-all duration-700 ease-out group-hover/bar:opacity-80`}
                    style={{
                      width: `${widthPct}%`,
                      maxWidth: '100%',
                      opacity: 0.3 + (0.7 * (i === stages.length - 1 ? 1 : (stages.length - i) / stages.length)),
                    }}
                  />
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
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">
                  {Math.round((stages[stages.length - 1].count / totalLeads) * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
