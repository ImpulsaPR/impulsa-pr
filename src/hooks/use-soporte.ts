'use client'

import { useCallback, useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useCliente } from './use-cliente'

export type SoportePrioridad = 'baja' | 'normal' | 'alta' | 'urgente'
export type SoporteEstado = 'abierto' | 'en_progreso' | 'resuelto' | 'cerrado'
export type SoporteAutor = 'cliente' | 'soporte'

export interface SoporteMensaje {
  id: string
  cliente_id: string
  autor: SoporteAutor
  asunto: string | null
  mensaje: string
  prioridad: SoportePrioridad
  estado: SoporteEstado
  leido_por_cliente: boolean
  created_at: string
  updated_at: string
}

export interface NewSoporteMensaje {
  asunto?: string | null
  mensaje: string
  prioridad?: SoportePrioridad
}

export function useSoporte() {
  const { cliente, loading: clienteLoading } = useCliente()
  const [items, setItems] = useState<SoporteMensaje[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const fetchAll = useCallback(async (clienteId: string) => {
    const supabase = getSupabase()
    const { data, error: err } = await supabase
      .from('soporte_mensajes')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: true })
      .limit(200)
    if (err) {
      setError(err.message)
      return
    }
    setItems(
      ((data || []) as unknown as SoporteMensaje[]).map((r) => ({
        ...r,
        asunto: r.asunto ?? null,
      }))
    )
    setError(null)
  }, [])

  useEffect(() => {
    if (clienteLoading || !cliente) return
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)

    fetchAll(cliente.id).finally(() => {
      if (!cancelled) setLoading(false)
    })

    const supabase = getSupabase()
    const channelName = `soporte-${cliente.id}-${Math.random().toString(36).slice(2)}`
    const channel = supabase.channel(channelName)

    channel.on(
      'postgres_changes' as never,
      {
        event: '*',
        schema: 'public',
        table: 'soporte_mensajes',
        filter: `cliente_id=eq.${cliente.id}`,
      },
      () => {
        if (!cancelled) fetchAll(cliente.id)
      }
    )

    channel.subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [cliente, clienteLoading, fetchAll])

  const sendMessage = useCallback(
    async (payload: NewSoporteMensaje) => {
      if (!cliente) return { error: 'no-cliente' as const }
      setSending(true)
      const supabase = getSupabase()
      const { error: err } = await supabase.from('soporte_mensajes').insert({
        cliente_id: cliente.id,
        autor: 'cliente',
        asunto: payload.asunto ?? null,
        mensaje: payload.mensaje.trim(),
        prioridad: payload.prioridad ?? 'normal',
      })
      setSending(false)
      if (err) {
        setError(err.message)
        return { error: err.message }
      }
      await fetchAll(cliente.id)
      return { error: null }
    },
    [cliente, fetchAll]
  )

  const markAllRead = useCallback(async () => {
    if (!cliente) return
    const unread = items.filter(
      (m) => m.autor === 'soporte' && !m.leido_por_cliente
    )
    if (unread.length === 0) return
    setItems((prev) =>
      prev.map((m) =>
        m.autor === 'soporte' ? { ...m, leido_por_cliente: true } : m
      )
    )
    const supabase = getSupabase()
    await supabase
      .from('soporte_mensajes')
      .update({ leido_por_cliente: true })
      .in('id', unread.map((m) => m.id))
  }, [cliente, items])

  const unreadFromSupport = items.reduce(
    (s, m) => s + (m.autor === 'soporte' && !m.leido_por_cliente ? 1 : 0),
    0
  )

  return {
    items,
    loading,
    error,
    sending,
    unreadFromSupport,
    sendMessage,
    markAllRead,
  }
}
