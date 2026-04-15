'use client'

import { Bell, Search, LogOut, Moon, Sun, Globe, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { useCliente } from '@/hooks/use-cliente'
import { useAvatar } from '@/hooks/use-avatar'
import { useTheme } from '@/lib/theme'
import { useTranslation } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'

const breadcrumbMap: Record<string, string> = {
  '/': 'Dashboard',
  '/leads': 'Leads',
  '/pipeline': 'Pipeline',
  '/conversations': 'Conversations',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
}

export function Topbar() {
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { cliente } = useCliente()
  const { avatarUrl } = useAvatar()
  const { theme, toggleTheme } = useTheme()
  const { locale, setLocale, t } = useTranslation()

  const initials = cliente?.nombre
    ? cliente.nombre.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  const currentPage = breadcrumbMap[pathname] || 'Dashboard'

  // Ctrl+K handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [searchOpen])

  const handleLogout = async () => {
    await getSupabase().auth.signOut()
    router.push('/login')
  }

  const handleLocaleToggle = () => {
    const next: Locale = locale === 'en' ? 'es' : 'en'
    setLocale(next)
  }

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl theme-transition">
      <div className="flex items-center justify-between h-full px-6 lg:px-8">
        {/* Left: Breadcrumb + Search */}
        <div className="flex items-center gap-4 flex-1">
          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-2 text-sm pl-0 lg:pl-0">
            <span className="text-muted">Impulsa</span>
            <span className="text-muted/50">/</span>
            <span className="text-foreground font-medium">{currentPage}</span>
          </div>

          {/* Search */}
          <div className="flex items-center max-w-md ml-auto sm:ml-4">
            {searchOpen ? (
              <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 w-64 sm:w-80">
                <Search className="w-4 h-4 text-muted flex-shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder={t('topbar.search')}
                  className="bg-transparent text-sm text-foreground placeholder:text-muted outline-none w-full"
                  onBlur={() => setSearchOpen(false)}
                />
                <button onClick={() => setSearchOpen(false)} className="text-muted hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-muted hover:text-foreground hover:border-border-hover transition-all"
              >
                <Search className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs hidden sm:inline">{t('topbar.searchShort')}</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-background px-1 py-0.5 text-[10px] text-muted ml-2">
                  <span>Ctrl</span>
                  <span>K</span>
                </kbd>
              </button>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          {/* Language switcher */}
          <button
            onClick={handleLocaleToggle}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-border/40 text-muted hover:text-foreground transition-all duration-200 text-xs font-medium"
            title={locale === 'en' ? 'Switch to Spanish' : 'Cambiar a Ingles'}
          >
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline uppercase">{locale}</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-border/40 text-muted hover:text-foreground transition-all duration-200"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4.5 h-4.5" />
            ) : (
              <Moon className="w-4.5 h-4.5" />
            )}
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-xl hover:bg-border/40 text-muted hover:text-foreground transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-foreground rounded-full" />
          </button>

          {/* User avatar */}
          <div className="flex items-center gap-2 pl-2.5 ml-1 border-l border-border">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-foreground flex items-center justify-center text-background text-sm font-bold flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl hover:bg-border/40 text-muted hover:text-foreground transition-colors"
              title={t('auth.signOut')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
