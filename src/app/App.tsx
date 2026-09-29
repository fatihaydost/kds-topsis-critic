import { lazy, Suspense, useLayoutEffect, type ComponentType } from 'react'
import { useTranslation } from 'react-i18next'
import { Route, Router, Switch } from 'wouter'
import { TooltipProvider } from '../ui'
import { NotFound } from './routes/NotFound'
import { Workbench } from './routes/Workbench'
import { TopBar } from './shell/TopBar'

/** Router base without the trailing slash: '' in dev, '/kds-topsis-critic' on GitHub Pages. */
export const ROUTER_BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

// Landing and method pages load on demand; the method pages share one chunk with the content and KaTeX.
type LandingModule = { default: ComponentType }
let landingModule: LandingModule | undefined
/** Loads the landing chunk and keeps it, so a later render can use it without suspending. */
export const loadLanding = (): Promise<LandingModule> => import('./landing/Landing').then((m) => (landingModule = m))
// Once loaded, lazy() gets a thenable that resolves synchronously: React then renders the landing in
// the first commit instead of a fallback. main.tsx relies on it to replace the prerendered HTML of
// the home page (vite.config.ts) without a blank frame; the prerender relies on it to render at all.
const Landing = lazy(() => (landingModule ? ({ then: (resolve: (m: LandingModule) => void) => resolve(landingModule!) } as unknown as Promise<LandingModule>) : loadLanding()))
const MethodsCatalog = lazy(() => import('./methods/Catalog'))
const MethodPage = lazy(() => import('./methods/MethodPage'))

// Dev-only component gallery; the constant condition drops the chunk from production builds.
const DevUi = import.meta.env.DEV ? lazy(() => import('./dev/DevUi')) : null
const DevIllustrations = import.meta.env.DEV ? lazy(() => import('../features/illustrations/Preview')) : null

/**
 * While a page chunk loads: an empty block of full height, so nothing jumps. It is not `#main`:
 * the page renders its own, and tools that wait for `#main` wait for the real content.
 */
function PageFallback() {
  return <div aria-busy="true" className="min-h-[calc(100dvh-48px)]" />
}

/** `ssrPath` only for the build-time prerender of the home page (src/app/prerender.tsx). */
export function App({ ssrPath }: { ssrPath?: string | undefined } = {}) {
  const { t, i18n } = useTranslation()

  // Layout effect: runs before the pages' own (passive) title effects, so a page title wins.
  useLayoutEffect(() => {
    document.title = t('common.documentTitle')
  }, [t, i18n.resolvedLanguage])

  // The live app has replaced the prerendered home page: charts may show (see vite.config.ts).
  useLayoutEffect(() => {
    document.getElementById('root')?.removeAttribute('data-prerender')
  }, [])

  return (
    <TooltipProvider>
      <Router base={ROUTER_BASE} {...(ssrPath !== undefined && { ssrPath })}>
        <div className="flex min-h-dvh flex-col">
          <TopBar />
          <Switch>
            <Route path="/">
              <Suspense fallback={<PageFallback />}>
                <Landing />
              </Suspense>
            </Route>
            <Route path="/app" component={Workbench} />
            <Route path="/methods">
              <Suspense fallback={<PageFallback />}>
                <MethodsCatalog />
              </Suspense>
            </Route>
            <Route path="/methods/:id">
              {(params) => (
                <Suspense fallback={<PageFallback />}>
                  <MethodPage id={params.id} />
                </Suspense>
              )}
            </Route>
            {DevIllustrations && <Route path="/dev/illustrations"><Suspense fallback={null}><DevIllustrations /></Suspense></Route>}
            {DevUi && (
              <Route path="/dev/ui">
                <Suspense fallback={null}>
                  <DevUi />
                </Suspense>
              </Route>
            )}
            <Route component={NotFound} />
          </Switch>
        </div>
      </Router>
    </TooltipProvider>
  )
}
