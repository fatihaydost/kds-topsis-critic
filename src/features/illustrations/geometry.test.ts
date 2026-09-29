import { describe, expect, it } from 'vitest'
import { critic } from '../../core/methods/critic'
import { topsis } from '../../core/methods/topsis'
import type { Problem } from '../../core/types'
import { getExample } from '../../data/examples'
import {
  argMax,
  criticParts,
  defaultAxes,
  fitPlot,
  flowIndex,
  planarDistance,
  segmentTransform,
  TOPSIS_FLOW,
  topsisProjection,
} from './geometry'

const problemOf = (id: string): Problem => {
  const x = getExample(id)
  if (!x) throw new Error(id)
  return { alternatives: [...x.alternatives], criteria: x.criteria.map((c) => ({ name: c.name.en, type: c.type })), matrix: x.matrix.map((r) => [...r]) }
}

const vec = (steps: { key: string; vector?: number[] }[], key: string) => steps.find((s) => s.key === key)!.vector!

describe('defaultAxes', () => {
  it('takes the two largest weights in criterion order', () => {
    expect(defaultAxes([0.1, 0.4, 0.2, 0.3])).toEqual([1, 3])
    expect(defaultAxes([0.5, 0.5])).toEqual([0, 1])
  })
  it('breaks ties by the lower index', () => {
    expect(defaultAxes([0.25, 0.25, 0.25, 0.25])).toEqual([0, 1])
  })
})

describe('topsisProjection', () => {
  it('reproduces the core ideal, anti-ideal and closeness on a two-criterion problem (Opricovic and Tzeng 2004, f)', () => {
    const p = problemOf('opricovic-tzeng-2004-f')
    const w = [0.5, 0.5]
    const proj = topsisProjection(p, w)!
    const core = topsis.compute(p, w, {})
    expect(proj.exact).toBe(true)
    expect(proj.axes).toEqual([0, 1])
    const best = vec(core.steps, 'topsis.idealBest')
    const worst = vec(core.steps, 'topsis.idealWorst')
    expect(proj.ideal).toEqual({ x: best[0], y: best[1] })
    expect(proj.antiIdeal).toEqual({ x: worst[0], y: worst[1] })
    expect(proj.closeness).toEqual(core.scores)

    // With two criteria the plane is the whole space: the drawn distances are the core's.
    proj.points.forEach((pt, i) => {
      const dp = planarDistance(pt, proj.ideal)
      const dm = planarDistance(pt, proj.antiIdeal)
      expect(dp).toBeCloseTo(proj.dPlus[i]!, 12)
      expect(dm).toBeCloseTo(proj.dMinus[i]!, 12)
      expect(dm / (dp + dm)).toBeCloseTo(core.scores[i]!, 12)
    })
    // Published: C = 0.762, 0.722, 0.238.
    expect(proj.closeness.map((c) => Number(c.toFixed(3)))).toEqual([0.762, 0.722, 0.238])
  })

  it('projects the core ideal onto the two heaviest criteria when there are more', () => {
    const p = problemOf('krishnan-2021-smartphones')
    const w = critic.compute(p, {}).weights
    const proj = topsisProjection(p, w)!
    const core = topsis.compute(p, w, {})
    expect(proj.exact).toBe(false)
    expect(proj.axes).toEqual(defaultAxes(w))
    const [a, b] = proj.axes
    expect(proj.ideal.x).toBe(vec(core.steps, 'topsis.idealBest')[a])
    expect(proj.ideal.y).toBe(vec(core.steps, 'topsis.idealBest')[b])
    expect(proj.antiIdeal.x).toBe(vec(core.steps, 'topsis.idealWorst')[a])
    expect(proj.closeness).toEqual(core.scores)
    expect(proj.dPlus).toEqual(vec(core.steps, 'topsis.distanceBest'))
  })

  it('returns null when TOPSIS cannot run', () => {
    const p = problemOf('opricovic-tzeng-2004-f')
    expect(topsisProjection(p, [0.5])).toBeNull()
    expect(topsisProjection({ ...p, criteria: [p.criteria[0]!], matrix: p.matrix.map((r) => [r[0]!]) }, [1])).toBeNull()
  })
})

describe('fitPlot', () => {
  const margin = { left: 10, right: 10, top: 10, bottom: 10 }
  for (const id of ['opricovic-tzeng-2004-f', 'opricovic-tzeng-2004-phi']) {
    it(`puts the ideal right and up, also on a cost axis, with one scale on both axes (${id})`, () => {
      const proj = topsisProjection(problemOf(id), [0.5, 0.5])!
      const { x, y, box } = fitPlot(proj, 400, { margin, minPlotHeight: 60, maxPlotHeight: 200 })
      // Risk is a cost criterion: its ideal is the smallest value, drawn on the right anyway.
      expect(proj.ideal.x).toBeLessThan(proj.antiIdeal.x)
      expect(x(proj.ideal.x)).toBeGreaterThan(x(proj.antiIdeal.x))
      expect(y(proj.ideal.y)).toBeLessThan(y(proj.antiIdeal.y))
      for (const pt of [...proj.points, proj.ideal, proj.antiIdeal]) {
        expect(x(pt.x)).toBeGreaterThanOrEqual(box.left)
        expect(x(pt.x)).toBeLessThanOrEqual(box.right)
        expect(y(pt.y)).toBeGreaterThanOrEqual(box.top)
        expect(y(pt.y)).toBeLessThanOrEqual(box.bottom)
      }
      // Same pixels per unit on both axes: screen distance = planar distance times k.
      const k = Math.abs(x(1) - x(0))
      expect(Math.abs(y(1) - y(0))).toBeCloseTo(k, 9)
      const a = proj.points[0]!
      expect(Math.hypot(x(a.x) - x(proj.ideal.x), y(a.y) - y(proj.ideal.y))).toBeCloseTo(planarDistance(a, proj.ideal) * k, 9)
    })
  }
})

describe('segmentTransform', () => {
  it('gives length and angle of a segment', () => {
    expect(segmentTransform({ x: 0, y: 0 }, { x: 3, y: 4 }, 0)).toEqual({ x: 0, y: 0, angle: (Math.atan2(4, 3) * 180) / Math.PI, length: 5 })
    expect(segmentTransform({ x: 5, y: 5 }, { x: 0, y: 5 }, 0).angle).toBe(180)
    expect(segmentTransform({ x: 5, y: -0 }, { x: 0, y: 0 }, 0).angle).toBe(180)
  })
  it('keeps the fallback angle for a zero-length segment', () => {
    expect(segmentTransform({ x: 1, y: 1 }, { x: 1, y: 1 }, 135)).toMatchObject({ angle: 135, length: 0 })
  })
})

describe('criticParts', () => {
  it('reads sigma, conflict and weights from the core (Krishnan et al. 2021)', () => {
    const p = problemOf('krishnan-2021-smartphones')
    const parts = criticParts(p)!
    const core = critic.compute(p, {})
    expect(parts.weights).toEqual(core.weights)
    expect(parts.sigma).toEqual(vec(core.steps, 'critic.sigma'))
    expect(parts.conflict).toEqual(vec(core.steps, 'critic.conflict'))
    parts.information.forEach((c, j) => expect(c).toBeCloseTo(parts.sigma[j]! * parts.conflict[j]!, 12))
    expect(parts.sigma.map((s) => Number(s.toFixed(4)))).toEqual([0.4062, 0.4147, 0.4394, 0.4161, 0.4063])
    expect(parts.weights.map((s) => Number(s.toFixed(4)))).toEqual([0.1872, 0.1838, 0.1691, 0.2599, 0.2])
    expect(argMax(parts.weights)).toBe(3)
  })
})

describe('flowIndex', () => {
  it('finds the node of a core step key', () => {
    expect(flowIndex(TOPSIS_FLOW, 'topsis.idealWorst')).toBe(2)
    expect(flowIndex(TOPSIS_FLOW, 'topsis.closeness')).toBe(4)
    expect(flowIndex(TOPSIS_FLOW, 'nope')).toBe(-1)
    expect(flowIndex(TOPSIS_FLOW, undefined)).toBe(-1)
  })
})
