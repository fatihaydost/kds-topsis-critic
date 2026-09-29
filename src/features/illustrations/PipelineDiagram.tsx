import { Fragment } from 'react'
import s from './illustrations.module.css'

export type PipelineStage = 'data' | 'weights' | 'ranking' | 'results' | 'robustness'

export type PipelineLabels = {
  data: string
  weights: string
  ranking: string
  results: string
  robustness: string
  /** Marker of the stage that is not built yet. */
  soon: string
  /** Accessible name of the whole figure; default: the stage names in order. */
  ariaLabel?: string
}

export type PipelineDiagramProps = {
  /** Stage drawn in the accent (the current workbench stage, or none). */
  active?: PipelineStage | undefined
  /** Method names under a stage, e.g. { weights: 'CRITIC', ranking: 'TOPSIS' }. */
  methods?: Partial<Record<PipelineStage, string>> | undefined
  /** Real weights for the weights glyph (up to 6 bars, scaled to the largest); default a neutral shape. */
  weights?: readonly number[] | undefined
  /** Draw the robustness stage after the results, faded and marked `soon` (default true). */
  showRobustness?: boolean
  labels?: Partial<PipelineLabels>
  className?: string
}

/** Development defaults only: the pages pass translated labels. */
export const PIPELINE_LABELS_EN: PipelineLabels = {
  data: 'Decision matrix',
  weights: 'Weighting method',
  ranking: 'Ranking method',
  results: 'Result',
  robustness: 'Robustness',
  soon: 'Coming later',
}

const STAGES: readonly PipelineStage[] = ['data', 'weights', 'ranking', 'results', 'robustness']

/**
 * The actual pipeline, data to weights to ranking to result, as a row of boxes (a column in a
 * container narrower than 600 px). Each box carries a tiny sketch of what it holds. Static: the
 * figure is one image for assistive tech, its name lists the stages.
 */
export function PipelineDiagram({ active, methods, weights, showRobustness = true, labels, className }: PipelineDiagramProps) {
  const l = { ...PIPELINE_LABELS_EN, ...labels }
  const stages = showRobustness ? STAGES : STAGES.slice(0, 4)
  const aria =
    l.ariaLabel ??
    stages.map((k) => (k === 'robustness' ? `${l[k]} (${l.soon})` : methods?.[k] ? `${l[k]}: ${methods[k]}` : l[k])).join(', ')

  return (
    <figure className={[s.fig, s.pipeline, className].filter(Boolean).join(' ')} role="img" aria-label={aria}>
      <ol className={s.track}>
        {stages.map((k, i) => {
          const soon = k === 'robustness'
          return (
            <Fragment key={k}>
              {i > 0 ? (
                <li className={s.arrow} aria-hidden="true" data-soon={soon || undefined}>
                  <svg viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 8h15M12 3.5 17 8l-5 4.5" />
                  </svg>
                </li>
              ) : null}
              <li className={s.stage} data-active={active === k || undefined} data-soon={soon || undefined}>
                <StageGlyph stage={k} weights={weights} />
                <span className={s.stageText}>
                  <span className={s.stageName}>{l[k]}</span>
                  {soon ? <span className={s.stageMethod}>{l.soon}</span> : methods?.[k] ? <span className={s.stageMethod}>{methods[k]}</span> : null}
                </span>
              </li>
            </Fragment>
          )
        })}
      </ol>
    </figure>
  )
}

/** 40 x 28 sketches in currentColor (data context, or data accent on the active stage). */
function StageGlyph({ stage, weights }: { stage: PipelineStage; weights: readonly number[] | undefined }) {
  return (
    <svg className={s.stageGlyph} viewBox="0 0 40 28" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.25}>
      {stage === 'data' ? <MatrixSketch /> : null}
      {stage === 'weights' ? <WeightSketch weights={weights} /> : null}
      {stage === 'ranking' ? <RankSketch /> : null}
      {stage === 'results' ? <ResultSketch /> : null}
      {stage === 'robustness' ? <RobustSketch /> : null}
    </svg>
  )
}

/** 3 x 3 cells under a filled header row. */
function MatrixSketch() {
  const cells = []
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) cells.push(<rect key={`${r}-${c}`} x={4.5 + c * 11} y={7.5 + r * 6.5} width={9} height={5} rx={0.5} />)
  return (
    <g>
      <rect x={4.5} y={1.5} width={31} height={4} rx={0.5} fill="currentColor" stroke="none" opacity={0.45} />
      {cells}
    </g>
  )
}

/** Bars from the real weights when given, otherwise a neutral three-bar shape. */
function WeightSketch({ weights }: { weights: readonly number[] | undefined }) {
  const w = weights && weights.length > 0 && weights.every((x) => Number.isFinite(x) && x >= 0) ? weights.slice(0, 6) : [0.6, 1, 0.8]
  const max = Math.max(...w) || 1
  const n = w.length
  const gap = 2
  const bw = Math.min(7, (32 - gap * (n - 1)) / n)
  const x0 = 20 - (n * bw + (n - 1) * gap) / 2
  return (
    <g>
      <path d="M3 26.5h34" strokeWidth={1} />
      {w.map((v, i) => {
        const h = Math.max(1.5, (v / max) * 22)
        return <rect key={i} x={x0 + i * (bw + gap)} y={26 - h} width={bw} height={h} fill="currentColor" stroke="none" />
      })}
    </g>
  )
}

/** 1, 2, 3 in rows: the order of the alternatives. */
function RankSketch() {
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <text x={6} y={7.5 + i * 8.5} fill="currentColor" stroke="none" fontSize={7.5} fontWeight={600} textAnchor="middle" dominantBaseline="central">
            {i + 1}
          </text>
          <path d={`M12 ${7.5 + i * 8.5}h${24 - i * 6}`} strokeWidth={2.5} strokeLinecap="round" />
        </g>
      ))}
    </g>
  )
}

/** A result table whose first row is the chosen alternative. */
function ResultSketch() {
  return (
    <g>
      <rect x={4.5} y={3.5} width={31} height={6} rx={0.5} fill="currentColor" />
      <rect x={4.5} y={11.5} width={31} height={6} rx={0.5} />
      <rect x={4.5} y={19.5} width={31} height={6} rx={0.5} />
    </g>
  )
}

/** Three scores with their spread: does the order survive a change of weights? */
function RobustSketch() {
  const rows = [
    { y: 5, c: 27, s: 8 },
    { y: 14, c: 20, s: 9 },
    { y: 23, c: 12, s: 7 },
  ]
  return (
    <g>
      {rows.map((r, i) => (
        <g key={i}>
          <path d={`M${r.c - r.s} ${r.y}h${r.s * 2}M${r.c - r.s} ${r.y - 2.5}v5M${r.c + r.s} ${r.y - 2.5}v5`} />
          <circle cx={r.c} cy={r.y} r={2} fill="currentColor" stroke="none" />
        </g>
      ))}
    </g>
  )
}
