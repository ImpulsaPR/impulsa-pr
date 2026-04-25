'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { Search } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { ConversationItem } from './conversation-item'
import { EmptyState } from './empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import type { Conversation } from '@/hooks/use-conversations'

interface ConversationListProps {
  conversations: Conversation[]
  selectedPhone: string | null
  onSelect: (phone: string) => void
  search: string
  onSearchChange: (s: string) => void
  loading: boolean
  flashingPhones: Set<string>
}

export interface ConversationListHandle {
  focusSearch: () => void
}

export const ConversationList = forwardRef<ConversationListHandle, ConversationListProps>(
  function ConversationList(
    { conversations, selectedPhone, onSelect, search, onSearchChange, loading, flashingPhones },
    ref
  ) {
    const { t } = useTranslation()
    const searchRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => ({
      focusSearch: () => searchRef.current?.focus(),
    }))

    // Keyboard navigation cuando search está enfocado
    useEffect(() => {
      const input = searchRef.current
      if (!input) return
      const handler = (e: KeyboardEvent) => {
        if (document.activeElement !== input) return
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
        if (conversations.length === 0) return
        e.preventDefault()
        const currentIdx = selectedPhone
          ? conversations.findIndex((c) => c.telefono === selectedPhone)
          : -1
        let nextIdx: number
        if (e.key === 'ArrowDown') {
          nextIdx = currentIdx < 0 ? 0 : Math.min(currentIdx + 1, conversations.length - 1)
        } else {
          nextIdx = currentIdx <= 0 ? 0 : currentIdx - 1
        }
        onSelect(conversations[nextIdx].telefono)
      }
      input.addEventListener('keydown', handler)
      return () => input.removeEventListener('keydown', handler)
    }, [conversations, selectedPhone, onSelect])

    return (
      <div className="h-full flex flex-col rounded-2xl border border-border bg-card overflow-hidden theme-transition">
        {/* Search bar sticky */}
        <div className="sticky top-0 z-10 p-4 border-b border-border bg-card">
          <label
            className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 transition-all duration-200 focus-within:border-primary/40 focus-within:shadow-sm focus-within:scale-[1.01]"
          >
            <Search className="w-4 h-4 text-muted flex-shrink-0" />
            <input
              ref={searchRef}
              type="text"
              placeholder={t('conversations.search')}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-transparent text-sm text-foreground placeholder:text-muted outline-none w-full"
              aria-label="Buscar conversaciones"
            />
          </label>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto convo-scroll divide-y divide-border/40">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-4 py-3 flex items-start gap-3">
                <Skeleton className="w-11 h-11 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))
          ) : conversations.length === 0 ? (
            <EmptyState variant="no-conversations" />
          ) : (
            conversations.map((conv) => (
              <ConversationItem
                key={conv.telefono}
                conv={conv}
                isActive={selectedPhone === conv.telefono}
                isFlashing={flashingPhones.has(conv.telefono)}
                onClick={() => onSelect(conv.telefono)}
              />
            ))
          )}
        </div>
      </div>
    )
  }
)
