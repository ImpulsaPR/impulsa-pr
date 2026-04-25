'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useCliente } from './use-cliente'

export type Rango = 7 | 30 | 90

export interface MetricasResumen {
  leads_totales: number
  citas_agendadas: number
  citas_canceladas: number
  citas_completadas: number
  tasa_conversion: number
  tasa_cancelacion: number
  mensajes_recibidos: number
  mensajes_enviados: number
  tiempo_promedio_horas_hasta_cita: number
}

export interface EmbudoEtapa {
  etapa: string
  cantidad: number
  porcentaje: number
}

export interface LeadsPorDia {
  cliente_id: string
  fecha: string
  leads_nuevos: number
  leads_alto_interes: number
  leads_viables: number
}

export interface CitasPorDia {
  cliente_id: string
  fecha: string
  citas_agendadas: number
  citas_canceladas: number
  citas_completadas: number
}

export interface LeadsPorNicho {
  cliente_id: string
  nicho: string
  total: number
  viables: number
  alto_interes: number
}

export interface CitasEstado {
  cliente_id: string
  estado_real: 'agendada' | 'completada' | 'cancelada' | 'vencida'
  total: number
}

export interface ProximaCita {
  id: string
  cliente_id: string
  nombre_cliente: string | null
  telefono_cliente: string
  titulo: string | null
  fecha: string
  fecha_fin: string | null
  estado: string | null
  recordatorio_24h_enviado: boolean
  recordatorio_1h_enviado: boolean
  evento_google_id: string | null
  tipo_negocio: string | null
  nivel_interes: string | null
}

export interface ActividadItem {
  cliente_id: string
  tipo: 'lead_nuevo' | 'cita_agendada' | 'cita_cancelada'
  ref_id: string
  descripcion: string | null
  detalle: string | null
  timestamp: string
}

export interface RendimientoBot {
  conversaciones_sin_respuesta: number
  msgs_promedio_hasta_cita: number
  msgs_promedio_sin_cita: number
}

export interface TiempoRespuestaDia {
  fecha: string
  segundos_promedio_respuesta: number
  total_conversaciones: number
}

export interface TiempoRespuestaResumen {
  avg_segundos: number
  total_conversaciones: number
  serie: TiempoRespuestaDia[]
  delta_pct: number | null
}

export interface ActividadHora {
  hora: number
  msgs_bot: number
  msgs_clientes: number
  total_mensajes: number
}

export interface MetricasDeltas {
  leads_totales: number | null
  citas_agendadas: number | null
  tasa_conversion: number | null
  tasa_cancelacion: number | null
  mensajes_total: number | null
}

export interface MetricasData {
  resumen: MetricasResumen | null
  embudo: EmbudoEtapa[]
  leadsPorDia: LeadsPorDia[]
  citasPorDia: CitasPorDia[]
  nichos: LeadsPorNicho[]
  estadoCitas: CitasEstado[]
  proximasCitas: ProximaCita[]
  actividad: ActividadItem[]
  rendimientoBot: RendimientoBot | null
  tiempoRespuesta: TiempoRespuestaResumen | null
  actividadHora: ActividadHora[]
  leadsPorDiaPrev: LeadsPorDia[]
  deltas: MetricasDeltas
}

const emptyDeltas: MetricasDeltas = {
  leads_totales: null,
  citas_agendadas: null,
  tasa_conversion: null,
  tasa_cancelacion: null,
  mensajes_total: null,
}

const emptyData: MetricasData = {
  resumen: null,
  embudo: [],
  leadsPorDia: [],
  citasPorDia: [],
  nichos: [],
  estadoCitas: [],
  proximasCitas: [],
  actividad: [],
  rendimientoBot: null,
  tiempoRespuesta: null,
  actividadHora: [],
  leadsPorDiaPrev: [],
  deltas: emptyDeltas,
}

function pctDelta(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null
  return Math.round(((current - previous) / previous) * 100)
}

function absDelta(current: number, previous: number): number | null {
  if (previous === 0 && current === 0) return 0
  return Math.round((current - previous) * 10) / 10
}

export function useMetricas(rango: Rango = 30) {
  const { cliente, loading: clienteLoading } = useCliente()
  const [data, setData] = useState<MetricasData>(emptyData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async (clienteId: string, dias: Rango) => {
    const supabase = getSupabase()
    const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const desdeDoble = new Date(Date.now() - dias * 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

    const [
      resumenRes,
      resumenPrevRes,
      embudoRes,
      leadsDiaRes,
      citasDiaRes,
      nichosRes,
      estadoRes,
      proximasRes,
      actividadRes,
      rendimientoRes,
      tiempoRespRes,
      actividadHoraRes,
    ] = await Promise.all([
      supabase.rpc('get_metricas_resumen', { p_cliente_id: clienteId, p_dias: dias }),
      supabase.rpc('get_metricas_resumen', { p_cliente_id: clienteId, p_dias: dias * 2 }),
      supabase.rpc('get_embudo_conversion', { p_cliente_id: clienteId, p_dias: dias }),
      supabase
        .from('v_leads_por_dia')
        .select('*')
        .eq('cliente_id', clienteId)
        .gte('fecha', desdeDoble)
        .order('fecha', { ascending: true }),
      supabase
        .from('v_citas_por_dia')
        .select('*')
        .eq('cliente_id', clienteId)
        .gte('fecha', desde)
        .order('fecha', { ascending: true }),
      supabase
        .from('v_leads_por_nicho')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('total', { ascending: false })
        .limit(6),
      supabase.from('v_citas_estado_actual').select('*').eq('cliente_id', clienteId),
      supabase.from('v_proximas_citas').select('*').eq('cliente_id', clienteId),
      supabase
        .from('v_actividad_reciente')
        .select('*')
        .eq('cliente_id', clienteId)
        .limit(30),
      supabase.rpc('get_rendimiento_bot', { p_cliente_id: clienteId, p_dias: dias }),
      supabase
        .from('v_tiempo_respuesta')
        .select('*')
        .gte('fecha', desdeDoble)
        .order('fecha', { ascending: true }),
      supabase
        .from('v_actividad_por_hora')
        .select('*')
        .order('hora', { ascending: true }),
    ])

    const firstErr =
      resumenRes.error ||
      resumenPrevRes.error ||
      embudoRes.error ||
      leadsDiaRes.error ||
      citasDiaRes.error ||
      nichosRes.error ||
      estadoRes.error ||
      proximasRes.error ||
      actividadRes.error ||
      rendimientoRes.error ||
      tiempoRespRes.error ||
      actividadHoraRes.error

    if (firstErr) {
      setError(firstErr.message)
      return
    }

    const resumenRow = (Array.isArray(resumenRes.data) ? resumenRes.data[0] : resumenRes.data) as
      | MetricasResumen
      | null
    const resumenDoubleRow = (Array.isArray(resumenPrevRes.data)
      ? resumenPrevRes.data[0]
      : resumenPrevRes.data) as MetricasResumen | null
    const rendimientoRow = (Array.isArray(rendimientoRes.data)
      ? rendimientoRes.data[0]
      : rendimientoRes.data) as RendimientoBot | null

    let deltas: MetricasDeltas = emptyDeltas
    if (resumenRow && resumenDoubleRow) {
      const prevLeads = resumenDoubleRow.leads_totales - resumenRow.leads_totales
      const prevCitas = resumenDoubleRow.citas_agendadas - resumenRow.citas_agendadas
      const prevCanceladas =
        resumenDoubleRow.citas_canceladas - resumenRow.citas_canceladas
      const prevMsgs =
        resumenDoubleRow.mensajes_recibidos +
        resumenDoubleRow.mensajes_enviados -
        (resumenRow.mensajes_recibidos + resumenRow.mensajes_enviados)
      const prevConversion =
        prevLeads > 0 ? (prevCitas / prevLeads) * 100 : 0
      const prevCancelacion =
        prevCitas > 0 ? (prevCanceladas / prevCitas) * 100 : 0
      const currMsgs = resumenRow.mensajes_recibidos + resumenRow.mensajes_enviados
      deltas = {
        leads_totales: pctDelta(resumenRow.leads_totales, prevLeads),
        citas_agendadas: pctDelta(resumenRow.citas_agendadas, prevCitas),
        tasa_conversion: absDelta(resumenRow.tasa_conversion, prevConversion),
        tasa_cancelacion: absDelta(resumenRow.tasa_cancelacion, prevCancelacion),
        mensajes_total: pctDelta(currMsgs, prevMsgs),
      }
    }

    const tiempoRows = ((tiempoRespRes.data as TiempoRespuestaDia[]) || []).filter(
      (r): r is TiempoRespuestaDia =>
        !!r.fecha && r.segundos_promedio_respuesta !== null && r.total_conversaciones !== null
    )
    const cutoff = desde
    const recent = tiempoRows.filter((r) => r.fecha >= cutoff)
    const previous = tiempoRows.filter((r) => r.fecha < cutoff)
    const weightedAvg = (rows: TiempoRespuestaDia[]) => {
      const totalConv = rows.reduce((s, r) => s + r.total_conversaciones, 0)
      if (totalConv === 0) return 0
      const weighted = rows.reduce(
        (s, r) => s + r.segundos_promedio_respuesta * r.total_conversaciones,
        0
      )
      return weighted / totalConv
    }
    const avgRecent = weightedAvg(recent)
    const avgPrev = weightedAvg(previous)
    const tiempoRespuesta: TiempoRespuestaResumen | null =
      recent.length > 0
        ? {
            avg_segundos: Math.round(avgRecent * 10) / 10,
            total_conversaciones: recent.reduce((s, r) => s + r.total_conversaciones, 0),
            serie: recent,
            delta_pct: avgPrev > 0 ? Math.round(((avgRecent - avgPrev) / avgPrev) * 100) : null,
          }
        : null

    const leadsDiaAll = (leadsDiaRes.data as LeadsPorDia[]) || []
    const leadsDiaCurrent = leadsDiaAll.filter((r) => r.fecha >= desde)
    const leadsDiaPrev = leadsDiaAll.filter((r) => r.fecha < desde)

    setData({
      resumen: resumenRow,
      embudo: (embudoRes.data as EmbudoEtapa[]) || [],
      leadsPorDia: leadsDiaCurrent,
      leadsPorDiaPrev: leadsDiaPrev,
      citasPorDia: (citasDiaRes.data as CitasPorDia[]) || [],
      nichos: (nichosRes.data as LeadsPorNicho[]) || [],
      estadoCitas: (estadoRes.data as CitasEstado[]) || [],
      proximasCitas: (proximasRes.data as ProximaCita[]) || [],
      actividad: (actividadRes.data as ActividadItem[]) || [],
      rendimientoBot: rendimientoRow,
      tiempoRespuesta,
      actividadHora: ((actividadHoraRes.data as ActividadHora[]) || []).filter(
        (r): r is ActividadHora =>
          r.hora !== null && r.hora !== undefined && r.total_mensajes !== null
      ),
      deltas,
    })
    setError(null)
  }, [])

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (clienteLoading || !cliente) return

    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)

    fetchAll(cliente.id, rango).finally(() => {
      if (!cancelled) setLoading(false)
    })

    const supabase = getSupabase()
    const channelName = `metricas-rt-${cliente.id}-${Math.random().toString(36).slice(2)}`
    const channel = supabase.channel(channelName)

    const scheduleRefetch = () => {
      if (cancelled) return
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        if (!cancelled) fetchAll(cliente.id, rango)
      }, 1500)
    }

    const filter = `cliente_id=eq.${cliente.id}`
    for (const table of ['leads', 'citas', 'mensajes'] as const) {
      channel.on(
        'postgres_changes' as never,
        { event: '*', schema: 'public', table, filter },
        scheduleRefetch
      )
    }

    channel.subscribe()

    return () => {
      cancelled = true
      if (debounceRef.current) clearTimeout(debounceRef.current)
      supabase.removeChannel(channel)
    }
  }, [cliente, clienteLoading, rango, fetchAll])

  const effectiveLoading = clienteLoading || (!!cliente && loading)

  return { data, loading: effectiveLoading, error }
}
