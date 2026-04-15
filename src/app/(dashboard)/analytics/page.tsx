'use client'

import { TrendingUp, DollarSign, Bot, MessageSquare } from 'lucide-react'
import { useLeads } from '@/hooks/use-leads'
import { StatCardSkeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/lib/i18n'

export default function AnalyticsPage() {
  const { leads, loading } = useLeads()
  const { t } = useTranslation()

  const totalMessages = leads.reduce((sum, l) => sum + (l.historial_mensajes?.length || 0), 0)
  const aiMessages = leads.reduce(
    (sum, l) => sum + (l.historial_mensajes?.filter((m) => m.rol === 'bot').length || 0),
    0
  )
  const interesados = leads.filter((l) => l.estado === 'interesado').length
  const totalValor = leads.reduce((sum, l) => sum + (l.valor_estimado || 0), 0)
  const avgDealSize = leads.length > 0 ? totalValor / leads.length : 0

  const tipoCount: Record<string, number> = {}
  leads.forEach((l) => {
    const key = l.tipo_negocio || 'N/A'
    tipoCount[key] = (tipoCount[key] || 0) + 1
  })

  const tipoColors = ['bg-primary', 'bg-purple-400', 'bg-blue-400', 'bg-accent-orange', 'bg-accent-yellow', 'bg-accent-red']
  const sortedTipos = Object.entries(tipoCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count], i) => ({
      name,
      leads: count,
      pct: leads.length > 0 ? Math.round((count / leads.length) * 100) : 0,
      color: tipoColors[i % tipoColors.length],
    }))

  const interesCount: Record<string, number> = {}
  leads.forEach((l) => {
    const key = l.nivel_interes || 'bajo'
    interesCount[key] = (interesCount[key] || 0) + 1
  })
  const interesData = [
    { labelKey: 'interest.alto' as const, count: interesCount['alto'] || 0, color: 'bg-primary' },
    { labelKey: 'interest.medio' as const, count: interesCount['medio'] || 0, color: 'bg-accent-yellow' },
    { labelKey: 'interest.bajo' as const, count: interesCount['bajo'] || 0, color: 'bg-muted' },
  ]
  const maxInteres = Math.max(...interesData.map((d) => d.count), 1)

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('analytics.title')}</h1>
          <p className="text-sm text-muted mt-1">{t('analytics.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('analytics.title')}</h1>
        <p className="text-sm text-muted mt-1">
          {t('analytics.subtitle')}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: t('analytics.avgValue'), value: `$${Math.round(avgDealSize).toLocaleString()}`, icon: DollarSign },
          { label: t('analytics.interestedLeads'), value: `${interesados}`, icon: TrendingUp },
          { label: t('analytics.aiMessages'), value: `${aiMessages}`, icon: Bot },
          { label: t('analytics.totalMessages'), value: `${totalMessages}`, icon: MessageSquare },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-2xl border border-border bg-card p-5 hover:border-border-hover hover:bg-card-hover transition-all duration-300 group theme-transition"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted">{m.label}</span>
              <m.icon className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
            </div>
            <p className="text-2xl font-bold">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interest Level */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 theme-transition">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold">{t('analytics.interestLevel')}</h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold gradient-text-growth">{leads.length} {t('general.leads')}</span>
            </div>
          </div>
          <div className="flex items-end gap-6 h-48">
            {interesData.map((d) => (
              <div key={d.labelKey} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-sm font-bold text-foreground">{d.count}</span>
                <div
                  className={`w-full rounded-t-lg ${d.color} transition-all duration-500`}
                  style={{
                    height: `${(d.count / maxInteres) * 100}%`,
                    minHeight: d.count > 0 ? '8px' : '0',
                  }}
                />
                <span className="text-xs text-muted">{t(d.labelKey)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Business Types */}
        <div className="rounded-2xl border border-border bg-card p-6 theme-transition">
          <h3 className="text-sm font-semibold mb-6">{t('analytics.businessTypes')}</h3>
          <div className="space-y-4">
            {sortedTipos.length === 0 && (
              <p className="text-sm text-muted text-center py-4">{t('analytics.noData')}</p>
            )}
            {sortedTipos.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-foreground capitalize">{s.name}</span>
                  <span className="text-xs text-muted">
                    {s.leads} ({s.pct}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-border/50 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.color} transition-all duration-700`}
                    style={{ width: `${s.pct}%`, minWidth: s.leads > 0 ? '8px' : '0' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
