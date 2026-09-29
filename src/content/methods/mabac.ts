import type { MethodContent } from '../types'

// Source: docs/research/methods/mabac.md
export const mabac: MethodContent = {
  id: 'mabac',
  name: { en: 'MABAC', tr: 'MABAC' },
  fullName: {
    en: 'Multi-Attributive Border Approximation area Comparison',
    tr: 'Çok nitelikli sınır yaklaşım alanı karşılaştırması',
  },
  family: 'ranking-distance',
  status: 'research',
  year: 2015,
  origin: {
    authors: 'Pamučar, D.; Ćirović, G.',
    year: 2015,
    title: 'The selection of transport and handling resources in logistics centers using Multi-Attributive Border Approximation area Comparison (MABAC)',
    venue: 'Expert Systems with Applications 42(6), 3016-3028',
    doi: '10.1016/j.eswa.2014.11.057',
    note: {
      en: 'The steps follow Biswas & Das (2018); the origin is cited from its abstract.',
      tr: 'Adımlar Biswas ve Das (2018) anlatımını izler; özgün makaleye özeti üzerinden atıf yapılır.',
    },
  },
  steps: [
    {
      title: { en: 'Min-max normalization', tr: 'Min-maks normalizasyonu' },
      tex: String.raw`t_{ij} = \begin{cases} \dfrac{x_{ij} - x_j^{-}}{x_j^{+} - x_j^{-}} & j \in J^{+} \\[2ex] \dfrac{x_{ij} - x_j^{+}}{x_j^{-} - x_j^{+}} & j \in J^{-} \end{cases} \qquad x_j^{+} = \max_i x_{ij},\ x_j^{-} = \min_i x_{ij}`,
    },
    {
      title: { en: 'Weighted matrix', tr: 'Ağırlıklı matris' },
      tex: String.raw`v_{ij} = w_j \left(t_{ij} + 1\right)`,
      note: {
        en: 'The +1 keeps every value positive so the geometric mean in the next step is defined.',
        tr: '+1, sonraki adımdaki geometrik ortalamanın tanımlı olması için tüm değerleri pozitif tutar.',
      },
    },
    {
      title: { en: 'Border approximation area', tr: 'Sınır yaklaşım alanı' },
      tex: String.raw`g_j = \left(\prod_{i=1}^{m} v_{ij}\right)^{1/m}`,
    },
    {
      title: { en: 'Distance from the border', tr: 'Sınıra uzaklık' },
      tex: String.raw`q_{ij} = v_{ij} - g_j`,
      note: {
        en: 'Positive: upper area; negative: lower area.',
        tr: 'Pozitifse üst bölge, negatifse alt bölge.',
      },
    },
    {
      title: { en: 'Score', tr: 'Skor' },
      tex: String.raw`S_i = \sum_{j=1}^{n} q_{ij}`,
      note: { en: 'Rank by decreasing S.', tr: 'S değerine göre büyükten küçüğe sıralanır.' },
    },
  ],
  combinedWith: [
    {
      text: {
        en: 'DEMATEL then MABAC in the origin paper (per its abstract).',
        tr: 'Özgün makalede DEMATEL ardından MABAC (özetine göre).',
      },
    },
    {
      methodId: 'entropy',
      text: {
        en: 'Entropy then MABAC: Biswas & Das (2018), the reference example here.',
        tr: 'Entropi ardından MABAC: buradaki referans örnek olan Biswas ve Das (2018).',
      },
    },
    {
      methodId: 'saw',
      text: {
        en: 'The origin compares MABAC with SAW, COPRAS, TOPSIS, MOORA and VIKOR (abstract).',
        tr: "Özgün makale MABAC'ı SAW, COPRAS, TOPSIS, MOORA ve VIKOR ile karşılaştırır (özet).",
      },
    },
  ],
  reference: {
    source: 'Biswas, T.K.; Das, M.C. (2018). Selection of hybrid vehicle for green environment using multi-attributive border approximation area comparison method. Management Science Letters 8, 121-130',
    doi: '10.5267/j.msl.2017.11.004',
    match: 'match',
    note: {
      en: "Published example (Tables 2-7); this method is not computed here yet, only recomputed during research. Nine hybrid vehicles, five criteria. G, Q and S match the paper's 9 printed digits (difference below 1e-6). Three of the five weights are read from Table 4, because the paper shows them only in a pie chart. pyDecision ignores the weights and does not match.",
      tr: "Yayımlanmış örnek (Tablo 2-7); bu yöntem sitede henüz hesaplanmıyor, yalnız araştırmada yeniden hesaplandı. Dokuz hibrit araç, beş kriter. G, Q ve S makalenin basılı 9 basamağıyla örtüşüyor (fark 1e-6'nın altında). Beş ağırlığın üçü Tablo 4'ten okundu, çünkü makale bunları yalnız pasta grafikte veriyor. pyDecision ağırlıkları yok sayar ve örtüşmez.",
    },
  },
  sources: [
    { label: 'Pamučar & Ćirović (2015), Expert Systems with Applications 42(6), 3016-3028', doi: '10.1016/j.eswa.2014.11.057' },
    { label: 'Biswas & Das (2018), Management Science Letters 8, 121-130', doi: '10.5267/j.msl.2017.11.004' },
    { label: 'CRAN package mabacR 0.1.0, dataset mabac_df (origin input data)' },
    { label: 'pyDecision 5.1.1, mabac_method', url: 'https://github.com/Valdecy/pyDecision' },
  ],
  en: {
    summary:
      'MABAC sets a border per criterion (the geometric mean of all alternatives) and measures how far above or below it each alternative lies. The score is positive above the border, negative below.',
    whenToUse: [
      'You want a signed score: above or below a data-derived border.',
      'Units may change: min-max ignores changes of unit or zero point.',
    ],
    whenNot: [
      'A criterion is constant: min-max is undefined for it.',
      'The alternative set will change: the border depends on all alternatives.',
    ],
    inputs: [
      'Decision matrix, criterion type per column, weights summing to 1.',
      'No parameters.',
    ],
    pitfalls: [
      'A constant column divides by zero; set t = 0, so q = 0 for that criterion.',
      'v is at least w, so the geometric mean is always defined; a zero weight removes the column.',
      'Rank reversal when the alternative set changes.',
    ],
  },
  tr: {
    summary:
      'MABAC her kriter için bir sınır kurar (tüm alternatiflerin geometrik ortalaması) ve her alternatifin bu sınırın ne kadar üstünde ya da altında kaldığını ölçer. Skor sınırın üstünde pozitif, altında negatiftir.',
    whenToUse: [
      'Veriden türetilen bir sınırın üstünü ya da altını gösteren işaretli skor.',
      'Birimler değişebilir: min-maks, birim ve sıfır noktası değişikliğinden etkilenmez.',
    ],
    whenNot: [
      'Bir kriter sabit: min-maks o kriter için tanımsızdır.',
      'Alternatif kümesi değişecek: sınır tüm alternatiflere bağlıdır.',
    ],
    inputs: [
      'Karar matrisi, her sütun için kriter türü, toplamı 1 olan ağırlıklar.',
      'Parametre yok.',
    ],
    pitfalls: [
      'Sabit sütun sıfıra böler; t = 0 alınır, o kriter için q = 0 olur.',
      'v en az w kadardır, bu yüzden geometrik ortalama her zaman tanımlıdır; sıfır ağırlık sütunu devreden çıkarır.',
      'Alternatif kümesi değişince sıralama tersine dönebilir.',
    ],
  },
}
