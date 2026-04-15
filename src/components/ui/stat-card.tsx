'use client'

import { type LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { AnimatedNumber } from './animated-number'
import { useTranslation } from '@/lib/i18n'

interface StatCardProps {
  title: string
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  icon: LucideIcon
  trend?: number
  sparkline?: number[]
  gradient: 'green' | 'orange' | 'red' | 'blue'
}

const gradientMap = {
  green: 'from-primary/20 to-primary/5',
  orange: 'from-accent-orange/20 to-accent-orange/5',
  red: 'from-accent-red/20 to-accent-red/5',
  blue: 'from-blue-500/20 to-blue-500/5',
}

const iconBgMap = {
  green: 'bg-primary/15 text-primary',
  orange: 'bg-accent-orange/15 text-accent-orange',
  red: 'bg-accent-red/15 text-accent-red',
  blue: 'bg-blue-500/15 text-blue-400',
}

const shadowMap = {
  green: 'hover:shadow-primary/8',
  orange: 'hover:shadow-accent-orange/8',
  red: 'hover:shadow-accent-red/8',
  blue: 'hover:shadow-blue-500/8',
}

const sparkColorMap = {
  green: '#00CC6A',
  orange: '#F97316',
  red: '#EF4444',
  blue: '#3B82F6',
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const w = 80
  const h = 28
  const padding = 2

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (w - padding * 2)
    const y = h - padding - ((v - min) / range) * (h - padding * 2)
    return `${x},${y}`
  })

  const areaPoints = [
    `${padding},${h}`,
    ...points,
    `${w - padding},${h}`,
  ].join(' ')

  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-fill-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#spark-fill-${color.replace('#', '')})`}
      />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last point dot */}
      {points.length > 0 && (
        <circle
          cx={points[points.length - 1].split(',')[0]}
          cy={points[points.length - 1].split(',')[1]}
          r="2"
          fill={color}
        />
      )}
    </svg>
  )
}

export function StatCard({
  title,
  value,
  prefix,
  suffix,
  decimals,
  icon: Icon,
  trend,
  sparkline,
  gradient,
}: StatCardProps) {
  const { t } = useTranslation()

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6
        transition-all duration-300 hover:border-border-hover
        hover:shadow-xl ${shadowMap[gradient]} hover:-translate-y-0.5
        active:scale-[0.98] group cursor-default
      `}
    >
      {/* Gradient accent */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradientMap[gradient]} opacity-40`}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs sm:text-sm text-muted font-medium">{title}</span>
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${iconBgMap[gradient]} transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="text-3xl sm:text-4xl lg:text-[2.5rem] font-black tracking-tighter">
          <AnimatedNumber
            value={value}
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
          />
        </div>

        {/* Trend + Sparkline row */}
        <div className="mt-3 flex items-center justify-between gap-2">
          {trend !== undefined ? (
            <div className="flex items-center gap-1.5">
              {trend > 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
              ) : trend < 0 ? (
                <TrendingDown className="w-3.5 h-3.5 text-accent-red" />
              ) : (
                <Minus className="w-3.5 h-3.5 text-muted" />
              )}
              <span
                className={`text-xs font-semibold ${
                  trend > 0 ? 'text-primary' : trend < 0 ? 'text-accent-red' : 'text-muted'
                }`}
              >
                {trend > 0 ? '+' : ''}{trend}%
              </span>
              <span className="text-[10px] text-muted hidden sm:inline">{t('dashboard.vsPrev')}</span>
            </div>
          ) : (
            <div />
          )}
          {sparkline && sparkline.length >= 2 && (
            <Sparkline data={sparkline} color={sparkColorMap[gradient]} />
          )}
        </div>
      </div>
    </div>
  )
}
