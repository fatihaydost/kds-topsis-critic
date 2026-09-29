import * as RadixTabs from '@radix-ui/react-tabs'
import type { ComponentPropsWithRef } from 'react'
import { cn } from './cn'

/** Tabs root (Radix). Controlled with `value`/`onValueChange` or uncontrolled with `defaultValue`. */
export const Tabs = RadixTabs.Root

/** Row of triggers over a bottom hairline. */
export function TabsList({ className, ...rest }: ComponentPropsWithRef<typeof RadixTabs.List>) {
  return <RadixTabs.List className={cn('flex gap-4 border-b border-line', className)} {...rest} />
}

/** One tab. The selected tab gets text colour and a 2 px accent underline. */
export function TabsTrigger({ className, ...rest }: ComponentPropsWithRef<typeof RadixTabs.Trigger>) {
  return (
    <RadixTabs.Trigger
      className={cn(
        '-mb-px inline-flex h-9 items-center border-b-2 border-transparent text-14 font-medium text-text-2 transition-colors',
        'hover:text-text data-[state=active]:border-accent data-[state=active]:text-text',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...rest}
    />
  )
}

/** Panel for one tab. Focusable by default (Radix), so the ring shows when tabbing into it. */
export function TabsContent({ className, ...rest }: ComponentPropsWithRef<typeof RadixTabs.Content>) {
  return <RadixTabs.Content className={cn('pt-4', className)} {...rest} />
}
