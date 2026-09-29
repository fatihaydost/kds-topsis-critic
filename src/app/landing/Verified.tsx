import { useTranslation } from 'react-i18next'
import { Link } from 'wouter'
import { doiUrl, getExample, type Citation } from '../../data/examples'
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

/** "10⁻¹²" style for the tiny parity tolerances. */
function formatPower(tol: number): string {
  const exp = Math.round(Math.log10(tol))
  const sup: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
  return `±10${String(exp).replace(/./g, (c) => sup[c] ?? c)}`
}

/** "Checked against published results": one row per available method, from the fixtures. */
export function Verified() {
  const { t } = useTranslation()
  const [lang] = useLang()
  const rows: Row[] = [
    { method: 'critic', citation: getExample('krishnan-2021-smartphones')!.citation, tolerance: krishnan.expected.tolerance },
    { method: 'topsis', citation: getExample('opricovic-tzeng-2004-f')!.citation, tolerance: opricovicF.expected.tolerance },
  ]

  return (
    <section aria-labelledby="verified-title" className="flex flex-col gap-6">
      <div className="flex max-w-[65ch] flex-col gap-2">
        <h2 id="verified-title" className="text-24 font-semibold text-text">
          {t('landing.verified.title')}
        </h2>
        <p className="text-16 text-text-2">{t('landing.verified.lead')}</p>
      </div>

      <div role="table" aria-labelledby="verified-title" className="flex flex-col">
        <div role="row" className="hidden gap-6 border-b border-line pb-2 text-12 font-medium text-text-2 md:grid md:grid-cols-[120px_minmax(0,1.3fr)_minmax(0,1fr)_140px]">
          <span role="columnheader">{t('landing.verified.method')}</span>
          <span role="columnheader">{t('landing.verified.reference')}</span>
          <span role="columnheader">{t('landing.verified.compared')}</span>
          <span role="columnheader" className="md:text-right">
            {t('landing.verified.tolerance')}
          </span>
        </div>
        {rows.map((r) => (
          <div
            role="row"
            key={r.method}
            className="grid grid-cols-1 gap-2 border-b border-line py-5 md:grid-cols-[120px_minmax(0,1.3fr)_minmax(0,1fr)_140px] md:gap-6"
          >
            <span role="rowheader" className="text-20 font-semibold text-text">
              <Link href={`/methods/${r.method}`} className="no-underline hover:underline">
                {t(`methods.names.${r.method}`)}
              </Link>
            </span>
            <span role="cell" className="flex flex-col gap-1 text-14 text-text">
              <span>
                {r.citation.authors.split(';').map((a) => a.trim().split(',')[0]).join(', ')} ({r.citation.year}).{' '}
                <span className="text-text-2">{r.citation.title}.</span>
              </span>
              <span className="text-13 text-text-2">
                {r.citation.venue}.{' '}
                <a href={doiUrl(r.citation.doi)} className={textLink} target="_blank" rel="noreferrer">
                  doi:{r.citation.doi}
                </a>
              </span>
            </span>
            <span role="cell" className="text-14 text-text-2">
              {t(`landing.verified.${r.method}.compared`)}
            </span>
            <span role="cell" className="flex flex-col md:items-end">
              <span className="num font-mono text-16 text-text">{formatTolerance(r.tolerance, lang)}</span>
              <span className="text-12 text-text-2 md:text-right">{t('landing.verified.toleranceNote')}</span>
            </span>
          </div>
        ))}
      </div>

      <p className="max-w-[80ch] text-13 text-text-2">{t('landing.verified.also', { tol: formatPower(xlsx.expected.tolerance) })}</p>
    </section>
  )
}
