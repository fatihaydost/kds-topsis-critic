import { describe, expect, it } from 'vitest'
import en from './robustness.en.json'
import tr from './robustness.tr.json'

type Tree = { [k: string]: string | Tree }

function flatten(tree: Tree, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(tree)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (typeof v === 'string') out[key] = v
    else Object.assign(out, flatten(v, key))
  }
  return out
}

const flatEn = flatten(en as Tree)
const flatTr = flatten(tr as Tree)

/** The Robustness stage's own namespace (loaded with its chunk) follows the rules of tests/i18n.test.ts. */
describe('robustness texts', () => {
  it('have the same keys and variables in EN and TR', () => {
    expect(Object.keys(flatTr).sort()).toEqual(Object.keys(flatEn).sort())
    const vars = (s: string) => [...s.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]).sort()
    for (const key of Object.keys(flatEn)) expect(vars(flatTr[key]!), key).toEqual(vars(flatEn[key]!))
  })

  it('follow the copy rules: no em or en dash, no emoji, no empty strings, no buzzwords', () => {
    const banned = /\b(unlock|seamless|powerful|elevate|revolutioni[sz]e|supercharge|effortless)/i
    for (const [lang, flat] of [['en', flatEn], ['tr', flatTr]] as const) {
      for (const [key, s] of Object.entries(flat)) {
        expect(s, `${lang}:${key} has a dash`).not.toMatch(/[–—]/)
        expect(s, `${lang}:${key} has an emoji`).not.toMatch(/\p{Extended_Pictographic}/u)
        expect(s.trim(), `${lang}:${key} is empty`).not.toBe('')
        expect(s, `${lang}:${key}`).not.toMatch(banned)
      }
    }
  })

  it('keep every section to a title and one sentence', () => {
    for (const flat of [flatEn, flatTr]) {
      for (const part of ['sweep', 'perturb', 'monteCarlo', 'removal']) {
        const lead = flat[`${part}.lead`]!
        expect(lead.split(/[.?!]\s+\S/).length, `${part}.lead`).toBe(1)
      }
    }
  })
})
