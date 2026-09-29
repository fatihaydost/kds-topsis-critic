import type { MethodContent } from '../types'

// Source: docs/research/methods/codas.md
export const codas: MethodContent = {
  id: 'codas',
  name: { en: 'CODAS', tr: 'CODAS' },
  fullName: { en: 'COmbinative Distance-based ASsessment', tr: 'Birleşik uzaklık tabanlı değerlendirme' },
  family: 'ranking-distance',
  status: 'research',
  year: 2016,
  origin: {
    authors: 'Keshavarz Ghorabaee, M.; Zavadskas, E.K.; Turskis, Z.; Antucheviciene, J.',
    year: 2016,
    title: 'A new combinative distance-based assessment (CODAS) method for multi-criteria decision-making',
    venue: 'Economic Computation and Economic Cybernetics Studies and Research 50(3), 25-44',
    url: 'https://ideas.repec.org/a/cys/ecocyb/v50y2016i3p25-44.html',
    note: {
      en: 'No DOI found; none is printed in the PDF.',
      tr: "DOI bulunamadı; PDF'te de basılı değil.",
    },
  },
  steps: [
    {
      title: { en: 'Linear normalization', tr: 'Doğrusal normalizasyon' },
      tex: String.raw`n_{ij} = \begin{cases} \dfrac{x_{ij}}{\max_i x_{ij}} & j \in J^{+} \\[2ex] \dfrac{\min_i x_{ij}}{x_{ij}} & j \in J^{-} \end{cases}`,
    },
    {
      title: { en: 'Weighting and negative-ideal point', tr: 'Ağırlıklandırma ve negatif ideal nokta' },
      tex: String.raw`r_{ij} = w_j\, n_{ij}, \qquad ns_j = \min_i r_{ij}`,
    },
    {
      title: { en: 'Euclidean and Taxicab distances', tr: 'Öklid ve Taxicab uzaklıkları' },
      tex: String.raw`E_i = \sqrt{\sum_{j=1}^{n} \left(r_{ij} - ns_j\right)^2}, \qquad T_i = \sum_{j=1}^{n} \left|r_{ij} - ns_j\right|`,
    },
    {
      title: { en: 'Relative assessment matrix', tr: 'Göreli değerlendirme matrisi' },
      tex: String.raw`h_{ik} = (E_i - E_k) + \psi(E_i - E_k)\,(T_i - T_k), \qquad \psi(x) = \begin{cases} 1 & |x| \ge \tau \\ 0 & |x| < \tau \end{cases}`,
      note: {
        en: 'psi as printed in Eq. (10) of the origin, which reproduces every published number. The paper\'s text says the opposite (use Taxicab when the Euclidean gap is below tau).',
        tr: "psi, özgün makaledeki Denklem (10)'da basıldığı gibi; yayımlanan tüm sayıları bu verir. Makalenin metni ise tersini söyler (Öklid farkı tau'nun altındaysa Taxicab kullanılsın).",
      },
    },
    {
      title: { en: 'Assessment score', tr: 'Değerlendirme skoru' },
      tex: String.raw`H_i = \sum_{k=1}^{m} h_{ik}`,
      note: {
        en: 'Rank by decreasing H.',
        tr: 'H değerine göre büyükten küçüğe sıralanır.',
      },
    },
  ],
  combinedWith: [
    {
      text: {
        en: 'The origin uses weights given with the problem: Example 1 from Chakraborty & Zavadskas (2014), Example 2 expert weights from Zavadskas & Turskis (2010).',
        tr: 'Özgün makale problemle verilen ağırlıkları kullanır: 1. örnekte Chakraborty ve Zavadskas (2014), 2. örnekte Zavadskas ve Turskis (2010) uzman ağırlıkları.',
      },
    },
    {
      methodId: 'edas',
      text: {
        en: 'Simulated weight sets for sensitivity, compared with WASPAS, COPRAS, TOPSIS, VIKOR and EDAS (origin, Tables 9-11).',
        tr: 'Duyarlılık için benzetim ağırlık setleri; WASPAS, COPRAS, TOPSIS, VIKOR ve EDAS ile karşılaştırma (özgün makale, Tablo 9-11).',
      },
    },
    {
      methodId: 'aras',
      text: {
        en: 'Example 2 reuses the office-microclimate data of the ARAS paper (2010).',
        tr: '2. örnek, ARAS makalesinin (2010) ofis mikroklima verisini yeniden kullanır.',
      },
    },
  ],
  reference: {
    source: 'Keshavarz Ghorabaee, M.; Zavadskas, E.K.; Turskis, Z.; Antucheviciene, J. (2016). A new combinative distance-based assessment (CODAS) method for multi-criteria decision-making. Economic Computation and Economic Cybernetics Studies and Research 50(3), 25-44',
    table: 'Example 1: Tables 1-4; Example 2: Tables 5-8',
    match: 'match',
    note: {
      en: 'Industrial-robot selection (7 x 5) and office microclimate (14 x 6). E, T and H match both examples and the rankings are identical. The headers of Tables 1 and 2 swap two columns (tip speed and repeatability); Table 3 confirms which is which. pyDecision uses a different h formula and does not match.',
      tr: 'Endüstriyel robot seçimi (7 x 5) ve ofis mikrokliması (14 x 6). E, T ve H iki örnekte de örtüşüyor, sıralamalar aynı. Tablo 1 ve 2 başlıklarında iki sütun (uç hızı ve tekrarlanabilirlik) yer değiştirmiş; hangisinin hangisi olduğunu Tablo 3 doğruluyor. pyDecision farklı bir h formülü kullanır ve örtüşmez.',
    },
  },
  sources: [
    { label: 'Keshavarz Ghorabaee, Zavadskas, Turskis & Antucheviciene (2016), ECECSR 50(3), 25-44', url: 'https://ideas.repec.org/a/cys/ecocyb/v50y2016i3p25-44.html' },
    { label: 'pyDecision 5.1.1, codas_method', url: 'https://github.com/Valdecy/pyDecision' },
  ],
  en: {
    summary:
      'CODAS measures how far each alternative is from the worst point, mainly by straight-line (Euclidean) distance, with city-block (Taxicab) distance as a second measure. Every alternative is compared with every other one; the one that beats the others by the largest total margin wins.',
    whenToUse: [
      'Benefit and cost data.',
      'You want a pairwise-comparison style aggregation that uses two notions of distance.',
    ],
    whenNot: [
      'You cannot defend a value for the threshold tau: the ranking can change with it.',
      'Cost criteria contain zeros (min/x normalization).',
    ],
    inputs: [
      'Decision matrix with non-negative values; cost criteria strictly positive.',
      'Criterion type per column, weights summing to 1.',
      'Threshold tau, default 0.02, suggested range 0.01-0.05.',
    ],
    pitfalls: [
      'The meaning of psi is contradictory in the origin paper; we follow Eq. (10) because it reproduces the published numbers, and say so on the page.',
      'tau is in units of weighted normalized distance, so its effect depends on the weights and the number of alternatives.',
      'A cost value of 0 divides by zero; an all-zero benefit column has max 0.',
      'H sums to zero over all alternatives and is not bounded; do not compare it across problems.',
      'Near ties in E (gap below tau) are decided by E alone.',
    ],
  },
  tr: {
    summary:
      'CODAS her alternatifin en kötü noktadan ne kadar uzak olduğunu ölçer; ana ölçü düz (Öklid) uzaklık, ikinci ölçü şehir bloğu (Taxicab) uzaklığıdır. Her alternatif diğerleriyle tek tek karşılaştırılır; toplamda diğerlerini en büyük farkla geçen kazanır.',
    whenToUse: [
      'Fayda ve maliyet kriterli veri.',
      'İki uzaklık kavramını birlikte kullanan, ikili karşılaştırma tarzı bir birleştirme istiyorsun.',
    ],
    whenNot: [
      'tau eşiği için savunulabilir bir değer veremiyorsun: sıralama buna göre değişebilir.',
      'Maliyet kriterlerinde sıfır var (min/x normalizasyonu).',
    ],
    inputs: [
      'Negatif olmayan değerli karar matrisi; maliyet kriterleri kesinlikle pozitif.',
      'Her sütun için kriter türü, toplamı 1 olan ağırlıklar.',
      'Eşik tau, varsayılan 0,02, önerilen aralık 0,01-0,05.',
    ],
    pitfalls: [
      "psi'nin anlamı özgün makalede çelişkilidir; yayımlanan sayıları verdiği için Denklem (10)'u izleriz ve bunu sayfada belirtiriz.",
      'tau ağırlıklı normalize uzaklık birimindedir; etkisi ağırlıklara ve alternatif sayısına bağlıdır.',
      "Maliyet kriterinde 0 değeri sıfıra bölme demektir; tamamı sıfır olan fayda sütununun maksimumu 0'dır.",
      'H tüm alternatifler üzerinde sıfıra toplanır ve sınırlı değildir; problemler arasında karşılaştırma.',
      "E'de neredeyse eşitlik (fark tau'nun altında) yalnız E'ye göre çözülür.",
    ],
  },
}
