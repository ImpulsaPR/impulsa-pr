'use client'

import { useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { t } = useTranslation()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-card border-r border-border flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.03),transparent_70%)]" />
        <div className="relative z-10 flex flex-col items-center text-center max-w-md">
          <Logo size="large" />
          <h2 className="text-2xl font-bold mt-8 tracking-tight">
            Business Automation
          </h2>
          <p className="text-muted mt-3 text-sm leading-relaxed">
            Automatiza tus conversaciones, gestiona tus leads y escala tu negocio con inteligencia artificial.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-8 w-full">
            <div className="text-center">
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-[11px] text-muted mt-1">AI Activo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">10x</div>
              <div className="text-[11px] text-muted mt-1">Respuesta</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">100%</div>
              <div className="text-[11px] text-muted mt-1">Cobertura</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8 lg:hidden">
            <Logo size="large" />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">{t('auth.welcomeBack')}</h1>
            <p className="text-sm text-muted mt-2">
              {t('auth.signInSubtitle')}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-muted mb-1.5 block font-medium">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted mb-1.5 block font-medium">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  required
                  className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-accent-red/10 border border-accent-red/20 px-4 py-2.5 text-sm text-accent-red">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-foreground text-background py-2.5 text-sm font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {t('auth.signIn')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-muted mt-6">
            {t('auth.noAccount')}{' '}
            <Link href="/signup" className="text-foreground font-medium hover:underline">
              {t('auth.signUp')}
            </Link>
          </p>

          <p className="text-[10px] text-muted mt-8">
            Powered by Impulsa PR
          </p>
        </div>
      </div>
    </div>
  )
}
