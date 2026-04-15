'use client'

import { useState, useEffect } from 'react'
import { Save, Bell, Shield, Palette, Globe, Zap, Loader2 } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'
import { useCliente } from '@/hooks/use-cliente'
import { useToast } from '@/components/ui/toast'
import { useTheme } from '@/lib/theme'
import { useTranslation } from '@/lib/i18n'
import { Skeleton } from '@/components/ui/skeleton'
import type { Locale } from '@/lib/i18n'

interface ToggleItem {
  key: string
  labelKey: string
  descKey: string
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
        enabled ? 'bg-primary' : 'bg-border'
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

const defaultToggles: Record<string, boolean> = {
  new_lead: true,
  ai_alerts: true,
  weekly_reports: false,
  deal_closed: true,
  ai_auto_respond: true,
  auto_scoring: true,
  followup_reminders: false,
}

export default function SettingsPage() {
  const { cliente, loading: clienteLoading } = useCliente()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const { locale, setLocale, t } = useTranslation()

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [saving, setSaving] = useState(false)
  const [toggles, setToggles] = useState<Record<string, boolean>>(defaultToggles)

  const notificationToggles: ToggleItem[] = [
    { key: 'new_lead', labelKey: 'settings.newLeadNotif', descKey: 'settings.newLeadNotifDesc' },
    { key: 'ai_alerts', labelKey: 'settings.aiAlerts', descKey: 'settings.aiAlertsDesc' },
    { key: 'weekly_reports', labelKey: 'settings.weeklyReports', descKey: 'settings.weeklyReportsDesc' },
    { key: 'deal_closed', labelKey: 'settings.dealClosed', descKey: 'settings.dealClosedDesc' },
  ]

  const automationToggles: ToggleItem[] = [
    { key: 'ai_auto_respond', labelKey: 'settings.aiAutoRespond', descKey: 'settings.aiAutoRespondDesc' },
    { key: 'auto_scoring', labelKey: 'settings.autoScoring', descKey: 'settings.autoScoringDesc' },
    { key: 'followup_reminders', labelKey: 'settings.followupReminders', descKey: 'settings.followupRemindersDesc' },
  ]

  useEffect(() => {
    if (!cliente) return
    setNombre(cliente.nombre || '')
    setEmail(cliente.email || '')
    setEmpresa(cliente.empresa || '')
  }, [cliente])

  useEffect(() => {
    const saved = localStorage.getItem('impulsa_settings')
    if (saved) {
      try {
        setToggles((prev) => ({ ...prev, ...JSON.parse(saved) }))
      } catch { /* ignore */ }
    }
  }, [])

  const handleToggle = (key: string) => {
    setToggles((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem('impulsa_settings', JSON.stringify(next))
      return next
    })
  }

  const handleSave = async () => {
    if (!cliente) return
    setSaving(true)

    const { error } = await getSupabase()
      .from('clientes')
      .update({ nombre, email, empresa })
      .eq('id', cliente.id)

    setSaving(false)

    if (error) {
      toast(error.message, 'error')
    } else {
      toast(t('settings.saved'))
    }
  }

  const inputClass = 'w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 transition-colors'

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-sm text-muted mt-1">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* Profile */}
      <div className="rounded-2xl border border-border bg-card p-6 theme-transition">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-muted" />
          {t('settings.profile')}
        </h3>
        {clienteLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted mb-1.5 block">{t('settings.name')}</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder={t('settings.namePlaceholder')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-muted mb-1.5 block">{t('settings.email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('settings.emailPlaceholder')}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted mb-1.5 block">{t('settings.company')}</label>
              <input
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                placeholder={t('settings.companyPlaceholder')}
                className={inputClass}
              />
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-border bg-card p-6 theme-transition">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-muted" />
          {t('settings.notifications')}
        </h3>
        <div className="space-y-3">
          {notificationToggles.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-2"
            >
              <div>
                <p className="text-sm text-foreground">{t(item.labelKey as any)}</p>
                <p className="text-xs text-muted">{t(item.descKey as any)}</p>
              </div>
              <Toggle
                enabled={toggles[item.key] ?? false}
                onToggle={() => handleToggle(item.key)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Automation */}
      <div className="rounded-2xl border border-border bg-card p-6 theme-transition">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          {t('settings.automation')}
        </h3>
        <div className="space-y-3">
          {automationToggles.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-2"
            >
              <div>
                <p className="text-sm text-foreground">{t(item.labelKey as any)}</p>
                <p className="text-xs text-muted">{t(item.descKey as any)}</p>
              </div>
              <Toggle
                enabled={toggles[item.key] ?? false}
                onToggle={() => handleToggle(item.key)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="rounded-2xl border border-border bg-card p-6 theme-transition">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4 text-muted" />
          {t('settings.appearance')}
        </h3>
        <div className="flex gap-3">
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              theme === 'dark'
                ? 'border-2 border-primary bg-primary/5 text-primary'
                : 'border border-border text-muted hover:text-foreground hover:border-border-hover'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-[#0B0B0B] border border-border" />
            {t('settings.dark')}
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              theme === 'light'
                ? 'border-2 border-primary bg-primary/5 text-primary'
                : 'border border-border text-muted hover:text-foreground hover:border-border-hover'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white border border-border" />
            {t('settings.light')}
          </button>
        </div>
      </div>

      {/* Language */}
      <div className="rounded-2xl border border-border bg-card p-6 theme-transition">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted" />
          {t('settings.language')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted mb-1.5 block">{t('settings.languageLabel')}</label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className={inputClass}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted mb-1.5 block">{t('settings.timezone')}</label>
            <select className={inputClass}>
              <option>America/Puerto_Rico (AST)</option>
              <option>America/New_York (EST)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || clienteLoading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-background text-sm font-medium hover:bg-primary-dark transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {t('settings.save')}
        </button>
      </div>
    </div>
  )
}
