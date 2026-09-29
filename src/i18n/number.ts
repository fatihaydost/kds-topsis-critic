import type { Lang } from './lang'

const BCP47: Record<Lang, string> = { en: 'en-US', tr: 'tr-TR' }

const cache = new Map<string, Intl.NumberFormat>()

/** Cached Intl.NumberFormat with a fixed number of decimals. */
export function numberFormatter(lang: Lang, decimals: number, grouping = true): Intl.NumberFormat {
  const key = `${lang}|${decimals}|${grouping ? 1 : 0}`
  let f = cache.get(key)
  if (!f) {
    f = new Intl.NumberFormat(BCP47[lang], {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: grouping,
    })
    cache.set(key, f)
  }
  return f
}

/**
 * Formats a number for display. `decimals` fixes the digits after the separator (weights and
 * scores use 4). `null`, `undefined` and non-finite values return '' so the caller decides what
 * an empty cell shows.
 */
export function formatNumber(
  value: number | null | undefined,
  lang: Lang,
  decimals: number,
  opts: { grouping?: boolean } = {},
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return ''
  // Avoid "-0,0000" for tiny negatives that round to zero.
  const rounded = Number(value.toFixed(decimals))
  return numberFormatter(lang, decimals, opts.grouping ?? true).format(rounded === 0 ? 0 : value)
}

/**
 * Formats a raw input value "as entered": shortest round-trip digits, locale decimal separator,
 * no grouping (so the text can be edited and parsed back unchanged).
 */
export function formatRaw(value: number | null | undefined, lang: Lang): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return ''
  const s = String(value)
  return lang === 'tr' ? s.replace('.', ',') : s
}

const GROUP_CHAR: Record<Lang, '.' | ','> = { en: ',', tr: '.' }

/** Unicode spaces that locales use as thousands separators (space, NBSP, narrow NBSP, thin space). */
const SPACES = /[\s   ]/g

/**
 * Parses a number typed or pasted in either convention. Accepts `0,25`, `0.25`, `1.234,5`,
 * `1,234.5`, `1 234,5`, `-3,5`, `−3.5` (Unicode minus), `1e-3`, `1,5e3`, `.5`, `,5`.
 * Returns null when the text is not one number.
 *
 * Rules, in order:
 * 1. Both `.` and `,` present: the one that comes last is the decimal separator; the other must
 *    group digits in threes (`1.234,5`, `1,234.5`). Anything else is rejected.
 * 2. One kind, repeated: it is a thousands separator with groups of three (`1.234.567`).
 * 3. One separator, exactly three digits after it, and 1 to 3 digits before it that do not start
 *    with 0 (`1,234`, `12.500`): ambiguous. It is read as grouping when it is the active locale's
 *    grouping character (TR `.`, EN `,`), otherwise as the decimal separator. `0,250` is never
 *    ambiguous. See `isAmbiguousNumber` to warn about it.
 * 4. Otherwise a single separator is the decimal separator.
 */
export function parseLocaleNumber(input: string, lang: Lang = 'en'): number | null {
  let s = input.replace(SPACES, '').replace(/−/g, '-')
  if (s === '') return null

  let sign = ''
  if (s[0] === '-' || s[0] === '+') {
    sign = s[0] === '-' ? '-' : ''
    s = s.slice(1)
  }

  let exp = ''
  const e = s.search(/e/i)
  if (e !== -1) {
    exp = s.slice(e + 1)
    s = s.slice(0, e)
    if (!/^[+-]?\d+$/.test(exp)) return null
  }

  if (!/^[\d.,]+$/.test(s) || !/\d/.test(s)) return null

  const dots = count(s, '.')
  const commas = count(s, ',')
  let intPart: string
  let fracPart = ''

  if (dots > 0 && commas > 0) {
    const decimal = s.lastIndexOf('.') > s.lastIndexOf(',') ? '.' : ','
    const group = decimal === '.' ? ',' : '.'
    if (count(s, decimal) !== 1) return null
    const [whole, frac] = s.split(decimal) as [string, string]
    if (!validGrouping(whole, group)) return null
    intPart = whole.split(group).join('')
    fracPart = frac
  } else if (dots + commas > 1) {
    const group = dots > 0 ? '.' : ','
    if (!validGrouping(s, group)) return null
    intPart = s.split(group).join('')
  } else if (dots + commas === 1) {
    const sep = dots === 1 ? '.' : ','
    const [whole, frac] = s.split(sep) as [string, string]
    const ambiguous = exp === '' && /^[1-9]\d{0,2}$/.test(whole) && /^\d{3}$/.test(frac)
    if (ambiguous && sep === GROUP_CHAR[lang]) {
      intPart = whole + frac
    } else {
      intPart = whole
      fracPart = frac
    }
  } else {
    intPart = s
  }

  if (intPart === '' && fracPart === '') return null
  const text = `${sign}${intPart || '0'}${fracPart ? `.${fracPart}` : ''}${exp ? `e${exp}` : ''}`
  const n = Number(text)
  return Number.isFinite(n) ? n : null
}

/**
 * True when `input` reads differently in TR and EN (`1,234`, `12.500`): one separator, three
 * digits after it, a short integer part without a leading zero, no exponent.
 */
export function isAmbiguousNumber(input: string): boolean {
  const s = input.replace(SPACES, '').replace(/−/g, '-').replace(/^[+-]/, '')
  return /^[1-9]\d{0,2}[.,]\d{3}$/.test(s)
}

function count(s: string, ch: string): number {
  let c = 0
  for (const x of s) if (x === ch) c++
  return c
}

/** `1.234.567` style: first group 1 to 3 digits, then groups of exactly 3. */
function validGrouping(s: string, group: string): boolean {
  const parts = s.split(group)
  if (parts.length === 1) return /^\d+$/.test(s)
  return /^\d{1,3}$/.test(parts[0]!) && parts.slice(1).every((p) => /^\d{3}$/.test(p))
}
