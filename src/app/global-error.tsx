'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[global-error]', error)
  }, [error])

  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-accent-red/12 text-accent-red flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight">Algo se rompió</h1>
            <p className="text-sm text-muted">
              Ocurrió un error inesperado. Intenta de nuevo; si persiste, avísanos.
            </p>
            {error.digest && (
              <p className="text-[11px] text-muted/70 font-mono">ref: {error.digest}</p>
            )}
          </div>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <RotateCw className="w-4 h-4" />
            Reintentar
          </button>
        </div>
      </body>
    </html>
  )
}
