import { importCsv, importXlsx, type ImportIssue, type ImportResult } from '../../features/io'

export type FileImport = ImportResult & { kind: 'csv' | 'xlsx'; sheet?: string }

const SPREADSHEET = /\.(xlsx|xlsm|xls|ods)$/i

/** File types the import button offers. */
export const IMPORT_ACCEPT = '.xlsx,.xlsm,.xls,.ods,.csv,.tsv,.txt,text/csv,text/tab-separated-values'

/** Reads a decision matrix from a spreadsheet or delimited text file. SheetJS loads only for spreadsheets. */
export async function readDecisionFile(file: File): Promise<FileImport> {
  if (SPREADSHEET.test(file.name)) {
    const X = await import('xlsx')
    const result = importXlsx(X, new Uint8Array(await file.arrayBuffer()))
    return { ...result, kind: 'xlsx', sheet: result.sheet }
  }
  return { ...importCsv(await file.text()), kind: 'csv' }
}

/** "C5" from a 0-based sheet row and column. */
export function cellRef(row: number, col: number): string {
  let s = ''
  for (let c = col + 1; c > 0; c = Math.floor((c - 1) / 26)) s = String.fromCharCode(65 + ((c - 1) % 26)) + s
  return `${s}${row + 1}`
}

/** Issues that point at one place in the imported table (cell, name or direction). */
export const isLocated = (x: ImportIssue): boolean => x.alt !== undefined || x.crit !== undefined
