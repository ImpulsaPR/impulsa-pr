'use client'

import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import { Loader2, Send } from 'lucide-react'

interface ComposerProps {
  onSend: (text: string) => Promise<void>
  disabled?: boolean
}

export interface ComposerHandle {
  focus: () => void
}

const MIN_HEIGHT = 40 // px (~1 row de text-sm con padding)
const MAX_HEIGHT = 160 // px (~6 rows)

export const Composer = forwardRef<ComposerHandle, ComposerProps>(function Composer(
  { onSend, disabled },
  ref
) {
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
  }))

  // Auto-grow manual
  useLayoutEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = '0px'
    const next = Math.min(Math.max(ta.scrollHeight, MIN_HEIGHT), MAX_HEIGHT)
    ta.style.height = `${next}px`
    ta.style.overflowY = ta.scrollHeight > MAX_HEIGHT ? 'auto' : 'hidden'
  }, [draft])

  const handleSend = async () => {
    const text = draft.trim()
    if (!text || sending || disabled) return
    setSending(true)
    try {
      await onSend(text)
      setDraft('')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      textareaRef.current?.blur()
    }
  }

  const hasText = draft.trim().length > 0
  const sendBtnState = sending
    ? 'sending'
    : hasText
      ? 'ready'
      : 'idle'

  return (
    <div className="border-t border-border bg-card">
      <div className="flex items-end gap-2 p-3">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          disabled={sending || disabled}
          rows={1}
          aria-label="Escribir mensaje"
          className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary/40 transition-all duration-200 disabled:opacity-50 leading-relaxed"
          style={{ minHeight: `${MIN_HEIGHT}px`, maxHeight: `${MAX_HEIGHT}px` }}
        />
        <button
          onClick={handleSend}
          disabled={!hasText || sending || disabled}
          aria-label="Enviar mensaje"
          className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 active:scale-95 ${
            sendBtnState === 'idle'
              ? 'bg-border/40 text-muted cursor-not-allowed'
              : sendBtnState === 'ready'
                ? 'bg-primary text-white hover:bg-primary/90 hover:scale-105'
                : 'bg-primary/70 text-white cursor-wait'
          }`}
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
      <p className="px-4 pb-2 text-[10px] text-muted/80">
        Enter para enviar · Shift+Enter salto de línea · ESC para cancelar
      </p>
    </div>
  )
})
