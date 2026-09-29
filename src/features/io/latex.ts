import { formatNumber } from './numbers'
import type { StepTable } from './table'

export type LatexOptions = {
  /** Fixed decimals for every number (default 4). */
  digits?: number
  /** Top-left header cell. */
  corner?: string
  /** When given, the tabular is wrapped in a table float with this caption. */
  caption?: string
  /** \label for the float (only with a caption). */
  label?: string
}

const LATEX_SPECIAL: Record<string, string> = {
  '\\': '\\textbackslash{}',
  '&': '\\&',
  '%': '\\%',
  $: '\\$',
  '#': '\\#',
  _: '\\_',
  '{': '\\{',
  '}': '\\}',
  '~': '\\textasciitilde{}',
  '^': '\\textasciicircum{}',
}

/** Escapes text for LaTeX text mode (& % $ # _ { } ~ ^ and the backslash). */
export function escapeLatex(text: string): string {
  return text.replace(/[\\&%$#_{}~^]/g, (ch) => LATEX_SPECIAL[ch]!)
}

/** Fixed decimals without siunitx; a negative sign is set as a math minus. */
function latexNumber(x: number, digits: number): string {
  const s = formatNumber(x, '.', digits)
  if (s === '') return '--'
  return s.startsWith('-') ? `$-$${s.slice(1)}` : s
}

/**
 * A step table as a booktabs tabular (\toprule, \midrule, \bottomrule; needs \usepackage{booktabs}).
 * Labels are left aligned, numbers right aligned with a fixed number of decimals.
 */
export function tableToLatex(table: StepTable, opts: LatexOptions = {}): string {
  const digits = opts.digits ?? 4
  const cols = table.values[0]?.length ?? 0
  const lines: string[] = [`\\begin{tabular}{l${'r'.repeat(cols)}}`, '\\toprule']
  if (table.colLabels !== null) {
    lines.push([escapeLatex(opts.corner ?? ''), ...table.colLabels.map(escapeLatex)].join(' & ') + ' \\\\')
    lines.push('\\midrule')
  }
  table.values.forEach((row, i) => {
    lines.push([escapeLatex(table.rowLabels[i] ?? ''), ...row.map((x) => latexNumber(x, digits))].join(' & ') + ' \\\\')
  })
  lines.push('\\bottomrule', '\\end{tabular}')
  if (opts.caption === undefined) return lines.join('\n')
  return [
    '\\begin{table}[htbp]',
    '\\centering',
    `\\caption{${escapeLatex(opts.caption)}}`,
    ...(opts.label ? [`\\label{${opts.label}}`] : []),
    ...lines,
    '\\end{table}',
  ].join('\n')
}
