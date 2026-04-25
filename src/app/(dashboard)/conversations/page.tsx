'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useConversations } from '@/hooks/use-conversations'
import { getSupabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/toast'
import { useTranslation } from '@/lib/i18n'
import { ConversationList, type ConversationListHandle } from '@/components/conversations/conversation-list'
import { ChatWindow } from '@/components/conversations/chat-window'
import { EmptyState } from '@/components/conversations/empty-state'
import { sanitizeName } from '@/components/conversations/avatar'

const FLASH_MS = 600

export default function ConversationsPage() {
  const { conversations, messagesByPhone, loading, refetch } = useConversations()
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [toggling, setToggling] = useState(false)
  const [flashingPhones, setFlashingPhones] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const { t } = useTranslation()
  const listRef = useRef<ConversationListHandle>(null)

  // Tracker de last timestamps para detectar inserts → flash highlight
  const lastTimestampsRef = useRef<Map<string, string>>(new Map())

  useEffect(() => {
    const prev = lastTimestampsRef.current
    const newFlashing: string[] = []
    for (const conv of conversations) {
      const prevTs = prev.get(conv.telefono)
      if (prevTs && prevTs !== conv.lastTimestamp) {
        newFlashing.push(conv.telefono)
      }
    }
    // Sync map
    const next = new Map<string, string>()
    for (const conv of conversations) {
      next.set(conv.telefono, conv.lastTimestamp)
    }
    lastTimestampsRef.current = next

    if (newFlashing.length > 0) {
      setFlashingPhones((prev) => {
        const merged = new Set(prev)
        newFlashing.forEach((p) => merged.add(p))
        return merged
      })
      const timers = newFlashing.map((phone) =>
        setTimeout(() => {
          setFlashingPhones((prev) => {
            const next = new Set(prev)
            next.delete(phone)
            return next
          })
        }, FLASH_MS)
      )
      return () => timers.forEach(clearTimeout)
    }
  }, [conversations])

  // Filtrado por search (sanitizando el nombre para coincidencias correctas)
  const filtered = useMemo(() => {
    if (!search) return conversations
    const q = search.toLowerCase().trim()
    return conversations.filter((c) => {
      const name = sanitizeName(c.lead?.nombre).toLowerCase()
      return name.includes(q) || c.telefono.includes(q)
    })
  }, [conversations, search])

  const selected = useMemo(() => {
    if (!selectedPhone) return null
    return filtered.find((c) => c.telefono === selectedPhone) || null
  }, [filtered, selectedPhone])

  const selectedMessages = useMemo(
    () => (selected ? messagesByPhone(selected.telefono) : []),
    [selected, messagesByPhone]
  )

  // Atajos globales: "/" o Cmd/Ctrl+K para focus search; ESC para deselect
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'
      if (isCmdK) {
        e.preventDefault()
        listRef.current?.focusSearch()
        return
      }
      if (e.key === '/' && !isInput) {
        e.preventDefault()
        listRef.current?.focusSearch()
        return
      }
      if (e.key === 'Escape' && !isInput && selectedPhone) {
        setSelectedPhone(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedPhone])

  const handleSend = async (text: string) => {
    if (!selected) return
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefono: selected.telefono, mensaje: text }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast(json.error || 'Error al enviar', 'error')
        throw new Error(json.error || 'Error al enviar')
      }
      toast('Mensaje enviado')
      refetch()
    } catch (e) {
      if (e instanceof Error && e.message !== 'Error al enviar') {
        toast('Error de red al enviar', 'error')
      }
      throw e
    }
  }

  const handleToggleAI = async () => {
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
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('conversations.title')}</h1>
        <p className="text-sm text-muted mt-1">{t('conversations.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-[70vh] min-h-[500px] max-h-[750px]">
        {/* Lista — siempre visible en lg+, oculta en mobile cuando hay seleccion */}
        <div
          className={`lg:col-span-1 h-full ${
            selected ? 'hidden lg:block' : 'block'
          }`}
        >
          <ConversationList
            ref={listRef}
            conversations={filtered}
            selectedPhone={selected?.telefono ?? null}
            onSelect={setSelectedPhone}
            search={search}
            onSearchChange={setSearch}
            loading={loading}
            flashingPhones={flashingPhones}
          />
        </div>

        {/* Chat — siempre visible en lg+, full-width en mobile cuando hay seleccion */}
        <div
          className={`lg:col-span-2 h-full ${
            selected ? 'block' : 'hidden lg:block'
          }`}
        >
          {selected ? (
            <ChatWindow
              conv={selected}
              messages={selectedMessages}
              onSend={handleSend}
              onToggleAI={handleToggleAI}
              toggling={toggling}
              onBack={() => setSelectedPhone(null)}
            />
          ) : (
            <div className="h-full flex items-center justify-center rounded-2xl border border-border bg-card theme-transition">
              <EmptyState variant="no-selection" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
