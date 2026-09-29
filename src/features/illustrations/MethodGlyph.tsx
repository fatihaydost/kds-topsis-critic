import { ArrowsLeftRight, ChartBar, Divide, LineSegment, SlidersHorizontal } from '@phosphor-icons/react'
import type { MethodFamily } from '../../content/types'
import s from './illustrations.module.css'

export type MethodGlyphProps = {
  family: MethodFamily
  /** px; 16 to 20 in running text and cards, larger for a page's "idea" block. Default 20. */
  size?: number
  /** Accessible name; without it the glyph is decorative (aria-hidden), next to a visible label. */
  label?: string | undefined
  className?: string | undefined
}

/**
 * One small mark per method family, in currentColor, at Phosphor's regular weight:
 * - objective weights: bars (computed from the data) - Phosphor ChartBar
 * - subjective weights: sliders (set by a person) - Phosphor SlidersHorizontal
 * - distance: two points and the segment between them - Phosphor LineSegment
 * - utility: a sum (Σ), additive value - drawn here on Phosphor's 256 grid, stroke 16
 * - ratio: a division - Phosphor Divide
 * - outranking: a directed arrow pair, pairwise comparison - Phosphor ArrowsLeftRight
 */
export function MethodGlyph({ family, size = 20, label, className }: MethodGlyphProps) {
  const a11y = label ? { role: 'img' as const, 'aria-label': label } : { 'aria-hidden': true as const }
  const cls = [s.glyph, className].filter(Boolean).join(' ')
  switch (family) {
    case 'weighting-objective':
      return <ChartBar size={size} weight="regular" className={cls} {...a11y} />
    case 'weighting-subjective':
      return <SlidersHorizontal size={size} weight="regular" className={cls} {...a11y} />
    case 'ranking-distance':
      return <LineSegment size={size} weight="regular" className={cls} {...a11y} />
    case 'ranking-ratio':
      return <Divide size={size} weight="regular" className={cls} {...a11y} />
    case 'ranking-outranking':
      return <ArrowsLeftRight size={size} weight="regular" className={cls} {...a11y} />
    case 'ranking-utility':
      return (
        <svg className={cls} width={size} height={size} viewBox="0 0 256 256" fill="none" {...a11y}>
          <path d="M192 48H64l72 80-72 80h128" stroke="currentColor" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
  }
}
