import { describe, expect, it } from 'vitest'
import { formatNumber, formatRaw, isAmbiguousNumber, parseLocaleNumber } from '../src/i18n/number'

describe('parseLocaleNumber: unambiguous input reads the same in TR and EN', () => {
  const cases: [string, number][] = [
    ['0,25', 0.25],
    ['0.25', 0.25],
    ['1.234,5', 1234.5],
    ['1,234.5', 1234.5],
    ['1.234.567', 1234567],
    ['1,234,567', 1234567],
    ['1.234.567,891', 1234567.891],
    ['1,234,567.891', 1234567.891],
    ['1 234,5', 1234.5],
    ['1 234,5', 1234.5],
    ['1 234.5', 1234.5],
    ['12,5', 12.5],
    ['1,2345', 1.2345],
    ['0,250', 0.25],
    ['0.250', 0.25],
    ['1234,567', 1234.567],
    ['-3,5', -3.5],
    ['−3.5', -3.5],
    ['+2', 2],
    ['  7  ', 7],
    ['42', 42],
    ['.5', 0.5],
    [',5', 0.5],
    ['5.', 5],
    ['1e-3', 0.001],
    ['1,5e3', 1500],
    ['2.5E+2', 250],
    ['0', 0],
    ['-0,0001', -0.0001],
  ]
  for (const lang of ['en', 'tr'] as const) {
    for (const [input, expected] of cases) {
      it(`${lang}: ${JSON.stringify(input)} -> ${expected}`, () => {
        expect(parseLocaleNumber(input, lang)).toBeCloseTo(expected, 12)
      })
    }
  }
})

describe('parseLocaleNumber: ambiguous `1,234` / `1.234` uses the active locale', () => {
  it('EN reads a comma as grouping and a dot as decimal', () => {
    expect(parseLocaleNumber('1,234', 'en')).toBe(1234)
    expect(parseLocaleNumber('1.234', 'en')).toBe(1.234)
    expect(parseLocaleNumber('12,500', 'en')).toBe(12500)
  })
  it('TR reads a dot as grouping and a comma as decimal', () => {
    expect(parseLocaleNumber('1.234', 'tr')).toBe(1234)
    expect(parseLocaleNumber('1,234', 'tr')).toBe(1.234)
    expect(parseLocaleNumber('12.500', 'tr')).toBe(12500)
  })
  it('flags exactly those inputs as ambiguous', () => {
    for (const s of ['1,234', '1.234', '12,500', '999.999', '-1,234']) expect(isAmbiguousNumber(s), s).toBe(true)
    for (const s of ['0,250', '1,2345', '1234,567', '1,23', '1.234,5', '1,234.5', '1.234.567', '12', '1,5e3'])
      expect(isAmbiguousNumber(s), s).toBe(false)
  })
})

describe('parseLocaleNumber: rejects text that is not one number', () => {
  const bad = ['', '   ', 'abc', '1,2,3', '1.23,4', '12.34.5', '1,234.567,8', '1.234,56.7', '1..2', '--1', '1e', 'e5', '1e2.5', 'Infinity', 'NaN', '1/2', '12a', '0x10', '.', ',', '1.2.3,4', '1 2e']
  for (const lang of ['en', 'tr'] as const) {
    for (const s of bad) it(`${lang}: ${JSON.stringify(s)} -> null`, () => expect(parseLocaleNumber(s, lang)).toBeNull())
  }
})

describe('formatNumber', () => {
  it('uses the locale separator and fixed decimals', () => {
    expect(formatNumber(0.18718, 'en', 4)).toBe('0.1872')
    expect(formatNumber(0.18718, 'tr', 4)).toBe('0,1872')
    expect(formatNumber(0.2, 'tr', 4)).toBe('0,2000')
    expect(formatNumber(1234.5, 'en', 1)).toBe('1,234.5')
    expect(formatNumber(1234.5, 'tr', 1)).toBe('1.234,5')
  })
  it('never prints negative zero', () => {
    expect(formatNumber(-0.00001, 'en', 4)).toBe('0.0000')
    expect(formatNumber(-0.00001, 'tr', 4)).toBe('0,0000')
  })
  it('returns an empty string for missing values', () => {
    expect(formatNumber(null, 'en', 4)).toBe('')
    expect(formatNumber(undefined, 'en', 4)).toBe('')
    expect(formatNumber(Number.NaN, 'tr', 4)).toBe('')
  })
})

describe('formatRaw round-trips through parseLocaleNumber', () => {
  for (const v of [0.25, 1.234, 1234.5, 649, 4.7, -3.25, 1e-7, 1234567.891, 0]) {
    for (const lang of ['en', 'tr'] as const) {
      it(`${lang}: ${v}`, () => expect(parseLocaleNumber(formatRaw(v, lang), lang)).toBe(v))
    }
  }
})
