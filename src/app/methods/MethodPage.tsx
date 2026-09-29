import { ArrowLeft } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'wouter'
import { getMethodContent, methodContent } from '../../content/methods'
import { localizeMethod, type MethodContent } from '../../content/types'
import { examples } from '../../data/examples'
import { useLang } from '../../i18n'
import { buttonClasses, cn, Notice } from '../../ui'
import { Formula } from '../../ui/Formula'
import { SiteFooter } from '../landing/SiteFooter'
import { textLink, usePageMeta } from '../landing/usePageMeta'
import { doiHref, pageContainer, shortOrigin, SourceItem, StatusLabel } from './shared'

const SECTIONS = ['what', 'when', 'inputs', 'algorithm', 'combined', 'pitfalls', 'reference', 'sources'] as const
type SectionId = (typeof SECTIONS)[number]

function Section({ id, title, children }: { id: SectionId; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex scroll-mt-16 flex-col gap-3">
      <h2 id={`${id}-title`} className="text-20 font-semibold text-text">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1.5 pl-5 text-16 text-text marker:text-text-3">
      {items.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ul>
  )
}

function NotFoundMethod({ id }: { id: string }) {
  const { t } = useTranslation()
  usePageMeta(t('common.notFound.title'), t('methods.notFound', { id }))
  return (
    <main id="main" tabIndex={-1} className={`${pageContainer} min-h-[60dvh] py-12 outline-none`}>
      <h1 className="text-24 font-semibold text-text">{t('common.notFound.title')}</h1>
      <p className="mt-2 text-16 text-text-2">{t('methods.notFound', { id })}</p>
      <Link href="/methods" className={buttonClasses({ className: 'mt-6' })}>
        {t('methods.backToCatalog')}
      </Link>
    </main>
  )
}

/** `/methods/:id`: the research card of one method, rendered for readers. */
export default function MethodPage({ id }: { id: string }) {
  const m = getMethodContent(id)
  return m ? <MethodArticle m={m} /> : <NotFoundMethod id={id} />
}

function MethodArticle({ m }: { m: MethodContent }) {
  const { t } = useTranslation()
  const [lang] = useLang()
  const l = localizeMethod(m, lang)
  usePageMeta(t('methods.meta.methodTitle', { name: l.name }), l.summary)

  const available = m.status === 'available'
  const workbenchExamples = available ? examples.filter((e) => e.referenceFor.includes(m.id)) : []
  const sectionTitle = (s: SectionId) => t(`methods.page.sections.${s}`)

  return (
    <>
      <main id="main" tabIndex={-1} className={`${pageContainer} py-10 outline-none md:py-12`}>
        <Link href="/methods" className="inline-flex items-center gap-1.5 text-13 text-text-2 no-underline hover:text-text">
          <ArrowLeft aria-hidden className="size-3.5" />
          {t('methods.backToCatalog')}
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-12 xl:grid-cols-[minmax(0,1fr)_220px] xl:gap-16">
          <article className="flex min-w-0 max-w-[760px] flex-col gap-10">
            <header className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-32 font-semibold text-text">{l.name}</h1>
                  <StatusLabel status={m.status} />
                </div>
                {l.fullName !== l.name && <p className="text-16 text-text-2">{l.fullName}</p>}
              </div>
              <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-14">
                <dt className="text-text-2">{t('methods.page.family')}</dt>
                <dd className="text-text">{t(`methods.families.${m.family}`)}</dd>
                <dt className="text-text-2">{t('methods.page.origin')}</dt>
                <dd className="text-text">
                  {shortOrigin(m.origin, lang)}. {m.origin.title}. <span className="text-text-2">{m.origin.venue}.</span>{' '}
                  {m.origin.doi && (
                    <a href={doiHref(m.origin.doi)} target="_blank" rel="noreferrer" className={cn(textLink, '[overflow-wrap:anywhere]')}>
                      doi:{m.origin.doi}
                    </a>
                  )}
                  {l.originNote && <span className="mt-1 block text-13 text-text-2">{l.originNote}</span>}
                </dd>
              </dl>
              {!available && (
                <Notice title={t('methods.page.draftTitle')}>
                  <p>{t('methods.page.draftBody')}</p>
                </Notice>
              )}
            </header>

            <Section id="what" title={sectionTitle('what')}>
              <p className="max-w-[70ch] text-16 text-text">{l.summary}</p>
            </Section>

            <Section id="when" title={sectionTitle('when')}>
              <Bullets items={l.whenToUse} />
              <h3 className="mt-4 text-16 font-semibold text-text">{t('methods.page.sections.whenNot')}</h3>
              <Bullets items={l.whenNot} />
            </Section>

            <Section id="inputs" title={sectionTitle('inputs')}>
              <Bullets items={l.inputs} />
            </Section>

            <Section id="algorithm" title={sectionTitle('algorithm')}>
              <ol className="flex flex-col border-t border-line">
                {l.steps.map((s, i) => (
                  <li key={i} className="grid grid-cols-[28px_minmax(0,1fr)] gap-x-3 border-b border-line py-4">
                    <span className="num pt-0.5 font-mono text-14 text-text-2">{i + 1}</span>
                    <div className="flex min-w-0 flex-col gap-2">
                      <h3 className="text-16 font-medium text-text">{s.title}</h3>
                      <Formula display tex={s.tex} className="text-16" />
                      {s.note && <p className="text-14 text-text-2">{s.note}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </Section>

            <Section id="combined" title={sectionTitle('combined')}>
              {l.combinedWith.length === 0 ? (
                <p className="text-16 text-text-2">{t('methods.page.noCombinations')}</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {l.combinedWith.map((c, i) => (
                    <li key={i} className="grid grid-cols-1 gap-1 md:grid-cols-[120px_minmax(0,1fr)] md:gap-4">
                      <span className="text-16 font-semibold">
                        {c.methodId ? (
                          <Link href={`/methods/${c.methodId}`} className={textLink}>
                            {methodContent[c.methodId].name[lang]}
                          </Link>
                        ) : null}
                      </span>
                      <p className="text-14 text-text-2 md:text-16">{c.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section id="pitfalls" title={sectionTitle('pitfalls')}>
              <Bullets items={l.pitfalls} />
            </Section>

            <Section id="reference" title={sectionTitle('reference')}>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-14 md:grid-cols-[160px_minmax(0,1fr)]">
                <dt className="text-text-2">{t('landing.verified.reference')}</dt>
                <dd className="text-text">
                  {m.reference.source}.{' '}
                  {m.reference.doi && (
                    <a href={doiHref(m.reference.doi)} target="_blank" rel="noreferrer" className={cn(textLink, '[overflow-wrap:anywhere]')}>
                      doi:{m.reference.doi}
                    </a>
                  )}
                </dd>
                {m.reference.table && (
                  <>
                    <dt className="text-text-2">{t('methods.page.reference.where')}</dt>
                    <dd className="text-text">{m.reference.table}</dd>
                  </>
                )}
                <dt className="text-text-2">{t('methods.page.reference.result')}</dt>
                <dd className="flex flex-col gap-1 text-text">
                  <span className="font-medium">{t(`methods.page.reference.${m.reference.match}`)}</span>
                  <span className="text-text-2">{l.referenceNote}</span>
                  <span className="text-13 text-text-2">
                    {t(available ? 'methods.page.reference.tested' : 'methods.page.reference.researchOnly')}
                  </span>
                </dd>
              </dl>
              {workbenchExamples.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                  {workbenchExamples.map((e, i) => (
                    <div key={e.id} className="flex flex-wrap items-center gap-3">
                      <Link
                        href={`/app?example=${e.id}`}
                        aria-label={`${t('methods.page.reference.open')}: ${e.name[lang]}`}
                        className={buttonClasses({ variant: i === 0 ? 'primary' : 'secondary' })}
                      >
                        {t('methods.page.reference.open')}
                      </Link>
                      <span className="text-13 text-text-2">{e.name[lang]}</span>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section id="sources" title={sectionTitle('sources')}>
              <ol className="flex list-decimal flex-col gap-2 pl-5 text-14 text-text marker:text-text-3">
                {m.sources.map((s) => (
                  <li key={s.label}>
                    <SourceItem source={s} />
                  </li>
                ))}
              </ol>
            </Section>
          </article>

          <nav aria-label={t('methods.page.toc')} className="hidden xl:block">
            <div className="sticky top-16 flex flex-col gap-2 border-l border-line pl-4">
              <span className="text-12 font-medium text-text-2">{t('methods.page.toc')}</span>
              <ul className="flex flex-col gap-1.5 text-13">
                {SECTIONS.map((s) => (
                  <li key={s}>
                    <a href={`#${s}`} className="text-text-2 no-underline hover:text-text">
                      {sectionTitle(s)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
