function escapeCell(v: unknown): string {
  if (v === null || v === undefined) return ''
  const s = typeof v === 'string' ? v : String(v)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function toCSV<T>(
  rows: T[],
  headers: { key: keyof T; label: string }[]
): string {
  const head = headers.map((h) => escapeCell(h.label)).join(',')
  const body = rows
    .map((r) => headers.map((h) => escapeCell(r[h.key])).join(','))
    .join('\n')
  return `${head}\n${body}`
}

export function downloadBlob(content: string, filename: string, mime = 'text/csv;charset=utf-8') {
  const bom = mime.startsWith('text/csv') ? '\uFEFF' : ''
  const blob = new Blob([bom + content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function stampDate(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
