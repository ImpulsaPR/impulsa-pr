'use client'

import { useState } from 'react'
import { Plus, Trash2, Pencil, BookOpen, Search, Loader2, X, Save } from 'lucide-react'
import { useKnowledgeBase, type KbEntry } from '@/hooks/use-knowledge-base'
import { useToast } from '@/components/ui/toast'
import { Skeleton } from '@/components/ui/skeleton'

const CATEGORIES = [
  { value: 'faq', label: 'FAQ', emoji: '❓' },
  { value: 'producto', label: 'Producto', emoji: '📦' },
  { value: 'servicio', label: 'Servicio', emoji: '🛠️' },
  { value: 'politica', label: 'Política', emoji: '📋' },
  { value: 'correccion', label: 'Corrección', emoji: '✏️' },
  { value: 'general', label: 'General', emoji: '💬' },
]

interface FormState {
  id?: string
  category: string
  question: string
  answer: string
}

const EMPTY: FormState = { category: 'faq', question: '', answer: '' }

export default function KnowledgePage() {
  const { entries, loading, upsert, remove } = useKnowledgeBase()
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState<string | null>(null)
  const [editing, setEditing] = useState<FormState | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const { toast } = useToast()

  const filtered = entries.filter((e) => {
    if (filterCat && e.category !== filterCat) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      e.question.toLowerCase().includes(q) ||
      e.answer.toLowerCase().includes(q) ||
      (e.tags?.some((t) => t.toLowerCase().includes(q)) ?? false)
    )
  })

  const handleSave = async () => {
    if (!editing) return
    if (!editing.question.trim() || !editing.answer.trim()) {
      toast('Pregunta y respuesta son requeridas', 'error')
      return
    }
    setSaving(true)
    try {
      await upsert({
        id: editing.id,
        category: editing.category,
        question: editing.question,
        answer: editing.answer,
      })
      toast(editing.id ? 'Actualizado' : 'Agregado al conocimiento')
      setEditing(null)
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Error', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (id: string) => {
    try {
      await remove(id)
      toast('Eliminado')
      setConfirmDelete(null)
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Error', 'error')
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Base de Conocimiento
          </h1>
          <p className="text-sm text-muted mt-1">
            Enseñale al bot. Cada entrada que agregues queda guardada y la usa el bot cuando un cliente pregunta algo similar.
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY })}
          className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all duration-200 active:scale-[0.97]"
        >
          <Plus className="w-4 h-4" />
          Agregar
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Buscar pregunta, respuesta o tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-foreground placeholder:text-muted outline-none w-full"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterCat(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !filterCat
                ? 'bg-primary text-white'
                : 'bg-card text-muted hover:bg-card-hover border border-border'
            }`}
          >
            Todas
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setFilterCat(filterCat === c.value ? null : c.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterCat === c.value
                  ? 'bg-primary text-white'
                  : 'bg-card text-muted hover:bg-card-hover border border-border'
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Entries grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <BookOpen className="w-10 h-10 text-muted/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">
            {entries.length === 0 ? 'Aún no enseñaste nada al bot' : 'Sin resultados'}
          </p>
          <p className="text-xs text-muted">
            {entries.length === 0
              ? 'Agrega FAQs, productos, políticas. Cada entrada que metas, el bot la usa.'
              : 'Cambia el filtro o la búsqueda.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((e) => (
            <KbCard
              key={e.id}
              entry={e}
              onEdit={() =>
                setEditing({
                  id: e.id,
                  category: e.category,
                  question: e.question,
                  answer: e.answer,
                })
              }
              onDelete={() => setConfirmDelete(e.id)}
            />
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !saving && setEditing(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-semibold">
                {editing.id ? 'Editar entrada' : 'Nueva entrada'}
              </h2>
              <button
                onClick={() => !saving && setEditing(null)}
                className="p-1 rounded-lg hover:bg-card-hover text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Categoría</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setEditing({ ...editing, category: c.value })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        editing.category === c.value
                          ? 'bg-primary text-white'
                          : 'bg-background text-muted hover:bg-card-hover border border-border'
                      }`}
                    >
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  Pregunta o tema
                </label>
                <input
                  type="text"
                  value={editing.question}
                  onChange={(e) => setEditing({ ...editing, question: e.target.value })}
                  placeholder='Ej: "¿Cuánto tarda la entrega?"'
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Respuesta</label>
                <textarea
                  value={editing.answer}
                  onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
                  placeholder='Ej: "Las entregas tardan 3-5 días hábiles. Si necesitas urgente, ofrecemos express por $15 extra."'
                  rows={5}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary/40 resize-none"
                />
                <p className="text-[11px] text-muted mt-1">
                  Tip: redacta como le hablarías al cliente. El bot la usará como referencia.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-5 border-t border-border">
              <button
                onClick={() => !saving && setEditing(null)}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-sm text-muted hover:bg-card-hover transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editing.question.trim() || !editing.answer.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-[0.97]"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold mb-2">¿Eliminar esta entrada?</h3>
            <p className="text-sm text-muted mb-5">
              El bot no la usará más como referencia. Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl text-sm text-muted hover:bg-card-hover"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRemove(confirmDelete)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-all active:scale-[0.97]"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function KbCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: KbEntry
  onEdit: () => void
  onDelete: () => void
}) {
  const cat = CATEGORIES.find((c) => c.value === entry.category)
  return (
    <div className="group rounded-2xl border border-border bg-card p-4 hover:border-primary/40 transition-all">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background text-[10px] font-medium text-muted border border-border">
          {cat?.emoji} {cat?.label || entry.category}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-card-hover text-muted hover:text-foreground"
            aria-label="Editar"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500"
            aria-label="Eliminar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-1.5">
        {entry.question}
      </h3>
      <p className="text-xs text-muted leading-relaxed line-clamp-3">{entry.answer}</p>
      {entry.usage_count > 0 && (
        <p className="text-[10px] text-muted/70 mt-3">
          Usado {entry.usage_count} {entry.usage_count === 1 ? 'vez' : 'veces'}
        </p>
      )}
    </div>
  )
}
