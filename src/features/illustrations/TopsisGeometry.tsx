import { useCallback, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import type { Problem } from '../../core/types'
import { SegmentedControl } from '../../ui/SegmentedControl'
import { ChartFigure, type ChartTable } from '../charts/ChartFigure'
import { estimateTextWidth, truncate } from '../charts/layout'
import { useAnimateValues, useElementWidth } from '../charts/useElementWidth'
import {
  argMax,
  distancePoints,
  fitDistancePlane,
  fitPlot,
  ISO_C_DEFAULT,
  isoClosenessEnd,
  segmentTransform,
  topsisProjection,
  type Point,
  type TopsisProjection,
} from './geometry'
import s from './illustrations.module.css'

export type TopsisGeometryView = 'distances' | 'criteria'

export type TopsisGeometryLabels = {
  title: string
  /** One line under the criterion-plane picture, e.g. "Closer to A+ and farther from A- gives a higher C." */
  caption: string
  /** Criterion plane only, with more than two criteria: the plot is a projection, the numbers are not. */
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
  /** Accessible name of the view switch. */
  viewLabel: string
  viewDistances: string
  viewCriteria: string
  /** Distance plane axes: the label says which direction is better. */
  axisDPlus: string
  axisDMinus: string
  /** Label of a ray of constant closeness, from the formatted value ("C 0.75"). */
  isoC: (c: string) => string
  /** One line under the distance plane. */
  planeCaption: string
  /** Criterion axis names with their direction. */
  higherBetter: (name: string) => string
  lowerBetter: (name: string) => string
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
  viewLabel: 'View',
  viewDistances: 'Distances',
  viewCriteria: 'Two criteria',
  axisDPlus: 'D+ to the ideal, lower is better',
  axisDMinus: 'D− to the anti-ideal, higher is better',
  isoC: (c) => `C ${c}`,
  planeCaption: 'Top left is best. C is the same along each ray.',
  higherBetter: (name) => `${name}, higher is better`,
  lowerBetter: (name) => `${name}, lower is better`,
}

export type TopsisGeometryProps = {
  problem: Problem
  weights: readonly number[]
  /** Criterion indices on the x and y axis of the criterion plane; default the two with the largest weight. */
  axes?: [number, number] | undefined
  /** First view: the D+ / D- plane (exact for any number of criteria, the default) or two criteria. */
  defaultView?: TopsisGeometryView | undefined
  /** Selected alternative (controlled). Default: the best ranked one. */
  selected?: number | undefined
  onSelectedChange?: ((index: number) => void) | undefined
  /** Number format for the readout and the table (the active locale, 3 or 4 decimals). */
  format?: ((value: number) => string) | undefined
  labels?: Partial<TopsisGeometryLabels>
  className?: string | undefined
}

const MARGIN = { left: 20, right: 36, top: 28, bottom: 36 }
const PLANE_MARGIN = { left: 16, right: 52, top: 44, bottom: 28 }
const defaultFormat = (v: number) => v.toFixed(3)
/** "0,500" -> "0,5", "0.000" -> "0": a fixed-decimals format made short for ticks and ray labels. */
const trimZeros = (text: string) => text.replace(/([.,]\d*?)0+$/, '$1').replace(/[.,]$/, '')

type Screen = { x: number; y: number }

/**
 * TOPSIS as a picture, in two views.
 * - Distances (default): every alternative at (D+, D-), the core's n-criteria distances, with the
 *   rays of constant closeness C = D- / (D+ + D-). Exact for any number of criteria.
 * - Two criteria: the weighted normalized values of two criteria with A+ and A- and the selected
 *   alternative's distance lines. Values grow right and up on both axes; the axis label says which
 *   direction is better. Exact for two criteria, a projection for more.
 * Points are a radio group: click, or Tab to it and use the arrow keys / Home / End.
 */
export function TopsisGeometry({ problem, weights, axes, defaultView = 'distances', selected, onSelectedChange, format = defaultFormat, labels, className }: TopsisGeometryProps) {
  const l = { ...TOPSIS_GEOMETRY_LABELS_EN, ...labels }
  const uid = useId()
  const [plotRef, width] = useElementWidth<HTMLDivElement>()
  const animate = useAnimateValues(width)
  const proj = useMemo(() => topsisProjection(problem, weights, axes), [problem, weights, axes])
  const [own, setOwn] = useState<number | null>(null)
  const [view, setView] = useState<TopsisGeometryView>(defaultView)
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
  const xName = problem.criteria[ax]?.name ?? ''
  const yName = problem.criteria[ay]?.name ?? ''
  const dirName = (j: number, name: string) => (problem.criteria[j]?.type === 'cost' ? l.lowerBetter(name) : l.higherBetter(name))

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

  const distanceCells = (i: number) => [format(proj.dPlus[i]!), format(proj.dMinus[i]!), format(proj.closeness[i]!)]
  const table: ChartTable =
    view === 'distances'
      ? {
          corner: l.alternative,
          columns: [l.dPlus, l.dMinus, l.closeness],
          rows: problem.alternatives.map((name, i) => ({ label: name, cells: distanceCells(i) })),
        }
      : {
          corner: l.alternative,
          columns: [xName, yName, l.dPlus, l.dMinus, l.closeness],
          rows: [
            ...problem.alternatives.map((name, i) => ({
              label: name,
              cells: [format(proj.points[i]!.x), format(proj.points[i]!.y), ...distanceCells(i)],
            })),
            { label: l.ideal, cells: [format(proj.ideal.x), format(proj.ideal.y), '', '', ''] },
            { label: l.antiIdeal, cells: [format(proj.antiIdeal.x), format(proj.antiIdeal.y), '', '', ''] },
          ],
        }

  const w = Math.max(width, 240)
  const drawing = view === 'distances' ? planeDrawing(proj, w, l, uid, format) : criteriaDrawing(proj, w, l, uid, xName, yName, dirName(ax, xName), dirName(ay, yName))
  const pts = drawing.points
  const nameMax = Math.max(40, Math.min(120, (drawing.box.right - drawing.box.left) / 3))

  const caption = view === 'distances' ? l.planeCaption : l.caption
  const note = view === 'criteria' && !proj.exact ? l.projectionNote : null

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
      <SegmentedControl<TopsisGeometryView>
        aria-label={l.viewLabel}
        size="sm"
        className={s.viewSwitch}
        value={view}
        onValueChange={setView}
        options={[
          { value: 'distances', label: l.viewDistances },
          { value: 'criteria', label: l.viewCriteria },
        ]}
      />
      <svg
        className={animate ? `${s.svg} ${s.animate}` : s.svg}
        width={width}
        height={drawing.height}
        viewBox={`0 0 ${width} ${drawing.height}`}
        aria-labelledby={`${uid}-title`}
        aria-describedby={`${uid}-table`}
      >
        <defs>
          <marker id={`${uid}-head`} viewBox="0 0 8 8" refX={7} refY={4} markerWidth={8} markerHeight={8} orient="auto-start-reverse">
            <path className={s.axisHead} d="M0 0.5 8 4 0 7.5z" />
          </marker>
        </defs>
        {drawing.background}
        {drawing.selection(pts[current] ?? pts[0]!, current)}

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
        {caption}
        {note ? (
          <>
            {' '}
            <span className={s.note}>{note}</span>
          </>
        ) : null}
      </p>
    </ChartFigure>
  )
}

type Drawing = {
  height: number
  box: { left: number; right: number; top: number; bottom: number }
  points: Screen[]
  background: ReactNode
  selection: (sel: Screen, index: number) => ReactNode
}

/** The D+ / D- plane: origin bottom left, rays of constant C, guides from the selected point to both axes. */
function planeDrawing(proj: TopsisProjection, width: number, l: TopsisGeometryLabels, uid: string, format: (v: number) => string): Drawing {
  const data = distancePoints(proj)
  const fit = fitDistancePlane(data, width, { margin: PLANE_MARGIN, minPlotHeight: 160, maxPlotHeight: 300 })
  const { box } = fit
  const P = (p: Point): Screen => ({ x: fit.x(p.x), y: fit.y(p.y) })
  const short = (v: number) => trimZeros(format(v))
  const xLabelW = box.right + 12
  return {
    height: fit.height,
    box,
    points: data.map(P),
    background: (
      <>
        {/* Rays of constant closeness through the origin. */}
        <g aria-hidden="true">
          {ISO_C_DEFAULT.map((c, k) => {
            const end = isoClosenessEnd(c, fit.xMax, fit.yMax)
            const e = P(end)
            return (
              <g key={c}>
                <line className={s.iso} x1={box.left} y1={box.bottom} x2={e.x} y2={e.y} />
                <text
                  className={s.isoLabel}
                  x={end.side === 'top' ? e.x : e.x + 6}
                  y={end.side === 'top' ? e.y - 6 : e.y}
                  textAnchor={end.side === 'top' ? 'middle' : 'start'}
                  dominantBaseline={end.side === 'top' ? 'auto' : 'central'}
                >
                  {k === ISO_C_DEFAULT.length - 1 ? l.isoC(short(c)) : short(c)}
                </text>
              </g>
            )
          })}
        </g>
        {/* Axes from the origin; arrowheads point to larger distances. */}
        <path className={s.axis} d={`M${box.left} ${box.bottom}H${box.right + 12}`} markerEnd={`url(#${uid}-head)`} />
        <path className={s.axis} d={`M${box.left} ${box.bottom}V${box.top - 14}`} markerEnd={`url(#${uid}-head)`} />
        <text className={s.axisName} x={box.right + 12} y={box.bottom + 20} textAnchor="end">
          <title>{l.axisDPlus}</title>
          {truncate(l.axisDPlus, xLabelW, 12)}
        </text>
        <text className={s.axisName} x={box.left - 4} y={box.top - 32} dominantBaseline="central">
          <title>{l.axisDMinus}</title>
          {truncate(l.axisDMinus, width - box.left, 12)}
        </text>
      </>
    ),
    selection: (sel) => (
      <g aria-hidden="true">
        <line className={s.guide} x1={sel.x} y1={sel.y} x2={sel.x} y2={box.bottom} />
        <line className={s.guide} x1={sel.x} y1={sel.y} x2={box.left} y2={sel.y} />
      </g>
    ),
  }
}

/** Two criteria: weighted normalized values, A+ and A-, distance lines of the selected alternative. */
function criteriaDrawing(
  proj: TopsisProjection,
  width: number,
  l: TopsisGeometryLabels,
  uid: string,
  xName: string,
  yName: string,
  xLabel: string,
  yLabel: string,
): Drawing {
  const fit = fitPlot(proj, width, { margin: MARGIN, minPlotHeight: 120, maxPlotHeight: 300 })
  const { box } = fit
  const P = (p: Point): Screen => ({ x: fit.x(p.x), y: fit.y(p.y) })
  const ideal = P(proj.ideal)
  const anti = P(proj.antiIdeal)
  const refLabelW = Math.max(estimateTextWidth(l.ideal, 12), estimateTextWidth(l.antiIdeal, 12))
  // A zero-length line keeps the direction from A+ towards A- (and back), so it does not spin when it grows.
  const back = segmentTransform(ideal, anti, 0).angle
  const labelW = box.right - box.left
  return {
    height: fit.height,
    box,
    points: proj.points.map(P),
    background: (
      <>
        {/* Axes: values grow right and up; the labels say which direction is better. */}
        <path className={s.axis} d={`M${box.left - 8} ${box.bottom + 8}H${box.right + 16}`} markerEnd={`url(#${uid}-head)`} />
        <path className={s.axis} d={`M${box.left - 8} ${box.bottom + 8}V${box.top - 16}`} markerEnd={`url(#${uid}-head)`} />
        <text className={s.axisName} x={box.right + 16} y={box.bottom + 26} textAnchor="end">
          <title>{xName}</title>
          {truncate(xLabel, labelW, 12)}
        </text>
        <text className={s.axisName} x={box.left} y={box.top - 14} dominantBaseline="central">
          <title>{yName}</title>
          {truncate(yLabel, labelW, 12)}
        </text>
        <g aria-hidden="true">
          <path className={s.refMark} d={`M${ideal.x} ${ideal.y - 6}l6 6-6 6-6-6z`} />
          <text
            className={s.refLabel}
            x={ideal.x + 10 + refLabelW > width ? ideal.x - 10 : ideal.x + 10}
            y={ideal.y - 10}
            textAnchor={ideal.x + 10 + refLabelW > width ? 'end' : 'start'}
          >
            {l.ideal}
          </text>
          <path className={s.refMark} d={`M${anti.x} ${anti.y - 6}l6 6-6 6-6-6z`} />
          <text
            className={s.refLabel}
            x={anti.x + 10 + refLabelW > width ? anti.x - 10 : anti.x + 10}
            y={anti.y + 18}
            textAnchor={anti.x + 10 + refLabelW > width ? 'end' : 'start'}
          >
            {l.antiIdeal}
          </text>
        </g>
      </>
    ),
    selection: (sel) => {
      const toIdeal = segmentTransform(ideal, sel, back + 180)
      const toAnti = segmentTransform(anti, sel, back)
      const mid = (a: Screen, b: Screen) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })
      const midPlus = mid(ideal, sel)
      const midMinus = mid(anti, sel)
      return (
        <>
          {/* Unit lines moved by transform, so they can transition. */}
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
        </>
      )
    },
  }
}
