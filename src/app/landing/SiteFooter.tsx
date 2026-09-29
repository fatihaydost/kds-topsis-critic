import { GithubLogo } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { REPO_URL } from '../shell/TopBar'
import { textLink } from './usePageMeta'

/**
 * Footer of the landing and method pages: source, licence, author and (where data is entered or
 * shown) the privacy note. The source
 * link matters most on phones, where the top bar hides its GitHub icon.
 */
export function SiteFooter({ privacy = true }: { privacy?: boolean }) {
  const { t } = useTranslation()
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-3 px-4 py-8 text-13 text-text-2 md:flex-row md:items-baseline md:justify-between md:px-8">
        {privacy ? <p className="max-w-[60ch]">{t('landing.footer.privacy')}</p> : <span />}
        <ul className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <li>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-1.5 ${textLink}`}>
              <GithubLogo aria-hidden className="size-4 self-center" />
              {t('landing.footer.source')}
            </a>
          </li>
          <li>
            <a href={`${REPO_URL}/blob/master/LICENSE`} target="_blank" rel="noreferrer" className={textLink}>
              {t('landing.footer.license')}
            </a>
          </li>
          <li>{t('landing.footer.author')}</li>
        </ul>
      </div>
    </footer>
  )
}
