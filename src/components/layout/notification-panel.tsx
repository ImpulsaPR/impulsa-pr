'use client'

import { useEffect, useRef } from 'react'
import { Bell, Check, CheckCheck, Circle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import type { Notificacion } from '@/hooks/use-notifications'

interface NotificationPanelProps {
  open: boolean
  onClose: () => void
  items: Notificacion[]
  unreadCount: number
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
}

export function NotificationPanel({
  open,
  onClose,
  items,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
}: NotificationPanelProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { t, locale } = useTranslation()

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-96 max-w-[90vw] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-scale-in theme-transition z-50"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{t('notif.title')}</h3>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-background text-[10px] font-bold tabular-nums">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-[11px] text-muted hover:text-foreground px-2 py-1 rounded-lg hover:bg-card-hover transition-colors"
          >
            <CheckCheck className="w-3 h-3" />
            {t('notif.markAll')}
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Bell className="w-10 h-10 mx-auto mb-3 text-muted/20" />
            <p className="text-sm text-muted">{t('notif.empty')}</p>
            <p className="text-xs text-muted/60 mt-1">{t('notif.emptyDesc')}</p>
          </div>
        ) : (
          items.map((n) => {
            const unread = !n.leido
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => unread && onMarkRead(n.id)}
                className={`group w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-border/40 last:border-b-0 ${
                  unread
                    ? 'bg-primary/5 hover:bg-primary/10'
                    : 'hover:bg-card-hover'
                }`}
              >
                <div className="w-7 flex-shrink-0 flex justify-center pt-1">
                  {unread ? (
                    <Circle className="w-2 h-2 text-primary fill-primary" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-muted/60" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm leading-snug ${
                      unread ? 'text-foreground font-medium' : 'text-muted'
                    }`}
                  >
                    {n.mensaje || t('notif.noMessage')}
                  </p>
                  <p className="text-[10px] text-muted/70 mt-1">
                    {timeAgo(n.created_at, locale)}
                  </p>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

function timeAgo(iso: string, locale: string): string {
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
