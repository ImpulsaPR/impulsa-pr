'use client'

import { useState, useMemo } from 'react'
import { Users, DollarSign, CheckCircle, TrendingUp, Plus, CalendarDays } from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { PipelineChart } from '@/components/dashboard/pipeline-chart'
import { CreateLeadModal } from '@/components/leads/create-lead-modal'
import { useLeads } from '@/hooks/use-leads'
import { useToast } from '@/components/ui/toast'
import { StatCardSkeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/lib/i18n'

type TimeRange = 'today' | '7d' | '30d' | 'all'

function getDateThreshold(range: TimeRange): Date | null {
  if (range === 'all') return null
  const now = new Date()
  if (range === 'today') {
    now.setHours(0, 0, 0, 0)
    return now
  }
  const days = range === '7d' ? 7 : 30
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

export default function DashboardPage() {
  const { leads, loading, refetch } = useLeads()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [modalOpen, setModalOpen] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRange>('all')

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

  const stats = useMemo(() => {
    const total = filteredLeads.length
    const cerrados = filteredLeads.filter((l) => l.estado === 'cerrado').length
    return {
      totalLeads: total,
      revenue: filteredLeads.reduce((sum, l) => sum + (l.valor_real || 0), 0),
      cerrados,
      conversionRate: total > 0 ? (cerrados / total) * 100 : 0,
    }
  }, [filteredLeads])

  const handleCreated = () => {
    refetch()
    toast(t('createLead.created'))
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-sm text-muted mt-1">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-background text-sm font-medium hover:bg-primary-dark transition-all duration-200 hover:shadow-lg hover:shadow-primary/20"
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
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              timeRange === f.value
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted hover:text-foreground hover:bg-border/30 border border-transparent'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title={t('dashboard.totalLeads')}
              value={stats.totalLeads}
              icon={Users}
              gradient="green"
            />
            <StatCard
              title={t('dashboard.revenue')}
              value={stats.revenue}
              prefix="$"
              icon={DollarSign}
              gradient="orange"
            />
            <StatCard
              title={t('dashboard.closedLeads')}
              value={stats.cerrados}
              icon={CheckCircle}
              gradient="red"
            />
            <StatCard
              title={t('dashboard.conversionRate')}
              value={stats.conversionRate}
              suffix="%"
              decimals={1}
              icon={TrendingUp}
              gradient="blue"
            />
          </>
        )}
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PipelineChart />
        <RecentActivity />
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
