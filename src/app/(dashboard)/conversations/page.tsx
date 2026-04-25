'use client'

import { useState } from 'react'
import { Bot, MessageSquare, User, Search, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react'
import { useLeads } from '@/hooks/use-leads'
import { getSupabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { useTranslation } from '@/lib/i18n'

export default function ConversationsPage() {
  const { leads, loading, refetch } = useLeads()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [toggling, setToggling] = useState(false)
  const { toast } = useToast()
  const { t } = useTranslation()

  const withMessages = leads.filter((l) => {
    if (l.historial_mensajes?.length === 0) return false
    if (!search) return true
    const q = search.toLowerCase()
    return l.nombre.toLowerCase().includes(q) || l.telefono.includes(q)
  })
  const selected = selectedId
    ? withMessages.find((l) => l.id === selectedId) || withMessages[0]
    : withMessages[0]

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins} min`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h`
    return `${Math.floor(hrs / 24)}d`
  }

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

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
        <p className="text-sm text-muted mt-1">
          {t('conversations.subtitle')}
        </p>
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
            {withMessages.length === 0 && (
              <p className="text-sm text-muted text-center py-8">{t('conversations.noConversations')}</p>
            )}
            {withMessages.map((lead) => {
              const isActive = selected?.id === lead.id
              const isAI = !lead.humano_activo

              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedId(lead.id)}
                  className={`p-4 cursor-pointer transition-all duration-200 hover:bg-card-hover ${
                    isActive ? 'bg-card-hover' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-border/50 flex items-center justify-center text-sm font-medium text-foreground flex-shrink-0">
                      {getInitials(lead.nombre)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {lead.nombre}
                        </span>
                        <span className="text-[10px] text-muted">
                          {timeAgo(lead.fecha_ultimo_contacto)}
                        </span>
                      </div>
                      <p className="text-xs text-muted truncate mt-0.5">
                        {lead.ultimo_mensaje || t('conversations.noMessages')}
                      </p>
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
                    {getInitials(selected.nombre)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{selected.nombre}</p>
                    <div className="flex items-center gap-2">
                      {selected.tipo_negocio && (
                        <span className="text-[10px] text-muted">{selected.tipo_negocio}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${!selected.humano_activo ? 'bg-primary animate-pulse-glow' : 'bg-accent-orange'}`} />
                        <span className={`text-[10px] ${!selected.humano_activo ? 'text-primary' : 'text-accent-orange'}`}>
                          {!selected.humano_activo ? t('conversations.aiManaging') : t('conversations.humanActive')}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                {selected.historial_resumen && (
                  <div className="hidden xl:block max-w-xs">
                    <p className="text-[10px] text-muted leading-relaxed line-clamp-2">
                      {selected.historial_resumen}
                    </p>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {selected.historial_mensajes.map((msg, i) => {
                  const isProspect = msg.rol === 'prospecto'
                  const isBot = msg.rol === 'bot'

                  return (
                    <div key={i} className={`flex ${isProspect ? 'justify-start' : 'justify-end'}`}>
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
                            <span className={`text-[10px] font-medium ${isBot ? 'text-primary' : 'text-accent-orange'}`}>
                              {isBot ? t('general.ai') : t('general.human')}
                            </span>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.msg}</p>
                        <span className="text-[10px] text-muted mt-1 block">
                          {formatTime(msg.ts)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Control bar */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t('conversations.readOnly')}</span>
                  </div>
                  <button
                    onClick={async () => {
                      if (!selected) return
                      setToggling(true)
                      const { error } = await getSupabase()
                        .from('leads')
                        .update({ humano_activo: !selected.humano_activo })
                        .eq('id', selected.id)
                      setToggling(false)
                      if (error) {
                        toast(error.message, 'error')
                      } else {
                        toast(selected.humano_activo ? t('conversations.switchedToAI') : t('conversations.switchedToHuman'))
                        refetch()
                      }
                    }}
                    disabled={toggling}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-50 ${
                      selected.humano_activo
                        ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                        : 'bg-accent-orange/10 text-accent-orange border border-accent-orange/20 hover:bg-accent-orange/20'
                    }`}
                  >
                    {toggling ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : selected.humano_activo ? (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    ) : (
                      <ShieldAlert className="w-3.5 h-3.5" />
                    )}
                    {selected.humano_activo ? t('conversations.switchToAI') : t('conversations.takeControl')}
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
