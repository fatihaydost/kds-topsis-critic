import type { MethodContent } from '../types'

// Source: docs/research/methods/marcos.md
export const marcos: MethodContent = {
  id: 'marcos',
  name: { en: 'MARCOS', tr: 'MARCOS' },
  fullName: {
    en: 'Measurement of Alternatives and Ranking according to COmpromise Solution',
    tr: 'Alternatiflerin ölçümü ve uzlaşık çözüme göre sıralama',
  },
  family: 'ranking-utility',
  status: 'research',
  year: 2020,
  origin: {
    authors: 'Stević, Ž.; Pamučar, D.; Puška, A.; Chatterjee, P.',
    year: 2020,
    title: 'Sustainable supplier selection in healthcare industries using a new MCDM method: Measurement of alternatives and ranking according to COmpromise solution (MARCOS)',
    venue: 'Computers & Industrial Engineering 140, 106231',
    doi: '10.1016/j.cie.2019.106231',
    note: {
      en: 'Paywalled, not opened. The reference example comes from an open-access paper by the method\'s first author.',
      tr: 'Ücretli erişimde, açılmadı. Referans örnek, yöntemin ilk yazarının açık erişimli bir makalesinden alındı.',
    },
  },
  steps: [
    {
      title: { en: 'Add ideal and anti-ideal rows', tr: 'İdeal ve anti-ideal satırları ekle' },
      tex: String.raw`AI_j = \begin{cases} \max_i x_{ij} & j \in J^{+} \\ \min_i x_{ij} & j \in J^{-} \end{cases} \qquad AAI_j = \begin{cases} \min_i x_{ij} & j \in J^{+} \\ \max_i x_{ij} & j \in J^{-} \end{cases}`,
    },
    {
      title: { en: 'Normalize against the ideal', tr: 'İdeale göre normalize et' },
      tex: String.raw`n_{ij} = \begin{cases} \dfrac{x_{ij}}{AI_j} & j \in J^{+} \\[2ex] \dfrac{AI_j}{x_{ij}} & j \in J^{-} \end{cases}`,
      note: {
        en: 'Applied to the AI and AAI rows as well.',
        tr: 'AI ve AAI satırlarına da uygulanır.',
      },
    },
    {
      title: { en: 'Weighted sums', tr: 'Ağırlıklı toplamlar' },
      tex: String.raw`S_i = \sum_{j=1}^{n} w_j\, n_{ij}, \qquad K_i^{-} = \frac{S_i}{S_{aai}}, \qquad K_i^{+} = \frac{S_i}{S_{ai}}`,
    },
    {
      title: { en: 'Utility functions', tr: 'Fayda fonksiyonları' },
      tex: String.raw`f(K_i^{-}) = \frac{K_i^{+}}{K_i^{+} + K_i^{-}}, \qquad f(K_i^{+}) = \frac{K_i^{-}}{K_i^{+} + K_i^{-}}`,
    },
    {
      title: { en: 'Final utility', tr: 'Nihai fayda' },
      tex: String.raw`f(K_i) = \frac{K_i^{+} + K_i^{-}}{1 + \dfrac{1 - f(K_i^{+})}{f(K_i^{+})} + \dfrac{1 - f(K_i^{-})}{f(K_i^{-})}}`,
      note: {
        en: 'Rank by decreasing f(K). With AI and AAI taken from the data, this order is the same as the order by S.',
        tr: 'f(K) değerine göre büyükten küçüğe sıralanır. AI ve AAI veriden alındığında bu sıra, S\'ye göre sırayla aynıdır.',
      },
    },
  ],
  combinedWith: [
    {
      text: {
        en: 'FUCOM then MARCOS: Stević & Brković (2020), the reference example here.',
        tr: 'FUCOM ardından MARCOS: buradaki referans örnek olan Stević ve Brković (2020).',
      },
    },
    {
      methodId: 'bwm',
      text: {
        en: 'Later papers by the same group pair MARCOS with FUCOM, BWM, LBWA or CRITIC (not verified one by one).',
        tr: 'Aynı grubun sonraki makaleleri MARCOS\'u FUCOM, BWM, LBWA ya da CRITIC ile eşleştirir (tek tek doğrulanmadı).',
      },
    },
  ],
  reference: {
    source: 'Stević, Ž.; Brković, N. (2020). A Novel Integrated FUCOM-MARCOS Model for Evaluation of Human Resources in a Transport Company. Logistics 4(1), 4',
    doi: '10.3390/logistics4010004',
    table: 'Tables 2-5, Figure 2',
    match: 'match',
    note: {
      en: 'Twenty-three drivers, five criteria. f(K) matches the printed 3 decimals (largest gap 0.0006, because the paper chains rounded intermediates) and the ranking is identical, 23 of 23. The paper applies the weights of C3 and C4 swapped relative to its own FUCOM result; the fixture uses the weights as applied.',
      tr: "Yirmi üç sürücü, beş kriter. f(K) basılı 3 basamakta örtüşüyor (makale yuvarlanmış ara değerleri zincirlediği için en büyük fark 0,0006) ve sıralama 23'te 23 aynı. Makale C3 ve C4 ağırlıklarını kendi FUCOM sonucuna göre yer değiştirmiş uygulamış; test verisi ağırlıkları uygulandığı haliyle kullanır.",
    },
  },
  sources: [
    { label: 'Stević, Pamučar, Puška & Chatterjee (2020), Computers & Industrial Engineering 140, 106231', doi: '10.1016/j.cie.2019.106231' },
    { label: 'Stević & Brković (2020), Logistics 4(1), 4', doi: '10.3390/logistics4010004' },
    { label: 'pyDecision 5.1.1, marcos_method', url: 'https://github.com/Valdecy/pyDecision' },
  ],
  en: {
    summary:
      'MARCOS adds an ideal and an anti-ideal alternative to the table, scores every alternative against both, and merges the two into one utility value. It is simple to compute and explain. With the ideal points taken from the data it gives the same order as a weighted sum with best-value normalization.',
    whenToUse: ['Stakeholders like "distance to ideal and anti-ideal" wording but you want a transparent additive model.'],
    whenNot: [
      'You would present it as independent evidence next to SAW: with ideal points from the data its ranking equals SAW with linear max normalization.',
      'Cost criteria contain zeros.',
    ],
    inputs: [
      'Decision matrix, strictly positive in cost criteria.',
      'Criterion type per column, weights summing to 1.',
      'Optional user-defined ideal and anti-ideal values. Default: column best and worst.',
    ],
    pitfalls: [
      'Same ordering as SAW; do not count it as a second opinion.',
      'A cost value of 0 divides by zero. The reference paper replaces 0 by 0.001; any such epsilon changes the scale of that column a lot. We reject zeros instead.',
      'If all alternatives are equal, K- = K+ = 1 everywhere, a tie.',
      'Rank reversal when the ideal points move with the alternative set; fixing them externally avoids it.',
    ],
  },
  tr: {
    summary:
      'MARCOS tabloya ideal ve anti-ideal iki sanal alternatif ekler, her alternatifi ikisine göre puanlar ve bunları tek bir fayda değerinde birleştirir. Hesabı ve anlatımı basittir. İdeal noktalar veriden alındığında, en iyi değere göre normalize edilmiş ağırlıklı toplamla aynı sıralamayı verir.',
    whenToUse: ['Paydaşlar "ideale ve anti-ideale uzaklık" anlatımını seviyor ama sen şeffaf bir toplamsal model istiyorsun.'],
    whenNot: [
      "SAW'ın yanında bağımsız bir kanıt gibi sunacaksın: ideal noktalar veriden alındığında sıralaması doğrusal maks normalizasyonlu SAW ile aynıdır.",
      'Maliyet kriterlerinde sıfır var.',
    ],
    inputs: [
      'Karar matrisi; maliyet kriterlerinde kesinlikle pozitif.',
      'Her sütun için kriter türü, toplamı 1 olan ağırlıklar.',
      'İsteğe bağlı olarak kullanıcı tanımlı ideal ve anti-ideal değerler. Varsayılan: sütunun en iyisi ve en kötüsü.',
    ],
    pitfalls: [
      'Sıralama SAW ile aynıdır; ikinci bir görüş gibi sayma.',
      "Maliyet kriterinde 0 sıfıra bölme demektir. Referans makale 0 yerine 0,001 koyar; böyle her küçük sayı seçimi o sütunun ölçeğini çok değiştirir. Biz sıfırı reddederiz.",
      'Bütün alternatifler eşitse her yerde K- = K+ = 1 olur, yani eşitlik.',
      'İdeal noktalar alternatif kümesiyle kayınca sıralama tersine dönebilir; bunları dışarıdan sabitlemek bunu önler.',
    ],
  },
}
