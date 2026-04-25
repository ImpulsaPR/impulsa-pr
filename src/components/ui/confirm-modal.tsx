'use client'

import { AlertTriangle, Loader2 } from 'lucide-react'
import { Portal } from './portal'

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  loading,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null

  return (
    <Portal>
    <div className="fixed inset-0 z-[55] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm mx-4 rounded-2xl border border-border bg-card shadow-2xl animate-scale-in p-6 theme-transition">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent-red/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-accent-red" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-foreground">{title}</h3>
            <p className="text-sm text-muted mt-1">{message}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-border/30 transition-all duration-200 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent-red text-white text-sm font-medium hover:bg-accent-red/90 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
    </Portal>
  )
}
