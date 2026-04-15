'use client'

import { useTranslation } from '@/lib/i18n'
import type { LeadEstado, NivelInteres } from '@/lib/types'

const estadoConfig: Record<LeadEstado, { labelKey: string; color: string; dot: string }> = {
  nuevo: {
    labelKey: 'status.nuevo',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dot: 'bg-blue-400',
  },
  contactado: {
    labelKey: 'status.contactado',
    color: 'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20',
    dot: 'bg-accent-yellow',
  },
  interesado: {
    labelKey: 'status.interesado',
    color: 'bg-accent-orange/10 text-accent-orange border-accent-orange/20',
    dot: 'bg-accent-orange animate-pulse-glow',
  },
  cerrado: {
    labelKey: 'status.cerrado',
    color: 'bg-primary/15 text-primary border-primary/30',
    dot: 'bg-primary animate-pulse-glow',
  },
}

export function StatusBadge({ status }: { status: LeadEstado }) {
  const config = estadoConfig[status] || estadoConfig.nuevo
  const { t } = useTranslation()

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {t(config.labelKey as any)}
    </span>
  )
}

const interesConfig: Record<NivelInteres, { labelKey: string; color: string }> = {
  alto: { labelKey: 'interest.alto', color: 'bg-primary/10 text-primary border-primary/20' },
  medio: { labelKey: 'interest.medio', color: 'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20' },
  bajo: { labelKey: 'interest.bajo', color: 'bg-muted/10 text-muted border-muted/20' },
}

export function InteresBadge({ nivel }: { nivel: NivelInteres }) {
  const config = interesConfig[nivel] || interesConfig.bajo
  const { t } = useTranslation()

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${config.color}`}
    >
      {t(config.labelKey as any)}
    </span>
  )
}
