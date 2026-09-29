import { useTranslation } from 'react-i18next'
import { Link } from 'wouter'
import { doiUrl, getExample, shortCitation, type Citation } from '../../data/examples'
import { formatNumber, useLang, type Lang } from '../../i18n'
// Tolerances come straight from the test fixtures, so the page cannot drift from what the tests check.
import krishnan from '../../../tests/fixtures/critic-krishnan2021.json'
import xlsx from '../../../tests/fixtures/critic-xlsx.json'
import opricovicF from '../../../tests/fixtures/opricovic-tzeng-2004-f.json'
import { textLink } from './usePageMeta'

type Row = { method: 'critic' | 'topsis'; citation: Citation; tolerance: number }

/** ±0.00005 in the active locale, with as many decimals as the tolerance needs. */
function formatTolerance(tol: number, lang: Lang): string {
  const decimals = Math.max(0, Math.ceil(-Math.log10(tol)))
  return `±${formatNumber(tol, lang, decimals)}`
}

/** "±10⁻¹²" for the tiny parity tolerances. */
function formatPower(tol: number): string {
  const exp = Math.round(Math.log10(tol))
  const sup: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
  return `±10${String(exp).replace(/./g, (c) => sup[c] ?? c)}`
}

/**
 * "Checked against published results": method, paper, tolerance. What exactly is compared sits
 * behind a disclosure.
 */
export function Verified() {
  const { t } = useTranslation()
  const [lang] = useLang()
  const rows: Row[] = [
    { method: 'critic', citation: getExample('krishnan-2021-smartphones')!.citation, tolerance: krishnan.expected.tolerance },
    { method: 'topsis', citation: getExample('opricovic-tzeng-2004-f')!.citation, tolerance: opricovicF.expected.tolerance },
  ]

  return (
    <section aria-labelledby="verified-title" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 id="verified-title" className="text-24 font-semibold text-text">
          {t('landing.verified.title')}
        </h2>
        <p className="text-16 text-text-2">{t('landing.verified.lead')}</p>
      </div>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {rows.map((r) => (
          <li key={r.method} className="flex flex-col gap-4 rounded-control border border-line bg-surface p-5">
            <div className="flex items-baseline justify-between gap-4">
              <Link href={`/methods/${r.method}`} className="text-20 font-semibold text-text no-underline hover:underline">
                {t(`methods.names.${r.method}`)}
              </Link>
              <span className="num font-mono text-24 text-text">{formatTolerance(r.tolerance, lang)}</span>
            </div>
            <p className="text-14 text-text-2">
              {shortCitation(r.citation, lang)}, {r.citation.venue.split(',')[0]}.{' '}
              <a href={doiUrl(r.citation.doi)} className={textLink} target="_blank" rel="noreferrer">
                doi:{r.citation.doi}
              </a>
            </p>
            <details className="text-13 text-text-2">
              <summary className="cursor-pointer hover:text-text">{t('landing.verified.more')}</summary>
              <p className="mt-2">{t(`landing.verified.${r.method}.compared`)}</p>
              <p className="mt-1">{t('landing.verified.toleranceNote')}</p>
            </details>
          </li>
        ))}
      </ul>

      <details className="text-13 text-text-2">
        <summary className="cursor-pointer hover:text-text">{t('landing.verified.alsoTitle')}</summary>
        <p className="mt-2 max-w-[80ch]">{t('landing.verified.also', { tol: formatPower(xlsx.expected.tolerance) })}</p>
      </details>
    </section>
  )
}
