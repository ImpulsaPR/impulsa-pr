import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

// Handler del email de confirmación + OAuth callback.
// Supabase redirige aquí después de que el usuario confirma su email.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as
    | 'signup'
    | 'recovery'
    | 'email_change'
    | 'invite'
    | 'magiclink'
    | null
  const next = searchParams.get('next') ?? '/'

  const supabase = await createSupabaseServer()

  // Flow OAuth / email link modernos (PKCE con ?code=...)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
  }

  // Flow clásico de email confirmation (?token_hash=...&type=signup)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
  }

  // Sin parámetros válidos
  return NextResponse.redirect(`${origin}/login?error=invalid_callback`)
}
