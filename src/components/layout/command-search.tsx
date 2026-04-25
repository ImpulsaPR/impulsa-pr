'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Search, X, Users, MessageSquare, ArrowRight } from 'lucide-react'
import { useLeads } from '@/hooks/use-leads'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/i18n'

interface CommandSearchProps {
  open: boolean
  onClose: () => void
}

export function CommandSearch({ open, onClose }: CommandSearchProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { leads } = useLeads()
  const router = useRouter()
  const { t } = useTranslation()

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return leads
      .filter(
        (l) =>
          l.nombre.toLowerCase().includes(q) ||
          l.telefono.includes(q) ||
          (l.tipo_negocio || '').toLowerCase().includes(q)
      )
      .slice(0, 8)
  }, [query, leads])

  const navigate = (leadId: string, page: string) => {
    onClose()
    router.push(page)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh]">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg mx-4 rounded-2xl border border-border bg-card shadow-2xl animate-scale-in overflow-hidden theme-transition">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-5 h-5 text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('topbar.search')}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted">
            ESC
          </kbd>
          <button onClick={onClose} className="text-muted hover:text-foreground sm:hidden">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {query.trim() && results.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted">{t('search.noResults')}</p>
            </div>
          )}
          {results.map((lead) => {
            const initials = lead.nombre
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()
            const phone = lead.telefono.replace('@c.us', '').replace('@s.whatsapp.net', '')

            return (
              <div key={lead.id} className="px-3 py-1.5">
                <div className="rounded-xl hover:bg-card-hover transition-colors">
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <div className="w-8 h-8 rounded-lg bg-border/40 flex items-center justify-center text-[11px] font-bold text-foreground flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{lead.nombre}</p>
                      <p className="text-[10px] text-muted truncate">
                        {phone} · {lead.tipo_negocio || lead.estado}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => navigate(lead.id, '/leads')}
                        className="p-1.5 rounded-lg hover:bg-border/40 text-muted hover:text-foreground transition-colors"
                        title={t('nav.leads')}
                      >
                        <Users className="w-3.5 h-3.5" />
                      </button>
                      {lead.historial_mensajes?.length > 0 && (
                        <button
                          onClick={() => navigate(lead.id, '/conversations')}
                          className="p-1.5 rounded-lg hover:bg-border/40 text-muted hover:text-foreground transition-colors"
                          title={t('nav.conversations')}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => navigate(lead.id, '/pipeline')}
                        className="p-1.5 rounded-lg hover:bg-border/40 text-muted hover:text-foreground transition-colors"
                        title={t('nav.pipeline')}
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer hint */}
        {!query.trim() && (
          <div className="px-4 py-3 border-t border-border/50">
            <p className="text-[10px] text-muted text-center">{t('search.hint')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
