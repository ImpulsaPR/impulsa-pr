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
  Menu,
  X,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Logo } from '@/components/ui/logo'
import { useTranslation } from '@/lib/i18n'
import { useSidebarCollapsed } from '@/hooks/use-sidebar'

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
  const { collapsed, toggle: toggleCollapsed } = useSidebarCollapsed()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useTranslation()

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const navContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-border">
        <Logo collapsed={collapsed && !mobileOpen} />
        {/* Desktop collapse button */}
        <button
          onClick={toggleCollapsed}
          className="hidden lg:block p-1.5 rounded-lg hover:bg-border/60 text-muted hover:text-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg hover:bg-border/60 text-muted hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
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
                active:scale-[0.98]
                ${
                  isActive
                    ? 'bg-foreground/10 text-foreground font-medium'
                    : 'text-muted hover:text-foreground hover:bg-foreground/5'
                }
              `}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-foreground rounded-r-full transition-all duration-300" />
              )}
              <item.icon
                className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                  isActive ? 'text-foreground' : ''
                }`}
              />
              {(!collapsed || mobileOpen) && (
                <span className="text-sm">{t(item.labelKey)}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4">
        <div
          className={`
            rounded-xl border border-border bg-foreground/5 p-3
            ${collapsed && !mobileOpen ? 'flex items-center justify-center' : ''}
          `}
        >
          <Zap className="w-4 h-4 text-muted flex-shrink-0" />
          {(!collapsed || mobileOpen) && (
            <div className="mt-2">
              <p className="text-xs font-medium text-foreground">{t('sidebar.automationsActive')}</p>
              <p className="text-[10px] text-muted mt-0.5">{t('sidebar.workflowsRunning')}</p>
            </div>
          )}
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl bg-card border border-border text-foreground hover:bg-card-hover transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`
          fixed left-0 top-0 h-screen z-50 lg:hidden
          flex flex-col bg-card border-r border-border
          w-[260px] transition-transform duration-300 ease-in-out
          theme-transition
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {navContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen z-40
          hidden lg:flex flex-col
          bg-card border-r border-border
          transition-all duration-300 ease-in-out
          theme-transition
          ${collapsed ? 'w-[72px]' : 'w-[240px]'}
        `}
      >
        {navContent}
      </aside>
    </>
  )
}
