import { Info, Warning, WarningOctagon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { cn } from './cn'

export type NoticeTone = 'info' | 'warning' | 'danger'

const tones: Record<NoticeTone, { box: string; icon: string; Icon: typeof Info }> = {
  info: { box: 'bg-surface-2', icon: 'text-text-2', Icon: Info },
  warning: { box: 'bg-warning-bg', icon: 'text-warning', Icon: Warning },
  danger: { box: 'bg-danger-bg', icon: 'text-danger', Icon: WarningOctagon },
}

export type NoticeProps = {
  tone?: NoticeTone | undefined
  /** Optional bold first line. */
  title?: ReactNode
  children?: ReactNode
  /**
   * 'status' or 'alert' when the notice appears in response to an action and should be announced.
   * Static notices need no role.
   */
  role?: 'status' | 'alert' | undefined
  className?: string | undefined
}

/**
 * Inline message with an icon and text: method notes (info), method warnings (warning),
 * blocking problems (danger). Colour is never the only signal; the text says what happened.
 */
export function Notice({ tone = 'info', title, children, role, className }: NoticeProps) {
  const { box, icon, Icon } = tones[tone]
  return (
    <div role={role} className={cn('flex gap-2.5 rounded-control px-3 py-2.5 text-14 text-text', box, className)}>
      <Icon aria-hidden className={cn('mt-0.5 size-4 shrink-0', icon)} />
      <div className="flex min-w-0 flex-col gap-0.5">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className="text-text-2 [&_a]:underline">{children}</div>}
      </div>
    </div>
  )
}
