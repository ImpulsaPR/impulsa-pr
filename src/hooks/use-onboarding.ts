'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useCliente } from './use-cliente'

export type OnboardingStepId =
  | 'calendar'
  | 'bot_identity'
  | 'horarios'
  | 'servicios'
  | 'mensajes'
  | 'kb'

export interface OnboardingStep {
  id: OnboardingStepId
  label: string
  description: string
  done: boolean
  href: string
}

export interface OnboardingProgress {
  steps: OnboardingStep[]
  completed: number
  total: number
  percentage: number
  isFullyComplete: boolean
  isDismissed: boolean
  dismiss: () => void
  reset: () => void
  loading: boolean
  refetch: () => Promise<void>
}

interface BotSnapshot {
  nombre_agente: string | null
  empresa_nombre: string | null
  empresa_descripcion: string | null
  horario_inicio: string | null
  horario_fin: string | null
  servicios_json: unknown
  mensaje_bienvenida: string | null
  mensaje_fuera_horario: string | null
}

interface State {
  bot: BotSnapshot | null
  hasCalendar: boolean
  kbCount: number
  loading: boolean
}

const DEFAULT_STATE: State = {
  bot: null,
  hasCalendar: false,
  kbCount: 0,
  loading: true,
}

const STEP_META: Record<
  OnboardingStepId,
  { label: string; description: string; href: string }
> = {
  calendar: {
    label: 'onboarding.steps.calendar.label',
    description: 'onboarding.steps.calendar.description',
    href: '/settings#google-calendar',
  },
  bot_identity: {
    label: 'onboarding.steps.bot_identity.label',
    description: 'onboarding.steps.bot_identity.description',
    href: '/settings',
  },
  horarios: {
    label: 'onboarding.steps.horarios.label',
    description: 'onboarding.steps.horarios.description',
    href: '/settings',
  },
  servicios: {
    label: 'onboarding.steps.servicios.label',
    description: 'onboarding.steps.servicios.description',
    href: '/settings',
  },
  mensajes: {
    label: 'onboarding.steps.mensajes.label',
    description: 'onboarding.steps.mensajes.description',
    href: '/settings',
  },
  kb: {
    label: 'onboarding.steps.kb.label',
    description: 'onboarding.steps.kb.description',
    href: '/knowledge',
  },
}

const STEP_ORDER: OnboardingStepId[] = [
  'calendar',
  'bot_identity',
  'horarios',
  'servicios',
  'mensajes',
  'kb',
]

function nonEmpty(s: string | null | undefined): boolean {
  return typeof s === 'string' && s.trim().length > 0
}

function isHorariosConfigured(inicio: string | null, fin: string | null): boolean {
  if (!nonEmpty(inicio) || !nonEmpty(fin)) return false
  // Defaults indicating "no configurado": 00:00 + 23:59 (full-day placeholder)
  const i = (inicio ?? '').trim()
  const f = (fin ?? '').trim()
  if (i === '00:00' && f === '23:59') return false
  return true
}

function isAgentNameCustom(nombre: string | null): boolean {
  if (!nonEmpty(nombre)) return false
  const n = (nombre ?? '').trim().toLowerCase()
  return n !== 'asistente'
}

function dismissedKey(clienteId: string) {
  return `onboarding_dismissed_${clienteId}`
}

function readDismissed(clienteId: string | undefined): boolean {
  if (!clienteId) return false
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(dismissedKey(clienteId)) === 'true'
  } catch {
    return false
  }
}

export function useOnboarding(): OnboardingProgress {
  const { cliente, loading: clienteLoading } = useCliente()
  const [state, setState] = useState<State>(DEFAULT_STATE)
  const [isDismissed, setIsDismissed] = useState<boolean>(false)

  const fetchAll = useCallback(async (clienteId: string) => {
    const supabase = getSupabase()

    const [botRes, credRes, kbRes] = await Promise.all([
      supabase
        .from('bots')
        .select(
          'nombre_agente,empresa_nombre,empresa_descripcion,horario_inicio,horario_fin,servicios_json,mensaje_bienvenida,mensaje_fuera_horario'
        )
        .eq('cliente_id', clienteId)
        .maybeSingle(),
      supabase
        .from('bot_credentials')
        .select('id', { count: 'exact', head: true })
        .eq('cliente_id', clienteId)
        .eq('provider', 'google_calendar'),
      supabase
        .from('knowledge_base')
        .select('id', { count: 'exact', head: true })
        .eq('cliente_id', clienteId),
    ])

    const botRow = (botRes.data as Record<string, unknown> | null) ?? null
    const bot: BotSnapshot | null = botRow
      ? {
          nombre_agente: (botRow.nombre_agente as string | null) ?? null,
          empresa_nombre: (botRow.empresa_nombre as string | null) ?? null,
          empresa_descripcion:
            (botRow.empresa_descripcion as string | null) ?? null,
          horario_inicio: (botRow.horario_inicio as string | null) ?? null,
          horario_fin: (botRow.horario_fin as string | null) ?? null,
          servicios_json: botRow.servicios_json,
          mensaje_bienvenida:
            (botRow.mensaje_bienvenida as string | null) ?? null,
          mensaje_fuera_horario:
            (botRow.mensaje_fuera_horario as string | null) ?? null,
        }
      : null

    const hasCalendar = (credRes.count ?? 0) > 0
    const kbCount = kbRes.count ?? 0

    setState({ bot, hasCalendar, kbCount, loading: false })
  }, [])

  useEffect(() => {
    if (clienteLoading) return
    if (!cliente) {
      setState((s) => ({ ...s, loading: false }))
      return
    }
    setIsDismissed(readDismissed(cliente.id))
    fetchAll(cliente.id)

    // Realtime subscriptions: bots, bot_credentials, knowledge_base
    const supabase = getSupabase()
    const suffix = Math.random().toString(36).slice(2)
    const channel = supabase
      .channel(`onboarding-rt-${cliente.id}-${suffix}`)
      .on(
        'postgres_changes' as never,
        {
          event: '*',
          schema: 'public',
          table: 'bots',
          filter: `cliente_id=eq.${cliente.id}`,
        },
        () => {
          fetchAll(cliente.id)
        }
      )
      .on(
        'postgres_changes' as never,
        {
          event: '*',
          schema: 'public',
          table: 'bot_credentials',
          filter: `cliente_id=eq.${cliente.id}`,
        },
        () => {
          fetchAll(cliente.id)
        }
      )
      .on(
        'postgres_changes' as never,
        {
          event: '*',
          schema: 'public',
          table: 'knowledge_base',
          filter: `cliente_id=eq.${cliente.id}`,
        },
        () => {
          fetchAll(cliente.id)
        }
      )
      .subscribe()

    // Sync localStorage flag across tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === dismissedKey(cliente.id)) {
        setIsDismissed(e.newValue === 'true')
      }
    }
    window.addEventListener('storage', onStorage)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('storage', onStorage)
    }
  }, [cliente, clienteLoading, fetchAll])

  const dismiss = useCallback(() => {
    if (!cliente) return
    try {
      window.localStorage.setItem(dismissedKey(cliente.id), 'true')
    } catch {
      // ignore
    }
    setIsDismissed(true)
  }, [cliente])

  const reset = useCallback(() => {
    if (!cliente) return
    try {
      window.localStorage.removeItem(dismissedKey(cliente.id))
    } catch {
      // ignore
    }
    setIsDismissed(false)
  }, [cliente])

  const refetch = useCallback(async () => {
    if (!cliente) return
    await fetchAll(cliente.id)
  }, [cliente, fetchAll])

  const steps = useMemo<OnboardingStep[]>(() => {
    const bot = state.bot
    const servicios = Array.isArray(bot?.servicios_json)
      ? (bot?.servicios_json as unknown[])
      : []

    const doneMap: Record<OnboardingStepId, boolean> = {
      calendar: state.hasCalendar,
      bot_identity:
        !!bot &&
        nonEmpty(bot.empresa_nombre) &&
        nonEmpty(bot.empresa_descripcion) &&
        isAgentNameCustom(bot.nombre_agente),
      horarios:
        !!bot && isHorariosConfigured(bot.horario_inicio, bot.horario_fin),
      servicios: servicios.length >= 1,
      mensajes:
        !!bot &&
        nonEmpty(bot.mensaje_bienvenida) &&
        nonEmpty(bot.mensaje_fuera_horario),
      kb: state.kbCount >= 3,
    }

    return STEP_ORDER.map((id) => ({
      id,
      label: STEP_META[id].label,
      description: STEP_META[id].description,
      href: STEP_META[id].href,
      done: doneMap[id],
    }))
  }, [state])

  const completed = steps.filter((s) => s.done).length
  const total = steps.length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  const isFullyComplete = total > 0 && completed === total

  return {
    steps,
    completed,
    total,
    percentage,
    isFullyComplete,
    isDismissed,
    dismiss,
    reset,
    loading: state.loading || clienteLoading,
    refetch,
  }
}
