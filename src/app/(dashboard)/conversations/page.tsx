'use client'

import { useState } from 'react'
import { Bot, MessageSquare, User, Search, ShieldCheck, ShieldAlert, Loader2, Send } from 'lucide-react'
import { useConversations } from '@/hooks/use-conversations'
import { getSupabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { useTranslation } from '@/lib/i18n'

const PROSPECT_ROLES = new Set(['user', 'prospecto', 'cliente'])
const BOT_ROLES = new Set(['assistant', 'bot', 'ai'])

export default function ConversationsPage() {
  const { conversations, messagesByPhone, loading, refetch } = useConversations()
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [toggling, setToggling] = useState(false)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const { toast } = useToast()
  const { t } = useTranslation()

  const handleSend = async () => {
    const msg = draft.trim()
    if (!msg || !selected) return
    setSending(true)
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefono: selected.telefono, mensaje: msg }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast(json.error || 'Error al enviar', 'error')
      } else {
        setDraft('')
        toast('Mensaje enviado')
        refetch()
      }
    } catch (e) {
      toast('Error de red al enviar', 'error')
    } finally {
      setSending(false)
    }
  }

  const filtered = conversations.filter((c) => {
    if (!search) return true
    const q = search.toLowerCase()
    const name = c.lead?.nombre?.toLowerCase() || ''
    return name.includes(q) || c.telefono.includes(q)
  })

  const selected = selectedPhone
    ? filtered.find((c) => c.telefono === selectedPhone) || filtered[0]
    : filtered[0]

  const selectedMessages = selected ? messagesByPhone(selected.telefono) : []

  const displayName = (c: { lead: { nombre?: string } | null; telefono: string }) =>
    c.lead?.nombre || `+${c.telefono}`

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'ahora'
    if (mins < 60) return `${mins} min`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h`
    return `${Math.floor(hrs / 24)}d`
  }

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const getInitials = (name: string) =>
    name
      .replace(/^\+/, '')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[600px] rounded-2xl" />
          <Skeleton className="h-[600px] rounded-2xl lg:col-span-2" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('conversations.title')}</h1>
        <p className="text-sm text-muted mt-1">{t('conversations.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation list */}
        <div className="lg:col-span-1 rounded-2xl border border-border bg-card overflow-hidden theme-transition">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
              <Search className="w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder={t('conversations.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-sm text-foreground placeholder:text-muted outline-none w-full"
              />
            </div>
          </div>

          <div className="divide-y divide-border/50 max-h-[550px] overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-sm text-muted text-center py-8">{t('conversations.noConversations')}</p>
            )}
            {filtered.map((conv) => {
              const isActive = selected?.telefono === conv.telefono
              const isAI = !conv.lead?.humano_activo
              const name = displayName(conv)

              return (
                <div
                  key={conv.telefono}
                  onClick={() => setSelectedPhone(conv.telefono)}
                  className={`p-4 cursor-pointer transition-all duration-200 hover:bg-card-hover ${
                    isActive ? 'bg-card-hover' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-border/50 flex items-center justify-center text-sm font-medium text-foreground flex-shrink-0">
                      {getInitials(name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground truncate">{name}</span>
                        <span className="text-[10px] text-muted whitespace-nowrap ml-2">
                          {timeAgo(conv.lastTimestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-muted truncate mt-0.5">{conv.lastMessage}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                            isAI
                              ? 'text-primary bg-primary/10 border-primary/20'
                              : 'text-accent-orange bg-accent-orange/10 border-accent-orange/20'
                          }`}
                        >
                          {isAI ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {isAI ? t('conversations.aiManaging') : t('conversations.humanActive')}
                        </span>
                        <span className="text-[9px] text-muted">{conv.messageCount} msg</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Chat area */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card flex flex-col min-h-[600px] theme-transition">
          {selected ? (
            <>
              {/* Chat header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-border/50 flex items-center justify-center text-sm font-medium">
                    {getInitials(displayName(selected))}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{displayName(selected)}</p>
                    <div className="flex items-center gap-2">
                      {selected.lead?.tipo_negocio && (
                        <span className="text-[10px] text-muted">{selected.lead.tipo_negocio}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            !selected.lead?.humano_activo
                              ? 'bg-primary animate-pulse-glow'
                              : 'bg-accent-orange'
                          }`}
                        />
                        <span
                          className={`text-[10px] ${
                            !selected.lead?.humano_activo ? 'text-primary' : 'text-accent-orange'
                          }`}
                        >
                          {!selected.lead?.humano_activo
                            ? t('conversations.aiManaging')
                            : t('conversations.humanActive')}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                {selected.lead?.historial_resumen && (
                  <div className="hidden xl:block max-w-xs">
                    <p className="text-[10px] text-muted leading-relaxed line-clamp-2">
                      {selected.lead.historial_resumen}
                    </p>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {selectedMessages.length === 0 && (
                  <p className="text-sm text-muted text-center py-8">{t('conversations.noMessages')}</p>
                )}
                {selectedMessages.map((msg) => {
                  const isProspect = PROSPECT_ROLES.has(msg.rol)
                  const isBot = BOT_ROLES.has(msg.rol)

                  return (
                    <div key={msg.id} className={`flex ${isProspect ? 'justify-start' : 'justify-end'}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          isProspect
                            ? 'rounded-tl-sm bg-border/30'
                            : isBot
                            ? 'rounded-tr-sm bg-primary/10 border border-primary/20'
                            : 'rounded-tr-sm bg-accent-orange/10 border border-accent-orange/20'
                        }`}
                      >
                        {!isProspect && (
                          <div className="flex items-center gap-1.5 mb-1">
                            {isBot ? (
                              <Bot className="w-3 h-3 text-primary" />
                            ) : (
                              <User className="w-3 h-3 text-accent-orange" />
                            )}
                            <span
                              className={`text-[10px] font-medium ${
                                isBot ? 'text-primary' : 'text-accent-orange'
                              }`}
                            >
                              {isBot ? t('general.ai') : t('general.human')}
                            </span>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.mensaje}</p>
                        <span className="text-[10px] text-muted mt-1 block">
                          {formatTime(msg.created_at)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Compose + control bar */}
              <div className="border-t border-border">
                <div className="flex items-end gap-2 p-3">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder="Escribe un mensaje... (Enter para enviar, Shift+Enter salto de línea)"
                    rows={2}
                    disabled={sending}
                    className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary/40 disabled:opacity-50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !draft.trim()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium bg-primary text-white hover:bg-primary/90 transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    {sending ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
                <div className="flex items-center justify-between px-4 pb-3">
                  <p className="text-[10px] text-muted">
                    Enviar registra takeover (bot pausado 6h)
                  </p>
                  <button
                    onClick={async () => {
                      if (!selected?.lead) {
                        toast('Sin lead asociado — toggle no disponible', 'error')
                        return
                      }
                      setToggling(true)
                      const { error } = await getSupabase()
                        .from('leads')
                        .update({ humano_activo: !selected.lead.humano_activo })
                        .eq('id', selected.lead.id)
                      setToggling(false)
                      if (error) {
                        toast(error.message, 'error')
                      } else {
                        toast(
                          selected.lead.humano_activo
                            ? t('conversations.switchedToAI')
                            : t('conversations.switchedToHuman')
                        )
                        refetch()
                      }
                    }}
                    disabled={toggling || !selected.lead}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-50 ${
                      selected.lead?.humano_activo
                        ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                        : 'bg-accent-orange/10 text-accent-orange border border-accent-orange/20 hover:bg-accent-orange/20'
                    }`}
                  >
                    {toggling ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : selected.lead?.humano_activo ? (
                      <ShieldCheck className="w-3 h-3" />
                    ) : (
                      <ShieldAlert className="w-3 h-3" />
                    )}
                    {selected.lead?.humano_activo
                      ? t('conversations.switchToAI')
                      : t('conversations.takeControl')}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-muted/30 mx-auto mb-3" />
                <p className="text-sm text-muted">{t('conversations.selectConversation')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
