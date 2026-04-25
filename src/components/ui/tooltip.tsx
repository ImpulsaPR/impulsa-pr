'use client'

import { useState, useRef } from 'react'

interface TooltipProps {
  content: string
  children: React.ReactNode
  position?: 'top' | 'bottom'
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), 400)
  }

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setVisible(false)
  }

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <div
          className={`absolute z-50 px-2.5 py-1.5 rounded-lg bg-foreground text-background text-[11px] font-medium whitespace-nowrap shadow-lg pointer-events-none
            animate-fade-in ${
              position === 'top'
                ? 'bottom-full mb-2 left-1/2 -translate-x-1/2'
                : 'top-full mt-2 left-1/2 -translate-x-1/2'
            }`}
        >
          {content}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45 ${
              position === 'top' ? '-bottom-1' : '-top-1'
            }`}
          />
        </div>
      )}
    </div>
  )
}
