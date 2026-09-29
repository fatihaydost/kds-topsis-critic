import type { MethodContent } from '../types'

// Source: docs/research/methods/waspas.md
export const waspas: MethodContent = {
  id: 'waspas',
  name: { en: 'WASPAS', tr: 'WASPAS' },
  fullName: { en: 'Weighted Aggregated Sum Product ASsessment', tr: 'Ağırlıklı toplam ve çarpım birleşik değerlendirmesi' },
  family: 'ranking-utility',
  status: 'research',
  year: 2012,
  origin: {
    authors: 'Zavadskas, E.K.; Turskis, Z.; Antucheviciene, J.; Zakarevicius, A.',
    year: 2012,
    title: 'Optimization of Weighted Aggregated Sum Product Assessment',
    venue: 'Elektronika ir Elektrotechnika 122(6), 3-6',
    doi: '10.5755/j01.eee.122.6.1810',
  },
  steps: [
    {
      title: { en: 'Linear max normalization', tr: 'Doğrusal maks normalizasyonu' },
      tex: String.raw`\bar x_{ij} = \begin{cases} \dfrac{x_{ij}}{\max_i x_{ij}} & j \in J^{+} \\[2ex] \dfrac{\min_i x_{ij}}{x_{ij}} & j \in J^{-} \end{cases}`,
    },
    {
      title: { en: 'Weighted sum and weighted product', tr: 'Ağırlıklı toplam ve ağırlıklı çarpım' },
      tex: String.raw`Q_i^{(1)} = \sum_{j=1}^{n} w_j\, \bar x_{ij}, \qquad Q_i^{(2)} = \prod_{j=1}^{n} \bar x_{ij}^{\,w_j}`,
    },
    {
      title: { en: 'Blend', tr: 'Karışım' },
      tex: String.raw`Q_i = \lambda\, Q_i^{(1)} + (1 - \lambda)\, Q_i^{(2)}, \qquad \lambda \in [0, 1]`,
      note: {
        en: 'Rank by decreasing Q. lambda = 1 is SAW, lambda = 0 the weighted product model.',
        tr: "Q değerine göre büyükten küçüğe sıralanır. lambda = 1 SAW'dır, lambda = 0 ağırlıklı çarpım modelidir.",
      },
    },
  ],
  combinedWith: [
    {
      methodId: 'entropy',
      text: {
        en: 'The origin example uses entropy weights.',
        tr: 'Özgün örnek entropi ağırlıkları kullanır.',
      },
    },
    {
      methodId: 'swara',
      text: {
        en: 'SWARA then WASPAS: 224 OpenAlex co-mentions, a Lithuanian-school pattern. CRITIC then WASPAS: 93.',
        tr: "SWARA ardından WASPAS: OpenAlex'te 224 ortak geçiş, Litvanya okuluna özgü bir kalıp. CRITIC ardından WASPAS: 93.",
      },
    },
    {
      text: {
        en: 'Chakraborty & Zavadskas (2014) apply WASPAS in manufacturing; their industrial-robot data is reused in the CODAS and CoCoSo papers.',
        tr: 'Chakraborty ve Zavadskas (2014) WASPAS\'ı imalatta uygular; onların endüstriyel robot verisi CODAS ve CoCoSo makalelerinde yeniden kullanılır.',
      },
    },
  ],
  reference: {
    source: 'Zavadskas, E.K.; Turskis, Z.; Antucheviciene, J.; Zakarevicius, A. (2012). Optimization of Weighted Aggregated Sum Product Assessment. Elektronika ir Elektrotechnika 122(6), 3-6',
    doi: '10.5755/j01.eee.122.6.1810',
    table: 'Tables 1, 2 and 4',
    match: 'partial',
    note: {
      en: 'Four alternatives, twelve criteria, lambda from 0 to 1. Table 1 prints one value of alternative a1 as 1.0000; every published result for a1 is reproduced only with 0.1000. With that fix all 44 values of Table 2 match. pyDecision uses a different normalization and does not match.',
      tr: "Dört alternatif, on iki kriter, lambda 0'dan 1'e. Tablo 1, a1 alternatifinin bir değerini 1,0000 basmış; a1 için yayımlanan tüm sonuçlar ancak 0,1000 ile elde ediliyor. Bu düzeltmeyle Tablo 2'nin 44 değerinin hepsi örtüşüyor. pyDecision farklı bir normalizasyon kullanır ve örtüşmez.",
    },
  },
  sources: [
    { label: 'Zavadskas, Turskis, Antucheviciene & Zakarevicius (2012), Elektronika ir Elektrotechnika 122(6), 3-6', doi: '10.5755/j01.eee.122.6.1810' },
    { label: 'Chakraborty & Zavadskas (2014), Applications of WASPAS method in manufacturing decision making, Informatica 25(1), 1-20' },
    { label: 'pyDecision 5.1.1, waspas_method', url: 'https://github.com/Valdecy/pyDecision' },
  ],
  en: {
    summary:
      'WASPAS blends two classic scores: the weighted sum (good when trade-offs are linear) and the weighted product (which punishes very weak values harder). The lambda setting controls the mix: 1 is the pure weighted sum, 0 the pure weighted product, 0.5 an even blend.',
    whenToUse: [
      'Positive ratio-scale data.',
      'You want a result between additive and multiplicative aggregation.',
      'A simple sensitivity analysis over lambda is useful.',
    ],
    whenNot: [
      'Data contain zeros: the product term becomes 0 for that alternative whatever its other values.',
      'You need one fixed answer: lambda changes rankings.',
    ],
    inputs: [
      'Decision matrix, strictly positive recommended.',
      'Criterion type per column, weights summing to 1.',
      'Parameter lambda between 0 and 1, default 0.5.',
    ],
    pitfalls: [
      'A zero benefit value sets the product term to 0; a zero cost value divides by zero.',
      'Report rankings for lambda = 0, 0.5 and 1 at least.',
      'Rank reversal when alternatives are added.',
      'Very small weights push each factor of the product close to 1, so the product part loses discrimination.',
    ],
  },
  tr: {
    summary:
      'WASPAS iki klasik skoru harmanlar: ağırlıklı toplam (ödünleşimler doğrusal ise iyi) ve ağırlıklı çarpım (çok zayıf değerleri daha sert cezalandırır). Karışımı lambda ayarı belirler: 1 saf ağırlıklı toplam, 0 saf ağırlıklı çarpım, 0,5 eşit karışım.',
    whenToUse: [
      'Pozitif, oran ölçekli veri.',
      'Toplamsal ile çarpımsal birleştirme arasında bir sonuç istiyorsun.',
      'lambda üzerinden basit bir duyarlılık analizi işe yarar.',
    ],
    whenNot: [
      'Veride sıfır var: çarpım terimi, diğer değerleri ne olursa olsun o alternatif için 0 olur.',
      'Tek ve sabit bir cevap gerekiyor: lambda sıralamayı değiştirir.',
    ],
    inputs: [
      'Karar matrisi, kesinlikle pozitif olması önerilir.',
      'Her sütun için kriter türü, toplamı 1 olan ağırlıklar.',
      "0 ile 1 arasında lambda parametresi, varsayılan 0,5.",
    ],
    pitfalls: [
      'Sıfır bir fayda değeri çarpım terimini 0 yapar; sıfır bir maliyet değeri sıfıra böler.',
      'En az lambda = 0, 0,5 ve 1 için sıralamaları raporla.',
      'Alternatif eklenince sıralama tersine dönebilir.',
      "Çok küçük ağırlıklar çarpımın her çarpanını 1'e yaklaştırır; çarpım kısmı ayırt ediciliğini yitirir.",
    ],
  },
}
