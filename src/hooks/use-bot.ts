'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useCliente } from './use-cliente'

export interface BotServicio {
  id: string
  nombre: string
  precio: number
  duracion_min: number
  descripcion?: string
  calendar_color?: string
}

export interface Bot {
  id: string
  cliente_id: string

  // Identidad
  nombre_agente: string
  personalidad_agente: string

  // Empresa
  empresa_nombre: string
  empresa_descripcion: string
  empresa_ubicacion: string
  empresa_contacto: string

  // Multi-tenant
  numero_whatsapp_bot: string
  numero_dueno: string
  email_dueno: string | null
  meet_link: string | null
  google_calendar_id: string | null

  // Horarios
  horario_inicio: string
  horario_fin: string
  zona_horaria: string

  // Mensajes auto
  mensaje_bienvenida: string
  mensaje_fuera_horario: string

  // Servicios
  servicios_json: BotServicio[]

  // Read-only
  webhook_path: string
  activo: boolean
  nicho: string

  created_at?: string
  updated_at?: string
}

export type BotUpdate = Partial<
  Omit<Bot, 'id' | 'cliente_id' | 'created_at' | 'updated_at' | 'webhook_path' | 'activo' | 'nicho' | 'numero_whatsapp_bot' | 'google_calendar_id'>
>

const BOT_COLUMNS = [
  'id',
  'cliente_id',
  'nombre_agente',
  'personalidad_agente',
  'empresa_nombre',
  'empresa_descripcion',
  'empresa_ubicacion',
  'empresa_contacto',
  'numero_whatsapp_bot',
  'numero_dueno',
  'email_dueno',
  'meet_link',
  'google_calendar_id',
  'horario_inicio',
  'horario_fin',
  'zona_horaria',
  'mensaje_bienvenida',
  'mensaje_fuera_horario',
  'servicios_json',
  'webhook_path',
  'activo',
  'nicho',
  'created_at',
  'updated_at',
].join(',')

function normalizeBot(raw: Record<string, unknown> | null): Bot | null {
  if (!raw) return null
  const serv = raw.servicios_json
  let servicios: BotServicio[] = []
  if (Array.isArray(serv)) {
    servicios = serv as BotServicio[]
  } else if (typeof serv === 'string') {
    try {
      const parsed = JSON.parse(serv)
      if (Array.isArray(parsed)) servicios = parsed
    } catch {
      servicios = []
    }
  }
  return {
    id: String(raw.id ?? ''),
    cliente_id: String(raw.cliente_id ?? ''),
    nombre_agente: String(raw.nombre_agente ?? ''),
    personalidad_agente: String(raw.personalidad_agente ?? ''),
    empresa_nombre: String(raw.empresa_nombre ?? ''),
    empresa_descripcion: String(raw.empresa_descripcion ?? ''),
    empresa_ubicacion: String(raw.empresa_ubicacion ?? ''),
    empresa_contacto: String(raw.empresa_contacto ?? ''),
    numero_whatsapp_bot: String(raw.numero_whatsapp_bot ?? ''),
    numero_dueno: String(raw.numero_dueno ?? ''),
    email_dueno: (raw.email_dueno as string | null) ?? null,
    meet_link: (raw.meet_link as string | null) ?? null,
    google_calendar_id: (raw.google_calendar_id as string | null) ?? null,
    horario_inicio: String(raw.horario_inicio ?? '09:00'),
    horario_fin: String(raw.horario_fin ?? '18:00'),
    zona_horaria: String(raw.zona_horaria ?? 'America/Puerto_Rico'),
    mensaje_bienvenida: String(raw.mensaje_bienvenida ?? ''),
    mensaje_fuera_horario: String(raw.mensaje_fuera_horario ?? ''),
    servicios_json: servicios,
    webhook_path: String(raw.webhook_path ?? ''),
    activo: Boolean(raw.activo),
    nicho: String(raw.nicho ?? ''),
    created_at: raw.created_at as string | undefined,
    updated_at: raw.updated_at as string | undefined,
  }
}

export function useBot() {
  const { cliente, loading: clienteLoading } = useCliente()
  const [bot, setBot] = useState<Bot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBot = useCallback(async (clienteId: string) => {
    setError(null)
    const supabase = getSupabase()
    const { data, error: err } = await supabase
      .from('bots')
      .select(BOT_COLUMNS)
      .eq('cliente_id', clienteId)
      .maybeSingle()

    if (err) {
      setError(err.message)
      setBot(null)
    } else {
      setBot(normalizeBot(data as Record<string, unknown> | null))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (clienteLoading) return
    if (!cliente) {
      setLoading(false)
      return
    }
    fetchBot(cliente.id)

    // Realtime: refleja cambios externos al bot
    const supabase = getSupabase()
    const channel = supabase
      .channel(`bot-rt-${cliente.id}-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes' as never,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bots',
          filter: `cliente_id=eq.${cliente.id}`,
        },
        (payload: { new?: Record<string, unknown> }) => {
          if (payload.new) {
            const next = normalizeBot(payload.new)
            if (next) setBot(next)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [cliente, clienteLoading, fetchBot])

  const save = useCallback(
    async (updates: BotUpdate) => {
      if (!bot || !cliente) {
        throw new Error('Bot no cargado')
      }
      const supabase = getSupabase()
      const { data, error: err } = await supabase
        .from('bots')
        .update(updates)
        .eq('cliente_id', cliente.id)
        .select(BOT_COLUMNS)
        .maybeSingle()

      if (err) throw new Error(err.message)
      const next = normalizeBot(data as Record<string, unknown> | null)
      if (next) setBot(next)
      return next
    },
    [bot, cliente]
  )

  return {
    bot,
    loading: loading || clienteLoading,
    error,
    save,
    refetch: () => (cliente ? fetchBot(cliente.id) : Promise.resolve()),
  }
}
