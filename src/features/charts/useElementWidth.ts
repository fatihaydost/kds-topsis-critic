import { useCallback, useLayoutEffect, useRef, useState } from 'react'

/**
 * Width of an element in CSS px, kept current with ResizeObserver. Returns a callback ref and the
 * width (`fallback` until the element is measured, and where ResizeObserver does not exist).
 */
export function useElementWidth<T extends Element>(fallback = 640): [(el: T | null) => void, number] {
  const [el, setEl] = useState<T | null>(null)
  const [width, setWidth] = useState(fallback)
  const ref = useCallback((node: T | null) => setEl(node), [])

  useLayoutEffect(() => {
    if (!el) return
    const measure = (w: number) => {
      const next = Math.max(0, Math.floor(w))
      if (next > 0) setWidth(next)
    }
    measure(el.getBoundingClientRect().width)
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((entries) => {
      const entry = entries[entries.length - 1]
      if (entry) measure(entry.contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [el])

  return [ref, width]
}

/**
 * True unless this render was caused by a width change. Charts animate value changes (150 ms)
 * but redraw instantly while the container is resized.
 */
export function useAnimateValues(width: number): boolean {
  const prev = useRef(width)
  const animate = prev.current === width
  useLayoutEffect(() => {
    prev.current = width
  })
  return animate
}
