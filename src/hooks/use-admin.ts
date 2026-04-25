'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'

const SUPERADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL || ''

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

  const isSuperAdmin = !!email && !!SUPERADMIN_EMAIL && email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()

  return { isSuperAdmin, loading, email }
}
