'use client'

import { useState } from 'react'
import { ChartTooltip } from './chart-tooltip'
import type { ActividadHora } from '@/hooks/use-metricas'

interface Props {
  data: ActividadHora[]
  labels: {
    bot: string
    clients: string
    peakHour: string
    hourSuffix: string
  }
}

interface Hover {
  i: number
  x: number
  y: number
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

function formatHour(h: number) {
  return `${String(h).padStart(2, '0')}:00`
}

export function HourlyActivityChart({ data, labels }: Props) {
  const [hover, setHover] = useState<Hover | null>(null)

  const byHour = new Map(data.map((r) => [r.hora, r]))
  const full = HOURS.map(
    (h) =>
      byHour.get(h) ?? { hora: h, msgs_bot: 0, msgs_clientes: 0, total_mensajes: 0 }
  )

  const max = Math.max(...full.map((d) => d.total_mensajes), 1)
  const niceMax = Math.ceil(max * 1.1)
  const yTicks = [0, Math.round(niceMax / 2), niceMax]

  const peak = full.reduce((p, c) => (c.total_mensajes > p.total_mensajes ? c : p), full[0])

  const handleEnter = (i: number) => (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget
    const x = btn.offsetLeft + btn.offsetWidth / 2
    const y = btn.offsetTop
    setHover({ i, x, y })
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 text-[10px]">
        <div className="flex items-center gap-3 text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            {labels.bot}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500/70" />
            {labels.clients}
          </span>
        </div>
        {peak.total_mensajes > 0 && (
          <span className="text-muted">
            {labels.peakHour}:{' '}
            <span className="text-foreground font-semibold">
              {formatHour(peak.hora)}
              {labels.hourSuffix}
            </span>
          </span>
        )}
      </div>

      <div className="relative flex w-full">
        <div className="flex flex-col justify-between py-1 pr-2 text-[9px] text-muted tabular-nums h-36">
          {[...yTicks].reverse().map((v, i) => (
            <span key={i}>{v}</span>
          ))}
        </div>

        <div className="flex-1 relative">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none h-36">
            {yTicks.map((_, i) => (
              <div
                key={i}
                className="border-t border-border/25"
                style={{ opacity: i === yTicks.length - 1 ? 0.6 : 0.35 }}
              />
            ))}
          </div>

          <div className="flex items-end gap-[2px] h-36 w-full relative">
            {full.map((d, i) => {
              const total = d.total_mensajes
              const totalPct = (total / niceMax) * 100
              const botPct = total > 0 ? (d.msgs_bot / total) * 100 : 0
              const isHover = hover?.i === i
              return (
                <button
                  type="button"
                  key={i}
                  onMouseEnter={handleEnter(i)}
                  onMouseLeave={() => setHover(null)}
                  className="flex-1 flex flex-col items-center cursor-default relative group/bar"
                >
                  <div className="w-full flex-1 flex flex-col justify-end">
                    <div
                      className={`w-full rounded-t overflow-hidden flex flex-col transition-all duration-300 ${
                        isHover ? 'opacity-100' : 'opacity-90'
                      }`}
                      style={{
                        height: `${totalPct}%`,
                        minHeight: total > 0 ? '2px' : '0',
                      }}
                    >
                      {d.msgs_clientes > 0 && (
                        <div
                          className="w-full bg-blue-500/70"
                          style={{ height: `${100 - botPct}%` }}
                        />
                      )}
                      {d.msgs_bot > 0 && (
                        <div
                          className="w-full bg-primary"
                          style={{ height: `${botPct}%` }}
                        />
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="flex justify-between text-[9px] text-muted tabular-nums mt-1 px-0.5">
            <span>00</span>
            <span>06</span>
            <span>12</span>
            <span>18</span>
            <span>23</span>
          </div>

          {hover && full[hover.i] && (
            <ChartTooltip
              x={hover.x}
              y={hover.y}
              label={formatHour(full[hover.i].hora)}
              items={[
                {
                  label: labels.bot,
                  value: String(full[hover.i].msgs_bot),
                  color: 'var(--color-primary)',
                },
                {
                  label: labels.clients,
                  value: String(full[hover.i].msgs_clientes),
                  color: '#3B82F6',
                },
              ]}
            />
          )}
        </div>
      </div>
    </div>
  )
}
