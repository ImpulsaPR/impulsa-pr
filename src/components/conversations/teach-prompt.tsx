'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Loader2, Save, Check } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

const CATEGORIES = [
  { value: 'correccion', label: '✏️ Corrección' },
  { value: 'faq', label: '❓ FAQ' },
  { value: 'producto', label: '📦 Producto' },
  { value: 'servicio', label: '🛠️ Servicio' },
  { value: 'politica', label: '📋 Política' },
  { value: 'general', label: '💬 General' },
]

export interface TeachContext {
  customerMessage: string
  humanReply: string
  botPreviousReply?: string
  telefono: string
  /** unique id so re-sends don't reuse stale prompts */
  key: string
}

interface TeachPromptProps {
  context: TeachContext | null
  onDismiss: () => void
}

export function TeachPrompt({ context, onDismiss }: TeachPromptProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [autoHideTimer, setAutoHideTimer] = useState<number | null>(null)

  useEffect(() => {
    if (!context) {
      setAutoHideTimer(null)
      return
    }
    if (modalOpen) return
    // Auto-dismiss banner after 30s
    const timer = window.setTimeout(() => onDismiss(), 30000)
    setAutoHideTimer(timer as unknown as number)
    return () => window.clearTimeout(timer)
  }, [context, modalOpen, onDismiss])

  return (
    <>
      <AnimatePresence>
        {context && !modalOpen && (
          <motion.div
            key={context.key}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="fixed bottom-6 right-6 z-40 max-w-sm rounded-2xl border border-primary/30 bg-card shadow-xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  ¿Guardar como conocimiento?
                </p>
                <p className="text-xs text-muted mt-0.5">
                  El bot aprende de tu respuesta y la usa con clientes futuros que pregunten lo mismo.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-all active:scale-[0.97]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Guardar
                  </button>
                  <button
                    onClick={onDismiss}
                    className="px-3 py-1.5 rounded-lg text-xs text-muted hover:bg-card-hover transition-colors"
                  >
                    No
                  </button>
                </div>
              </div>
              <button
                onClick={onDismiss}
                aria-label="Cerrar"
                className="p-1 rounded-lg hover:bg-card-hover text-muted -m-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {context && modalOpen && (
        <TeachModal
          context={context}
          onClose={() => {
            setModalOpen(false)
            onDismiss()
            if (autoHideTimer) window.clearTimeout(autoHideTimer)
          }}
        />
      )}
    </>
  )
}

interface TeachModalProps {
  context: TeachContext
  onClose: () => void
}

function TeachModal({ context, onClose }: TeachModalProps) {
  const [question, setQuestion] = useState(context.customerMessage)
  const [answer, setAnswer] = useState(context.humanReply)
  const [category, setCategory] = useState('correccion')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) {
      toast('Pregunta y respuesta son requeridas', 'error')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/kb/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          question: question.trim(),
          answer: answer.trim(),
          source: 'takeover',
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Error guardando')
      }
      setSaved(true)
      toast('Guardado en conocimiento. El bot ya puede usarlo.')
      setTimeout(onClose, 800)
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Error', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => !saving && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Enseñar al bot</h2>
              <p className="text-xs text-muted">El bot aprende de tu respuesta para futuros clientes</p>
            </div>
          </div>
          <button
            onClick={() => !saving && onClose()}
            className="p-1 rounded-lg hover:bg-card-hover text-muted"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {context.botPreviousReply && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 mb-1">
                Lo que iba a decir el bot (referencia)
              </p>
              <p className="text-xs text-muted leading-relaxed line-clamp-3">
                {context.botPreviousReply}
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Categoría</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    category === c.value
                      ? 'bg-primary text-white'
                      : 'bg-background text-muted hover:bg-card-hover border border-border'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Pregunta o tema (cliente preguntó)
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ej: ¿Cuánto tarda la entrega?"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary/40"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Tu respuesta (lo que el bot debe decir)
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={5}
              placeholder="La respuesta correcta..."
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary/40 resize-none"
            />
            <p className="text-[11px] text-muted mt-1">
              Edita lo que necesites antes de guardar. Esta es la respuesta que el bot dará a futuros clientes con preguntas similares.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-5 border-t border-border">
          <button
            onClick={() => !saving && onClose()}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-sm text-muted hover:bg-card-hover transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || saved || !question.trim() || !answer.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-[0.97]"
          >
            {saved ? (
              <Check className="w-4 h-4" />
            ) : saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? 'Guardado' : saving ? 'Guardando...' : 'Guardar como conocimiento'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
