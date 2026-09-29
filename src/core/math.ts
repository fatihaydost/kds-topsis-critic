// Small numeric helpers. Callers pass validated, rectangular, finite matrices.

export const column = (matrix: number[][], j: number): number[] => matrix.map((row) => row[j]!)

export const sum = (xs: number[]): number => xs.reduce((a, b) => a + b, 0)

export const mean = (xs: number[]): number => sum(xs) / xs.length

/** Sample standard deviation (n - 1 denominator, Excel STDEV / STDEV.S). */
export function sampleStd(xs: number[]): number {
  if (xs.length < 2) return NaN
  const mu = mean(xs)
  return Math.sqrt(sum(xs.map((x) => (x - mu) ** 2)) / (xs.length - 1))
}

/** Pearson correlation; returns 0 when either series is constant (undefined correlation). */
export function pearson(xs: number[], ys: number[]): number {
  const mx = mean(xs)
  const my = mean(ys)
  let num = 0
  let sxx = 0
  let syy = 0
  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i]! - mx
    const dy = ys[i]! - my
    num += dx * dy
    sxx += dx * dx
    syy += dy * dy
  }
  const den = Math.sqrt(sxx * syy)
  return den === 0 ? 0 : num / den
}

export const zeros = (m: number, n: number): number[][] => Array.from({ length: m }, () => new Array<number>(n).fill(0))
