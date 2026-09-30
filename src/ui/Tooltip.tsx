import * as RadixTooltip from '@radix-ui/react-tooltip'
import type { ReactElement, ReactNode } from 'react'

/** Mount once near the root (App does this). 400 ms delay, instant between neighbours. */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <RadixTooltip.Provider delayDuration={400} skipDelayDuration={200}>
      {children}
    </RadixTooltip.Provider>
  )
}

export type TooltipProps = {
  /** Short text. Not a replacement for an accessible name: IconButton still needs aria-label. */
  content: ReactNode
  /** Exactly one focusable element (it becomes the trigger via asChild). */
  children: ReactElement
  side?: 'top' | 'right' | 'bottom' | 'left' | undefined
  align?: 'start' | 'center' | 'end' | undefined
}

/** Small inverted label on hover and focus. */
export function Tooltip({ content, children, side = 'top', align = 'center' }: TooltipProps) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          align={align}
          sideOffset={6}
          collisionPadding={8}
          // Only the first tooltip after the delay animates in; moving between neighbours (instant-open) does not.
          className={
            'z-50 max-w-64 origin-(--radix-tooltip-content-transform-origin) rounded-control bg-text px-2 py-1 text-12 text-bg ' +
            'data-[state=closed]:animate-float-out data-[state=delayed-open]:animate-float-in'
          }
        >
          {content}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
}
