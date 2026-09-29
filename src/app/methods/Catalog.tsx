import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'wouter'
import { allMethods, FAMILY_ORDER } from '../../content/methods'
import type { MethodFamily, MethodStatus } from '../../content/types'
import { useLang } from '../../i18n'
import { Button, EmptyState, SegmentedControl } from '../../ui'
import { SiteFooter } from '../landing/SiteFooter'
import { textLink, usePageMeta } from '../landing/usePageMeta'
import { MethodGlyph } from '../../features/illustrations/MethodGlyph'
import { Guide } from './Guide'
import { firstSentence, pageContainer, StatusLabel } from './shared'

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

  return (
    <>
      <main id="main" tabIndex={-1} className={`${pageContainer} py-10 outline-none md:py-12`}>
        <div className="flex max-w-[70ch] flex-col gap-3">
          <h1 className="text-32 font-semibold text-text">{t('methods.title')}</h1>
          <p className="text-16 text-text-2">{t('methods.catalog.lead', { available: allMethods.filter((m) => m.status === 'available').length, total: allMethods.length })}</p>
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
                  className="self-start"
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

            {shown.length === 0 ? (
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
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {shown.map((m) => (
                  <li key={m.id} className="min-w-0">
                    <Link
                      href={`/methods/${m.id}`}
                      className="group flex h-full flex-col gap-2 rounded-control border border-line bg-surface p-4 no-underline transition-colors hover:border-line-strong hover:bg-surface-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-12 text-text-2">
                          <MethodGlyph family={m.family} size={16} />
                          {t(`methods.familiesShort.${m.family}`)}
                        </span>
                        <StatusLabel status={m.status} />
                      </div>
                      <span className="text-16 font-semibold text-text group-hover:underline">{m.name[lang]}</span>
                      <span className="line-clamp-2 text-13 text-text-2">{firstSentence(m[lang].summary)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
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
