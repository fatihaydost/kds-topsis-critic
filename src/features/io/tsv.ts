import { formatNumber, type DecimalSeparator } from './numbers'
import { tableToCells, type Cell, type StepTable } from './table'

export type TsvOptions = {
  /** Decimal separator the target spreadsheet expects: '.' (EN locale) or ',' (TR locale). */
  decimal?: DecimalSeparator
  /** Fixed number of decimals; the full precision is kept when omitted. */
  digits?: number
  /** Top-left header cell. */
  corner?: string
}

/** Quotes a text cell only when it would break the TSV grid (tab, line break or quote). */
function quote(text: string): string {
  return /[\t\r\n"]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** Cells to TSV that pastes into Excel or Google Sheets as a block. */
export function cellsToTsv(cells: readonly (readonly Cell[])[], opts: TsvOptions = {}): string {
  const decimal = opts.decimal ?? '.'
  return cells
    .map((row) =>
      row
        .map((c) => (c === null ? '' : typeof c === 'number' ? formatNumber(c, decimal, opts.digits) : quote(c)))
        .join('\t'),
    )
    .join('\n')
}

/** A step table to TSV, with its row and column labels. */
export function tableToTsv(table: StepTable, opts: TsvOptions = {}): string {
  return cellsToTsv(tableToCells(table, opts.corner ?? ''), opts)
}
