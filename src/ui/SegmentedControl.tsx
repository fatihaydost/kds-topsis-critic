import * as ToggleGroup from '@radix-ui/react-toggle-group'
import type { ReactNode } from 'react'
import { cn } from './cn'

export type SegmentedOption<T extends string> = {
  value: T
  label: ReactNode
  /** Accessible name when `label` is not plain text. */
  ariaLabel?: string | undefined
  disabled?: boolean | undefined
}

export type SegmentedControlProps<T extends string> = {
  value: T
  onValueChange: (value: T) => void
  options: readonly SegmentedOption<T>[]
  /** Names the group for screen readers ("Language", "Weighting method"). */
  'aria-label': string
  /** sm 28 px (top bar, toolbars), md 32 px. */
  size?: 'sm' | 'md' | undefined
  /** Stretch segments to fill the width (mobile stage switcher). */
  fullWidth?: boolean | undefined
  className?: string | undefined
}

/**
 * One-of-n choice shown as adjacent 2 px segments (Radix toggle group, type single, arrow-key
 * navigation). A click on the active segment keeps it selected; the value is never empty.
 */
export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  size = 'sm',
  fullWidth = false,
  className,
  ...aria
}: SegmentedControlProps<T>) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v) onValueChange(v as T)
      }}
      aria-label={aria['aria-label']}
      className={cn(
        'inline-flex items-stretch gap-px rounded-control border border-line-strong bg-line-strong',
        fullWidth && 'flex w-full',
        className,
      )}
    >
      {options.map((o) => (
        <ToggleGroup.Item
          key={o.value}
          value={o.value}
          disabled={o.disabled}
          aria-label={o.ariaLabel}
          className={cn(
            'inline-flex items-center justify-center whitespace-nowrap bg-surface font-medium text-text-2 transition-colors',
            'first:rounded-l-[1px] last:rounded-r-[1px] hover:text-text disabled:cursor-not-allowed disabled:opacity-50',
            'data-[state=on]:bg-accent-bg data-[state=on]:text-text',
            'focus-visible:relative focus-visible:z-10',
            size === 'sm' ? 'h-[26px] px-2.5 text-13' : 'h-[30px] px-3 text-14',
            fullWidth && 'flex-1',
          )}
        >
          {o.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  )
}
