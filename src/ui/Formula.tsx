import 'katex/dist/katex.min.css'
import katex from 'katex'
import { useMemo } from 'react'
import { cn } from './cn'

export type FormulaProps = {
  /** TeX source, e.g. `r_{ij} = x_{ij} / \sqrt{\sum_i x_{ij}^2}`. */
  tex: string
  /** Block formula on its own line (display style). Default inline. */
  display?: boolean | undefined
  /** Display formulas only: left-aligned (default, reads like a worked example) or centered. */
  align?: 'left' | 'center' | undefined
  className?: string | undefined
}

type Rendered = { html: string; error: null } | { html: null; error: string }

/**
 * KaTeX formula with MathML for screen readers. If the TeX does not parse, the raw TeX is shown
 * in mono with the parser message as a title, so a typo is visible instead of silently blank.
 */
export function Formula({ tex, display = false, align = 'left', className }: FormulaProps) {
  const out = useMemo<Rendered>(() => {
    try {
      return {
        html: katex.renderToString(tex, { displayMode: display, fleqn: align === 'left', throwOnError: true, output: 'htmlAndMathml', strict: 'ignore' }),
        error: null,
      }
    } catch (err) {
      return { html: null, error: err instanceof Error ? err.message : String(err) }
    }
  }, [tex, display, align])

  if (out.html === null) {
    const Tag = display ? 'pre' : 'code'
    return (
      <Tag
        data-formula-error=""
        title={out.error}
        className={cn('font-mono text-13 text-danger', display && 'my-2 overflow-x-auto whitespace-pre-wrap', className)}
      >
        {tex}
      </Tag>
    )
  }

  const Tag = display ? 'div' : 'span'
  return (
    <Tag
      className={cn('text-text', display && 'overflow-x-auto overflow-y-hidden py-1', className)}
      dangerouslySetInnerHTML={{ __html: out.html }}
    />
  )
}
