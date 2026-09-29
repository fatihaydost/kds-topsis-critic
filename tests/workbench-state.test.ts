import { describe, expect, it } from 'vitest'
import { examples, getExample, shortCitation } from '../src/data/examples'
import { computeRanking, computeValidation, computeWeights, useWorkbench, type DraftProblem } from '../src/state/workbench'
import { expectClose } from './helpers'
import critic2021 from './fixtures/critic-krishnan2021.json'
import f from './fixtures/opricovic-tzeng-2004-f.json'
import phi from './fixtures/opricovic-tzeng-2004-phi.json'

const draftOf = (id: string): DraftProblem => {
  const ex = getExample(id)!
  return {
    alternatives: ex.alternatives,
    criteria: ex.criteria.map((c) => ({ name: c.name.en, type: c.type })),
    matrix: ex.matrix,
  }
}

describe('examples match the published fixtures', () => {
  it('Krishnan et al. 2021', () => {
    const ex = getExample('krishnan-2021-smartphones')!
    expect(ex.matrix).toEqual(critic2021.matrix)
    expect(ex.criteria.map((c) => c.type)).toEqual(critic2021.types)
  })
  for (const [id, fx] of [['opricovic-tzeng-2004-f', f], ['opricovic-tzeng-2004-phi', phi]] as const) {
    it(id, () => {
      const ex = getExample(id)!
      expect(ex.matrix).toEqual(fx.matrix)
      expect(ex.weights).toEqual(fx.weights)
      expect(ex.criteria.map((c) => c.type)).toEqual(fx.types)
    })
  }
  it('every example has a DOI and a table reference', () => {
    for (const ex of examples) {
      expect(ex.citation.doi).toMatch(/^10\.\d{4,}\//)
      expect(ex.citation.tables).not.toBe('')
      expect(ex.matrix.length).toBe(ex.alternatives.length)
      for (const row of ex.matrix) expect(row.length).toBe(ex.criteria.length)
    }
  })
  it('short citations', () => {
    expect(shortCitation(getExample('krishnan-2021-smartphones')!.citation, 'en')).toBe('Krishnan et al. (2021)')
    expect(shortCitation(getExample('krishnan-2021-smartphones')!.citation, 'tr')).toBe('Krishnan vd. (2021)')
    expect(shortCitation(getExample('opricovic-tzeng-2004-f')!.citation, 'tr')).toBe('Opricovic ve Tzeng (2004)')
  })
})

describe('derived results', () => {
  it('CRITIC weights reproduce Krishnan et al. 2021 Table 5', () => {
    const w = computeWeights({ problem: draftOf('krishnan-2021-smartphones'), weightMethod: 'critic', manualWeights: [] })
    expect(w.value).not.toBeNull()
    expectClose(w.value!.weights, critic2021.expected.weights, critic2021.expected.tolerance)
  })

  it('manual weights + TOPSIS reproduce Opricovic and Tzeng 2004 Table 3', () => {
    const data = { problem: draftOf('opricovic-tzeng-2004-f'), weightMethod: 'manual' as const, manualWeights: [0.5, 0.5], rankingMethod: 'topsis' as const }
    const r = computeRanking(data)
    expectClose(r.value!.scores, f.expected.closeness, f.expected.tolerance)
    expect(r.value!.ranking).toEqual(f.expected.ranking)
  })

  it('equal weights are 1/n', () => {
    const w = computeWeights({ problem: draftOf('krishnan-2021-smartphones'), weightMethod: 'equal', manualWeights: [] })
    expect(w.value!.weights).toEqual([0.2, 0.2, 0.2, 0.2, 0.2])
  })

  it('an empty cell blocks weights and ranking with its position', () => {
    const p = draftOf('krishnan-2021-smartphones')
    const matrix = p.matrix.map((r) => [...r]) as (number | null)[][]
    matrix[1]![2] = null
    const draft = { ...p, matrix }
    expect(computeValidation(draft)).toContainEqual({ code: 'invalid-cell', severity: 'error', row: 1, col: 2 })
    const w = computeWeights({ problem: draft, weightMethod: 'critic', manualWeights: [] })
    expect(w.value).toBeNull()
    const r = computeRanking({ problem: draft, weightMethod: 'critic', manualWeights: [], rankingMethod: 'topsis' })
    expect(r.value).toBeNull()
    expect(r.issues.filter((x) => x.code === 'invalid-cell')).toHaveLength(1)
  })

  it('manual weights that do not sum to 1 block the ranking', () => {
    const r = computeRanking({ problem: draftOf('opricovic-tzeng-2004-f'), weightMethod: 'manual', manualWeights: [0.5, 0.45], rankingMethod: 'topsis' })
    expect(r.value).toBeNull()
    expect(r.issues.map((x) => x.code)).toContain('weights-sum')
  })

  it('a missing manual weight is reported, not read as 0', () => {
    const w = computeWeights({ problem: draftOf('opricovic-tzeng-2004-f'), weightMethod: 'manual', manualWeights: [0.5, null] })
    expect(w.value).toBeNull()
    expect(w.issues).toContainEqual({ code: 'invalid-weight', severity: 'error', col: 1 })
  })
})

describe('store actions', () => {
  it('loadExample sets the problem, names in the language and the published weights', () => {
    useWorkbench.getState().loadExample('opricovic-tzeng-2004-f', 'tr')
    const s = useWorkbench.getState()
    expect(s.exampleId).toBe('opricovic-tzeng-2004-f')
    expect(s.problem.criteria[0]!.name).toBe('Risk (1 ile 5 arası)')
    expect(s.weightMethod).toBe('manual')
    expect(s.manualWeights).toEqual([0.5, 0.5])
  })

  it('editing a cell clears the example; adding and removing keep shapes consistent', () => {
    const st = useWorkbench.getState()
    st.setCell(0, 0, 2)
    expect(useWorkbench.getState().exampleId).toBeNull()
    st.addCriterion({ name: 'C3', type: 'benefit' })
    let s = useWorkbench.getState()
    expect(s.problem.matrix.every((r) => r.length === 3)).toBe(true)
    expect(s.manualWeights).toEqual([0.5, 0.5, null])
    st.removeCriterion(0)
    s = useWorkbench.getState()
    expect(s.problem.criteria.map((c) => c.name)).toEqual(['Yükseklik (deniz seviyesinden m)', 'C3'])
    expect(s.manualWeights).toEqual([0.5, null])
    st.addAlternative('A4')
    st.removeAlternative(0)
    s = useWorkbench.getState()
    expect(s.problem.alternatives).toEqual(['A2', 'A3', 'A4'])
    expect(s.problem.matrix).toEqual([
      [3750, null],
      [4500, null],
      [null, null],
    ])
  })

  it('startBlank and reset', () => {
    useWorkbench.getState().startBlank(2, 4)
    const s = useWorkbench.getState()
    expect(s.problem.matrix).toEqual([
      [null, null, null, null],
      [null, null, null, null],
    ])
    expect(s.problem.criteria.map((c) => c.name)).toEqual(['C1', 'C2', 'C3', 'C4'])
    useWorkbench.getState().reset()
    expect(useWorkbench.getState().problem.alternatives).toEqual([])
  })
})
