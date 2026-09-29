import type { MethodContent } from '../types'

// Source: docs/research/methods/aras.md
export const aras: MethodContent = {
  id: 'aras',
  name: { en: 'ARAS', tr: 'ARAS' },
  fullName: { en: 'Additive Ratio ASsessment', tr: 'Toplamsal oran değerlendirmesi' },
  family: 'ranking-utility',
  status: 'research',
  year: 2010,
  origin: {
    authors: 'Zavadskas, E.K.; Turskis, Z.',
    year: 2010,
    title: 'A new additive ratio assessment (ARAS) method in multicriteria decision-making',
    venue: 'Technological and Economic Development of Economy 16(2), 159-172',
    doi: '10.3846/tede.2010.10',
  },
  steps: [
    {
      title: { en: 'Add the optimal alternative', tr: 'Optimal alternatifi ekle' },
      tex: String.raw`x_{0j} = \begin{cases} \max_i x_{ij} & j \in J^{+} \\ \min_i x_{ij} & j \in J^{-} \end{cases}`,
      note: {
        en: 'Row 0 of the extended matrix. Default is the column best; the user can instead give a target (norm) per criterion, as the origin example does.',
        tr: 'Genişletilmiş matrisin 0. satırı. Varsayılan sütunun en iyi değeridir; kullanıcı bunun yerine her kriter için bir hedef (norm) verebilir, özgün örnekte olduğu gibi.',
      },
    },
    {
      title: { en: 'Invert cost criteria', tr: 'Maliyet kriterlerini ters çevir' },
      tex: String.raw`x_{ij} \leftarrow \frac{1}{x_{ij}}, \qquad j \in J^{-},\ i = 0, \dots, m`,
    },
    {
      title: { en: 'Sum normalization over the extended column', tr: 'Genişletilmiş sütunda toplam normalizasyonu' },
      tex: String.raw`\bar x_{ij} = \frac{x_{ij}}{\sum_{i=0}^{m} x_{ij}}`,
    },
    {
      title: { en: 'Weighted sum', tr: 'Ağırlıklı toplam' },
      tex: String.raw`S_i = \sum_{j=1}^{n} w_j\, \bar x_{ij}, \qquad i = 0, \dots, m`,
    },
    {
      title: { en: 'Utility degree', tr: 'Fayda derecesi' },
      tex: String.raw`K_i = \frac{S_i}{S_0}`,
      note: {
        en: 'Share of the optimum, shown as a percentage. Rank by decreasing K.',
        tr: 'Optimumun payıdır, yüzde olarak gösterilir. K değerine göre büyükten küçüğe sıralanır.',
      },
    },
  ],
  combinedWith: [
    {
      text: {
        en: 'The origin paper uses expert weights from pairwise comparisons by 38 experts.',
        tr: 'Özgün makale, 38 uzmanın ikili karşılaştırmalarından elde edilen uzman ağırlıklarını kullanır.',
      },
    },
    {
      methodId: 'swara',
      text: {
        en: 'ARAS with AHP or SWARA weights is common in later Lithuanian-school papers (not verified one by one).',
        tr: 'Sonraki Litvanya okulu makalelerinde ARAS, AHP ya da SWARA ağırlıklarıyla sık kullanılır (tek tek doğrulanmadı).',
      },
    },
    {
      methodId: 'codas',
      text: {
        en: 'The same office-microclimate data is reused as Example 2 of the CODAS paper (2016).',
        tr: 'Aynı ofis mikroklima verisi CODAS makalesinde (2016) 2. örnek olarak yeniden kullanılır.',
      },
    },
  ],
  reference: {
    source: 'Zavadskas, E.K.; Turskis, Z. (2010). A new additive ratio assessment (ARAS) method in multicriteria decision-making. Technological and Economic Development of Economy 16(2), 159-172',
    doi: '10.3846/tede.2010.10',
    table: 'Tables 1-3',
    match: 'partial',
    note: {
      en: 'Fourteen office rooms, six criteria. S matches everywhere; K differs only for room 8. Table 2 prints room 8\'s illumination value as 0.0825 (the value of room 1) instead of 0.0846. With the correct value room 8 ranks first (K = 0.7762) ahead of room 9, which the paper ranks first. CODAS (2016) on the same data also puts room 8 first.',
      tr: "On dört ofis odası, altı kriter. S her yerde örtüşüyor; K yalnız 8. odada farklı. Tablo 2, 8. odanın aydınlatma değerini 0,0846 yerine 0,0825 (1. odanın değeri) basmış. Doğru değerle 8. oda birinci çıkıyor (K = 0,7762) ve makalenin birinci saydığı 9. odanın önüne geçiyor. Aynı veride CODAS (2016) da 8. odayı birinci buluyor.",
    },
  },
  sources: [
    { label: 'Zavadskas & Turskis (2010), Technological and Economic Development of Economy 16(2), 159-172', doi: '10.3846/tede.2010.10' },
    { label: 'Keshavarz Ghorabaee, Zavadskas, Turskis & Antucheviciene (2016), CODAS, Economic Computation and Economic Cybernetics Studies and Research 50(3), 25-44', url: 'https://ideas.repec.org/a/cys/ecocyb/v50y2016i3p25-44.html' },
    { label: 'pyDecision 5.1.1, aras_method', url: 'https://github.com/Valdecy/pyDecision' },
  ],
  en: {
    summary:
      'ARAS adds an "optimal" alternative (the best value on each criterion, or a target you define), scores every alternative with a weighted sum of sum-normalized values, and reports each one as a percentage of the optimum (utility degree K). Choose it when the question is "how close to the target are we, in percent?".',
    whenToUse: [
      'A meaningful target or optimal value exists for each criterion (norms, specifications).',
      'A percentage of the optimum is useful to the audience.',
    ],
    whenNot: [
      'Cost criteria contain zeros: they are inverted with 1/x.',
      'You need a linear treatment of cost criteria: 1/x is non-linear.',
      'Nobody can agree on the optimal row: the results depend on it.',
    ],
    inputs: [
      'Decision matrix, strictly positive in cost criteria.',
      'Criterion type per column: benefit or cost.',
      'Weights summing to 1.',
      'Optional optimal value per criterion. Default is the column best.',
    ],
    pitfalls: [
      'A cost value of 0 gives 1/0; negative values have no meaning here.',
      'If the optimal row is worse than an alternative on some criterion, K can exceed 1.',
      'Rank reversal when alternatives are added, because of the sum normalization.',
      'Column best and given norms give very different K values (room 9: 0.9455 vs 0.7734 in the origin data), even when the ranking stays the same.',
    ],
  },
  tr: {
    summary:
      'ARAS tabloya "optimal" bir alternatif ekler (her kriterdeki en iyi değer ya da senin belirlediğin hedef), her alternatifi toplam normalizasyonlu değerlerin ağırlıklı toplamıyla puanlar ve sonucu optimumun yüzdesi olarak verir (fayda derecesi K). Soru "hedefe yüzde kaç yakınız?" ise uygundur.',
    whenToUse: [
      'Her kriter için anlamlı bir hedef ya da optimal değer var (norm, şartname).',
      'Optimumun yüzdesi olarak bir sonuç okuyucuya bir şey söylüyor.',
    ],
    whenNot: [
      'Maliyet kriterlerinde sıfır var: bu kriterler 1/x ile ters çevrilir.',
      'Maliyet kriterlerinin doğrusal ele alınması gerekiyor: 1/x doğrusal değildir.',
      'Optimal satır üzerinde uzlaşılamıyor: sonuçlar ona bağlıdır.',
    ],
    inputs: [
      'Karar matrisi; maliyet kriterlerinde kesinlikle pozitif.',
      'Her sütun için kriter türü: fayda ya da maliyet.',
      "Toplamı 1 olan ağırlıklar.",
      'İsteğe bağlı olarak her kriter için optimal değer. Varsayılan sütunun en iyi değeridir.',
    ],
    pitfalls: [
      'Maliyet kriterinde 0 değeri 1/0 demektir; negatif değerlerin burada anlamı yoktur.',
      "Optimal satır bir kriterde bir alternatiften kötüyse K 1'i geçebilir.",
      'Toplam normalizasyonu yüzünden alternatif eklenince sıralama tersine dönebilir.',
      "Sütunun en iyisi ile verilen normlar çok farklı K değerleri üretir (özgün veride 9. oda: 0,9455 ve 0,7734), sıralama aynı kalsa bile.",
    ],
  },
}
