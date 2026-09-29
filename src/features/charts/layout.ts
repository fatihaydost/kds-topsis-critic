/**
 * Pure geometry for the charts: text width estimates, bar rows and heatmap cells. No DOM, so the
 * layout can be tested and the SVG components only draw.
 */
import { normalize, scaleLinear, type Domain } from './scale'

/** Rough width of `text` in IBM Plex Sans at `fontSize` px (average glyph ~0.56 em, digits 0.6 em). */
export function estimateTextWidth(text: string, fontSize: number): number {
  let w = 0
  for (const ch of text) w += /[0-9]/.test(ch) ? 0.6 : /[ .,:;'|il]/.test(ch) ? 0.3 : /[MWmw@%]/.test(ch) ? 0.85 : 0.56
  return w * fontSize
}

/** Cuts `text` with an ellipsis so it fits `maxWidth`. */
export function truncate(text: string, maxWidth: number, fontSize: number): string {
  if (estimateTextWidth(text, fontSize) <= maxWidth) return text
  const chars = [...text]
  while (chars.length > 1 && estimateTextWidth(`${chars.join('')}…`, fontSize) > maxWidth) chars.pop()
  return chars.length > 0 && maxWidth > fontSize ? `${chars.join('').trimEnd()}…` : ''
}

// ---------------------------------------------------------------------------------------------
// Bar chart
// ---------------------------------------------------------------------------------------------

export type BarSort = 'desc' | 'asc' | 'none'

/** Display order of the values: indices sorted by value (ties keep input order), or input order. */
export function barOrder(values: readonly number[], sort: BarSort): number[] {
  const idx = values.map((_, i) => i)
  if (sort === 'none') return idx
  const key = (i: number) => {
    const v = values[i]!
    return Number.isFinite(v) ? v : sort === 'desc' ? -Infinity : Infinity
  }
  return idx.sort((a, b) => (sort === 'desc' ? key(b) - key(a) : key(a) - key(b)) || a - b)
}

export type BarRow = {
  /** Index into the input arrays. */
  index: number
  label: string
  /** Label cut to fit the label column. */
  shortLabel: string
  value: number
  text: string
  y: number
  /** Left edge and width of the bar (0 width for a zero or non-finite value). */
  x: number
  width: number
  /** Value label position and anchor: after the bar end, on the side the bar grows to. */
  textX: number
  anchor: 'start' | 'end'
  highlight: boolean
}

export type BarLayout = {
  width: number
  height: number
  labelWidth: number
  zeroX: number
  rowStep: number
  barHeight: number
  /** Whether there is a negative value (the zero line then sits inside the plot). */
  hasNegative: boolean
  rows: BarRow[]
}

export type BarLayoutInput = {
  labels: readonly string[]
  values: readonly number[]
  width: number
  format: (value: number) => string
  sort?: BarSort
  highlight?: number | undefined
  /** Fixed value domain; defaults to [min(0, values), max(0, values)]. */
  domain?: Domain | undefined
  fontSize?: number
  rowStep?: number
  barHeight?: number
}

const GAP = 8
const VALUE_GAP = 4

export function layoutBars({
  labels,
  values,
  width,
  format,
  sort = 'none',
  highlight,
  domain,
  fontSize = 13,
  rowStep = 28,
  barHeight = 16,
}: BarLayoutInput): BarLayout {
  const finite = values.filter((v) => Number.isFinite(v))
  const lo = domain ? domain[0] : Math.min(0, ...finite)
  const hi = domain ? domain[1] : Math.max(0, ...finite)
  const d: Domain = lo === hi ? [lo, lo + 1] : [lo, hi]
  const hasNegative = d[0] < 0
  const hasPositive = d[1] > 0

  const texts = values.map((v) => (Number.isFinite(v) ? format(v) : ''))
  const maxLabel = Math.max(0, ...labels.map((l) => estimateTextWidth(l, fontSize)))
  const labelWidth = Math.ceil(Math.min(maxLabel + GAP * 2, Math.max(width * 0.4, 48)))
  const valueWidth = Math.ceil(Math.max(0, ...texts.map((t) => estimateTextWidth(t, fontSize))) + VALUE_GAP + 2)
  const plotLeft = labelWidth + (hasNegative ? valueWidth : 0)
  const plotRight = Math.max(plotLeft + 1, width - (hasPositive ? valueWidth : 0))
  const x = scaleLinear(d, [plotLeft, plotRight])
  const zeroX = x(Math.min(Math.max(0, d[0]), d[1]))

  const order = barOrder(values, sort)
  const rows = order.map((index, k): BarRow => {
    const value = values[index]!
    const ok = Number.isFinite(value)
    const end = ok ? x(value) : zeroX
    const negative = ok && value < 0
    return {
      index,
      label: labels[index] ?? '',
      shortLabel: truncate(labels[index] ?? '', labelWidth - GAP * 2, fontSize),
      value,
      text: texts[index]!,
      y: k * rowStep,
      x: Math.min(zeroX, end),
      width: Math.abs(end - zeroX),
      textX: negative ? end - VALUE_GAP : end + VALUE_GAP,
      anchor: negative ? 'end' : 'start',
      highlight: highlight === index,
    }
  })

  return { width, height: rows.length * rowStep, labelWidth, zeroX, rowStep, barHeight, hasNegative, rows }
}

// ---------------------------------------------------------------------------------------------
// Heatmap
// ---------------------------------------------------------------------------------------------

export type HeatmapLayoutInput = {
  rowLabels: readonly string[]
  colLabels: readonly string[]
  width: number
  fontSize?: number
  cellHeight?: number
  minCellWidth?: number
  maxCellWidth?: number
}

export type HeatmapLayout = {
  /** Drawn width; wider than the container when the cells hit their minimum width. */
  width: number
  height: number
  labelWidth: number
  headerHeight: number
  cellWidth: number
  cellHeight: number
  rowLabels: string[]
  colLabels: string[]
}

export function layoutHeatmap({
  rowLabels,
  colLabels,
  width,
  fontSize = 12,
  cellHeight = 28,
  minCellWidth = 44,
  maxCellWidth = 96,
}: HeatmapLayoutInput): HeatmapLayout {
  const cols = Math.max(colLabels.length, 1)
  const maxLabel = Math.max(0, ...rowLabels.map((l) => estimateTextWidth(l, fontSize)))
  const labelWidth = Math.ceil(Math.min(maxLabel + GAP * 2, Math.max(width * 0.3, 64)))
  const cellWidth = Math.floor(Math.min(maxCellWidth, Math.max(minCellWidth, (width - labelWidth) / cols)))
  const headerHeight = 24
  return {
    width: labelWidth + cellWidth * colLabels.length,
    height: headerHeight + cellHeight * rowLabels.length,
    labelWidth,
    headerHeight,
    cellWidth,
    cellHeight,
    rowLabels: rowLabels.map((l) => truncate(l, labelWidth - GAP * 2, fontSize)),
    colLabels: colLabels.map((l) => truncate(l, cellWidth - 6, fontSize)),
  }
}

export type HeatScale = 'sequential' | 'diverging'

export type HeatColor = {
  /** CSS colour for the cell: a token or a `color-mix()` of tokens. */
  fill: string
  /** Which arm of the ramp the value is on. */
  tone: 'pos' | 'neg' | 'none'
  /** Intensity 0..10; the stylesheet picks the value text colour from it per theme. */
  level: number
}

const pct = (t: number) => `${Math.round(t * 1000) / 10}%`

/**
 * Cell colour from the data colour tokens.
 * - sequential: `--data-heat-0` to `--data-heat-1` over `domain` (default 0..1), mixed in OKLCH;
 * - diverging: `--data-negative` <- `--data-heat-0` (at 0) -> `--data-heat-1` over `domain`
 *   (default -1..1). The negative arm mixes in OKLab: the neutral end is almost achromatic, and an
 *   OKLCH mix from hue 218 to hue 27 would swing through purple on the way.
 */
export function heatColor(value: number | null | undefined, scale: HeatScale, domain?: Domain): HeatColor {
  if (typeof value !== 'number' || !Number.isFinite(value)) return { fill: 'var(--surface-2)', tone: 'none', level: 0 }
  if (scale === 'sequential') {
    const t = normalize(value, domain ?? [0, 1])
    return { fill: mix('--data-heat-1', t, 'oklch'), tone: t > 0 ? 'pos' : 'none', level: Math.round(t * 10) }
  }
  const [lo, hi] = domain ?? [-1, 1]
  const mid = lo < 0 && hi > 0 ? 0 : (lo + hi) / 2
  if (value >= mid) {
    const t = hi === mid ? 0 : Math.min(1, (value - mid) / (hi - mid))
    return { fill: mix('--data-heat-1', t, 'oklch'), tone: t > 0 ? 'pos' : 'none', level: Math.round(t * 10) }
  }
  const t = lo === mid ? 0 : Math.min(1, (mid - value) / (mid - lo))
  return { fill: mix('--data-negative', t, 'oklab'), tone: 'neg', level: Math.round(t * 10) }
}

function mix(token: string, t: number, space: 'oklch' | 'oklab'): string {
  if (t <= 0) return 'var(--data-heat-0)'
  if (t >= 1) return `var(${token})`
  return `color-mix(in ${space}, var(${token}) ${pct(t)}, var(--data-heat-0))`
}
