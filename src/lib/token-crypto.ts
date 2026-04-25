import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto'

/**
 * AES-256-GCM encryption for sensitive tokens (OAuth access/refresh).
 *
 * Key derivation: SHA-256(TOKEN_ENCRYPTION_KEY) gives us a deterministic
 * 32-byte key. The env var should be a high-entropy random string ≥32 chars.
 *
 * Format on disk: `v1:<iv-hex>:<authtag-hex>:<ciphertext-hex>`
 *
 * If TOKEN_ENCRYPTION_KEY is not set OR the input is not in v1: format,
 * we treat it as plaintext (legacy compat). New writes always encrypt.
 */

const KEY_RAW = (process.env.TOKEN_ENCRYPTION_KEY || '').trim()
const KEY_ENABLED = KEY_RAW.length >= 16
const KEY = KEY_ENABLED ? createHash('sha256').update(KEY_RAW).digest() : null
const VERSION = 'v1'

export function encryptToken(plaintext: string | null | undefined): string | null {
  if (!plaintext) return null
  if (!KEY) {
    // No key configured — store as-is (compat con bot_credentials existentes
    // antes de habilitar encryption). Loggear warning una vez.
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[token-crypto] TOKEN_ENCRYPTION_KEY not set, storing plaintext')
    }
    return plaintext
  }
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', KEY, iv)
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${VERSION}:${iv.toString('hex')}:${tag.toString('hex')}:${ct.toString('hex')}`
}

export function decryptToken(stored: string | null | undefined): string | null {
  if (!stored) return null
  // Legacy plaintext (no version prefix)
  if (!stored.startsWith(`${VERSION}:`)) return stored
  if (!KEY) {
    // Encrypted but no key available — bug
    throw new Error('Token encrypted but TOKEN_ENCRYPTION_KEY missing')
  }
  const parts = stored.split(':')
  if (parts.length !== 4) throw new Error('Token format invalido')
  const [, ivHex, tagHex, ctHex] = parts
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const ct = Buffer.from(ctHex, 'hex')
  const decipher = createDecipheriv('aes-256-gcm', KEY, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8')
}
