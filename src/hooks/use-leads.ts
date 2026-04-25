'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { getSupabase } from '@/lib/supabase'
import type { Lead } from '@/lib/types'

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<ReturnType<ReturnType<typeof getSupabase>['channel']> | null>(null)

  const fetchLeads = useCallback(async () => {
    const { data, error: err } = await getSupabase()
      .from('leads')
      .select('*')
      .neq('deleted', true)
      .order('fecha_ultimo_contacto', { ascending: false })

    if (err) {
      setError(err.message)
    } else {
      setLeads((data as Lead[]) || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchLeads()

    // Realtime: create channel, register listener, then subscribe separately
    const supabase = getSupabase()
    const channelName = `leads-rt-${Math.random().toString(36).slice(2)}`
    const channel = supabase.channel(channelName)

    channel.on(
      'postgres_changes' as any,
      { event: '*', schema: 'public', table: 'leads' },
      () => { fetchLeads() }
    )

    channel.subscribe()
    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchLeads])

  return { leads, loading, error, refetch: fetchLeads }
}
