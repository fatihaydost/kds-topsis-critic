import { Formula } from '../../../ui/Formula'
import { useRobustnessText } from './text'

export type SourcesPart = 'sweep' | 'perturb' | 'monteCarlo' | 'removal'

type Source = { cite: string; doi: string }

/** docs/research/combinations.md §C. Author lists and venues as there; pages with a hyphen (no dashes on the site). */
const SOURCES = {
  mareschal: { cite: 'Mareschal (1988), European Journal of Operational Research 33(1), 54-64', doi: '10.1016/0377-2217(88)90254-8' },
  salabun: { cite: 'Sałabun and Urbaniak (2020), ICCS 2020, LNCS 12138, 632-645', doi: '10.1007/978-3-030-50417-5_47' },
  lahdelma: { cite: 'Lahdelma, Hokkanen and Salminen (1998), European Journal of Operational Research 106(1), 137-143', doi: '10.1016/S0377-2217(97)00163-X' },
  tervonen: { cite: 'Tervonen and Lahdelma (2007), European Journal of Operational Research 178(2), 500-513', doi: '10.1016/j.ejor.2005.12.037' },
  aires: { cite: 'Aires and Ferreira (2018), Pesquisa Operacional 38(2), 331-362', doi: '10.1590/0101-7438.2018.038.02.0331' },
} satisfies Record<string, Source>

const PARTS: Record<SourcesPart, { tex: string[]; sources: Source[] }> = {
  sweep: {
    tex: [String.raw`w_j' = w_j\,\frac{1 - w_k'}{1 - w_k}\qquad (j \ne k)`],
    sources: [SOURCES.mareschal],
  },
  perturb: {
    tex: [
      String.raw`w_k' = \min\{1,\ \max\{0,\ w_k(1+\delta)\}\},\qquad \delta \in \{\pm 5\%,\ \pm 10\%,\ \pm 20\%\}`,
      String.raw`\mathrm{WS} = 1 - \sum_{i=1}^{n} 2^{-x_i}\,\frac{|x_i - y_i|}{\max\{|x_i - 1|,\ |x_i - n|\}}`,
    ],
    sources: [SOURCES.salabun],
  },
  monteCarlo: {
    tex: [
      String.raw`w \sim \mathrm{Dirichlet}(1, \dots, 1)\quad\text{or}\quad w \sim \mathrm{Dirichlet}(\kappa\,\bar w)`,
      String.raw`b_i^r = \frac{\#\{\text{draws with } \operatorname{rank}(i) = r\}}{N}`,
    ],
    sources: [SOURCES.lahdelma, SOURCES.tervonen],
  },
  removal: {
    tex: [String.raw`w_k' = \frac{w_k}{1 - w_j}\quad (k \ne j),\qquad \rho = 1 - \frac{6\sum_i (x_i - y_i)^2}{n(n^2 - 1)}`],
    sources: [SOURCES.aires, SOURCES.salabun],
  },
}

/** A section's formula and sources (lazy: KaTeX loads with this chunk). */
export default function Sources({ part, recompute }: { part: SourcesPart; recompute?: string | undefined }) {
  const { t } = useRobustnessText()
  const p = PARTS[part]
  return (
    <>
      <p>
        {t(`sources.${part}`)}
        {part === 'removal' && recompute ? ` ${t('sources.removalRecompute', { method: recompute })}` : null}
      </p>
      {p.tex.map((tex) => (
        <Formula key={tex} tex={tex} display />
      ))}
      {part === 'removal' && <p className="text-12">{t('sources.spearmanTies')}</p>}
      <ul className="flex flex-col gap-1 text-12">
        {p.sources.map((src) => (
          <li key={src.doi}>
            {src.cite}.{' '}
            <a href={`https://doi.org/${src.doi}`} target="_blank" rel="noreferrer" className="text-accent underline underline-offset-2 hover:no-underline">
              doi:{src.doi}
            </a>
          </li>
        ))}
      </ul>
    </>
  )
}
