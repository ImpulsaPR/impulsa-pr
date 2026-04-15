'use client'

import Image from 'next/image'

export function Logo({ collapsed = false, size = 'default' }: { collapsed?: boolean; size?: 'default' | 'large' }) {
  const imgSize = size === 'large' ? 44 : 36
  const titleSize = size === 'large' ? 'text-xl' : 'text-lg'

  return (
    <div className="flex items-center gap-2.5">
      <Image
        src="/logo-full.png"
        alt="Impulsa PR"
        width={imgSize}
        height={imgSize}
        className="flex-shrink-0"
        priority
      />
      {!collapsed && (
        <div className="flex items-baseline gap-1">
          <span className={`${titleSize} font-bold tracking-tight text-foreground`}>
            Impulsa
          </span>
          <span className="text-xs font-semibold text-muted tracking-wide uppercase">
            PR
          </span>
        </div>
      )}
    </div>
  )
}

export function LogoIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <Image
      src="/logo-full.png"
      alt="Impulsa PR"
      width={32}
      height={32}
      className={className}
      priority
    />
  )
}
