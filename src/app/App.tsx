import { lazy, Suspense, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Route, Router, Switch } from 'wouter'
import { TooltipProvider } from '../ui'
import { NotFound } from './routes/NotFound'
import { Workbench } from './routes/Workbench'
import { TopBar } from './shell/TopBar'

/** Router base without the trailing slash: '' in dev, '/kds-topsis-critic' on GitHub Pages. */
export const ROUTER_BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

// Landing and method pages load on demand; the method pages share one chunk with the content and KaTeX.
const Landing = lazy(() => import('./landing/Landing'))
const MethodsCatalog = lazy(() => import('./methods/Catalog'))
const MethodPage = lazy(() => import('./methods/MethodPage'))

// Dev-only component gallery; the constant condition drops the chunk from production builds.
const DevUi = import.meta.env.DEV ? lazy(() => import('./dev/DevUi')) : null

/**
 * While a page chunk loads: an empty block of full height, so nothing jumps. It is not `#main`:
 * the page renders its own, and tools that wait for `#main` wait for the real content.
 */
function PageFallback() {
  return <div aria-busy="true" className="min-h-[calc(100dvh-48px)]" />
}

export function App() {
  const { t, i18n } = useTranslation()

  // Layout effect: runs before the pages' own (passive) title effects, so a page title wins.
  useLayoutEffect(() => {
    document.title = t('common.documentTitle')
  }, [t, i18n.resolvedLanguage])

  return (
    <TooltipProvider>
      <Router base={ROUTER_BASE}>
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
