'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'

// Single source of truth: env var NEXT_PUBLIC_SUPERADMIN_EMAIL.
// Soporta múltiples emails separados por coma.
const ENV_SUPERADMIN = (process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL || '').trim()

const ALLOWED_ADMINS = new Set(
  ENV_SUPERADMIN.split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
)

interface UseAdminResult {
  isSuperAdmin: boolean
  loading: boolean
  email: string | null
}

export function useAdmin(): UseAdminResult {
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const supabase = getSupabase()
    supabase.auth.getUser().then((res: { data: { user: { email?: string | null } | null } }) => {
      if (cancelled) return
      setEmail(res.data.user?.email ?? null)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const isSuperAdmin = !!email && ALLOWED_ADMINS.has(email.toLowerCase())

  return { isSuperAdmin, loading, email }
}
