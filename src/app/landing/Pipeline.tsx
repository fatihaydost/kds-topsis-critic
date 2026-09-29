import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../ui'

const STAGES = ['data', 'weights', 'ranking', 'robustness'] as const
type StageId = (typeof STAGES)[number]
const PASSES = ['matrix', 'weights', 'ranking'] as const

/** Arrow between two stages, with what flows along it. Horizontal from 1024 px, vertical below. */
function Connector({ label, dashed }: { label: string; dashed: boolean }) {
  const dash = dashed ? '4 4' : undefined
  return (
    <li aria-hidden className="flex items-center justify-center gap-2 py-1 lg:flex-col lg:gap-1 lg:px-1 lg:py-0">
      <svg className="h-8 w-4 lg:hidden" viewBox="0 0 16 32">
        <line x1="8" y1="0" x2="8" y2="26" stroke="var(--line-strong)" strokeWidth="1.5" strokeDasharray={dash} />
        <path d="M3 22 L8 30 L13 22" fill="none" stroke="var(--line-strong)" strokeWidth="1.5" />
      </svg>
      <span className="font-mono text-12 whitespace-nowrap text-text-2">{label}</span>
      <svg className="hidden h-4 w-14 lg:block" viewBox="0 0 56 16">
        <line x1="0" y1="8" x2="48" y2="8" stroke="var(--line-strong)" strokeWidth="1.5" strokeDasharray={dash} />
        <path d="M44 3 L53 8 L44 13" fill="none" stroke="var(--line-strong)" strokeWidth="1.5" />
      </svg>
    </li>
  )
}

function StageBox({ id }: { id: StageId }) {
  const { t } = useTranslation()
  const planned = id === 'robustness'
  return (
    <li
      className={cn(
        'flex min-w-0 flex-col gap-1 rounded-control border p-4',
        planned ? 'border-dashed border-line-strong' : 'border-line bg-surface',
      )}
    >
      <h3 className={cn('text-16 font-semibold', planned ? 'text-text-2' : 'text-text')}>{t(`landing.how.stages.${id}.name`)}</h3>
      <p className="text-13 text-text-2">{t(`landing.how.stages.${id}.method`)}</p>
    </li>
  )
}

/**
 * "How it works": the four stages as an ordered list joined by arrows that name what flows on.
 * Stand-in until the pipeline illustration (src/features/illustrations) lands.
 */
export function Pipeline() {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="how-title" className="flex flex-col gap-6">
      <h2 id="how-title" className="text-24 font-semibold text-text">
        {t('landing.how.title')}
      </h2>
      <ol
        aria-label={t('landing.how.diagramLabel')}
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-stretch"
      >
        {STAGES.map((id, i) => (
          <Fragment key={id}>
            <StageBox id={id} />
            {i < PASSES.length && <Connector label={t(`landing.how.passes.${PASSES[i]!}`)} dashed={i === PASSES.length - 1} />}
          </Fragment>
        ))}
      </ol>
    </section>
  )
}
