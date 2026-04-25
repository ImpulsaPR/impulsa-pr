'use client'

import { motion } from 'framer-motion'
import { Bot, User } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import type { ChatMessage } from '@/hooks/use-conversations'

const PROSPECT_ROLES = new Set(['user', 'prospecto', 'cliente'])
const BOT_ROLES = new Set(['assistant', 'bot', 'ai'])

interface MessageBubbleProps {
  msg: ChatMessage
  animate?: boolean
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export function MessageBubble({ msg, animate = false }: MessageBubbleProps) {
  const { t } = useTranslation()
  const isProspect = PROSPECT_ROLES.has(msg.rol)
  const isBot = BOT_ROLES.has(msg.rol)
  const isHuman = !isProspect && !isBot

  const text = msg.mensaje?.trim() || ''
  const isEmpty = !text

  const bubbleClass = isProspect
    ? 'rounded-tl-sm bg-border/30 text-foreground'
    : isBot
      ? 'rounded-tr-sm bg-primary/10 border border-primary/20 text-foreground'
      : 'rounded-tr-sm bg-accent-orange/10 border border-accent-orange/20 text-foreground'

  const Wrapper = animate ? motion.div : 'div'
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.2, ease: 'easeOut' as const },
      }
    : {}

  return (
    <Wrapper
      className={`flex ${isProspect ? 'justify-start' : 'justify-end'}`}
      {...motionProps}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${bubbleClass}`}
        role="article"
      >
        {!isProspect && (
          <div className="flex items-center gap-1 mb-1">
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
              {isBot ? t('general.ai') : isHuman ? t('general.human') : t('general.human')}
            </span>
          </div>
        )}
        {isEmpty ? (
          <p className="text-sm italic text-muted">(sin texto)</p>
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{text}</p>
        )}
        <span className="block text-[10px] text-muted/80 mt-1 text-right">
          {formatTime(msg.created_at)}
        </span>
      </div>
    </Wrapper>
  )
}
