import { useSyncExternalStore } from 'react'

/** 'system' follows prefers-color-scheme; light and dark set `<html data-theme>`. */
export type ThemeMode = 'system' | 'light' | 'dark'

/** localStorage key (also read by the inline script in index.html to avoid a flash). */
export const THEME_STORAGE_KEY = 'kds.theme'

const isMode = (v: unknown): v is ThemeMode => v === 'system' || v === 'light' || v === 'dark'

function readMode(): ThemeMode {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY)
    return isMode(v) ? v : 'system'
  } catch {
    return 'system'
  }
}

let mode: ThemeMode = typeof window === 'undefined' ? 'system' : readMode()
const listeners = new Set<() => void>()

function apply(m: ThemeMode): void {
  const root = document.documentElement
  if (m === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', m)
}

export function setThemeMode(next: ThemeMode): void {
  mode = next
  try {
    if (next === 'system') localStorage.removeItem(THEME_STORAGE_KEY)
    else localStorage.setItem(THEME_STORAGE_KEY, next)
  } catch {
    // Storage blocked: the choice lasts for this page view only.
  }
  apply(next)
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

/** Current theme mode and a setter. */
export function useThemeMode(): [ThemeMode, (m: ThemeMode) => void] {
  const m = useSyncExternalStore(subscribe, () => mode, () => 'system' as ThemeMode)
  return [m, setThemeMode]
}
