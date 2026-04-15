'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import type { Lead } from '@/lib/types'

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
  }, [fetchLeads])

  return { leads, loading, error, refetch: fetchLeads }
}
