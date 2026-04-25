import { type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  hint?: string
  cta?: { label: string; onClick: () => void }
  compact?: boolean
}

export function EmptyState({ icon: Icon, title, hint, cta, compact }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? 'py-6' : 'py-10'
      }`}
    >
      <div className="w-11 h-11 rounded-2xl bg-border/40 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-muted" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {hint && <p className="text-xs text-muted mt-1 max-w-xs">{hint}</p>}
      {cta && (
        <button
          onClick={cta.onClick}
          className="mt-4 px-3.5 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 active:scale-[0.97] transition-all"
        >
          {cta.label}
        </button>
      )}
    </div>
  )
}
