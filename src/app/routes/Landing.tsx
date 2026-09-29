import { useTranslation } from 'react-i18next'
import { Link } from 'wouter'
import { buttonClasses } from '../../ui'

/** `/`. Stub: hero text and the two actions. The live results table and sections come next. */
export function Landing() {
  const { t } = useTranslation()
  return (
    <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1200px] px-4 py-16 outline-none md:px-8 md:py-24">
      <div className="flex max-w-[640px] flex-col items-start gap-5">
        <h1 className="text-32 font-semibold text-balance text-text md:text-44">{t('landing.title')}</h1>
        <p className="text-16 text-text-2">{t('landing.lead')}</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/app" className={buttonClasses({ variant: 'primary' })}>
            {t('landing.openWorkbench')}
          </Link>
          <Link href="/methods" className={buttonClasses({ variant: 'secondary' })}>
            {t('landing.methods')}
          </Link>
        </div>
        <p className="text-13 text-text-3">{t('common.stub')}</p>
      </div>
    </main>
  )
}
