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
  LifeBuoy,
  Sparkles,
  BookOpen,
  ShieldCheck,
} from 'lucide-react'
import { useState, useEffect, type ComponentType } from 'react'
import { Logo } from '@/components/ui/logo'
import { useTranslation } from '@/lib/i18n'
import { useSidebarCollapsed } from '@/hooks/use-sidebar'
import { useAdmin } from '@/hooks/use-admin'

const primaryNav = [
  { href: '/', labelKey: 'nav.dashboard' as const, icon: LayoutDashboard },
  { href: '/leads', labelKey: 'nav.leads' as const, icon: Users },
  { href: '/pipeline', labelKey: 'nav.pipeline' as const, icon: Kanban },
  { href: '/conversations', labelKey: 'nav.conversations' as const, icon: MessageSquare },
  { href: '/knowledge', labelKey: 'nav.knowledge' as const, icon: BookOpen },
  { href: '/analytics', labelKey: 'nav.analytics' as const, icon: BarChart3 },
  { href: '/demo-ia', labelKey: 'nav.demoIA' as const, icon: Sparkles },
]

const utilityNav = [
  { href: '/settings', labelKey: 'nav.settings' as const, icon: Settings },
  { href: '/soporte', labelKey: 'nav.support' as const, icon: LifeBuoy },
]

const adminNavItem = {
  href: '/admin/clientes',
  labelKey: 'nav.admin' as const,
  icon: ShieldCheck,
}

type NavItem = { href: string; labelKey: 'nav.dashboard' | 'nav.analytics' | 'nav.leads' | 'nav.pipeline' | 'nav.conversations' | 'nav.support' | 'nav.settings' | 'nav.demoIA' | 'nav.knowledge' | 'nav.admin'; icon: ComponentType<{ className?: string }> }

function NavLink({ item, pathname, collapsed, mobileOpen, t }: {
  item: NavItem
  pathname: string
  collapsed: boolean
  mobileOpen: boolean
  t: (key: NavItem['labelKey']) => string
}) {
  const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
  return (
    <Link
      href={item.href}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-xl
        transition-all duration-200 group relative
        active:scale-[0.98]
        ${isActive
          ? 'bg-foreground text-background font-medium shadow-sm'
          : 'text-muted hover:text-foreground hover:bg-foreground/5'}
      `}
    >
      <item.icon
        className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-background' : ''}`}
      />
      {(!collapsed || mobileOpen) && (
        <span className="text-[13px]">{t(item.labelKey)}</span>
      )}
      {isActive && collapsed && !mobileOpen && (
        <div className="absolute -right-[3px] top-1/2 -translate-y-1/2 w-[3px] h-4 bg-foreground rounded-l-full" />
      )}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, toggle: toggleCollapsed } = useSidebarCollapsed()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useTranslation()
  const { isSuperAdmin } = useAdmin()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

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
      <div className="flex items-center justify-between px-4 h-16 border-b border-border/50">
        <Logo collapsed={collapsed && !mobileOpen} />
        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
          aria-expanded={!collapsed}
          className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg hover:bg-foreground/5 text-muted hover:text-foreground transition-all duration-200"
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Cerrar menú"
          className="lg:hidden p-1.5 rounded-lg hover:bg-foreground/5 text-muted hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col">
        <div className="space-y-1">
          {primaryNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
              mobileOpen={mobileOpen}
              t={t}
            />
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-border/50 space-y-1">
          {utilityNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
              mobileOpen={mobileOpen}
              t={t}
            />
          ))}
          {isSuperAdmin && (
            <NavLink
              item={adminNavItem}
              pathname={pathname}
              collapsed={collapsed}
              mobileOpen={mobileOpen}
              t={t}
            />
          )}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4">
        <div
          className={`
            rounded-xl border border-border/50 bg-gradient-to-br from-foreground/[0.03] to-foreground/[0.06] p-3
            ${collapsed && !mobileOpen ? 'flex items-center justify-center' : ''}
          `}
        >
          <div className={`w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center ${collapsed && !mobileOpen ? '' : 'mb-2'}`}>
            <Zap className="w-4 h-4 text-primary" />
          </div>
          {(!collapsed || mobileOpen) && (
            <div>
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
        aria-label="Abrir menú"
        aria-expanded={mobileOpen}
        aria-controls="sidebar-nav"
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl bg-card/80 backdrop-blur-md border border-border text-foreground hover:bg-card-hover transition-all duration-200"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`
          fixed left-0 top-0 h-screen z-50 lg:hidden
          flex flex-col bg-card/95 backdrop-blur-xl border-r border-border/50
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
          glass-card border-r border-border/50
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
