import { useEffect, useState } from 'react'
import { parseOklch } from './color'
import type { HeatTokens } from './layout'

/** Reads the heatmap's colour tokens as the active theme resolves them. Null if one is unreadable. */
function readTokens(): HeatTokens | null {
  if (typeof document === 'undefined') return null
  const css = getComputedStyle(document.documentElement)
  const get = (name: string) => parseOklch(css.getPropertyValue(name))
  const heat0 = get('--data-heat-0')
  const heat1 = get('--data-heat-1')
  const negative = get('--data-negative')
  const text = get('--text')
  const bg = get('--bg')
  return heat0 && heat1 && negative && text && bg ? { heat0, heat1, negative, text, bg } : null
}

/**
 * The resolved token colours, kept current when the theme changes (the `data-theme` attribute
 * on <html>, or the system scheme when the theme follows it).
 */
export function useHeatTokens(): HeatTokens | null {
  const [tokens, setTokens] = useState<HeatTokens | null>(readTokens)
  useEffect(() => {
    const update = () => setTokens(readTokens())
    const mo = new MutationObserver(update)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] })
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', update)
    return () => {
      mo.disconnect()
      mq.removeEventListener('change', update)
    }
  }, [])
  return tokens
}
