'use client'

import { createContext, useContext, useState, useCallback } from 'react'

interface SidebarContextValue {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  setCollapsed: () => {},
  toggle: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const toggle = useCallback(() => setCollapsed((c) => !c), [])

  return (
    <SidebarContext value={{ collapsed, setCollapsed, toggle }}>
      {children}
    </SidebarContext>
  )
}

export function useSidebarCollapsed() {
  return useContext(SidebarContext)
}
