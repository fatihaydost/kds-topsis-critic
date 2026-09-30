import * as RadixTabs from '@radix-ui/react-tabs'
import { useCallback, useLayoutEffect, useRef, type ComponentPropsWithRef, type RefObject } from 'react'
import { cn } from './cn'

/** Tabs root (Radix). Controlled with `value`/`onValueChange` or uncontrolled with `defaultValue`. */
export const Tabs = RadixTabs.Root

/**
 * Places the one indicator under the active tab: a 1 px wide bar moved and stretched by transform, so it slides when
 * the tab changes (--dur-slow) and lands at once on first placement and on resize. Until this runs (prerendered HTML,
 * no JS yet) the active trigger draws its own underline; `data-indicator` on the list hands it over to the bar.
 */
function useTabIndicator(listRef: RefObject<HTMLDivElement | null>, barRef: RefObject<HTMLSpanElement | null>) {
  useLayoutEffect(() => {
    const list = listRef.current
    const bar = barRef.current
    if (!list || !bar) return
    const place = (animate: boolean) => {
      const tab = list.querySelector<HTMLElement>('[role="tab"][data-state="active"]')
      if (!tab) {
        list.removeAttribute('data-indicator')
        return
      }
      // Hand over before the first measurement forces a style update, so the trigger's own underline does not fade.
      list.setAttribute('data-indicator', '')
      if (!animate) bar.style.transition = 'none'
      const y = tab.offsetTop + tab.offsetHeight - 2
      bar.style.transform = `translate(${tab.offsetLeft}px, ${y}px) scaleX(${tab.offsetWidth})`
      if (!animate) {
        // Commit the new place without a transition, then let later changes transition again.
        void bar.getBoundingClientRect()
        bar.style.transition = ''
      }
    }
    place(false)
    // The active tab changed (Radix sets data-state): slide.
    const mo = new MutationObserver(() => place(true))
    mo.observe(list, { subtree: true, attributes: true, attributeFilter: ['data-state'] })
    // The list or a tab changed size (window resize, web font loaded): jump.
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => place(false))
    if (ro) {
      ro.observe(list)
      list.querySelectorAll('[role="tab"]').forEach((t) => ro.observe(t))
    }
    return () => {
      mo.disconnect()
      ro?.disconnect()
      list.removeAttribute('data-indicator')
    }
  }, [listRef, barRef])
}

/** Row of triggers over a bottom hairline, with one accent indicator that slides to the selected tab. */
export function TabsList({ className, children, ref, ...rest }: ComponentPropsWithRef<typeof RadixTabs.List>) {
  const listRef = useRef<HTMLDivElement | null>(null)
  const barRef = useRef<HTMLSpanElement | null>(null)
  const setList = useCallback(
    (el: HTMLDivElement | null) => {
      listRef.current = el
      if (typeof ref === 'function') ref(el)
      else if (ref) ref.current = el
    },
    [ref],
  )
  useTabIndicator(listRef, barRef)
  return (
    <RadixTabs.List ref={setList} className={cn('group/tabs relative flex gap-4 border-b border-line', className)} {...rest}>
      {children}
      <span
        ref={barRef}
        aria-hidden
        data-tabs-indicator=""
        className={cn(
          'pointer-events-none absolute top-0 left-0 hidden h-0.5 w-px origin-left bg-accent',
          'transition-transform duration-(--dur-slow) group-data-[indicator]/tabs:block',
        )}
      />
    </RadixTabs.List>
  )
}

/** One tab. The selected tab gets text colour and a 2 px accent underline (the list's indicator once it is placed). */
export function TabsTrigger({ className, ...rest }: ComponentPropsWithRef<typeof RadixTabs.Trigger>) {
  return (
    <RadixTabs.Trigger
      className={cn(
        '-mb-px inline-flex h-9 items-center border-b-2 border-transparent text-14 font-medium text-text-2 transition-colors',
        'hover:text-text data-[state=active]:border-accent data-[state=active]:text-text',
        'group-data-[indicator]/tabs:data-[state=active]:border-transparent',
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
