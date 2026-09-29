import { useTranslation } from 'react-i18next'
import { useLang } from '../../i18n'
import { isEmptyProblem, useWorkbench, type Stage } from '../../state/workbench'
import { Button, EmptyState } from '../../ui'
import { WorkbenchLayout } from '../shell/WorkbenchLayout'

const DEFAULT_EXAMPLE = 'krishnan-2021-smartphones'

const previous: Record<Exclude<Stage, 'data'>, Stage> = { weights: 'data', ranking: 'weights', results: 'ranking' }

/** `/app`. Stub: the stage frame with each stage's empty state. */
export function Workbench() {
  const { t } = useTranslation()
  const [lang] = useLang()
  const stage = useWorkbench((s) => s.stage)
  const setStage = useWorkbench((s) => s.setStage)
  const problem = useWorkbench((s) => s.problem)
  const loadExample = useWorkbench((s) => s.loadExample)
  const startBlank = useWorkbench((s) => s.startBlank)

  let content
  if (stage === 'data') {
    content = isEmptyProblem(problem) ? (
      <EmptyState
        title={t('workbench.empty.data.title')}
        description={t('workbench.empty.data.body')}
        action={
          <>
            <Button variant="primary" onClick={() => loadExample(DEFAULT_EXAMPLE, lang)}>
              {t('workbench.empty.data.loadExample')}
            </Button>
            <Button
              onClick={() =>
                startBlank(3, 3, {
                  alternative: (i) => t('workbench.alternativeN', { n: i + 1 }),
                  criterion: (j) => t('workbench.criterionN', { n: j + 1 }),
                })
              }
            >
              {t('workbench.empty.data.startBlank')}
            </Button>
          </>
        }
      />
    ) : (
      <p className="py-10 text-14 text-text-3">
        {problem.alternatives.length} × {problem.criteria.length}. {t('common.stub')}
      </p>
    )
  } else {
    content = (
      <EmptyState
        title={t(`workbench.empty.${stage}.title`)}
        description={t(`workbench.empty.${stage}.body`)}
        action={<Button onClick={() => setStage(previous[stage])}>{t(`workbench.empty.${stage}.action`)}</Button>}
      />
    )
  }

  return (
    <WorkbenchLayout
      stage={stage}
      onStageChange={setStage}
      explanation={<p>{t('workbench.explanation.empty')}</p>}
    >
      {content}
    </WorkbenchLayout>
  )
}
