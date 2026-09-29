import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cn } from './cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md'

const base =
  'inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-control font-medium select-none ' +
  'transition-colors active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0 ' +
  '[&_svg]:shrink-0'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-fg hover:bg-accent-hover disabled:hover:bg-accent',
  secondary: 'border border-line-strong bg-surface text-text hover:bg-surface-2 disabled:hover:bg-surface',
  ghost: 'bg-transparent text-text-2 hover:bg-surface-2 hover:text-text disabled:hover:bg-transparent',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-13 [&_svg]:size-3.5',
  md: 'h-8 px-3 text-14 [&_svg]:size-4',
}

/**
 * Class string of a button, for links that look like buttons:
 * `<Link href="/app" className={buttonClasses({ variant: 'primary' })}>`.
 */
export function buttonClasses({
  variant = 'secondary',
  size = 'md',
  className,
}: { variant?: ButtonVariant | undefined; size?: ButtonSize | undefined; className?: string | undefined } = {}): string {
  return cn(base, variants[variant], sizes[size], className)
}

export type ButtonProps = ComponentPropsWithRef<'button'> & {
  /** primary: the one main action of a view. secondary: default. ghost: toolbar and inline actions. */
  variant?: ButtonVariant | undefined
  /** sm 28 px, md 32 px high. */
  size?: ButtonSize | undefined
  /** Icon before the label (Phosphor, sized by the button). */
  icon?: ReactNode
  /** Icon after the label. */
  iconEnd?: ReactNode
}

/** Text button, verb plus object ("Calculate ranking"). Defaults to type="button". */
export function Button({ variant, size, icon, iconEnd, className, children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={buttonClasses({ variant, size, className })} {...rest}>
      {icon}
      {children}
      {iconEnd}
    </button>
  )
}
