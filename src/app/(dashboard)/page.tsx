'use client'

import { useState, useMemo } from 'react'
import { Users, DollarSign, CheckCircle, TrendingUp, Plus, CalendarDays, Bot, Flame, Zap, ArrowRight, Sparkles, MessageSquare, BarChart3, Target } from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { ConversionFunnel } from '@/components/dashboard/conversion-funnel'
import { CreateLeadModal } from '@/components/leads/create-lead-modal'
import { useLeads } from '@/hooks/use-leads'
import { useCliente } from '@/hooks/use-cliente'
import { useToast } from '@/components/ui/toast'
import { StatCardSkeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/lib/i18n'
import { Tooltip } from '@/components/ui/tooltip'
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
    <div className="space-y-6">
      {/* Header — greeting premium con serif + italic accent */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-up">
        <div className="min-w-0">
          <h1 className="font-display text-3xl sm:text-4xl tracking-tight leading-[1.05] truncate">
            {greeting}{firstName ? <>, <span className="italic text-primary">{firstName}</span></> : ''}
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1.5">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1">
            <CalendarDays className="w-4 h-4 text-muted" aria-hidden />
            <div className="flex items-center bg-card border border-border rounded-xl p-1">
              {timeFilters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setTimeRange(f.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 active:scale-[0.97] ${
                    timeRange === f.value
                      ? 'bg-foreground text-background shadow-sm'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 active:scale-[0.97] transition-all duration-200 hover:shadow-lg hover:shadow-foreground/10"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('dashboard.newLead')}</span>
          </button>
        </div>
      </div>

      {/* Empty state / onboarding */}
      {!loading && leads.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 text-center theme-transition animate-fade-up relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,204,106,0.06),transparent_60%)]" />
          <div className="absolute inset-0 dot-grid opacity-30" />

          <div className="relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6 border border-primary/10">
              <Sparkles className="w-9 h-9 text-primary/60" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">{t('onboarding.welcome')}</h2>
            <p className="text-sm text-muted mt-2 max-w-md mx-auto">{t('onboarding.description')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-xl mx-auto">
              {[
                { icon: Users, label: t('onboarding.step1'), desc: t('onboarding.step1Desc'), num: '01' },
                { icon: MessageSquare, label: t('onboarding.step2'), desc: t('onboarding.step2Desc'), num: '02' },
                { icon: BarChart3, label: t('onboarding.step3'), desc: t('onboarding.step3Desc'), num: '03' },
              ].map((step, i) => (
                <div key={step.label} className={`rounded-xl border border-border/50 p-4 text-left hover:border-border-hover hover:bg-card-hover transition-all duration-300 animate-fade-up stagger-${i + 2}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono text-muted/50">{step.num}</span>
                    <step.icon className="w-4 h-4 text-muted" />
                  </div>
                  <p className="text-sm font-medium">{step.label}</p>
                  <p className="text-[10px] text-muted mt-1 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 active:scale-[0.97] transition-all duration-200 hover:shadow-lg hover:shadow-foreground/10"
            >
              <Plus className="w-4 h-4" />
              {t('onboarding.createFirst')}
            </button>
          </div>
        </div>
      )}

      {/* Stat Cards — primary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} delay={i * 100} />)
        ) : (
          <>
            <StatCard
              title={t('dashboard.totalLeads')}
              value={stats.totalLeads}
              icon={Users}
              gradient="green"
              trend={timeRange !== 'all' ? stats.trends.leads : undefined}
              sparkline={sparklines.leads}
              delay={50}
              tooltip={t('dashboard.tip.totalLeads')}
            />
            <StatCard
              title={t('dashboard.revenue')}
              value={stats.revenue}
              prefix="$"
              icon={DollarSign}
              gradient="orange"
              trend={timeRange !== 'all' ? stats.trends.revenue : undefined}
              sparkline={sparklines.revenue}
              delay={100}
              tooltip={t('dashboard.tip.revenue')}
            />
            <StatCard
              title={t('dashboard.closedLeads')}
              value={stats.cerrados}
              icon={CheckCircle}
              gradient="red"
              trend={timeRange !== 'all' ? stats.trends.cerrados : undefined}
              sparkline={sparklines.closed}
              delay={150}
              tooltip={t('dashboard.tip.closedLeads')}
            />
            <StatCard
              title={t('dashboard.conversionRate')}
              value={stats.conversionRate}
              suffix="%"
              decimals={1}
              icon={TrendingUp}
              gradient="blue"
              trend={timeRange !== 'all' ? stats.trends.conversion : undefined}
              delay={200}
              tooltip={t('dashboard.tip.conversionRate')}
            />
          </>
        )}
      </div>

      {/* Funnel (2/3) + Hot Leads (1/3) — action + insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 animate-fade-up stagger-2">
          <ConversionFunnel />
        </div>

        {/* Hot Leads — actionable column */}
        <div className="rounded-2xl border border-border bg-card p-6 theme-transition glass-card hover:shadow-lg hover:shadow-foreground/5 transition-all duration-300 animate-fade-up stagger-3 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-accent-orange/10 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 text-accent-orange" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{t('dashboard.hotLeads')}</h3>
            </div>
            <div className="space-y-2">
              {hotLeads.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-border/30 flex items-center justify-center mx-auto mb-4">
                    <Target className="w-7 h-7 text-muted/30" />
                  </div>
                  <p className="text-sm text-muted font-medium">{t('dashboard.noHotLeads')}</p>
                  <p className="text-xs text-muted/60 mt-1.5 max-w-[200px] mx-auto leading-relaxed">{t('dashboard.hotLeadsDesc')}</p>
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
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-card-hover transition-all duration-200 group/hot cursor-default"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-orange/20 to-accent-orange/5 border border-accent-orange/15 flex items-center justify-center text-[11px] font-bold text-accent-orange flex-shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{lead.nombre}</p>
                        <p className="text-[10px] text-muted truncate">
                          {lead.tipo_negocio || lead.etapa || '—'} · ${(lead.valor_estimado || 0).toLocaleString()}
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted/20 group-hover/hot:text-foreground group-hover/hot:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary: Pipeline Value + AI Rate + Recent Activity */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Pipeline Value — compact */}
          <div className="rounded-2xl border border-border bg-card p-5 theme-transition glass-card animate-fade-up stagger-3">
            <div className="flex items-center justify-between mb-3">
              <Tooltip content={t('dashboard.tip.pipelineValue')} position="bottom">
                <span className="text-xs text-muted font-medium cursor-help border-b border-dashed border-muted/30">{t('dashboard.pipelineValue')}</span>
              </Tooltip>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-accent-yellow/12 text-accent-yellow">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black tracking-tighter animate-count-up">
              ${extraMetrics.pipelineValue.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted mt-2">
              {leads.filter((l) => l.estado !== 'cerrado').length} {t('dashboard.openLeads')}
            </p>
          </div>

          {/* AI Response Rate — compact */}
          <div className="rounded-2xl border border-border bg-card p-5 theme-transition glass-card animate-fade-up stagger-3">
            <div className="flex items-center justify-between mb-3">
              <Tooltip content={t('dashboard.tip.aiRate')} position="bottom">
                <span className="text-xs text-muted font-medium cursor-help border-b border-dashed border-muted/30">{t('dashboard.aiRate')}</span>
              </Tooltip>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/12 text-primary">
                <Bot className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black tracking-tighter animate-count-up">
              {extraMetrics.aiRate}%
            </p>
            <div className="mt-2 h-1.5 rounded-full bg-border/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-1000"
                style={{ width: `${extraMetrics.aiRate}%` }}
              />
            </div>
            <p className="text-[10px] text-muted mt-1.5">{t('dashboard.aiRateDesc')}</p>
          </div>

          {/* Recent Activity — feed */}
          <div className="animate-fade-up stagger-3">
            <RecentActivity />
          </div>
        </div>
      )}

      {/* Modal */}
      <CreateLeadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  )
}
