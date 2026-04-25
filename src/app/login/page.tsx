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

  const [googleLoading, setGoogleLoading] = useState(false)

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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')
    const { error: authError } = await getSupabase().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })
    if (authError) {
      setError(authError.message)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — navy dominant brand anchor */}
      <div className="section-navy hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12">
        <div className="flex flex-col items-center text-center max-w-md">
          <Logo size="large" />
          <h2 className="font-display text-4xl mt-8 tracking-tight text-white leading-[1.05]">
            Business <span className="italic text-[#eab308]">automation</span>
          </h2>
          <p className="text-white/70 mt-4 text-sm leading-relaxed">
            Automatiza tus conversaciones, gestiona tus leads y escala tu negocio con inteligencia artificial.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-8 w-full">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#fafaf5]">24/7</div>
              <div className="text-[11px] text-white/50 mt-1 uppercase tracking-wider">AI Activo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#fafaf5]">10x</div>
              <div className="text-[11px] text-white/50 mt-1 uppercase tracking-wider">Respuesta</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#fafaf5]">100%</div>
              <div className="text-[11px] text-white/50 mt-1 uppercase tracking-wider">Cobertura</div>
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

          <form onSubmit={handleLogin} method="post" className="space-y-4">
            <div>
              <label className="text-xs text-muted mb-1.5 block font-medium">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
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
                  name="password"
                  id="password"
                  autoComplete="current-password"
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

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs text-muted">{t('auth.or')}</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-border bg-card py-2.5 text-sm font-medium text-foreground hover:bg-card-hover hover:border-border-hover transition-all duration-200 disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {t('auth.googleSignIn')}
          </button>

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
