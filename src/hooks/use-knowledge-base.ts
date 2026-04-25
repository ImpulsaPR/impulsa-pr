'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useCliente } from './use-cliente'

export interface KbEntry {
  id: string
  cliente_id: string
  category: string
  question: string
  answer: string
  tags: string[] | null
  source: string
  usage_count: number
  last_used_at: string | null
  created_at: string
  updated_at: string
}

export function useKnowledgeBase() {
  const { cliente, loading: clienteLoading } = useCliente()
  const [entries, setEntries] = useState<KbEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async (clienteId: string) => {
    const supabase = getSupabase()
    const { data, error: err } = await supabase
      .from('knowledge_base')
      .select('id,cliente_id,category,question,answer,tags,source,usage_count,last_used_at,created_at,updated_at')
      .eq('cliente_id', clienteId)
      .order('updated_at', { ascending: false })

    if (err) setError(err.message)
    else setEntries((data as KbEntry[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (clienteLoading) return
    if (!cliente) {
      setLoading(false)
      return
    }
    fetchAll(cliente.id)

    // Realtime: actualiza contador de uso cuando el bot consulta KB
    const supabase = getSupabase()
    const channel = supabase
      .channel(`kb-rt-${cliente.id}-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes' as never,
        {
          event: '*',
          schema: 'public',
          table: 'knowledge_base',
          filter: `cliente_id=eq.${cliente.id}`,
        },
        (payload: { eventType: string; new?: KbEntry; old?: KbEntry }) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            setEntries((prev) => {
              if (prev.some((e) => e.id === payload.new!.id)) return prev
              return [payload.new!, ...prev]
            })
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setEntries((prev) =>
              prev.map((e) => (e.id === payload.new!.id ? payload.new! : e))
            )
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setEntries((prev) => prev.filter((e) => e.id !== payload.old!.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [cliente, clienteLoading, fetchAll])

  const upsert = useCallback(
    async (payload: {
      id?: string
      category: string
      question: string
      answer: string
      tags?: string[]
    }) => {
      const res = await fetch('/api/kb/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error guardando')
      if (cliente) await fetchAll(cliente.id)
      return json.item as KbEntry
    },
    [cliente, fetchAll]
  )

  const remove = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/kb/upsert?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || 'Error eliminando')
      }
      if (cliente) await fetchAll(cliente.id)
    },
    [cliente, fetchAll]
  )

  return {
    entries,
    loading: loading || clienteLoading,
    error,
    upsert,
    remove,
    refetch: () => (cliente ? fetchAll(cliente.id) : Promise.resolve()),
  }
}
