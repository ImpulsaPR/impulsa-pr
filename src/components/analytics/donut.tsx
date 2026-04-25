export interface DonutSlice {
  label: string
  value: number
  color: string
}

export function Donut({ slices }: { slices: DonutSlice[] }) {
  const total = slices.reduce((s, v) => s + v.value, 0)
  const size = 160
  const r = 64
  const stroke = 22
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-xs text-muted">—</div>
    )
  }

  const offsets: number[] = []
  slices.reduce((acc, s) => {
    offsets.push(acc)
    return acc + (s.value / total) * circumference
  }, 0)

  return (
    <div className="flex items-center justify-center relative">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-border/30"
          strokeWidth={stroke}
        />
        {slices.map((s, i) => {
          const len = (s.value / total) * circumference
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${circumference - len}`}
              strokeDashoffset={-offsets[i]}
              className="transition-all duration-500"
            >
              <title>{`${s.label}: ${s.value}`}</title>
            </circle>
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black tracking-tighter">{total}</span>
        <span className="text-[10px] text-muted">total</span>
      </div>
    </div>
  )
}

export const APPOINTMENT_STATUS_COLOR: Record<string, string> = {
  agendada: '#3B82F6',
  completada: 'var(--color-primary)',
  cancelada: 'var(--color-accent-red)',
  vencida: 'var(--color-muted)',
}
