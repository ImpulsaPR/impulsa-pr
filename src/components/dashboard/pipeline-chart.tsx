'use client'

import { useLeads } from '@/hooks/use-leads'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/lib/i18n'

export function PipelineChart() {
  const { leads, loading } = useLeads()
  const { t } = useTranslation()

  const stageConfig = [
    { key: 'nuevo', labelKey: 'status.nuevo' as const, color: 'bg-blue-400' },
    { key: 'contactado', labelKey: 'status.contactado' as const, color: 'bg-accent-yellow' },
    { key: 'interesado', labelKey: 'status.interesado' as const, color: 'bg-accent-orange' },
    { key: 'cerrado', labelKey: 'status.cerrado' as const, color: 'bg-primary' },
  ]

  const stages = stageConfig.map((s) => {
    const count = leads.filter((l) => l.estado === s.key).length
    return { ...s, count }
  })

  const maxCount = Math.max(...stages.map((s) => s.count), 1)

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4 theme-transition">
        <Skeleton className="h-4 w-32" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 theme-transition">
      <h3 className="text-sm font-semibold text-foreground mb-6">
        {t('pipeline.salesPipeline')}
      </h3>
      <div className="space-y-4">
        {stages.map((stage) => (
          <div key={stage.key}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted">{t(stage.labelKey)}</span>
              <span className="text-xs font-medium text-foreground">
                {stage.count}
              </span>
            </div>
            <div className="h-2 rounded-full bg-border/50 overflow-hidden">
              <div
                className={`h-full rounded-full ${stage.color} transition-all duration-1000 ease-out`}
                style={{ width: `${(stage.count / maxCount) * 100}%`, minWidth: stage.count > 0 ? '8px' : '0' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
