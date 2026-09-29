import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { critic, topsis, type Problem } from '../../core'
import { doiUrl, getExample, shortCitation } from '../../data/examples'
import { BarChart } from '../../features/charts'
import { formatNumber, useLang } from '../../i18n'
import { Table, TBody, Td, Th, THead, Tr } from '../../ui'
import { textLink } from './usePageMeta'

const EXAMPLE_ID = 'krishnan-2021-smartphones'

/**
 * The hero's right side: the published Krishnan et al. (2021) smartphone data, weighted with
 * CRITIC and ranked with TOPSIS by the same core the workbench uses. Nothing here is a mock:
 * the numbers are computed on every render from src/data/examples.ts.
 */
export function HeroResult() {
  const { t } = useTranslation()
  const [lang] = useLang()
  const example = getExample(EXAMPLE_ID)!

  const result = useMemo(() => {
    const problem: Problem = {
      alternatives: example.alternatives,
      criteria: example.criteria.map((c) => ({ name: c.name[lang], type: c.type })),
      matrix: example.matrix,
    }
    const weights = critic.compute(problem, {})
    const ranking = topsis.compute(problem, weights.weights, {})
    const order = ranking.ranking.map((r, i) => ({ i, r })).sort((a, b) => a.r - b.r || a.i - b.i)
    return { problem, weights: weights.weights, ranking, order }
  }, [example, lang])

  const fmt4 = useCallback((v: number) => formatNumber(v, lang, 4), [lang])
  const bestWeight = result.weights.indexOf(Math.max(...result.weights))
  const criterionNames = useMemo(() => result.problem.criteria.map((c) => c.name), [result])

  return (
    <section
      aria-labelledby="hero-result-title"
      className="flex min-w-0 flex-col gap-5 rounded-control border border-line bg-surface p-4 md:p-6"
    >
      <header className="flex flex-col gap-0.5">
        <h2 id="hero-result-title" className="text-16 font-semibold text-text">
          {t('landing.result.title')}
        </h2>
        <p className="text-13 text-text-2">{t('landing.result.subtitle')}</p>
      </header>

      <Table density="compact" stickyHeader={false}>
        <THead>
          <Tr>
            <Th numeric className="w-16">
              {t('landing.result.rank')}
            </Th>
            <Th>{t('landing.result.alternative')}</Th>
            <Th numeric>{t('landing.result.closeness')}</Th>
          </Tr>
        </THead>
        <TBody>
          {result.order.map(({ i, r }) => (
            <Tr key={i} selected={r === 1}>
              <Td numeric>{r}</Td>
              <Th scope="row">{result.problem.alternatives[i]}</Th>
              <Td numeric>{fmt4(result.ranking.scores[i]!)}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>

      <BarChart
        title={t('landing.result.weightsTitle')}
        labels={criterionNames}
        values={result.weights}
        highlight={bestWeight}
        format={fmt4}
        tableLabels={{ show: t('landing.result.showTable'), label: t('landing.result.criterion'), value: t('landing.result.weight') }}
      />

      <footer className="flex flex-col gap-1 border-t border-line pt-3 text-12 text-text-2">
        <p>
          {t('landing.result.data', { citation: shortCitation(example.citation, lang) })}{' '}
          <a href={doiUrl(example.citation.doi)} className={textLink} target="_blank" rel="noreferrer">
            doi:{example.citation.doi}
          </a>
        </p>
        <p>{t('landing.result.check')}</p>
      </footer>
    </section>
  )
}
