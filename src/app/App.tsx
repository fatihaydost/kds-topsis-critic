import { lazy, Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Route, Router, Switch } from 'wouter'
import { TooltipProvider } from '../ui'
import { Landing } from './routes/Landing'
import { MethodPage, MethodsCatalog } from './routes/Methods'
import { NotFound } from './routes/NotFound'
import { Workbench } from './routes/Workbench'
import { TopBar } from './shell/TopBar'

/** Router base without the trailing slash: '' in dev, '/kds-topsis-critic' on GitHub Pages. */
export const ROUTER_BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

// Dev-only component gallery; the constant condition drops the chunk from production builds.
const DevUi = import.meta.env.DEV ? lazy(() => import('./dev/DevUi')) : null

export function App() {
  const { t, i18n } = useTranslation()

  useEffect(() => {
    document.title = t('common.documentTitle')
  }, [t, i18n.resolvedLanguage])

  return (
    <TooltipProvider>
      <Router base={ROUTER_BASE}>
        <div className="flex min-h-dvh flex-col">
          <TopBar />
          <Switch>
            <Route path="/" component={Landing} />
            <Route path="/app" component={Workbench} />
            <Route path="/methods" component={MethodsCatalog} />
            <Route path="/methods/:id">{(params) => <MethodPage id={params.id} />}</Route>
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
