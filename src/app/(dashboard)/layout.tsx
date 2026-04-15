'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { ToastProvider } from '@/components/ui/toast'
import { SidebarProvider, useSidebarCollapsed } from '@/hooks/use-sidebar'

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebarCollapsed()

  return (
    <div className="min-h-screen bg-background theme-transition dot-grid">
      <Sidebar />
      <div
        className={`transition-all duration-300 ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-[240px]'}`}
      >
        <Topbar />
        <main className="px-4 py-6 sm:px-6 lg:px-8 animate-page-in">{children}</main>
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
      <SidebarProvider>
        <DashboardContent>{children}</DashboardContent>
      </SidebarProvider>
    </ToastProvider>
  )
}
