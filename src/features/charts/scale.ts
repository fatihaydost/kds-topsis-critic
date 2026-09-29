/** Pure scale helpers for the hand-written SVG charts. No DOM. */

export type Domain = [number, number]

export type LinearScale = {
  (value: number): number
  domain: Domain
  range: Domain
  invert: (px: number) => number
  ticks: (count?: number) => number[]
}

const E10 = Math.sqrt(50)
const E5 = Math.sqrt(10)
const E2 = Math.sqrt(2)

/** Step of about `count` ticks between start and stop: 1, 2 or 5 times a power of ten. */
export function tickStep(start: number, stop: number, count: number): number {
  const span = Math.abs(stop - start)
  if (!(span > 0) || !(count > 0) || !Number.isFinite(span)) return 0
  const raw = span / count
  let step = 10 ** Math.floor(Math.log10(raw))
  const error = raw / step
  if (error >= E10) step *= 10
  else if (error >= E5) step *= 5
  else if (error >= E2) step *= 2
  return stop < start ? -step : step
}

/** Decimals needed to print multiples of `step` exactly (0.25 is not a tick step; 0.2 and 0.05 are). */
export function stepDecimals(step: number): number {
  const a = Math.abs(step)
  if (!(a > 0) || !Number.isFinite(a)) return 0
  return Math.max(0, -Math.floor(Math.log10(a) + 1e-9))
}

const round = (v: number, decimals: number): number => {
  const r = Number(v.toFixed(decimals))
  return r === 0 ? 0 : r // no -0
}

/** "Nice" tick values inside [min, max], about `count` of them, without float noise (0.30000000000000004). */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return []
  if (min === max) return [round(min, 12)]
  const lo = Math.min(min, max)
  const hi = Math.max(min, max)
  const step = tickStep(lo, hi, count)
  if (step === 0) return [lo]
  const decimals = stepDecimals(step)
  const first = Math.ceil(lo / step - 1e-9)
  const last = Math.floor(hi / step + 1e-9)
  const out: number[] = []
  for (let k = first; k <= last; k++) out.push(round(k * step, decimals))
  return min > max ? out.reverse() : out
}

/** Extends [min, max] outwards to tick steps, so an axis starts and ends on a round number. */
export function niceDomain(min: number, max: number, count = 5): Domain {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) return [min, max]
  let lo = Math.min(min, max)
  let hi = Math.max(min, max)
  let prev = 0
  for (let k = 0; k < 10; k++) {
    const step = tickStep(lo, hi, count)
    if (step === prev || step === 0) break
    const decimals = stepDecimals(step)
    lo = round(Math.floor(lo / step + 1e-9) * step, decimals)
    hi = round(Math.ceil(hi / step - 1e-9) * step, decimals)
    prev = step
  }
  return min > max ? [hi, lo] : [lo, hi]
}

/** Min and max of the finite values, or null when there are none. */
export function extent(values: Iterable<number | null | undefined>): Domain | null {
  let lo = Infinity
  let hi = -Infinity
  for (const v of values) {
    if (typeof v !== 'number' || !Number.isFinite(v)) continue
    if (v < lo) lo = v
    if (v > hi) hi = v
  }
  return lo <= hi ? [lo, hi] : null
}

/** Linear map from `domain` to `range`. A zero-width domain maps everything to the range middle. */
export function scaleLinear(domain: Domain, range: Domain): LinearScale {
  const [d0, d1] = domain
  const [r0, r1] = range
  const span = d1 - d0
  const f = ((v: number) => (span === 0 ? (r0 + r1) / 2 : r0 + ((v - d0) / span) * (r1 - r0))) as LinearScale
  f.domain = [d0, d1]
  f.range = [r0, r1]
  f.invert = (px: number) => (r1 === r0 ? d0 : d0 + ((px - r0) / (r1 - r0)) * span)
  f.ticks = (count = 5) => niceTicks(d0, d1, count)
  return f
}

/** Clamps `v` to [0, 1] after mapping `domain` onto it. */
export function normalize(v: number, domain: Domain): number {
  const [d0, d1] = domain
  if (d1 === d0) return 0
  return Math.min(1, Math.max(0, (v - d0) / (d1 - d0)))
}

export type BandScale = {
  /** Distance between the starts of two neighbouring bands. */
  step: number
  /** Width of one band. */
  bandwidth: number
  /** Start of band `i`. */
  start: (i: number) => number
  /** Centre of band `i`. */
  center: (i: number) => number
}

/**
 * Splits `range` into `count` equal bands. `paddingInner` is the gap between bands and
 * `paddingOuter` the space before the first and after the last, both as fractions of the step.
 */
export function scaleBand(
  count: number,
  range: Domain,
  { paddingInner = 0.2, paddingOuter = 0.1 }: { paddingInner?: number; paddingOuter?: number } = {},
): BandScale {
  const [r0, r1] = range
  const n = Math.max(0, Math.floor(count))
  const inner = Math.min(Math.max(paddingInner, 0), 1)
  const outer = Math.max(paddingOuter, 0)
  const step = n === 0 ? 0 : (r1 - r0) / Math.max(1, n - inner + outer * 2)
  const bandwidth = step * (1 - inner)
  const offset = r0 + step * outer
  return {
    step,
    bandwidth,
    start: (i) => offset + i * step,
    center: (i) => offset + i * step + bandwidth / 2,
  }
}
