import { SidebarSimple, X } from '@phosphor-icons/react'
import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { STAGES, type Stage } from '../../state/workbench'
import { Button, cn, IconButton, SegmentedControl } from '../../ui'

/** True at >= 1280 px, where the explanation panel is a fixed right column. */
function useWide(): boolean {
  const query = '(min-width: 1280px)'
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setWide(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return wide
}

export type WorkbenchLayoutProps = {
  stage: Stage
  onStageChange: (stage: Stage) => void
  /** Optional short status per stage shown under its name in the rail (e.g. "5 x 5"). */
  stageMeta?: Partial<Record<Stage, ReactNode>> | undefined
  /** Content of the explanation panel (method notes, formula, sources) for the current stage. */
  explanation: ReactNode
  /** Main column: the grid or table of the current stage. */
  children: ReactNode
}

/**
 * Workbench frame from DESIGN.md §Layout:
 * - >= 1280 px: rail 224 px | main | explanation 320 px.
 * - 768 to 1279 px: rail | main; the explanation opens as a bottom sheet.
 * - < 768 px: stages become a segmented control above main; explanation is a bottom sheet.
 * Main never makes the page scroll sideways; wide content scrolls inside its own container.
 */
export function WorkbenchLayout({ stage, onStageChange, stageMeta, explanation, children }: WorkbenchLayoutProps) {
  const { t } = useTranslation()
  const wide = useWide()
  const [sheetOpen, setSheetOpen] = useState(false)
  const stageLabel = (s: Stage) => t(`workbench.stages.${s}`)

  return (
    <div className="flex min-h-0 flex-1">
      {/* Rail, md and up */}
      <nav
        aria-label={t('workbench.stagesLabel')}
        className="hidden w-56 shrink-0 flex-col border-r border-line py-3 md:flex"
      >
        <ol className="flex flex-col">
          {STAGES.map((s) => {
            const current = s === stage
            return (
              <li key={s}>
                <button
                  type="button"
                  aria-current={current ? 'step' : undefined}
                  onClick={() => onStageChange(s)}
                  className={cn(
                    'relative flex w-full flex-col items-start px-4 py-2 text-left transition-colors',
                    current ? 'bg-surface-2 text-text' : 'text-text-2 hover:bg-surface-2 hover:text-text',
                  )}
                >
                  {current && <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-accent" />}
                  <span className={cn('text-14', current && 'font-medium')}>{stageLabel(s)}</span>
                  {stageMeta?.[s] && <span className="num text-12 text-text-3">{stageMeta[s]}</span>}
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Stage switcher, under md */}
        <div className="border-b border-line px-4 py-2 md:hidden">
          <SegmentedControl<Stage>
            aria-label={t('workbench.stagesLabel')}
            value={stage}
            onValueChange={onStageChange}
            options={STAGES.map((s) => ({ value: s, label: stageLabel(s) }))}
            fullWidth
          />
        </div>

        <div className="flex items-center justify-between gap-4 px-4 pt-4 md:px-6">
          <h1 className="text-20 font-semibold text-text">{stageLabel(stage)}</h1>
          {!wide && (
            <Button
              variant="ghost"
              size="sm"
              icon={<SidebarSimple aria-hidden />}
              aria-expanded={sheetOpen}
              aria-controls="explanation-sheet"
              onClick={() => setSheetOpen((o) => !o)}
            >
              {sheetOpen ? t('workbench.explanation.close') : t('workbench.explanation.open')}
            </Button>
          )}
        </div>

        <main id="main" tabIndex={-1} className="min-w-0 flex-1 px-4 pb-10 outline-none md:px-6">
          {children}
        </main>
      </div>

      {wide ? (
        <aside
          aria-label={t('workbench.explanation.title')}
          className="w-80 shrink-0 overflow-y-auto border-l border-line px-5 py-4"
        >
          <h2 className="text-14 font-semibold text-text">{t('workbench.explanation.title')}</h2>
          <div className="mt-3 text-14 text-text-2">{explanation}</div>
        </aside>
      ) : (
        sheetOpen && (
          <section
            id="explanation-sheet"
            aria-label={t('workbench.explanation.title')}
            className="fixed inset-x-0 bottom-0 z-30 flex max-h-[60dvh] flex-col border-t border-line bg-surface shadow-float animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-2">
              <h2 className="text-14 font-semibold text-text">{t('workbench.explanation.title')}</h2>
              <IconButton aria-label={t('workbench.explanation.close')} icon={<X />} size="sm" onClick={() => setSheetOpen(false)} />
            </div>
            <div className="overflow-y-auto px-4 py-3 text-14 text-text-2">{explanation}</div>
          </section>
        )
      )}
    </div>
  )
}
