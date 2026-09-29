import { useTranslation } from 'react-i18next'
import { Link } from 'wouter'
import { getMethodContent } from '../../content/methods'
import { localizeMethod, type MethodId } from '../../content/types'
import { doiUrl, getExample, shortCitation } from '../../data/examples'
import { useLang } from '../../i18n'
import { useWorkbench, type Stage } from '../../state/workbench'

const linkClass = 'text-accent underline underline-offset-2 hover:no-underline'

function MethodNotes({ id, fullTitle = false }: { id: MethodId; fullTitle?: boolean }) {
  const { t } = useTranslation()
  const [lang] = useLang()
  const content = getMethodContent(id)
  if (!content) return null
  const m = localizeMethod(content, lang)
  const o = content.origin
  return (
    <section className="flex flex-col gap-3" aria-label={m.name}>
      <div>
        <h3 className="text-14 font-semibold text-text">{m.name}</h3>
        {fullTitle && m.fullName !== m.name && <p className="text-12 text-text-3">{m.fullName}</p>}
      </div>
      <p className="text-14 text-text-2">{m.summary}</p>
      {m.whenToUse.length > 0 && (
        <div>
          <h4 className="text-13 font-medium text-text">{t('workbench.panel.whenToUse')}</h4>
          <ul className="mt-1 flex list-disc flex-col gap-1 pl-4 text-13 text-text-2">
            {m.whenToUse.slice(0, 2).map((x, k) => (
              <li key={k}>{x}</li>
            ))}
          </ul>
        </div>
      )}
      {m.pitfalls.length > 0 && (
        <div>
          <h4 className="text-13 font-medium text-text">{t('workbench.panel.pitfalls')}</h4>
          <ul className="mt-1 flex list-disc flex-col gap-1 pl-4 text-13 text-text-2">
            {m.pitfalls.slice(0, 2).map((x, k) => (
              <li key={k}>{x}</li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <h4 className="text-13 font-medium text-text">{t('workbench.panel.origin')}</h4>
        <p className="mt-1 text-12 text-text-2">
          {shortCitation({ authors: o.authors, year: o.year, title: o.title, venue: o.venue, doi: o.doi ?? '', tables: '' }, lang)}
          {o.doi && (
            <>
              {'. '}
              <a href={doiUrl(o.doi)} target="_blank" rel="noreferrer" className={linkClass}>
                doi:{o.doi}
              </a>
            </>
          )}
        </p>
      </div>
      <Link href={`/methods/${id}`} className={`${linkClass} text-13`}>
        {t('workbench.panel.methodPage', { method: m.name })}
      </Link>
    </section>
  )
}

function DataNotes() {
  const { t } = useTranslation()
  const [lang] = useLang()
  const exampleId = useWorkbench((s) => s.exampleId)
  const example = exampleId ? getExample(exampleId) : undefined
  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-1">
        <h3 className="text-14 font-semibold text-text">{t('workbench.panel.data.title')}</h3>
        <p>{t('workbench.panel.data.body')}</p>
      </section>
      <section className="flex flex-col gap-1">
        <h3 className="text-13 font-medium text-text">{t('workbench.panel.data.importTitle')}</h3>
        <p className="text-13">{t('workbench.panel.data.import')}</p>
      </section>
      {example && (
        <section className="flex flex-col gap-1">
          <h3 className="text-13 font-medium text-text">{t('workbench.panel.data.exampleTitle')}</h3>
          <p className="text-13">{example.summary[lang]}</p>
          <p className="text-12">
            {shortCitation(example.citation, lang)}. {example.citation.venue}.{' '}
            <a href={doiUrl(example.citation.doi)} target="_blank" rel="noreferrer" className={linkClass}>
              doi:{example.citation.doi}
            </a>
          </p>
        </section>
      )}
    </div>
  )
}

function ManualNotes() {
  const { t } = useTranslation()
  return (
    <section className="flex flex-col gap-1">
      <h3 className="text-14 font-semibold text-text">{t('workbench.panel.manual.title')}</h3>
      <p>{t('workbench.panel.manual.body')}</p>
    </section>
  )
}

/** Explanation panel content for the current stage: the selected methods from src/content. */
export function ExplanationPanel({ stage }: { stage: Stage }) {
  const weightMethod = useWorkbench((s) => s.weightMethod)
  const rankingMethod = useWorkbench((s) => s.rankingMethod)
  const weighting = weightMethod === 'manual' ? <ManualNotes /> : <MethodNotes id={weightMethod} fullTitle />

  if (stage === 'data') return <DataNotes />
  if (stage === 'weights') return weighting
  if (stage === 'ranking') return <MethodNotes id={rankingMethod} fullTitle />
  return (
    <div className="flex flex-col gap-6">
      {weighting}
      <div className="border-t border-line pt-4">
        <MethodNotes id={rankingMethod} fullTitle />
      </div>
    </div>
  )
}
