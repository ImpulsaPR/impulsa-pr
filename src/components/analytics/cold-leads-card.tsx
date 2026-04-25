'use client'

import { Snowflake, ArrowRight, Phone } from 'lucide-react'
import type { Lead } from '@/lib/types'

interface ColdLeadsCardProps {
  leads: Lead[]
  hoursThreshold: number
  labels: {
    title: string
    subtitle: string
    cta: string
    noneTitle: string
    noneHint: string
    hoursSuffix: string
  }
  onSelect?: (lead: Lead) => void
}

function hoursSince(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  return Math.floor(diff / (1000 * 60 * 60))
}

function formatPhone(phone: string) {
  const clean = phone.replace('@c.us', '').replace('@s.whatsapp.net', '')
  return clean.replace(/(\+?\d{1,3})(\d{3})(\d{3})(\d{4})$/, '$1 ($2) $3-••••')
}

export function ColdLeadsCard({
  leads,
  hoursThreshold,
  labels,
  onSelect,
}: ColdLeadsCardProps) {
  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 glass-card theme-transition">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-primary/12 text-primary flex items-center justify-center">
            <Snowflake className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold">{labels.noneTitle}</h3>
        </div>
        <p className="text-xs text-muted ml-10">{labels.noneHint}</p>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-accent-orange/30 bg-card p-5 sm:p-6 glass-card theme-transition">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent-orange opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/8 to-transparent opacity-60" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-accent-orange/15 text-accent-orange flex items-center justify-center">
              <Snowflake className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{labels.title}</h3>
              <p className="text-xs text-muted">
                {labels.subtitle.replace('{hours}', String(hoursThreshold))}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-accent-orange/15 text-accent-orange text-xs font-bold">
            {leads.length}
          </span>
        </div>

        <div className="space-y-1.5">
          {leads.slice(0, 5).map((l) => {
            const h = hoursSince(l.fecha_ultimo_contacto)
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => onSelect?.(l)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-card-hover transition-colors group text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-foreground/10 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                  {l.nombre
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{l.nombre}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3 h-3 text-muted" />
                    <span className="text-[10px] text-muted font-mono truncate">
                      {formatPhone(l.telefono)}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-accent-orange font-semibold tabular-nums flex-shrink-0">
                  {h}
                  {labels.hoursSuffix}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-foreground group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            )
          })}
        </div>

        {leads.length > 5 && (
          <p className="text-[10px] text-muted text-center mt-3">
            +{leads.length - 5} {labels.cta}
          </p>
        )}
      </div>
    </div>
  )
}
