import { useCallback, useLayoutEffect, useState } from 'react'

export type ScrollRegionLabel = {
  /** Accessible name of the scroll area. */
  label?: string | undefined
  /** id of the element that names it (a caption or a section title). */
  labelledBy?: string | undefined
}

export type ScrollRegionProps = {
  tabIndex?: number
  role?: 'region'
  'aria-label'?: string
  'aria-labelledby'?: string
}

/**
 * A container that scrolls (sideways at 390 px, or down under a max height) must be reachable by
 * keyboard, or the hidden columns are lost to keyboard users (WCAG 2.1.1, axe
 * scrollable-region-focusable). While its content overflows, the container becomes a named,
 * focusable region (it then gets the global focus ring and arrow keys scroll it); otherwise it
 * stays out of the tab order.
 *
 * Returns a callback ref for the container and the props to spread on it. `deps` re-measures
 * when the content changes without any box resizing.
 */
export function useScrollRegion<T extends HTMLElement>(
  { label, labelledBy }: ScrollRegionLabel,
  deps: readonly unknown[] = [],
): [(el: T | null) => void, ScrollRegionProps] {
  const [el, setEl] = useState<T | null>(null)
  const ref = useCallback((node: T | null) => setEl(node), [])
  const [overflowing, setOverflowing] = useState(false)

  useLayoutEffect(() => {
    if (!el) return
    const check = () => setOverflowing(el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)
    check()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(check)
    ro.observe(el)
    for (const child of Array.from(el.children)) ro.observe(child)
    return () => ro.disconnect()
    // The caller's deps are part of the list on purpose.
  }, [el, ...deps])

  if (!overflowing) return [ref, {}]
  const named = labelledBy ? { 'aria-labelledby': labelledBy } : label ? { 'aria-label': label } : {}
  return [ref, { tabIndex: 0, ...(labelledBy || label ? { role: 'region' as const } : {}), ...named }]
}
