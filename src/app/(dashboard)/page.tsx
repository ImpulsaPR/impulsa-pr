'use client'

import { useState, useMemo } from 'react'
import { Users, DollarSign, CheckCircle, TrendingUp, Plus, CalendarDays, Bot, Flame, Zap, ArrowRight } from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { ConversionFunnel } from '@/components/dashboard/conversion-funnel'
import { CreateLeadModal } from '@/components/leads/create-lead-modal'
import { useLeads } from '@/hooks/use-leads'
import { useCliente } from '@/hooks/use-cliente'
import { useToast } from '@/components/ui/toast'
import { StatCardSkeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/lib/i18n'
import type { Lead } from '@/lib/types'

type TimeRange = 'today' | '7d' | '30d' | 'all'

const DAY_MS = 24 * 60 * 60 * 1000

function getDateThreshold(range: TimeRange): Date | null {
  if (range === 'all') return null
  const now = new Date()
  if (range === 'today') {
    now.setHours(0, 0, 0, 0)
    return now
  }
  const days = range === '7d' ? 7 : 30
  return new Date(Date.now() - days * DAY_MS)
}

function getPreviousPeriodThreshold(range: TimeRange): { start: Date; end: Date } | null {
  if (range === 'all') return null
  const now = Date.now()
  if (range === 'today') {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const yesterdayStart = new Date(todayStart.getTime() - DAY_MS)
    return { start: yesterdayStart, end: todayStart }
  }
  const days = range === '7d' ? 7 : 30
  return {
    start: new Date(now - days * 2 * DAY_MS),
    end: new Date(now - days * DAY_MS),
  }
}

function calcTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

function buildSparkline(leads: Lead[], days: number): number[] {
  const now = Date.now()
  const counts: number[] = []
  for (let i = days - 1; i >= 0; i--) {
    const dayStart = now - (i + 1) * DAY_MS
    const dayEnd = now - i * DAY_MS
    counts.push(
      leads.filter((l) => {
        const t = new Date(l.created_at).getTime()
        return t >= dayStart && t < dayEnd
      }).length
    )
  }
  return counts
}

function getGreeting(locale: string): string {
  const hour = new Date().getHours()
  if (locale === 'es') {
    if (hour < 12) return 'Buenos dias'
    if (hour < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { leads, loading, refetch } = useLeads()
  const { cliente } = useCliente()
  const { toast } = useToast()
  const { t, locale } = useTranslation()
  const [modalOpen, setModalOpen] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRange>('all')

  const greeting = getGreeting(locale)
  const firstName = cliente?.nombre?.split(' ')[0] || ''

  const timeFilters: { label: string; value: TimeRange }[] = [
    { label: t('time.today'), value: 'today' },
    { label: t('time.7d'), value: '7d' },
    { label: t('time.30d'), value: '30d' },
    { label: t('time.all'), value: 'all' },
  ]

  const filteredLeads = useMemo(() => {
    const threshold = getDateThreshold(timeRange)
    if (!threshold) return leads
    return leads.filter((l) => new Date(l.created_at) >= threshold)
  }, [leads, timeRange])

  const prevLeads = useMemo(() => {
    const period = getPreviousPeriodThreshold(timeRange)
    if (!period) return []
    return leads.filter((l) => {
      const t = new Date(l.created_at).getTime()
      return t >= period.start.getTime() && t < period.end.getTime()
    })
  }, [leads, timeRange])

  const stats = useMemo(() => {
    const total = filteredLeads.length
    const cerrados = filteredLeads.filter((l) => l.estado === 'cerrado').length
    const revenue = filteredLeads.reduce((sum, l) => sum + (l.valor_real || 0), 0)
    const conversionRate = total > 0 ? (cerrados / total) * 100 : 0

    const prevTotal = prevLeads.length
    const prevCerrados = prevLeads.filter((l) => l.estado === 'cerrado').length
    const prevRevenue = prevLeads.reduce((sum, l) => sum + (l.valor_real || 0), 0)
    const prevConversion = prevTotal > 0 ? (prevCerrados / prevTotal) * 100 : 0

    return {
      totalLeads: total,
      revenue,
      cerrados,
      conversionRate,
      trends: {
        leads: calcTrend(total, prevTotal),
        revenue: calcTrend(revenue, prevRevenue),
        cerrados: calcTrend(cerrados, prevCerrados),
        conversion: calcTrend(conversionRate, prevConversion),
      },
    }
  }, [filteredLeads, prevLeads])

  // Sparkline data (last 7 days)
  const sparklines = useMemo(() => ({
    leads: buildSparkline(leads, 7),
    revenue: (() => {
      const now = Date.now()
      const data: number[] = []
      for (let i = 6; i >= 0; i--) {
        const dayStart = now - (i + 1) * DAY_MS
        const dayEnd = now - i * DAY_MS
        data.push(
          leads
            .filter((l) => {
              const t = new Date(l.created_at).getTime()
              return t >= dayStart && t < dayEnd
            })
            .reduce((s, l) => s + (l.valor_real || 0), 0)
        )
      }
      return data
    })(),
    closed: (() => {
      const now = Date.now()
      const data: number[] = []
      for (let i = 6; i >= 0; i--) {
        const dayStart = now - (i + 1) * DAY_MS
        const dayEnd = now - i * DAY_MS
        data.push(
          leads.filter((l) => {
            const t = new Date(l.created_at).getTime()
            return t >= dayStart && t < dayEnd && l.estado === 'cerrado'
          }).length
        )
      }
      return data
    })(),
  }), [leads])

  // Extra metrics
  const extraMetrics = useMemo(() => {
    const totalMessages = leads.reduce((sum, l) => sum + (l.historial_mensajes?.length || 0), 0)
    const aiMessages = leads.reduce(
      (sum, l) => sum + (l.historial_mensajes?.filter((m) => m.rol === 'bot').length || 0), 0
    )
    const aiRate = totalMessages > 0 ? Math.round((aiMessages / totalMessages) * 100) : 0

    const pipelineValue = leads
      .filter((l) => l.estado !== 'cerrado')
      .reduce((sum, l) => sum + (l.valor_estimado || 0), 0)

    return { aiRate, pipelineValue }
  }, [leads])

  // Hot leads: alto interés + actividad reciente
  const hotLeads = useMemo(() => {
    return leads
      .filter((l) => l.nivel_interes === 'alto' && l.estado !== 'cerrado')
      .sort((a, b) => new Date(b.fecha_ultimo_contacto).getTime() - new Date(a.fecha_ultimo_contacto).getTime())
      .slice(0, 5)
  }, [leads])

  const handleCreated = () => {
    refetch()
    toast(t('createLead.created'))
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}{firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="text-sm text-muted mt-1">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all duration-200 hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          {t('dashboard.newLead')}
        </button>
      </div>

      {/* Time Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <CalendarDays className="w-4 h-4 text-muted" />
        {timeFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setTimeRange(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 active:scale-[0.97] ${
              timeRange === f.value
                ? 'bg-foreground text-background'
                : 'text-muted hover:text-foreground hover:bg-border/40 border border-transparent'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Stat Cards — primary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title={t('dashboard.totalLeads')}
              value={stats.totalLeads}
              icon={Users}
              gradient="green"
              trend={timeRange !== 'all' ? stats.trends.leads : undefined}
              sparkline={sparklines.leads}
            />
            <StatCard
              title={t('dashboard.revenue')}
              value={stats.revenue}
              prefix="$"
              icon={DollarSign}
              gradient="orange"
              trend={timeRange !== 'all' ? stats.trends.revenue : undefined}
              sparkline={sparklines.revenue}
            />
            <StatCard
              title={t('dashboard.closedLeads')}
              value={stats.cerrados}
              icon={CheckCircle}
              gradient="red"
              trend={timeRange !== 'all' ? stats.trends.cerrados : undefined}
              sparkline={sparklines.closed}
            />
            <StatCard
              title={t('dashboard.conversionRate')}
              value={stats.conversionRate}
              suffix="%"
              decimals={1}
              icon={TrendingUp}
              gradient="blue"
              trend={timeRange !== 'all' ? stats.trends.conversion : undefined}
            />
          </>
        )}
      </div>

      {/* Secondary metrics row */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* Pipeline Value */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 hover:border-border-hover hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group theme-transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs sm:text-sm text-muted font-medium">{t('dashboard.pipelineValue')}</span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-accent-yellow/15 text-accent-yellow transition-transform duration-300 group-hover:scale-110">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="text-3xl sm:text-4xl font-black tracking-tighter">
              ${extraMetrics.pipelineValue.toLocaleString()}
            </p>
            <p className="text-[10px] sm:text-xs text-muted mt-2">
              {leads.filter((l) => l.estado !== 'cerrado').length} {t('dashboard.openLeads')}
            </p>
          </div>

          {/* AI Response Rate */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 hover:border-border-hover hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group theme-transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs sm:text-sm text-muted font-medium">{t('dashboard.aiRate')}</span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-primary/15 text-primary transition-transform duration-300 group-hover:scale-110">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="text-3xl sm:text-4xl font-black tracking-tighter">
              {extraMetrics.aiRate}%
            </p>
            <div className="mt-2 h-1.5 rounded-full bg-border/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-1000"
                style={{ width: `${extraMetrics.aiRate}%` }}
              />
            </div>
            <p className="text-[10px] sm:text-xs text-muted mt-1.5">{t('dashboard.aiRateDesc')}</p>
          </div>
        </div>
      )}

      {/* Funnel + Activity + Hot Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ConversionFunnel />
        <RecentActivity />

        {/* Hot Leads */}
        <div className="rounded-2xl border border-border bg-card p-6 theme-transition hover:shadow-lg hover:shadow-foreground/5 transition-all duration-300">
          <div className="flex items-center gap-2 mb-5">
            <Flame className="w-4 h-4 text-accent-orange" />
            <h3 className="text-sm font-semibold text-foreground">{t('dashboard.hotLeads')}</h3>
          </div>
          <div className="space-y-3">
            {hotLeads.length === 0 ? (
              <div className="text-center py-8">
                <Flame className="w-10 h-10 mx-auto mb-3 text-muted/20" />
                <p className="text-sm text-muted">{t('dashboard.noHotLeads')}</p>
                <p className="text-xs text-muted/60 mt-1">{t('dashboard.hotLeadsDesc')}</p>
              </div>
            ) : (
              hotLeads.map((lead) => {
                const initials = lead.nombre
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()

                return (
                  <div
                    key={lead.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-card-hover transition-colors group/hot"
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent-orange/10 border border-accent-orange/20 flex items-center justify-center text-[11px] font-bold text-accent-orange flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{lead.nombre}</p>
                      <p className="text-[10px] text-muted truncate">
                        {lead.tipo_negocio || lead.etapa || '—'} · ${(lead.valor_estimado || 0).toLocaleString()}
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted/30 group-hover/hot:text-foreground transition-colors flex-shrink-0" />
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <CreateLeadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  )
}
