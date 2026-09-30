import { ArrowsDownUp, Check } from '@phosphor-icons/react'
import { useId, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DEFAULT_DELTAS, perturbWeights } from '../../../core/robustness'
import type { Problem, RankingMethod } from '../../../core/types'
import { ChartFigure } from '../../../features/charts/ChartFigure'
import { useNumberFormat } from '../../../i18n'
import { formatDelta, heldCount, perturbGrid } from './helpers'
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

/**
 * B: small changes. Each weight moved by ±5, 10 and 20 % (the others rescaled): one cell per criterion and change,
 * a plain tick where first place holds, a tinted cell with an icon and the new leader's name where it does not.
 * WS and ρ are in the table behind "Show as table".
 */
export function PerturbSection({ problem, weights, method, names, criteria }: Props) {
  const { t } = useRobustnessText()
  const { t: tw } = useTranslation()
  const nf = useNumberFormat(4)
  const uid = useId()
  const rows = useMemo(() => perturbWeights(problem, weights, method, DEFAULT_DELTAS), [problem, weights, method])
  const grid = useMemo(() => perturbGrid(rows, criteria.length, DEFAULT_DELTAS), [rows, criteria.length])
  const { held, total } = heldCount(rows)
  const leader = (ranking: readonly number[]) =>
    ranking
      .map((r, i) => (r === 1 ? names[i] : null))
      .filter((x): x is string => x !== null)
      .join(', ')
  const deltaText = DEFAULT_DELTAS.map((d) => formatDelta(d, nf.lang))

  const table = {
    corner: t('sweep.criterion'),
    columns: [t('perturb.change'), t('perturb.firstPlace'), t('perturb.ws'), 'ρ'],
    rows: rows.map((r) => ({
      label: criteria[r.k] ?? '',
      cells: [formatDelta(r.delta, nf.lang), r.sameTop ? t('perturb.same') : t('perturb.changed', { name: leader(r.ranking) }), nf.format(r.ws), nf.format(r.spearman, 3)],
    })),
  }

  return (
    <section aria-labelledby={`${uid}-title`} className="flex flex-col gap-4">
      <SectionHead id={`${uid}-title`} title={t('perturb.title')} lead={t('perturb.lead')} />
      <p className="text-16 font-medium text-text" data-testid="perturb-summary">
        {t('perturb.summary', { held, total })}
      </p>
      <ChartFigure
        titleId={`${uid}-chart`}
        tableId={`${uid}-table`}
        title={t('perturb.chartTitle')}
        showTable={tw('workbench.chart.showTable')}
        table={table}
        plotRef={null}
        className="max-w-[720px]"
      >
        <div
          role="img"
          aria-labelledby={`${uid}-chart`}
          aria-describedby={`${uid}-table`}
          className={s.pgrid}
          style={{ gridTemplateColumns: `auto repeat(${DEFAULT_DELTAS.length}, minmax(56px, auto))` }}
        >
          <span />
          {deltaText.map((d) => (
            <span key={d} className={s.pcol}>
              {d}
            </span>
          ))}
          {grid.map((cells, j) => (
            <PerturbRow key={j} criterion={criteria[j] ?? ''} cells={cells.map((r) => (r ? { same: r.sameTop, leader: leader(r.ranking) } : null))} />
          ))}
        </div>
      </ChartFigure>
      <SourcesDisclosure part="perturb" />
    </section>
  )
}

function PerturbRow({ criterion, cells }: { criterion: string; cells: ({ same: boolean; leader: string } | null)[] }) {
  return (
    <>
      <span className={s.prow}>{criterion}</span>
      {cells.map((c, d) =>
        c === null ? (
          <span key={d} className={s.pcell} />
        ) : (
          <span key={d} className={s.pcell} data-changed={!c.same || undefined} data-testid="perturb-cell">
            {c.same ? <Check aria-hidden className="size-3.5" /> : <ArrowsDownUp aria-hidden className="size-3.5 shrink-0" />}
            {!c.same && c.leader}
          </span>
        ),
      )}
    </>
  )
}
