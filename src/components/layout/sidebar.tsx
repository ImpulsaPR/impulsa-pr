'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  BarChart3,
  Kanban,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { Logo } from '@/components/ui/logo'
import { useTranslation } from '@/lib/i18n'

const navItems = [
  { href: '/', labelKey: 'nav.dashboard' as const, icon: LayoutDashboard },
  { href: '/leads', labelKey: 'nav.leads' as const, icon: Users },
  { href: '/pipeline', labelKey: 'nav.pipeline' as const, icon: Kanban },
  { href: '/conversations', labelKey: 'nav.conversations' as const, icon: MessageSquare },
  { href: '/analytics', labelKey: 'nav.analytics' as const, icon: BarChart3 },
  { href: '/settings', labelKey: 'nav.settings' as const, icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { t } = useTranslation()

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen z-40
        flex flex-col
        bg-card/80 backdrop-blur-xl
        border-r border-border
        transition-all duration-300 ease-in-out
        theme-transition
        ${collapsed ? 'w-[72px]' : 'w-[240px]'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-border">
        <Logo collapsed={collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-border/50 text-muted hover:text-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-200 group relative
                ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted hover:text-foreground hover:bg-border/30'
                }
              `}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
              )}
              <item.icon
                className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                  isActive ? 'text-primary' : ''
                }`}
              />
              {!collapsed && (
                <span className="text-sm font-medium">{t(item.labelKey)}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4">
        <div
          className={`
            rounded-xl border border-primary/20 bg-primary/5 p-3
            ${collapsed ? 'flex items-center justify-center' : ''}
          `}
        >
          <Zap className="w-4 h-4 text-primary flex-shrink-0" />
          {!collapsed && (
            <div className="mt-2">
              <p className="text-xs font-medium text-primary">{t('sidebar.automationsActive')}</p>
              <p className="text-[10px] text-muted mt-0.5">{t('sidebar.workflowsRunning')}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
