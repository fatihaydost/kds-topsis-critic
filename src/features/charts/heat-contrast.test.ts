import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { contrast, labToRgb, mixOklab, mixOklch, oklchToRgb, parseOklch, type Oklch } from './color'
import { heatPaint, type HeatTokens } from './layout'

/** The token values of one theme block in tokens.css. */
function themeTokens(selector: string): HeatTokens {
  const css = readFileSync(new URL('../../styles/tokens.css', import.meta.url), 'utf8')
  const start = css.indexOf(`${selector} {`)
  const block = css.slice(start, css.indexOf('}', start))
  const get = (name: string): Oklch => {
    const m = new RegExp(`${name}:\\s*(oklch\\([^)]*\\))`).exec(block)
    const c = m ? parseOklch(m[1]!) : null
    if (!c) throw new Error(`${name} not found in ${selector}`)
    return c
  }
  return { heat0: get('--data-heat-0'), heat1: get('--data-heat-1'), negative: get('--data-negative'), text: get('--text'), bg: get('--bg') }
}

const themes = { light: themeTokens(':root'), dark: themeTokens(":root[data-theme='dark']") }

/** The colour a `color-mix()` fill string resolves to with these tokens, computed independently. */
function resolveFill(fill: string, k: HeatTokens): [number, number, number] {
  const byName: Record<string, Oklch> = { '--data-heat-0': k.heat0, '--data-heat-1': k.heat1, '--data-negative': k.negative }
  const plain = /^var\((--[\w-]+)\)$/.exec(fill)
  if (plain) return oklchToRgb(byName[plain[1]!]!)
  const m = /^color-mix\(in (oklab|oklch), var\((--[\w-]+)\) ([\d.]+)%, var\(--data-heat-0\)\)$/.exec(fill)
  if (!m) throw new Error(`unexpected fill ${fill}`)
  const p = Number(m[3]) / 100
  const end = byName[m[2]!]!
  return labToRgb(m[1] === 'oklab' ? mixOklab(end, k.heat0, p) : mixOklch(end, k.heat0, p))
}

describe('heatmap value text contrast', () => {
  for (const [name, k] of Object.entries(themes)) {
    it(`is at least 4.5:1 on every diverging cell from -1 to 1 (${name})`, () => {
      for (let i = -100; i <= 100; i++) {
        const v = i / 100
        const paint = heatPaint(v, 'diverging', undefined, k)
        const ink = oklchToRgb(paint.ink === 'text' ? k.text : k.bg)
        expect(contrast(resolveFill(paint.fill, k), ink), `${name} ${v}`).toBeGreaterThanOrEqual(4.5)
      }
    })

    it(`is at least 4.5:1 on every sequential cell from 0 to 1 (${name})`, () => {
      for (let i = 0; i <= 100; i++) {
        const paint = heatPaint(i / 100, 'sequential', undefined, k)
        const ink = oklchToRgb(paint.ink === 'text' ? k.text : k.bg)
        expect(contrast(resolveFill(paint.fill, k), ink), `${name} ${i / 100}`).toBeGreaterThanOrEqual(4.5)
      }
    })
  }

  it('fixes the cells the review measured (dark -0.68 at 3.76, light 0.85 at 4.50 and -0.93 at 4.57)', () => {
    expect(heatPaint(-0.68, 'diverging', undefined, themes.dark).contrast).toBeGreaterThanOrEqual(4.5)
    expect(heatPaint(0.85, 'diverging', undefined, themes.light).contrast).toBeGreaterThanOrEqual(4.5)
    expect(heatPaint(-0.93, 'diverging', undefined, themes.light).contrast).toBeGreaterThanOrEqual(4.5)
  })

  it('keeps the fill order: a larger |value| never gets a weaker fill on the same arm', () => {
    for (const k of Object.values(themes)) {
      let prev = -1
      for (let i = 0; i <= 100; i++) {
        const fill = heatPaint(i / 100, 'diverging', undefined, k).fill
        const share = fill === 'var(--data-heat-0)' ? 0 : fill === 'var(--data-heat-1)' ? 100 : Number(/([\d.]+)%/.exec(fill)![1])
        expect(share).toBeGreaterThanOrEqual(prev)
        prev = share
      }
    }
  })

  it('reads CSS oklch() values', () => {
    expect(parseOklch('oklch(0.47 0.08 218)')).toEqual({ l: 0.47, c: 0.08, h: 218 })
    expect(parseOklch(' oklch(47% 0.08 218deg) ')).toEqual({ l: 0.47, c: 0.08, h: 218 })
    expect(parseOklch('#fff')).toBeNull()
  })
})
