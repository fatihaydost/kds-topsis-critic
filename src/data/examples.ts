import type { CriterionType } from '../core'
import type { Lang } from '../i18n/lang'

/** Text in both UI languages. */
export type Localized = Record<Lang, string>

export type Citation = {
  /** As printed in the paper, surname first. */
  authors: string
  year: number
  title: string
  /** Journal, volume(issue), pages or article number. */
  venue: string
  doi: string
  /** Where the data comes from inside the paper. */
  tables: string
}

export type ExampleDataset = {
  id: string
  /** Short name for menus. */
  name: Localized
  /** One sentence on what the example is and what it shows. */
  summary: Localized
  /** Method ids this dataset is a published reference for (see src/core/registry.ts). */
  referenceFor: string[]
  citation: Citation
  alternatives: string[]
  criteria: { name: Localized; type: CriterionType }[]
  matrix: number[][]
  /** Weights given in the paper, when the example starts from fixed weights. */
  weights?: number[]
  /** Published outputs, as printed (rounded as in the paper). */
  published: { label: string; values: number[] | number[][]; decimals: number }[]
}

const OPRICOVIC_TZENG_2004: Omit<Citation, 'tables'> = {
  authors: 'Opricovic, S.; Tzeng, G.-H.',
  year: 2004,
  title: 'Compromise solution by MCDM methods: A comparative analysis of VIKOR and TOPSIS',
  venue: 'European Journal of Operational Research 156(2), 445-455',
  doi: '10.1016/S0377-2217(03)00020-1',
}

/**
 * Published datasets only. Every number below is copied from the cited table and is also a test
 * fixture in tests/fixtures (the core tests check that our methods reproduce the published outputs).
 */
export const examples: readonly ExampleDataset[] = [
  {
    id: 'krishnan-2021-smartphones',
    name: { en: 'Smartphones (Krishnan et al. 2021)', tr: 'Akıllı telefonlar (Krishnan vd. 2021)' },
    summary: {
      en: 'Five smartphones on price, screen size, pixel density, thickness and mass. The paper reports the CRITIC weights.',
      tr: 'Beş akıllı telefon; fiyat, ekran boyutu, piksel yoğunluğu, kalınlık ve kütle. Makale CRITIC ağırlıklarını veriyor.',
    },
    referenceFor: ['critic'],
    citation: {
      authors: 'Krishnan, A.R.; Kasim, M.M.; Hamid, R.; Ghazali, M.F.',
      year: 2021,
      title: 'A Modified CRITIC Method to Estimate the Objective Weights of Decision Criteria',
      venue: 'Symmetry 13(6), 973',
      doi: '10.3390/sym13060973',
      tables: 'Table 1 (input), Table 2 and Table 5 (output)',
    },
    alternatives: ['A', 'B', 'C', 'D', 'E'],
    criteria: [
      { name: { en: 'Price', tr: 'Fiyat' }, type: 'cost' },
      { name: { en: 'Screen size', tr: 'Ekran boyutu' }, type: 'benefit' },
      { name: { en: 'Pixel density', tr: 'Piksel yoğunluğu' }, type: 'benefit' },
      { name: { en: 'Thickness', tr: 'Kalınlık' }, type: 'cost' },
      { name: { en: 'Mass', tr: 'Kütle' }, type: 'cost' },
    ],
    matrix: [
      [649, 4.7, 326, 7.1, 143],
      [749, 5.5, 401, 7.3, 192],
      [740, 5.7, 520, 7.6, 171],
      [400, 5.7, 520, 11.1, 179],
      [600, 5.5, 538, 8.9, 152],
    ],
    published: [
      { label: 'critic.sigma', values: [0.4062, 0.4147, 0.4394, 0.4161, 0.4063], decimals: 4 },
      { label: 'critic.weights', values: [0.1872, 0.1838, 0.1691, 0.2599, 0.2], decimals: 4 },
    ],
  },
  {
    id: 'opricovic-tzeng-2004-f',
    name: { en: 'Mountain climbing (Opricovic and Tzeng 2004)', tr: 'Dağ tırmanışı (Opricovic ve Tzeng 2004)' },
    summary: {
      en: 'Three climbing routes on risk and altitude, with equal weights. The paper reports the TOPSIS distances and closeness.',
      tr: 'Üç tırmanış rotası; risk ve yükseklik, eşit ağırlıkla. Makale TOPSIS uzaklıklarını ve yakınlık katsayılarını veriyor.',
    },
    referenceFor: ['topsis'],
    citation: { ...OPRICOVIC_TZENG_2004, tables: 'Tables 1 and 2 (input, problem f), Table 3 (output)' },
    alternatives: ['A1', 'A2', 'A3'],
    criteria: [
      { name: { en: 'Risk (1 to 5)', tr: 'Risk (1 ile 5 arası)' }, type: 'cost' },
      { name: { en: 'Altitude (m above sea level)', tr: 'Yükseklik (deniz seviyesinden m)' }, type: 'benefit' },
    ],
    matrix: [
      [1, 3000],
      [2, 3750],
      [5, 4500],
    ],
    weights: [0.5, 0.5],
    published: [
      { label: 'topsis.distanceBest', values: [0.114, 0.108, 0.365], decimals: 3 },
      { label: 'topsis.distanceWorst', values: [0.365, 0.28, 0.114], decimals: 3 },
      { label: 'topsis.closeness', values: [0.762, 0.722, 0.238], decimals: 3 },
    ],
  },
  {
    id: 'opricovic-tzeng-2004-phi',
    name: {
      en: 'Mountain climbing, other units (Opricovic and Tzeng 2004)',
      tr: 'Dağ tırmanışı, başka birimler (Opricovic ve Tzeng 2004)',
    },
    summary: {
      en: 'The same routes with risk shifted by 5 and altitude in km above the foothill. TOPSIS ranks them differently, which the paper uses to show rank reversal.',
      tr: 'Aynı rotalar; risk 5 kaydırılmış, yükseklik etekten km cinsinden. TOPSIS bu kez farklı sıralıyor; makale bunu sıra değişimini göstermek için kullanıyor.',
    },
    referenceFor: ['topsis'],
    citation: { ...OPRICOVIC_TZENG_2004, tables: 'Tables 1 and 2 (input, problem φ), Table 3 (output)' },
    alternatives: ['A1', 'A2', 'A3'],
    criteria: [
      { name: { en: 'Risk (6 to 10)', tr: 'Risk (6 ile 10 arası)' }, type: 'cost' },
      { name: { en: 'Altitude (km above foothill)', tr: 'Yükseklik (etekten km)' }, type: 'benefit' },
    ],
    matrix: [
      [6, 2.0],
      [7, 2.75],
      [10, 3.5],
    ],
    weights: [0.5, 0.5],
    published: [
      { label: 'topsis.distanceBest', values: [0.154, 0.085, 0.147], decimals: 3 },
      { label: 'topsis.distanceWorst', values: [0.147, 0.134, 0.154], decimals: 3 },
      { label: 'topsis.closeness', values: [0.489, 0.612, 0.511], decimals: 3 },
    ],
  },
]

export const getExample = (id: string): ExampleDataset | undefined => examples.find((x) => x.id === id)

/** "Krishnan, A.R.; Kasim, M.M.; ... (2021). Title. Venue. doi:..." */
export function formatCitation(c: Citation): string {
  return `${c.authors} (${c.year}). ${c.title}. ${c.venue}. doi:${c.doi}`
}

/** "Krishnan et al. (2021)" / "Krishnan vd. (2021)"; two authors are both named. */
export function shortCitation(c: Citation, lang: Lang): string {
  const surnames = c.authors.split(';').map((a) => a.trim().split(',')[0]!.trim())
  const and = lang === 'tr' ? 've' : 'and'
  const etal = lang === 'tr' ? 'vd.' : 'et al.'
  const who =
    surnames.length === 1 ? surnames[0] : surnames.length === 2 ? `${surnames[0]} ${and} ${surnames[1]}` : `${surnames[0]} ${etal}`
  return `${who} (${c.year})`
}

export const doiUrl = (doi: string): string => `https://doi.org/${doi}`
