import type { MethodContent } from '../types'

// Source: docs/research/methods/roc.md
export const roc: MethodContent = {
  id: 'roc',
  name: { en: 'ROC', tr: 'ROC' },
  fullName: {
    en: 'Rank-order weights: Rank Order Centroid, Rank Sum, Rank Reciprocal',
    tr: 'Sıraya dayalı ağırlıklar: sıra merkezi (ROC), sıra toplamı, ters sıra',
  },
  family: 'weighting-subjective',
  status: 'research',
  year: 1996,
  origin: {
    authors: 'Barron, F.H.; Barrett, B.E.',
    year: 1996,
    title: 'Decision Quality Using Ranked Attribute Weights',
    venue: 'Management Science 42(11), 1515-1523',
    doi: '10.1287/mnsc.42.11.1515',
    note: {
      en: 'ROC. Roszkowska (2013) also credits Solymosi & Dombi (1985) for centroid weights. Rank Sum and Rank Reciprocal are from Stillwell, Seaver & Edwards (1981). The origins were not read; the formulas follow Roszkowska (2013).',
      tr: 'ROC. Roszkowska (2013) merkez ağırlıkları için Solymosi ve Dombi (1985) kaynağını da anar. Sıra toplamı ve ters sıra Stillwell, Seaver ve Edwards (1981) kaynaklıdır. Özgün kaynaklar okunmadı; formüller Roszkowska (2013) anlatımını izler.',
    },
  },
  steps: [
    {
      title: { en: 'Rank order centroid (default)', tr: 'Sıra merkezi (varsayılan)' },
      tex: String.raw`w(r) = \frac{1}{n}\sum_{k=r}^{n} \frac{1}{k}`,
      note: {
        en: 'r is the rank of the criterion, 1 = most important. Each formula sums to 1 without further normalization; w_j = w(r_j).',
        tr: 'r kriterin sırasıdır, 1 = en önemli. Her formül ek normalizasyon olmadan 1\'e toplanır; w_j = w(r_j).',
      },
    },
    {
      title: { en: 'Rank sum', tr: 'Sıra toplamı' },
      tex: String.raw`w(r) = \frac{2\,(n + 1 - r)}{n\,(n + 1)}`,
    },
    {
      title: { en: 'Rank reciprocal', tr: 'Ters sıra' },
      tex: String.raw`w(r) = \frac{1/r}{\sum_{k=1}^{n} 1/k}`,
    },
  ],
  combinedWith: [
    {
      methodId: 'saw',
      text: {
        en: 'ROC, RS or RR then SAW, and a comparison of AHP with rank weights: Roszkowska (2013).',
        tr: 'ROC, RS ya da RR ardından SAW ve AHP ile sıra ağırlıklarının karşılaştırması: Roszkowska (2013).',
      },
    },
    {
      text: {
        en: 'Rank weights as surrogate weights in decision-quality simulations: Barron & Barrett (1996).',
        tr: 'Karar kalitesi benzetimlerinde vekil ağırlık olarak sıra ağırlıkları: Barron ve Barrett (1996).',
      },
    },
  ],
  reference: {
    source: 'Roszkowska, E. (2013). Rank Ordering Criteria Weighting Methods: a Comparative Overview. Optimum. Studia Ekonomiczne 5(65), 14-33',
    doi: '10.15290/ose.2013.05.65.02',
    table: 'Table 4, row n = 4',
    match: 'match',
    note: {
      en: 'For n = 4, ROC, RS and RR match the printed 2 decimals. Other rows of the same table contain rounding errors (for n = 3 the ROC row sums to 1.02), so only n = 4 is used.',
      tr: "n = 4 için ROC, RS ve RR basılı 2 basamakta örtüşüyor. Aynı tablonun diğer satırlarında yuvarlama hataları var (n = 3 için ROC satırı 1,02'ye toplanıyor), bu yüzden yalnız n = 4 kullanıldı.",
    },
  },
  sources: [
    { label: 'Barron & Barrett (1996), Management Science 42(11), 1515-1523', doi: '10.1287/mnsc.42.11.1515' },
    { label: 'Stillwell, Seaver & Edwards (1981), Organizational Behavior and Human Performance 28(1), 62-77', doi: '10.1016/0030-5073(81)90015-5' },
    { label: 'Roszkowska (2013), Optimum. Studia Ekonomiczne 5(65), 14-33', doi: '10.15290/ose.2013.05.65.02' },
    { label: 'pyDecision 5.1.1, roc_method and rsw_method', url: 'https://github.com/Valdecy/pyDecision' },
  ],
  en: {
    summary:
      'If you can only say which criterion matters most, second most and so on, these formulas turn that ranking into weights. ROC gives the top criterion a clearly larger share, Rank Sum decreases in equal steps, and Rank Reciprocal drops sharply after the first. ROC is the usual default.',
    whenToUse: ['Only ordinal information is available or agreed on (groups, time pressure).'],
    whenNot: [
      'The decision maker can quantify differences: use SWARA, AHP or BWM.',
      'Ties are frequent: the formulas assume a strict ranking.',
    ],
    inputs: ['A rank per criterion, 1 = most important, no ties.', 'Formula: ROC (default), Rank Sum or Rank Reciprocal.'],
    pitfalls: [
      'Ties: the formulas are undefined. Our choice is to average the weights of the tied positions; no source covers this.',
      'n = 1 gives w = 1.',
      'Rank 1 means most important. pyDecision takes an ordered list of labels instead of a rank vector, which is easy to invert by mistake.',
    ],
  },
  tr: {
    summary:
      'Yalnız hangi kriterin en önemli, ikinci önemli vb. olduğunu söyleyebiliyorsan bu formüller sıralamayı ağırlığa çevirir. ROC ilk kritere belirgin biçimde büyük pay verir, sıra toplamı eşit adımlarla azalır, ters sıra ise ilk kriterden sonra hızla düşer. Genelde varsayılan ROC\'tur.',
    whenToUse: ['Yalnız sıralama bilgisi var ya da yalnız onda uzlaşılabiliyor (gruplar, zaman baskısı).'],
    whenNot: [
      'Karar verici farkları sayıyla ifade edebiliyor: SWARA, AHP ya da BWM kullan.',
      'Eşitlikler sık: formüller kesin bir sıralama varsayar.',
    ],
    inputs: ['Her kriter için bir sıra, 1 = en önemli, eşitlik yok.', 'Formül: ROC (varsayılan), sıra toplamı ya da ters sıra.'],
    pitfalls: [
      'Eşitlikler: formüller tanımsızdır. Tercihimiz eşit sıradaki konumların ağırlıklarının ortalamasını almak; bunu ele alan bir kaynak yok.',
      'n = 1 için w = 1.',
      'Sıra 1 en önemli demektir. pyDecision sıra vektörü yerine sıralı bir etiket listesi alır; yanlışlıkla ters çevirmek kolaydır.',
    ],
  },
}
