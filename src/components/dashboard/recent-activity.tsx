'use client'

import { Bot, UserPlus, User } from 'lucide-react'
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
          <div key={i} className="flex gap-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-full" />
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
    <div className="rounded-2xl border border-border bg-card p-6 theme-transition hover:shadow-lg hover:shadow-foreground/5 transition-all duration-300">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        {t('activity.title')}
      </h3>
      <div className="space-y-4">
        {recentLeads.length === 0 && (
          <div className="text-center py-8">
            <UserPlus className="w-10 h-10 mx-auto mb-3 text-muted/30" />
            <p className="text-sm text-muted">{t('activity.noActivity')}</p>
            <p className="text-xs text-muted/60 mt-1">
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
            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            : isAI
            ? 'bg-primary/10 text-primary border-primary/20'
            : 'bg-accent-orange/10 text-accent-orange border-accent-orange/20'

          const label = isNew
            ? `${t('activity.newLead')}: ${lead.nombre}`
            : hasMessages
            ? `${isAI ? t('activity.aiResponded') : t('activity.conversationWith')} ${lead.nombre}`
            : `${t('activity.leadRegistered')}: ${lead.nombre}`

          // Lead initials
          const leadInitials = lead.nombre
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()

          return (
            <div key={lead.id} className="flex items-start gap-3 group">
              <div className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center bg-border/40 text-foreground text-[11px] font-bold transition-transform duration-200 group-hover:scale-105">
                {leadInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{label}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${tagColor}`}
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
  )
}
