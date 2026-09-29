/**
 * The MCDM Workbench mark: a matrix in brackets with the decision inside. Masters live in docs/brand/.
 * Small sizes get their own cuts whose stems and arms sit on whole pixels, so the mark stays crisp:
 * a 16 px grid below 20 px, a 24 px grid from 20 to 31 px, the master drawing from 32 px.
 */
const CUT_16 = { box: 256, d: 'M16 32H80V64H48V192H80V224H16ZM240 32H176V64H208V192H176V224H240ZM128 72L184 128L128 184L72 128Z' }
const CUT_24 = { box: 24, d: 'M2 3H8V6H5V18H8V21H2ZM22 3H16V6H19V18H16V21H22ZM12 7L17 12L12 17L7 12Z' }
const MASTER = { box: 256, d: 'M30 34H72V60H56V196H72V222H30ZM226 34H184V60H200V196H184V222H226ZM128 72L182 126L128 180L74 126Z' }

export function LogoMark({ size = 24, className }: { size?: number; className?: string }) {
  const cut = size < 20 ? CUT_16 : size < 32 ? CUT_24 : MASTER
  return (
    <svg viewBox={`0 0 ${cut.box} ${cut.box}`} width={size} height={size} aria-hidden focusable="false" className={className}>
      <path fill="currentColor" d={cut.d} />
    </svg>
  )
}
