'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { ChatHeader } from './chat-header'
import { Composer } from './composer'
import { DateSeparator, dateKey } from './date-separator'
import { EmptyState } from './empty-state'
import { MessageBubble } from './message-bubble'
import type { ChatMessage, Conversation } from '@/hooks/use-conversations'

interface ChatWindowProps {
  conv: Conversation
  messages: ChatMessage[]
  onSend: (text: string) => Promise<void>
  onToggleAI: () => void
  toggling: boolean
  onBack?: () => void
  onOpenContext?: () => void
}

const SCROLL_THRESHOLD = 80 // px desde el fondo para considerar "en el fondo"

export function ChatWindow({
  conv,
  messages,
  onSend,
  onToggleAI,
  toggling,
  onBack,
  onOpenContext,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [atBottom, setAtBottom] = useState(true)
  const [hasNewBelow, setHasNewBelow] = useState(false)
  const lastMsgIdRef = useRef<number | null>(null)
  const lastConvPhoneRef = useRef<string>(conv.telefono)

  // Detectar si está en el fondo
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handler = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight
      const isBottom = distance < SCROLL_THRESHOLD
      setAtBottom(isBottom)
      if (isBottom) setHasNewBelow(false)
    }
    el.addEventListener('scroll', handler)
    handler()
    return () => el.removeEventListener('scroll', handler)
  }, [])

  // Reset al cambiar de conversación: scroll al fondo instantáneo. Difiere
  // los setStates fuera del cuerpo del effect para evitar cascading renders.
  useLayoutEffect(() => {
    if (lastConvPhoneRef.current === conv.telefono) return
    lastConvPhoneRef.current = conv.telefono
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
    lastMsgIdRef.current = messages.length > 0 ? messages[messages.length - 1].id : null
    queueMicrotask(() => {
      setAtBottom(true)
      setHasNewBelow(false)
    })
  }, [conv.telefono, messages])

  // Auto-scroll al llegar mensaje nuevo (solo si estaba en fondo).
  // Difiere setHasNewBelow vía queueMicrotask.
  useEffect(() => {
    if (messages.length === 0) return
    const lastMsg = messages[messages.length - 1]
    const prevId = lastMsgIdRef.current
    const isNew = prevId !== null && lastMsg.id !== prevId
    lastMsgIdRef.current = lastMsg.id

    if (!isNew) return
    if (atBottom) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      })
    } else {
      queueMicrotask(() => setHasNewBelow(true))
    }
  }, [messages, atBottom])

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    setHasNewBelow(false)
  }

  // Agrupar mensajes por día para separadores
  const renderedItems: Array<
    { type: 'separator'; key: string; iso: string } | { type: 'msg'; key: string; msg: ChatMessage }
  > = []
  let lastDay = ''
  messages.forEach((msg, idx) => {
    const day = dateKey(msg.created_at)
    if (day !== lastDay) {
      renderedItems.push({ type: 'separator', key: `sep-${day}`, iso: msg.created_at })
      lastDay = day
    }
    renderedItems.push({ type: 'msg', key: `msg-${msg.id}-${idx}`, msg })
  })

  return (
    <div className="h-full flex flex-col rounded-2xl border border-border bg-card overflow-hidden theme-transition">
      <ChatHeader
        conv={conv}
        onBack={onBack}
        onToggleAI={onToggleAI}
        toggling={toggling}
        onOpenContext={onOpenContext}
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto convo-scroll px-4 py-3 relative">
        {messages.length === 0 ? (
          <EmptyState variant="no-messages" />
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {renderedItems.map((item, idx) => {
                if (item.type === 'separator') {
                  return <DateSeparator key={item.key} iso={item.iso} />
                }
                const isLast = idx === renderedItems.length - 1
                return <MessageBubble key={item.key} msg={item.msg} animate={isLast} />
              })}
            </AnimatePresence>
            <div ref={bottomRef} aria-hidden="true" />
          </div>
        )}

        {/* Floating "nuevo mensaje" button */}
        <AnimatePresence>
          {hasNewBelow && !atBottom && (
            <motion.button
              key="new-msg-btn"
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              transition={{ duration: 0.18 }}
              onClick={scrollToBottom}
              className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-medium shadow-lg hover:bg-primary/90 transition-colors"
              aria-label="Ir al mensaje nuevo"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              Mensaje nuevo
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <Composer onSend={onSend} disabled={!conv.lead && false} />
    </div>
  )
}
