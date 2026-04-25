'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Building2,
  Mail,
  MapPin,
  Globe,
  Users,
  Calendar,
  Tag,
  TrendingUp,
  FileText,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'
import type { Lead } from '@/lib/types'

interface CitaRow {
  id: string
  titulo: string | null
  fecha: string | null
  estado: string | null
  cancelada: boolean | null
}

interface LeadContextSidebarProps {
  lead: Lead | null
  phone: string
  open: boolean
  onClose: () => void
}

const ETAPAS = {
  nuevo: { label: 'Nuevo', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  contactado: { label: 'Contactado', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  interesado: { label: 'Interesado', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  cerrado: { label: 'Cerrado', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
} as const

const NIVEL = {
  alto: { label: 'Alto', color: 'text-emerald-500' },
  medio: { label: 'Medio', color: 'text-amber-500' },
  bajo: { label: 'Bajo', color: 'text-muted' },
} as const

export function LeadContextSidebar({ lead, phone, open, onClose }: LeadContextSidebarProps) {
  const [citas, setCitas] = useState<CitaRow[]>([])
  const [loadingCitas, setLoadingCitas] = useState(false)

  useEffect(() => {
    if (!open || !phone) return
    let cancelled = false
    setLoadingCitas(true)
    getSupabase()
      .from('citas')
      .select('id,titulo,fecha,estado,cancelada')
      .eq('telefono_cliente', phone)
      .eq('cancelada', false)
      .order('fecha', { ascending: true })
      .limit(5)
      .then(({ data }: { data: CitaRow[] | null }) => {
        if (cancelled) return
        setCitas((data as CitaRow[]) || [])
        setLoadingCitas(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, phone])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            aria-hidden="true"
          />
          <motion.aside
            key="sidebar"
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.3 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-card border-l border-border z-50 shadow-2xl flex flex-col overflow-hidden"
            role="dialog"
            aria-label="Contexto del lead"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
              <div>
                <p className="text-xs text-muted">Contexto del lead</p>
                <h2 className="text-lg font-semibold tracking-tight truncate">
                  {lead?.nombre || `+${phone}`}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-card-hover text-muted hover:text-foreground transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto convo-scroll p-5 space-y-5">
              {!lead ? (
                <div className="rounded-xl border border-dashed border-border p-6 text-center">
                  <Users className="w-8 h-8 text-muted/40 mx-auto mb-2" />
                  <p className="text-sm font-medium">Sin lead asociado</p>
                  <p className="text-xs text-muted mt-1">
                    Este número aún no tiene un perfil completo en tu pipeline.
                  </p>
                </div>
              ) : (
                <>
                  {/* Status row */}
                  <div className="flex items-center flex-wrap gap-2">
                    {lead.estado && ETAPAS[lead.estado as keyof typeof ETAPAS] && (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium border ${
                          ETAPAS[lead.estado as keyof typeof ETAPAS].color
                        }`}
                      >
                        {ETAPAS[lead.estado as keyof typeof ETAPAS].label}
                      </span>
                    )}
                    {lead.nivel_interes && NIVEL[lead.nivel_interes as keyof typeof NIVEL] && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-background border border-border">
                        <TrendingUp
                          className={`w-3 h-3 ${
                            NIVEL[lead.nivel_interes as keyof typeof NIVEL].color
                          }`}
                        />
                        Interés{' '}
                        <span className={NIVEL[lead.nivel_interes as keyof typeof NIVEL].color}>
                          {NIVEL[lead.nivel_interes as keyof typeof NIVEL].label}
                        </span>
                      </span>
                    )}
                    {lead.humano_activo && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-accent-orange/10 text-accent-orange border border-accent-orange/20">
                        Takeover activo
                      </span>
                    )}
                  </div>

                  {/* Negocio */}
                  <Section icon={<Building2 className="w-4 h-4" />} title="Negocio">
                    <Field label="Tipo" value={lead.tipo_negocio} />
                    {/* @ts-expect-error nombre_negocio not in current types but might be in DB */}
                    <Field label="Empresa" value={lead.nombre_negocio} />
                    <Field label="Necesidad" value={lead.necesidad} multiline />
                    <Field label="Empleados" value={lead.num_empleados} />
                  </Section>

                  {/* Contacto */}
                  <Section icon={<Mail className="w-4 h-4" />} title="Contacto">
                    <Field label="Teléfono" value={`+${lead.telefono}`} mono />
                    <Field label="Email" value={lead.email} mono />
                    <Field
                      label="Sitio web"
                      value={lead.sitio_web}
                      href={
                        lead.sitio_web
                          ? lead.sitio_web.startsWith('http')
                            ? lead.sitio_web
                            : `https://${lead.sitio_web}`
                          : undefined
                      }
                    />
                    <Field label="Ubicación" value={lead.ubicacion} />
                  </Section>

                  {/* Citas próximas */}
                  <Section icon={<Calendar className="w-4 h-4" />} title="Citas próximas">
                    {loadingCitas ? (
                      <p className="text-xs text-muted italic">Cargando...</p>
                    ) : citas.length === 0 ? (
                      <p className="text-xs text-muted italic">Sin citas activas</p>
                    ) : (
                      <ul className="space-y-2">
                        {citas.map((c) => (
                          <li
                            key={c.id}
                            className="text-xs rounded-lg bg-background border border-border px-3 py-2"
                          >
                            <p className="font-medium text-foreground">{c.titulo || 'Cita'}</p>
                            <p className="text-muted mt-0.5">{formatCitaDate(c.fecha)}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Section>

                  {/* Tags */}
                  {lead.tags && (
                    <Section icon={<Tag className="w-4 h-4" />} title="Tags">
                      <div className="flex flex-wrap gap-1.5">
                        {(typeof lead.tags === 'string' ? lead.tags.split(',') : lead.tags).map(
                          (tag: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-background border border-border text-[10px] text-muted"
                            >
                              {tag.trim()}
                            </span>
                          )
                        )}
                      </div>
                    </Section>
                  )}

                  {/* Notas */}
                  {(lead.notas_negocio || lead.notas_ia) && (
                    <Section icon={<FileText className="w-4 h-4" />} title="Notas">
                      {lead.notas_negocio && (
                        <Field label="Negocio" value={lead.notas_negocio} multiline />
                      )}
                      {lead.notas_ia && <Field label="IA" value={lead.notas_ia} multiline />}
                    </Section>
                  )}

                  {/* Valor */}
                  {(lead.valor_estimado > 0 || lead.valor_real > 0) && (
                    <Section icon={<TrendingUp className="w-4 h-4" />} title="Valor">
                      {lead.valor_estimado > 0 && (
                        <Field
                          label="Estimado"
                          value={`$${lead.valor_estimado.toLocaleString()}`}
                          mono
                        />
                      )}
                      {lead.valor_real > 0 && (
                        <Field label="Real" value={`$${lead.valor_real.toLocaleString()}`} mono />
                      )}
                    </Section>
                  )}
                </>
              )}
            </div>

            {/* Footer link */}
            {lead && (
              <div className="border-t border-border p-4 flex-shrink-0">
                <Link
                  href={`/leads`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-sm font-medium text-foreground transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Ver perfil completo
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-muted">{icon}</span>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</h3>
      </div>
      <div className="space-y-1.5">{children}</div>
    </section>
  )
}

function Field({
  label,
  value,
  mono = false,
  multiline = false,
  href,
}: {
  label: string
  value?: string | number | null
  mono?: boolean
  multiline?: boolean
  href?: string
}) {
  if (!value || value === '') return null
  const v = String(value)
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="text-muted w-20 flex-shrink-0 pt-0.5">{label}</span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-foreground hover:text-primary transition-colors break-all flex-1 ${mono ? 'font-mono' : ''}`}
        >
          {v}
        </a>
      ) : (
        <span
          className={`text-foreground flex-1 ${mono ? 'font-mono' : ''} ${multiline ? 'whitespace-pre-wrap' : ''}`}
        >
          {v}
        </span>
      )}
    </div>
  )
}

function formatCitaDate(iso: string | null): string {
  if (!iso) return '-'
  try {
    const d = new Date(iso)
    return d.toLocaleString('es', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return iso
  }
}
