import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
const SUPABASE_SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()

let cached: ReturnType<typeof createClient> | null = null
function admin() {
  if (cached) return cached
  cached = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cached
}

export interface RateLimitResult {
  ok: boolean
  count: number
  limit: number
  reset_at: string
  retry_after_seconds?: number
}

/**
 * Sliding-window rate limit basado en Postgres RPC `rate_limit_check`.
 *
 * Bucket key = `<endpoint>:<identity>` (ej. `whatsapp_send:cliente_xxx`).
 * Identity puede ser cliente_id, IP, o user_id según contexto.
 *
 * Si el RPC no existe, retorna ok=true (fail-open) con warning. Esto
 * permite deployar sin breaking change si la migration no corrió.
 */
export async function rateLimit(
  bucket: string,
  identity: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const key = `${bucket}:${identity}`
  try {
    // RPC types not in database.types.ts yet — cast to any
    const { data, error } = await (admin().rpc as unknown as (
      fn: string,
      args: Record<string, unknown>
    ) => Promise<{
      data: Array<{ allowed: boolean; current_count: number; reset_at: string; retry_after_seconds: number }> | null
      error: { message: string } | null
    }>)('rate_limit_check', {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    })
    if (error) {
      console.warn('[rate-limit] RPC error, fail-open:', error.message)
      return { ok: true, count: 0, limit, reset_at: new Date(Date.now() + windowSeconds * 1000).toISOString() }
    }
    const row = Array.isArray(data) ? data[0] : data
    return {
      ok: row?.allowed ?? true,
      count: row?.current_count ?? 0,
      limit,
      reset_at: row?.reset_at || new Date(Date.now() + windowSeconds * 1000).toISOString(),
      retry_after_seconds: row?.retry_after_seconds,
    }
  } catch (e) {
    console.warn('[rate-limit] exception, fail-open:', e instanceof Error ? e.message : 'unknown')
    return { ok: true, count: 0, limit, reset_at: new Date().toISOString() }
  }
}
