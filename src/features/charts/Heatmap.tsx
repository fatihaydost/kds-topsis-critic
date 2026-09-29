import { useId, useMemo } from 'react'
import { ChartFigure } from './ChartFigure'
import s from './charts.module.css'
import { heatPaint, layoutHeatmap, type HeatScale } from './layout'
import type { Domain } from './scale'
import { useElementWidth } from './useElementWidth'
import { useHeatTokens } from './useHeatTokens'

export type HeatmapProps = {
  title: string
  rowLabels: string[]
  colLabels: string[]
  /** values[i][j] for row i, column j; null draws an empty cell. */
  values: (number | null)[][]
  /**
   * 'diverging' for signed data such as correlation (default domain -1..1, neutral at 0);
   * 'sequential' for 0..1 data such as a normalized matrix (default domain 0..1).
   */
  scale: HeatScale
  domain?: Domain
  /** Formats the value printed in each cell and in the table. */
  format: (value: number) => string
  description?: string
  tableLabels: {
    /** Summary of the disclosure, e.g. "Show as table". */
    show: string
    /** Header over the row labels, e.g. "Criterion". */
    corner: string
  }
  className?: string
}

/**
 * Matrix heatmap with the value printed in every cell. The fill is a mix of data tokens. The
 * value text is `--text` or `--bg`, whichever contrasts more with that cell's resolved fill in
 * the active theme; a fill on which neither reaches 4.5:1 moves slightly along the ramp
 * (see `heatPaint`), so every printed value stays readable in light and dark.
 */
export function Heatmap({ title, rowLabels, colLabels, values, scale, domain, format, description, tableLabels, className }: HeatmapProps) {
  const uid = useId()
  const [plotRef, width] = useElementWidth<HTMLDivElement>()
  const tokens = useHeatTokens()
  const layout = useMemo(() => layoutHeatmap({ rowLabels, colLabels, width }), [rowLabels, colLabels, width])
  const { labelWidth, headerHeight, cellWidth, cellHeight } = layout

  const text = (v: number | null | undefined) => (typeof v === 'number' && Number.isFinite(v) ? format(v) : '')
  const table = {
    corner: tableLabels.corner,
    columns: colLabels,
    rows: rowLabels.map((label, i) => ({ label, cells: colLabels.map((_, j) => text(values[i]?.[j])) })),
  }

  return (
    <ChartFigure
      titleId={`${uid}-title`}
      tableId={`${uid}-table`}
      title={title}
      description={description}
      showTable={tableLabels.show}
      table={table}
      plotRef={plotRef}
      className={className}
    >
      <svg
        className={s.svg}
        width={layout.width}
        height={layout.height}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        role="img"
        aria-labelledby={`${uid}-title`}
        aria-describedby={`${uid}-table`}
      >
        {layout.colLabels.map((label, j) => (
          <text
            key={`c${j}`}
            className={s.axisLabel}
            x={labelWidth + j * cellWidth + cellWidth / 2}
            y={headerHeight / 2}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {label !== colLabels[j] ? <title>{colLabels[j]}</title> : null}
            {label}
          </text>
        ))}
        {layout.rowLabels.map((label, i) => {
          const y = headerHeight + i * cellHeight
          return (
            <g key={`r${i}`}>
              <text className={s.axisLabel} x={0} y={y + cellHeight / 2} dominantBaseline="central">
                {label !== rowLabels[i] ? <title>{rowLabels[i]}</title> : null}
                {label}
              </text>
              {colLabels.map((_, j) => {
                const v = values[i]?.[j]
                const c = heatPaint(v, scale, domain, tokens)
                const x = labelWidth + j * cellWidth
                return (
                  <g key={j}>
                    <rect className={s.cell} x={x + 1} y={y + 1} width={cellWidth - 2} height={cellHeight - 2} style={{ fill: c.fill }} />
                    <text
                      className={s.cellText}
                      data-ink={c.ink}
                      x={x + cellWidth / 2}
                      y={y + cellHeight / 2}
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {text(v)}
                    </text>
                  </g>
                )
              })}
            </g>
          )
        })}
      </svg>
    </ChartFigure>
  )
}
