/**
 * The MCDM Workbench mark: a matrix in brackets with the decision inside. Masters live in docs/brand/.
 * Below 24 px it draws the small-size cut, whose stems and arms sit on a 16 px grid so they stay crisp.
 */
export function LogoMark({ size = 20, className }: { size?: number; className?: string }) {
  const d =
    size < 24
      ? 'M16 32H80V64H48V192H80V224H16ZM240 32H176V64H208V192H176V224H240ZM128 72L184 128L128 184L72 128Z'
      : 'M30 34H72V60H56V196H72V222H30ZM226 34H184V60H200V196H184V222H226ZM128 72L182 126L128 180L74 126Z'
  return (
    <svg viewBox="0 0 256 256" width={size} height={size} aria-hidden focusable="false" className={className}>
      <path fill="currentColor" d={d} />
    </svg>
  )
}
