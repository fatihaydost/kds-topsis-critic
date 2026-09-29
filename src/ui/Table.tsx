import { createContext, useContext, type ComponentPropsWithRef, type CSSProperties } from 'react'
import { cn } from './cn'
import { useScrollRegion } from './useScrollRegion'

export type TableDensity = 'compact' | 'regular'

type TableCtx = { density: TableDensity; stickyHeader: boolean }
const Ctx = createContext<TableCtx>({ density: 'regular', stickyHeader: true })

export type TableProps = ComponentPropsWithRef<'table'> & {
  /** compact: 32 px rows (matrices, worked calculation). regular: 40 px rows. */
  density?: TableDensity | undefined
  /** Header row sticks to the top of the scroll container. */
  stickyHeader?: boolean | undefined
  /**
   * Caps the container height so it scrolls vertically and the sticky header has something to
   * stick to. Without it the table grows and only scrolls sideways.
   */
  maxHeight?: number | string | undefined
  /** Classes for the scroll container (the table itself takes `className`). */
  containerClassName?: string | undefined
  /**
   * Name of the scroll container when the table overflows it. Defaults to the table's own
   * `aria-labelledby` or `aria-label`, so labelling the table is enough.
   */
  scrollLabel?: string | undefined
}

/**
 * Data table. Its own container scrolls horizontally, never the page. Horizontal hairlines only,
 * no vertical rules, no zebra; rows highlight on hover. While the table overflows its container
 * (a narrow screen, a max height), the container is a focusable, named region, so keyboard users
 * can scroll to the hidden columns.
 */
export function Table({
  density = 'regular',
  stickyHeader = true,
  maxHeight,
  containerClassName,
  scrollLabel,
  className,
  ...rest
}: TableProps) {
  const style: CSSProperties | undefined = maxHeight === undefined ? undefined : { maxHeight }
  const [ref, region] = useScrollRegion<HTMLDivElement>({
    label: scrollLabel ?? rest['aria-label'],
    labelledBy: scrollLabel ? undefined : rest['aria-labelledby'],
  })
  return (
    <Ctx.Provider value={{ density, stickyHeader }}>
      <div ref={ref} className={cn('max-w-full overflow-auto rounded-control', containerClassName)} style={style} {...region}>
        <table className={cn('w-full border-separate border-spacing-0 text-left', className)} {...rest} />
      </div>
    </Ctx.Provider>
  )
}

export function THead({ className, ...rest }: ComponentPropsWithRef<'thead'>) {
  return <thead className={className} {...rest} />
}

export function TBody({ className, ...rest }: ComponentPropsWithRef<'tbody'>) {
  return <tbody className={cn('[&>tr:hover>*]:bg-surface-2', className)} {...rest} />
}

export type TrProps = ComponentPropsWithRef<'tr'> & {
  /** Marks the row as selected (accent tint), e.g. the best alternative. */
  selected?: boolean | undefined
}

export function Tr({ selected = false, className, ...rest }: TrProps) {
  return (
    <tr
      data-selected={selected || undefined}
      className={cn(selected && '[&>*]:bg-accent-bg', className)}
      {...rest}
    />
  )
}

type CellExtras = {
  /** Right-aligned, tabular figures. Use for every number column. */
  numeric?: boolean | undefined
  /** Plex Mono (matrix cells in the worked calculation). */
  mono?: boolean | undefined
}

const cellBase = 'border-b border-line px-3 align-middle'
const rowHeight: Record<TableDensity, string> = { compact: 'h-8', regular: 'h-10' }
const bodyText: Record<TableDensity, string> = { compact: 'text-13', regular: 'text-14' }

export type ThProps = ComponentPropsWithRef<'th'> & CellExtras

/**
 * Header cell. In THead it is a column header (sticky, surface-2 fill); in TBody pass
 * `scope="row"` for the row label.
 */
export function Th({ numeric = false, mono = false, className, scope, ...rest }: ThProps) {
  const { density, stickyHeader } = useContext(Ctx)
  const isRowHeader = scope === 'row'
  return (
    <th
      scope={scope ?? 'col'}
      className={cn(
        cellBase,
        rowHeight[density],
        'font-medium whitespace-nowrap',
        isRowHeader ? cn(bodyText[density], 'text-text') : 'bg-surface-2 text-12 text-text-2',
        !isRowHeader && stickyHeader && 'sticky top-0 z-10',
        numeric && 'num text-right',
        mono && 'font-mono',
        className,
      )}
      {...rest}
    />
  )
}

export type TdProps = ComponentPropsWithRef<'td'> & CellExtras

export function Td({ numeric = false, mono = false, className, ...rest }: TdProps) {
  const { density } = useContext(Ctx)
  return (
    <td
      className={cn(
        cellBase,
        rowHeight[density],
        bodyText[density],
        'text-text',
        numeric && 'num text-right whitespace-nowrap',
        mono && 'font-mono',
        className,
      )}
      {...rest}
    />
  )
}
