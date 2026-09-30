import { ArrowCounterClockwise } from '@phosphor-icons/react'
import { useCallback, useId, useMemo, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { reweight, sweepWeight } from '../../../core/robustness'
import type { Problem, RankingMethod } from '../../../core/types'
import { estimateTextWidth } from '../../../features/charts/layout'
import { SweepChart } from '../../../features/charts/SweepChart'
import { useElementWidth } from '../../../features/charts/useElementWidth'
import { useNumberFormat } from '../../../i18n'
import { Button, SegmentedControl, Select } from '../../../ui'
import { useTranslation } from 'react-i18next'
import { DECIMALS } from '../shared'
import { largestWeight, rankOrder, snapWeight, stepWeight, switchMarks } from './helpers'
import { LiveRanking } from './LiveRanking'
import s from './robustness.module.css'
import { SectionHead, SourcesDisclosure } from './SectionParts'
import { useRobustnessText } from './text'

type Props = {
  problem: Problem
  weights: readonly number[]
  method: RankingMethod
  names: string[]
  criteria: string[]
}

/** Width a segmented control of these labels needs (13 px text, 10 px padding a side, 1 px gaps). */
const segmentedWidth = (labels: readonly string[]) => labels.reduce((w, l) => w + estimateTextWidth(l, 13) + 22, 0)

/** Thumb of the range input (robustness.module.css --thumb): its centre runs from thumb/2 to width - thumb/2. */
const THUMB = 16

/**
 * A: one weight at a time. Pick a criterion, drag its weight (the others keep their proportions); the chart shows
 * every alternative's closeness over the whole range with a cursor at the weight, and the table next to it is the
 * ranking at that weight, its rows sliding to their new places as the order changes.
 */
export function SweepSection({ problem, weights, method, names, criteria }: Props) {
  const { t } = useRobustnessText()
  const { t: tw } = useTranslation()
  const nf = useNumberFormat(DECIMALS.weight)
  const uid = useId()
  const [k, setK] = useState(() => largestWeight(weights))
  const base = weights[k] ?? 0
  const [wk, setWk] = useState(base)
  const [boxRef, boxWidth] = useElementWidth<HTMLDivElement>()

  const choose = (j: number) => {
    setK(j)
    setWk(weights[j] ?? 0)
  }

  const sweep = useMemo(() => sweepWeight(problem, weights, method, k), [problem, weights, method, k])
  const xs = useMemo(() => sweep.points.map((p) => p.wk), [sweep])
  const series = useMemo(() => names.map((_, i) => sweep.points.map((p) => p.scores[i]!)), [sweep, names])
  const scoresAt = useCallback((w: number) => method.compute(problem, reweight(weights, k, w), {}).scores, [method, problem, weights, k])
  const switches = useMemo(() => switchMarks(sweep.rankingIntervals, scoresAt), [sweep, scoresAt])
  // The ranking at the slider's weight: computed exactly there, never read off the grid.
  const at = useMemo(() => method.compute(problem, reweight(weights, k, wk), {}), [method, problem, weights, k, wk])
  const order = rankOrder(at.ranking)
  const leaders = order.filter((i) => at.ranking[i] === 1)
  const baseTop = sweep.baseTopInterval
  const topNames = baseTop.top.map((i) => names[i]).join(', ')
  const criterion = criteria[k] ?? ''

  const format4 = useCallback((v: number) => nf.format(v), [nf])
  const formatTick = useCallback((v: number, d: number) => nf.format(v, d), [nf])
  const formatWeight = useCallback((v: number) => nf.format(v, 2), [nf])

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const steps: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 }
    if (e.key in steps) {
      e.preventDefault()
      setWk((v) => stepWeight(v, steps[e.key]!))
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      setWk(e.key === 'Home' ? 0 : 1)
    }
  }

  const holds =
    baseTop.from <= 1e-9 && baseTop.to >= 1 - 1e-9
      ? t('sweep.holdsAll', { name: topNames, criterion })
      : t('sweep.holds', { name: topNames, criterion, from: nf.format(baseTop.from), to: nf.format(baseTop.to), base: nf.format(base) })

  const useSegments = criteria.length <= 5 && segmentedWidth(criteria) <= boxWidth
  const sliderId = `${uid}-slider`
  const tableTitleId = `${uid}-table`

  return (
    <section aria-labelledby={`${uid}-title`} className="flex flex-col gap-4" ref={boxRef}>
      <SectionHead id={`${uid}-title`} title={t('sweep.title')} lead={t('sweep.lead')} />

      <div className="flex flex-col gap-1.5">
        <span id={`${uid}-crit`} className="text-13 font-medium text-text-2">
          {t('sweep.criterion')}
        </span>
        {useSegments ? (
          <SegmentedControl<string>
            aria-label={t('sweep.criterion')}
            value={String(k)}
            onValueChange={(v) => choose(Number(v))}
            options={criteria.map((c, j) => ({ value: String(j), label: c }))}
            size="md"
            className="self-start"
          />
        ) : (
          <Select
            aria-labelledby={`${uid}-crit`}
            value={String(k)}
            onChange={(e) => choose(Number(e.target.value))}
            options={criteria.map((c, j) => ({ value: String(j), label: c }))}
            className="max-w-[320px]"
          />
        )}
      </div>

      <p className="max-w-[72ch] text-16 font-medium text-text" data-testid="holds-sentence">
        {holds}
      </p>

      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex min-w-0 flex-col gap-3">
          <SweepChart
            title={t('sweep.chartTitle', { criterion })}
            labels={names}
            xs={xs}
            series={series}
            cursor={wk}
            cursorValues={at.scores}
            base={base}
            switches={switches}
            topBand={[baseTop.from, baseTop.to]}
            rankingBand={[sweep.baseRankingInterval.from, sweep.baseRankingInterval.to]}
            highlight={leaders}
            format={format4}
            formatTick={formatTick}
            formatWeight={formatWeight}
            onPick={(v) => setWk(snapWeight(v))}
            text={{ yours: t('sweep.yours'), showTable: tw('workbench.chart.showTable'), alternative: tw('workbench.alternative') }}
            below={({ left, right }) => (
              <div className={s.slider} style={{ marginLeft: left - THUMB / 2, width: right - left + THUMB } as CSSProperties}>
                  <input
                    id={sliderId}
                    type="range"
                    className={s.range}
                    min={0}
                    max={1}
                    step={0.01}
                    value={wk}
                    aria-label={t('sweep.slider', { criterion })}
                    aria-valuetext={nf.format(wk)}
                    onChange={(e) => setWk(snapWeight(Number(e.target.value)))}
                    onKeyDown={onKey}
                  />
                  <span aria-hidden className={s.baseTick} style={{ left: `calc(${THUMB / 2}px + ${base} * (100% - ${THUMB}px))` }} />
              </div>
            )}
          />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="text-14 text-text-2">
              {t('sweep.slider', { criterion })}{' '}
              <output htmlFor={sliderId} className="num font-semibold text-text" data-testid="sweep-weight">
                {nf.format(wk)}
              </output>
            </p>
            <Button size="sm" variant="ghost" icon={<ArrowCounterClockwise aria-hidden />} onClick={() => setWk(base)} disabled={wk === base}>
              {t('sweep.reset')}
            </Button>
          </div>
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-12 text-text-2" aria-hidden>
            <li className="inline-flex items-center gap-1.5">
              <span className={s.swatchTop} />
              {t('sweep.legendTop', { name: topNames })}
            </li>
            <li className="inline-flex items-center gap-1.5">
              <span className={s.swatchRanking} />
              {t('sweep.legendRanking')}
            </li>
            <li className="inline-flex items-center gap-1.5">
              <span className={s.swatchSwitch} />
              {t('sweep.legendSwitch')}
            </li>
            <li className="inline-flex items-center gap-1.5">
              <span className={s.swatchBase} />
              {t('sweep.yours')}
            </li>
          </ul>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <h3 id={tableTitleId} className="text-14 font-medium text-text">
            {t('sweep.tableTitle')}
          </h3>
          <LiveRanking
            order={order}
            ranking={at.ranking}
            scores={at.scores}
            names={names}
            format={format4}
            labelledBy={tableTitleId}
            columns={{
              rank: tw('workbench.ranking.columns.rank'),
              alternative: tw('workbench.ranking.columns.alternative'),
              closeness: tw('workbench.ranking.columns.closeness'),
            }}
          />
          {/* Said when first place changes; the table itself is not a live region (it changes on every step). */}
          <p aria-live="polite" className="sr-only">
            {t('sweep.leader', { name: leaders.map((i) => names[i]).join(', ') })}
          </p>
        </div>
      </div>

      <SourcesDisclosure part="sweep" />
    </section>
  )
}
