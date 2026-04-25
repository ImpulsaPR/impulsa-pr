'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot as BotIcon,
  Building2,
  Bell,
  Clock,
  MessageSquare,
  Briefcase,
  Lock,
  Save,
  Loader2,
  Plus,
  Trash2,
  ChevronDown,
  AlertTriangle,
  Undo2,
} from 'lucide-react'
import { useBot, type BotServicio, type BotUpdate } from '@/hooks/use-bot'
import { useToast } from '@/components/ui/toast'
import { Skeleton } from '@/components/ui/skeleton'

const inputClass =
  'w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 transition-colors'

const inputReadonlyClass =
  'w-full rounded-xl border border-border bg-card-hover px-4 py-2.5 text-sm text-muted outline-none cursor-not-allowed flex items-center gap-2'

const labelClass = 'text-xs text-muted mb-1.5 block'

const zonasHorarias = [
  'America/Puerto_Rico',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'America/Mexico_City',
  'America/Bogota',
  'America/Argentina/Buenos_Aires',
  'Europe/Madrid',
]

function isE164(s: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(s.trim())
}

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
}

function isUrl(s: string): boolean {
  try {
    const u = new URL(s.trim())
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function isSlug(s: string): boolean {
  return /^[a-z0-9_]+(?:-[a-z0-9_]+)*$/.test(s) && s.length > 0
}

function ReadonlyField({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className={inputReadonlyClass} title={hint}>
        <Lock className="w-3.5 h-3.5 text-muted flex-shrink-0" />
        <span className="truncate">{value || '—'}</span>
      </div>
      <p className="text-[11px] text-muted mt-1">{hint}</p>
    </div>
  )
}

interface SectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  onSave?: () => void | Promise<void>
  onDiscard?: () => void
  saving?: boolean
  dirty?: boolean
  saveLabel: string
  discardLabel: string
}

function Section({
  title,
  icon,
  children,
  onSave,
  onDiscard,
  saving,
  dirty,
  saveLabel,
  discardLabel,
}: SectionProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 theme-transition">
      <h3 className="text-sm font-semibold mb-5 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
      {onSave && (
        <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-border">
          {dirty && onDiscard && (
            <button
              type="button"
              onClick={onDiscard}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted hover:text-foreground hover:bg-card-hover transition-all disabled:opacity-50"
            >
              <Undo2 className="w-3.5 h-3.5" />
              {discardLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={!dirty || saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {saveLabel}
          </button>
        </div>
      )}
    </div>
  )
}

export function BotConfigSection({ t }: { t: (key: string, params?: Record<string, string | number>) => string }) {
  const { bot, loading, error, save } = useBot()
  const { toast } = useToast()

  // Estados locales por sección (cada una guarda independiente)
  const [identidad, setIdentidad] = useState({ nombre_agente: '', personalidad_agente: '' })
  const [empresa, setEmpresa] = useState({
    empresa_nombre: '',
    empresa_descripcion: '',
    empresa_ubicacion: '',
    empresa_contacto: '',
  })
  const [notif, setNotif] = useState({ numero_dueno: '', email_dueno: '', meet_link: '' })
  const [horarios, setHorarios] = useState({
    horario_inicio: '09:00',
    horario_fin: '18:00',
    zona_horaria: 'America/Puerto_Rico',
  })
  const [mensajes, setMensajes] = useState({ mensaje_bienvenida: '', mensaje_fuera_horario: '' })
  const [servicios, setServicios] = useState<BotServicio[]>([])
  const [expandedServicio, setExpandedServicio] = useState<string | null>(null)

  // Saving flags por sección
  const [savingIdentidad, setSavingIdentidad] = useState(false)
  const [savingEmpresa, setSavingEmpresa] = useState(false)
  const [savingNotif, setSavingNotif] = useState(false)
  const [savingHorarios, setSavingHorarios] = useState(false)
  const [savingMensajes, setSavingMensajes] = useState(false)
  const [savingServicios, setSavingServicios] = useState(false)

  // Hidratar al cargar bot
  useEffect(() => {
    if (!bot) return
    setIdentidad({
      nombre_agente: bot.nombre_agente,
      personalidad_agente: bot.personalidad_agente,
    })
    setEmpresa({
      empresa_nombre: bot.empresa_nombre,
      empresa_descripcion: bot.empresa_descripcion,
      empresa_ubicacion: bot.empresa_ubicacion,
      empresa_contacto: bot.empresa_contacto,
    })
    setNotif({
      numero_dueno: bot.numero_dueno,
      email_dueno: bot.email_dueno || '',
      meet_link: bot.meet_link || '',
    })
    setHorarios({
      horario_inicio: bot.horario_inicio?.slice(0, 5) || '09:00',
      horario_fin: bot.horario_fin?.slice(0, 5) || '18:00',
      zona_horaria: bot.zona_horaria,
    })
    setMensajes({
      mensaje_bienvenida: bot.mensaje_bienvenida,
      mensaje_fuera_horario: bot.mensaje_fuera_horario,
    })
    setServicios(JSON.parse(JSON.stringify(bot.servicios_json || [])))
  }, [bot])

  // Dirty checks
  const dirtyIdentidad = useMemo(() => {
    if (!bot) return false
    return (
      identidad.nombre_agente !== bot.nombre_agente ||
      identidad.personalidad_agente !== bot.personalidad_agente
    )
  }, [bot, identidad])

  const dirtyEmpresa = useMemo(() => {
    if (!bot) return false
    return (
      empresa.empresa_nombre !== bot.empresa_nombre ||
      empresa.empresa_descripcion !== bot.empresa_descripcion ||
      empresa.empresa_ubicacion !== bot.empresa_ubicacion ||
      empresa.empresa_contacto !== bot.empresa_contacto
    )
  }, [bot, empresa])

  const dirtyNotif = useMemo(() => {
    if (!bot) return false
    return (
      notif.numero_dueno !== bot.numero_dueno ||
      notif.email_dueno !== (bot.email_dueno || '') ||
      notif.meet_link !== (bot.meet_link || '')
    )
  }, [bot, notif])

  const dirtyHorarios = useMemo(() => {
    if (!bot) return false
    return (
      horarios.horario_inicio !== (bot.horario_inicio?.slice(0, 5) || '09:00') ||
      horarios.horario_fin !== (bot.horario_fin?.slice(0, 5) || '18:00') ||
      horarios.zona_horaria !== bot.zona_horaria
    )
  }, [bot, horarios])

  const dirtyMensajes = useMemo(() => {
    if (!bot) return false
    return (
      mensajes.mensaje_bienvenida !== bot.mensaje_bienvenida ||
      mensajes.mensaje_fuera_horario !== bot.mensaje_fuera_horario
    )
  }, [bot, mensajes])

  const dirtyServicios = useMemo(() => {
    if (!bot) return false
    return JSON.stringify(servicios) !== JSON.stringify(bot.servicios_json || [])
  }, [bot, servicios])

  // Handlers de save
  const wrapSave = async (
    setSaving: (b: boolean) => void,
    updates: BotUpdate,
    successKey = 'settings.bot.saved'
  ) => {
    setSaving(true)
    try {
      await save(updates)
      toast(t(successKey))
    } catch (e) {
      toast((e as Error).message || t('settings.bot.saveError'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const saveIdentidad = async () => {
    if (!identidad.nombre_agente.trim()) {
      toast(t('settings.bot.errAgentRequired'), 'error')
      return
    }
    await wrapSave(setSavingIdentidad, identidad)
  }

  const saveEmpresa = async () => {
    if (!empresa.empresa_nombre.trim()) {
      toast(t('settings.bot.errCompanyRequired'), 'error')
      return
    }
    await wrapSave(setSavingEmpresa, empresa)
  }

  const saveNotif = async () => {
    if (notif.numero_dueno && !isE164(notif.numero_dueno)) {
      toast(t('settings.bot.errPhoneE164'), 'error')
      return
    }
    if (notif.email_dueno && !isEmail(notif.email_dueno)) {
      toast(t('settings.bot.errEmailFormat'), 'error')
      return
    }
    if (notif.meet_link && !isUrl(notif.meet_link)) {
      toast(t('settings.bot.errUrlFormat'), 'error')
      return
    }
    await wrapSave(setSavingNotif, {
      numero_dueno: notif.numero_dueno,
      email_dueno: notif.email_dueno || null,
      meet_link: notif.meet_link || null,
    })
  }

  const saveHorarios = async () => {
    if (horarios.horario_inicio >= horarios.horario_fin) {
      toast(t('settings.bot.errHourOrder'), 'error')
      return
    }
    await wrapSave(setSavingHorarios, horarios)
  }

  const saveMensajes = async () => {
    await wrapSave(setSavingMensajes, mensajes)
  }

  const saveServicios = async () => {
    // Validar
    const ids = new Set<string>()
    for (const s of servicios) {
      if (!s.id || !isSlug(s.id)) {
        toast(t('settings.bot.errServiceIdSlug', { id: s.id || '?' }), 'error')
        return
      }
      if (ids.has(s.id)) {
        toast(t('settings.bot.errServiceIdDup', { id: s.id }), 'error')
        return
      }
      ids.add(s.id)
      if (!s.nombre.trim()) {
        toast(t('settings.bot.errServiceNameReq'), 'error')
        return
      }
      if (s.precio < 0 || !Number.isFinite(s.precio)) {
        toast(t('settings.bot.errServicePrice'), 'error')
        return
      }
      if (s.duracion_min < 0 || !Number.isFinite(s.duracion_min)) {
        toast(t('settings.bot.errServiceDuration'), 'error')
        return
      }
    }
    await wrapSave(setSavingServicios, { servicios_json: servicios })
  }

  // Discard
  const discard = (key: 'identidad' | 'empresa' | 'notif' | 'horarios' | 'mensajes' | 'servicios') => {
    if (!bot) return
    if (key === 'identidad') {
      setIdentidad({
        nombre_agente: bot.nombre_agente,
        personalidad_agente: bot.personalidad_agente,
      })
    } else if (key === 'empresa') {
      setEmpresa({
        empresa_nombre: bot.empresa_nombre,
        empresa_descripcion: bot.empresa_descripcion,
        empresa_ubicacion: bot.empresa_ubicacion,
        empresa_contacto: bot.empresa_contacto,
      })
    } else if (key === 'notif') {
      setNotif({
        numero_dueno: bot.numero_dueno,
        email_dueno: bot.email_dueno || '',
        meet_link: bot.meet_link || '',
      })
    } else if (key === 'horarios') {
      setHorarios({
        horario_inicio: bot.horario_inicio?.slice(0, 5) || '09:00',
        horario_fin: bot.horario_fin?.slice(0, 5) || '18:00',
        zona_horaria: bot.zona_horaria,
      })
    } else if (key === 'mensajes') {
      setMensajes({
        mensaje_bienvenida: bot.mensaje_bienvenida,
        mensaje_fuera_horario: bot.mensaje_fuera_horario,
      })
    } else if (key === 'servicios') {
      setServicios(JSON.parse(JSON.stringify(bot.servicios_json || [])))
    }
  }

  // Servicios CRUD local
  const addServicio = () => {
    const base = 'nuevo_servicio'
    let id = base
    let i = 1
    const ids = new Set(servicios.map((s) => s.id))
    while (ids.has(id)) {
      id = `${base}_${i++}`
    }
    const nuevo: BotServicio = {
      id,
      nombre: '',
      precio: 0,
      duracion_min: 30,
      descripcion: '',
    }
    setServicios((prev) => [...prev, nuevo])
    setExpandedServicio(id)
  }

  const updateServicio = (idx: number, patch: Partial<BotServicio>) => {
    setServicios((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)))
  }

  const removeServicio = (idx: number) => {
    setServicios((prev) => prev.filter((_, i) => i !== idx))
  }

  // Loading
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 theme-transition">
        <Skeleton className="h-5 w-48 mb-5" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    )
  }

  // Sin bot configurado
  if (!bot) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 theme-transition">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <BotIcon className="w-4 h-4 text-muted" />
          {t('settings.bot.title')}
        </h3>
        <div className="rounded-xl border border-border bg-card-hover p-4 text-sm text-muted">
          {error || t('settings.bot.noBot')}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Identidad */}
      <Section
        title={t('settings.bot.identityTitle')}
        icon={<BotIcon className="w-4 h-4 text-primary" />}
        onSave={saveIdentidad}
        onDiscard={() => discard('identidad')}
        saving={savingIdentidad}
        dirty={dirtyIdentidad}
        saveLabel={t('settings.bot.save')}
        discardLabel={t('settings.bot.discard')}
      >
        <div>
          <label className={labelClass}>{t('settings.bot.agentName')} *</label>
          <input
            type="text"
            value={identidad.nombre_agente}
            onChange={(e) => setIdentidad((p) => ({ ...p, nombre_agente: e.target.value }))}
            placeholder="Quasar"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{t('settings.bot.agentPersonality')}</label>
          <textarea
            value={identidad.personalidad_agente}
            onChange={(e) => setIdentidad((p) => ({ ...p, personalidad_agente: e.target.value }))}
            placeholder={t('settings.bot.agentPersonalityPlaceholder')}
            rows={3}
            className={inputClass}
          />
          <p className="text-[11px] text-muted mt-1">{t('settings.bot.agentPersonalityHint')}</p>
        </div>
      </Section>

      {/* Empresa */}
      <Section
        title={t('settings.bot.companyTitle')}
        icon={<Building2 className="w-4 h-4 text-muted" />}
        onSave={saveEmpresa}
        onDiscard={() => discard('empresa')}
        saving={savingEmpresa}
        dirty={dirtyEmpresa}
        saveLabel={t('settings.bot.save')}
        discardLabel={t('settings.bot.discard')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t('settings.bot.companyName')} *</label>
            <input
              type="text"
              value={empresa.empresa_nombre}
              onChange={(e) => setEmpresa((p) => ({ ...p, empresa_nombre: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t('settings.bot.companyLocation')}</label>
            <input
              type="text"
              value={empresa.empresa_ubicacion}
              onChange={(e) => setEmpresa((p) => ({ ...p, empresa_ubicacion: e.target.value }))}
              placeholder="San Juan, PR"
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>{t('settings.bot.companyDescription')}</label>
          <textarea
            value={empresa.empresa_descripcion}
            onChange={(e) => setEmpresa((p) => ({ ...p, empresa_descripcion: e.target.value }))}
            rows={4}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{t('settings.bot.companyContact')}</label>
          <textarea
            value={empresa.empresa_contacto}
            onChange={(e) => setEmpresa((p) => ({ ...p, empresa_contacto: e.target.value }))}
            rows={2}
            className={inputClass}
          />
        </div>
      </Section>

      {/* Notificaciones / multi-tenant */}
      <Section
        title={t('settings.bot.notifTitle')}
        icon={<Bell className="w-4 h-4 text-muted" />}
        onSave={saveNotif}
        onDiscard={() => discard('notif')}
        saving={savingNotif}
        dirty={dirtyNotif}
        saveLabel={t('settings.bot.save')}
        discardLabel={t('settings.bot.discard')}
      >
        <ReadonlyField
          label={t('settings.bot.botWhatsapp')}
          value={bot.numero_whatsapp_bot}
          hint={t('settings.bot.botWhatsappHint')}
        />
        <div>
          <label className={labelClass}>{t('settings.bot.ownerPhone')}</label>
          <input
            type="tel"
            value={notif.numero_dueno}
            onChange={(e) => setNotif((p) => ({ ...p, numero_dueno: e.target.value }))}
            placeholder="+17875551234"
            className={inputClass}
          />
          {dirtyNotif && notif.numero_dueno !== bot.numero_dueno && (
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>{t('settings.bot.ownerPhoneWarn')}</span>
            </div>
          )}
          <p className="text-[11px] text-muted mt-1">{t('settings.bot.ownerPhoneHint')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t('settings.bot.ownerEmail')}</label>
            <input
              type="email"
              value={notif.email_dueno}
              onChange={(e) => setNotif((p) => ({ ...p, email_dueno: e.target.value }))}
              placeholder="dueno@empresa.com"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t('settings.bot.meetLink')}</label>
            <input
              type="url"
              value={notif.meet_link}
              onChange={(e) => setNotif((p) => ({ ...p, meet_link: e.target.value }))}
              placeholder="https://meet.google.com/abc-defg-hij"
              className={inputClass}
            />
          </div>
        </div>
        <ReadonlyField
          label={t('settings.bot.calendarId')}
          value={bot.google_calendar_id || ''}
          hint={t('settings.bot.calendarIdHint')}
        />
      </Section>

      {/* Horarios */}
      <Section
        title={t('settings.bot.scheduleTitle')}
        icon={<Clock className="w-4 h-4 text-muted" />}
        onSave={saveHorarios}
        onDiscard={() => discard('horarios')}
        saving={savingHorarios}
        dirty={dirtyHorarios}
        saveLabel={t('settings.bot.save')}
        discardLabel={t('settings.bot.discard')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>{t('settings.bot.openTime')}</label>
            <input
              type="time"
              value={horarios.horario_inicio}
              onChange={(e) => setHorarios((p) => ({ ...p, horario_inicio: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t('settings.bot.closeTime')}</label>
            <input
              type="time"
              value={horarios.horario_fin}
              onChange={(e) => setHorarios((p) => ({ ...p, horario_fin: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t('settings.bot.timezone')}</label>
            <select
              value={horarios.zona_horaria}
              onChange={(e) => setHorarios((p) => ({ ...p, zona_horaria: e.target.value }))}
              className={inputClass}
            >
              {zonasHorarias.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-[11px] text-muted">{t('settings.bot.scheduleHint')}</p>
      </Section>

      {/* Mensajes auto */}
      <Section
        title={t('settings.bot.msgsTitle')}
        icon={<MessageSquare className="w-4 h-4 text-muted" />}
        onSave={saveMensajes}
        onDiscard={() => discard('mensajes')}
        saving={savingMensajes}
        dirty={dirtyMensajes}
        saveLabel={t('settings.bot.save')}
        discardLabel={t('settings.bot.discard')}
      >
        <div>
          <label className={labelClass}>{t('settings.bot.welcomeMsg')}</label>
          <textarea
            value={mensajes.mensaje_bienvenida}
            onChange={(e) => setMensajes((p) => ({ ...p, mensaje_bienvenida: e.target.value }))}
            rows={3}
            className={inputClass}
            placeholder={t('settings.bot.welcomeMsgPlaceholder')}
          />
        </div>
        <div>
          <label className={labelClass}>{t('settings.bot.afterHoursMsg')}</label>
          <textarea
            value={mensajes.mensaje_fuera_horario}
            onChange={(e) => setMensajes((p) => ({ ...p, mensaje_fuera_horario: e.target.value }))}
            rows={3}
            className={inputClass}
            placeholder={t('settings.bot.afterHoursMsgPlaceholder')}
          />
        </div>
      </Section>

      {/* Servicios */}
      <Section
        title={t('settings.bot.servicesTitle')}
        icon={<Briefcase className="w-4 h-4 text-muted" />}
        onSave={saveServicios}
        onDiscard={() => discard('servicios')}
        saving={savingServicios}
        dirty={dirtyServicios}
        saveLabel={t('settings.bot.save')}
        discardLabel={t('settings.bot.discard')}
      >
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {servicios.map((s, idx) => {
              const isOpen = expandedServicio === s.id
              return (
                <motion.div
                  key={`srv-${idx}-${s.id}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className="rounded-xl border border-border bg-background overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedServicio(isOpen ? null : s.id)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-card-hover transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {s.nombre || t('settings.bot.serviceUnnamed')}
                      </div>
                      <div className="text-xs text-muted truncate">
                        <span className="font-mono">{s.id}</span>
                        {' · '}
                        ${s.precio} · {s.duracion_min}min
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-muted flex-shrink-0 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="border-t border-border"
                      >
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className={labelClass}>{t('settings.bot.serviceId')}</label>
                              <input
                                type="text"
                                value={s.id}
                                onChange={(e) =>
                                  updateServicio(idx, {
                                    id: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                                  })
                                }
                                className={`${inputClass} font-mono text-xs`}
                                placeholder="demo_30min"
                              />
                              <p className="text-[11px] text-muted mt-1">
                                {t('settings.bot.serviceIdHint')}
                              </p>
                            </div>
                            <div>
                              <label className={labelClass}>{t('settings.bot.serviceName')} *</label>
                              <input
                                type="text"
                                value={s.nombre}
                                onChange={(e) => updateServicio(idx, { nombre: e.target.value })}
                                className={inputClass}
                                placeholder="Demo gratuita"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className={labelClass}>{t('settings.bot.servicePrice')}</label>
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                value={s.precio}
                                onChange={(e) =>
                                  updateServicio(idx, { precio: Number(e.target.value) || 0 })
                                }
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>
                                {t('settings.bot.serviceDuration')}
                              </label>
                              <input
                                type="number"
                                min={0}
                                step={5}
                                value={s.duracion_min}
                                onChange={(e) =>
                                  updateServicio(idx, {
                                    duracion_min: Number(e.target.value) || 0,
                                  })
                                }
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>
                                {t('settings.bot.serviceColor')}
                              </label>
                              <input
                                type="text"
                                value={s.calendar_color || ''}
                                onChange={(e) =>
                                  updateServicio(idx, { calendar_color: e.target.value })
                                }
                                className={inputClass}
                                placeholder="1"
                              />
                            </div>
                          </div>
                          <div>
                            <label className={labelClass}>
                              {t('settings.bot.serviceDescription')}
                            </label>
                            <textarea
                              value={s.descripcion || ''}
                              onChange={(e) =>
                                updateServicio(idx, { descripcion: e.target.value })
                              }
                              rows={2}
                              className={inputClass}
                            />
                          </div>
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                removeServicio(idx)
                                setExpandedServicio(null)
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-accent-red border border-accent-red/20 hover:bg-accent-red/10 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              {t('settings.bot.serviceDelete')}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {servicios.length === 0 && (
            <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted">
              {t('settings.bot.servicesEmpty')}
            </div>
          )}

          <button
            type="button"
            onClick={addServicio}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background hover:bg-card-hover px-4 py-3 text-sm text-muted hover:text-foreground transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('settings.bot.addService')}
          </button>
        </div>
      </Section>
    </>
  )
}
