/**
 * A small drawing of the decision matrix for the empty Data stage: names on the left, criteria
 * across the top with their direction, values in the body and the active cell in the accent.
 * Decorative (aria-hidden); the text next to it carries the meaning.
 */
export function MatrixHint({ className }: { className?: string }) {
  const colW = 56
  const rowH = 22
  const cols = 3
  const rows = 3
  const width = colW * (cols + 1)
  const height = rowH * (rows + 2)
  const arrows = ['↓', '↑', '↑']
  // Value placeholder widths per cell, so the body reads as numbers of different lengths.
  const lengths = [
    [22, 14, 18],
    [18, 20, 12],
    [14, 16, 22],
  ]
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      style={{ overflow: 'visible' }}
    >
      <rect x={0} y={0} width={width} height={rowH * 2} fill="var(--surface-2)" />
      {Array.from({ length: rows + 2 }, (_, r) => (
        <line key={r} x1={0} x2={width} y1={(r + 1) * rowH - 0.5} y2={(r + 1) * rowH - 0.5} stroke="var(--line)" />
      ))}
      {/* criterion names and directions */}
      {Array.from({ length: cols }, (_, c) => {
        const right = (c + 2) * colW - 8
        return (
          <g key={c}>
            <rect x={right - 26} y={8} width={26} height={5} rx={1} fill="var(--text-3)" opacity={0.55} />
            <text x={right} y={rowH + 15} textAnchor="end" fontSize={11} fill="var(--text-2)" fontFamily="inherit">
              {arrows[c]}
            </text>
          </g>
        )
      })}
      {/* alternatives and values */}
      {Array.from({ length: rows }, (_, r) => {
        const y = (r + 2) * rowH + 8
        return (
          <g key={r}>
            <rect x={8} y={y} width={16} height={5} rx={1} fill="var(--text-2)" opacity={0.6} />
            {Array.from({ length: cols }, (_, c) => {
              const w = lengths[r]![c]!
              const right = (c + 2) * colW - 8
              return <rect key={c} x={right - w} y={y} width={w} height={5} rx={1} fill="var(--text-3)" opacity={0.4} />
            })}
          </g>
        )
      })}
      {/* the active cell */}
      <rect x={colW + 1} y={rowH * 2 + 1} width={colW - 2} height={rowH - 3} fill="none" stroke="var(--accent)" strokeWidth={1.5} rx={2} />
      <line x1={colW * 2 - 7} x2={colW * 2 - 7} y1={rowH * 2 + 6} y2={rowH * 3 - 7} stroke="var(--accent)" strokeWidth={1.25} />
    </svg>
  )
}
