'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useCliente } from '@/hooks/use-cliente'
import type { Lead } from '@/lib/types'

export function useLeads() {
  const { cliente } = useCliente()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<ReturnType<ReturnType<typeof getSupabase>['channel']> | null>(null)

  const fetchLeads = useCallback(async () => {
    if (!cliente?.id) {
      setLeads([])
      setLoading(false)
      return
    }
    // Defensa en profundidad: filtra por cliente_id explícito ADEMÁS de
    // RLS. Si una migration accidentalmente debilita RLS, no exponemos
    // datos cross-tenant.
    const { data, error: err } = await getSupabase()
      .from('leads')
      .select('*')
      .eq('cliente_id', cliente.id)
      .neq('deleted', true)
      .order('fecha_ultimo_contacto', { ascending: false })

    if (err) {
      setError(err.message)
    } else {
      setLeads((data as Lead[]) || [])
    }
    setLoading(false)
  }, [cliente?.id])

  useEffect(() => {
    if (!cliente?.id) return

    fetchLeads()

    // Realtime: filtramos el canal por cliente_id para no recibir cambios
    // de otros tenants (igual defensivo, RLS también los bloquea).
    const supabase = getSupabase()
    const channelName = `leads-rt-${cliente.id}-${Math.random().toString(36).slice(2)}`
    const channel = supabase.channel(channelName)

    channel.on(
      'postgres_changes' as any,
      {
        event: '*',
        schema: 'public',
        table: 'leads',
        filter: `cliente_id=eq.${cliente.id}`,
      },
      () => { fetchLeads() }
    )

    channel.subscribe()
    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [cliente?.id, fetchLeads])

  return { leads, loading, error, refetch: fetchLeads }
}
