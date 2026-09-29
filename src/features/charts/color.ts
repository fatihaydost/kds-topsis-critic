/**
 * Colour maths for the heatmap: OKLCH / OKLab mixing like CSS `color-mix()`, sRGB conversion and
 * WCAG contrast. Pure, no DOM, so the text colour of every cell can be chosen by measured
 * contrast and tested in both themes (tests sweep the whole ramp).
 */

export type Oklch = { l: number; c: number; h: number }
type Oklab = { l: number; a: number; b: number }
export type Rgb = [number, number, number]

/** Parses `oklch(0.47 0.08 218)` (L as a number or a percentage). Null for anything else. */
export function parseOklch(text: string): Oklch | null {
  const m = /^\s*oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*[\d.%]+\s*)?\)\s*$/i.exec(text)
  if (!m) return null
  const l = Number(m[1]) / (m[2] ? 100 : 1)
  const c = Number(m[3])
  const h = Number(m[4])
  return [l, c, h].every(Number.isFinite) ? { l, c, h } : null
}

const toLab = ({ l, c, h }: Oklch): Oklab => {
  const r = (h * Math.PI) / 180
  return { l, a: c * Math.cos(r), b: c * Math.sin(r) }
}

/** `color-mix(in oklab, a p, b)`: straight interpolation of L, a and b. */
export function mixOklab(a: Oklch, b: Oklch, p: number): Oklab {
  const x = toLab(a)
  const y = toLab(b)
  return { l: x.l * p + y.l * (1 - p), a: x.a * p + y.a * (1 - p), b: x.b * p + y.b * (1 - p) }
}

/** `color-mix(in oklch, a p, b)`: L and C interpolate, hue takes the shorter arc. */
export function mixOklch(a: Oklch, b: Oklch, p: number): Oklab {
  let dh = a.h - b.h
  if (dh > 180) dh -= 360
  if (dh < -180) dh += 360
  const h = b.h + dh * p
  return toLab({ l: a.l * p + b.l * (1 - p), c: a.c * p + b.c * (1 - p), h })
}

/** OKLab to 8-bit sRGB (clipped to the gamut), as the screen shows it. */
export function labToRgb({ l, a, b }: Oklab): Rgb {
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  const lin = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ]
  const enc = (v: number) => {
    const x = Math.min(1, Math.max(0, v))
    return Math.round((x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055) * 255)
  }
  return [enc(lin[0]!), enc(lin[1]!), enc(lin[2]!)]
}

export const oklchToRgb = (c: Oklch): Rgb => labToRgb(toLab(c))

/** WCAG 2 relative luminance of an 8-bit sRGB colour. */
export function luminance([r, g, b]: Rgb): number {
  const f = (v: number) => {
    const x = v / 255
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

/** WCAG 2 contrast ratio, 1 to 21. */
export function contrast(x: Rgb, y: Rgb): number {
  const a = luminance(x)
  const b = luminance(y)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}
