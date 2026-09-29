/** Supported UI languages. */
export type Lang = 'en' | 'tr'

export const LANGS: readonly Lang[] = ['en', 'tr']

/** localStorage key for the chosen language (also read by the inline script in index.html). */
export const LANG_STORAGE_KEY = 'kds.lang'

export const isLang = (v: unknown): v is Lang => v === 'en' || v === 'tr'

/**
 * Initial language: saved choice, then the browser language (any `tr*` means Turkish),
 * then English. Safe to call where storage or navigator are missing.
 */
export function detectLanguage(): Lang {
  try {
    const saved = globalThis.localStorage?.getItem(LANG_STORAGE_KEY)
    if (isLang(saved)) return saved
  } catch {
    // Storage can be blocked (private mode, sandboxed iframe); fall through.
  }
  const nav = globalThis.navigator as Navigator | undefined
  return nav?.language?.toLowerCase().startsWith('tr') ? 'tr' : 'en'
}
