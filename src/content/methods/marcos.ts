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
      en: "The reference example comes from an open-access paper by the method's first author.",
      tr: 'Referans örnek, yöntemin ilk yazarının açık erişimli bir makalesinden alındı.',
    },
  },
  steps: [
    {
      title: { en: 'Add ideal and anti-ideal rows', tr: 'İdeal ve anti-ideal satırların eklenmesi' },
      tex: String.raw`AI_j = \begin{cases} \max_i x_{ij} & j \in J^{+} \\ \min_i x_{ij} & j \in J^{-} \end{cases} \qquad AAI_j = \begin{cases} \min_i x_{ij} & j \in J^{+} \\ \max_i x_{ij} & j \in J^{-} \end{cases}`,
    },
    {
      title: { en: 'Normalize against the ideal', tr: 'İdeale göre normalizasyon' },
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
        en: 'Rank by decreasing f(K); with AI and AAI taken from the data, this order equals the order by S.',
        tr: "f(K) değerine göre büyükten küçüğe sıralanır; AI ve AAI veriden alındığında bu sıra S'ye göre sırayla aynıdır.",
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
        tr: "Aynı grubun sonraki makaleleri MARCOS'u FUCOM, BWM, LBWA ya da CRITIC ile eşleştirir (tek tek doğrulanmadı).",
      },
    },
  ],
  reference: {
    source: 'Stević, Ž.; Brković, N. (2020). A Novel Integrated FUCOM-MARCOS Model for Evaluation of Human Resources in a Transport Company. Logistics 4(1), 4',
    doi: '10.3390/logistics4010004',
    match: 'match',
    note: {
      en: 'Published example (Tables 2-5, Figure 2); this method is not computed here yet, only recomputed during research. Twenty-three drivers, five criteria. f(K) matches the printed 3 decimals (largest gap 0.0006, because the paper chains rounded intermediates) and the ranking is identical, 23 of 23. The paper applies the weights of C3 and C4 swapped relative to its own FUCOM result; the recomputation uses the weights as applied.',
      tr: "Yayımlanmış örnek (Tablo 2-5, Şekil 2); bu yöntem sitede henüz hesaplanmıyor, yalnız araştırmada yeniden hesaplandı. Yirmi üç sürücü, beş kriter. f(K) basılı 3 basamakta örtüşüyor (makale yuvarlanmış ara değerleri zincirlediği için en büyük fark 0,0006) ve sıralama 23'te 23 aynı. Makale C3 ve C4 ağırlıklarını kendi FUCOM sonucuna göre yer değiştirmiş uygulamış; yeniden hesaplama ağırlıkları uygulandığı haliyle kullanır.",
    },
  },
  sources: [
    { label: 'Stević, Pamučar, Puška & Chatterjee (2020), Computers & Industrial Engineering 140, 106231', doi: '10.1016/j.cie.2019.106231' },
    { label: 'Stević & Brković (2020), Logistics 4(1), 4', doi: '10.3390/logistics4010004' },
    { label: 'pyDecision 5.1.1, marcos_method', url: 'https://github.com/Valdecy/pyDecision' },
  ],
  en: {
    summary:
      'MARCOS scores every alternative against an added ideal and anti-ideal and merges both into one utility. With ideal points from the data it ranks like SAW with best-value normalization.',
    whenToUse: [
      'Stakeholders like ideal and anti-ideal wording; you want a transparent additive model.',
    ],
    whenNot: [
      'Presented as independent evidence next to SAW: the rankings are equal.',
      'Cost criteria contain zeros.',
    ],
    inputs: [
      'Decision matrix, strictly positive in cost criteria.',
      'Criterion type per column, weights summing to 1.',
      'Optional user-defined ideal and anti-ideal values. Default: column best and worst.',
    ],
    pitfalls: [
      'Same ordering as SAW (ideal points from the data); do not count it as a second opinion.',
      'A cost value of 0 divides by zero; replacing it by 0.001, as the reference paper does, distorts that column.',
      'Rank reversal when the ideal points move with the alternative set; fixing them externally avoids it.',
    ],
  },
  tr: {
    summary:
      'MARCOS her alternatifi tabloya eklenen ideal ve anti-ideale göre puanlar ve ikisini tek bir fayda değerinde birleştirir. İdeal noktalar veriden alınırsa sıralaması en iyi değere göre normalize edilmiş SAW ile aynıdır.',
    whenToUse: [
      'Paydaşlar ideal ve anti-ideal anlatımını seviyor, siz şeffaf toplamsal model istiyorsunuz.',
    ],
    whenNot: [
      "SAW'ın yanında bağımsız kanıt olarak sunulacak: sıralamalar aynıdır.",
      'Maliyet kriterlerinde sıfır var.',
    ],
    inputs: [
      'Karar matrisi; maliyet kriterlerinde kesinlikle pozitif.',
      'Her sütun için kriter türü, toplamı 1 olan ağırlıklar.',
      'İsteğe bağlı olarak kullanıcı tanımlı ideal ve anti-ideal değerler. Varsayılan: sütunun en iyisi ve en kötüsü.',
    ],
    pitfalls: [
      'Sıralama SAW ile aynıdır (ideal noktalar veriden); ikinci bir görüş gibi saymayın.',
      'Maliyet kriterinde 0 sıfıra böler; referans makaledeki gibi 0 yerine 0,001 koymak o sütunu bozar.',
      'İdeal noktalar alternatif kümesiyle kayınca sıralama tersine dönebilir; onları dışarıdan sabitlemek bunu önler.',
    ],
  },
}
