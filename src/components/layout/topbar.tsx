'use client'

import { Bell, Search, LogOut, Moon, Sun, Globe } from 'lucide-react'
import { useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useCliente } from '@/hooks/use-cliente'
import { useTheme } from '@/lib/theme'
import { useTranslation } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'

export function Topbar() {
  const [searchOpen, setSearchOpen] = useState(false)
  const router = useRouter()
  const { cliente } = useCliente()
  const { theme, toggleTheme } = useTheme()
  const { locale, setLocale, t } = useTranslation()

  const initials = cliente?.nombre
    ? cliente.nombre.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

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
      <div className="flex items-center justify-between h-full px-6">
        {/* Search */}
        <div className="flex items-center flex-1 max-w-md">
          <div
            className={`
              flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2
              transition-all duration-300
              ${searchOpen ? 'w-full' : 'w-10 cursor-pointer'}
            `}
            onClick={() => !searchOpen && setSearchOpen(true)}
          >
            <Search className="w-4 h-4 text-muted flex-shrink-0" />
            {searchOpen && (
              <input
                autoFocus
                type="text"
                placeholder={t('topbar.search')}
                className="bg-transparent text-sm text-foreground placeholder:text-muted outline-none w-full"
                onBlur={() => setSearchOpen(false)}
              />
            )}
            {!searchOpen && (
              <span className="text-xs text-muted hidden sm:inline">{t('topbar.searchShort')}</span>
            )}
          </div>
          {!searchOpen && (
            <kbd className="hidden sm:inline-flex ml-2 items-center gap-1 rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] text-muted">
              <span>Ctrl</span>
              <span>K</span>
            </kbd>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          {/* Language switcher */}
          <button
            onClick={handleLocaleToggle}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-border/30 text-muted hover:text-foreground transition-all duration-200 text-xs font-medium"
            title={locale === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
          >
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline uppercase">{locale}</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-border/30 text-muted hover:text-foreground transition-all duration-200"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4.5 h-4.5" />
            ) : (
              <Moon className="w-4.5 h-4.5" />
            )}
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-xl hover:bg-border/30 text-muted hover:text-foreground transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
          </button>

          {/* User avatar */}
          <div className="flex items-center gap-2 pl-2.5 ml-1 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-background text-sm font-bold">
              {initials}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl hover:bg-border/30 text-muted hover:text-foreground transition-colors"
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
