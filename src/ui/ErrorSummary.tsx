import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from './cn'

export type ErrorSummaryItem = {
  /** id of the control to focus (a Field `id`, a grid cell id). */
  targetId: string
  message: ReactNode
}

export type ErrorSummaryProps = {
  errors: readonly ErrorSummaryItem[]
  /** Defaults to validation.summaryTitle ("There is a problem"). */
  title?: ReactNode
  /** Take focus on mount (GOV.UK). Default true. */
  autoFocus?: boolean | undefined
  /** Change this value to move focus to the summary again (e.g. on each failed submit). */
  focusKey?: string | number | undefined
  className?: string | undefined
}

/**
 * GOV.UK error summary: a heading and a list of links, one per problem, at the top of a stage.
 * It takes focus when it appears; each link focuses and scrolls to its control.
 * Renders nothing when `errors` is empty.
 */
export function ErrorSummary({ errors, title, autoFocus = true, focusKey, className }: ErrorSummaryProps) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const hasErrors = errors.length > 0

  useEffect(() => {
    if (autoFocus && hasErrors) ref.current?.focus()
  }, [autoFocus, hasErrors, focusKey])

  if (!hasErrors) return null

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      aria-labelledby={titleId}
      // It takes focus by script (after a failed Continue, often from a mouse click), where
      // :focus-visible may not match, so the ring is shown on :focus as well (GOV.UK).
      className={cn('rounded-control border-2 border-danger bg-surface px-4 py-3 outline-none focus:shadow-[var(--ring)]', className)}
    >
      <h2 id={titleId} className="text-16 font-semibold text-text">
        {title ?? t('validation.summaryTitle')}
      </h2>
      <ul className="mt-2 flex flex-col gap-1">
        {errors.map((e, i) => (
          <li key={`${e.targetId}-${i}`}>
            <a
              href={`#${e.targetId}`}
              className="text-14 font-medium text-danger underline underline-offset-2 hover:no-underline"
              onClick={(ev) => {
                const el = document.getElementById(e.targetId)
                if (!el) return
                ev.preventDefault()
                el.scrollIntoView({ block: 'center' })
                el.focus({ preventScroll: true })
              }}
            >
              {e.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
