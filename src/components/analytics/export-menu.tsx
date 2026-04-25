'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, FileText, FileSpreadsheet, Printer } from 'lucide-react'

interface ExportMenuProps {
  onExportLeads: () => void
  onExportMetrics: () => void
  onExportCitas: () => void
  onPrint: () => void
  labels: {
    export: string
    csvLeads: string
    csvMetrics: string
    csvCitas: string
    print: string
  }
}

export function ExportMenu({
  onExportLeads,
  onExportMetrics,
  onExportCitas,
  onPrint,
  labels,
}: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const run = (fn: () => void) => {
    fn()
    setOpen(false)
  }

  return (
    <div ref={wrapRef} className="relative print-hide">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:border-border-hover text-xs font-medium text-foreground transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Download className="w-3.5 h-3.5" />
        {labels.export}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card shadow-xl overflow-hidden z-30 animate-fade-up"
          style={{ animationDuration: '120ms' }}
        >
          <button
            role="menuitem"
            type="button"
            onClick={() => run(onExportLeads)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-card-hover transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
            {labels.csvLeads}
          </button>
          <button
            role="menuitem"
            type="button"
            onClick={() => run(onExportMetrics)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-card-hover transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
            {labels.csvMetrics}
          </button>
          <button
            role="menuitem"
            type="button"
            onClick={() => run(onExportCitas)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-card-hover transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
            {labels.csvCitas}
          </button>
          <div className="h-px bg-border" />
          <button
            role="menuitem"
            type="button"
            onClick={() => run(onPrint)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-card-hover transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <FileText className="w-3.5 h-3.5 -ml-1 text-blue-400" />
            {labels.print}
          </button>
        </div>
      )}
    </div>
  )
}
