'use client'

import { Suspense, useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { Loader2, Mail, Lock, User, ArrowRight, ShieldAlert } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export default function SignupPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted" /></div>}>
      <SignupPage />
    </Suspense>
  )
}

type InviteState =
  | { status: 'checking' }
  | { status: 'invalid'; reason: string }
  | { status: 'valid'; token: string; email: string | null; nombre: string | null; empresa: string | null }

function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { t } = useTranslation()
  const searchParams = useSearchParams()

  const [invite, setInvite] = useState<InviteState>({ status: 'checking' })

  useEffect(() => {
    const token = searchParams.get('invite')
    if (!token) {
      setInvite({ status: 'invalid', reason: 'Necesitas una invitación para crear una cuenta.' })
      return
    }
    (async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase.rpc('validate_invite', { p_token: token })
      const row = Array.isArray(data) ? data[0] : null
      if (error || !row || !row.valid) {
        setInvite({ status: 'invalid', reason: 'Invitación inválida, expirada o ya utilizada.' })
        return
      }
      setInvite({
        status: 'valid',
        token,
        email: row.email ?? null,
        nombre: row.nombre ?? null,
        empresa: row.empresa ?? null,
      })
      if (row.email) setEmail(row.email)
      if (row.nombre) setFullName(row.nombre)
    })()
  }, [searchParams])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (invite.status !== 'valid') return
    setLoading(true)
    setError('')

    const supabase = getSupabase()
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, invite_token: invite.token },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      const { data: existing } = await supabase
        .from('clientes')
        .select('id')
        .eq('auth_user_id', authData.user.id)
        .single()

      if (!existing) {
        await supabase.from('clientes').insert({
          auth_user_id: authData.user.id,
          email,
          nombre: fullName,
          empresa: invite.empresa,
        })
      }

      // Consume invite atómicamente (RPC hace la validación + update en una operación)
      const { data: consumed } = await supabase.rpc('consume_invite', {
        p_token: invite.token,
        p_user_id: authData.user.id,
      })
      if (!consumed) {
        // Race condition: token usado entre validate y consume — aborta el signup
        setError('La invitación ya fue utilizada. Contacta soporte.')
        setLoading(false)
        return
      }
    }

    setSuccess(true)
    setLoading(false)
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
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8 lg:hidden">
            <Logo size="large" />
          </div>

          {invite.status === 'checking' ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted" />
              <p className="text-sm text-muted mt-3">Validando invitación…</p>
            </div>
          ) : invite.status === 'invalid' ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-accent-red/10 border border-accent-red/20 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-6 h-6 text-accent-red" />
              </div>
              <h2 className="text-lg font-bold">Registro por invitación</h2>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                {invite.reason} Contacta a Impulsa PR si necesitas acceso.
              </p>
              <div className="flex flex-col gap-2 mt-6">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-1 text-sm text-foreground font-medium hover:underline"
                >
                  Ir a iniciar sesión <ArrowRight className="w-3 h-3" />
                </Link>
                <a
                  href="https://wa.me/19399052410?text=Hola!%20Quiero%20acceso%20al%20dashboard%20de%20Impulsa%20PR."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted hover:text-foreground transition-colors"
                >
                  Solicitar acceso por WhatsApp
                </a>
              </div>
            </div>
          ) : success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-foreground" />
              </div>
              <h2 className="text-lg font-bold">{t('auth.checkEmail')}</h2>
              <p className="text-sm text-muted mt-2">
                {t('auth.confirmSent')} <strong className="text-foreground">{email}</strong>
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1 mt-4 text-sm text-foreground font-medium hover:underline"
              >
                {t('auth.backToSignIn')} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">{t('auth.createAccount')}</h1>
                <p className="text-sm text-muted mt-2">
                  {t('auth.signUpSubtitle')}
                </p>
              </div>

              <form onSubmit={handleSignup} method="post" className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="text-xs text-muted mb-1.5 block font-medium">{t('auth.fullName')}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      name="fullName"
                      id="fullName"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t('auth.fullNamePlaceholder')}
                      required
                      className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="text-xs text-muted mb-1.5 block font-medium">{t('auth.email')}</label>
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
                  <label htmlFor="password" className="text-xs text-muted mb-1.5 block font-medium">{t('auth.password')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="password"
                      name="password"
                      id="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('auth.passwordPlaceholder')}
                      required
                      minLength={6}
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
                      {t('auth.createBtn')}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-sm text-muted mt-6">
                {t('auth.hasAccount')}{' '}
                <Link href="/login" className="text-foreground font-medium hover:underline">
                  {t('auth.signInLink')}
                </Link>
              </p>
            </>
          )}

          <p className="text-[10px] text-muted mt-8">
            Powered by Impulsa PR
          </p>
        </div>
      </div>
    </div>
  )
}
