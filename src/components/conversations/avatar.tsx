'use client'

// Paleta armoniosa con el theme esmeralda — verdes, azules, púrpuras, rosas suaves
const AVATAR_COLORS = [
  'bg-emerald-500/80',
  'bg-teal-500/80',
  'bg-cyan-500/80',
  'bg-sky-500/80',
  'bg-indigo-500/80',
  'bg-violet-500/80',
  'bg-fuchsia-500/80',
  'bg-rose-500/80',
] as const

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function colorForKey(key: string): string {
  return AVATAR_COLORS[hashString(key) % AVATAR_COLORS.length]
}

// Sanitiza nombre removiendo caracteres no imprimibles, emojis fuera del BMP,
// símbolos pictográficos y zero-width. Conserva acentos y ñ.
// Iteración char-by-char para evitar regex con literales invisibles.
export function sanitizeName(raw: string | null | undefined): string {
  if (!raw) return ''
  let out = ''
  for (let i = 0; i < raw.length; i++) {
    const code = raw.charCodeAt(i)
    // High surrogate: salta también el low surrogate que sigue (emojis SMP)
    if (code >= 0xd800 && code <= 0xdbff) {
      i++ // skip paired low surrogate
      continue
    }
    // Low surrogate suelto
    if (code >= 0xdc00 && code <= 0xdfff) continue
    // C0 control chars (0x00-0x1F) excepto tab/newline (no esperados en nombres)
    if (code < 0x20) continue
    // DEL + C1 control chars
    if (code >= 0x7f && code <= 0x9f) continue
    // Zero-width + direction marks
    if (code >= 0x200b && code <= 0x200f) continue
    if (code >= 0x202a && code <= 0x202e) continue
    if (code >= 0x2060 && code <= 0x206f) continue
    // Variation selectors FE00-FE0F + BOM
    if (code >= 0xfe00 && code <= 0xfe0f) continue
    if (code === 0xfeff) continue
    // Misc symbols (2600-26FF) + Dingbats (2700-27BF) — pictogramas BMP
    if (code >= 0x2600 && code <= 0x27bf) continue
    // BMP Private Use Area
    if (code >= 0xe000 && code <= 0xf8ff) continue
    // Replacement char
    if (code === 0xfffd) continue
    out += raw[i]
  }
  return out.trim()
}

export function getInitials(name: string): string {
  const cleaned = sanitizeName(name).replace(/^\+/, '').trim()
  if (!cleaned) return '?'
  const parts = cleaned.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const initials = parts
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return initials || '?'
}

interface AvatarProps {
  name: string
  phone: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASSES = {
  sm: 'w-9 h-9 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-12 h-12 text-base',
} as const

export function Avatar({ name, phone, size = 'md', className = '' }: AvatarProps) {
  const key = name || phone
  const color = colorForKey(key)
  const initials = getInitials(name || phone)

  return (
    <div
      className={`${SIZE_CLASSES[size]} ${color} rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 shadow-sm ${className}`}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}
