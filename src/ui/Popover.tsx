import * as RadixPopover from '@radix-ui/react-popover'
import type { ComponentPropsWithRef } from 'react'
import { cn } from './cn'

/** Popover root (Radix). */
export const Popover = RadixPopover.Root
/** Wrap a Button or IconButton with `asChild`. */
export const PopoverTrigger = RadixPopover.Trigger
export const PopoverClose = RadixPopover.Close
/** Positions the popover against another element than the trigger. */
export const PopoverAnchor = RadixPopover.Anchor

/** Floating panel: 4 px radius, hairline, the float shadow. Portalled, 4 px from the trigger. */
export function PopoverContent({
  className,
  sideOffset = 4,
  align = 'start',
  collisionPadding = 8,
  ...rest
}: ComponentPropsWithRef<typeof RadixPopover.Content>) {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        sideOffset={sideOffset}
        align={align}
        collisionPadding={collisionPadding}
        className={cn(
          'z-50 w-72 max-w-[calc(100vw-16px)] rounded-float border border-line bg-surface p-3 text-14 text-text shadow-float',
          'data-[state=open]:animate-fade-in',
          className,
        )}
        {...rest}
      />
    </RadixPopover.Portal>
  )
}
