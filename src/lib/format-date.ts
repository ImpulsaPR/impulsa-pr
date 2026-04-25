export function formatFechaCorta(iso: string, locale: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    day: 'numeric',
    month: 'short',
  })
}

export function formatFechaHora(iso: string, locale: string) {
  const d = new Date(iso)
  return d.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
