'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { ToastProvider } from '@/components/ui/toast'
import { SidebarProvider, useSidebarCollapsed } from '@/hooks/use-sidebar'
import { ClienteProvider } from '@/hooks/use-cliente'

function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [visible, setVisible] = useState(true)
  const [currentChildren, setCurrentChildren] = useState(children)

  useEffect(() => {
    setVisible(false)
    const timeout = setTimeout(() => {
      setCurrentChildren(children)
      setVisible(true)
    }, 150)
    return () => clearTimeout(timeout)
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
      }`}
    >
      {currentChildren}
    </div>
  )
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebarCollapsed()

  return (
    <div className="min-h-screen bg-background theme-transition dot-grid">
      <Sidebar />
      <div
        className={`transition-all duration-300 ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-[240px]'}`}
      >
        <Topbar />
        <main id="main-content" className="px-4 py-6 sm:px-6 lg:px-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <ClienteProvider>
        <SidebarProvider>
          <DashboardContent>{children}</DashboardContent>
        </SidebarProvider>
      </ClienteProvider>
    </ToastProvider>
  )
}
