'use client'

interface ChartTooltipProps {
  x: number
  y: number
  label: string
  items: { label: string; value: string; color?: string }[]
}

export function ChartTooltip({ x, y, label, items }: ChartTooltipProps) {
  return (
    <div
      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full mb-2 rounded-lg border border-border bg-card/95 backdrop-blur-md px-3 py-2 shadow-xl glass-card text-xs animate-fade-up"
      style={{ left: x, top: y - 8, animationDuration: '120ms' }}
    >
      <div className="text-[10px] text-muted mb-1 font-medium">{label}</div>
      <div className="space-y-0.5">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            {it.color && (
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: it.color }}
              />
            )}
            <span className="text-muted">{it.label}</span>
            <span className="ml-auto font-semibold text-foreground">{it.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
