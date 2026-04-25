'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useCliente } from './use-cliente'

export interface Notificacion {
  id: string
  cliente_id: string | null
  mensaje: string | null
  leido: boolean
  created_at: string
}

const MAX_ITEMS = 50

export function useNotifications() {
  const { cliente, loading: clienteLoading } = useCliente()
  const [items, setItems] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pendingRef = useRef<Set<string>>(new Set())

  const fetchAll = useCallback(async (clienteId: string) => {
    const supabase = getSupabase()
    const { data, error: err } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false })
      .limit(MAX_ITEMS)
    if (err) {
      setError(err.message)
      return
    }
    const rows = ((data || []) as Array<{
      id: string
      cliente_id: string | null
      mensaje: string | null
      leido: boolean | null
      created_at: string | null
    }>).map(
      (r): Notificacion => ({
        id: r.id,
        cliente_id: r.cliente_id,
        mensaje: r.mensaje,
        leido: !!r.leido,
        created_at: r.created_at ?? new Date().toISOString(),
      })
    )
    setItems(rows)
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
    const channelName = `notifs-${cliente.id}-${Math.random().toString(36).slice(2)}`
    const channel = supabase.channel(channelName)

    channel.on(
      'postgres_changes' as never,
      {
        event: '*',
        schema: 'public',
        table: 'notificaciones',
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

  const markAsRead = useCallback(async (id: string) => {
    if (pendingRef.current.has(id)) return
    pendingRef.current.add(id)
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leido: true } : n))
    )
    const supabase = getSupabase()
    const { error: err } = await supabase
      .from('notificaciones')
      .update({ leido: true })
      .eq('id', id)
    pendingRef.current.delete(id)
    if (err) setError(err.message)
  }, [])

  const markAllAsRead = useCallback(async () => {
    if (!cliente) return
    const unreadIds = items.filter((n) => !n.leido).map((n) => n.id)
    if (unreadIds.length === 0) return
    setItems((prev) => prev.map((n) => ({ ...n, leido: true })))
    const supabase = getSupabase()
    const { error: err } = await supabase
      .from('notificaciones')
      .update({ leido: true })
      .in('id', unreadIds)
    if (err) setError(err.message)
  }, [cliente, items])

  const unreadCount = items.reduce((s, n) => s + (n.leido ? 0 : 1), 0)

  return { items, unreadCount, loading, error, markAsRead, markAllAsRead }
}
