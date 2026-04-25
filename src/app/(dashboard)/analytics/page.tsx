'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  Calendar,
  Target,
  XCircle,
  Clock,
  MessageSquare,
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  CalendarCheck,
  Bot,
  Inbox,
  Flame,
  DollarSign,
  Clock3,
  UserX,
} from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'
import { StatCardSkeleton, Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { useTranslation } from '@/lib/i18n'
import { useMetricas, type Rango } from '@/hooks/use-metricas'
import { useLeads } from '@/hooks/use-leads'
import { formatFechaCorta } from '@/lib/format-date'
import { LineChart } from '@/components/analytics/line-chart'
import {
  StackedBarChart,
  type StackedBarDatum,
} from '@/components/analytics/stacked-bar-chart'
import {
  Donut,
  APPOINTMENT_STATUS_COLOR,
  type DonutSlice,
} from '@/components/analytics/donut'
import { Funnel } from '@/components/analytics/funnel'
import { NicheBars } from '@/components/analytics/niche-bars'
import { UpcomingCards } from '@/components/analytics/upcoming-cards'
import { ActivityFeed } from '@/components/analytics/activity-feed'
import { ExecutiveSummary } from '@/components/analytics/executive-summary'
import { RevenueCards } from '@/components/analytics/revenue-cards'
import { ColdLeadsCard } from '@/components/analytics/cold-leads-card'
import { BotPerformanceCards } from '@/components/analytics/bot-performance-cards'
import { ResponseTimeCard } from '@/components/analytics/response-time-card'
import { HourlyActivityChart } from '@/components/analytics/hourly-activity-chart'
import { SourceAttribution } from '@/components/analytics/source-attribution'
import { LeadQuality } from '@/components/analytics/lead-quality'
import { FilterBar, type LeadFilters } from '@/components/analytics/filter-bar'
import { GoalCard } from '@/components/analytics/goal-card'
import { InsightsCard } from '@/components/analytics/insights-card'
import { ExportMenu } from '@/components/analytics/export-menu'
import { LeadsHeatmap } from '@/components/analytics/leads-heatmap'
import { KbUsageCard } from '@/components/analytics/kb-usage-card'
import { toCSV, downloadBlob, stampDate } from '@/lib/export'
import { EmptyState } from '@/components/analytics/empty-state'
import { BookOpen } from 'lucide-react'

const COLD_THRESHOLD_HOURS = 48

export default function AnalyticsPage() {
  const { t, locale } = useTranslation()
  const { toast } = useToast()
  const router = useRouter()
  const [rango, setRango] = useState<Rango>(30)
  const [compareLeads, setCompareLeads] = useState(false)
  const [filters, setFilters] = useState<LeadFilters>({
    tipo_negocio: null,
    origen: null,
    nivel_interes: null,
  })
  const { data, loading, error } = useMetricas(rango)
  const { leads: allLeads } = useLeads()

  const leads = useMemo(() => {
    return allLeads.filter((l) => {
      if (filters.tipo_negocio && l.tipo_negocio !== filters.tipo_negocio) return false
      if (filters.origen && l.origen !== filters.origen) return false
      if (filters.nivel_interes && l.nivel_interes !== filters.nivel_interes) return false
      return true
    })
  }, [allLeads, filters])

  useEffect(() => {
    if (error) toast(t('analytics.loadError'), 'error')
  }, [error, toast, t])

  const rangeOptions: { label: string; value: Rango }[] = [
    { label: t('analytics.range7'), value: 7 },
    { label: t('analytics.range30'), value: 30 },
    { label: t('analytics.range90'), value: 90 },
  ]

  const mensajesTotal =
    (data.resumen?.mensajes_recibidos || 0) +
    (data.resumen?.mensajes_enviados || 0)

  const leadsSparkline = useMemo(
    () => data.leadsPorDia.map((d) => d.leads_nuevos),
    [data.leadsPorDia]
  )
  const leadsLabels = useMemo(
    () => data.leadsPorDia.map((d) => formatFechaCorta(d.fecha, locale)),
    [data.leadsPorDia, locale]
  )
  const citasBookedSpark = useMemo(
    () => data.citasPorDia.map((d) => d.citas_agendadas),
    [data.citasPorDia]
  )
  const conversionSpark = useMemo(() => {
    const byDate = new Map(data.citasPorDia.map((d) => [d.fecha, d]))
    return data.leadsPorDia.map((d) => {
      const c = byDate.get(d.fecha)?.citas_agendadas || 0
      return d.leads_nuevos > 0 ? (c / d.leads_nuevos) * 100 : 0
    })
  }, [data.leadsPorDia, data.citasPorDia])
  const cancelSpark = useMemo(
    () =>
      data.citasPorDia.map((d) =>
        d.citas_agendadas > 0 ? (d.citas_canceladas / d.citas_agendadas) * 100 : 0
      ),
    [data.citasPorDia]
  )
  const leadsComparePrev = useMemo(() => {
    const prev = data.leadsPorDiaPrev.map((d) => d.leads_nuevos)
    const N = data.leadsPorDia.length
    if (N === 0) return []
    if (prev.length >= N) return prev.slice(prev.length - N)
    return [...Array(N - prev.length).fill(0), ...prev]
  }, [data.leadsPorDiaPrev, data.leadsPorDia])

  const citasBars = useMemo<StackedBarDatum[]>(
    () =>
      data.citasPorDia.map((d) => ({
        label: formatFechaCorta(d.fecha, locale),
        booked: d.citas_agendadas - d.citas_canceladas,
        cancelled: d.citas_canceladas,
      })),
    [data.citasPorDia, locale]
  )

  const estadoSlices = useMemo<DonutSlice[]>(
    () =>
      data.estadoCitas.map((e) => ({
        label: t(
          `analytics.status.${
            e.estado_real === 'agendada'
              ? 'booked'
              : e.estado_real === 'completada'
                ? 'completed'
                : e.estado_real === 'cancelada'
                  ? 'cancelled'
                  : 'expired'
          }` as const
        ),
        value: e.total,
        color: APPOINTMENT_STATUS_COLOR[e.estado_real] || APPOINTMENT_STATUS_COLOR.vencida,
      })),
    [data.estadoCitas, t]
  )

  const monthProgress = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const daysElapsed = now.getDate()
    const cutoff = firstDay.toISOString().slice(0, 10)

    const leadsThisMonth = data.leadsPorDia
      .filter((d) => d.fecha >= cutoff)
      .reduce((s, d) => s + d.leads_nuevos, 0)
    const citasThisMonth = data.citasPorDia
      .filter((d) => d.fecha >= cutoff)
      .reduce((s, d) => s + d.citas_agendadas, 0)

    return { daysInMonth, daysElapsed, leadsThisMonth, citasThisMonth }
  }, [data.leadsPorDia, data.citasPorDia])

  const noShowRate = useMemo(() => {
    const byStatus = new Map(data.estadoCitas.map((e) => [e.estado_real, e.total]))
    const completed = byStatus.get('completada') ?? 0
    const expired = byStatus.get('vencida') ?? 0
    const cancelled = byStatus.get('cancelada') ?? 0
    const finalized = completed + expired + cancelled
    if (finalized === 0) return 0
    return (expired / finalized) * 100
  }, [data.estadoCitas])

  const takeoverPct = useMemo(() => {
    // Preferir las stats agregadas del periodo (basadas en human_takeover) que
    // capturan eventos históricos. Fallback al snapshot actual si la tabla
    // todavía no devolvió data.
    if (data.takeover && data.takeover.unique_telefonos > 0) {
      return data.takeover.pct_conversaciones
    }
    if (leads.length === 0) return null
    const takeover = leads.filter((l) => l.humano_activo).length
    return (takeover / leads.length) * 100
  }, [leads, data.takeover])

  const revenue = useMemo(() => {
    const openLeads = leads.filter((l) => l.estado !== 'cerrado')
    const closedLeads = leads.filter((l) => l.estado === 'cerrado')
    const pipeline = openLeads.reduce((s, l) => s + (l.valor_estimado || 0), 0)
    const closed = closedLeads.reduce(
      (s, l) => s + (l.valor_real || l.valor_estimado || 0),
      0
    )
    const avg =
      leads.length > 0
        ? leads.reduce((s, l) => s + (l.valor_estimado || 0), 0) / leads.length
        : 0
    return { pipeline, closed, avg }
  }, [leads])

  const [coldLeads, setColdLeads] = useState<typeof leads>([])

  useEffect(() => {
    const compute = () => {
      const threshold = Date.now() - COLD_THRESHOLD_HOURS * 60 * 60 * 1000
      setColdLeads(
        leads
          .filter(
            (l) =>
              l.estado !== 'cerrado' &&
              new Date(l.fecha_ultimo_contacto).getTime() < threshold
          )
          .sort(
            (a, b) =>
              new Date(a.fecha_ultimo_contacto).getTime() -
              new Date(b.fecha_ultimo_contacto).getTime()
          )
      )
    }
    compute()
    const id = setInterval(compute, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [leads])

  const handleExportLeads = () => {
    const csv = toCSV(leads, [
      { key: 'nombre', label: 'nombre' },
      { key: 'telefono', label: 'telefono' },
      { key: 'email', label: 'email' },
      { key: 'tipo_negocio', label: 'tipo_negocio' },
      { key: 'origen', label: 'origen' },
      { key: 'fuente', label: 'fuente' },
      { key: 'nivel_interes', label: 'nivel_interes' },
      { key: 'estado', label: 'estado' },
      { key: 'etapa', label: 'etapa' },
      { key: 'valor_estimado', label: 'valor_estimado' },
      { key: 'valor_real', label: 'valor_real' },
      { key: 'humano_activo', label: 'humano_activo' },
      { key: 'fecha_primer_contacto', label: 'fecha_primer_contacto' },
      { key: 'fecha_ultimo_contacto', label: 'fecha_ultimo_contacto' },
    ])
    downloadBlob(csv, `impulsa-leads-${stampDate()}.csv`)
  }

  const handleExportMetrics = () => {
    const rows: Record<string, unknown>[] = [
      { metric: 'rango_dias', value: rango },
      { metric: 'leads_totales', value: resumen?.leads_totales ?? 0 },
      { metric: 'citas_agendadas', value: resumen?.citas_agendadas ?? 0 },
      { metric: 'citas_completadas', value: resumen?.citas_completadas ?? 0 },
      { metric: 'citas_canceladas', value: resumen?.citas_canceladas ?? 0 },
      { metric: 'tasa_conversion_pct', value: resumen?.tasa_conversion ?? 0 },
      { metric: 'tasa_cancelacion_pct', value: resumen?.tasa_cancelacion ?? 0 },
      { metric: 'mensajes_recibidos', value: resumen?.mensajes_recibidos ?? 0 },
      { metric: 'mensajes_enviados', value: resumen?.mensajes_enviados ?? 0 },
      { metric: 'horas_hasta_cita_prom', value: resumen?.tiempo_promedio_horas_hasta_cita ?? 0 },
      { metric: 'pipeline_valor', value: revenue.pipeline },
      { metric: 'cerrado_valor', value: revenue.closed },
      { metric: 'no_show_pct', value: +noShowRate.toFixed(2) },
      { metric: 'tiempo_respuesta_seg', value: data.tiempoRespuesta?.avg_segundos ?? null },
      { metric: 'takeover_pct', value: takeoverPct !== null ? +takeoverPct.toFixed(2) : null },
      { metric: 'takeover_eventos', value: data.takeover?.total_events ?? 0 },
      { metric: 'kb_total_uses', value: data.kb?.total_uses ?? 0 },
      { metric: 'kb_hit_rate_pct', value: data.kb?.hit_rate_pct ?? 0 },
      { metric: 'kb_coverage_used', value: data.kb?.used_entries ?? 0 },
      { metric: 'kb_coverage_total', value: data.kb?.total_entries ?? 0 },
    ]
    const csv = toCSV(rows, [
      { key: 'metric', label: 'metric' },
      { key: 'value', label: 'value' },
    ])
    downloadBlob(csv, `impulsa-metrics-${stampDate()}.csv`)
  }

  const handleExportCitas = () => {
    const csv = toCSV(data.citasPorDia, [
      { key: 'fecha', label: 'fecha' },
      { key: 'citas_agendadas', label: 'citas_agendadas' },
      { key: 'citas_canceladas', label: 'citas_canceladas' },
      { key: 'citas_completadas', label: 'citas_completadas' },
    ])
    downloadBlob(csv, `impulsa-citas-${stampDate()}.csv`)
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('analytics.title')}</h1>
          <p className="text-sm text-muted mt-1">{t('analytics.subtitle')}</p>
        </div>
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  const resumen = data.resumen
  const cancelacionColor = (resumen?.tasa_cancelacion || 0) > 30 ? 'red' : 'orange'

  const trend = (v: number | null) => (v === null ? undefined : v)

  const headline = t('analytics.summary.headline')
    .replace('{days}', String(rango))
    .replace('{leads}', String(resumen?.leads_totales || 0))
  const summaryBody = t('analytics.summary.body')
    .replace('{citas}', String(resumen?.citas_agendadas || 0))
    .replace('{conv}', (resumen?.tasa_conversion || 0).toFixed(1))
    .replace('{mensajes}', String(mensajesTotal))

  const typeLabelMap = {
    lead_nuevo: t('analytics.activity.newLead'),
    cita_agendada: t('analytics.activity.appointmentBooked'),
    cita_cancelada: t('analytics.activity.appointmentCancelled'),
  }

  return (
    <div className="space-y-8">
      <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('analytics.title')}</h1>
            <p className="text-sm text-muted mt-0.5">{t('analytics.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-card border border-border rounded-xl p-1 print-hide">
              {rangeOptions.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setRango(o.value)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 active:scale-[0.97] ${
                    rango === o.value
                      ? 'bg-foreground text-background shadow-sm'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <ExportMenu
              onExportLeads={handleExportLeads}
              onExportMetrics={handleExportMetrics}
              onExportCitas={handleExportCitas}
              onPrint={handlePrint}
              labels={{
                export: t('analytics.export.button'),
                csvLeads: t('analytics.export.csvLeads'),
                csvMetrics: t('analytics.export.csvMetrics'),
                csvCitas: t('analytics.export.csvCitas'),
                print: t('analytics.export.print'),
              }}
            />
          </div>
        </div>
      </div>

      <ExecutiveSummary headline={headline} body={summaryBody} />

      <FilterBar
        leads={allLeads}
        filters={filters}
        onChange={setFilters}
        labels={{
          title: t('analytics.filters.title'),
          allBusinesses: t('analytics.filters.allBusinesses'),
          allSources: t('analytics.filters.allSources'),
          allLevels: t('analytics.filters.allLevels'),
          levelHigh: t('analytics.quality.high'),
          levelMedium: t('analytics.quality.medium'),
          levelLow: t('analytics.quality.low'),
          clear: t('analytics.filters.clear'),
          filteredCount: t('analytics.filters.filteredCount'),
        }}
      />

      <InsightsCard
        rango={rango}
        deltas={data.deltas}
        leadsPorDia={data.leadsPorDia}
        citasPorDia={data.citasPorDia}
        actividadHora={data.actividadHora}
        noShowRate={noShowRate}
        responseSeconds={data.tiempoRespuesta?.avg_segundos ?? null}
        responseDeltaPct={data.tiempoRespuesta?.delta_pct ?? null}
        takeoverPct={takeoverPct}
        pipelineValue={revenue.pipeline}
        labels={{
          title: t('analytics.insights.title'),
          subtitle: t('analytics.insights.subtitle'),
          emptyTitle: t('analytics.insights.emptyTitle'),
          emptyHint: t('analytics.insights.emptyHint'),
          leadsUp: t('analytics.insights.leadsUp'),
          leadsDown: t('analytics.insights.leadsDown'),
          leadsFlat: t('analytics.insights.leadsFlat'),
          citasUp: t('analytics.insights.citasUp'),
          citasDown: t('analytics.insights.citasDown'),
          conversionUp: t('analytics.insights.conversionUp'),
          conversionDown: t('analytics.insights.conversionDown'),
          cancellationHigh: t('analytics.insights.cancellationHigh'),
          cancellationOk: t('analytics.insights.cancellationOk'),
          responseFast: t('analytics.insights.responseFast'),
          responseSlow: t('analytics.insights.responseSlow'),
          noShowHigh: t('analytics.insights.noShowHigh'),
          peakHour: t('analytics.insights.peakHour'),
          takeoverHigh: t('analytics.insights.takeoverHigh'),
          pipelineStrong: t('analytics.insights.pipelineStrong'),
          bestDay: t('analytics.insights.bestDay'),
          worstDay: t('analytics.insights.worstDay'),
          noisyStreak: t('analytics.insights.noisyStreak'),
        }}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title={t('analytics.leadsTotal')}
          value={resumen?.leads_totales || 0}
          icon={Users}
          gradient="green"
          trend={trend(data.deltas.leads_totales)}
          sparkline={leadsSparkline}
          delay={0}
        />
        <StatCard
          title={t('analytics.appointmentsBooked')}
          value={resumen?.citas_agendadas || 0}
          icon={Calendar}
          gradient="blue"
          trend={trend(data.deltas.citas_agendadas)}
          sparkline={citasBookedSpark}
          delay={50}
        />
        <StatCard
          title={t('analytics.conversionRate')}
          value={resumen?.tasa_conversion || 0}
          suffix="%"
          decimals={1}
          icon={Target}
          gradient="green"
          trend={trend(data.deltas.tasa_conversion)}
          sparkline={conversionSpark}
          delay={100}
        />
        <StatCard
          title={t('analytics.cancellationRate')}
          value={resumen?.tasa_cancelacion || 0}
          suffix="%"
          decimals={1}
          icon={XCircle}
          gradient={cancelacionColor}
          trend={trend(data.deltas.tasa_cancelacion)}
          sparkline={cancelSpark}
          delay={150}
        />
        <StatCard
          title={t('analytics.timeToAppointment')}
          value={resumen?.tiempo_promedio_horas_hasta_cita || 0}
          suffix={t('analytics.hours')}
          decimals={1}
          icon={Clock}
          gradient="orange"
          delay={200}
        />
        <StatCard
          title={t('analytics.totalMessages')}
          value={mensajesTotal}
          icon={MessageSquare}
          gradient="blue"
          trend={trend(data.deltas.mensajes_total)}
          delay={250}
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold tracking-wide uppercase text-muted">
            {t('analytics.revenue.title')}
          </h2>
        </div>
        <RevenueCards
          pipelineValue={revenue.pipeline}
          closedValue={revenue.closed}
          avgPerLead={revenue.avg}
          labels={{
            pipeline: t('analytics.revenue.pipeline'),
            closed: t('analytics.revenue.closed'),
            avgPerLead: t('analytics.revenue.avgPerLead'),
            pipelineHint: t('analytics.revenue.pipelineHint'),
            closedHint: t('analytics.revenue.closedHint'),
            avgHint: t('analytics.revenue.avgHint'),
          }}
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold tracking-wide uppercase text-muted">
            {t('analytics.goals.title')}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GoalCard
            storageKey="impulsa_goal_leads_month"
            defaultGoal={100}
            currentValue={monthProgress.leadsThisMonth}
            daysElapsed={monthProgress.daysElapsed}
            daysInMonth={monthProgress.daysInMonth}
            icon={Users}
            labels={{
              title: t('analytics.goals.leadsTitle'),
              subtitle: t('analytics.goals.monthSubtitle'),
              forecast: t('analytics.goals.forecast'),
              onTrack: t('analytics.goals.onTrack'),
              behind: t('analytics.goals.behind'),
              ahead: t('analytics.goals.ahead'),
              goal: t('analytics.goals.ofGoal'),
              edit: t('analytics.goals.edit'),
              save: t('analytics.goals.save'),
              cancel: t('analytics.goals.cancel'),
            }}
          />
          <GoalCard
            storageKey="impulsa_goal_citas_month"
            defaultGoal={30}
            currentValue={monthProgress.citasThisMonth}
            daysElapsed={monthProgress.daysElapsed}
            daysInMonth={monthProgress.daysInMonth}
            icon={Calendar}
            labels={{
              title: t('analytics.goals.citasTitle'),
              subtitle: t('analytics.goals.monthSubtitle'),
              forecast: t('analytics.goals.forecast'),
              onTrack: t('analytics.goals.onTrack'),
              behind: t('analytics.goals.behind'),
              ahead: t('analytics.goals.ahead'),
              goal: t('analytics.goals.ofGoal'),
              edit: t('analytics.goals.edit'),
              save: t('analytics.goals.save'),
              cancel: t('analytics.goals.cancel'),
            }}
          />
        </div>
      </div>

      <ColdLeadsCard
        leads={coldLeads}
        hoursThreshold={COLD_THRESHOLD_HOURS}
        labels={{
          title: t('analytics.cold.title'),
          subtitle: t('analytics.cold.subtitle'),
          cta: t('analytics.cold.cta'),
          noneTitle: t('analytics.cold.noneTitle'),
          noneHint: t('analytics.cold.noneHint'),
          hoursSuffix: t('analytics.cold.hoursSuffix'),
        }}
        onSelect={() => router.push('/leads')}
      />

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Bot className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold tracking-wide uppercase text-muted">
            {t('analytics.botPerf.title')}
          </h2>
        </div>
        <div className="mb-4">
          <ResponseTimeCard
            data={data.tiempoRespuesta}
            labels={{
              title: t('analytics.responseTime.title'),
              hint: t('analytics.responseTime.hint'),
              emptyTitle: t('analytics.responseTime.emptyTitle'),
              emptyHint: t('analytics.responseTime.emptyHint'),
              conversations: t('analytics.responseTime.conversations'),
              faster: t('analytics.responseTime.faster'),
              slower: t('analytics.responseTime.slower'),
              unchanged: t('analytics.responseTime.unchanged'),
            }}
          />
        </div>
        <BotPerformanceCards
          data={data.rendimientoBot}
          labels={{
            noReply: t('analytics.botPerf.noReply'),
            noReplyHint: t('analytics.botPerf.noReplyHint'),
            msgsToAppt: t('analytics.botPerf.msgsToAppt'),
            msgsToApptHint: t('analytics.botPerf.msgsToApptHint'),
            msgsNoAppt: t('analytics.botPerf.msgsNoAppt'),
            msgsNoApptHint: t('analytics.botPerf.msgsNoApptHint'),
          }}
        />
        <div className="mt-4">
          <LeadQuality
            leads={leads}
            labels={{
              qualityTitle: t('analytics.quality.title'),
              qualitySubtitle: t('analytics.quality.subtitle'),
              qualityHigh: t('analytics.quality.high'),
              qualityMedium: t('analytics.quality.medium'),
              qualityLow: t('analytics.quality.low'),
              takeoverTitle: t('analytics.takeover.title'),
              takeoverSubtitle: t('analytics.takeover.subtitle'),
              takeoverOf: t('analytics.takeover.of'),
              takeoverLeads: t('analytics.takeover.leads'),
            }}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold tracking-wide uppercase text-muted">
            {t('analytics.kb.sectionTitle')}
          </h2>
        </div>
        <KbUsageCard
          data={data.kb}
          locale={locale}
          onSelectEntry={(id) => router.push(`/knowledge?id=${encodeURIComponent(id)}`)}
          labels={{
            title: t('analytics.kb.title'),
            subtitle: t('analytics.kb.subtitle'),
            hitRate: t('analytics.kb.hitRate'),
            hitRateHint: t('analytics.kb.hitRateHint'),
            totalUses: t('analytics.kb.totalUses'),
            totalUsesHint: t('analytics.kb.totalUsesHint'),
            coverage: t('analytics.kb.coverage'),
            coverageHint: t('analytics.kb.coverageHint'),
            topTitle: t('analytics.kb.topTitle'),
            topSubtitle: t('analytics.kb.topSubtitle'),
            uses: t('analytics.kb.uses'),
            lastUsed: t('analytics.kb.lastUsed'),
            never: t('analytics.kb.never'),
            empty: t('analytics.kb.empty'),
            emptyHint: t('analytics.kb.emptyHint'),
            unused: t('analytics.kb.unused'),
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div
          className="rounded-2xl border border-border bg-card p-6 theme-transition animate-fade-up"
          style={{ animationDelay: '100ms' }}
        >
          <div className="flex items-center justify-between mb-5 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">{t('analytics.leadsPerDay')}</h3>
            </div>
            {leadsComparePrev.length > 0 && (
              <button
                type="button"
                onClick={() => setCompareLeads((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                  compareLeads
                    ? 'bg-foreground text-background'
                    : 'text-muted hover:text-foreground hover:bg-card-hover border border-border'
                }`}
                aria-pressed={compareLeads}
              >
                <span
                  className="w-3 h-[2px] rounded-full"
                  style={{
                    background: compareLeads
                      ? 'var(--color-background)'
                      : 'var(--color-muted)',
                    borderTop: compareLeads ? 'none' : '1px dashed var(--color-muted)',
                  }}
                />
                {t('analytics.compare.toggle')}
              </button>
            )}
          </div>
          <div className="h-44">
            {leadsSparkline.length >= 2 ? (
              <LineChart
                data={leadsSparkline}
                labels={leadsLabels}
                seriesLabel={t('analytics.leadsTotal')}
                compareData={compareLeads ? leadsComparePrev : undefined}
                compareLabel={t('analytics.compare.previous')}
              />
            ) : (
              <EmptyState
                icon={Inbox}
                title={t('analytics.noData')}
                hint={t('analytics.emptyHint.line')}
                compact
              />
            )}
          </div>
        </div>

        <div
          className="rounded-2xl border border-border bg-card p-6 theme-transition animate-fade-up"
          style={{ animationDelay: '160ms' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold">
                {t('analytics.appointmentsPerDay')}
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                {t('analytics.booked')}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent-red/70" />
                {t('analytics.cancelled')}
              </span>
            </div>
          </div>
          <div className="h-44">
            {citasBars.length > 0 ? (
              <StackedBarChart
                data={citasBars}
                labelBooked={t('analytics.booked')}
                labelCancelled={t('analytics.cancelled')}
              />
            ) : (
              <EmptyState
                icon={Calendar}
                title={t('analytics.noData')}
                hint={t('analytics.emptyHint.bar')}
                compact
              />
            )}
          </div>
        </div>
      </div>

      <div
        className="rounded-2xl border border-border bg-card p-6 theme-transition animate-fade-up"
        style={{ animationDelay: '200ms' }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Clock3 className="w-4 h-4 text-primary" />
          <div>
            <h3 className="text-sm font-semibold">{t('analytics.hourly.title')}</h3>
            <p className="text-[10px] text-muted">{t('analytics.hourly.subtitle')}</p>
          </div>
        </div>
        {data.actividadHora.length === 0 ? (
          <EmptyState
            icon={Clock3}
            title={t('analytics.noData')}
            hint={t('analytics.emptyHint.hourly')}
            compact
          />
        ) : (
          <HourlyActivityChart
            data={data.actividadHora}
            labels={{
              bot: t('analytics.hourly.bot'),
              clients: t('analytics.hourly.clients'),
              peakHour: t('analytics.hourly.peakHour'),
              hourSuffix: t('analytics.hourly.hourSuffix'),
            }}
          />
        )}
      </div>

      <LeadsHeatmap
        leads={leads}
        labels={{
          title: t('analytics.heatmap.title'),
          subtitle: t('analytics.heatmap.subtitle'),
          less: t('analytics.heatmap.less'),
          more: t('analytics.heatmap.more'),
          leadsSuffix: t('analytics.heatmap.leadsSuffix'),
          emptyTitle: t('analytics.heatmap.emptyTitle'),
          emptyHint: t('analytics.heatmap.emptyHint'),
          weekdays: [
            t('analytics.heatmap.sun'),
            t('analytics.heatmap.mon'),
            t('analytics.heatmap.tue'),
            t('analytics.heatmap.wed'),
            t('analytics.heatmap.thu'),
            t('analytics.heatmap.fri'),
            t('analytics.heatmap.sat'),
          ],
        }}
      />

      <div
        className="rounded-2xl border border-border bg-card p-6 theme-transition animate-fade-up"
        style={{ animationDelay: '220ms' }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">{t('analytics.funnel')}</h3>
        </div>
        {data.embudo.length === 0 ? (
          <EmptyState
            icon={Target}
            title={t('analytics.noData')}
            hint={t('analytics.emptyHint.funnel')}
          />
        ) : (
          <Funnel stages={data.embudo} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div
          className="rounded-2xl border border-border bg-card p-6 theme-transition animate-fade-up"
          style={{ animationDelay: '260ms' }}
        >
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">{t('analytics.byNiche')}</h3>
          </div>
          {data.nichos.length === 0 ? (
            <EmptyState
              icon={Flame}
              title={t('analytics.noData')}
              hint={t('analytics.emptyHint.niche')}
            />
          ) : (
            <NicheBars
              nichos={data.nichos}
              labelViables={t('analytics.viables')}
              onSelect={(nicho) =>
                router.push(`/leads?q=${encodeURIComponent(nicho)}`)
              }
            />
          )}
        </div>

        <div className="animate-fade-up" style={{ animationDelay: '280ms' }}>
          <SourceAttribution
            leads={leads}
            onSelect={(_, value) =>
              router.push(`/leads?q=${encodeURIComponent(value)}`)
            }
            labels={{
              title: t('analytics.source.title'),
              subtitle: t('analytics.source.subtitle'),
              tabOrigen: t('analytics.source.tabOrigen'),
              tabFuente: t('analytics.source.tabFuente'),
              unknown: t('analytics.source.unknown'),
              leads: t('analytics.source.leads'),
              bookings: t('analytics.source.bookings'),
              conversion: t('analytics.source.conversion'),
              pipeline: t('analytics.source.pipeline'),
              emptyTitle: t('analytics.source.emptyTitle'),
              emptyHint: t('analytics.source.emptyHint'),
            }}
          />
        </div>

        <div
          className="rounded-2xl border border-border bg-card p-6 theme-transition animate-fade-up"
          style={{ animationDelay: '340ms' }}
        >
          <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold">
                {t('analytics.appointmentStatus')}
              </h3>
            </div>
            {estadoSlices.length > 0 && noShowRate > 0 && (
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold ${
                  noShowRate > 20
                    ? 'bg-accent-red/12 text-accent-red'
                    : 'bg-accent-orange/12 text-accent-orange'
                }`}
              >
                <UserX className="w-3 h-3" />
                {t('analytics.noShow')} {noShowRate.toFixed(1)}%
              </span>
            )}
          </div>
          {estadoSlices.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title={t('analytics.noData')}
              hint={t('analytics.emptyHint.status')}
            />
          ) : (
            <>
              <Donut slices={estadoSlices} />
              <div className="mt-4 space-y-1.5">
                {estadoSlices.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="text-muted">{s.label}</span>
                    </span>
                    <span className="text-foreground font-medium tabular-nums">
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div
        className="rounded-2xl border border-border bg-card p-6 theme-transition animate-fade-up"
        style={{ animationDelay: '400ms' }}
      >
        <div className="flex items-center gap-2 mb-5">
          <CalendarCheck className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">
            {t('analytics.upcomingAppointments')}
          </h3>
        </div>
        {data.proximasCitas.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={t('analytics.noUpcoming')}
            hint={t('analytics.emptyHint.upcoming')}
          />
        ) : (
          <UpcomingCards
            citas={data.proximasCitas}
            locale={locale}
            labelReminder={t('analytics.reminder')}
          />
        )}
      </div>

      <div
        className="rounded-2xl border border-border bg-card p-6 theme-transition animate-fade-up"
        style={{ animationDelay: '460ms' }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Activity className="w-4 h-4 text-accent-orange" />
          <h3 className="text-sm font-semibold">{t('analytics.recentActivity')}</h3>
        </div>
        {data.actividad.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={t('analytics.noActivity')}
            hint={t('analytics.emptyHint.activity')}
          />
        ) : (
          <ActivityFeed
            items={data.actividad}
            locale={locale}
            typeLabel={typeLabelMap}
            groupLabels={{
              today: t('analytics.groups.today'),
              yesterday: t('analytics.groups.yesterday'),
              earlier: t('analytics.groups.earlier'),
            }}
          />
        )}
      </div>
    </div>
  )
}
