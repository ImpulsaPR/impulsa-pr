import { Sparkles } from 'lucide-react'

interface ExecutiveSummaryProps {
  headline: string
  body: string
}

export function ExecutiveSummary({ headline, body }: ExecutiveSummaryProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/8 via-card to-card p-5 sm:p-6 glass-card animate-fade-up">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-primary/60 to-transparent opacity-60" />
      <div className="flex items-start gap-3 relative z-10">
        <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{headline}</p>
          <p className="text-xs text-muted mt-1 leading-relaxed">{body}</p>
        </div>
      </div>
    </div>
  )
}
