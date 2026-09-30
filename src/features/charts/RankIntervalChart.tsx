import { useId, useMemo } from 'react'
import { ChartFigure } from './ChartFigure'
import s from './charts.module.css'
import r from './robustness.module.css'
import { layoutRankIntervals } from './sweep'
import { useAnimateValues, useElementWidth } from './useElementWidth'

export type RankIntervalChartProps = {
  title: string
  labels: string[]
  /** Mean rank of each alternative. */
  mean: number[]
  /** 2.5 % and 97.5 % rank quantiles of each alternative. */
  interval: [number, number][]
  /** Number of ranks: the axis runs 1..ranks. */
  ranks: number
  /** Alternatives drawn in the accent. */
  highlight?: readonly number[] | undefined
  /** Mean rank, e.g. 2 decimals in the active locale. */
  format: (value: number) => string
  /** Rank quantiles (whole ranks, or halves between two). */
  formatRank: (value: number) => string
  tableLabels: { show: string; label: string; mean: string; low: string; high: string }
  className?: string | undefined
}

/**
 * Mean rank as a dot and the 95 % rank interval as a whisker, one row per alternative in mean-rank order, rank 1 on
 * the left. When the data change, rows slide to their new order and dots and whiskers move to their new places.
 */
export function RankIntervalChart({ title, labels, mean, interval, ranks, highlight = [], format, formatRank, tableLabels, className }: RankIntervalChartProps) {
  const uid = useId()
  const [plotRef, width] = useElementWidth<HTMLDivElement>()
  const animate = useAnimateValues(width)
  const layout = useMemo(() => layoutRankIntervals({ width, labels, mean, interval, ranks, format }), [width, labels, mean, interval, ranks, format])
  const hi = new Set(highlight)
  const table = {
    corner: tableLabels.label,
    columns: [tableLabels.mean, tableLabels.low, tableLabels.high],
    rows: layout.rows.map((row) => ({
      label: row.label,
      cells: [row.text, formatRank(interval[row.index]![0]), formatRank(interval[row.index]![1])],
    })),
  }
  return (
    <ChartFigure
      titleId={`${uid}-title`}
      tableId={`${uid}-table`}
      title={title}
      showTable={tableLabels.show}
      table={table}
      plotRef={plotRef}
      className={className}
    >
      <svg
        className={animate ? `${s.svg} ${r.animate}` : s.svg}
        width={layout.width}
        height={layout.height}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        role="img"
        aria-labelledby={`${uid}-title`}
        aria-describedby={`${uid}-table`}
      >
        {layout.ticks.map((rank) => (
          <g key={rank}>
            <line className={r.grid} x1={layout.x(rank)} x2={layout.x(rank)} y1={layout.axisY + 6} y2={layout.height} />
            <text className={r.tick} x={layout.x(rank)} y={layout.axisY / 2} textAnchor="middle" dominantBaseline="central">
              {rank}
            </text>
          </g>
        ))}
        {layout.rows.map((row) => {
          const d = `M${row.lo} 0H${row.hi}M${row.lo} -4V4M${row.hi} -4V4`
          return (
            <g
              key={row.index}
              className={r.intervalRow}
              style={{ transform: `translate(0px, ${row.y + 14}px)` }}
              data-highlight={hi.has(row.index) || undefined}
            >
              <text className={r.label} x={0} y={0} dominantBaseline="central">
                {row.label !== row.shortLabel ? <title>{row.label}</title> : null}
                {row.shortLabel}
              </text>
              <path className={r.whisker} d={d} style={{ d: `path("${d}")` }} />
              <circle className={r.meanDot} cx={0} cy={0} r={4} style={{ transform: `translate(${row.x}px, 0px)` }} />
              <text className={r.value} x={layout.right + 8} y={0} dominantBaseline="central">
                {row.text}
              </text>
            </g>
          )
        })}
      </svg>
    </ChartFigure>
  )
}
