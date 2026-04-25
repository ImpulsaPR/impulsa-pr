'use client'

import { useState } from 'react'
import { Target, TrendingUp, Pencil, Check, X } from 'lucide-react'

interface Props {
  storageKey: string
  defaultGoal: number
  currentValue: number
  daysElapsed: number
  daysInMonth: number
  icon?: typeof Target
  labels: {
    title: string
    subtitle: string
    forecast: string
    onTrack: string
    behind: string
    ahead: string
    goal: string
    edit: string
    save: string
    cancel: string
  }
}

function Ring({ pct, color }: { pct: number; color: string }) {
  const size = 84
  const stroke = 8
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = (Math.min(pct, 100) / 100) * c
  return (
    <svg width={size} height={size} className="-rotate-90 flex-shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-border/30"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        className="transition-all duration-700"
      />
    </svg>
  )
}

export function GoalCard({
  storageKey,
  defaultGoal,
  currentValue,
  daysElapsed,
  daysInMonth,
  icon: Icon = Target,
  labels,
}: Props) {
  const [goal, setGoal] = useState<number>(() => {
    if (typeof window === 'undefined') return defaultGoal
    const saved = localStorage.getItem(storageKey)
    const n = saved ? Number(saved) : NaN
    return !Number.isNaN(n) && n > 0 ? n : defaultGoal
  })
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(() => String(goal))

  const pct = goal > 0 ? (currentValue / goal) * 100 : 0
  const forecast =
    daysElapsed > 0 ? Math.round((currentValue / daysElapsed) * daysInMonth) : 0
  const forecastPct = goal > 0 ? (forecast / goal) * 100 : 0

  const expectedPct = (daysElapsed / daysInMonth) * 100
  const delta = pct - expectedPct
  const status = delta > 5 ? 'ahead' : delta < -5 ? 'behind' : 'onTrack'
  const statusColor =
    status === 'ahead'
      ? 'text-primary bg-primary/10'
      : status === 'behind'
        ? 'text-accent-red bg-accent-red/10'
        : 'text-blue-400 bg-blue-400/10'
  const statusLabel =
    status === 'ahead' ? labels.ahead : status === 'behind' ? labels.behind : labels.onTrack

  const ringColor =
    status === 'ahead'
      ? 'var(--color-primary)'
      : status === 'behind'
        ? 'var(--color-accent-red)'
        : '#3B82F6'

  const saveGoal = () => {
    const n = Number(draft)
    if (!Number.isNaN(n) && n > 0) {
      setGoal(n)
      localStorage.setItem(storageKey, String(n))
    }
    setEditing(false)
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 theme-transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/12 text-primary flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{labels.title}</h3>
            <p className="text-[10px] text-muted">{labels.subtitle}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${statusColor}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Ring pct={pct} color={ringColor} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black tracking-tighter tabular-nums">
              {currentValue}
            </span>
            <span className="text-xs text-muted">/</span>
            {editing ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-14 bg-background border border-border rounded-md px-1.5 py-0.5 text-sm focus:outline-none focus:border-border-hover"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveGoal()
                    if (e.key === 'Escape') {
                      setDraft(String(goal))
                      setEditing(false)
                    }
                  }}
                />
                <button
                  onClick={saveGoal}
                  className="text-primary hover:bg-primary/10 rounded p-1"
                  type="button"
                  aria-label={labels.save}
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => {
                    setDraft(String(goal))
                    setEditing(false)
                  }}
                  type="button"
                  aria-label={labels.cancel}
                  className="text-muted hover:text-foreground rounded p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setDraft(String(goal))
                  setEditing(true)
                }}
                className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
                aria-label={labels.edit}
              >
                <span className="tabular-nums">{goal}</span>
                <Pencil className="w-3 h-3 opacity-60" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-muted mt-0.5">
            {pct.toFixed(0)}% {labels.goal}
          </p>
          <div className="flex items-center gap-1 mt-2 text-[10px]">
            <TrendingUp className="w-3 h-3 text-muted" />
            <span className="text-muted">
              {labels.forecast}:{' '}
              <span className="text-foreground font-semibold tabular-nums">
                {forecast}
              </span>{' '}
              ({forecastPct.toFixed(0)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
