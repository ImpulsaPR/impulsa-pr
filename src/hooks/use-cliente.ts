'use client'

import { useEffect, useState } from 'react'
import { getCurrentCliente } from '@/lib/get-current-cliente'
import type { Cliente } from '@/lib/types'

export function useCliente() {
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentCliente()
      .then(setCliente)
      .finally(() => setLoading(false))
  }, [])

  return { cliente, loading }
}
