import { createHmac, timingSafeEqual } from 'crypto'

/**
 * HMAC-based proxy auth: instead of trusting a global shared secret +
 * arbitrary `cliente_id` from the body, n8n must compute an HMAC of
 * `cliente_id|timestamp` using the shared secret. Server validates:
 *   1. Timestamp is within ±5 minutes (prevents replay)
 *   2. HMAC matches expected value (prevents forgery)
 *
 * This binds the request to a specific cliente_id at signature time —
 * an attacker with the secret cannot trivially impersonate other tenants
 * without computing a valid signature for that tenant (still possible
 * with the secret, but logged + auditable).
 *
 * The MAC is sent as `x-proxy-mac` header along with `x-proxy-ts`.
 */

const SKEW_TOLERANCE_MS = 5 * 60 * 1000 // 5 minutes

export interface ProxyAuthResult {
  ok: boolean
  reason?: 'missing_secret' | 'missing_headers' | 'expired' | 'invalid_mac'
}

export function verifyProxyMac(
  secret: string,
  clienteId: string,
  timestamp: string,
  providedMac: string
): ProxyAuthResult {
  if (!secret) return { ok: false, reason: 'missing_secret' }
  if (!clienteId || !timestamp || !providedMac) {
    return { ok: false, reason: 'missing_headers' }
  }

  const ts = Number(timestamp)
  if (!Number.isFinite(ts)) return { ok: false, reason: 'expired' }
  const now = Date.now()
  if (Math.abs(now - ts) > SKEW_TOLERANCE_MS) {
    return { ok: false, reason: 'expired' }
  }

  const expected = createHmac('sha256', secret)
    .update(`${clienteId}|${timestamp}`)
    .digest('hex')

  // timing-safe comparison
  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(providedMac, 'utf8')
  if (a.length !== b.length) return { ok: false, reason: 'invalid_mac' }
  if (!timingSafeEqual(a, b)) return { ok: false, reason: 'invalid_mac' }

  return { ok: true }
}

/**
 * Convenience: also accept legacy `x-proxy-token` (raw shared secret) for
 * backwards compat during migration. Once n8n is updated to send MAC, this
 * fallback can be removed.
 */
export function verifyProxyAuth(
  request: Request,
  bodyClienteId: string
): ProxyAuthResult {
  const secret = (process.env.CALENDAR_PROXY_TOKEN || '').trim()
  if (!secret) return { ok: false, reason: 'missing_secret' }

  // New flow: HMAC
  const mac = request.headers.get('x-proxy-mac')
  const ts = request.headers.get('x-proxy-ts')
  const macClienteId = request.headers.get('x-proxy-cid') || bodyClienteId
  if (mac && ts) {
    const result = verifyProxyMac(secret, macClienteId, ts, mac)
    if (result.ok && macClienteId === bodyClienteId) return { ok: true }
    return result.ok
      ? { ok: false, reason: 'invalid_mac' }
      : result
  }

  // Legacy flow: raw shared secret (TODO: remove once n8n migrated)
  const legacy = request.headers.get('x-proxy-token')
  if (legacy && legacy === secret) return { ok: true }

  return { ok: false, reason: 'missing_headers' }
}
