import type { MethodContent } from '../types'

// Source: docs/research/methods/sd.md
export const sd: MethodContent = {
  id: 'sd',
  name: { en: 'SD', tr: 'SD' },
  fullName: { en: 'Standard deviation weighting', tr: 'Standart sapma ağırlıklandırması' },
  family: 'weighting-objective',
  status: 'research',
  year: 1982,
  origin: {
    authors: 'Zeleny',
    year: 1982,
    title: 'Multiple Criteria Decision Making',
    venue: 'McGraw-Hill',
    note: {
      en: 'No single founding paper was found. Mukhametzyanov (2021) credits Zeleny (1982) for contrast intensity by standard deviation or entropy. Many papers cite Diakoulaki et al. (1995), where SD appears as a baseline for CRITIC; this was not verified from the full text.',
      tr: 'Tek bir kurucu makale bulunamadı. Mukhametzyanov (2021), standart sapma ya da entropi ile kontrast yoğunluğu fikrini Zeleny (1982) kaynağına bağlar. Pek çok makale, SD\'nin CRITIC için karşılaştırma tabanı olarak geçtiği Diakoulaki vd. (1995) kaynağını gösterir; bu tam metinden doğrulanmadı.',
    },
  },
  steps: [
    {
      title: { en: 'Min-max normalization', tr: 'Min-maks normalizasyonu' },
      tex: String.raw`r_{ij} = \begin{cases} \dfrac{x_{ij} - x_j^{\min}}{x_j^{\max} - x_j^{\min}} & j \in J^{+} \\[2ex] \dfrac{x_j^{\max} - x_{ij}}{x_j^{\max} - x_j^{\min}} & j \in J^{-} \end{cases}`,
      note: { en: 'Same as step 1 of CRITIC.', tr: "CRITIC'in 1. adımıyla aynı." },
    },
    {
      title: { en: 'Standard deviation', tr: 'Standart sapma' },
      tex: String.raw`\sigma_j = \sqrt{\frac{1}{m-1}\sum_{i=1}^{m} \left(r_{ij} - \bar r_j\right)^2}`,
    },
    {
      title: { en: 'Weights', tr: 'Ağırlıklar' },
      tex: String.raw`w_j = \frac{\sigma_j}{\sum_{k=1}^{n} \sigma_k}`,
      note: {
        en: 'SD is CRITIC with the conflict term set to 1.',
        tr: 'SD, çatışma terimi 1 alınmış CRITIC\'tir.',
      },
    },
  ],
  combinedWith: [
    {
      methodId: 'moora',
      text: {
        en: 'SD then MULTIMOORA or MOOSRA (EDM process parameters), SD then EDAS, COPRAS, TOPSIS or ARAS (brake disc design), SD then GRA, TOPSIS or ORESTE (material selection), all as reviewed in Keshavarz-Ghorabaee et al. (2021).',
        tr: 'SD ardından MULTIMOORA ya da MOOSRA (EDM süreç parametreleri), SD ardından EDAS, COPRAS, TOPSIS ya da ARAS (fren diski tasarımı), SD ardından GRA, TOPSIS ya da ORESTE (malzeme seçimi); hepsi Keshavarz-Ghorabaee vd. (2021) incelemesinde.',
      },
    },
    {
      methodId: 'critic',
      text: {
        en: 'SD, Entropy and CRITIC compared on the same data: Mukhametzyanov (2021).',
        tr: 'Aynı veri üzerinde SD, Entropi ve CRITIC karşılaştırması: Mukhametzyanov (2021).',
      },
    },
  ],
  reference: {
    source: 'Mukhametzyanov, I.Z. (2021). Specific character of objective methods for determining weights of criteria in MCDM problems: Entropy, CRITIC, SD. Decision Making: Applications in Management and Engineering 4(2), 76-105',
    doi: '10.31181/dmame210402076i',
    table: 'Table 1 (input), Table 2 SD block and Table 4 (output)',
    match: 'match',
    note: {
      en: 'Eight alternatives, five criteria, two decision matrices. Weights and standard deviations match the printed 3 decimals (largest gap 4.9e-4).',
      tr: 'Sekiz alternatif, beş kriter, iki karar matrisi. Ağırlıklar ve standart sapmalar basılı 3 basamakta örtüşüyor (en büyük fark 4,9e-4).',
    },
  },
  sources: [
    { label: 'Zeleny (1982), Multiple Criteria Decision Making, McGraw-Hill' },
    { label: 'Mukhametzyanov (2021), DMAME 4(2), 76-105', doi: '10.31181/dmame210402076i' },
    { label: 'Keshavarz-Ghorabaee et al. (2021), Symmetry 13(4), 525', doi: '10.3390/sym13040525' },
    { label: 'Diakoulaki, Mavrotas & Papayannakis (1995), Computers & Operations Research 22(7), 763-770', doi: '10.1016/0305-0548(94)00059-H' },
  ],
  en: {
    summary:
      'SD weighting scales every criterion to 0-1 and gives more weight to criteria whose values are more spread out across the alternatives. It is the simplest objective method: no correlations, no logarithms. Use it as a transparent baseline, or when criteria are not strongly related to each other.',
    whenToUse: ['A quick, explainable objective weighting.', 'A sanity check against CRITIC.'],
    whenNot: [
      'Criteria are highly correlated: SD counts them twice; use CRITIC.',
      'There are outliers: one extreme value compresses the rest of the min-max range.',
    ],
    inputs: ['Decision matrix, real values (negatives fine), at least 2 alternatives.', 'Criterion type per column (only affects the displayed normalized values).', 'No parameters.'],
    pitfalls: [
      'A constant column has range 0; set it to 0, which gives weight 0, and warn. If all columns are constant, fall back to equal weights.',
      'Criterion direction does not change SD weights under min-max: a cost column has the same spread as its benefit version.',
      'An outlier shrinks the spread of the other values in its column and lowers its weight.',
      'Adding or removing an alternative changes min, max and spread.',
      'SD weights tend to be flat (0.183-0.210 in the reference data), flatter than users often expect.',
    ],
  },
  tr: {
    summary:
      'SD ağırlıklandırması her kriteri 0-1 aralığına ölçekler ve değerleri alternatifler arasında daha çok yayılan kriterlere daha çok ağırlık verir. En basit nesnel yöntemdir: korelasyon yok, logaritma yok. Şeffaf bir karşılaştırma tabanı olarak ya da kriterler birbirine çok bağlı değilse kullan.',
    whenToUse: ['Hızlı ve açıklanabilir nesnel ağırlıklandırma.', 'CRITIC karşısında sağlama kontrolü.'],
    whenNot: [
      'Kriterler arasında yüksek korelasyon var: SD bunları iki kez sayar; CRITIC kullan.',
      'Uç değerler var: tek bir uç değer min-maks aralığının geri kalanını sıkıştırır.',
    ],
    inputs: ['Karar matrisi, gerçek değerler (negatif olabilir), en az 2 alternatif.', 'Her sütun için kriter türü (yalnız gösterilen normalize değerleri etkiler).', 'Parametre yok.'],
    pitfalls: [
      "Sabit bir sütunun aralığı 0'dır; değerlerini 0 al, bu ağırlığını 0 yapar, ve uyar. Bütün sütunlar sabitse eşit ağırlığa dön.",
      'Min-maks altında kriter yönü SD ağırlıklarını değiştirmez: maliyet sütunu fayda haliyle aynı yayılıma sahiptir.',
      'Bir uç değer sütunundaki diğer değerlerin yayılımını daraltır ve ağırlığını düşürür.',
      'Alternatif eklemek ya da çıkarmak min, maks ve yayılımı değiştirir.',
      'SD ağırlıkları düz olmaya eğilimlidir (referans veride 0,183-0,210), kullanıcıların beklediğinden çoğu zaman daha düz.',
    ],
  },
}
