import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cn } from './cn'

export type IconButtonSize = 'sm' | 'md'

const base =
  'inline-flex shrink-0 items-center justify-center rounded-control text-text-2 transition-colors select-none ' +
  'hover:bg-surface-2 hover:text-text active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ' +
  'disabled:hover:bg-transparent disabled:active:translate-y-0 data-[state=open]:bg-surface-2 data-[state=open]:text-text'

const sizes: Record<IconButtonSize, string> = {
  sm: 'size-7 [&_svg]:size-4',
  md: 'size-8 [&_svg]:size-[18px]',
}

/** Class string of an icon button, for icon links (`<a className={iconButtonClasses()} aria-label=...>`). */
export function iconButtonClasses({
  size = 'md',
  bordered = false,
  className,
}: { size?: IconButtonSize | undefined; bordered?: boolean | undefined; className?: string | undefined } = {}): string {
  return cn(base, sizes[size], bordered && 'border border-line-strong bg-surface', className)
}

export type IconButtonProps = Omit<ComponentPropsWithRef<'button'>, 'aria-label' | 'children'> & {
  /** Required: the accessible name, since there is no visible text. */
  'aria-label': string
  /** A Phosphor icon, regular weight. */
  icon: ReactNode
  /** sm 28 px, md 32 px square. */
  size?: IconButtonSize | undefined
  /** Hairline border and surface fill (for use next to inputs). */
  bordered?: boolean | undefined
}

/** Square button with only an icon. Pair with Tooltip when the icon is not self-explanatory. */
export function IconButton({ icon, size, bordered, className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button type={type} className={iconButtonClasses({ size, bordered, className })} {...rest}>
      {icon}
    </button>
  )
}
