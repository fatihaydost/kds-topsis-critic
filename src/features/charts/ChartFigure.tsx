import { createContext, useCallback, useContext, type ReactNode, type Ref } from 'react'
import { useScrollRegion } from '../../ui/useScrollRegion'
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
 * 'disclosure' (default): the table sits behind "Show as table". 'screen-reader': the table stays
 * the chart's accessible description but is not drawn, for a stage that already shows the same
 * numbers in a real table right below the chart (no third copy of the numbers).
 */
export type ChartTableMode = 'disclosure' | 'screen-reader'
const TableMode = createContext<ChartTableMode>('disclosure')
export const ChartTableModeProvider = TableMode.Provider

/**
 * Shared frame of every chart: a figure with its title, the SVG, and the same data as a real
 * table behind a disclosure. The table is the chart's accessible description.
 */
export function ChartFigure({ titleId, tableId, title, description, showTable, table, plotRef, className, children }: ChartFigureProps) {
  // Both the plot and the table scroll sideways when they do not fit; keyboard users can then
  // focus them and scroll with the arrow keys.
  const [plotRegionRef, plotRegion] = useScrollRegion<HTMLDivElement>({ labelledBy: titleId })
  const [tableRegionRef, tableRegion] = useScrollRegion<HTMLDivElement>({ labelledBy: titleId })
  const tableMode = useContext(TableMode)
  const setPlot = useCallback(
    (el: HTMLDivElement | null) => {
      plotRegionRef(el)
      if (typeof plotRef === 'function') plotRef(el)
      else if (plotRef) plotRef.current = el
    },
    [plotRef, plotRegionRef],
  )
  const tableEl = (
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
  )
  return (
    <figure className={className ? `${s.figure} ${className}` : s.figure} aria-labelledby={titleId} aria-describedby={tableId}>
      <figcaption className={s.caption}>
        <span id={titleId} className={s.title}>
          {title}
        </span>
        {description ? <span className={s.description}>{description}</span> : null}
      </figcaption>
      <div ref={setPlot} className={s.plot} {...plotRegion}>
        {children}
      </div>
      {tableMode === 'screen-reader' ? (
        <div className="sr-only">
          {tableEl}
        </div>
      ) : (
        <details className={s.details}>
          <summary className={s.summary}>{showTable}</summary>
          <div ref={tableRegionRef} className={s.tableWrap} {...tableRegion}>
            {tableEl}
          </div>
        </details>
      )}
    </figure>
  )
}
