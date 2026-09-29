import type { MethodContent } from '../types'

// Source: docs/research/methods/moora.md
export const moora: MethodContent = {
  id: 'moora',
  name: { en: 'MOORA', tr: 'MOORA' },
  fullName: {
    en: 'Multi-Objective Optimization on the basis of Ratio Analysis',
    tr: 'Oran analizine dayalı çok amaçlı optimizasyon',
  },
  family: 'ranking-ratio',
  status: 'research',
  year: 2006,
  origin: {
    authors: 'Brauers, W.K.M.; Zavadskas, E.K.',
    year: 2006,
    title: 'The MOORA method and its application to privatization in a transition economy',
    venue: 'Control and Cybernetics 35(2), 445-469',
    url: 'https://eudml.org/doc/209425',
    note: {
      en: "No DOI. The ratio system first appeared in Brauers (2004, book); the reference example is from the method authors' open-access paper Brauers & Zavadskas (2010).",
      tr: 'DOI yok. Oran sistemi ilk kez Brauers (2004, kitap) içinde yer aldı; referans örnek, yazarların açık erişimli Brauers ve Zavadskas (2010) makalesinden alındı.',
    },
  },
  steps: [
    {
      title: { en: 'Vector normalization', tr: 'Vektör normalizasyonu' },
      tex: String.raw`x^{*}_{ij} = \frac{x_{ij}}{\sqrt{\sum_{i=1}^{m} x_{ij}^2}}`,
    },
    {
      title: { en: 'Ratio system', tr: 'Oran sistemi' },
      tex: String.raw`y^{*}_i = \sum_{j \in J^{+}} w_j\, x^{*}_{ij} - \sum_{j \in J^{-}} w_j\, x^{*}_{ij}`,
      note: {
        en: 'The origin uses no weights (w = 1); rank by decreasing y*.',
        tr: 'Özgün yöntem ağırlık kullanmaz (w = 1); y* değerine göre büyükten küçüğe sıralanır.',
      },
    },
    {
      title: { en: 'Reference point (second view)', tr: 'Referans nokta (ikinci görünüm)' },
      tex: String.raw`r_j = \begin{cases} \max_i x^{*}_{ij} & j \in J^{+} \\ \min_i x^{*}_{ij} & j \in J^{-} \end{cases} \qquad d_i = \max_j \left|r_j - x^{*}_{ij}\right|`,
      note: {
        en: 'Tchebycheff distance to the reference point; rank by increasing d.',
        tr: 'Referans noktaya Chebyshev uzaklığı; d değerine göre küçükten büyüğe sıralanır.',
      },
    },
  ],
  combinedWith: [
    {
      text: {
        en: 'The origin splits an important objective into sub-objectives instead of using weights (Brauers et al. 2008; Brauers & Zavadskas 2010).',
        tr: 'Özgün yöntem, ağırlık kullanmak yerine önemli bir amacı alt amaçlara böler (Brauers vd. 2008; Brauers ve Zavadskas 2010).',
      },
    },
    {
      methodId: 'ahp',
      text: {
        en: 'Weighted MOORA with AHP or Entropy weights is common in manufacturing applications (not verified one by one).',
        tr: 'AHP ya da Entropi ağırlıklı MOORA, imalat uygulamalarında yaygındır (tek tek doğrulanmadı).',
      },
    },
    {
      methodId: 'sd',
      text: {
        en: 'SD then MULTIMOORA for EDM process parameters, as reviewed in Keshavarz-Ghorabaee et al. (2021).',
        tr: 'EDM süreç parametreleri için SD ardından MULTIMOORA, Keshavarz-Ghorabaee vd. (2021) incelemesinde olduğu gibi.',
      },
    },
    {
      methodId: 'mabac',
      text: {
        en: 'Used as a comparison method in the MABAC (2015) and CoCoSo (2019) papers.',
        tr: 'MABAC (2015) ve CoCoSo (2019) makalelerinde karşılaştırma yöntemi olarak kullanılır.',
      },
    },
  ],
  reference: {
    source: 'Brauers, W.K.M.; Zavadskas, E.K. (2010). Project management by MULTIMOORA as an instrument for transition economies. Technological and Economic Development of Economy 16(1), 5-24',
    doi: '10.3846/tede.2010.01',
    match: 'match',
    note: {
      en: 'Published example (Appendix C, Table 2; Appendix D, Table 3; Table 1); this method is not computed here yet, only recomputed during research. Three projects, nine objectives. Ratio sums, reference-point deviations and the full multiplicative form all match (largest gap 0.00015, the paper prints B and C to 3 decimals). An earlier contractor example (Brauers et al. 2008) was rejected because the paper is internally inconsistent.',
      tr: 'Yayımlanmış örnek (Ek C, Tablo 2; Ek D, Tablo 3; Tablo 1); bu yöntem sitede henüz hesaplanmıyor, yalnız araştırmada yeniden hesaplandı. Üç proje, dokuz amaç. Oran toplamları, referans nokta sapmaları ve tam çarpımsal biçim örtüşüyor (en büyük fark 0,00015; makale B ve C için 3 basamak basıyor). Daha önceki müteahhit örneği (Brauers vd. 2008) makale kendi içinde tutarsız olduğu için kullanılmadı.',
    },
  },
  sources: [
    { label: 'Brauers & Zavadskas (2006), Control and Cybernetics 35(2), 445-469', url: 'https://eudml.org/doc/209425' },
    { label: 'Brauers & Zavadskas (2010), Technological and Economic Development of Economy 16(1), 5-24', doi: '10.3846/tede.2010.01' },
    { label: 'Brauers, Zavadskas, Turskis & Vilutienė (2008), Journal of Business Economics and Management 9(4), 245-255', doi: '10.3846/1611-1699.2008.9.245-255' },
    { label: 'pyDecision 5.1.1, moora_method and multimoora_method', url: 'https://github.com/Valdecy/pyDecision' },
  ],
  en: {
    summary:
      'MOORA divides each value by its column length, adds the benefit ratios and subtracts the cost ratios. It is quick, needs no reference point, and weights are optional.',
    whenToUse: [
      'Many objectives, quick screening.',
      'TOPSIS normalization with an additive score.',
    ],
    whenNot: [
      'Users would be confused by a negative net score.',
      'Scales may shift: vector normalization is unit-dependent, as in TOPSIS.',
    ],
    inputs: [
      'Decision matrix, criterion type per column.',
      'Optional weights; the origin uses none (w = 1).',
      'No parameters.',
    ],
    pitfalls: [
      'Negative net scores are fine for ranking; the 2008 paper adds a constant to make the smallest sum 1.',
      'An all-zero column has norm 0; its ratios stay 0.',
      'MULTIMOORA adds a multiplicative form and merges three rankings by dominance; it is not covered here.',
    ],
  },
  tr: {
    summary:
      'MOORA her değeri sütun uzunluğuna böler, fayda oranlarını toplayıp maliyet oranlarını çıkarır. Hızlıdır, referans nokta gerektirmez, ağırlıklar isteğe bağlıdır.',
    whenToUse: [
      'Çok sayıda amaç, hızlı ön eleme.',
      'TOPSIS normalizasyonu, ama toplamsal bir skor istiyorsunuz.',
    ],
    whenNot: [
      'Negatif net skor kullanıcıların kafasını karıştırır.',
      "Ölçekler kayabilir: TOPSIS'teki gibi vektör normalizasyonu birime bağlıdır.",
    ],
    inputs: [
      'Karar matrisi, her sütun için kriter türü.',
      'İsteğe bağlı ağırlıklar; özgün yöntem ağırlık kullanmaz (w = 1).',
      'Parametre yok.',
    ],
    pitfalls: [
      'Negatif net skor sıralama için sorun değildir; 2008 makalesi en küçük toplamı 1 yapmak için sabit ekler.',
      "Tamamı sıfır olan sütunun normu 0'dır; oranları 0 kalır.",
      'MULTIMOORA çarpımsal bir biçim ekler ve üç sıralamayı baskınlıkla birleştirir; burada ele alınmıyor.',
    ],
  },
}
