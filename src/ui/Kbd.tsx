import type { ReactNode } from 'react'
import { cn } from './cn'

/** Keyboard key, e.g. <Kbd>Tab</Kbd> or <Kbd>F2</Kbd>. */
export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-control border border-line-strong bg-surface px-1',
        'font-mono text-12 text-text-2',
        className,
      )}
    >
      {children}
    </kbd>
  )
}
