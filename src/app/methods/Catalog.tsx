import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'wouter'
import { allMethods, FAMILY_ORDER } from '../../content/methods'
import type { MethodFamily, MethodStatus } from '../../content/types'
import { useLang } from '../../i18n'
import { Button, EmptyState, SegmentedControl } from '../../ui'
import { SiteFooter } from '../landing/SiteFooter'
import { textLink, usePageMeta } from '../landing/usePageMeta'
import { Guide } from './Guide'
import { firstSentence, pageContainer, shortOrigin, StatusLabel } from './shared'

type FamilyFilter = 'all' | MethodFamily
type StatusFilter = 'all' | MethodStatus

/** `/methods`: every method grouped by family, filterable by family and status, plus the guide. */
export default function Catalog() {
  const { t } = useTranslation()
  const [lang] = useLang()
  const [family, setFamily] = useState<FamilyFilter>('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  usePageMeta(t('methods.meta.title'), t('methods.meta.description'))

  const shown = useMemo(
    () => allMethods.filter((m) => (family === 'all' || m.family === family) && (status === 'all' || m.status === status)),
    [family, status],
  )
  const groups = FAMILY_ORDER.map((f) => ({ family: f, items: shown.filter((m) => m.family === f) })).filter((g) => g.items.length > 0)

  return (
    <>
      <main id="main" tabIndex={-1} className={`${pageContainer} py-10 outline-none md:py-12`}>
        <div className="flex max-w-[70ch] flex-col gap-3">
          <h1 className="text-32 font-semibold text-text">{t('methods.title')}</h1>
          <p className="text-16 text-text-2">{t('methods.catalog.lead')}</p>
          <p className="text-14">
            <a href="#guide" className={textLink}>
              {t('methods.catalog.guideLink')}
            </a>
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-12 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-16">
          <div className="flex min-w-0 flex-col gap-8">
            <div role="group" aria-label={t('methods.catalog.filters')} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-12 text-text-2">
                  {t('methods.catalog.familyFilter')}
                </span>
                <div className="-mx-4 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
                  <SegmentedControl<FamilyFilter>
                    aria-label={t('methods.catalog.familyFilter')}
                    value={family}
                    onValueChange={setFamily}
                    options={(['all', ...FAMILY_ORDER] as const).map((f) => ({
                      value: f,
                      label: t(`methods.familiesShort.${f}`),
                      ...(f !== 'all' && { ariaLabel: t(`methods.families.${f}`) }),
                    }))}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-12 text-text-2">{t('methods.catalog.statusFilter')}</span>
                <SegmentedControl<StatusFilter>
                  aria-label={t('methods.catalog.statusFilter')}
                  value={status}
                  onValueChange={setStatus}
                  options={[
                    { value: 'all', label: t('methods.catalog.allStatuses') },
                    { value: 'available', label: t('methods.status.available') },
                    { value: 'research', label: t('methods.status.research') },
                  ]}
                />
              </div>
              <p className="text-13 text-text-2" aria-live="polite">
                {t('methods.catalog.shown', { count: shown.length, total: allMethods.length })}
              </p>
            </div>

            {groups.length === 0 ? (
              <EmptyState
                title={t('methods.catalog.emptyTitle')}
                description={t('methods.catalog.emptyBody')}
                action={
                  <Button
                    onClick={() => {
                      setFamily('all')
                      setStatus('all')
                    }}
                  >
                    {t('methods.catalog.emptyAction')}
                  </Button>
                }
              />
            ) : (
              groups.map((g) => (
                <section key={g.family} aria-labelledby={`family-${g.family}`} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <h2 id={`family-${g.family}`} className="text-20 font-semibold text-text">
                      {t(`methods.families.${g.family}`)}
                    </h2>
                    <p className="max-w-[70ch] text-14 text-text-2">{t(`methods.familyNotes.${g.family}`)}</p>
                  </div>
                  <ul className="flex flex-col border-t border-line">
                    {g.items.map((m) => (
                      <li
                        key={m.id}
                        className="grid grid-cols-1 gap-x-6 gap-y-1.5 border-b border-line py-4 md:grid-cols-[180px_minmax(0,1fr)_200px]"
                      >
                        <div className="flex flex-col gap-1">
                          <Link
                            href={`/methods/${m.id}`}
                            className="text-16 font-semibold text-text underline decoration-line-strong underline-offset-2 hover:decoration-text"
                          >
                            {m.name[lang]}
                          </Link>
                          <span className="text-12 text-text-2">{m.fullName[lang] !== m.name[lang] ? m.fullName[lang] : null}</span>
                        </div>
                        <p className="text-14 text-text-2">{firstSentence(m[lang].summary)}</p>
                        <div className="flex flex-row flex-wrap items-center gap-2 md:flex-col md:items-end md:gap-1.5">
                          <StatusLabel status={m.status} />
                          <span className="text-13 text-text-2 md:text-right">{shortOrigin(m.origin, lang)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))
            )}
          </div>

          <aside className="order-first min-w-0 xl:order-none">
            <div className="rounded-control border border-line bg-surface p-4 md:p-5 xl:sticky xl:top-16 xl:max-h-[calc(100dvh-80px)] xl:overflow-y-auto">
              <Guide />
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
