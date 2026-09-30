import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { critic } from '../../core'
import { getExample } from '../../data/examples'
// Direct import, so the landing chunk does not pull in the other illustrations.
import { PipelineDiagram } from '../../features/illustrations/PipelineDiagram'

/** "How it works": the real pipeline, with the CRITIC weights of the hero's example in the weight box. */
export function Pipeline() {
  const { t } = useTranslation()
  const weights = useMemo(() => {
    const ex = getExample('krishnan-2021-smartphones')!
    const problem = { alternatives: ex.alternatives, criteria: ex.criteria.map((c) => ({ name: c.name.en, type: c.type })), matrix: ex.matrix }
    return critic.compute(problem, {}).weights
  }, [])

  return (
    <section aria-labelledby="how-title" className="flex flex-col gap-6">
      <h2 id="how-title" className="text-24 font-semibold text-text">
        {t('landing.how.title')}
      </h2>
      <PipelineDiagram
        methods={{ weights: 'CRITIC', ranking: 'TOPSIS' }}
        weights={weights}
        labels={{
          data: t('landing.how.labels.data'),
          weights: t('landing.how.labels.weights'),
          ranking: t('landing.how.labels.ranking'),
          results: t('landing.how.labels.results'),
          robustness: t('landing.how.labels.robustness'),
        }}
      />
    </section>
  )
}
