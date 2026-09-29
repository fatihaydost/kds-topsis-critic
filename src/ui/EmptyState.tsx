import type { ReactNode } from 'react'
import { cn } from './cn'

export type EmptyStateProps = {
  /** What is missing, as a statement ("No decision matrix yet"). */
  title: ReactNode
  /** What to do about it, one or two sentences. */
  description?: ReactNode
  /** Buttons: the primary way forward first. */
  action?: ReactNode
  /** Heading level for the title; default h2. */
  as?: 'h2' | 'h3' | undefined
  className?: string | undefined
}

/** Empty state of a stage or panel: left-aligned text and actions, no illustration. */
export function EmptyState({ title, description, action, as: H = 'h2', className }: EmptyStateProps) {
  return (
    <div className={cn('flex max-w-[480px] flex-col items-start gap-2 py-10', className)}>
      <H className="text-16 font-semibold text-text">{title}</H>
      {description && <p className="text-14 text-text-2">{description}</p>}
      {action && <div className="mt-2 flex flex-wrap gap-2">{action}</div>}
    </div>
  )
}
