'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { ToastProvider } from '@/components/ui/toast'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-background theme-transition">
        <Sidebar />
        <div className="ml-[240px] transition-all duration-300">
          <Topbar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </ToastProvider>
  )
}
