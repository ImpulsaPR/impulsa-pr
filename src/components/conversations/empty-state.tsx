'use client'

import { MessageSquare } from 'lucide-react'

interface EmptyStateProps {
  variant: 'no-conversations' | 'no-selection' | 'no-messages'
}

export function EmptyState({ variant }: EmptyStateProps) {
  const config = {
    'no-conversations': {
      iconSize: 'w-12 h-12',
      title: 'Aún no hay conversaciones',
      subtitle:
        'Cuando recibas mensajes de WhatsApp, aparecerán aquí. Puedes compartir tu link en redes para empezar.',
    },
    'no-selection': {
      iconSize: 'w-16 h-16',
      title: 'Selecciona una conversación',
      subtitle: 'Elige un contacto de la izquierda para ver el chat completo.',
    },
    'no-messages': {
      iconSize: 'w-10 h-10',
      title: 'Aún no hay mensajes con este contacto.',
      subtitle: '',
    },
  }[variant]

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10">
      <div className="rounded-full bg-border/30 p-4 mb-4">
        <MessageSquare className={`${config.iconSize} text-muted/50`} strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-medium text-foreground">{config.title}</h3>
      {config.subtitle && (
        <p className="text-xs text-muted mt-2 max-w-xs leading-relaxed">{config.subtitle}</p>
      )}
    </div>
  )
}
