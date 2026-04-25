'use client'

import Link from 'next/link'
import { ArrowLeft, ExternalLink, CalendarPlus, Bot, User, Loader2 } from 'lucide-react'
import { Avatar, sanitizeName } from './avatar'
import { useTranslation } from '@/lib/i18n'
import type { Conversation } from '@/hooks/use-conversations'

interface ChatHeaderProps {
  conv: Conversation
  onBack?: () => void
  onToggleAI: () => void
  toggling: boolean
}

export function ChatHeader({ conv, onBack, onToggleAI, toggling }: ChatHeaderProps) {
  const { t } = useTranslation()
  const isAI = !conv.lead?.humano_activo
  const rawName = conv.lead?.nombre || `+${conv.telefono}`
  const cleanedName = sanitizeName(rawName) || `+${conv.telefono}`

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Volver a la lista"
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-card-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
        )}
        <Avatar name={cleanedName} phone={conv.telefono} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground truncate">{cleanedName}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            {conv.lead?.tipo_negocio && (
              <span className="text-[11px] text-muted truncate">{conv.lead.tipo_negocio}</span>
            )}
            <span
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                isAI
                  ? 'bg-primary/10 text-primary'
                  : 'bg-accent-orange/10 text-accent-orange'
              }`}
            >
              <span
                className={`w-[5px] h-[5px] rounded-full ${
                  isAI ? 'bg-primary animate-pulse' : 'bg-accent-orange'
                }`}
              />
              {isAI ? t('conversations.aiManaging') : t('conversations.humanActive')}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {conv.lead?.id && (
          <Link
            href={`/leads/${conv.lead.id}`}
            aria-label="Ver lead completo"
            title="Ver lead completo"
            className="p-2 rounded-lg hover:bg-card-hover transition-colors text-muted hover:text-foreground"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        )}
        <button
          onClick={() => {
            console.log('Agendar cita rápida — telefono:', conv.telefono, 'lead:', conv.lead?.id)
          }}
          aria-label="Agendar cita rápida"
          title="Agendar cita rápida"
          className="p-2 rounded-lg hover:bg-card-hover transition-colors text-muted hover:text-foreground"
        >
          <CalendarPlus className="w-4 h-4" />
        </button>
        <button
          onClick={onToggleAI}
          disabled={toggling || !conv.lead}
          aria-label={isAI ? t('conversations.takeControl') : t('conversations.switchToAI')}
          title={isAI ? t('conversations.takeControl') : t('conversations.switchToAI')}
          className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
            isAI
              ? 'text-primary hover:bg-primary/10'
              : 'text-accent-orange hover:bg-accent-orange/10'
          }`}
        >
          {toggling ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isAI ? (
            <User className="w-4 h-4" />
          ) : (
            <Bot className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}
