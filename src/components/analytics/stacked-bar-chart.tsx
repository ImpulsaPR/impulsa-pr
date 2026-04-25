'use client'

import { useState } from 'react'
import { ChartTooltip } from './chart-tooltip'

export interface StackedBarDatum {
  label: string
  booked: number
  cancelled: number
}

interface Props {
  data: StackedBarDatum[]
  labelBooked: string
  labelCancelled: string
}

interface Hover {
  i: number
  x: number
  y: number
}

export function StackedBarChart({ data, labelBooked, labelCancelled }: Props) {
  const [hover, setHover] = useState<Hover | null>(null)

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-muted">
        —
      </div>
    )
  }

  const max = Math.max(...data.map((d) => d.booked + d.cancelled), 1)
  const niceMax = Math.ceil(max * 1.1)
  const yTicks = [0, Math.round(niceMax / 2), niceMax]

  const handleEnter = (i: number) => (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget
    const container = btn.offsetParent as HTMLElement | null
    if (!container) return
    const x = btn.offsetLeft + btn.offsetWidth / 2
    const y = btn.offsetTop
    setHover({ i, x, y })
  }

  return (
    <div className="relative flex w-full">
      <div className="flex flex-col justify-between py-1 pr-2 text-[9px] text-muted tabular-nums">
        {[...yTicks].reverse().map((v, i) => (
          <span key={i}>{v}</span>
        ))}
      </div>

      <div className="flex-1 relative">
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {yTicks.map((_, i) => (
            <div
              key={i}
              className="border-t border-border/25"
              style={{ opacity: i === yTicks.length - 1 ? 0.6 : 0.35 }}
            />
          ))}
        </div>

        <div className="flex items-end gap-1 h-36 w-full relative">
          {data.map((d, i) => {
            const total = d.booked + d.cancelled
            const totalPct = (total / niceMax) * 100
            const bookedPct = total > 0 ? (d.booked / total) * 100 : 0
            const isHover = hover?.i === i
            return (
              <button
                type="button"
                key={i}
                onMouseEnter={handleEnter(i)}
                onMouseLeave={() => setHover(null)}
                className="flex-1 flex flex-col items-center gap-1 group/bar cursor-default relative"
              >
                <div className="w-full flex-1 flex flex-col justify-end">
                  <div
                    className={`w-full rounded-t-md overflow-hidden flex flex-col transition-all duration-300 ${
                      isHover ? 'opacity-100' : 'opacity-90'
                    }`}
                    style={{
                      height: `${totalPct}%`,
                      minHeight: total > 0 ? '4px' : '0',
                    }}
                  >
                    {d.cancelled > 0 && (
                      <div
                        className="w-full bg-accent-red/70"
                        style={{ height: `${100 - bookedPct}%` }}
                      />
                    )}
                    {d.booked > 0 && (
                      <div
                        className="w-full bg-primary"
                        style={{ height: `${bookedPct}%` }}
                      />
                    )}
                  </div>
                </div>
                <span className="text-[9px] text-muted truncate w-full text-center">
                  {d.label}
                </span>
              </button>
            )
          })}
        </div>

        {hover && data[hover.i] && (
          <ChartTooltip
            x={hover.x}
            y={hover.y}
            label={data[hover.i].label}
            items={[
              {
                label: labelBooked,
                value: String(data[hover.i].booked),
                color: 'var(--color-primary)',
              },
              {
                label: labelCancelled,
                value: String(data[hover.i].cancelled),
                color: 'var(--color-accent-red)',
              },
            ]}
          />
        )}
      </div>
    </div>
  )
}
