'use client'

import { motion } from 'framer-motion'
import { Avatar, sanitizeName } from './avatar'
import type { Conversation } from '@/hooks/use-conversations'

const PROSPECT_ROLES = new Set(['user', 'prospecto', 'cliente'])

interface ConversationItemProps {
  conv: Conversation
  isActive: boolean
  isFlashing: boolean
  onClick: () => void
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function relativeTime(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`

  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const days = Math.round((todayOnly.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24))
  if (days === 1) return 'ayer'
  if (days >= 2 && days <= 6) return DAY_NAMES[date.getDay()]
  return date.toLocaleDateString('es', { day: '2-digit', month: '2-digit' })
}

function isUnread(conv: Conversation): boolean {
  if (!conv.lastTimestamp) return false
  const isProspectLast = PROSPECT_ROLES.has(conv.lastRol)
  if (!isProspectLast) return false
  const ageMs = Date.now() - new Date(conv.lastTimestamp).getTime()
  return ageMs < 5 * 60 * 1000 // <5min
}

export function ConversationItem({ conv, isActive, isFlashing, onClick }: ConversationItemProps) {
  const isAI = !conv.lead?.humano_activo
  const rawName = conv.lead?.nombre || `+${conv.telefono}`
  const cleanedName = sanitizeName(rawName) || `+${conv.telefono}`
  const unread = isUnread(conv)
  const previewText = conv.lastMessage?.trim() || ''
  const isEmptyPreview = !previewText

  return (
    <motion.div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Conversación con ${cleanedName}`}
      animate={
        isFlashing
          ? {
              backgroundColor: [
                'rgba(5, 150, 105, 0)',
                'rgba(5, 150, 105, 0.18)',
                'rgba(5, 150, 105, 0)',
              ],
            }
          : {}
      }
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`relative px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-card-hover hover:scale-[1.005] ${
        isActive ? 'bg-card-hover' : ''
      }`}
    >
      {isActive && (
        <span
          className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-r-full"
          aria-hidden="true"
        />
      )}
      <div className="flex items-start gap-3">
        <Avatar name={cleanedName} phone={conv.telefono} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-sm truncate text-foreground ${
                unread ? 'font-semibold' : 'font-normal'
              }`}
            >
              {cleanedName}
            </span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span
                className={`w-[6px] h-[6px] rounded-full ${
                  isAI ? 'bg-primary animate-pulse' : 'bg-accent-orange'
                }`}
                aria-label={isAI ? 'AI activo' : 'Humano activo'}
              />
              <span className="text-[10px] text-muted whitespace-nowrap">
                {relativeTime(conv.lastTimestamp)}
              </span>
            </div>
          </div>
          <p
            className={`text-xs text-muted mt-0.5 leading-snug ${
              isEmptyPreview ? 'italic' : ''
            }`}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {isEmptyPreview ? '(sin texto)' : previewText}
          </p>
          <div className="flex items-center justify-end mt-1">
            <span className="text-[10px] text-muted/70 px-1.5 py-0.5 rounded-md bg-border/30">
              {conv.messageCount} msg
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
