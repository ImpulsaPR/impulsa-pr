'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  LifeBuoy,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mail,
  Inbox,
  Headphones,
  Sparkles,
} from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { useToast } from '@/components/ui/toast'
import { useSoporte, type SoportePrioridad } from '@/hooks/use-soporte'
import { Skeleton } from '@/components/ui/skeleton'

const MAX_MESSAGE_LENGTH = 4000

export default function SoportePage() {
  const { t, locale } = useTranslation()
  const { toast } = useToast()
  const {
    items,
    loading,
    error,
    sending,
    sendMessage,
    markAllRead,
    unreadFromSupport,
  } = useSoporte()

  const [asunto, setAsunto] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [prioridad, setPrioridad] = useState<SoportePrioridad>('normal')
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (unreadFromSupport > 0) markAllRead()
  }, [unreadFromSupport, markAllRead])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [items.length])

  const grouped = useMemo(() => {
    const groups: { day: string; rows: typeof items }[] = []
    for (const m of items) {
      const day = new Date(m.created_at).toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
      })
      const last = groups[groups.length - 1]
      if (last && last.day === day) {
        last.rows.push(m)
      } else {
        groups.push({ day, rows: [m] })
      }
    }
    return groups
  }, [items, locale])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = mensaje.trim()
    if (!text) return
    if (text.length > MAX_MESSAGE_LENGTH) return
    const { error: err } = await sendMessage({
      asunto: asunto.trim() || null,
      mensaje: text,
      prioridad,
    })
    if (err) {
      toast(t('support.sendError'), 'error')
      return
    }
    setMensaje('')
    setAsunto('')
    setPrioridad('normal')
    toast(t('support.sendOk'), 'success')
  }

  const prioridadChipClass: Record<SoportePrioridad, string> = {
    baja: 'bg-blue-500/10 text-blue-400',
    normal: 'bg-muted/20 text-muted',
    alta: 'bg-accent-orange/15 text-accent-orange',
    urgente: 'bg-accent-red/15 text-accent-red',
  }

  const remaining = MAX_MESSAGE_LENGTH - mensaje.length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
            <LifeBuoy className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('support.title')}
            </h1>
            <p className="text-sm text-muted mt-0.5">{t('support.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <Headphones className="w-4 h-4" />
          <span>{t('support.slaHint')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="rounded-2xl border border-border bg-card theme-transition flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-muted" />
              <h2 className="text-sm font-semibold">{t('support.thread')}</h2>
              {items.length > 0 && (
                <span className="text-[10px] text-muted tabular-nums">
                  {items.length}
                </span>
              )}
            </div>
            {unreadFromSupport > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                <Sparkles className="w-3 h-3" />
                {unreadFromSupport} {t('support.newFromSupport')}
              </span>
            )}
          </div>

          <div
            ref={scrollRef}
            className="flex-1 px-5 py-4 overflow-y-auto max-h-[480px] min-h-[320px] space-y-5"
          >
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-2/3 rounded-2xl" />
                <Skeleton className="h-14 w-1/2 rounded-2xl ml-auto" />
                <Skeleton className="h-16 w-3/5 rounded-2xl" />
              </div>
            ) : error ? (
              <div className="flex items-start gap-3 rounded-xl border border-accent-red/30 bg-accent-red/5 px-4 py-3 text-xs text-accent-red">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-0.5">{t('support.errorTitle')}</p>
                  <p className="text-accent-red/80">{error}</p>
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-10 text-muted">
                <Mail className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-medium text-foreground">
                  {t('support.emptyTitle')}
                </p>
                <p className="text-xs mt-1 max-w-sm">{t('support.emptyHint')}</p>
              </div>
            ) : (
              grouped.map((g) => (
                <div key={g.day}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-px bg-border/50" />
                    <span className="text-[10px] text-muted uppercase tracking-wider">
                      {g.day}
                    </span>
                    <div className="flex-1 h-px bg-border/50" />
                  </div>
                  <div className="space-y-3">
                    {g.rows.map((m) => {
                      const isClient = m.autor === 'cliente'
                      return (
                        <div
                          key={m.id}
                          className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                              isClient
                                ? 'bg-primary text-background'
                                : 'bg-background border border-border text-foreground'
                            }`}
                          >
                            {m.asunto && (
                              <p
                                className={`text-[11px] font-semibold mb-1 ${isClient ? 'opacity-90' : 'text-muted'}`}
                              >
                                {m.asunto}
                              </p>
                            )}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {m.mensaje}
                            </p>
                            <div
                              className={`flex items-center gap-2 mt-2 text-[10px] ${isClient ? 'opacity-75' : 'text-muted'}`}
                            >
                              <span>
                                {new Date(m.created_at).toLocaleTimeString(
                                  locale,
                                  { hour: '2-digit', minute: '2-digit' }
                                )}
                              </span>
                              {isClient && m.prioridad !== 'normal' && (
                                <span className="px-1.5 py-0.5 rounded bg-white/15 font-semibold uppercase tracking-wider">
                                  {t(`support.priority.${m.prioridad}` as const)}
                                </span>
                              )}
                              {m.estado !== 'abierto' && (
                                <span className="flex items-center gap-0.5">
                                  <CheckCircle2 className="w-3 h-3" />
                                  {t(`support.status.${m.estado}` as const)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-border p-4 space-y-3 bg-background/50"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                maxLength={120}
                placeholder={t('support.subjectPlaceholder')}
                className="flex-1 min-w-[200px] bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-border-hover"
              />
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value as SoportePrioridad)}
                className={`rounded-xl border border-border px-3 py-2 text-xs font-medium focus:outline-none focus:border-border-hover ${prioridadChipClass[prioridad]}`}
              >
                <option value="baja">{t('support.priority.baja')}</option>
                <option value="normal">{t('support.priority.normal')}</option>
                <option value="alta">{t('support.priority.alta')}</option>
                <option value="urgente">{t('support.priority.urgente')}</option>
              </select>
            </div>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              maxLength={MAX_MESSAGE_LENGTH}
              placeholder={t('support.messagePlaceholder')}
              rows={4}
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-border-hover resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  handleSubmit(e as unknown as React.FormEvent)
                }
              }}
            />
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-[10px] tabular-nums ${remaining < 200 ? 'text-accent-orange' : 'text-muted'}`}
              >
                {remaining} {t('support.charsLeft')}
              </span>
              <button
                type="submit"
                disabled={sending || mensaje.trim().length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {t('support.sending')}
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    {t('support.send')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 theme-transition">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">{t('support.tipsTitle')}</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-muted leading-relaxed">
              <li className="flex gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                <span>{t('support.tip1')}</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                <span>{t('support.tip2')}</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                <span>{t('support.tip3')}</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 theme-transition">
            <div className="flex items-center gap-2 mb-3">
              <Headphones className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold">{t('support.contactTitle')}</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed mb-3">
              {t('support.contactHint')}
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-muted">
                <Mail className="w-3.5 h-3.5" />
                <a
                  href="mailto:mrulisess.business@gmail.com"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  mrulisess.business@gmail.com
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
