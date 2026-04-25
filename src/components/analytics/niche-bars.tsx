import type { LeadsPorNicho } from '@/hooks/use-metricas'

interface NicheBarsProps {
  nichos: LeadsPorNicho[]
  labelViables: string
  onSelect?: (nicho: string) => void
}

export function NicheBars({ nichos, labelViables, onSelect }: NicheBarsProps) {
  if (nichos.length === 0) return null
  const max = Math.max(...nichos.map((n) => n.total), 1)

  return (
    <div className="space-y-4">
      {nichos.map((n) => {
        const pct = Math.round((n.total / max) * 100)
        const saturation = 0.35 + (n.total / max) * 0.55
        const isInteractive = !!onSelect
        const Tag = isInteractive ? 'button' : 'div'
        return (
          <Tag
            key={n.nicho}
            type={isInteractive ? 'button' : undefined}
            onClick={isInteractive ? () => onSelect!(n.nicho) : undefined}
            className={
              isInteractive
                ? 'w-full text-left group/niche rounded-lg -mx-1 px-1 py-0.5 hover:bg-foreground/5 transition-colors cursor-pointer'
                : undefined
            }
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-foreground capitalize">{n.nicho}</span>
              <span className="text-xs text-muted tabular-nums">
                {n.total}{' '}
                <span className="text-muted/60">
                  · {n.viables} {labelViables}
                </span>
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-border/40 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  minWidth: n.total > 0 ? '8px' : '0',
                  backgroundColor: `color-mix(in srgb, var(--color-primary) ${Math.round(
                    saturation * 100
                  )}%, transparent)`,
                }}
              />
            </div>
          </Tag>
        )
      })}
    </div>
  )
}
