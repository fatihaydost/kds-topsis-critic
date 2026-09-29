// Number parsing and formatting shared by the importers and the copy helpers.

export type DecimalSeparator = '.' | ','

/** Spaces used as thousands separators (regular, no-break, narrow no-break, thin) and apostrophes. */
const GROUP_NOISE = /[\s   ']/g
const MINUS = /[−‒–]/g

const PATTERNS: Record<DecimalSeparator, RegExp> = {
  // Optional sign, integer part with optional valid 3-digit groups, optional fraction and exponent.
  '.': /^[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)?(?:\.\d+)?(?:[eE][+-]?\d+)?$/,
  ',': /^[+-]?(?:\d{1,3}(?:\.\d{3})+|\d+)?(?:,\d+)?(?:[eE][+-]?\d+)?$/,
}

function clean(text: string): string {
  return text.trim().replace(GROUP_NOISE, '').replace(MINUS, '-')
}

/**
 * Parses a number written with the given decimal separator. The other separator is accepted
 * only as a thousands separator in valid 3-digit groups ("1.234,5" with ',', "1,234.5" with '.').
 * Returns null for anything that is not a complete number: never 0 for text or empty input.
 */
export function parseNumber(text: string, decimal: DecimalSeparator): number | null {
  const s = clean(text)
  if (!/\d/.test(s) || !PATTERNS[decimal].test(s)) return null
  const group = decimal === '.' ? ',' : '.'
  const normalized = s.split(group).join('').replace(decimal, '.')
  const x = Number(normalized)
  return Number.isFinite(x) ? x : null
}

export type DecimalGuess = {
  decimal: DecimalSeparator
  /** True when no sample decided the separator and at least one was readable both ways ("1.234"). */
  ambiguous: boolean
  /** True when samples voted for both separators; the majority wins. */
  conflict: boolean
}

/**
 * Guesses the decimal separator from text samples. A sample decides only when it cannot be a
 * thousands-grouped integer: "0,25", "12,5", "1.234,5" vote ',' and "0.25", "1,234.5" vote '.'.
 * "1.234" and "1,234" stay undecided. `fallback` is used when nothing decides.
 */
export function detectDecimal(samples: Iterable<string>, fallback: DecimalSeparator = '.'): DecimalGuess {
  let dot = 0
  let comma = 0
  let undecided = 0
  for (const raw of samples) {
    const s = clean(raw).replace(/^[+-]/, '').replace(/[eE][+-]?\d+$/, '')
    if (!/^[\d.,]+$/.test(s) || !/\d/.test(s)) continue
    const hasDot = s.includes('.')
    const hasComma = s.includes(',')
    if (hasDot && hasComma) {
      // The separator that comes last is the decimal one, if the grouping before it is valid.
      if (/^\d{1,3}(?:\.\d{3})+,\d+$/.test(s)) comma++
      else if (/^\d{1,3}(?:,\d{3})+\.\d+$/.test(s)) dot++
      continue
    }
    if (!hasDot && !hasComma) continue
    const sep = hasDot ? '.' : ','
    const parts = s.split(sep)
    const groupedInteger = parts.length >= 2 && /^\d{1,3}$/.test(parts[0]!) && parts.slice(1).every((p) => /^\d{3}$/.test(p))
    // "0,500" is never a grouped integer: grouping does not start with a lone 0.
    if (groupedInteger && parts[0] !== '0') {
      undecided++
      continue
    }
    if (parts.length === 2 && /^\d*$/.test(parts[0]!) && /^\d+$/.test(parts[1]!)) {
      if (sep === '.') dot++
      else comma++
    }
  }
  if (dot === 0 && comma === 0) return { decimal: fallback, ambiguous: undecided > 0, conflict: false }
  return { decimal: comma > dot ? ',' : '.', ambiguous: false, conflict: dot > 0 && comma > 0 }
}

/**
 * Formats a number for copy or export. `digits` fixes the decimals; without it the shortest
 * round-trip form is used. Negative zero prints as zero. Non-finite values print as ''.
 */
export function formatNumber(x: number, decimal: DecimalSeparator = '.', digits?: number): string {
  if (!Number.isFinite(x)) return ''
  let s = digits === undefined ? String(x) : x.toFixed(digits)
  if (/^-0(?:\.0*)?$/.test(s)) s = s.slice(1)
  return decimal === ',' ? s.replace('.', ',') : s
}
