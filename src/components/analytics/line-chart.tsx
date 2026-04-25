'use client'

import { useRef, useState } from 'react'
import { ChartTooltip } from './chart-tooltip'

interface LineChartProps {
  data: number[]
  labels: string[]
  color?: string
  seriesLabel: string
  compareData?: number[]
  compareLabel?: string
}

export function LineChart({
  data,
  labels,
  color = 'var(--color-primary)',
  seriesLabel,
  compareData,
  compareLabel,
}: LineChartProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [hover, setHover] = useState<{ i: number; px: number; py: number } | null>(null)

  if (data.length < 2) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-muted">
        —
      </div>
    )
  }

  const hasCompare = !!compareData && compareData.length === data.length
  const max = Math.max(...data, ...(hasCompare ? compareData! : []), 1)
  const niceMax = Math.ceil(max * 1.1)
  const w = 600
  const h = 160
  const padT = 12
  const padB = 22
  const padL = 28
  const padR = 8
  const innerW = w - padL - padR
  const innerH = h - padT - padB

  const xAt = (i: number) => padL + (i / (data.length - 1)) * innerW
  const yAt = (v: number) => padT + innerH - (v / niceMax) * innerH

  const points = data.map((v, i) => `${xAt(i)},${yAt(v)}`)
  const comparePoints = hasCompare
    ? compareData!.map((v, i) => `${xAt(i)},${yAt(v)}`)
    : []
  const gradientId = `line-grad-${seriesLabel.replace(/[^a-z0-9]/gi, '')}`

  const yTicks = 3
  const tickVals: number[] = []
  for (let i = 0; i <= yTicks; i++) tickVals.push(Math.round((niceMax / yTicks) * i))

  const handleMove = (e: React.MouseEvent<SVGRectElement>) => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    const svgRect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect()
    const xInSvg = ((e.clientX - svgRect.left) / svgRect.width) * w
    const relX = Math.max(padL, Math.min(w - padR, xInSvg))
    const frac = (relX - padL) / innerW
    const i = Math.round(frac * (data.length - 1))
    const clampedI = Math.max(0, Math.min(data.length - 1, i))
    const px = ((xAt(clampedI) / w) * rect.width)
    const py = ((yAt(data[clampedI]) / h) * rect.height)
    setHover({ i: clampedI, px, py })
  }

  return (
    <div ref={wrapRef} className="relative w-full h-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {tickVals.map((v, i) => {
          const y = yAt(v)
          return (
            <g key={i}>
              <line
                x1={padL}
                x2={w - padR}
                y1={y}
                y2={y}
                stroke="var(--color-border)"
                strokeOpacity={i === 0 ? 0.6 : 0.25}
                strokeDasharray={i === 0 ? undefined : '3 3'}
              />
              <text
                x={padL - 6}
                y={y + 3}
                textAnchor="end"
                className="fill-muted"
                fontSize="9"
              >
                {v}
              </text>
            </g>
          )
        })}

        <polygon
          points={`${xAt(0)},${padT + innerH} ${points.join(' ')} ${xAt(data.length - 1)},${padT + innerH}`}
          fill={`url(#${gradientId})`}
        />
        {hasCompare && (
          <polyline
            points={comparePoints.join(' ')}
            fill="none"
            stroke="var(--color-muted)"
            strokeOpacity="0.55"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {labels.length > 0 &&
          [0, Math.floor(data.length / 2), data.length - 1].map((idx) => (
            <text
              key={idx}
              x={xAt(idx)}
              y={h - 6}
              textAnchor={idx === 0 ? 'start' : idx === data.length - 1 ? 'end' : 'middle'}
              className="fill-muted"
              fontSize="9"
            >
              {labels[idx]}
            </text>
          ))}

        {hover && (
          <>
            <line
              x1={xAt(hover.i)}
              x2={xAt(hover.i)}
              y1={padT}
              y2={padT + innerH}
              stroke={color}
              strokeOpacity="0.35"
              strokeDasharray="3 3"
            />
            <circle
              cx={xAt(hover.i)}
              cy={yAt(data[hover.i])}
              r="4"
              fill={color}
              stroke="var(--color-background)"
              strokeWidth="2"
            />
          </>
        )}

        <rect
          x={padL}
          y={padT}
          width={innerW}
          height={innerH}
          fill="transparent"
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
        />
      </svg>

      {hover && (
        <ChartTooltip
          x={hover.px}
          y={hover.py}
          label={labels[hover.i]}
          items={[
            { label: seriesLabel, value: String(data[hover.i]), color },
            ...(hasCompare
              ? [
                  {
                    label: compareLabel ?? 'Previous',
                    value: String(compareData![hover.i]),
                    color: 'var(--color-muted)',
                  },
                ]
              : []),
          ]}
        />
      )}
    </div>
  )
}
