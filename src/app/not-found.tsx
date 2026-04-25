import Link from 'next/link'
import { Compass, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center space-y-5 animate-fade-up">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/12 text-primary flex items-center justify-center">
          <Compass className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <div className="text-5xl font-black tracking-tighter text-foreground">404</div>
          <h1 className="text-lg font-bold tracking-tight">Esta ruta no existe</h1>
          <p className="text-sm text-muted">
            La página que buscas no está aquí. Revisa el link o vuelve al dashboard.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <Home className="w-4 h-4" />
          Volver al dashboard
        </Link>
      </div>
    </div>
  )
}
