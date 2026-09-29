import { Desktop, GithubLogo, Moon, Sun } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { Link, useRoute } from 'wouter'
import { LANGS, useLang, type Lang } from '../../i18n'
import { useThemeMode, type ThemeMode } from '../../state/theme'
import {
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  IconButton,
  iconButtonClasses,
  SegmentedControl,
} from '../../ui'

export const REPO_URL = 'https://github.com/fatihaydost/kds-topsis-critic'

const themeIcons: Record<ThemeMode, typeof Sun> = { system: Desktop, light: Sun, dark: Moon }

function NavLink({ href, children }: { href: string; children: string }) {
  const [active] = useRoute(`${href}/*?`)
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'inline-flex h-8 items-center rounded-control px-2 text-13 font-medium whitespace-nowrap no-underline transition-colors',
        active ? 'text-text' : 'text-text-2 hover:text-text',
      )}
    >
      {children}
    </Link>
  )
}

function LanguageSwitch() {
  const { t } = useTranslation()
  const [lang, setLang] = useLang()
  return (
    <SegmentedControl<Lang>
      aria-label={t('nav.language')}
      value={lang}
      onValueChange={setLang}
      options={LANGS.map((l) => ({
        value: l,
        label: l.toUpperCase(),
        ariaLabel: l === 'tr' ? 'Türkçe' : 'English',
      }))}
    />
  )
}

function ThemeMenu() {
  const { t } = useTranslation()
  const [mode, setMode] = useThemeMode()
  const Icon = themeIcons[mode]
  const modeLabel = t(`nav.theme.${mode}`)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton aria-label={t('nav.theme.button', { mode: modeLabel })} icon={<Icon />} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{t('nav.theme.label')}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={mode} onValueChange={(v) => setMode(v as ThemeMode)}>
          {(['system', 'light', 'dark'] as const).map((m) => {
            const I = themeIcons[m]
            return (
              <DropdownMenuRadioItem key={m} value={m}>
                <I aria-hidden />
                {t(`nav.theme.${m}`)}
              </DropdownMenuRadioItem>
            )
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** 48 px top bar: wordmark, main nav, language, theme, GitHub (from 640 px; the footer carries it below). */
export function TopBar() {
  const { t } = useTranslation()
  return (
    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2 border-b border-line bg-bg px-4">
      <a
        href="#main"
        className="sr-only rounded-control bg-surface px-2 py-1 text-13 focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
      >
        {t('nav.skipToContent')}
      </a>
      <Link href="/" className="mr-2 flex items-baseline gap-2 rounded-control no-underline">
        <span className="text-14 font-semibold tracking-wide text-text">{t('common.wordmark')}</span>
        <span className="hidden text-13 text-text-2 sm:inline">{t('common.productName')}</span>
      </Link>
      <nav aria-label={t('nav.main')} className="flex items-center">
        <NavLink href="/app">{t('nav.workbench')}</NavLink>
        <NavLink href="/methods">{t('nav.methods')}</NavLink>
      </nav>
      <div className="ml-auto flex items-center gap-1">
        <LanguageSwitch />
        <ThemeMenu />
        <span className="hidden sm:inline-flex">
          <a href={REPO_URL} target="_blank" rel="noreferrer" aria-label={t('nav.github')} className={iconButtonClasses()}>
            <GithubLogo aria-hidden />
          </a>
        </span>
      </div>
    </header>
  )
}
