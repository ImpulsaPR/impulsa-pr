'use client'

import { useEffect, useState } from 'react'
import { Calendar, CheckCircle2, Loader2, ExternalLink, Unplug } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmModal } from '@/components/ui/confirm-modal'

interface CalendarStatus {
  connected: boolean
  google_email?: string | null
  calendar_id?: string | null
  calendar_name?: string | null
  connected_at?: string | null
}

export function GoogleCalendarSection() {
  const [status, setStatus] = useState<CalendarStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { toast } = useToast()

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/calendar/status')
      const json = await res.json()
      if (res.ok) setStatus(json as CalendarStatus)
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    fetchStatus()
    // Read URL params for OAuth callback feedback
    const params = new URLSearchParams(window.location.search)
    const connected = params.get('calendar_connected')
    const err = params.get('calendar_error')
    if (connected) {
      toast('Google Calendar conectado', 'success')
      // Clean URL
      const url = new URL(window.location.href)
      url.searchParams.delete('calendar_connected')
      window.history.replaceState({}, '', url.toString())
    } else if (err) {
      const detail = params.get('detail')
      toast(`Error conectando Calendar: ${err}${detail ? ` (${detail})` : ''}`, 'error')
      const url = new URL(window.location.href)
      url.searchParams.delete('calendar_error')
      url.searchParams.delete('detail')
      window.history.replaceState({}, '', url.toString())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleConnect = () => {
    window.location.href = '/api/oauth/google/start'
  }

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      const res = await fetch('/api/calendar/disconnect', { method: 'POST' })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || 'Error desconectando')
      }
      toast('Google Calendar desconectado', 'success')
      setStatus({ connected: false })
      setConfirmOpen(false)
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Error', 'error')
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 theme-transition">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Google Calendar</h3>
            <p className="text-xs text-muted mt-0.5">
              Conecta tu Google Calendar para que el bot agende citas directamente en él.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-20 rounded-xl" />
      ) : status?.connected ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Conectado</p>
                <p className="text-xs text-muted mt-0.5 truncate">
                  Cuenta: <span className="font-mono text-foreground">{status.google_email || '?'}</span>
                </p>
                <p className="text-xs text-muted mt-0.5">
                  Calendar: {status.calendar_name || status.calendar_id}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-accent-red border border-accent-red/30 hover:bg-accent-red/10 transition-colors"
          >
            <Unplug className="w-3.5 h-3.5" />
            Desconectar
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl border border-dashed border-border p-4 text-center">
            <Calendar className="w-8 h-8 text-muted/40 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">Sin calendario conectado</p>
            <p className="text-xs text-muted mt-1">
              El bot no podrá agendar citas hasta que conectes tu Google Calendar.
            </p>
          </div>
          <button
            onClick={handleConnect}
            className="w-full sm:w-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all active:scale-[0.97]"
          >
            <ExternalLink className="w-4 h-4" />
            Conectar Google Calendar
          </button>
          <p className="text-[11px] text-muted">
            Te redirigiremos a Google para autorizar el acceso. Solo accederemos a Calendar para crear, editar y cancelar eventos en tu cuenta.
          </p>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="¿Desconectar Google Calendar?"
        message="El bot dejará de poder agendar citas hasta que vuelvas a conectar. Las citas ya creadas no se eliminan."
        confirmLabel={disconnecting ? 'Desconectando...' : 'Desconectar'}
        cancelLabel="Cancelar"
        loading={disconnecting}
        onConfirm={handleDisconnect}
        onCancel={() => !disconnecting && setConfirmOpen(false)}
      />
    </section>
  )
}
