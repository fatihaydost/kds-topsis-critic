import { describe, expect, it } from 'vitest'
import type { PerturbationRow, StableInterval } from '../../../core/robustness'
import {
  CONCENTRATION,
  formatDelta,
  formatShare,
  heldCount,
  largestWeight,
  movedAlternatives,
  perturbGrid,
  rankOrder,
  snapWeight,
  stepWeight,
  switchMarks,
} from './helpers'

describe('orders', () => {
  it('rankOrder sorts by rank and keeps input order on ties', () => {
    expect(rankOrder([3, 1, 2])).toEqual([1, 2, 0])
    expect(rankOrder([1, 3, 1])).toEqual([0, 2, 1])
  })

  it('movedAlternatives lists the rows that changed place', () => {
    expect(movedAlternatives([0, 1, 2, 3], [0, 2, 1, 3])).toEqual([2, 1])
    expect(movedAlternatives([0, 1, 2], [0, 1, 2])).toEqual([])
  })

  it('largestWeight picks the first of the largest', () => {
    expect(largestWeight([0.2, 0.4, 0.4])).toBe(1)
  })
})

describe('weight steps', () => {
  it('snapWeight rounds to 0.01 inside [0, 1]', () => {
    expect(snapWeight(0.1872)).toBe(0.19)
    expect(snapWeight(-0.3)).toBe(0)
    expect(snapWeight(1.2)).toBe(1)
    expect(snapWeight(Number.NaN)).toBe(0)
  })

  it('stepWeight lands on the grid first, then moves 0.01 at a time', () => {
    expect(stepWeight(0.1872, 1)).toBe(0.19)
    expect(stepWeight(0.1872, -1)).toBe(0.18)
    expect(stepWeight(0.19, 1)).toBe(0.2)
    expect(stepWeight(0.3, -1)).toBe(0.29)
    expect(stepWeight(0.1 + 0.2, 1)).toBe(0.31)
    expect(stepWeight(0.1872, 10)).toBe(0.28)
    expect(stepWeight(0.995, 1)).toBe(1)
    expect(stepWeight(0.004, -1)).toBe(0)
    expect(stepWeight(0.42, 0)).toBe(0.42)
  })
})

describe('switchMarks', () => {
  const iv = (from: number, to: number, ranking: number[]): StableInterval => ({ from, to, ranking, top: [ranking.indexOf(1)] })

  it('marks the crossing of the pair that swapped, at its closeness', () => {
    const intervals = [iv(0, 0.3, [1, 2, 3]), iv(0.3, 0.7, [1, 3, 2]), iv(0.7, 1, [2, 3, 1])]
    const scores = (w: number) => (w === 0.3 ? [0.8, 0.5, 0.5] : [0.6, 0.4, 0.6])
    expect(switchMarks(intervals, scores)).toEqual([
      { x: 0.3, y: 0.5 },
      { x: 0.7, y: 0.6 },
    ])
  })

  it('draws nothing for a single interval', () => {
    expect(switchMarks([iv(0, 1, [1, 2])], () => [0.5, 0.4])).toEqual([])
  })
})

describe('perturbation grid', () => {
  const row = (k: number, delta: number, sameTop: boolean): PerturbationRow => ({ k, delta, weights: [], ranking: [], sameTop, spearman: 1, ws: 1 })

  it('places rows by criterion and delta', () => {
    const rows = [row(0, -0.2, true), row(1, 0.1, false), row(1, -0.2, true)]
    const grid = perturbGrid(rows, 2, [-0.2, 0.1])
    expect(grid[0]![0]).toBe(rows[0])
    expect(grid[0]![1]).toBeUndefined()
    expect(grid[1]![1]).toBe(rows[1])
    expect(heldCount(rows)).toEqual({ held: 2, total: 3 })
  })
})

describe('share texts', () => {
  it('formats shares as percentages in both languages', () => {
    expect(formatShare(0.62, 'en')).toBe('62%')
    expect(formatShare(0.62, 'tr')).toBe('%62')
    expect(formatShare(0.8734, 'en', 1)).toBe('87.3%')
    expect(formatShare(0.8734, 'tr', 1)).toBe('%87,3')
    expect(formatShare(0, 'en')).toBe('0%')
    expect(formatShare(0.003, 'en')).toBe('<1%')
    expect(formatShare(0.003, 'tr')).toBe('<%1')
  })

  it('formats signed changes', () => {
    expect(formatDelta(0.1, 'en')).toBe('+10%')
    expect(formatDelta(-0.2, 'en')).toBe('-20%')
    expect(formatDelta(-0.05, 'tr')).toBe('-%5')
  })

  it('names the κ presets of combinations.md §C.2', () => {
    expect(CONCENTRATION).toEqual({ uniform: 'uniform', loose: 20, medium: 100, tight: 500 })
  })
})
