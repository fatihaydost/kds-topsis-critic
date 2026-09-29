import s from './illustrations.module.css'

export type EmptyMatrixHintProps = {
  /** Accessible name, e.g. "An empty decision matrix: type or paste values". */
  label?: string
  /** Largest drawn width in px (default 216); it shrinks with its container. */
  maxWidth?: number
  className?: string | undefined
}

const NAME_W = 40
const COL_W = 40
const COLS = 4
const ROWS = 3
const HEAD_H = 18
const DIR_H = 16
const ROW_H = 20
const PAD = 4
const W = PAD * 2 + NAME_W + COLS * COL_W
const H = PAD * 2 + HEAD_H + DIR_H + ROWS * ROW_H
/** Benefit (up) or cost (down) per column: the direction row of the real grid. */
const DIRS = ['up', 'up', 'down', 'up'] as const

/**
 * The shape of the Data stage before anything is entered: criterion names on top, a direction
 * row (↑ benefit, ↓ cost), three empty alternative rows, and the first cell framed in the accent
 * with a caret, where typing or pasting starts. No text inside.
 */
export function EmptyMatrixHint({ label = 'An empty decision matrix', maxWidth = W, className }: EmptyMatrixHintProps) {
  const col = (c: number) => PAD + NAME_W + c * COL_W
  const rowY = (r: number) => PAD + HEAD_H + DIR_H + r * ROW_H
  return (
    <figure className={[s.fig, className].filter(Boolean).join(' ')} style={{ maxWidth }} role="img" aria-label={label}>
      <svg className={`${s.svg} ${s.hint}`} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        {/* Header row with criterion names as placeholder bars. */}
        <rect className={s.hintHead} x={PAD} y={PAD} width={W - PAD * 2} height={HEAD_H} />
        {Array.from({ length: COLS }, (_, c) => (
          <rect key={c} className={s.hintBar} x={col(c) + COL_W - 6 - (c % 2 ? 20 : 26)} y={PAD + HEAD_H / 2 - 2} width={c % 2 ? 20 : 26} height={4} rx={1} />
        ))}
        {/* Direction row. */}
        {DIRS.map((d, c) => {
          const cx = col(c) + COL_W - 12
          const cy = PAD + HEAD_H + DIR_H / 2
          return (
            <path
              key={c}
              className={s.hintDir}
              d={d === 'up' ? `M${cx} ${cy + 4}V${cy - 4}M${cx - 3} ${cy - 1}l3 -3 3 3` : `M${cx} ${cy - 4}V${cy + 4}M${cx - 3} ${cy + 1}l3 3 3 -3`}
            />
          )
        })}
        {/* Alternative names and empty cells. */}
        {Array.from({ length: ROWS }, (_, r) => (
          <g key={r}>
            <rect className={s.hintBar} x={PAD + 6} y={rowY(r) + ROW_H / 2 - 2} width={r === 1 ? 18 : 22} height={4} rx={1} />
            {Array.from({ length: COLS }, (_, c) =>
              r === 0 && c === 0 ? null : <rect key={c} className={s.hintCell} x={col(c) + 0.5} y={rowY(r) + 0.5} width={COL_W - 1} height={ROW_H - 1} />,
            )}
          </g>
        ))}
        {/* The focused first cell, with a caret: start here. */}
        <rect className={s.hintFocus} x={col(0) + 0.75} y={rowY(0) + 0.75} width={COL_W - 1.5} height={ROW_H - 1.5} rx={1} />
        <line className={s.hintCaret} x1={col(0) + COL_W - 8} x2={col(0) + COL_W - 8} y1={rowY(0) + 5} y2={rowY(0) + ROW_H - 5} />
      </svg>
    </figure>
  )
}
