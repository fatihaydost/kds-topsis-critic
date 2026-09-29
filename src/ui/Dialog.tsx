import { X } from '@phosphor-icons/react'
import * as RadixDialog from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from './cn'
import { IconButton } from './IconButton'

/** Dialog root (Radix): `open`/`onOpenChange` or uncontrolled. */
export const Dialog = RadixDialog.Root
/** Wrap a Button with `asChild`. */
export const DialogTrigger = RadixDialog.Trigger
/** Wrap a Button with `asChild` to close from the footer. */
export const DialogClose = RadixDialog.Close

export type DialogContentProps = {
  /** Required: the dialog's accessible name, shown as the heading. */
  title: ReactNode
  /** One sentence under the title; also the accessible description. */
  description?: ReactNode
  /** Right-aligned action row (secondary first, primary last). */
  footer?: ReactNode
  /** sm 400 px, md 560 px, lg 720 px max width (centered dialogs). */
  width?: 'sm' | 'md' | 'lg' | undefined
  /**
   * 'center' (default): a dialog in the middle of the screen. 'sheet': a bottom sheet across the
   * full width, up to 70% of the screen height. Both are modal: scrim, focus trap, Escape.
   */
  placement?: 'center' | 'sheet' | undefined
  /** Extra attributes for the content element (e.g. an id or a test id). */
  id?: string | undefined
  className?: string | undefined
  children?: ReactNode
}

const widths = { sm: 'max-w-[400px]', md: 'max-w-[560px]', lg: 'max-w-[720px]' }

/**
 * Modal panel with scrim, focus trap, Escape to close and a close button. Focus moves into the
 * panel when it opens and back to the control that opened it when it closes.
 */
export function DialogContent({ title, description, footer, width = 'md', placement = 'center', id, className, children }: DialogContentProps) {
  const { t } = useTranslation()
  const sheet = placement === 'sheet'
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-40 bg-overlay data-[state=open]:animate-fade-in" />
      <RadixDialog.Content
        id={id}
        className={cn(
          sheet
            ? 'fixed inset-x-0 bottom-0 z-50 flex max-h-[70dvh] w-full flex-col border-t border-line bg-surface shadow-float data-[state=open]:animate-fade-in'
            : cn(
                'fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col',
                'rounded-float border border-line bg-surface shadow-float data-[state=open]:animate-fade-in',
                widths[width],
              ),
          className,
        )}
        {...(description ? {} : { 'aria-describedby': undefined })}
      >
        <div className={cn('flex items-start justify-between gap-4', sheet ? 'border-b border-line px-4 py-2' : 'px-5 pt-4')}>
          <div className="flex flex-col gap-1">
            <RadixDialog.Title className={cn('font-semibold text-text', sheet ? 'text-14 leading-7' : 'text-16')}>{title}</RadixDialog.Title>
            {description && (
              <RadixDialog.Description className="text-14 text-text-2">{description}</RadixDialog.Description>
            )}
          </div>
          <RadixDialog.Close asChild>
            <IconButton aria-label={t('common.actions.close')} icon={<X />} size="sm" className="-mr-1.5" />
          </RadixDialog.Close>
        </div>
        <div className={cn('min-h-0 flex-1 overflow-auto', sheet ? 'px-4 py-3' : 'px-5 py-4')}>{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  )
}
