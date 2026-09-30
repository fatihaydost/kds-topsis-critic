/**
 * Pure helpers of the Robustness stage: orders, weight steps, crossing marks, the perturbation grid and share texts.
 * No DOM and no React, so they are unit tested (helpers.test.ts).
 */
import type { Concentration, PerturbationRow, StableInterval } from '../../../core/robustness'
import { estimateTextWidth } from '../../../features/charts/layout'
import type { Lang } from '../../../i18n/lang'

/** Monte Carlo settings shown in the UI (N and seed are printed next to the results). */
export const MC_RUNS = 10_000
export const MC_SEED = 1

export const SPREADS = ['uniform', 'loose', 'medium', 'tight'] as const
export type Spread = (typeof SPREADS)[number]
/** Dirichlet concentration of each preset: uniform over the simplex, or κ around the user's weights. */
export const CONCENTRATION: Record<Spread, Concentration> = { uniform: 'uniform', loose: 20, medium: 100, tight: 500 }

/** Alternatives in rank order; ties keep input order. */
export function rankOrder(ranking: readonly number[]): number[] {
  return ranking.map((_, i) => i).sort((a, b) => ranking[a]! - ranking[b]! || a - b)
}

/** Alternatives whose row position differs between two orders (both lists of alternative indices). */
export function movedAlternatives(prev: readonly number[], next: readonly number[]): number[] {
  const at = new Map(prev.map((i, pos) => [i, pos]))
  return next.filter((i, pos) => at.get(i) !== pos)
}

/** Index of the largest weight (first on ties): the criterion the sweep opens with. */
export function largestWeight(weights: readonly number[]): number {
  let best = 0
  for (let j = 1; j < weights.length; j++) if (weights[j]! > weights[best]!) best = j
  return best
}

/** Weight on the 0.01 grid, inside [0, 1] (pointer input). */
export function snapWeight(v: number): number {
  if (!Number.isFinite(v)) return 0
  return Math.min(1, Math.max(0, Math.round(v * 100) / 100))
}

/** Values that agree to 12 decimals are the same weight (0.1 + 0.2 and 0.3). */
const same = (a: number, b: number) => Math.abs(a - b) < 1e-9

/**
 * A step of `steps` grid points (0.01 each) from `v`: from a value off the grid (the user's weight, 0.1872) the first
 * step lands on the next grid point in that direction (0.19 up, 0.18 down), then it moves 0.01 at a time.
 */
export function stepWeight(v: number, steps: number): number {
  if (steps === 0) return v
  const scaled = v * 100
  const onGrid = same(scaled, Math.round(scaled))
  const from = onGrid ? Math.round(scaled) : steps > 0 ? Math.floor(scaled) : Math.ceil(scaled)
  return Math.min(1, Math.max(0, (from + steps) / 100))
}

/**
 * The crossing points drawn on the sweep chart: at each boundary between two intervals of constant ranking, the
 * closest pair of alternatives that changed rank there, at their (equal) closeness. `scoresAt` evaluates the method
 * at a weight exactly.
 */
export function switchMarks(intervals: readonly StableInterval[], scoresAt: (wk: number) => readonly number[]): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = []
  for (let k = 0; k + 1 < intervals.length; k++) {
    const a = intervals[k]!
    const b = intervals[k + 1]!
    const changed = a.ranking.map((r, i) => (r !== b.ranking[i] ? i : -1)).filter((i) => i >= 0)
    if (changed.length < 2) continue
    const s = scoresAt(a.to)
    const sorted = changed.slice().sort((p, q) => s[p]! - s[q]!)
    let best = 0
    for (let m = 1; m + 1 < sorted.length; m++) if (s[sorted[m + 1]!]! - s[sorted[m]!]! < s[sorted[best + 1]!]! - s[sorted[best]!]!) best = m
    out.push({ x: a.to, y: (s[sorted[best]!]! + s[sorted[best + 1]!]!) / 2 })
  }
  return out
}

/** Perturbation rows as a grid: grid[j][d] is criterion j changed by deltas[d] (undefined when the core skipped it). */
export function perturbGrid(
  rows: readonly PerturbationRow[],
  n: number,
  deltas: readonly number[],
): (PerturbationRow | undefined)[][] {
  const grid = Array.from({ length: n }, () => new Array<PerturbationRow | undefined>(deltas.length).fill(undefined))
  for (const row of rows) {
    const d = deltas.findIndex((x) => same(x, row.delta))
    if (d >= 0 && row.k >= 0 && row.k < n) grid[row.k]![d] = row
  }
  return grid
}

/** First place held in how many of the perturbations. */
export function heldCount(rows: readonly PerturbationRow[]): { held: number; total: number } {
  return { held: rows.filter((r) => r.sameTop).length, total: rows.length }
}

const BCP47: Record<Lang, string> = { en: 'en-US', tr: 'tr-TR' }
const percentCache = new Map<string, Intl.NumberFormat>()
function percent(lang: Lang, decimals: number, sign = false): Intl.NumberFormat {
  const key = `${lang}|${decimals}|${sign ? 1 : 0}`
  let f = percentCache.get(key)
  if (!f) {
    f = new Intl.NumberFormat(BCP47[lang], {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      ...(sign ? { signDisplay: 'exceptZero' as const } : {}),
    })
    percentCache.set(key, f)
  }
  return f
}

/**
 * A share (0..1) as a percentage in the active locale (EN "62%", TR "%62"). A share that is not zero but rounds to it
 * prints as "<1%" ("<%1"), so "never" and "rarely" read differently.
 */
export function formatShare(p: number, lang: Lang, decimals = 0): string {
  if (!Number.isFinite(p)) return ''
  const f = percent(lang, decimals)
  const min = 10 ** -decimals / 100
  if (p > 0 && p < min / 2) return `<${f.format(min)}`
  return f.format(p)
}

/** A relative change with its sign (EN "+10%", "-20%"; TR "+%10", "-%20"). */
export function formatDelta(delta: number, lang: Lang): string {
  return percent(lang, 0, true).format(delta)
}

/** Width a md segmented control of these labels needs (14 px text, 12 px padding a side, 1 px gaps and border). */
export const segmentedWidth = (labels: readonly string[]): number => labels.reduce((w, l) => w + estimateTextWidth(l, 14) + 25, 2)
