'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[dashboard-error]', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center space-y-5 animate-fade-up">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-accent-red/12 text-accent-red flex items-center justify-center">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight">No pudimos cargar esta sección</h1>
          <p className="text-sm text-muted">
            Hubo un problema al traer los datos. Intenta de nuevo en un momento.
          </p>
          {error.digest && (
            <p className="text-[11px] text-muted/70 font-mono">ref: {error.digest}</p>
          )}
        </div>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <RotateCw className="w-4 h-4" />
            Reintentar
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted hover:text-foreground hover:border-border-hover transition-all"
          >
            <Home className="w-4 h-4" />
            Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
