/**
 * Pure model of the decision matrix grid: geometry, keyboard commands, edits, clipboard parsing,
 * paste placement and undo history. No DOM, no React; every function returns new values.
 *
 * Grid space (what the keyboard moves through):
 *
 *   row 0      corner | criterion names ...
 *   row 1      corner | criterion types (benefit / cost) ...
 *   row 2..    alternative name | values ...
 *
 * `HEADER_ROWS` and `HEADER_COLS` convert between grid space and data space
 * (alternative index i, criterion index j).
 */
import type { Criterion, CriterionType } from '../../core/types'

/** The problem as the grid edits it. Empty cells are `null`, never 0. */
export type GridProblem = {
  alternatives: string[]
  criteria: Criterion[]
  matrix: (number | null)[][]
}

export type Pos = { row: number; col: number }
export type Range = { top: number; left: number; bottom: number; right: number }
export type Size = { rows: number; cols: number }
export type CellKind = 'corner' | 'criterion-name' | 'criterion-type' | 'alternative-name' | 'value'

export type Parse = (text: string) => number | null
export type Format = (value: number) => string

/** Names for rows and columns the grid creates (paste growth, "Add alternative"). Index is 0-based. */
export type NameFactory = {
  alternative: (index: number) => string
  criterion: (index: number) => string
}

export const HEADER_ROWS = 2
export const HEADER_COLS = 1
export const HISTORY_LIMIT = 100
export const PAGE_ROWS = 10

export const defaultNames: NameFactory = {
  alternative: (i) => `A${i + 1}`,
  criterion: (j) => `C${j + 1}`,
}

// ---------------------------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------------------------

export function gridSize(p: GridProblem): Size {
  return { rows: p.alternatives.length + HEADER_ROWS, cols: p.criteria.length + HEADER_COLS }
}

export function cellKind(pos: Pos): CellKind {
  if (pos.col < HEADER_COLS) return pos.row < HEADER_ROWS ? 'corner' : 'alternative-name'
  if (pos.row === 0) return 'criterion-name'
  if (pos.row === 1) return 'criterion-type'
  return 'value'
}

/** Whether typing, F2 or double click opens an editor on this cell. */
export const isEditable = (kind: CellKind): boolean =>
  kind === 'criterion-name' || kind === 'alternative-name' || kind === 'value'

export const toGrid = (i: number, j: number): Pos => ({ row: i + HEADER_ROWS, col: j + HEADER_COLS })
export const toData = (pos: Pos): { i: number; j: number } => ({ i: pos.row - HEADER_ROWS, j: pos.col - HEADER_COLS })

export const samePos = (a: Pos, b: Pos): boolean => a.row === b.row && a.col === b.col

export function clampPos(pos: Pos, size: Size): Pos {
  return {
    row: Math.min(Math.max(pos.row, 0), size.rows - 1),
    col: Math.min(Math.max(pos.col, 0), size.cols - 1),
  }
}

export function rangeOf(a: Pos, b: Pos): Range {
  return {
    top: Math.min(a.row, b.row),
    left: Math.min(a.col, b.col),
    bottom: Math.max(a.row, b.row),
    right: Math.max(a.col, b.col),
  }
}

export const inRange = (r: Range, pos: Pos): boolean =>
  pos.row >= r.top && pos.row <= r.bottom && pos.col >= r.left && pos.col <= r.right

export const rangeSize = (r: Range): number => (r.bottom - r.top + 1) * (r.right - r.left + 1)

// ---------------------------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------------------------

export type NavKey =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'home'
  | 'end'
  | 'grid-start'
  | 'grid-end'
  | 'page-up'
  | 'page-down'
  | 'tab'
  | 'shift-tab'
  | 'enter'
  | 'shift-enter'

/**
 * Next cursor position. Arrows, Home/End and Enter stop at the edges. Tab wraps to the next row
 * and Shift+Tab to the previous one; at the very last (first) cell they return the same position,
 * which the component reads as "let focus leave the grid" so Tab is never a keyboard trap.
 */
export function move(pos: Pos, key: NavKey, size: Size): Pos {
  const lastRow = size.rows - 1
  const lastCol = size.cols - 1
  const p = clampPos(pos, size)
  switch (key) {
    case 'up':
    case 'shift-enter':
      return { row: Math.max(p.row - 1, 0), col: p.col }
    case 'down':
    case 'enter':
      return { row: Math.min(p.row + 1, lastRow), col: p.col }
    case 'left':
      return { row: p.row, col: Math.max(p.col - 1, 0) }
    case 'right':
      return { row: p.row, col: Math.min(p.col + 1, lastCol) }
    case 'home':
      return { row: p.row, col: 0 }
    case 'end':
      return { row: p.row, col: lastCol }
    case 'grid-start':
      return { row: 0, col: 0 }
    case 'grid-end':
      return { row: lastRow, col: lastCol }
    case 'page-up':
      return { row: Math.max(p.row - PAGE_ROWS, 0), col: p.col }
    case 'page-down':
      return { row: Math.min(p.row + PAGE_ROWS, lastRow), col: p.col }
    case 'tab':
      if (p.col < lastCol) return { row: p.row, col: p.col + 1 }
      if (p.row < lastRow) return { row: p.row + 1, col: 0 }
      return p
    case 'shift-tab':
      if (p.col > 0) return { row: p.row, col: p.col - 1 }
      if (p.row > 0) return { row: p.row - 1, col: lastCol }
      return p
  }
}

// ---------------------------------------------------------------------------------------------
// Keyboard commands
// ---------------------------------------------------------------------------------------------

/** A keyboard event reduced to what the model needs. `ctrl` is Ctrl or Cmd. */
export type KeyInput = { key: string; shift?: boolean; ctrl?: boolean; alt?: boolean }

export type Command =
  | { type: 'move'; nav: NavKey; extend: boolean }
  | { type: 'edit'; mode: 'replace'; text: string }
  | { type: 'edit'; mode: 'edit' }
  | { type: 'type-menu' }
  | { type: 'clear' }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'select-all' }
  | { type: 'collapse' }

const ARROWS: Record<string, NavKey> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }

/** Maps a key press in navigation mode (no editor open) to a command, or null to ignore it. */
export function commandForKey(k: KeyInput, kind: CellKind): Command | null {
  const shift = k.shift === true
  const ctrl = k.ctrl === true
  const alt = k.alt === true
  // A direction cell is a menu button: Enter, Space, F2 or Alt+ArrowDown open the benefit / cost
  // choice. Nothing flips on a single key or click, so the ranking never changes by accident.
  if (kind === 'criterion-type' && !ctrl) {
    if ((k.key === 'Enter' && !shift) || k.key === ' ' || k.key === 'F2' || (alt && k.key === 'ArrowDown')) return { type: 'type-menu' }
  }
  const arrow = ARROWS[k.key]
  if (arrow) return { type: 'move', nav: arrow, extend: shift }

  if (ctrl && !alt) {
    const key = k.key.toLowerCase()
    if (key === 'z') return shift ? { type: 'redo' } : { type: 'undo' }
    if (key === 'y') return { type: 'redo' }
    if (key === 'a') return { type: 'select-all' }
    if (k.key === 'Home') return { type: 'move', nav: 'grid-start', extend: shift }
    if (k.key === 'End') return { type: 'move', nav: 'grid-end', extend: shift }
    return null
  }

  switch (k.key) {
    case 'Tab':
      return { type: 'move', nav: shift ? 'shift-tab' : 'tab', extend: false }
    case 'Enter':
      return { type: 'move', nav: shift ? 'shift-enter' : 'enter', extend: false }
    case 'Home':
      return { type: 'move', nav: 'home', extend: shift }
    case 'End':
      return { type: 'move', nav: 'end', extend: shift }
    case 'PageUp':
      return { type: 'move', nav: 'page-up', extend: shift }
    case 'PageDown':
      return { type: 'move', nav: 'page-down', extend: shift }
    case 'Delete':
    case 'Backspace':
      return { type: 'clear' }
    case 'Escape':
      return { type: 'collapse' }
    case 'F2':
      return isEditable(kind) ? { type: 'edit', mode: 'edit' } : null
  }

  if (!alt && k.key.length === 1 && isEditable(kind)) return { type: 'edit', mode: 'replace', text: k.key }
  return null
}

export type EditMode = 'replace' | 'edit'
export type EditCommand = { type: 'commit'; then: NavKey | null } | { type: 'cancel' }

/**
 * Key press while an editor is open. "replace" mode (opened by typing) commits on arrows like a
 * spreadsheet; "edit" mode (F2, double click) keeps arrows for the caret.
 */
export function editCommandForKey(k: KeyInput, mode: EditMode): EditCommand | null {
  const shift = k.shift === true
  switch (k.key) {
    case 'Enter':
      return { type: 'commit', then: shift ? 'shift-enter' : 'enter' }
    case 'Tab':
      return { type: 'commit', then: shift ? 'shift-tab' : 'tab' }
    case 'Escape':
      return { type: 'cancel' }
  }
  const arrow = ARROWS[k.key]
  if (arrow && mode === 'replace' && !shift && k.ctrl !== true) return { type: 'commit', then: arrow }
  return null
}

// ---------------------------------------------------------------------------------------------
// Reading and writing cells
// ---------------------------------------------------------------------------------------------

/** Text of a cell as the grid shows it and as the editor opens with. */
export function cellText(p: GridProblem, pos: Pos, format: Format): string {
  const { i, j } = toData(pos)
  switch (cellKind(pos)) {
    case 'corner':
      return ''
    case 'criterion-name':
      return p.criteria[j]?.name ?? ''
    case 'criterion-type':
      return p.criteria[j]?.type ?? ''
    case 'alternative-name':
      return p.alternatives[i] ?? ''
    case 'value': {
      const v = p.matrix[i]?.[j]
      return v === null || v === undefined ? '' : format(v)
    }
  }
}

const BENEFIT_WORDS = new Set(['benefit', 'b', 'max', 'maximize', 'maximise', 'fayda', 'f', 'yarar', '+', '↑'])
const COST_WORDS = new Set(['cost', 'c', 'min', 'minimize', 'minimise', 'maliyet', 'm', '-', '↓'])

/** Reads "benefit", "cost", "fayda", "maliyet", "max", "min", "↑ Benefit", ... Null when it is neither. */
export function parseCriterionType(text: string): CriterionType | null {
  const s = text.trim().toLocaleLowerCase('en')
  if (s === '') return null
  if (BENEFIT_WORDS.has(s) || s.startsWith('↑')) return 'benefit'
  if (COST_WORDS.has(s) || s.startsWith('↓')) return 'cost'
  const first = s.split(/\s+/)[0] ?? ''
  if (BENEFIT_WORDS.has(first)) return 'benefit'
  if (COST_WORDS.has(first)) return 'cost'
  return null
}

function withMatrixCell(p: GridProblem, i: number, j: number, v: number | null): GridProblem {
  const matrix = p.matrix.slice()
  const row = (matrix[i] ?? []).slice()
  row[j] = v
  matrix[i] = row
  return { ...p, matrix }
}

export type WriteResult = { problem: GridProblem; ok: boolean }

/**
 * Writes typed or pasted text into one cell. Values: empty text clears to null, text that `parse`
 * rejects leaves the cell unchanged and returns ok: false. Names are trimmed. Types accept the
 * words `parseCriterionType` reads. The corner is read-only.
 */
export function writeCell(p: GridProblem, pos: Pos, text: string, parse: Parse): WriteResult {
  const { i, j } = toData(pos)
  const size = gridSize(p)
  if (pos.row < 0 || pos.col < 0 || pos.row >= size.rows || pos.col >= size.cols) return { problem: p, ok: false }
  switch (cellKind(pos)) {
    case 'corner':
      return { problem: p, ok: false }
    case 'criterion-name': {
      const criteria = p.criteria.slice()
      criteria[j] = { ...criteria[j]!, name: text.trim() }
      return { problem: { ...p, criteria }, ok: true }
    }
    case 'criterion-type': {
      const type = parseCriterionType(text)
      if (!type) return { problem: p, ok: false }
      const criteria = p.criteria.slice()
      criteria[j] = { ...criteria[j]!, type }
      return { problem: { ...p, criteria }, ok: true }
    }
    case 'alternative-name': {
      const alternatives = p.alternatives.slice()
      alternatives[i] = text.trim()
      return { problem: { ...p, alternatives }, ok: true }
    }
    case 'value': {
      const t = text.trim()
      if (t === '') return { problem: withMatrixCell(p, i, j, null), ok: true }
      const v = parse(t)
      if (v === null || !Number.isFinite(v)) return { problem: p, ok: false }
      return { problem: withMatrixCell(p, i, j, v), ok: true }
    }
  }
}

/** Sets criterion j to benefit or cost (the direction menu). Same object when nothing changes. */
export function setType(p: GridProblem, j: number, type: CriterionType): GridProblem {
  const c = p.criteria[j]
  if (!c || c.type === type) return p
  const criteria = p.criteria.slice()
  criteria[j] = { ...c, type }
  return { ...p, criteria }
}

export function toggleType(p: GridProblem, j: number): GridProblem {
  const c = p.criteria[j]
  if (!c) return p
  const criteria = p.criteria.slice()
  criteria[j] = { ...c, type: c.type === 'benefit' ? 'cost' : 'benefit' }
  return { ...p, criteria }
}

/** Delete / Backspace over a range: values become null, names become empty; types are kept. */
export function clearRange(p: GridProblem, r: Range): GridProblem {
  let out = p
  const size = gridSize(p)
  for (let row = Math.max(r.top, 0); row <= Math.min(r.bottom, size.rows - 1); row++) {
    for (let col = Math.max(r.left, 0); col <= Math.min(r.right, size.cols - 1); col++) {
      const kind = cellKind({ row, col })
      if (kind === 'value' || kind === 'criterion-name' || kind === 'alternative-name') {
        out = writeCell(out, { row, col }, '', () => null).problem
      }
    }
  }
  return out
}

function quoteField(s: string): string {
  return /[\t\n\r"]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/**
 * A range as TSV, the format Excel and Sheets paste. Types are written as "benefit" / "cost".
 * When the range spans the name row and value rows, the type row is left out so the copy is a
 * plain named table that pastes back (header detection) into this grid or a spreadsheet.
 */
export function rangeToTsv(p: GridProblem, r: Range, format: Format): string {
  const lines: string[] = []
  const skipTypeRow = r.top === 0 && r.bottom >= HEADER_ROWS
  for (let row = r.top; row <= r.bottom; row++) {
    if (row === 1 && skipTypeRow) continue
    const fields: string[] = []
    for (let col = r.left; col <= r.right; col++) fields.push(quoteField(cellText(p, { row, col }, format)))
    lines.push(fields.join('\t'))
  }
  return lines.join('\n')
}

// ---------------------------------------------------------------------------------------------
// Rows and columns
// ---------------------------------------------------------------------------------------------

/** Grows the problem to at least `alternatives` rows and `criteria` columns. New cells are null. */
export function ensureSize(p: GridProblem, alternatives: number, criteria: number, names: NameFactory = defaultNames): GridProblem {
  const m = Math.max(p.alternatives.length, alternatives)
  const n = Math.max(p.criteria.length, criteria)
  if (m === p.alternatives.length && n === p.criteria.length) return p
  const alts = p.alternatives.slice()
  for (let i = alts.length; i < m; i++) alts.push(names.alternative(i))
  const crit = p.criteria.slice()
  for (let j = crit.length; j < n; j++) crit.push({ name: names.criterion(j), type: 'benefit' })
  const matrix: (number | null)[][] = []
  for (let i = 0; i < m; i++) {
    const row = (p.matrix[i] ?? []).slice(0, n)
    while (row.length < n) row.push(null)
    matrix.push(row)
  }
  return { alternatives: alts, criteria: crit, matrix }
}

/** Inserts an empty alternative before data row `at` (use the row count to append). */
export function insertAlternative(p: GridProblem, at: number, name: string): GridProblem {
  const i = Math.min(Math.max(at, 0), p.alternatives.length)
  const alternatives = p.alternatives.slice()
  alternatives.splice(i, 0, name)
  const matrix = p.matrix.slice()
  matrix.splice(i, 0, p.criteria.map(() => null))
  return { ...p, alternatives, matrix }
}

/** Removes alternative `i`. The grid keeps at least one row. */
export function deleteAlternative(p: GridProblem, i: number): GridProblem {
  if (p.alternatives.length <= 1 || i < 0 || i >= p.alternatives.length) return p
  return {
    ...p,
    alternatives: p.alternatives.filter((_, k) => k !== i),
    matrix: p.matrix.filter((_, k) => k !== i),
  }
}

/** Inserts an empty benefit criterion before column `at` (use the column count to append). */
export function insertCriterion(p: GridProblem, at: number, name: string): GridProblem {
  const j = Math.min(Math.max(at, 0), p.criteria.length)
  const criteria = p.criteria.slice()
  criteria.splice(j, 0, { name, type: 'benefit' })
  const matrix = p.matrix.map((row) => {
    const r = row.slice()
    r.splice(j, 0, null)
    return r
  })
  return { ...p, criteria, matrix }
}

/** Removes criterion `j`. The grid keeps at least one column. */
export function deleteCriterion(p: GridProblem, j: number): GridProblem {
  if (p.criteria.length <= 1 || j < 0 || j >= p.criteria.length) return p
  return {
    ...p,
    criteria: p.criteria.filter((_, k) => k !== j),
    matrix: p.matrix.map((row) => row.filter((_, k) => k !== j)),
  }
}

// ---------------------------------------------------------------------------------------------
// Clipboard parsing
// ---------------------------------------------------------------------------------------------

export type Delimiter = '\t' | ';' | ','

/** Counts delimiters per line outside double quotes. */
function delimiterCounts(text: string): { tab: number; semi: number; comma: number } {
  let tab = 0
  let semi = 0
  let comma = 0
  let quoted = false
  for (let k = 0; k < text.length; k++) {
    const ch = text[k]
    if (ch === '"') quoted = !quoted
    else if (!quoted) {
      if (ch === '\t') tab++
      else if (ch === ';') semi++
      else if (ch === ',') comma++
    }
  }
  return { tab, semi, comma }
}

/**
 * Picks the field separator of a pasted block:
 * 1. any tab outside quotes: TSV (Excel, Sheets, LibreOffice all copy as TSV);
 * 2. any semicolon: semicolon CSV (the TR / EU Excel export, where the comma is the decimal mark);
 * 3. commas: comma CSV, unless every non-empty line reads as one number with `parse`
 *    (a column of `0,25` values typed in Turkish), in which case the block is one column.
 * Returns null for a single column (no separator).
 */
export function detectDelimiter(text: string, parse?: Parse): Delimiter | null {
  const c = delimiterCounts(text)
  if (c.tab > 0) return '\t'
  if (c.semi > 0) return ';'
  if (c.comma > 0) {
    if (parse) {
      const lines = normalizeNewlines(text)
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l !== '')
      if (lines.length > 0 && lines.every((l) => parse(l) !== null)) return null
    }
    return ','
  }
  return null
}

const normalizeNewlines = (s: string): string => s.replace(/\r\n?/g, '\n')

/**
 * RFC 4180 style parser: quoted fields may hold the delimiter, newlines and `""` escapes;
 * `\r\n` and `\r` count as newlines. One trailing newline (Excel always adds it) is dropped.
 * `delimiter: null` splits lines only.
 */
export function parseDelimited(text: string, delimiter: Delimiter | null): string[][] {
  const s = normalizeNewlines(text)
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  let fieldStart = true
  for (let k = 0; k < s.length; k++) {
    const ch = s[k]!
    if (quoted) {
      if (ch === '"') {
        if (s[k + 1] === '"') {
          field += '"'
          k++
        } else quoted = false
      } else field += ch
      continue
    }
    if (ch === '"' && fieldStart) {
      quoted = true
      fieldStart = false
    } else if (delimiter !== null && ch === delimiter) {
      row.push(field)
      field = ''
      fieldStart = true
    } else if (ch === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      fieldStart = true
    } else {
      field += ch
      fieldStart = false
    }
  }
  if (field !== '' || row.length > 0 || !s.endsWith('\n')) {
    row.push(field)
    rows.push(row)
  }
  if (s === '') return []
  return rows
}

/** Detects the separator and parses. Cells are trimmed. */
export function parseClipboard(text: string, parse?: Parse): string[][] {
  const delimiter = detectDelimiter(text, parse)
  return parseDelimited(text, delimiter).map((r) => r.map((c) => c.trim()))
}

export type HeaderGuess = { row: boolean; col: boolean }

/**
 * Guesses whether the first row holds criterion names and the first column alternative names:
 * a header line has no numbers and at least one non-empty cell, and the rest of the block has at
 * least one number. Needs a block of at least 2 x 2.
 */
export function detectHeaders(cells: string[][], parse: Parse): HeaderGuess {
  const none = { row: false, col: false }
  const rows = cells.length
  const cols = Math.max(0, ...cells.map((r) => r.length))
  if (rows < 2 || cols < 2) return none
  const at = (r: number, c: number): string => cells[r]?.[c] ?? ''
  const isNum = (s: string): boolean => s.trim() !== '' && parse(s.trim()) !== null
  const textLine = (xs: string[]): boolean => xs.every((s) => !isNum(s)) && xs.some((s) => s.trim() !== '')

  const rowCand = textLine(cells[0]!.slice(1))
  const colCand = textLine(cells.slice(1).map((r) => r[0] ?? ''))
  let row = false
  let col = false
  if (rowCand && colCand) {
    row = true
    col = true
  } else if (rowCand) {
    row = !isNum(at(0, 0))
  } else if (colCand) {
    col = !isNum(at(0, 0))
  }
  if (!row && !col) return none

  const hr = row ? 1 : 0
  const hc = col ? 1 : 0
  let bodyHasNumber = false
  for (let r = hr; r < rows && !bodyHasNumber; r++) {
    for (let c = hc; c < cols; c++) {
      if (isNum(at(r, c))) {
        bodyHasNumber = true
        break
      }
    }
  }
  return bodyHasNumber ? { row, col } : none
}

// ---------------------------------------------------------------------------------------------
// Paste
// ---------------------------------------------------------------------------------------------

export type PasteOptions = {
  /**
   * 'auto' (default): use `detectHeaders` when pasting on a value cell or the top-left corner.
   * 'none': place the block as it is. An explicit guess forces the choice.
   */
  headers?: 'auto' | 'none' | HeaderGuess
  names?: NameFactory
}

export type PasteResult = {
  problem: GridProblem
  /** Grid-space range the block covers, for selecting it after the paste. */
  range: Range
  /** Cells whose text could not be read (non-numbers in value cells, unknown types). */
  rejected: Pos[]
  /** Which header lines were taken as names. */
  headers: HeaderGuess
  /** True when the paste replaced the whole problem (pasted on the top-left corner). */
  replaced: boolean
}

/**
 * Pastes a parsed block at `at`, growing the grid when the block runs past the last row or
 * column. Placement:
 * - on the top-left corner (0, 0): the block replaces the whole problem and the grid takes its
 *   size; header lines become names, other names are kept or generated;
 * - with header lines (detected or forced): the numbers start at the focused value cell (or the
 *   first value cell), the header row fills criterion names above them and the header column
 *   fills alternative names beside them;
 * - otherwise each cell goes where it lands, read by the kind of the target cell.
 */
export function applyPaste(p: GridProblem, at: Pos, cells: string[][], parse: Parse, opts: PasteOptions = {}): PasteResult {
  const names = opts.names ?? defaultNames
  const rows = cells.length
  const cols = Math.max(0, ...cells.map((r) => r.length))
  const none: HeaderGuess = { row: false, col: false }
  if (rows === 0 || cols === 0) {
    return { problem: p, range: rangeOf(at, at), rejected: [], headers: none, replaced: false }
  }
  const kind = cellKind(at)
  const replace = at.row === 0 && at.col === 0
  const h = opts.headers ?? 'auto'
  const headers: HeaderGuess =
    h === 'none' ? none : h === 'auto' ? (replace || kind === 'value' ? detectHeaders(cells, parse) : none) : h

  const hr = headers.row ? 1 : 0
  const hc = headers.col ? 1 : 0
  const bodyRows = rows - hr
  const bodyCols = cols - hc
  const cell = (r: number, c: number): string => cells[r]?.[c] ?? ''
  const rejected: Pos[] = []

  if (replace || hr || hc) {
    const start: Pos = replace
      ? { row: HEADER_ROWS, col: HEADER_COLS }
      : { row: Math.max(at.row, HEADER_ROWS), col: Math.max(at.col, HEADER_COLS) }
    const { i: i0, j: j0 } = toData(start)
    let out: GridProblem
    if (replace) {
      const m = Math.max(bodyRows, 1)
      const n = Math.max(bodyCols, 1)
      out = {
        alternatives: Array.from({ length: m }, (_, i) => p.alternatives[i] ?? names.alternative(i)),
        criteria: Array.from({ length: n }, (_, j) => p.criteria[j] ?? { name: names.criterion(j), type: 'benefit' as const }),
        matrix: Array.from({ length: m }, () => Array.from({ length: n }, () => null)),
      }
    } else {
      out = ensureSize(p, i0 + bodyRows, j0 + bodyCols, names)
    }
    if (hr) {
      for (let c = 0; c < bodyCols; c++) {
        const text = cell(0, c + hc)
        if (text !== '') out = writeCell(out, { row: 0, col: start.col + c }, text, parse).problem
      }
    }
    if (hc) {
      for (let r = 0; r < bodyRows; r++) {
        const text = cell(r + hr, 0)
        if (text !== '') out = writeCell(out, { row: start.row + r, col: 0 }, text, parse).problem
      }
    }
    for (let r = 0; r < bodyRows; r++) {
      for (let c = 0; c < bodyCols; c++) {
        const pos = { row: start.row + r, col: start.col + c }
        const res = writeCell(out, pos, cell(r + hr, c + hc), parse)
        if (res.ok) out = res.problem
        else rejected.push(pos)
      }
    }
    const range: Range = {
      top: hr ? 0 : start.row,
      left: hc ? 0 : start.col,
      bottom: start.row + Math.max(bodyRows, 1) - 1,
      right: start.col + Math.max(bodyCols, 1) - 1,
    }
    return { problem: out, range, rejected, headers, replaced: replace }
  }

  const { i: i0, j: j0 } = toData(at)
  let out = ensureSize(p, i0 + rows, j0 + cols, names)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const pos = { row: at.row + r, col: at.col + c }
      if (cellKind(pos) === 'corner') continue
      const res = writeCell(out, pos, cell(r, c), parse)
      if (res.ok) out = res.problem
      else rejected.push(pos)
    }
  }
  const range: Range = { top: at.row, left: at.col, bottom: at.row + rows - 1, right: at.col + cols - 1 }
  return { problem: out, range, rejected, headers, replaced: false }
}

// ---------------------------------------------------------------------------------------------
// Comparison and history
// ---------------------------------------------------------------------------------------------

/** Structural equality: same names, types and values (null and NaN count as equal empties). */
export function sameProblem(a: GridProblem, b: GridProblem): boolean {
  if (a === b) return true
  if (a.alternatives.length !== b.alternatives.length || a.criteria.length !== b.criteria.length) return false
  if (a.alternatives.some((x, i) => x !== b.alternatives[i])) return false
  if (a.criteria.some((c, j) => c.name !== b.criteria[j]!.name || c.type !== b.criteria[j]!.type)) return false
  if (a.matrix.length !== b.matrix.length) return false
  const empty = (v: number | null | undefined): boolean => v === null || v === undefined || Number.isNaN(v)
  return a.matrix.every((row, i) => {
    const other = b.matrix[i]!
    if (row.length !== other.length) return false
    return row.every((v, j) => {
      const w = other[j]
      return empty(v) ? empty(w) : v === w
    })
  })
}

export type History<T> = { past: T[]; present: T; future: T[]; limit: number }

export function createHistory<T>(present: T, limit = HISTORY_LIMIT): History<T> {
  return { past: [], present, future: [], limit }
}

/** Records `next` as the new present. Drops the redo branch and the oldest entries past `limit`. */
export function pushHistory<T>(h: History<T>, next: T): History<T> {
  if (next === h.present) return h
  const past = [...h.past, h.present]
  if (past.length > h.limit) past.splice(0, past.length - h.limit)
  return { past, present: next, future: [], limit: h.limit }
}

export function undo<T>(h: History<T>): History<T> {
  const prev = h.past[h.past.length - 1]
  if (h.past.length === 0) return h
  return { past: h.past.slice(0, -1), present: prev as T, future: [h.present, ...h.future], limit: h.limit }
}

export function redo<T>(h: History<T>): History<T> {
  if (h.future.length === 0) return h
  const [next, ...rest] = h.future
  return { past: [...h.past, h.present], present: next as T, future: rest, limit: h.limit }
}

export const canUndo = (h: History<unknown>): boolean => h.past.length > 0
export const canRedo = (h: History<unknown>): boolean => h.future.length > 0
