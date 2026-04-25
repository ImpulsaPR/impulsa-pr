'use client'

import { Activity, UserPlus } from 'lucide-react'
import { useLeads } from '@/hooks/use-leads'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/lib/i18n'

export function RecentActivity() {
  const { leads, loading } = useLeads()
  const { t, locale } = useTranslation()

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4 theme-transition">
        <Skeleton className="h-4 w-32" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 items-center">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-2 w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.fecha_ultimo_contacto).getTime() - new Date(a.fecha_ultimo_contacto).getTime())
    .slice(0, 6)

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    const prefix = locale === 'es' ? 'hace ' : ''
    const suffix = locale === 'en' ? ' ago' : ''
    if (mins < 1) return locale === 'es' ? 'ahora' : 'now'
    if (mins < 60) return `${prefix}${mins} min${suffix}`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${prefix}${hrs}h${suffix}`
    const days = Math.floor(hrs / 24)
    return `${prefix}${days}d${suffix}`
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 theme-transition glass-card hover:shadow-lg hover:shadow-foreground/5 transition-all duration-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-accent-orange/3 to-transparent" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-foreground/5 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-muted" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            {t('activity.title')}
          </h3>
        </div>
        <div className="space-y-1">
          {recentLeads.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-border/30 flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-7 h-7 text-muted/30" />
              </div>
              <p className="text-sm text-muted font-medium">{t('activity.noActivity')}</p>
              <p className="text-xs text-muted/60 mt-1.5 max-w-[200px] mx-auto leading-relaxed">
                {locale === 'es' ? 'Los leads nuevos apareceran aqui' : 'New leads will appear here'}
              </p>
            </div>
          )}
          {recentLeads.map((lead) => {
            const hasMessages = lead.historial_mensajes?.length > 0
            const isAI = !lead.humano_activo && hasMessages
            const isNew = !hasMessages

            const tag = isNew
              ? t('activity.newLead')
              : isAI
              ? t('activity.aiHandling')
              : t('activity.humanActive')
            const tagColor = isNew
              ? 'bg-blue-500/10 text-blue-400'
              : isAI
              ? 'bg-primary/10 text-primary'
              : 'bg-accent-orange/10 text-accent-orange'

            const leadInitials = lead.nombre
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()

            return (
              <div key={lead.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-card-hover transition-all duration-200 group cursor-default">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-border/30 text-foreground text-[11px] font-bold transition-all duration-200 group-hover:scale-105 group-hover:bg-border/50 flex-shrink-0">
                  {leadInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate font-medium">
                    {lead.nombre}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold ${tagColor}`}
                    >
                      {tag}
                    </span>
                    <span className="text-[10px] text-muted">
                      {timeAgo(lead.fecha_ultimo_contacto)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
