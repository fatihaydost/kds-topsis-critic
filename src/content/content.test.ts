import { readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import katex from 'katex'
import { describe, expect, it } from 'vitest'
import { critic as criticCore } from '../core/methods/critic'
import { topsis as topsisCore } from '../core/methods/topsis'
import { listMethods } from '../core/registry'
import type { Problem } from '../core/types'
import {
  coMentionTable,
  decisionTree,
  pipelines,
  rankingRequirements,
  riskyCombinations,
  robustnessTechniques,
  weightingRequirements,
} from './guide'
import * as guide from './guide'
import { allMethods, isMethodId, methodContent } from './methods'
import { STEP_KEYS, stepContent } from './steps'
import { localizeMethod, type LocalizedText, type MethodContent } from './types'

const here = dirname(fileURLToPath(import.meta.url))

/** Every string reachable from a value, with its path. */
function strings(value: unknown, path = ''): { path: string; text: string }[] {
  if (typeof value === 'string') return [{ path, text: value }]
  if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${path}[${i}]`))
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k))
  return []
}

/** Every TeX source in the content layer. */
function allTex(): { path: string; tex: string }[] {
  const out: { path: string; tex: string }[] = []
  for (const m of allMethods) m.steps.forEach((s, i) => out.push({ path: `${m.id}.steps[${i}]`, tex: s.tex }))
  for (const k of STEP_KEYS) out.push({ path: `steps.${k}`, tex: stepContent[k].tex })
  for (const r of robustnessTechniques) r.tex.forEach((t, i) => out.push({ path: `guide.${r.id}[${i}]`, tex: t }))
  return out
}

const EM_DASH = '—'
const EN_DASH = '–'
const EMOJI = /\p{Extended_Pictographic}/u
const BUZZWORDS = /\b(unlock|seamless(ly)?|powerful|güçlü|kolayca)\b/iu

const problem: Problem = {
  alternatives: ['A', 'B', 'C', 'D', 'E'],
  criteria: [
    { name: 'c1', type: 'cost' },
    { name: 'c2', type: 'benefit' },
    { name: 'c3', type: 'benefit' },
  ],
  matrix: [
    [649, 4.7, 326],
    [749, 5.5, 401],
    [740, 5.7, 520],
    [400, 5.7, 520],
    [600, 5.5, 538],
  ],
}

describe('method content', () => {
  it('has 26 methods with unique ids', () => {
    expect(allMethods).toHaveLength(26)
    expect(new Set(allMethods.map((m) => m.id)).size).toBe(26)
    for (const [key, m] of Object.entries(methodContent)) expect(m.id).toBe(key)
  })

  it('has one file per method, named after its id', () => {
    const files = readdirSync(join(here, 'methods'))
      .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
      .map((f) => f.replace(/\.ts$/, ''))
      .sort()
    expect(files).toEqual(allMethods.map((m) => m.id).sort())
  })

  it('marks exactly the methods in the core registry as available', () => {
    const available = allMethods.filter((m) => m.status === 'available').map((m) => m.id).sort()
    const registry = listMethods().map((m) => m.id).sort()
    expect(available).toEqual(registry)
    expect(available).toEqual(['critic', 'equal', 'topsis'])
  })

  it('gives each registry method the matching kind of family', () => {
    for (const core of listMethods()) {
      const m = methodContent[core.id as keyof typeof methodContent]
      expect(m, core.id).toBeDefined()
      expect(m.family.startsWith(core.kind), core.id).toBe(true)
    }
  })

  describe.each(allMethods.map((m) => [m.id, m] as const))('%s', (_id, m: MethodContent) => {
    it.each(['en', 'tr'] as const)('is filled in %s', (lang) => {
      const t: LocalizedText = m[lang]
      expect(t.summary.trim().length).toBeGreaterThan(40)
      const sentences = t.summary.split(/(?<=[.?!])\s+(?=[A-ZÇĞİÖŞÜ"])/u).filter(Boolean)
      expect(sentences.length, `summary sentences: ${t.summary}`).toBeGreaterThanOrEqual(2)
      expect(sentences.length, `summary sentences: ${t.summary}`).toBeLessThanOrEqual(4)
      for (const key of ['whenToUse', 'whenNot', 'inputs', 'pitfalls'] as const) {
        expect(t[key].length, key).toBeGreaterThan(0)
        for (const s of t[key]) expect(s.trim(), key).not.toBe('')
      }
      expect(m.name[lang].trim()).not.toBe('')
      expect(m.fullName[lang].trim()).not.toBe('')
      for (const s of m.steps) {
        expect(s.title[lang].trim()).not.toBe('')
        if (s.note) expect(s.note[lang].trim()).not.toBe('')
      }
      for (const c of m.combinedWith) expect(c.text[lang].trim()).not.toBe('')
      expect(m.reference.note[lang].trim()).not.toBe('')
      if (m.origin.note) expect(m.origin.note[lang].trim()).not.toBe('')
    })

    it('has steps, sources and a well-formed origin', () => {
      expect(m.steps.length).toBeGreaterThan(0)
      expect(m.sources.length).toBeGreaterThan(0)
      expect(m.year).toBe(m.origin.year)
      expect(m.origin.authors.trim()).not.toBe('')
      for (const doi of [m.origin.doi, m.reference.doi, ...m.sources.map((s) => s.doi)]) {
        if (doi !== undefined) expect(doi).toMatch(/^10\.\d{4,9}\/\S+$/)
      }
    })

    it('links only to methods that exist', () => {
      for (const c of m.combinedWith) if (c.methodId) expect(isMethodId(c.methodId), c.methodId).toBe(true)
    })

    it('flattens to one language', () => {
      const v = localizeMethod(m, 'tr')
      expect(v.summary).toBe(m.tr.summary)
      expect(v.steps.map((s) => s.tex)).toEqual(m.steps.map((s) => s.tex))
    })
  })
})

describe('step content', () => {
  it('covers exactly the step keys the core emits', () => {
    const emitted = [
      ...criticCore.compute(problem, {}).steps.map((s) => s.key),
      ...topsisCore.compute(problem, [0.4, 0.3, 0.3], {}).steps.map((s) => s.key),
    ]
    expect([...STEP_KEYS].sort()).toEqual([...emitted].sort())
  })

  it('has both languages for every key', () => {
    for (const k of STEP_KEYS) {
      expect(stepContent[k].en.trim(), k).not.toBe('')
      expect(stepContent[k].tr.trim(), k).not.toBe('')
    }
  })
})

describe('guide', () => {
  const nodeIds = new Set(decisionTree.nodes.map((n) => n.id))

  it('references only existing methods', () => {
    const ids = [
      ...pipelines.flatMap((p) => [p.weighting, p.ranking]),
      ...coMentionTable.rows,
      ...coMentionTable.columns.flatMap((c) => c.methodIds),
      ...rankingRequirements.flatMap((r) => r.methodIds),
      ...weightingRequirements.map((r) => r.methodId),
      ...riskyCombinations.flatMap((r) => r.methodIds),
      ...decisionTree.nodes.flatMap((n) => n.options.flatMap((o) => o.recommend?.methodIds ?? [])),
    ]
    for (const id of ids) expect(isMethodId(id), id).toBe(true)
  })

  it('has a consistent co-mention table', () => {
    expect(coMentionTable.counts).toHaveLength(coMentionTable.rows.length)
    for (const row of coMentionTable.counts) expect(row).toHaveLength(coMentionTable.columns.length)
  })

  it('pairs every pipeline with a weighting and a ranking method', () => {
    for (const p of pipelines) {
      expect(methodContent[p.weighting].family.startsWith('weighting'), p.id).toBe(true)
      expect(methodContent[p.ranking].family.startsWith('ranking'), p.id).toBe(true)
    }
    expect(pipelines.filter((p) => p.tier === 'top')).toHaveLength(5)
  })

  it('covers every ranking method in the compatibility table', () => {
    const covered = new Set(rankingRequirements.flatMap((r) => r.methodIds))
    for (const m of allMethods.filter((x) => x.family.startsWith('ranking'))) expect(covered.has(m.id), m.id).toBe(true)
  })

  it('marks the dispersion-counted-twice item as analysis', () => {
    const item = riskyCombinations.find((r) => r.id === 'dispersion-twice')
    expect(item?.basis).toBe('analysis')
  })

  it('has a decision tree whose links resolve, without cycles, ending in recommendations', () => {
    expect(nodeIds.has(decisionTree.start)).toBe(true)
    expect(nodeIds.size).toBe(decisionTree.nodes.length)
    for (const n of decisionTree.nodes) {
      expect(n.options.length, n.id).toBeGreaterThanOrEqual(2)
      for (const o of n.options) {
        if (o.next) expect(nodeIds.has(o.next), `${n.id}.${o.id} -> ${o.next}`).toBe(true)
        else expect(o.recommend, `${n.id}.${o.id} is a dead end`).toBeDefined()
        if (o.recommend) expect(o.recommend.methodIds.length).toBeGreaterThan(0)
      }
    }
    // Every node reachable, every path finite, and every full path picks a ranking method.
    const reached = new Set<string>()
    const walk = (id: string, seen: string[], picked: string[]): void => {
      expect(seen.includes(id), `cycle at ${[...seen, id].join(' > ')}`).toBe(false)
      reached.add(id)
      const node = decisionTree.nodes.find((n) => n.id === id)!
      for (const o of node.options) {
        const got = [...picked, ...(o.recommend?.methodIds ?? [])]
        if (o.next) walk(o.next, [...seen, id], got)
        else expect(got.some((m) => methodContent[m as keyof typeof methodContent].family.startsWith('ranking')), `${id}.${o.id}`).toBe(true)
      }
    }
    walk(decisionTree.start, [], [])
    expect([...reached].sort()).toEqual([...nodeIds].sort())
  })
})

describe('copy rules', () => {
  const visible = [
    ...strings(methodContent, 'methods'),
    ...strings(stepContent, 'steps').filter((s) => !s.path.endsWith('.tex')),
    ...strings(guide, 'guide'),
  ]

  it('has no em dash or en dash anywhere, TeX included', () => {
    for (const { path, text } of visible) {
      expect(text.includes(EM_DASH), `em dash in ${path}`).toBe(false)
      expect(text.includes(EN_DASH), `en dash in ${path}`).toBe(false)
    }
    for (const { path, tex } of allTex()) expect(/--/.test(tex), `TeX dash in ${path}`).toBe(false)
  })

  it('has no emoji', () => {
    for (const { path, text } of visible) expect(EMOJI.test(text), `emoji in ${path}`).toBe(false)
  })

  it('avoids the banned buzzwords', () => {
    for (const { path, text } of visible) expect(BUZZWORDS.test(text), `buzzword in ${path}: ${text}`).toBe(false)
  })

  it('keeps words out of TeX so formulas are language-neutral', () => {
    for (const { path, tex } of allTex()) expect(/\\text\{[^}]*[A-Za-z]{2,}/.test(tex), `words in TeX at ${path}`).toBe(false)
  })
})

describe('TeX', () => {
  it.each(allTex().map((t) => [t.path, t.tex] as const))('%s compiles with KaTeX', (_path, tex) => {
    expect(() => katex.renderToString(tex, { displayMode: true, throwOnError: true, strict: 'ignore' })).not.toThrow()
  })
})
