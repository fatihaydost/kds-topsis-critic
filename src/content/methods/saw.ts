import type { MethodContent } from '../types'

// Source: docs/research/methods/saw.md
export const saw: MethodContent = {
  id: 'saw',
  name: { en: 'SAW', tr: 'SAW' },
  fullName: { en: 'Simple Additive Weighting (Weighted Sum Model)', tr: 'Basit toplamsal ağırlıklandırma (ağırlıklı toplam modeli)' },
  family: 'ranking-utility',
  status: 'research',
  year: 1954,
  origin: {
    authors: 'Churchman; Ackoff',
    year: 1954,
    title: 'An approximate measure of value',
    venue: 'Operations Research 2, 172-180',
    note: {
      en: 'A classical method with no single origin paper. Usually traced to Churchman & Ackoff (1954) and MacCrimmon (1968); textbook statement in Hwang & Yoon (1981). None was opened and no DOI was checked. The formulas and the example follow Podvezko (2011).',
      tr: 'Tek bir özgün makalesi olmayan klasik bir yöntem. Genelde Churchman ve Ackoff (1954) ile MacCrimmon (1968) kaynaklarına dayandırılır; ders kitabı anlatımı Hwang ve Yoon (1981). Hiçbiri açılmadı, DOI doğrulanmadı. Formüller ve örnek Podvezko (2011) anlatımını izler.',
    },
  },
  steps: [
    {
      title: { en: 'Linear max normalization', tr: 'Doğrusal maks normalizasyonu' },
      tex: String.raw`r_{ij} = \begin{cases} \dfrac{x_{ij}}{\max_i x_{ij}} & j \in J^{+} \\[2ex] \dfrac{\min_i x_{ij}}{x_{ij}} & j \in J^{-} \end{cases}`,
      note: {
        en: 'Default. Sum and min-max normalization are options; they give different scores and sometimes different ranks.',
        tr: 'Varsayılan. Toplam ve min-maks normalizasyonu seçenektir; farklı skorlar, bazen farklı sıralamalar verirler.',
      },
    },
    {
      title: { en: 'Weighted sum', tr: 'Ağırlıklı toplam' },
      tex: String.raw`S_i = \sum_{j=1}^{n} w_j\, r_{ij}`,
      note: { en: 'Rank by decreasing S.', tr: 'S değerine göre büyükten küçüğe sıralanır.' },
    },
    {
      title: { en: 'Relative score (optional)', tr: 'Göreli skor (isteğe bağlı)' },
      tex: String.raw`\tilde S_i = \frac{S_i}{\sum_{k=1}^{m} S_k}`,
    },
  ],
  combinedWith: [
    {
      methodId: 'ahp',
      text: {
        en: 'Any weighting method (AHP, Entropy, CRITIC).',
        tr: 'Herhangi bir ağırlıklandırma yöntemi (AHP, Entropi, CRITIC).',
      },
    },
    {
      methodId: 'waspas',
      text: {
        en: 'SAW is WASPAS with lambda = 1, and COPRAS with only benefit criteria is SAW with sum normalization.',
        tr: 'SAW, lambda = 1 olan WASPAS\'tır; yalnız fayda kriterli COPRAS da toplam normalizasyonlu SAW\'dır.',
      },
    },
    {
      methodId: 'marcos',
      text: {
        en: 'MARCOS with ideal points from the data gives exactly the same order as SAW with linear max normalization.',
        tr: 'İdeal noktaları veriden alınan MARCOS, doğrusal maks normalizasyonlu SAW ile birebir aynı sırayı verir.',
      },
    },
    {
      methodId: 'edas',
      text: {
        en: 'Comparison baseline in the EDAS (2015) and MABAC (2015) papers.',
        tr: 'EDAS (2015) ve MABAC (2015) makalelerinde karşılaştırma tabanı.',
      },
    },
  ],
  reference: {
    source: 'Podvezko, V. (2011). The Comparative Analysis of MCDA Methods SAW and COPRAS. Inžinerinė ekonomika - Engineering Economics 22(2), 134-146',
    doi: '10.5755/j01.ee.22.2.310',
    table: 'Tables 1-3 and 5-6',
    match: 'partial',
    note: {
      en: 'Four countries, five criteria. Table 2 prints Lithuania\'s salary ratio as 0.599 instead of 306/501 = 0.611, and Table 3 uses the typo, so S(Lithuania) differs by 0.0024; the ranking is the same. The sum-normalized variant (Table 6) matches. Ranks also match Keshavarz Ghorabaee et al. (2015) in 7 of 7 weight sets.',
      tr: "Dört ülke, beş kriter. Tablo 2, Litvanya'nın maaş oranını 306/501 = 0,611 yerine 0,599 basmış ve Tablo 3 bu hatalı değeri kullanmış; bu yüzden S(Litvanya) 0,0024 farklı, sıralama aynı. Toplam normalizasyonlu varyant (Tablo 6) örtüşüyor. Sıralamalar Keshavarz Ghorabaee vd. (2015) ile 7 ağırlık setinin 7'sinde aynı.",
    },
  },
  sources: [
    { label: 'Churchman & Ackoff (1954), Operations Research 2, 172-180' },
    { label: 'Podvezko (2011), Engineering Economics 22(2), 134-146', doi: '10.5755/j01.ee.22.2.310' },
    { label: 'Keshavarz Ghorabaee, Zavadskas, Olfat & Turskis (2015), Informatica 26(3), 435-451', doi: '10.15388/Informatica.2015.57' },
    { label: 'Zavadskas, Turskis, Antucheviciene & Zakarevicius (2012), Elektronika ir Elektrotechnika 122(6), 3-6', doi: '10.5755/j01.eee.122.6.1810' },
    { label: 'pyDecision 5.1.1, saw_method', url: 'https://github.com/Valdecy/pyDecision' },
  ],
  en: {
    summary:
      'SAW turns every criterion into a 0-1 "higher is better" score, multiplies it by the criterion weight and adds everything up. It is the most transparent method: every point of the final score can be traced to one criterion. Choose it when trade-offs between criteria are genuinely linear.',
    whenToUse: ['As a baseline, for explanations and sanity checks.', 'Data on ratio scales.'],
    whenNot: [
      'A terrible value must not be offset: SAW compensates fully.',
      'You cannot fix the normalization: max, sum and min-max give different scores and sometimes different ranks.',
    ],
    inputs: [
      'Decision matrix with positive values.',
      'Criterion type per column, weights summing to 1.',
      'Option: normalization linear max (default), sum or min-max.',
    ],
    pitfalls: [
      'A zero in a cost criterion divides by zero. Negative values need a shift, which changes the result.',
      'The normalization choice changes ranks: on the EDAS Table 5 data, sum normalization gives different ranks than linear max in 3 of 7 weight sets.',
      'Rank reversal when alternatives are added.',
    ],
  },
  tr: {
    summary:
      'SAW her kriteri 0-1 arası "ne kadar yüksekse o kadar iyi" bir skora çevirir, kriter ağırlığıyla çarpar ve hepsini toplar. En şeffaf yöntemdir: nihai skordaki her puan tek bir kritere kadar izlenebilir. Kriterler arası ödünleşimler gerçekten doğrusal ise tercih et.',
    whenToUse: ['Karşılaştırma tabanı, açıklama ve sağlama kontrolü için.', 'Oran ölçekli veri.'],
    whenNot: [
      'Çok kötü bir değer telafi edilmemeli: SAW tam telafi eder.',
      'Normalizasyonu sabitleyemiyorsun: maks, toplam ve min-maks farklı skorlar, bazen farklı sıralamalar verir.',
    ],
    inputs: [
      'Pozitif değerli karar matrisi.',
      'Her sütun için kriter türü, toplamı 1 olan ağırlıklar.',
      'Seçenek: doğrusal maks (varsayılan), toplam ya da min-maks normalizasyonu.',
    ],
    pitfalls: [
      'Maliyet kriterindeki sıfır, sıfıra bölme demektir. Negatif değerler kaydırma gerektirir, bu da sonucu değiştirir.',
      "Normalizasyon seçimi sıralamayı değiştirir: EDAS Tablo 5 verisinde toplam normalizasyonu, 7 ağırlık setinin 3'ünde doğrusal maks normalizasyonundan farklı sıralama veriyor.",
      'Alternatif eklenince sıralama tersine dönebilir.',
    ],
  },
}
