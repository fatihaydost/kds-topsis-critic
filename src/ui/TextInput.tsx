import type { ComponentPropsWithRef } from 'react'
import { cn } from './cn'
import { useFieldProps } from './Field'

export type ControlSize = 'sm' | 'md'

/** Shared look of text-like controls (TextInput, NumberInput, Select). */
export function controlClasses({
  size = 'md',
  invalid = false,
  className,
}: { size?: ControlSize | undefined; invalid?: boolean | undefined; className?: string | undefined } = {}): string {
  return cn(
    'w-full min-w-0 rounded-control border bg-surface text-text placeholder:text-text-3 transition-colors',
    'hover:border-text-3 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-text-3 disabled:hover:border-line-strong',
    size === 'sm' ? 'h-7 px-2 text-13' : 'h-8 px-2.5 text-14',
    invalid ? 'border-danger hover:border-danger' : 'border-line-strong',
    className,
  )
}

export type TextInputProps = Omit<ComponentPropsWithRef<'input'>, 'size'> & {
  /** sm 28 px, md 32 px high. */
  controlSize?: ControlSize | undefined
  /** Danger border and aria-invalid. Inside a Field with an error this is set for you. */
  invalid?: boolean | undefined
}

/** Single-line text input. Inside a Field it picks up id, aria-describedby and aria-invalid. */
export function TextInput({ controlSize, invalid, className, id, required, ...rest }: TextInputProps) {
  const f = useFieldProps({
    id,
    required,
    invalid,
    'aria-describedby': rest['aria-describedby'],
    'aria-invalid': rest['aria-invalid'],
  })
  return (
    <input
      type="text"
      {...rest}
      id={f.id}
      required={f.required}
      aria-describedby={f['aria-describedby']}
      aria-invalid={f['aria-invalid']}
      className={controlClasses({ size: controlSize, invalid: f.invalid, className: cn('read-only:bg-surface-2', className) })}
    />
  )
}
