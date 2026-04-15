'use client'

import { type LucideIcon } from 'lucide-react'
import { AnimatedNumber } from './animated-number'

interface StatCardProps {
  title: string
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  icon: LucideIcon
  trend?: number
  gradient: 'green' | 'orange' | 'red' | 'blue'
}

const gradientMap = {
  green: 'from-primary/20 to-primary/5',
  orange: 'from-accent-orange/20 to-accent-orange/5',
  red: 'from-accent-red/20 to-accent-red/5',
  blue: 'from-blue-500/20 to-blue-500/5',
}

const iconBgMap = {
  green: 'bg-primary/10 text-primary',
  orange: 'bg-accent-orange/10 text-accent-orange',
  red: 'bg-accent-red/10 text-accent-red',
  blue: 'bg-blue-500/10 text-blue-400',
}

export function StatCard({
  title,
  value,
  prefix,
  suffix,
  decimals,
  icon: Icon,
  trend,
  gradient,
}: StatCardProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border border-border bg-card p-6
        transition-all duration-300 hover:border-border-hover hover:bg-card-hover
        hover:shadow-lg hover:shadow-primary/5 group
      `}
    >
      {/* Gradient accent */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradientMap[gradient]} opacity-50`}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted font-medium">{title}</span>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgMap[gradient]} transition-transform duration-300 group-hover:scale-105`}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>

        <div className="text-3xl font-bold tracking-tight">
          <AnimatedNumber
            value={value}
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
          />
        </div>

        {trend !== undefined && (
          <div className="mt-2 flex items-center gap-1">
            <span
              className={`text-sm font-medium ${
                trend >= 0 ? 'text-primary' : 'text-accent-red'
              }`}
            >
              {trend >= 0 ? '+' : ''}
              {trend}%
            </span>
            <span className="text-xs text-muted">vs last month</span>
          </div>
        )}
      </div>
    </div>
  )
}
