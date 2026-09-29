/**
 * Build-time prerender of the home page (vite.config.ts `spaFallback`): the landing HTML in
 * both languages, so the first paint shows the hero before any script has run (LCP is its h1).
 * Runs in Node from an SSR build; the browser build never imports this file.
 */
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { initI18n, type Lang } from '../i18n'
import i18n from '../i18n'
import { App, loadLanding, ROUTER_BASE } from './App'

export async function render(lang: Lang): Promise<string> {
  initI18n(lang)
  await i18n.changeLanguage(lang)
  await loadLanding()
  return renderToString(
    <StrictMode>
      <App ssrPath={`${ROUTER_BASE}/`} />
    </StrictMode>,
  )
}
