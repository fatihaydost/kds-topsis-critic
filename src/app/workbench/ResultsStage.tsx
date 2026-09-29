import { DownloadSimple } from '@phosphor-icons/react'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { doiUrl, getExample, shortCitation } from '../../data/examples'
import { Heatmap } from '../../features/charts'
import { buildWorkbook, exportCsv, writeWorkbook, type WorkbookLabels } from '../../features/io'
import { useNumberFormat } from '../../i18n'
import { useRanking, useWeights, useWorkbench } from '../../state/workbench'
import { Button, EmptyState, Notice } from '../../ui'
import { useWorkbenchNav } from './nav'
import { BlockedByIssues, CalculationToggle, SectionTitle } from './parts'
import { bestIndex, ClosenessChart, RankingTable, TopsisPicture } from './RankingStage'
import { alternativeName, criterionName, DECIMALS, downloadBlob, findStep, stepName, weightMethodLabel } from './shared'
import { WeightsChart } from './WeightsStage'

type Busy = 'xlsx' | null

export function ResultsStage() {
  const { t } = useTranslation()
  const nf = useNumberFormat(DECIMALS.score)
  const format4 = useCallback((v: number) => nf.format(v), [nf])
  const format2 = useCallback((v: number) => nf.format(v, DECIMALS.correlation), [nf])
  const problem = useWorkbench((s) => s.problem)
  const weightMethod = useWorkbench((s) => s.weightMethod)
  const rankingMethod = useWorkbench((s) => s.rankingMethod)
  const exampleId = useWorkbench((s) => s.exampleId)
  const importedFrom = useWorkbench((s) => s.importedFrom ?? null)
  const weights = useWeights()
  const ranking = useRanking()
  const { goTo } = useWorkbenchNav()
  const [busy, setBusy] = useState<Busy>(null)
  const [failed, setFailed] = useState(false)
  const names = useMemo(() => problem.criteria.map((_, j) => criterionName(problem.criteria, j, t)), [problem, t])

  const result = ranking.value
  const w = weights.value
  if (!result || !w) {
    return (
      <div className="flex flex-col gap-4">
        <EmptyState
          title={t('workbench.empty.results.title')}
          description={t('workbench.empty.results.body')}
          action={<Button onClick={() => goTo('ranking')}>{t('workbench.empty.results.action')}</Button>}
          className="pb-2"
        />
        <BlockedByIssues issues={ranking.issues} problem={problem} />
      </div>
    )
  }

  const best = bestIndex(result)
  const example = exampleId ? getExample(exampleId) : undefined
  const weightLabel = weightMethodLabel(weightMethod, t)
  const rankingLabel = t(`workbench.rankingMethod.${rankingMethod}`)
  const correlation = weightMethod === 'critic' ? findStep(w.steps, 'critic.correlation')?.matrix : undefined

  const workbookLabels = (): Partial<WorkbookLabels> => ({
    sheets: {
      data: t('workbench.results.workbook.data'),
      weights: t('workbench.results.workbook.weights'),
      ranking: t('workbench.results.workbook.ranking'),
      calculation: t('workbench.results.workbook.calculation'),
    },
    alternative: t('workbench.alternative'),
    criterion: t('workbench.criterion'),
    type: t('workbench.results.workbook.type'),
    typeWords: { benefit: t('workbench.results.workbook.benefit'), cost: t('workbench.results.workbook.cost') },
    method: t('workbench.results.workbook.method'),
    weight: t('workbench.results.workbook.weight'),
    score: t('workbench.results.workbook.score'),
    rank: t('workbench.results.workbook.rank'),
    step: (key) => stepName(key, t),
  })

  const downloadXlsx = async () => {
    setBusy('xlsx')
    setFailed(false)
    try {
      const X = await import('xlsx')
      const wb = buildWorkbook(X, {
        problem,
        weighting: { method: weightLabel, result: w },
        ranking: { method: rankingLabel, result },
        labels: workbookLabels(),
      })
      const bytes = writeWorkbook(X, wb)
      downloadBlob(
        new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        t('workbench.results.file.xlsx'),
      )
    } catch {
      setFailed(true)
    } finally {
      setBusy(null)
    }
  }

  const downloadCsv = () => {
    const text = exportCsv(problem, {
      decimal: nf.lang === 'tr' ? ',' : '.',
      corner: t('workbench.alternative'),
      typeLabel: t('workbench.results.workbook.type'),
      typeWords: { benefit: t('workbench.results.workbook.benefit'), cost: t('workbench.results.workbook.cost') },
    })
    downloadBlob(new Blob([text], { type: 'text/csv;charset=utf-8' }), t('workbench.results.file.csv'))
  }

  const source = example ? (
    <>
      {shortCitation(example.citation, nf.lang)}.{' '}
      <a href={doiUrl(example.citation.doi)} target="_blank" rel="noreferrer" className="text-accent underline underline-offset-2 hover:no-underline">
        doi:{example.citation.doi}
      </a>
    </>
  ) : importedFrom ? (
    t('workbench.results.sourceFile', { name: importedFrom })
  ) : (
    t('workbench.results.sourceManual')
  )

  return (
    <div className="flex flex-col gap-10 pt-4">
      <section aria-labelledby="wb-results-headline" className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <p id="wb-results-headline" className="text-24 font-semibold text-text">
            {t('workbench.results.headline', { name: alternativeName(problem, best, t) })}
            <span className="num ml-3 text-20 font-normal text-text-2">C = {nf.format(result.scores[best])}</span>
          </p>
          <p className="text-13 text-text-2">
            {t('workbench.results.byline', {
              weights: weightLabel,
              ranking: rankingLabel,
              m: problem.alternatives.length,
              n: problem.criteria.length,
            })}{' '}
            {source}
          </p>
        </div>
        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-2">
          <ClosenessChart problem={problem} result={result} className="min-w-0" />
          <TopsisPicture problem={problem} weights={w.weights} className="min-w-0" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" icon={<DownloadSimple aria-hidden />} onClick={() => void downloadXlsx()} disabled={busy !== null}>
            {busy === 'xlsx' ? t('workbench.results.preparing') : t('workbench.results.downloadXlsx')}
          </Button>
          <Button icon={<DownloadSimple aria-hidden />} onClick={downloadCsv}>
            {t('workbench.results.downloadCsv')}
          </Button>
          <span aria-live="polite" className="sr-only">
            {busy ? t('workbench.results.preparing') : ''}
          </span>
        </div>
        {failed && (
          <Notice tone="danger" role="alert">
            {t('workbench.results.downloadFailed')}
          </Notice>
        )}
      </section>

      <section aria-labelledby="wb-results-ranking" className="flex flex-col gap-3">
        <SectionTitle>
          <span id="wb-results-ranking">{t('workbench.results.rankingTitle')}</span>
        </SectionTitle>
        <RankingTable problem={problem} result={result} id="wb-results-ranking" />
      </section>

      <section className="grid grid-cols-1 items-start gap-8 xl:grid-cols-2">
        <WeightsChart names={names} weights={w.weights} format={format4} className="min-w-0" />
        {correlation && (
          <Heatmap
            title={t('workbench.results.correlationTitle')}
            description={t('workbench.results.correlationHint')}
            scale="diverging"
            rowLabels={names}
            colLabels={names}
            values={correlation}
            format={format2}
            tableLabels={{ show: t('workbench.chart.showTable'), corner: t('workbench.criterion') }}
            className="min-w-0"
          />
        )}
      </section>

      <section aria-labelledby="wb-calculation" className="flex flex-col gap-3">
        <SectionTitle>
          <span id="wb-calculation">{t('workbench.results.calculationTitle')}</span>
        </SectionTitle>
        <CalculationToggle
          problem={problem}
          headingLevel="h4"
          groups={[
            { title: t('workbench.results.weightingPart', { method: weightLabel }), steps: w.steps },
            { title: t('workbench.results.rankingPart', { method: rankingLabel }), steps: result.steps },
          ]}
        />
      </section>
    </div>
  )
}
