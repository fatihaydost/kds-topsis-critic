import { useCallback, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { Problem } from '../../core/types'
import { ChartFigure, type ChartTable } from '../charts/ChartFigure'
import { estimateTextWidth, truncate } from '../charts/layout'
import { useAnimateValues, useElementWidth } from '../charts/useElementWidth'
import { argMax, fitPlot, segmentTransform, topsisProjection, type Point } from './geometry'
import s from './illustrations.module.css'

export type TopsisGeometryLabels = {
  title: string
  /** One line under the plot, e.g. "The closer to A+ and the farther from A-, the higher C." */
  caption: string
  /** Shown only with more than two criteria: the plot is a projection, the numbers are not. */
  projectionNote: string
  ideal: string
  antiIdeal: string
  dPlus: string
  dMinus: string
  /** The closeness formula as printed in the readout. */
  formula: string
  /** Accessible name of the group of points ("Choose an alternative"). */
  select: string
  /** Accessible name of one point, from its name and formatted closeness. */
  point: (name: string, closeness: string) => string
  showTable: string
  /** Header of the first table column. */
  alternative: string
  /** Header of the closeness column. */
  closeness: string
}

/** Development defaults only: the pages pass translated labels. */
export const TOPSIS_GEOMETRY_LABELS_EN: TopsisGeometryLabels = {
  title: 'Distance to the ideal and the anti-ideal',
  caption: 'Closer to A+ and farther from A− gives a higher C.',
  projectionNote: 'Drawn on the two heaviest criteria; D and C are computed on all criteria.',
  ideal: 'A+',
  antiIdeal: 'A−',
  dPlus: 'D+',
  dMinus: 'D−',
  formula: 'C = D− / (D+ + D−)',
  select: 'Choose an alternative',
  point: (name, c) => `${name}, C ${c}`,
  showTable: 'Show as table',
  alternative: 'Alternative',
  closeness: 'C',
}

export type TopsisGeometryProps = {
  problem: Problem
  weights: readonly number[]
  /** Criterion indices on the x and y axis; default the two with the largest weight. */
  axes?: [number, number] | undefined
  /** Selected alternative (controlled). Default: the best ranked one. */
  selected?: number | undefined
  onSelectedChange?: ((index: number) => void) | undefined
  /** Number format for the readout and the table (the active locale, 3 or 4 decimals). */
  format?: ((value: number) => string) | undefined
  labels?: Partial<TopsisGeometryLabels>
  className?: string | undefined
}

const MARGIN = { left: 20, right: 36, top: 28, bottom: 36 }
const defaultFormat = (v: number) => v.toFixed(3)

/**
 * TOPSIS as a picture: alternatives as points in the weighted normalized space of two criteria,
 * the ideal A+ and anti-ideal A-, and for the selected alternative its distances to both. Axes
 * are oriented so that better is right and up (a cost axis is reversed), with one scale on both
 * axes so drawn lengths are true distances. The readout gives the real n-criteria D+, D- and C.
 * Click a point or use the arrow keys to select.
 */
export function TopsisGeometry({ problem, weights, axes, selected, onSelectedChange, format = defaultFormat, labels, className }: TopsisGeometryProps) {
  const l = { ...TOPSIS_GEOMETRY_LABELS_EN, ...labels }
  const uid = useId()
  const [plotRef, width] = useElementWidth<HTMLDivElement>()
  const animate = useAnimateValues(width)
  const proj = useMemo(() => topsisProjection(problem, weights, axes), [problem, weights, axes])
  const [own, setOwn] = useState<number | null>(null)
  const pointRefs = useRef<(SVGGElement | null)[]>([])

  const m = problem.alternatives.length
  const best = proj ? argMax(proj.closeness) : 0
  const current = Math.min(Math.max(selected ?? own ?? best, 0), Math.max(m - 1, 0))

  const choose = useCallback(
    (i: number, focus = false) => {
      if (selected === undefined) setOwn(i)
      onSelectedChange?.(i)
      if (focus) pointRefs.current[i]?.focus()
    },
    [selected, onSelectedChange],
  )

  if (!proj) return null
  const [ax, ay] = proj.axes
  const fit = fitPlot(proj, Math.max(width, 240), { margin: MARGIN, minPlotHeight: 120, maxPlotHeight: 300 })
  const { box } = fit
  const P = (p: Point) => ({ x: fit.x(p.x), y: fit.y(p.y) })
  const ideal = P(proj.ideal)
  const anti = P(proj.antiIdeal)
  const pts = proj.points.map(P)
  const sel = pts[current] ?? ideal
  // From the fixed ends, so only rotation and length move: A+ is top right of every point, A- bottom left.
  const toIdeal = segmentTransform(ideal, sel, 135)
  const toAnti = segmentTransform(anti, sel, -45)
  const mid = (a: { x: number; y: number }, b: { x: number; y: number }) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })
  const midPlus = mid(ideal, sel)
  const midMinus = mid(anti, sel)

  const xName = problem.criteria[ax]?.name ?? ''
  const yName = problem.criteria[ay]?.name ?? ''

  const onKey = (e: KeyboardEvent<SVGGElement>, i: number) => {
    let next = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % m
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + m) % m
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = m - 1
    else if (e.key === ' ' || e.key === 'Enter') next = i
    if (next < 0) return
    e.preventDefault()
    choose(next, true)
  }

  const table: ChartTable = {
    corner: l.alternative,
    columns: [xName, yName, l.dPlus, l.dMinus, l.closeness],
    rows: [
      ...problem.alternatives.map((name, i) => ({
        label: name,
        cells: [format(proj.points[i]!.x), format(proj.points[i]!.y), format(proj.dPlus[i]!), format(proj.dMinus[i]!), format(proj.closeness[i]!)],
      })),
      { label: l.ideal, cells: [format(proj.ideal.x), format(proj.ideal.y), '', '', ''] },
      { label: l.antiIdeal, cells: [format(proj.antiIdeal.x), format(proj.antiIdeal.y), '', '', ''] },
    ],
  }

  const nameMax = Math.max(40, Math.min(120, (box.right - box.left) / 3))
  const refLabelW = Math.max(estimateTextWidth(l.ideal, 12), estimateTextWidth(l.antiIdeal, 12))

  return (
    <ChartFigure
      titleId={`${uid}-title`}
      tableId={`${uid}-table`}
      title={l.title}
      showTable={l.showTable}
      table={table}
      plotRef={plotRef}
      className={className}
    >
      <svg
        className={animate ? `${s.svg} ${s.animate}` : s.svg}
        width={width}
        height={fit.height}
        viewBox={`0 0 ${width} ${fit.height}`}
        aria-labelledby={`${uid}-title`}
        aria-describedby={`${uid}-table`}
      >
        <defs>
          <marker id={`${uid}-head`} viewBox="0 0 8 8" refX={7} refY={4} markerWidth={8} markerHeight={8} orient="auto-start-reverse">
            <path className={s.axisHead} d="M0 0.5 8 4 0 7.5z" />
          </marker>
        </defs>
        {/* Axes: arrowheads point to "better". */}
        <path className={s.axis} d={`M${box.left - 8} ${box.bottom + 8}H${box.right + 16}`} markerEnd={`url(#${uid}-head)`} />
        <path className={s.axis} d={`M${box.left - 8} ${box.bottom + 8}V${box.top - 16}`} markerEnd={`url(#${uid}-head)`} />
        <text className={s.axisName} x={box.right + 16} y={box.bottom + 26} textAnchor="end">
          <title>{xName}</title>
          {truncate(xName, box.right - box.left, 12)}
        </text>
        <text className={s.axisName} x={box.left} y={box.top - 14} dominantBaseline="central">
          <title>{yName}</title>
          {truncate(yName, box.right - box.left, 12)}
        </text>

        {/* Distance lines of the selected alternative: unit lines moved by transform, so they can transition. */}
        <line
          className={s.dist}
          x1={0}
          y1={0}
          x2={1}
          y2={0}
          vectorEffect="non-scaling-stroke"
          style={{ transform: `translate(${toIdeal.x}px, ${toIdeal.y}px) rotate(${toIdeal.angle}deg) scale(${toIdeal.length}, 1)` }}
        />
        <line
          className={`${s.dist} ${s.distMinus}`}
          x1={0}
          y1={0}
          x2={1}
          y2={0}
          vectorEffect="non-scaling-stroke"
          style={{ transform: `translate(${toAnti.x}px, ${toAnti.y}px) rotate(${toAnti.angle}deg) scale(${toAnti.length}, 1)` }}
        />
        <text className={s.distLabel} x={0} y={0} dx={6} dy={-6} style={{ transform: `translate(${midPlus.x}px, ${midPlus.y}px)` }}>
          {l.dPlus}
        </text>
        <text className={s.distLabel} x={0} y={0} dx={6} dy={-6} style={{ transform: `translate(${midMinus.x}px, ${midMinus.y}px)` }}>
          {l.dMinus}
        </text>

        {/* Ideal and anti-ideal. */}
        <g aria-hidden="true">
          <path className={s.refMark} d={`M${ideal.x} ${ideal.y - 6}l6 6-6 6-6-6z`} />
          <text className={s.refLabel} x={Math.min(ideal.x + 10, width - refLabelW)} y={ideal.y - 12}>
            {l.ideal}
          </text>
          <path className={s.refMark} d={`M${anti.x} ${anti.y - 6}l6 6-6 6-6-6z`} />
          <text className={s.refLabel} x={anti.x - 10} y={anti.y + 18} textAnchor={anti.x - 10 - refLabelW < 0 ? 'start' : 'end'}>
            {l.antiIdeal}
          </text>
        </g>

        {/* Alternatives: a radio group, one tab stop, arrows move the selection. */}
        <g role="radiogroup" aria-label={l.select}>
          {pts.map((p, i) => {
            const on = i === current
            const name = problem.alternatives[i] ?? ''
            const short = truncate(name, nameMax, 12)
            const labelRight = p.x + 10 + estimateTextWidth(short, 12) <= width
            return (
              <g
                key={i}
                ref={(el) => {
                  pointRefs.current[i] = el
                }}
                className={s.point}
                role="radio"
                aria-checked={on}
                aria-label={l.point(name, format(proj.closeness[i]!))}
                tabIndex={on ? 0 : -1}
                onClick={() => choose(i)}
                onKeyDown={(e) => onKey(e, i)}
              >
                <circle className={s.hit} cx={p.x} cy={p.y} r={14} />
                <circle className={s.focusRing} cx={p.x} cy={p.y} r={10} />
                <circle className={s.dot} cx={p.x} cy={p.y} r={on ? 6 : 5} />
                <text className={s.pointLabel} x={labelRight ? p.x + 9 : p.x - 9} y={p.y + 14} textAnchor={labelRight ? 'start' : 'end'}>
                  {name !== short ? <title>{name}</title> : null}
                  {short}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
      <div className={s.readout} aria-live="polite">
        <span className={s.readoutName}>{problem.alternatives[current]}</span>
        <span>
          {l.dPlus} {format(proj.dPlus[current]!)}
        </span>
        <span>
          {l.dMinus} {format(proj.dMinus[current]!)}
        </span>
        <span className={s.readoutC}>
          {l.formula} = <b>{format(proj.closeness[current]!)}</b>
        </span>
      </div>
      <p className={s.caption}>
        {l.caption}
        {proj.exact ? null : (
          <>
            {' '}
            <span className={s.note}>{l.projectionNote}</span>
          </>
        )}
      </p>
    </ChartFigure>
  )
}
