export function Logo({ collapsed = false, size = 'default' }: { collapsed?: boolean; size?: 'default' | 'large' }) {
  const iconSize = size === 'large' ? 'w-11 h-11' : 'w-9 h-9'
  const titleSize = size === 'large' ? 'text-xl' : 'text-lg'

  return (
    <div className="flex items-center gap-2.5">
      <div className={`relative ${iconSize} flex-shrink-0`}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="leafGrad" x1="0" y1="0" x2="40" y2="40">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="var(--color-primary-dark)" />
            </linearGradient>
          </defs>
          {/* 6-petal leaf/asterisk icon matching Canva brand */}
          <g transform="translate(20,20)">
            <ellipse rx="4.5" ry="11" fill="url(#leafGrad)" opacity="0.9" />
            <ellipse rx="4.5" ry="11" fill="url(#leafGrad)" opacity="0.9" transform="rotate(60)" />
            <ellipse rx="4.5" ry="11" fill="url(#leafGrad)" opacity="0.9" transform="rotate(120)" />
          </g>
          <circle cx="20" cy="20" r="3.5" fill="var(--color-background)" />
        </svg>
      </div>
      {!collapsed && (
        <div className="flex items-baseline gap-1">
          <span className={`${titleSize} font-bold tracking-tight gradient-text`}>
            Impulsa
          </span>
          <span className="text-xs font-semibold text-muted tracking-wide">
            PR
          </span>
        </div>
      )}
    </div>
  )
}

export function LogoIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="leafGradIcon" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="var(--color-primary)" />
          <stop offset="100%" stopColor="var(--color-primary-dark)" />
        </linearGradient>
      </defs>
      <g transform="translate(20,20)">
        <ellipse rx="4.5" ry="11" fill="url(#leafGradIcon)" opacity="0.9" />
        <ellipse rx="4.5" ry="11" fill="url(#leafGradIcon)" opacity="0.9" transform="rotate(60)" />
        <ellipse rx="4.5" ry="11" fill="url(#leafGradIcon)" opacity="0.9" transform="rotate(120)" />
      </g>
      <circle cx="20" cy="20" r="3.5" fill="var(--color-background)" />
    </svg>
  )
}
