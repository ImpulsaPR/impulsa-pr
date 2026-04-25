'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { getCurrentCliente } from '@/lib/get-current-cliente'
import type { Cliente } from '@/lib/types'

interface ClienteContextValue {
  cliente: Cliente | null
  loading: boolean
  refresh: () => Promise<void>
}

const ClienteContext = createContext<ClienteContextValue | null>(null)

export function ClienteProvider({ children }: { children: ReactNode }) {
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const c = await getCurrentCliente()
    setCliente(c)
    setLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    getCurrentCliente().then((c) => {
      if (cancelled) return
      setCliente(c)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <ClienteContext.Provider value={{ cliente, loading, refresh }}>
      {children}
    </ClienteContext.Provider>
  )
}

export function useCliente() {
  const ctx = useContext(ClienteContext)
  if (!ctx) {
    throw new Error('useCliente must be used inside ClienteProvider')
  }
  return ctx
}
