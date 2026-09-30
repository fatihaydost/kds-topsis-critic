import { lazy, Suspense, useState } from 'react'
import { useRobustnessText } from './text'
import type { SourcesPart } from './Sources'

// KaTeX comes with this chunk: it loads the first time a section's formulas are opened.
const Sources = lazy(() => import('./Sources'))

/** Short headline and at most one sentence (DESIGN.md §Copy). */
export function SectionHead({ id, title, lead }: { id: string; title: string; lead: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 id={id} className="text-16 font-semibold text-text">
        {title}
      </h2>
      <p className="max-w-[72ch] text-14 text-text-2">{lead}</p>
    </div>
  )
}

/** "Formula and sources" under a section: closed by default, its content (and KaTeX) loaded when first opened. */
export function SourcesDisclosure({ part }: { part: SourcesPart }) {
  const { t } = useRobustnessText()
  const [opened, setOpened] = useState(false)
  return (
    <details className="text-13" onToggle={(e) => e.currentTarget.open && setOpened(true)}>
      <summary className="w-fit cursor-pointer rounded-control text-accent hover:text-accent-hover">{t('sources.summary')}</summary>
      <div className="mt-2 flex max-w-[72ch] flex-col gap-3 text-text-2">
        {opened && (
          <Suspense fallback={<p role="status">{t('sources.loading')}</p>}>
            <Sources part={part} />
          </Suspense>
        )}
      </div>
    </details>
  )
}
