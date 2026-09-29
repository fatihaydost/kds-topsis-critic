import { ISO_C_DEFAULT, isoClosenessEnd, type Point } from './geometry'
import s from './illustrations.module.css'

export type MethodThumbProps =
  | {
      /** Weight bars: CRITIC or equal weights, the largest in the accent. */
      kind: 'bars'
      values: readonly number[]
      highlight?: number | undefined
      className?: string | undefined
    }
  | {
      /** TOPSIS distance plane: (D+, D-) points and the rays of constant closeness. */
      kind: 'plane'
      points: readonly Point[]
      highlight?: number | undefined
      className?: string | undefined
    }

const W = 132
const H = 72
const PAD = 6

/**
 * A small picture of a method's idea for catalogue cards: no text, no numbers, decorative
 * (aria-hidden). The shapes come from real computed values passed in by the page.
 */
export function MethodThumb(props: MethodThumbProps) {
  const cls = [s.thumb, props.className].filter(Boolean).join(' ')
  if (props.kind === 'bars') {
    const { values, highlight } = props
    const max = Math.max(...values, 1e-12)
    const n = values.length
    const gap = 6
    const bw = (W - 2 * PAD - gap * (n - 1)) / Math.max(n, 1)
    return (
      <svg className={cls} width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        <line className={s.thumbAxis} x1={PAD - 2} x2={W - PAD + 2} y1={H - PAD} y2={H - PAD} />
        {values.map((v, i) => {
          const h = (v / max) * (H - 2 * PAD - 4)
          return (
            <rect
              key={i}
              className={i === highlight ? s.thumbAccent : s.thumbMark}
              x={PAD + i * (bw + gap)}
              y={H - PAD - h}
              width={bw}
              height={h}
            />
          )
        })}
      </svg>
    )
  }
  const { points, highlight } = props
  const mx = Math.max(...points.map((p) => p.x), 1e-12) * 1.15
  const my = Math.max(...points.map((p) => p.y), 1e-12) * 1.15
  const k = Math.min((W - 2 * PAD) / mx, (H - 2 * PAD) / my)
  const xMax = (W - 2 * PAD) / k
  const yMax = (H - 2 * PAD) / k
  const X = (v: number) => PAD + v * k
  const Y = (v: number) => H - PAD - v * k
  return (
    <svg className={cls} width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      {ISO_C_DEFAULT.map((c) => {
        const e = isoClosenessEnd(c, xMax, yMax)
        return <line key={c} className={s.iso} x1={X(0)} y1={Y(0)} x2={X(e.x)} y2={Y(e.y)} />
      })}
      <path className={s.thumbAxis} d={`M${PAD} ${PAD - 2}V${H - PAD}H${W - PAD + 2}`} fill="none" />
      {points.map((p, i) => (
        <circle key={i} className={i === highlight ? s.thumbAccent : s.thumbMark} cx={X(p.x)} cy={Y(p.y)} r={i === highlight ? 4 : 3.5} />
      ))}
    </svg>
  )
}
