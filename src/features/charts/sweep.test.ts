import { describe, expect, it } from 'vitest'
import { layoutRankIntervals, layoutSweep, linePath, spreadLabels } from './sweep'

describe('spreadLabels', () => {
  it('keeps labels that do not collide where they are', () => {
    expect(spreadLabels([10, 50, 90], 14, 0, 100)).toEqual([10, 50, 90])
  })

  it('pushes colliding labels apart, in input order', () => {
    const out = spreadLabels([50, 50, 52], 14, 0, 200)
    const sorted = out.slice().sort((a, b) => a - b)
    for (let k = 1; k < sorted.length; k++) expect(sorted[k]! - sorted[k - 1]!).toBeGreaterThanOrEqual(14 - 1e-9)
    expect(out[0]).toBeLessThan(out[1]!)
  })

  it('pulls a stack back inside the bottom edge', () => {
    const out = spreadLabels([98, 99, 100], 14, 0, 100)
    expect(Math.max(...out)).toBeLessThanOrEqual(100)
    expect(Math.min(...out)).toBeCloseTo(72)
  })
})

describe('layoutSweep', () => {
  const xs = [0, 0.5, 1]
  const series = [
    [0.2, 0.5, 0.8],
    [0.7, 0.5, 0.3],
  ]
  const l = layoutSweep({ width: 600, xs, series, labels: ['A', 'B'] })

  it('maps 0..1 onto the plot and draws one path per alternative', () => {
    expect(l.x(0)).toBe(l.left)
    expect(l.x(1)).toBe(l.right)
    expect(l.paths).toHaveLength(2)
    expect(l.paths[0]!.startsWith('M')).toBe(true)
    expect(l.paths[0]!.match(/L/g)).toHaveLength(2)
  })

  it('has a y domain around the data, inside 0..1, with the larger value higher', () => {
    expect(l.y.domain[0]).toBeGreaterThanOrEqual(0)
    expect(l.y.domain[1]).toBeLessThanOrEqual(1)
    expect(l.y(0.8)).toBeLessThan(l.y(0.2))
  })

  it('puts the end labels at the right, at the last values', () => {
    expect(l.ends.map((e) => e.index)).toEqual([0, 1])
    expect(l.ends[0]!.y).toBeLessThan(l.ends[1]!.y)
  })

  it('writes short path text', () => {
    expect(linePath([
      [0, 1.234],
      [2.5, 3],
    ])).toBe('M0 1.23L2.5 3')
  })
})

describe('layoutRankIntervals', () => {
  it('orders rows by mean rank and places rank 1 on the left', () => {
    const l = layoutRankIntervals({
      width: 400,
      labels: ['A', 'B', 'C'],
      mean: [2.5, 1.2, 2.3],
      interval: [
        [2, 3],
        [1, 2],
        [1, 3],
      ],
      ranks: 3,
      format: (v) => v.toFixed(2),
    })
    expect(l.rows.map((r) => r.index)).toEqual([1, 2, 0])
    expect(l.x(1)).toBeLessThan(l.x(3))
    expect(l.rows[0]!.lo).toBe(l.x(1))
    expect(l.ticks).toEqual([1, 2, 3])
  })
})
