'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'

// Lista de emails super-admin. Hardcoded como fallback robusto en caso
// de que NEXT_PUBLIC_SUPERADMIN_EMAIL no haya sido incluido en el build.
const HARDCODED_SUPERADMINS = ['info@impulsapr.com']
const ENV_SUPERADMIN = process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL || ''

const ALLOWED_ADMINS = new Set(
  [...HARDCODED_SUPERADMINS, ENV_SUPERADMIN]
    .filter(Boolean)
    .map((e) => e.toLowerCase())
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
