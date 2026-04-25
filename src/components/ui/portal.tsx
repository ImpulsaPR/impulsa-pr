'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * Renders children into document.body via React Portal.
 *
 * Necesario para modals/overlays dentro del dashboard layout porque
 * PageTransition aplica `translate-y-0` (Tailwind transform), creando
 * un nuevo contexto de apilamiento que rompe `position: fixed`. Sin
 * portal, los modals quedan posicionados relativo al wrapper trans-
 * formado en vez del viewport, ocultándose detrás del topbar.
 */
export function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])
  if (!mounted) return null
  return createPortal(children, document.body)
}
