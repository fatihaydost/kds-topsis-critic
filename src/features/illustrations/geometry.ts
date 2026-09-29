/**
 * Pure data for the method illustrations. Everything is read from the core's own steps, so a
 * picture can never disagree with the worked calculation. No DOM.
 */
import { critic } from '../../core/methods/critic'
import { topsis } from '../../core/methods/topsis'
import type { Problem, RankingResult, Step, WeightingResult } from '../../core/types'
import { scaleLinear, type Domain, type LinearScale } from '../charts/scale'

const stepMatrix = (steps: Step[], key: string): number[][] => {
  const s = steps.find((x) => x.key === key)
  if (!s?.matrix) throw new Error(`step ${key} has no matrix`)
  return s.matrix
}

const stepVector = (steps: Step[], key: string): number[] => {
  const s = steps.find((x) => x.key === key)
  if (!s?.vector) throw new Error(`step ${key} has no vector`)
  return s.vector
}

// ---------------------------------------------------------------------------------------------
// TOPSIS geometry
// ---------------------------------------------------------------------------------------------

/**
 * The two criteria to draw: the two with the largest weight (ties keep the lower index), returned
 * in criterion order so the x axis is always the earlier column.
 */
export function defaultAxes(weights: readonly number[]): [number, number] {
  const order = weights.map((_, j) => j).sort((a, b) => weights[b]! - weights[a]! || a - b)
  const a = order[0] ?? 0
  const b = order[1] ?? Math.min(1, weights.length - 1)
  return a < b ? [a, b] : [b, a]
}

export type Point = { x: number; y: number }

export type TopsisProjection = {
  result: RankingResult
  /** Criterion indices on the x and y axis. */
  axes: [number, number]
  /** Weighted normalized values v_ij of every alternative on the two axes. */
  points: Point[]
  /** A+ and A- on the two axes (weighted normalized space, as in the core steps). */
  ideal: Point
  antiIdeal: Point
  /** n-dimensional distances and closeness from the core. */
  dPlus: number[]
  dMinus: number[]
  closeness: number[]
  /** Whether the picture is exact (two criteria) or a projection of more. */
  exact: boolean
}

/**
 * Runs TOPSIS through the core and takes the two chosen columns of its weighted normalized matrix,
 * ideal and anti-ideal. Returns null when the problem cannot be computed or has fewer than two
 * criteria.
 */
export function topsisProjection(problem: Problem, weights: readonly number[], axes?: [number, number]): TopsisProjection | null {
  const n = problem.criteria.length
  if (n < 2) return null
  let result: RankingResult
  try {
    result = topsis.compute(problem, [...weights], {})
  } catch {
    return null
  }
  const [a, b] = axes && axes[0] !== axes[1] && axes.every((j) => j >= 0 && j < n) ? axes : defaultAxes(weights)
  const v = stepMatrix(result.steps, 'topsis.weighted')
  const best = stepVector(result.steps, 'topsis.idealBest')
  const worst = stepVector(result.steps, 'topsis.idealWorst')
  return {
    result,
    axes: [a, b],
    points: v.map((row) => ({ x: row[a]!, y: row[b]! })),
    ideal: { x: best[a]!, y: best[b]! },
    antiIdeal: { x: worst[a]!, y: worst[b]! },
    dPlus: stepVector(result.steps, 'topsis.distanceBest'),
    dMinus: stepVector(result.steps, 'topsis.distanceWorst'),
    closeness: result.scores,
    exact: n === 2,
  }
}

/** Euclidean distance in the plane. */
export const planarDistance = (p: Point, q: Point): number => Math.hypot(p.x - q.x, p.y - q.y)

export type PlotBox = { left: number; right: number; top: number; bottom: number }

export type PlotFit = { x: LinearScale; y: LinearScale; box: PlotBox; height: number }

export type FitOptions = {
  margin: { left: number; right: number; top: number; bottom: number }
  minPlotHeight?: number
  maxPlotHeight?: number
  /** Space around the A+ / A- rectangle, as a fraction of its longer side. */
  pad?: number
}

/**
 * Screen scales for the projection.
 * - One unit is the same number of pixels on both axes, so a drawn distance is a true (planar)
 *   Euclidean distance; the height follows the data, clamped, and the data is centred.
 * - Oriented so that "better" is always right and up: a cost axis is reversed. A+ is then the top
 *   right corner of the data and A- the bottom left, whatever the criterion directions are.
 */
export function fitPlot(proj: Pick<TopsisProjection, 'ideal' | 'antiIdeal'>, width: number, opts: FitOptions): PlotFit {
  const { margin, minPlotHeight = 140, maxPlotHeight = 300, pad = 0.08 } = opts
  const { ideal, antiIdeal } = proj
  const spanX = Math.abs(ideal.x - antiIdeal.x)
  const spanY = Math.abs(ideal.y - antiIdeal.y)
  const span = Math.max(spanX, spanY) || Math.max(Math.abs(ideal.x), Math.abs(ideal.y), 1)
  const p = span * pad
  const dx = Math.max(spanX, span * 1e-3) + 2 * p
  const dy = Math.max(spanY, span * 1e-3) + 2 * p
  const plotW = Math.max(1, width - margin.left - margin.right)
  let k = plotW / dx
  let plotH = dy * k
  if (plotH > maxPlotHeight) {
    plotH = maxPlotHeight
    k = plotH / dy
  }
  plotH = Math.max(plotH, minPlotHeight)
  const box: PlotBox = { left: margin.left, right: margin.left + plotW, top: margin.top, bottom: margin.top + plotH }
  const axis = (worst: number, best: number, half: number, r: Domain): LinearScale => {
    const mid = (worst + best) / 2
    const dir = best >= worst ? 1 : -1
    return scaleLinear([mid - dir * half, mid + dir * half], r)
  }
  return {
    x: axis(antiIdeal.x, ideal.x, plotW / k / 2, [box.left, box.right]),
    y: axis(antiIdeal.y, ideal.y, plotH / k / 2, [box.bottom, box.top]),
    box,
    height: box.bottom + margin.bottom,
  }
}

/**
 * A segment as translate + rotate + scale of a unit line, so CSS can transition it (SVG line
 * coordinates do not transition). `fallbackAngle` is used for a zero-length segment so it does
 * not spin when it grows again.
 */
export function segmentTransform(from: Point, to: Point, fallbackAngle: number): { x: number; y: number; angle: number; length: number } {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.hypot(dx, dy)
  // `+ 0` turns -0 into 0: atan2(-0, -1) would be -180 instead of 180.
  const angle = length < 1e-9 ? fallbackAngle : (Math.atan2(dy + 0, dx + 0) * 180) / Math.PI
  return { x: from.x, y: from.y, angle, length }
}

// ---------------------------------------------------------------------------------------------
// CRITIC parts
// ---------------------------------------------------------------------------------------------

export type CriticParts = {
  result: WeightingResult
  /** Min-max normalized matrix r_ij (1 = best). */
  normalized: number[][]
  sigma: number[]
  conflict: number[]
  information: number[]
  weights: number[]
}

/** CRITIC through the core, with the steps the illustration draws. Null when it cannot run. */
export function criticParts(problem: Problem): CriticParts | null {
  let result: WeightingResult
  try {
    result = critic.compute(problem, {})
  } catch {
    return null
  }
  return {
    result,
    normalized: stepMatrix(result.steps, 'critic.normalized'),
    sigma: stepVector(result.steps, 'critic.sigma'),
    conflict: stepVector(result.steps, 'critic.conflict'),
    information: stepVector(result.steps, 'critic.information'),
    weights: result.weights,
  }
}

/** Index of the largest value (first on ties), or -1 for an empty list. */
export function argMax(values: readonly number[]): number {
  let best = -1
  for (let i = 0; i < values.length; i++) if (best < 0 || values[i]! > values[best]!) best = i
  return best
}

// ---------------------------------------------------------------------------------------------
// Step flow
// ---------------------------------------------------------------------------------------------

/** A node of the step map: its key is the first core step key it covers. */
export type FlowNode = { key: string; stepKeys: readonly string[] }

/** TOPSIS in five nodes: Normalize, Weight, Ideal points, Distances, Closeness. */
export const TOPSIS_FLOW: readonly FlowNode[] = [
  { key: 'topsis.normalized', stepKeys: ['topsis.normalized'] },
  { key: 'topsis.weighted', stepKeys: ['topsis.weighted'] },
  { key: 'topsis.idealBest', stepKeys: ['topsis.idealBest', 'topsis.idealWorst'] },
  { key: 'topsis.distanceBest', stepKeys: ['topsis.distanceBest', 'topsis.distanceWorst'] },
  { key: 'topsis.closeness', stepKeys: ['topsis.closeness'] },
]

/** CRITIC in five nodes: Normalize, Contrast, Correlation, Information, Weights. */
export const CRITIC_FLOW: readonly FlowNode[] = [
  { key: 'critic.normalized', stepKeys: ['critic.normalized'] },
  { key: 'critic.sigma', stepKeys: ['critic.sigma'] },
  { key: 'critic.correlation', stepKeys: ['critic.correlation', 'critic.conflict'] },
  { key: 'critic.information', stepKeys: ['critic.information', 'critic.informationTotal'] },
  { key: 'critic.weights', stepKeys: ['critic.weights'] },
]

/** The node that holds `stepKey`, or -1. */
export function flowIndex(nodes: readonly { key: string; stepKeys?: readonly string[] | undefined }[], stepKey: string | undefined): number {
  if (stepKey === undefined) return -1
  return nodes.findIndex((n) => n.key === stepKey || (n.stepKeys?.includes(stepKey) ?? false))
}
