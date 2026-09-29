import { describe, expect, it } from 'vitest'
import { barOrder, estimateTextWidth, heatColor, layoutBars, layoutHeatmap, truncate } from './layout'
import { extent, niceDomain, niceTicks, normalize, scaleBand, scaleLinear, stepDecimals, tickStep } from './scale'

describe('ticks', () => {
  it('picks 1, 2 or 5 times a power of ten', () => {
    expect(tickStep(0, 1, 5)).toBe(0.2)
    expect(tickStep(0, 10, 5)).toBe(2)
    expect(tickStep(0, 100, 10)).toBe(10)
    expect(tickStep(0, 0.37, 5)).toBe(0.1)
    expect(tickStep(0, 0.37, 10)).toBe(0.05)
    expect(tickStep(0, 0, 5)).toBe(0)
  })

  it('makes ticks without float noise', () => {
    expect(niceTicks(0, 1, 5)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1])
    expect(niceTicks(0, 0.3, 3)).toEqual([0, 0.1, 0.2, 0.3])
    expect(niceTicks(-1, 1, 4)).toEqual([-1, -0.5, 0, 0.5, 1])
    expect(niceTicks(0.013, 0.087, 4)).toEqual([0.02, 0.04, 0.06, 0.08])
    expect(niceTicks(3, 3)).toEqual([3])
    expect(niceTicks(0, Number.NaN)).toEqual([])
  })

  it('has no negative zero', () => {
    expect(Object.is(niceTicks(-0.4, 0.4, 4)[2], 0)).toBe(true)
  })

  it('counts decimals of a step', () => {
    expect(stepDecimals(1)).toBe(0)
    expect(stepDecimals(0.2)).toBe(1)
    expect(stepDecimals(0.05)).toBe(2)
    expect(stepDecimals(1000)).toBe(0)
  })

  it('extends a domain to round ends', () => {
    expect(niceDomain(0.013, 0.087, 5)).toEqual([0, 0.1])
    expect(niceDomain(0.013, 0.087, 10)).toEqual([0.01, 0.09])
    expect(niceDomain(-0.73, 0.41, 5)).toEqual([-0.8, 0.6])
    expect(niceDomain(12, 96, 5)).toEqual([0, 100])
    expect(niceDomain(2, 2)).toEqual([2, 2])
  })
})

describe('linear scale', () => {
  it('maps and inverts', () => {
    const x = scaleLinear([0, 10], [100, 200])
    expect(x(0)).toBe(100)
    expect(x(5)).toBe(150)
    expect(x(-5)).toBe(50)
    expect(x.invert(175)).toBe(7.5)
    expect(x.ticks(5)).toEqual([0, 2, 4, 6, 8, 10])
  })

  it('maps a reversed range and a zero-width domain', () => {
    expect(scaleLinear([0, 1], [100, 0])(0.25)).toBe(75)
    expect(scaleLinear([3, 3], [0, 100])(3)).toBe(50)
  })

  it('normalizes with clamping and finds the extent', () => {
    expect(normalize(5, [0, 10])).toBe(0.5)
    expect(normalize(20, [0, 10])).toBe(1)
    expect(normalize(-1, [0, 10])).toBe(0)
    expect(extent([3, null, -1, Number.NaN, 7])).toEqual([-1, 7])
    expect(extent([])).toBeNull()
  })
})

describe('band scale', () => {
  it('splits the range into equal bands with padding', () => {
    const b = scaleBand(4, [0, 100], { paddingInner: 0, paddingOuter: 0 })
    expect(b.step).toBe(25)
    expect(b.bandwidth).toBe(25)
    expect(b.start(2)).toBe(50)
    expect(b.center(0)).toBe(12.5)

    const p = scaleBand(2, [0, 100], { paddingInner: 0.5, paddingOuter: 0.25 })
    // 2 bands - 0.5 inner + 2 * 0.25 outer = 2 steps
    expect(p.step).toBe(50)
    expect(p.bandwidth).toBe(25)
    expect(p.start(0)).toBe(12.5)
    expect(p.start(1)).toBe(62.5)
  })

  it('handles no bands', () => {
    expect(scaleBand(0, [0, 100]).bandwidth).toBe(0)
  })
})

describe('bar layout', () => {
  const format = (v: number) => v.toFixed(2)

  it('sorts by value with stable ties, or keeps input order', () => {
    expect(barOrder([0.2, 0.5, 0.2, 0.9], 'desc')).toEqual([3, 1, 0, 2])
    expect(barOrder([0.2, 0.5, 0.2, 0.9], 'asc')).toEqual([0, 2, 1, 3])
    expect(barOrder([0.2, 0.5], 'none')).toEqual([0, 1])
  })

  it('draws positive bars from the zero line with labels after the end', () => {
    const l = layoutBars({ labels: ['A', 'B'], values: [1, 0.5], width: 400, format, sort: 'desc', highlight: 1 })
    const [a, b] = l.rows
    expect(a!.index).toBe(0)
    expect(a!.x).toBe(l.zeroX)
    expect(a!.width).toBeGreaterThan(b!.width)
    expect(b!.width).toBeCloseTo(a!.width / 2, 6)
    expect(a!.textX).toBeGreaterThan(a!.x + a!.width)
    expect(a!.anchor).toBe('start')
    expect(b!.highlight).toBe(true)
    expect(a!.highlight).toBe(false)
    expect(l.hasNegative).toBe(false)
    expect(l.height).toBe(2 * l.rowStep)
    expect(a!.x + a!.width + 4 + estimateTextWidth('1.00', 13)).toBeLessThanOrEqual(400)
  })

  it('grows negative bars to the left with the label before the bar', () => {
    const l = layoutBars({ labels: ['A', 'B'], values: [-1, 1], width: 400, format })
    const [neg, pos] = l.rows
    expect(l.hasNegative).toBe(true)
    expect(neg!.x + neg!.width).toBeCloseTo(l.zeroX, 6)
    expect(pos!.x).toBeCloseTo(l.zeroX, 6)
    expect(neg!.anchor).toBe('end')
    expect(neg!.textX).toBeLessThan(neg!.x)
    expect(neg!.textX - estimateTextWidth('-1.00', 13)).toBeGreaterThanOrEqual(l.labelWidth - 1)
  })

  it('handles all-zero and non-finite values', () => {
    const l = layoutBars({ labels: ['A', 'B'], values: [0, Number.NaN], width: 300, format })
    expect(l.rows.map((r) => r.width)).toEqual([0, 0])
    expect(l.rows[1]!.text).toBe('')
  })

  it('truncates long labels to the label column', () => {
    const long = 'A very long alternative name that does not fit'
    const l = layoutBars({ labels: [long], values: [1], width: 200, format })
    expect(l.labelWidth).toBeLessThanOrEqual(80)
    expect(l.rows[0]!.shortLabel.endsWith('…')).toBe(true)
    expect(estimateTextWidth(l.rows[0]!.shortLabel, 13)).toBeLessThanOrEqual(l.labelWidth)
    expect(truncate('short', 200, 13)).toBe('short')
  })
})

describe('heatmap', () => {
  it('lays out cells within bounds', () => {
    const l = layoutHeatmap({ rowLabels: ['C1', 'C2'], colLabels: ['C1', 'C2'], width: 400 })
    expect(l.cellWidth).toBeLessThanOrEqual(96)
    expect(l.width).toBe(l.labelWidth + 2 * l.cellWidth)
    expect(l.height).toBe(l.headerHeight + 2 * l.cellHeight)
    const narrow = layoutHeatmap({ rowLabels: ['a'], colLabels: Array.from({ length: 20 }, (_, j) => `C${j}`), width: 320 })
    expect(narrow.cellWidth).toBe(44)
    expect(narrow.width).toBeGreaterThan(320) // scrolls inside the figure
  })

  it('numbers the columns of a square matrix whose names do not fit, with the rows as the legend', () => {
    const names = ['Price', 'Screen size', 'Pixel density', 'Thickness', 'Mass']
    const l = layoutHeatmap({ rowLabels: names, colLabels: names, width: 420 })
    expect(l.numbered).toBe(true)
    expect(l.colLabels).toEqual(['1', '2', '3', '4', '5'])
    expect(l.rowLabels[0]).toBe('1 Price')
    // The numbered names fit whole when there is room (review P2-4: "3 Pixel den…" at 1440).
    for (const width of [408, 420, 560, 720]) {
      const w = layoutHeatmap({ rowLabels: names, colLabels: names, width })
      expect(w.rowLabels, String(width)).toEqual(names.map((n, i) => (w.numbered ? `${i + 1} ${n}` : n)))
      expect([...w.rowLabels, ...w.colLabels].some((l) => l.endsWith('…')), String(width)).toBe(false)
      expect(w.cellWidth).toBeGreaterThanOrEqual(44)
      expect(w.width).toBeLessThanOrEqual(width)
    }
    // On a phone the cells keep their minimum and long names are cut (the full name is the tooltip).
    const phone = layoutHeatmap({ rowLabels: names, colLabels: names, width: 300 })
    expect(phone.cellWidth).toBe(44)
    const wide = layoutHeatmap({ rowLabels: ['A', 'B'], colLabels: ['A', 'B'], width: 420 })
    expect(wide.numbered).toBe(false)
    expect(wide.colLabels).toEqual(['A', 'B'])
  })

  it('mixes sequential colours from the heat tokens', () => {
    expect(heatColor(0, 'sequential').fill).toBe('var(--data-heat-0)')
    expect(heatColor(1, 'sequential').fill).toBe('var(--data-heat-1)')
    expect(heatColor(0.25, 'sequential')).toEqual({
      fill: 'color-mix(in oklch, var(--data-heat-1) 25%, var(--data-heat-0))',
      tone: 'pos',
      level: 3,
    })
    expect(heatColor(5, 'sequential', [0, 10]).level).toBe(5)
    expect(heatColor(null, 'sequential').fill).toBe('var(--surface-2)')
  })

  it('diverges around zero with the negative arm in OKLab', () => {
    expect(heatColor(0, 'diverging').fill).toBe('var(--data-heat-0)')
    expect(heatColor(-1, 'diverging')).toEqual({ fill: 'var(--data-negative)', tone: 'neg', level: 10 })
    expect(heatColor(-0.5, 'diverging').fill).toBe('color-mix(in oklab, var(--data-negative) 50%, var(--data-heat-0))')
    expect(heatColor(0.8, 'diverging')).toEqual({
      fill: 'color-mix(in oklch, var(--data-heat-1) 80%, var(--data-heat-0))',
      tone: 'pos',
      level: 8,
    })
    expect(heatColor(2, 'diverging').level).toBe(10) // clamped
  })

  it('never emits a raw colour', () => {
    for (const v of [-1, -0.3, 0, 0.3, 1, null]) {
      for (const sc of ['sequential', 'diverging'] as const) {
        expect(heatColor(v, sc).fill).not.toMatch(/#|rgb|hsl|oklch\(/)
      }
    }
  })
})
