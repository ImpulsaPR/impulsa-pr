'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarCheck,
  Bot,
  Clock,
  Briefcase,
  MessageSquare,
  BookOpen,
  CheckCircle2,
  Circle,
  X,
  PartyPopper,
  Sparkles,
} from 'lucide-react'
import { Portal } from '@/components/ui/portal'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { useOnboarding, type OnboardingStepId } from '@/hooks/use-onboarding'
import { useCliente } from '@/hooks/use-cliente'
import { useTranslation } from '@/lib/i18n'

const STEP_ICONS: Record<OnboardingStepId, React.ComponentType<{ className?: string }>> = {
  calendar: CalendarCheck,
  bot_identity: Bot,
  horarios: Clock,
  servicios: Briefcase,
  mensajes: MessageSquare,
  kb: BookOpen,
}

function celebratedKey(clienteId: string) {
  return `onboarding_celebrated_${clienteId}`
}

function ProgressRing({ percentage }: { percentage: number }) {
  const radius = 14
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" className="flex-shrink-0">
      <circle
        cx="18"
        cy="18"
        r={radius}
        stroke="currentColor"
        strokeOpacity="0.15"
        strokeWidth="3"
        fill="none"
      />
      <circle
        cx="18"
        cy="18"
        r={radius}
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 18 18)"
        style={{ transition: 'stroke-dashoffset 400ms ease' }}
      />
    </svg>
  )
}

export function OnboardingChecklist() {
  const {
    steps,
    completed,
    total,
    percentage,
    isFullyComplete,
    isDismissed,
    dismiss,
    loading,
  } = useOnboarding()
  const { cliente } = useCliente()
  const { t } = useTranslation()

  const [expanded, setExpanded] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const celebrationTriggered = useRef(false)

  // Listen for "open checklist" event from welcome modal
  useEffect(() => {
    const handler = () => setExpanded(true)
    window.addEventListener('onboarding:open-checklist', handler)
    return () => window.removeEventListener('onboarding:open-checklist', handler)
  }, [])

  // Trigger celebration once when fully complete
  useEffect(() => {
    if (!cliente) return
    if (loading) return
    if (!isFullyComplete) return
    if (isDismissed) return
    if (celebrationTriggered.current) return

    let alreadyCelebrated = false
    try {
      alreadyCelebrated =
        window.localStorage.getItem(celebratedKey(cliente.id)) === 'true'
    } catch {
      // ignore
    }
    if (alreadyCelebrated) {
      // Auto-dismiss silently if completed previously
      dismiss()
      return
    }

    celebrationTriggered.current = true
    setCelebrating(true)
    setExpanded(false)
    try {
      window.localStorage.setItem(celebratedKey(cliente.id), 'true')
    } catch {
      // ignore
    }
    const timer = setTimeout(() => {
      setCelebrating(false)
      dismiss()
    }, 5000)
    return () => clearTimeout(timer)
  }, [isFullyComplete, isDismissed, cliente, loading, dismiss])

  const handleDismissRequest = () => {
    setConfirmOpen(true)
  }

  const handleConfirmDismiss = () => {
    dismiss()
    setConfirmOpen(false)
    setExpanded(false)
  }

  // Visibility: hide while loading, when dismissed (and not celebrating), or no cliente
  if (!cliente) return null
  if (loading) return null
  if (isDismissed && !celebrating) return null
  if (isFullyComplete && !celebrating) return null

  return (
    <Portal>
      {/* Celebration card */}
      <AnimatePresence>
        {celebrating && (
          <motion.div
            key="celebration"
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22 }}
            className="fixed z-[55] bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 sm:max-w-sm"
          >
            <div className="relative rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/15 via-card to-card shadow-2xl overflow-hidden theme-transition">
              {/* Sparkle accents */}
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-3 -right-3 text-primary/30"
              >
                <Sparkles className="w-12 h-12" />
              </motion.div>
              <div className="relative p-5 flex items-start gap-3">
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 260 }}
                  className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0"
                >
                  <PartyPopper className="w-5 h-5 text-primary" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">
                    {t('onboarding.checklist.celebrating')}
                  </p>
                  <p className="text-xs text-muted mt-1 leading-snug">
                    {t('onboarding.checklist.celebratingDesc')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed pill / FAB */}
      <AnimatePresence>
        {!celebrating && !expanded && (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            onClick={() => setExpanded(true)}
            aria-label={t('onboarding.checklist.title')}
            className="fixed z-[55] bottom-4 right-4 sm:bottom-6 sm:right-6 group"
          >
            <div className="flex items-center gap-3 pl-2 pr-4 py-2 rounded-full border border-border bg-card shadow-lg hover:shadow-xl hover:bg-card/95 transition-all duration-200 max-w-[280px] theme-transition">
              <div className="text-primary">
                <ProgressRing percentage={percentage} />
              </div>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-xs font-semibold text-foreground leading-tight truncate">
                  {t('onboarding.checklist.title')}
                </span>
                <span className="text-[11px] text-muted leading-tight">
                  {t('onboarding.checklist.completed', {
                    completed,
                    total,
                  })}
                </span>
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded card / mobile sheet */}
      <AnimatePresence>
        {!celebrating && expanded && (
          <>
            {/* Mobile-only backdrop */}
            <motion.div
              key="checklist-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setExpanded(false)}
              className="fixed inset-0 z-[54] bg-black/40 backdrop-blur-sm sm:hidden"
            />
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="fixed z-[55] bottom-0 right-0 left-0 sm:bottom-6 sm:right-6 sm:left-auto sm:w-[360px] max-h-[85vh] sm:max-h-[80vh] flex flex-col rounded-t-2xl sm:rounded-2xl border border-border bg-card shadow-2xl overflow-hidden theme-transition"
              role="dialog"
              aria-label={t('onboarding.checklist.title')}
            >
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <div className="text-primary">
                  <ProgressRing percentage={percentage} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground leading-tight">
                    {t('onboarding.checklist.title')}
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    {t('onboarding.checklist.completed', {
                      completed,
                      total,
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setExpanded(false)}
                  aria-label={t('onboarding.checklist.minimize')}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-border/40 hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Steps list */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {steps.map((step) => {
                  const Icon = STEP_ICONS[step.id]
                  return (
                    <div
                      key={step.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                        step.done
                          ? 'border-primary/30 bg-primary/5'
                          : 'border-border bg-background/50'
                      }`}
                    >
                      <div className="flex-shrink-0 pt-0.5">
                        {step.done ? (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                          <p className="text-sm font-semibold text-foreground leading-tight">
                            {t(step.label)}
                          </p>
                        </div>
                        <p className="text-xs text-muted mt-1 leading-snug">
                          {t(step.description)}
                        </p>
                        <div className="mt-2">
                          {step.done ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                              <CheckCircle2 className="w-3 h-3" />
                              {t('onboarding.checklist.ready')}
                            </span>
                          ) : (
                            <Link
                              href={step.href}
                              onClick={() => setExpanded(false)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
                            >
                              {t('onboarding.checklist.configure')}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-border bg-background/40">
                <button
                  onClick={handleDismissRequest}
                  className="text-xs text-muted hover:text-foreground transition-colors underline-offset-2 hover:underline"
                >
                  {t('onboarding.checklist.dismiss')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={confirmOpen}
        title={t('onboarding.checklist.dismissConfirmTitle')}
        message={t('onboarding.checklist.dismissConfirmMessage')}
        confirmLabel={t('onboarding.checklist.dismissConfirmYes')}
        cancelLabel={t('onboarding.checklist.dismissConfirmNo')}
        onConfirm={handleConfirmDismiss}
        onCancel={() => setConfirmOpen(false)}
      />
    </Portal>
  )
}
