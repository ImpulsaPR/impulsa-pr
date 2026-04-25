'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarCheck,
  Bot,
  Clock,
  Briefcase,
  MessageSquare,
  BookOpen,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { Portal } from '@/components/ui/portal'
import { useCliente } from '@/hooks/use-cliente'
import { useBot } from '@/hooks/use-bot'
import { useOnboarding } from '@/hooks/use-onboarding'
import { useTranslation } from '@/lib/i18n'

const STEP_ICONS = {
  calendar: CalendarCheck,
  bot_identity: Bot,
  horarios: Clock,
  servicios: Briefcase,
  mensajes: MessageSquare,
  kb: BookOpen,
} as const

function welcomeKey(clienteId: string) {
  return `onboarding_welcomed_${clienteId}`
}

export function WelcomeModal() {
  const { cliente, loading: clienteLoading } = useCliente()
  const { bot, loading: botLoading } = useBot()
  const { steps, isFullyComplete, loading: onboardingLoading } = useOnboarding()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (clienteLoading || botLoading || onboardingLoading) return
    if (!cliente) return
    // Don't show if already fully configured
    if (isFullyComplete) return

    let alreadyWelcomed = false
    try {
      alreadyWelcomed =
        window.localStorage.getItem(welcomeKey(cliente.id)) === 'true'
    } catch {
      // ignore
    }
    if (!alreadyWelcomed) {
      setOpen(true)
    }
  }, [
    mounted,
    cliente,
    clienteLoading,
    botLoading,
    onboardingLoading,
    isFullyComplete,
  ])

  const markWelcomed = () => {
    if (!cliente) return
    try {
      window.localStorage.setItem(welcomeKey(cliente.id), 'true')
    } catch {
      // ignore
    }
  }

  const handleStart = () => {
    markWelcomed()
    setOpen(false)
    // Scroll down to the checklist (bottom-right)
    setTimeout(() => {
      try {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
        // Dispatch a custom event so the checklist can self-expand if it wants
        window.dispatchEvent(new CustomEvent('onboarding:open-checklist'))
      } catch {
        // ignore
      }
    }, 200)
  }

  const handleSkip = () => {
    markWelcomed()
    setOpen(false)
  }

  const agentName = bot?.nombre_agente?.trim() || 'tu asistente'

  return (
    <AnimatePresence>
      {open && (
        <Portal>
          <motion.div
            key="welcome-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleSkip}
            />
            <motion.div
              key="welcome-card"
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden theme-transition"
            >
              {/* Gradient header */}
              <div className="relative px-6 pt-7 pb-5 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent">
                <motion.div
                  initial={{ rotate: -10, scale: 0.8, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 220 }}
                  className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4"
                >
                  <Sparkles className="w-6 h-6 text-primary" />
                </motion.div>
                <h2 className="text-xl font-bold text-foreground">
                  {t('onboarding.welcome.title', { name: agentName })}
                </h2>
                <p className="text-sm text-muted mt-1.5">
                  {t('onboarding.welcome.subtitle')}
                </p>
              </div>

              {/* Steps preview */}
              <div className="px-6 py-5">
                <ul className="space-y-2.5">
                  {steps.map((step, idx) => {
                    const Icon = STEP_ICONS[step.id]
                    return (
                      <motion.li
                        key={step.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + idx * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-border/40 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-foreground/70" />
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <p className="text-sm font-medium text-foreground leading-tight">
                            {t(step.label)}
                          </p>
                          <p className="text-xs text-muted mt-0.5 leading-snug">
                            {t(step.description)}
                          </p>
                        </div>
                      </motion.li>
                    )
                  })}
                </ul>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 pt-2 flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3">
                <button
                  onClick={handleSkip}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-border/30 transition-all duration-200"
                >
                  {t('onboarding.welcome.skip')}
                </button>
                <button
                  onClick={handleStart}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all duration-200 shadow-sm"
                >
                  {t('onboarding.welcome.start')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        </Portal>
      )}
    </AnimatePresence>
  )
}
