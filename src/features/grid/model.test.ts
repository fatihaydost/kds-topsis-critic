import { describe, expect, it } from 'vitest'
import { parseLocaleNumber } from '../../i18n/number'
import {
  applyPaste,
  canRedo,
  canUndo,
  cellText,
  clearRange,
  commandForKey,
  createHistory,
  deleteAlternative,
  deleteCriterion,
  detectDelimiter,
  detectHeaders,
  editCommandForKey,
  gridSize,
  insertAlternative,
  insertCriterion,
  move,
  parseClipboard,
  parseCriterionType,
  parseDelimited,
  pushHistory,
  rangeToTsv,
  redo,
  sameProblem,
  toGrid,
  setType,
  toggleType,
  undo,
  writeCell,
  type GridProblem,
} from './model'

const tr = (s: string) => parseLocaleNumber(s, 'tr')
const en = (s: string) => parseLocaleNumber(s, 'en')
const fmt = (n: number) => String(n)

const base = (): GridProblem => ({
  alternatives: ['A1', 'A2'],
  criteria: [
    { name: 'C1', type: 'benefit' },
    { name: 'C2', type: 'cost' },
  ],
  matrix: [
    [1, 2],
    [3, 4],
  ],
})

describe('navigation', () => {
  const size = { rows: 4, cols: 3 } // 2 alternatives, 2 criteria

  it('stops arrows, Home, End and Enter at the edges', () => {
    expect(move({ row: 0, col: 0 }, 'up', size)).toEqual({ row: 0, col: 0 })
    expect(move({ row: 0, col: 0 }, 'left', size)).toEqual({ row: 0, col: 0 })
    expect(move({ row: 3, col: 2 }, 'down', size)).toEqual({ row: 3, col: 2 })
    expect(move({ row: 3, col: 2 }, 'right', size)).toEqual({ row: 3, col: 2 })
    expect(move({ row: 3, col: 2 }, 'enter', size)).toEqual({ row: 3, col: 2 })
    expect(move({ row: 2, col: 1 }, 'home', size)).toEqual({ row: 2, col: 0 })
    expect(move({ row: 2, col: 1 }, 'end', size)).toEqual({ row: 2, col: 2 })
    expect(move({ row: 2, col: 1 }, 'grid-start', size)).toEqual({ row: 0, col: 0 })
    expect(move({ row: 2, col: 1 }, 'grid-end', size)).toEqual({ row: 3, col: 2 })
    expect(move({ row: 2, col: 1 }, 'page-down', size)).toEqual({ row: 3, col: 1 })
    expect(move({ row: 2, col: 1 }, 'shift-enter', size)).toEqual({ row: 1, col: 1 })
  })

  it('wraps Tab and Shift+Tab across rows and stays put at the ends', () => {
    expect(move({ row: 2, col: 2 }, 'tab', size)).toEqual({ row: 3, col: 0 })
    expect(move({ row: 3, col: 0 }, 'shift-tab', size)).toEqual({ row: 2, col: 2 })
    expect(move({ row: 3, col: 2 }, 'tab', size)).toEqual({ row: 3, col: 2 })
    expect(move({ row: 0, col: 0 }, 'shift-tab', size)).toEqual({ row: 0, col: 0 })
  })

  it('clamps a stale position after the grid shrank', () => {
    expect(move({ row: 9, col: 9 }, 'up', size)).toEqual({ row: 2, col: 2 })
  })
})

describe('keyboard commands', () => {
  it('maps navigation mode keys', () => {
    expect(commandForKey({ key: 'ArrowDown', shift: true }, 'value')).toEqual({ type: 'move', nav: 'down', extend: true })
    expect(commandForKey({ key: 'Tab', shift: true }, 'value')).toEqual({ type: 'move', nav: 'shift-tab', extend: false })
    expect(commandForKey({ key: 'Enter' }, 'value')).toEqual({ type: 'move', nav: 'enter', extend: false })
    expect(commandForKey({ key: '7' }, 'value')).toEqual({ type: 'edit', mode: 'replace', text: '7' })
    expect(commandForKey({ key: 'F2' }, 'alternative-name')).toEqual({ type: 'edit', mode: 'edit' })
    expect(commandForKey({ key: 'F2' }, 'corner')).toBeNull()
    expect(commandForKey({ key: 'x' }, 'corner')).toBeNull()
    expect(commandForKey({ key: 'Delete' }, 'value')).toEqual({ type: 'clear' })
    expect(commandForKey({ key: 'Backspace' }, 'value')).toEqual({ type: 'clear' })
    // A direction cell opens its menu; no single key flips it.
    for (const k of [{ key: ' ' }, { key: 'Enter' }, { key: 'F2' }, { key: 'ArrowDown', alt: true }]) {
      expect(commandForKey(k, 'criterion-type')).toEqual({ type: 'type-menu' })
    }
    expect(commandForKey({ key: 'Enter', shift: true }, 'criterion-type')).toEqual({ type: 'move', nav: 'shift-enter', extend: false })
    expect(commandForKey({ key: 'ArrowDown' }, 'criterion-type')).toEqual({ type: 'move', nav: 'down', extend: false })
    expect(commandForKey({ key: 'c' }, 'criterion-type')).toBeNull()
    expect(commandForKey({ key: ' ' }, 'value')).toEqual({ type: 'edit', mode: 'replace', text: ' ' })
    expect(commandForKey({ key: 'z', ctrl: true }, 'value')).toEqual({ type: 'undo' })
    expect(commandForKey({ key: 'Z', ctrl: true, shift: true }, 'value')).toEqual({ type: 'redo' })
    expect(commandForKey({ key: 'y', ctrl: true }, 'value')).toEqual({ type: 'redo' })
    expect(commandForKey({ key: 'c', ctrl: true }, 'value')).toBeNull()
    expect(commandForKey({ key: 'Home', ctrl: true }, 'value')).toEqual({ type: 'move', nav: 'grid-start', extend: false })
  })

  it('commits on arrows only in replace mode', () => {
    expect(editCommandForKey({ key: 'ArrowRight' }, 'replace')).toEqual({ type: 'commit', then: 'right' })
    expect(editCommandForKey({ key: 'ArrowRight' }, 'edit')).toBeNull()
    expect(editCommandForKey({ key: 'Enter', shift: true }, 'edit')).toEqual({ type: 'commit', then: 'shift-enter' })
    expect(editCommandForKey({ key: 'Tab' }, 'edit')).toEqual({ type: 'commit', then: 'tab' })
    expect(editCommandForKey({ key: 'Escape' }, 'replace')).toEqual({ type: 'cancel' })
  })
})

describe('cells', () => {
  it('writes values, names and types by cell kind', () => {
    const p = base()
    const v = writeCell(p, toGrid(0, 1), '0,25', tr)
    expect(v.ok).toBe(true)
    expect(v.problem.matrix[0]).toEqual([1, 0.25])
    expect(p.matrix[0]).toEqual([1, 2]) // not mutated

    expect(writeCell(p, toGrid(0, 0), '', tr).problem.matrix[0]![0]).toBeNull()
    const bad = writeCell(p, toGrid(0, 0), 'abc', tr)
    expect(bad.ok).toBe(false)
    expect(bad.problem).toBe(p)

    expect(writeCell(p, { row: 0, col: 1 }, '  Price ', tr).problem.criteria[0]!.name).toBe('Price')
    expect(writeCell(p, { row: 1, col: 1 }, 'maliyet', tr).problem.criteria[0]!.type).toBe('cost')
    expect(writeCell(p, { row: 2, col: 0 }, 'Supplier X', tr).problem.alternatives[0]).toBe('Supplier X')
    expect(writeCell(p, { row: 0, col: 0 }, 'x', tr).ok).toBe(false)
  })

  it('reads criterion types in both languages', () => {
    expect(parseCriterionType('Benefit')).toBe('benefit')
    expect(parseCriterionType('↓ Cost')).toBe('cost')
    expect(parseCriterionType('Fayda')).toBe('benefit')
    expect(parseCriterionType('min')).toBe('cost')
    expect(parseCriterionType('weight')).toBeNull()
  })

  it('shows cell text and toggles the type', () => {
    const p = base()
    expect(cellText(p, toGrid(1, 1), fmt)).toBe('4')
    expect(cellText(p, { row: 1, col: 2 }, fmt)).toBe('cost')
    expect(toggleType(p, 1).criteria[1]!.type).toBe('benefit')
    expect(setType(p, 1, 'benefit').criteria[1]!.type).toBe('benefit')
    expect(setType(p, 1, p.criteria[1]!.type)).toBe(p)
  })

  it('clears a range but keeps types', () => {
    const p = clearRange(base(), { top: 0, left: 1, bottom: 2, right: 2 })
    expect(p.criteria.map((c) => c.name)).toEqual(['', ''])
    expect(p.criteria.map((c) => c.type)).toEqual(['benefit', 'cost'])
    expect(p.matrix).toEqual([
      [null, null],
      [3, 4],
    ])
  })

  it('copies a range as TSV with quoted fields', () => {
    const p = writeCell(base(), { row: 2, col: 0 }, 'A "one"', tr).problem
    expect(rangeToTsv(p, { top: 2, left: 0, bottom: 3, right: 2 }, fmt)).toBe('"A ""one"""\t1\t2\nA2\t3\t4')
  })

  it('copies the whole grid without the type row so it pastes back as a named table', () => {
    const p = base()
    const tsv = rangeToTsv(p, { top: 0, left: 0, bottom: 3, right: 2 }, fmt)
    expect(tsv).toBe('\tC1\tC2\nA1\t1\t2\nA2\t3\t4')
    const back = applyPaste(p, { row: 0, col: 0 }, parseClipboard(tsv, en), en)
    expect(sameProblem(back.problem, p)).toBe(true)
  })
})

describe('rows and columns', () => {
  it('inserts and deletes alternatives and criteria', () => {
    const p = insertAlternative(base(), 1, 'New')
    expect(p.alternatives).toEqual(['A1', 'New', 'A2'])
    expect(p.matrix[1]).toEqual([null, null])
    expect(deleteAlternative(p, 1)).toEqual(base())

    const q = insertCriterion(base(), 2, 'C3')
    expect(q.criteria[2]).toEqual({ name: 'C3', type: 'benefit' })
    expect(q.matrix).toEqual([
      [1, 2, null],
      [3, 4, null],
    ])
    expect(deleteCriterion(q, 0).matrix).toEqual([
      [2, null],
      [4, null],
    ])
  })

  it('keeps at least one row and one column', () => {
    const one: GridProblem = { alternatives: ['A'], criteria: [{ name: 'C', type: 'benefit' }], matrix: [[1]] }
    expect(deleteAlternative(one, 0)).toBe(one)
    expect(deleteCriterion(one, 0)).toBe(one)
  })
})

describe('clipboard parsing', () => {
  it('parses an Excel TR block (tabs, comma decimals, grouping, CRLF, trailing newline)', () => {
    const text = '0,25\t1.234,5\r\n3\t-2,75\r\n'
    expect(detectDelimiter(text, tr)).toBe('\t')
    const cells = parseClipboard(text, tr)
    expect(cells).toEqual([
      ['0,25', '1.234,5'],
      ['3', '-2,75'],
    ])
    expect(cells.flat().map(tr)).toEqual([0.25, 1234.5, 3, -2.75])
  })

  it('parses an EN block', () => {
    const cells = parseClipboard('0.25\t1,234.5\n3\t4\n', en)
    expect(cells.flat().map(en)).toEqual([0.25, 1234.5, 3, 4])
  })

  it('parses semicolon CSV with comma decimals', () => {
    expect(parseClipboard('Price;Quality\n1,5;2\n', tr)).toEqual([
      ['Price', 'Quality'],
      ['1,5', '2'],
    ])
  })

  it('parses quoted CSV fields with commas, quotes and newlines', () => {
    const text = 'name,note\n"Smith, J.","said ""hi""\nthen left"\n'
    expect(detectDelimiter(text)).toBe(',')
    expect(parseDelimited(text, ',')).toEqual([
      ['name', 'note'],
      ['Smith, J.', 'said "hi"\nthen left'],
    ])
  })

  it('reads a column of TR decimals as one column, not comma CSV', () => {
    expect(detectDelimiter('0,25\n1,5\n', tr)).toBeNull()
    expect(parseClipboard('0,25\n1,5\n', tr)).toEqual([['0,25'], ['1,5']])
    expect(detectDelimiter('1,2\nx,y')).toBe(',')
  })

  it('keeps empty cells and returns nothing for empty text', () => {
    expect(parseDelimited('1\t\t3', '\t')).toEqual([['1', '', '3']])
    expect(parseDelimited('', '\t')).toEqual([])
  })
})

describe('header detection', () => {
  it('finds both header lines', () => {
    expect(detectHeaders([['', 'Price', 'Quality'], ['A', '1', '2'], ['B', '3', '4']], en)).toEqual({ row: true, col: true })
  })

  it('finds a header row only', () => {
    expect(detectHeaders([['Price', 'Quality'], ['1', '2'], ['3', '4']], en)).toEqual({ row: true, col: false })
  })

  it('finds a header column only', () => {
    expect(detectHeaders([['A', '1', '2'], ['B', '3', '4']], en)).toEqual({ row: false, col: true })
  })

  it('finds none in a numeric block, a single line, or all text', () => {
    expect(detectHeaders([['1', '2'], ['3', '4']], en)).toEqual({ row: false, col: false })
    expect(detectHeaders([['Price', 'Quality']], en)).toEqual({ row: false, col: false })
    expect(detectHeaders([['a', 'b'], ['c', 'd']], en)).toEqual({ row: false, col: false })
  })
})

describe('paste', () => {
  it('fills from the focused cell and grows the grid', () => {
    const res = applyPaste(base(), toGrid(1, 1), parseClipboard('5\t6\n7\t8', en), en)
    expect(gridSize(res.problem)).toEqual({ rows: 5, cols: 4 })
    expect(res.problem.alternatives).toEqual(['A1', 'A2', 'A3'])
    expect(res.problem.criteria.map((c) => c.name)).toEqual(['C1', 'C2', 'C3'])
    expect(res.problem.matrix).toEqual([
      [1, 2, null],
      [3, 5, 6],
      [null, 7, 8],
    ])
    expect(res.range).toEqual({ top: 3, left: 2, bottom: 4, right: 3 })
    expect(res.rejected).toEqual([])
  })

  it('uses detected headers as names next to the numbers', () => {
    const cells = parseClipboard('\tPrice\tQuality\nX\t0,5\t2\nY\t1\t3\nZ\t4\t5\n', tr)
    const res = applyPaste(base(), toGrid(0, 0), cells, tr)
    expect(res.headers).toEqual({ row: true, col: true })
    expect(res.problem.alternatives).toEqual(['X', 'Y', 'Z'])
    expect(res.problem.criteria).toEqual([
      { name: 'Price', type: 'benefit' },
      { name: 'Quality', type: 'cost' },
    ])
    expect(res.problem.matrix).toEqual([
      [0.5, 2],
      [1, 3],
      [4, 5],
    ])
  })

  it('replaces the whole problem when pasted on the top-left corner', () => {
    const res = applyPaste(base(), { row: 0, col: 0 }, [['9']], en)
    expect(res.replaced).toBe(true)
    expect(res.problem).toEqual({ alternatives: ['A1'], criteria: [{ name: 'C1', type: 'benefit' }], matrix: [[9]] })
  })

  it('can place a header-looking block as plain values', () => {
    const cells = [['Price', 'Quality'], ['1', '2']]
    const res = applyPaste(base(), toGrid(0, 0), cells, en, { headers: 'none' })
    expect(res.headers).toEqual({ row: false, col: false })
    expect(res.rejected).toEqual([toGrid(0, 0), toGrid(0, 1)])
    expect(res.problem.matrix[0]).toEqual([1, 2]) // rejected cells stay unchanged
    expect(res.problem.matrix[1]).toEqual([1, 2])
  })

  it('reads each cell by the kind of its target when pasting on name cells', () => {
    const res = applyPaste(base(), { row: 0, col: 1 }, [['Price', 'Quality'], ['cost', 'fayda']], en)
    expect(res.problem.criteria).toEqual([
      { name: 'Price', type: 'cost' },
      { name: 'Quality', type: 'benefit' },
    ])
  })

  it('reports rejected cells', () => {
    const res = applyPaste(base(), toGrid(0, 0), [['1', 'n/a']], en)
    expect(res.rejected).toEqual([toGrid(0, 1)])
  })
})

describe('history', () => {
  it('undoes and redoes, and drops the redo branch on a new edit', () => {
    let h = createHistory(0)
    h = pushHistory(h, 1)
    h = pushHistory(h, 2)
    h = undo(h)
    expect(h.present).toBe(1)
    expect(canRedo(h)).toBe(true)
    h = redo(h)
    expect(h.present).toBe(2)
    h = undo(undo(h))
    expect(h.present).toBe(0)
    expect(canUndo(h)).toBe(false)
    expect(undo(h)).toBe(h)
    h = pushHistory(h, 5)
    expect(canRedo(h)).toBe(false)
  })

  it('keeps the last 100 steps (at least 50)', () => {
    let h = createHistory(0)
    for (let k = 1; k <= 150; k++) h = pushHistory(h, k)
    expect(h.past.length).toBe(100)
    for (let k = 0; k < 60; k++) h = undo(h)
    expect(h.present).toBe(90)
  })

  it('compares problems structurally', () => {
    const a = base()
    const b = base()
    expect(sameProblem(a, b)).toBe(true)
    expect(sameProblem(a, toggleType(b, 0))).toBe(false)
    const withNull = writeCell(a, toGrid(0, 0), '', en).problem
    const withNaN = { ...withNull, matrix: [[Number.NaN, 2], [3, 4]] }
    expect(sameProblem(withNull, withNaN)).toBe(true)
  })
})
