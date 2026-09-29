import type { ReactNode, Ref } from 'react'
import s from './charts.module.css'

export type ChartTable = {
  /** Header of the first column (row labels). */
  corner: string
  columns: string[]
  rows: { label: string; cells: string[] }[]
}

type ChartFigureProps = {
  titleId: string
  tableId: string
  title: string
  description?: string | undefined
  /** Summary text of the table toggle, e.g. "Show as table". */
  showTable: string
  table: ChartTable
  plotRef: Ref<HTMLDivElement>
  className?: string | undefined
  children: ReactNode
}

/**
 * Shared frame of every chart: a figure with its title, the SVG, and the same data as a real
 * table behind a disclosure. The table is the chart's accessible description.
 */
export function ChartFigure({ titleId, tableId, title, description, showTable, table, plotRef, className, children }: ChartFigureProps) {
  return (
    <figure className={className ? `${s.figure} ${className}` : s.figure} aria-labelledby={titleId} aria-describedby={tableId}>
      <figcaption className={s.caption}>
        <span id={titleId} className={s.title}>
          {title}
        </span>
        {description ? <span className={s.description}>{description}</span> : null}
      </figcaption>
      <div ref={plotRef} className={s.plot}>
        {children}
      </div>
      <details className={s.details}>
        <summary className={s.summary}>{showTable}</summary>
        <div className={s.tableWrap}>
          <table id={tableId} className={s.table}>
            <thead>
              <tr>
                <th scope="col">{table.corner}</th>
                {table.columns.map((c, j) => (
                  <th key={j} scope="col" className={s.num}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((r, i) => (
                <tr key={i}>
                  <th scope="row">{r.label}</th>
                  {r.cells.map((c, j) => (
                    <td key={j} className={s.num}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  )
}
