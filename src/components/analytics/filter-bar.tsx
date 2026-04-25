'use client'

import { useMemo } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import type { Lead, NivelInteres } from '@/lib/types'

export interface LeadFilters {
  tipo_negocio: string | null
  origen: string | null
  nivel_interes: NivelInteres | null
}

interface Props {
  leads: Lead[]
  filters: LeadFilters
  onChange: (next: LeadFilters) => void
  labels: {
    title: string
    allBusinesses: string
    allSources: string
    allLevels: string
    levelHigh: string
    levelMedium: string
    levelLow: string
    clear: string
    filteredCount: string
  }
}

function uniqueValues(
  leads: Lead[],
  key: 'tipo_negocio' | 'origen'
): string[] {
  const set = new Set<string>()
  for (const l of leads) {
    const v = l[key]
    if (v && v.trim()) set.add(v.trim())
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}

export function FilterBar({ leads, filters, onChange, labels }: Props) {
  const businesses = useMemo(() => uniqueValues(leads, 'tipo_negocio'), [leads])
  const sources = useMemo(() => uniqueValues(leads, 'origen'), [leads])

  const hasActive =
    filters.tipo_negocio || filters.origen || filters.nivel_interes

  const clear = () =>
    onChange({ tipo_negocio: null, origen: null, nivel_interes: null })

  const filteredCount = useMemo(() => {
    return leads.filter((l) => {
      if (filters.tipo_negocio && l.tipo_negocio !== filters.tipo_negocio) return false
      if (filters.origen && l.origen !== filters.origen) return false
      if (filters.nivel_interes && l.nivel_interes !== filters.nivel_interes) return false
      return true
    }).length
  }, [leads, filters])

  return (
    <div className="rounded-2xl border border-border bg-card p-3 flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-2 text-xs text-muted px-2">
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span className="font-medium">{labels.title}</span>
      </div>

      <select
        value={filters.tipo_negocio ?? ''}
        onChange={(e) =>
          onChange({ ...filters, tipo_negocio: e.target.value || null })
        }
        className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-border-hover"
      >
        <option value="">{labels.allBusinesses}</option>
        {businesses.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>

      <select
        value={filters.origen ?? ''}
        onChange={(e) =>
          onChange({ ...filters, origen: e.target.value || null })
        }
        className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-border-hover"
      >
        <option value="">{labels.allSources}</option>
        {sources.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        value={filters.nivel_interes ?? ''}
        onChange={(e) =>
          onChange({
            ...filters,
            nivel_interes: (e.target.value || null) as NivelInteres | null,
          })
        }
        className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-border-hover"
      >
        <option value="">{labels.allLevels}</option>
        <option value="alto">{labels.levelHigh}</option>
        <option value="medio">{labels.levelMedium}</option>
        <option value="bajo">{labels.levelLow}</option>
      </select>

      {hasActive && (
        <>
          <span className="text-[11px] text-muted tabular-nums ml-auto">
            {filteredCount} {labels.filteredCount}
          </span>
          <button
            type="button"
            onClick={clear}
            className="flex items-center gap-1 text-[11px] text-muted hover:text-foreground px-2 py-1 rounded-lg hover:bg-card-hover transition-colors"
          >
            <X className="w-3 h-3" />
            {labels.clear}
          </button>
        </>
      )}
    </div>
  )
}
