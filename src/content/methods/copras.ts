import type { MethodContent } from '../types'

// Source: docs/research/methods/copras.md
export const copras: MethodContent = {
  id: 'copras',
  name: { en: 'COPRAS', tr: 'COPRAS' },
  fullName: { en: 'COmplex PRoportional ASsessment', tr: 'Karmaşık oransal değerlendirme' },
  family: 'ranking-utility',
  status: 'research',
  year: 1994,
  origin: {
    authors: 'Zavadskas, E.K.; Kaklauskas, A.; Šarka, V.',
    year: 1994,
    title: 'The new method of multicriteria complex proportional assessment of projects',
    venue: 'Technological and Economic Development of Economy 1(3), 131-139',
    note: {
      en: 'Commonly cited origin; not opened, no DOI found, bibliographic details not checked against a primary page. Podvezko (2011) attributes the method to Zavadskas & Kaklauskas (1996). The formulas follow Podvezko (2011).',
      tr: 'Yaygın atıf yapılan kaynak; açılmadı, DOI bulunamadı, künye birincil bir sayfadan doğrulanmadı. Podvezko (2011) yöntemi Zavadskas ve Kaklauskas (1996) kaynağına bağlar. Formüller Podvezko (2011) anlatımını izler.',
    },
  },
  steps: [
    {
      title: { en: 'Sum normalization and weighting', tr: 'Toplam normalizasyonu ve ağırlıklandırma' },
      tex: String.raw`d_{ij} = \frac{w_j\, x_{ij}}{\sum_{i=1}^{m} x_{ij}}`,
    },
    {
      title: { en: 'Benefit and cost sums', tr: 'Fayda ve maliyet toplamları' },
      tex: String.raw`S_{+i} = \sum_{j \in J^{+}} d_{ij}, \qquad S_{-i} = \sum_{j \in J^{-}} d_{ij}`,
    },
    {
      title: { en: 'Relative significance', tr: 'Göreli önem' },
      tex: String.raw`Q_i = S_{+i} + \frac{\sum_{i=1}^{m} S_{-i}}{S_{-i} \sum_{i=1}^{m} \frac{1}{S_{-i}}}`,
      note: {
        en: 'With no cost criteria, Q equals S+.',
        tr: 'Maliyet kriteri yoksa Q, S+ değerine eşittir.',
      },
    },
    {
      title: { en: 'Utility degree', tr: 'Fayda derecesi' },
      tex: String.raw`N_i = \frac{Q_i}{\max_k Q_k} \times 100\%`,
      note: {
        en: 'Rank by decreasing Q.',
        tr: 'Q değerine göre büyükten küçüğe sıralanır.',
      },
    },
  ],
  combinedWith: [
    {
      methodId: 'ahp',
      text: {
        en: 'AHP or expert weights in the Vilnius school (many applications listed by Podvezko 2011).',
        tr: 'Vilnius okulunda AHP ya da uzman ağırlıkları (Podvezko 2011 pek çok uygulamayı listeler).',
      },
    },
    {
      methodId: 'swara',
      text: {
        en: 'SWARA and COPRAS co-occur in 154 OpenAlex records, more than SWARA and TOPSIS.',
        tr: "SWARA ile COPRAS OpenAlex'te 154 kayıtta birlikte geçer; SWARA ile TOPSIS'ten fazla.",
      },
    },
    {
      methodId: 'edas',
      text: {
        en: 'Used as a comparison method in the EDAS (2015), CODAS (2016), MABAC (2015) and CoCoSo (2019) papers.',
        tr: 'EDAS (2015), CODAS (2016), MABAC (2015) ve CoCoSo (2019) makalelerinde karşılaştırma yöntemi olarak kullanılır.',
      },
    },
  ],
  reference: {
    source: 'Podvezko, V. (2011). The Comparative Analysis of MCDA Methods SAW and COPRAS. Inžinerinė ekonomika - Engineering Economics 22(2), 134-146',
    doi: '10.5755/j01.ee.22.2.310',
    table: 'Tables 7-8, Variant II',
    match: 'match',
    note: {
      en: 'Three alternatives, four criteria. Variant II matches (S+, S-, Q, ranks 3, 2, 1). Variant I is not used: its S- values need 220 where the table prints 215, and its Q row is a copy of Variant II. Ranks also match Keshavarz Ghorabaee et al. (2015) in 7 of 7 weight sets.',
      tr: "Üç alternatif, dört kriter. II. varyant örtüşüyor (S+, S-, Q, sıralar 3, 2, 1). I. varyant kullanılmadı: S- değerleri tablodaki 215 yerine 220 ile elde ediliyor, Q satırı da II. varyantın kopyası. Sıralamalar Keshavarz Ghorabaee vd. (2015) ile 7 ağırlık setinin 7'sinde aynı.",
    },
  },
  sources: [
    { label: 'Zavadskas, Kaklauskas & Šarka (1994), Technological and Economic Development of Economy 1(3), 131-139' },
    { label: 'Podvezko (2011), Engineering Economics 22(2), 134-146', doi: '10.5755/j01.ee.22.2.310' },
    { label: 'Keshavarz Ghorabaee, Zavadskas, Olfat & Turskis (2015), Informatica 26(3), 435-451', doi: '10.15388/Informatica.2015.57' },
    { label: 'pyDecision 5.1.1, copras_method', url: 'https://github.com/Valdecy/pyDecision' },
  ],
  en: {
    summary:
      'COPRAS adds up the weighted shares of the "more is better" criteria and, separately, of the "less is better" criteria, then rewards alternatives with a small cost sum. The result is a utility score as a percentage of the best alternative. It fits when benefits and costs should be handled explicitly rather than by flipping cost values.',
    whenToUse: [
      'Mixed benefit and cost criteria.',
      'Positive data.',
      'The audience is comfortable with proportional (sum) normalization.',
    ],
    whenNot: [
      'Cost criteria dominate and the data are uncertain: a small change in one cost value reversed the ranking in Podvezko (2011).',
      'All criteria are benefit: COPRAS then reduces to SAW with sum normalization, so use SAW.',
    ],
    inputs: ['Decision matrix, strictly positive.', 'Criterion type per column, weights summing to 1.', 'No parameters.'],
    pitfalls: [
      'Zero or negative values break the sum normalization and 1/S-.',
      'An alternative whose cost entries are all 0 has S- = 0 and divides by zero.',
      'Rank reversal for small cost changes and when alternatives are added.',
      'Useful check: the Q values always add up to the sum of the weights (Podvezko 2011).',
    ],
  },
  tr: {
    summary:
      'COPRAS "çok olsun" kriterlerinin ağırlıklı paylarını ve ayrıca "az olsun" kriterlerinin paylarını toplar, sonra maliyet toplamı küçük olan alternatifi ödüllendirir. Sonuç, en iyi alternatifin yüzdesi olarak bir fayda skorudur. Fayda ve maliyetin, maliyet değerleri ters çevrilmeden açıkça ayrı ele alınmasını istediğinde uygundur.',
    whenToUse: [
      'Fayda ve maliyet kriterleri karışık.',
      'Veriler pozitif.',
      'Okuyucu oransal (toplam) normalizasyona alışkın.',
    ],
    whenNot: [
      'Maliyet kriterleri baskın ve veri belirsiz: Podvezko (2011) örneğinde tek bir maliyet değerindeki küçük değişiklik sıralamayı tersine çevirdi.',
      "Bütün kriterler fayda kriteri: COPRAS bu durumda toplam normalizasyonlu SAW'a iner, SAW kullan.",
    ],
    inputs: ['Kesinlikle pozitif değerli karar matrisi.', 'Her sütun için kriter türü, toplamı 1 olan ağırlıklar.', 'Parametre yok.'],
    pitfalls: [
      "Sıfır ya da negatif değerler toplam normalizasyonunu ve 1/S- terimini bozar.",
      "Maliyet değerlerinin hepsi 0 olan bir alternatifte S- = 0 olur ve sıfıra bölünür.",
      'Küçük maliyet değişikliklerinde ve alternatif eklendiğinde sıralama tersine dönebilir.',
      'İşe yarar kontrol: Q değerlerinin toplamı her zaman ağırlıkların toplamına eşittir (Podvezko 2011).',
    ],
  },
}
