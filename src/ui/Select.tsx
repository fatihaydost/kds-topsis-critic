import { CaretDown } from '@phosphor-icons/react'
import type { ComponentPropsWithRef } from 'react'
import { cn } from './cn'
import { useFieldProps } from './Field'
import { controlClasses, type ControlSize } from './TextInput'

export type SelectOption = { value: string; label: string; disabled?: boolean }

export type SelectProps = Omit<ComponentPropsWithRef<'select'>, 'size'> & {
  /** Rendered as <option>s; or pass <option> children yourself. */
  options?: readonly SelectOption[] | undefined
  controlSize?: ControlSize | undefined
  invalid?: boolean | undefined
}

/** Native <select> with the control look and a caret. Keyboard and mobile pickers come for free. */
export function Select({ options, controlSize, invalid, className, id, required, children, ...rest }: SelectProps) {
  const f = useFieldProps({
    id,
    required,
    invalid,
    'aria-describedby': rest['aria-describedby'],
    'aria-invalid': rest['aria-invalid'],
  })
  return (
    <div className={cn('relative w-full min-w-0', className)}>
      <select
        {...rest}
        id={f.id}
        required={f.required}
        aria-describedby={f['aria-describedby']}
        aria-invalid={f['aria-invalid']}
        className={controlClasses({ size: controlSize, invalid: f.invalid, className: 'appearance-none pr-8' })}
      >
        {options?.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
        {children}
      </select>
      <CaretDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-text-3"
      />
    </div>
  )
}
