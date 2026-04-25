export interface FunnelStage {
  etapa: string
  cantidad: number
  porcentaje: number
}

interface FunnelProps {
  stages: FunnelStage[]
}

export function Funnel({ stages }: FunnelProps) {
  if (stages.length === 0) return null

  const maxCount = Math.max(...stages.map((s) => s.cantidad), 1)
  const w = 800
  const rowH = 56
  const gap = 8
  const h = stages.length * (rowH + gap) - gap
  const minWidthRatio = 0.18

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="funnel-fill" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        {stages.map((s, i) => {
          const curRatio = Math.max(s.cantidad / maxCount, minWidthRatio)
          const nextRatio =
            i < stages.length - 1
              ? Math.max(stages[i + 1].cantidad / maxCount, minWidthRatio)
              : curRatio
          const curW = curRatio * w
          const nextW = nextRatio * w
          const y = i * (rowH + gap)
          const xTop = (w - curW) / 2
          const xBot = (w - nextW) / 2
          const d = `M ${xTop} ${y}
                     L ${xTop + curW} ${y}
                     L ${xBot + nextW} ${y + rowH}
                     L ${xBot} ${y + rowH} Z`
          return (
            <g key={s.etapa}>
              <path
                d={d}
                fill="url(#funnel-fill)"
                stroke="var(--color-border)"
                strokeWidth="0.5"
                className="transition-all duration-500"
              />
              <text
                x={w / 2}
                y={y + rowH / 2 - 4}
                textAnchor="middle"
                className="fill-background font-semibold"
                fontSize="13"
              >
                {s.etapa}
              </text>
              <text
                x={w / 2}
                y={y + rowH / 2 + 13}
                textAnchor="middle"
                className="fill-background/80"
                fontSize="11"
              >
                {s.cantidad} · {s.porcentaje}%
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
