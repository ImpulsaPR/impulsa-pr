'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useCliente } from './use-cliente'
import type { Lead } from '@/lib/types'

export interface ChatMessage {
  id: number
  telefono: string
  rol: string
  mensaje: string
  created_at: string
}

export interface Conversation {
  telefono: string
  lead: Lead | null
  lastMessage: string
  lastRol: string
  lastTimestamp: string
  messageCount: number
}

export function useConversations() {
  const { cliente, loading: clienteLoading } = useCliente()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async (clienteId: string) => {
    const supabase = getSupabase()
    const [msgsRes, leadsRes] = await Promise.all([
      supabase
        .from('whatsapp_historial')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: true })
        .limit(5000),
      supabase
        .from('leads')
        .select('*')
        .eq('cliente_id', clienteId)
        .neq('deleted', true),
    ])
    if (msgsRes.error) setError(msgsRes.error.message)
    else setMessages((msgsRes.data as ChatMessage[]) || [])
    if (leadsRes.data) setLeads(leadsRes.data as Lead[])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (clienteLoading) return
    if (!cliente) {
      setLoading(false)
      return
    }

    fetchAll(cliente.id)

    const supabase = getSupabase()
    const channel = supabase
      .channel(`conv-rt-${cliente.id}-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes' as never,
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_historial',
          filter: `cliente_id=eq.${cliente.id}`,
        },
        (payload: { eventType: string; new?: ChatMessage; old?: ChatMessage }) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === payload.new!.id)) return prev
              return [...prev, payload.new!]
            })
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setMessages((prev) => prev.map((m) => (m.id === payload.new!.id ? payload.new! : m)))
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setMessages((prev) => prev.filter((m) => m.id !== payload.old!.id))
          }
        }
      )
      .on(
        'postgres_changes' as never,
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `cliente_id=eq.${cliente.id}`,
        },
        () => {
          if (cliente) fetchAll(cliente.id)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [cliente, clienteLoading, fetchAll])

  const conversations = useMemo<Conversation[]>(() => {
    const byPhone = new Map<string, ChatMessage[]>()
    for (const msg of messages) {
      const arr = byPhone.get(msg.telefono) || []
      arr.push(msg)
      byPhone.set(msg.telefono, arr)
    }
    const leadByPhone = new Map(leads.map((l) => [l.telefono, l]))
    const out: Conversation[] = []
    for (const [telefono, msgs] of byPhone.entries()) {
      const last = msgs[msgs.length - 1]
      out.push({
        telefono,
        lead: leadByPhone.get(telefono) || null,
        lastMessage: last.mensaje,
        lastRol: last.rol,
        lastTimestamp: last.created_at,
        messageCount: msgs.length,
      })
    }
    out.sort((a, b) => b.lastTimestamp.localeCompare(a.lastTimestamp))
    return out
  }, [messages, leads])

  const messagesByPhone = useCallback(
    (telefono: string): ChatMessage[] => {
      return messages
        .filter((m) => m.telefono === telefono)
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
    },
    [messages]
  )

  return {
    conversations,
    messagesByPhone,
    leads,
    loading: loading || clienteLoading,
    error,
    refetch: () => (cliente ? fetchAll(cliente.id) : Promise.resolve()),
  }
}
