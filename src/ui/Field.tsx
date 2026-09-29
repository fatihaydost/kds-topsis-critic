import { createContext, useContext, useId, type ReactNode } from 'react'
import { cn } from './cn'

export type FieldContextValue = {
  /** id for the control; the label points at it. */
  id: string
  /** Space-separated ids of hint and error, for aria-describedby. Undefined when there are none. */
  describedBy: string | undefined
  invalid: boolean
  required: boolean
}

const FieldContext = createContext<FieldContextValue | null>(null)

/** Inside a Field, the ids and state its control should use. TextInput, NumberInput and Select read it. */
export const useField = (): FieldContextValue | null => useContext(FieldContext)

export type FieldProps = {
  label: ReactNode
  /** Short help under the label. */
  hint?: ReactNode
  /** Specific, fixable message ("Weights sum to 0.950, they must sum to 1."). Marks the control invalid. */
  error?: ReactNode
  /** Shows "(optional)" after the label; fields are required by default in copy, not in markup. */
  optionalLabel?: string | undefined
  required?: boolean | undefined
  /** Fixed id for the control (the ErrorSummary links to it). Generated when omitted. */
  id?: string | undefined
  className?: string | undefined
  /** One control: TextInput, NumberInput, Select, or any element using useField(). */
  children: ReactNode
}

/**
 * Label above, then hint, the control, and the error below (GOV.UK order without the side stripe).
 * Wires `id`, `aria-describedby` and `aria-invalid` into the control through context.
 */
export function Field({ label, hint, error, optionalLabel, required = false, id, className, children }: FieldProps) {
  const auto = useId()
  const controlId = id ?? `f${auto}`
  const hintId = hint ? `${controlId}-hint` : undefined
  const errorId = error ? `${controlId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  const invalid = Boolean(error)

  return (
    <FieldContext.Provider value={{ id: controlId, describedBy, invalid, required }}>
      <div className={cn('flex flex-col gap-1', className)}>
        <label htmlFor={controlId} className="text-13 font-medium text-text">
          {label}
          {optionalLabel && <span className="font-normal text-text-3"> ({optionalLabel})</span>}
        </label>
        {hint && (
          <p id={hintId} className="text-12 text-text-3">
            {hint}
          </p>
        )}
        {children}
        {error && (
          <p id={errorId} className="text-13 text-danger">
            {error}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  )
}

/** Merges Field context into a control's own props; explicit props win. */
export function useFieldProps(props: {
  id?: string | undefined
  'aria-describedby'?: string | undefined
  'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling' | undefined
  required?: boolean | undefined
  invalid?: boolean | undefined
}) {
  const field = useField()
  const invalid = props.invalid ?? field?.invalid ?? false
  return {
    id: props.id ?? field?.id,
    'aria-describedby': props['aria-describedby'] ?? field?.describedBy,
    'aria-invalid': props['aria-invalid'] ?? (invalid || undefined),
    required: props.required ?? (field?.required || undefined),
    invalid,
  }
}
