import { Check } from '@phosphor-icons/react'
import * as Menu from '@radix-ui/react-dropdown-menu'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cn } from './cn'

/** Menu root (Radix). */
export const DropdownMenu = Menu.Root
/** Wrap a Button or IconButton with `asChild`. */
export const DropdownMenuTrigger = Menu.Trigger
export const DropdownMenuGroup = Menu.Group
export const DropdownMenuRadioGroup = Menu.RadioGroup

/** Floating list; portalled, 4 px from the trigger, aligned to its end by default. */
export function DropdownMenuContent({
  className,
  sideOffset = 4,
  align = 'end',
  collisionPadding = 8,
  ...rest
}: ComponentPropsWithRef<typeof Menu.Content>) {
  return (
    <Menu.Portal>
      <Menu.Content
        sideOffset={sideOffset}
        align={align}
        collisionPadding={collisionPadding}
        className={cn(
          'z-50 min-w-44 rounded-float border border-line bg-surface p-1 text-14 text-text shadow-float',
          'data-[state=open]:animate-fade-in',
          className,
        )}
        {...rest}
      />
    </Menu.Portal>
  )
}

const itemClasses =
  'relative flex h-8 cursor-default items-center gap-2 rounded-control px-2 outline-none select-none ' +
  'data-[highlighted]:bg-surface-2 data-[disabled]:pointer-events-none data-[disabled]:text-text-3 [&_svg]:size-4 [&_svg]:text-text-2'

export type DropdownMenuItemProps = ComponentPropsWithRef<typeof Menu.Item> & {
  icon?: ReactNode
  /** Keyboard hint on the right, e.g. <Kbd>Ctrl</Kbd>. */
  shortcut?: ReactNode
}

/** An action. `onSelect` runs it; the menu closes afterwards. */
export function DropdownMenuItem({ icon, shortcut, className, children, ...rest }: DropdownMenuItemProps) {
  return (
    <Menu.Item className={cn(itemClasses, className)} {...rest}>
      {icon}
      <span className="flex-1">{children}</span>
      {shortcut && <span className="ml-4 text-12 text-text-3">{shortcut}</span>}
    </Menu.Item>
  )
}

/** One choice inside DropdownMenuRadioGroup; the chosen one shows a check. */
export function DropdownMenuRadioItem({ className, children, ...rest }: ComponentPropsWithRef<typeof Menu.RadioItem>) {
  return (
    <Menu.RadioItem className={cn(itemClasses, 'pr-8', className)} {...rest}>
      {children}
      <Menu.ItemIndicator className="absolute right-2 inline-flex">
        <Check />
      </Menu.ItemIndicator>
    </Menu.RadioItem>
  )
}

/** Small heading for a group of items. */
export function DropdownMenuLabel({ className, ...rest }: ComponentPropsWithRef<typeof Menu.Label>) {
  return <Menu.Label className={cn('px-2 pt-1.5 pb-1 text-12 font-medium text-text-3', className)} {...rest} />
}

export function DropdownMenuSeparator({ className, ...rest }: ComponentPropsWithRef<typeof Menu.Separator>) {
  return <Menu.Separator className={cn('-mx-1 my-1 h-px bg-line', className)} {...rest} />
}
