/**
 * Sanitiza errores antes de devolverlos al cliente. Postgres a veces
 * leakea nombres de columnas, constraints, paths internos. Devolvemos
 * un mensaje genérico al cliente y loggeamos el detalle server-side.
 *
 * Uso:
 *   const safe = safeError('contexto', err)  // logs internamente
 *   return NextResponse.json({ error: safe.public }, { status: 500 })
 */

export interface SafeError {
  /** Mensaje seguro para mostrar al cliente */
  public: string
  /** Para incluir en logs server-side (no en respuesta) */
  internal: string
}

const POSTGRES_LEAK_PATTERNS = [
  /relation ".+" does not exist/i,
  /column ".+" does not exist/i,
  /violates .+ constraint/i,
  /duplicate key value violates/i,
  /permission denied for/i,
  /Failed to fetch/i,
]

/**
 * Logger interno (server-side). En producción reemplazar con Axiom/Logtail.
 */
function logInternal(context: string, message: string) {
  // Strip secrets de mensajes que puedan haber capturado tokens
  const cleaned = message
    .replace(/Bearer\s+[A-Za-z0-9._-]+/g, 'Bearer ***')
    .replace(/sb_secret_[A-Za-z0-9_-]+/g, 'sb_secret_***')
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, 'sk-***')
    .replace(/ya29\.[A-Za-z0-9._-]+/g, 'ya29.***')
  // eslint-disable-next-line no-console
  console.error(`[${context}]`, cleaned)
}

export function safeError(context: string, err: unknown): SafeError {
  const internal =
    err instanceof Error ? err.message : typeof err === 'string' ? err : JSON.stringify(err)
  logInternal(context, internal)

  // Si el error es leak conocido de Postgres → genérico
  if (POSTGRES_LEAK_PATTERNS.some((rx) => rx.test(internal))) {
    return { public: 'Error en la base de datos. Inténtalo más tarde.', internal }
  }

  // Errores comunes safe de exponer:
  if (/unauthorized|forbidden|invalid_token|sin_codigo|state_invalid/i.test(internal)) {
    return { public: internal.slice(0, 80), internal }
  }

  // Default: genérico
  return { public: 'Error procesando la solicitud.', internal }
}

/**
 * Helper específico para errores Supabase (PostgrestError shape).
 */
export function safeSupabaseError(
  context: string,
  err: { message?: string; code?: string; details?: string } | null
): SafeError {
  if (!err) return { public: 'unknown error', internal: 'no error object' }
  return safeError(context, err.message || err.code || JSON.stringify(err))
}
