import { CheckCircle, WarningCircle } from '@phosphor-icons/react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { getExample } from '../../data/examples'
import { useLang } from '../../i18n'
import { isEmptyProblem, STAGES, useRanking, useValidation, useWeights, useWorkbench, type Stage } from '../../state/workbench'
import { usePageMeta } from '../landing/usePageMeta'
import { WorkbenchLayout } from '../shell/WorkbenchLayout'
import { DataStage } from './DataStage'
import { ExplanationPanel } from './ExplanationPanel'
import { WorkbenchNavContext, type ImportReport, type WorkbenchNav } from './nav'
import { bestIndex, RankingStage } from './RankingStage'
import { ResultsStage } from './ResultsStage'
import { alternativeName, weightMethodLabel } from './shared'
import { WeightsStage } from './WeightsStage'

const isStage = (v: string | null): v is Stage => v !== null && (STAGES as readonly string[]).includes(v)

/**
 * `?example=<id>&stage=<stage>` loads a published example and opens a stage (links from method
 * pages, screenshots). The query is removed afterwards so a reload keeps the user's edits.
 */
function useQueryBootstrap() {
  const [lang] = useLang()
  const loadExample = useWorkbench((s) => s.loadExample)
  const setStage = useWorkbench((s) => s.setStage)
  const done = useRef(false)
  useLayoutEffect(() => {
    if (done.current) return
    done.current = true
    const params = new URLSearchParams(window.location.search)
    const example = params.get('example')
    const stage = params.get('stage')
    if (!example && !stage) return
    if (example && getExample(example)) loadExample(example, lang)
    if (isStage(stage)) setStage(stage)
    params.delete('example')
    params.delete('stage')
    const rest = params.toString()
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${rest ? `?${rest}` : ''}${window.location.hash}`)
  }, [lang, loadExample, setStage])
}

type StageState = 'done' | 'attention' | 'pending'

/** Rail status under a stage name: an icon and a word for done / needs attention, plain otherwise. */
function StageStatus({ state, children }: { state: StageState; children: ReactNode }) {
  const { t } = useTranslation()
  return (
    <span className="inline-flex items-center gap-1">
      {state === 'done' && <CheckCircle aria-hidden className="size-3.5 shrink-0 text-ok" />}
      {state === 'attention' && <WarningCircle aria-hidden className="size-3.5 shrink-0 text-warning" />}
      <span className={state === 'attention' ? 'text-warning' : undefined}>{children}</span>
      {state !== 'pending' && (
        <span className="sr-only">, {state === 'done' ? t('workbench.rail.done') : t('workbench.rail.attention')}</span>
      )}
    </span>
  )
}

const NO_ATTEMPTS: Record<Stage, boolean> = { data: false, weights: false, ranking: false, results: false }

export default function WorkbenchPage() {
  const { t } = useTranslation()
  usePageMeta(t('workbench.meta.title'), t('workbench.meta.description'))
  useQueryBootstrap()
  const stage = useWorkbench((s) => s.stage)
  const setStage = useWorkbench((s) => s.setStage)
  const problem = useWorkbench((s) => s.problem)
  const weightMethod = useWorkbench((s) => s.weightMethod)
  const rankingMethod = useWorkbench((s) => s.rankingMethod)
  const ranking = useRanking()
  const weights = useWeights()
  const validation = useValidation()

  const [attempted, setAttemptedState] = useState<Record<Stage, boolean>>(NO_ATTEMPTS)
  const [importReport, setImportReport] = useState<ImportReport | null>(null)
  const focusRequest = useRef<{ id: string | null } | null>(null)
  const [focusTick, setFocusTick] = useState(0)

  const goTo = useCallback(
    (next: Stage, targetId?: string) => {
      focusRequest.current = { id: targetId ?? null }
      setStage(next)
      setFocusTick((k) => k + 1)
    },
    [setStage],
  )

  // After a stage change the user asked for: focus the target control, or the stage itself,
  // so keyboard and screen reader users start at the top of the new stage.
  useEffect(() => {
    const req = focusRequest.current
    if (!req) return
    focusRequest.current = null
    const raf = requestAnimationFrame(() => {
      const el = req.id ? document.getElementById(req.id) : null
      if (el) {
        el.scrollIntoView({ block: 'center' })
        el.focus({ preventScroll: true })
        return
      }
      window.scrollTo({ top: 0 })
      document.getElementById('main')?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(raf)
  }, [focusTick])

  // Warm the calculation chunk (KaTeX) once the page is idle, so "Show the calculation" opens at once.
  useEffect(() => {
    const load = () => void import('./WorkedCalculation')
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(load, { timeout: 2000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(load, 500)
    return () => clearTimeout(id)
  }, [])

  const nav = useMemo<WorkbenchNav>(
    () => ({
      goTo,
      attempted,
      setAttempted: (s, value) => setAttemptedState((a) => (a[s] === value ? a : { ...a, [s]: value })),
      importReport,
      setImportReport,
    }),
    [goTo, attempted, importReport],
  )

  const stageMeta: Partial<Record<Stage, ReactNode>> = {}
  if (!isEmptyProblem(problem)) {
    const dataErrors = validation.filter((x) => x.severity === 'error').length
    stageMeta.data =
      dataErrors > 0 ? (
        <StageStatus state="attention">{t('workbench.rail.toFix', { count: dataErrors })}</StageStatus>
      ) : (
        <StageStatus state="done">{`${problem.alternatives.length} × ${problem.criteria.length}`}</StageStatus>
      )
    const weightsBroken = weights.value === null && weights.issues.some((x) => x.code.includes('weight'))
    stageMeta.weights = weights.value ? (
      <StageStatus state="done">{weightMethodLabel(weightMethod, t)}</StageStatus>
    ) : weightsBroken ? (
      <StageStatus state="attention">{t('workbench.rail.checkWeights')}</StageStatus>
    ) : (
      <StageStatus state="pending">{weightMethodLabel(weightMethod, t)}</StageStatus>
    )
    const rankingLabel = t(`workbench.rankingMethod.${rankingMethod}`)
    stageMeta.ranking = <StageStatus state={ranking.value ? 'done' : 'pending'}>{rankingLabel}</StageStatus>
    if (ranking.value) {
      stageMeta.results = <StageStatus state="done">{alternativeName(problem, bestIndex(ranking.value), t)}</StageStatus>
    }
  }

  let content: ReactNode
  if (stage === 'data') content = <DataStage />
  else if (stage === 'weights') content = <WeightsStage />
  else if (stage === 'ranking') content = <RankingStage />
  else content = <ResultsStage />

  return (
    <WorkbenchNavContext.Provider value={nav}>
      <WorkbenchLayout stage={stage} onStageChange={(s) => goTo(s)} stageMeta={stageMeta} explanation={<ExplanationPanel stage={stage} />}>
        {content}
      </WorkbenchLayout>
    </WorkbenchNavContext.Provider>
  )
}
