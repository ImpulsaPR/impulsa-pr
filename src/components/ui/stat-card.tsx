'use client'

import { type LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { AnimatedNumber } from './animated-number'
import { Tooltip } from './tooltip'
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
  delay?: number
  tooltip?: string
}

const gradientMap = {
  green: 'from-primary/15 to-primary/5',
  orange: 'from-accent-orange/15 to-accent-orange/5',
  red: 'from-accent-red/15 to-accent-red/5',
  blue: 'from-blue-500/15 to-blue-500/5',
}

const iconBgMap = {
  green: 'bg-primary/12 text-primary',
  orange: 'bg-accent-orange/12 text-accent-orange',
  red: 'bg-accent-red/12 text-accent-red',
  blue: 'bg-blue-500/12 text-blue-400',
}

const glowMap = {
  green: 'glow-green',
  orange: 'glow-orange',
  red: 'glow-red',
  blue: 'glow-blue',
}

const sparkColorMap = {
  green: '#00CC6A',
  orange: '#F97316',
  red: '#EF4444',
  blue: '#3B82F6',
}

const accentLineMap = {
  green: 'bg-primary',
  orange: 'bg-accent-orange',
  red: 'bg-accent-red',
  blue: 'bg-blue-500',
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
    <svg width={w} height={h} className="overflow-visible opacity-80 group-hover:opacity-100 transition-opacity duration-300">
      <defs>
        <linearGradient id={`spark-fill-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
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
      {points.length > 0 && (
        <>
          <circle
            cx={points[points.length - 1].split(',')[0]}
            cy={points[points.length - 1].split(',')[1]}
            r="2.5"
            fill={color}
            className="animate-pulse"
          />
          <circle
            cx={points[points.length - 1].split(',')[0]}
            cy={points[points.length - 1].split(',')[1]}
            r="5"
            fill={color}
            opacity="0.2"
            className="animate-pulse"
          />
        </>
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
  delay = 0,
  tooltip,
}: StatCardProps) {
  const { t } = useTranslation()

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6
        glass-card transition-all duration-300 hover:border-border-hover
        hover:shadow-xl hover:-translate-y-1
        active:scale-[0.98] group cursor-default
        animate-fade-up
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${accentLineMap[gradient]} opacity-40 group-hover:opacity-70 transition-opacity duration-300`} />

      {/* Gradient accent */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradientMap[gradient]} opacity-30 group-hover:opacity-50 transition-opacity duration-500`}
      />

      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc+')]" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          {tooltip ? (
            <Tooltip content={tooltip} position="bottom">
              <span className="text-xs sm:text-sm text-muted font-medium tracking-wide cursor-help border-b border-dashed border-muted/30">{title}</span>
            </Tooltip>
          ) : (
            <span className="text-xs sm:text-sm text-muted font-medium tracking-wide">{title}</span>
          )}
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${iconBgMap[gradient]} transition-transform duration-300 group-hover:scale-105`}
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="text-3xl sm:text-4xl lg:text-[2.5rem] font-black tracking-tighter animate-count-up">
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
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                trend > 0
                  ? 'bg-primary/10 text-primary'
                  : trend < 0
                  ? 'bg-accent-red/10 text-accent-red'
                  : 'bg-border/50 text-muted'
              }`}>
                {trend > 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : trend < 0 ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <Minus className="w-3 h-3" />
                )}
                {trend > 0 ? '+' : ''}{trend}%
              </div>
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
