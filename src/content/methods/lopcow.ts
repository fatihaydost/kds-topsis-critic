import type { MethodContent } from '../types'

// Source: docs/research/methods/lopcow.md
export const lopcow: MethodContent = {
  id: 'lopcow',
  name: { en: 'LOPCOW', tr: 'LOPCOW' },
  fullName: {
    en: 'LOgarithmic Percentage Change-driven Objective Weighting',
    tr: 'Logaritmik yüzde değişime dayalı nesnel ağırlıklandırma',
  },
  family: 'weighting-objective',
  status: 'research',
  year: 2022,
  origin: {
    authors: 'Ecer, F.; Pamucar, D.',
    year: 2022,
    title: 'A novel LOPCOW-DOBI multi-criteria sustainability performance assessment methodology: An application in developing country banking sector',
    venue: 'Omega 112, 102690',
    doi: '10.1016/j.omega.2022.102690',
    note: {
      en: 'Full text not accessible. The formulas are taken from four open-access papers that quote the origin identically, and confirmed numerically on Keleş (2023).',
      tr: 'Tam metne erişilemedi. Formüller, özgün makaleyi aynı biçimde aktaran dört açık erişimli makaleden alındı ve Keleş (2023) üzerinde sayısal olarak doğrulandı.',
    },
  },
  steps: [
    {
      title: { en: 'Min-max normalization', tr: 'Min-maks normalizasyonu' },
      tex: String.raw`r_{ij} = \begin{cases} \dfrac{x_{ij} - x_j^{\min}}{x_j^{\max} - x_j^{\min}} & j \in J^{+} \\[2ex] \dfrac{x_j^{\max} - x_{ij}}{x_j^{\max} - x_j^{\min}} & j \in J^{-} \end{cases}`,
    },
    {
      title: { en: 'Percentage value', tr: 'Yüzde değer' },
      tex: String.raw`PV_j = \left|\, 100 \cdot \ln\!\left(\frac{\sqrt{\frac{1}{m}\sum_{i=1}^{m} r_{ij}^2}}{\sigma_j}\right) \right|`,
      note: {
        en: 'Root mean square over the sample standard deviation (divisor m - 1). The sample form is an assumption backed by one reproduction; the origin could not be read.',
        tr: 'Karesel ortalamanın örneklem standart sapmasına (bölen m - 1) oranı. Örneklem biçimi tek bir yeniden üretimle desteklenen bir varsayımdır; özgün makale okunamadı.',
      },
    },
    {
      title: { en: 'Weights', tr: 'Ağırlıklar' },
      tex: String.raw`w_j = \frac{PV_j}{\sum_{k=1}^{n} PV_k}`,
    },
  ],
  combinedWith: [
    {
      text: {
        en: 'LOPCOW then DOBI (Dombi-Bonferroni) in the origin paper (Ecer & Pamucar 2022).',
        tr: 'Özgün makalede LOPCOW ardından DOBI (Dombi-Bonferroni) (Ecer ve Pamucar 2022).',
      },
    },
    {
      text: {
        en: 'LOPCOW then CRADIS: Keleş (2023), G7 and Turkish power-centre cities.',
        tr: 'LOPCOW ardından CRADIS: Keleş (2023), G7 ve Türkiye güç merkezi şehirleri.',
      },
    },
    {
      methodId: 'edas',
      text: {
        en: 'LOPCOW then EDAS, and LOPCOW with MEREC then CoCoSo or EDAS (insurance sector), as listed in Keleş (2023), Table 1.',
        tr: 'LOPCOW ardından EDAS ve LOPCOW ile MEREC ardından CoCoSo ya da EDAS (sigorta sektörü), Keleş (2023) Tablo 1\'de listelendiği gibi.',
      },
    },
    {
      methodId: 'cocoso',
      text: {
        en: 'LOPCOW-CRITIC-CoCoSo for BIST energy firms: Yılmaz Özekenci (2024).',
        tr: 'BIST enerji şirketleri için LOPCOW-CRITIC-CoCoSo: Yılmaz Özekenci (2024).',
      },
    },
  ],
  reference: {
    source: 'Keleş, N. (2023). Lopcow ve Cradis yöntemleriyle G7 ülkelerinin ve Türkiye\'nin yaşanabilir güç merkezi şehirlerinin değerlendirilmesi. Ömer Halisdemir Üniversitesi İİBF Dergisi 16(3), 727-747',
    doi: '10.25287/ohuiibf.1239201',
    table: 'Tables 6, 7 and 8',
    match: 'match',
    note: {
      en: 'Fifteen cities, three criteria sets (6, 8 and 14 criteria). Weights match the printed 3 decimals in all three tables with the sample standard deviation; the population form misses by up to 0.0045. LOPCOW weights published by Trung et al. (2024) could not be reproduced with either form.',
      tr: 'On beş şehir, üç kriter kümesi (6, 8 ve 14 kriter). Örneklem standart sapmasıyla ağırlıklar üç tabloda da basılı 3 basamakta örtüşüyor; anakütle biçimi 0,0045\'e kadar sapıyor. Trung vd. (2024) tarafından yayımlanan LOPCOW ağırlıkları iki biçimle de elde edilemedi.',
    },
  },
  sources: [
    { label: 'Ecer & Pamucar (2022), Omega 112, 102690', doi: '10.1016/j.omega.2022.102690' },
    { label: 'Keleş (2023), Ömer Halisdemir Üniversitesi İİBF Dergisi 16(3), 727-747', doi: '10.25287/ohuiibf.1239201' },
    { label: 'Trung et al. (2024), EUREKA: Physics and Engineering', doi: '10.21303/2461-4262.2024.003171' },
    { label: 'Yılmaz Özekenci (2024), LOPCOW-CRITIC-CoCoSo, BIST energy', doi: '10.29249/selcuksbmyd.1400056' },
  ],
  en: {
    summary:
      'LOPCOW scales each criterion to 0-1 and compares its typical size (root mean square) with its spread (standard deviation) on a logarithmic scale. This dampens the large weight gaps that Entropy can produce and works with negative raw data. Pick it when you want objective weights that are more even than Entropy\'s.',
    whenToUse: [
      'Data include negative values (financial ratios, growth rates).',
      'You want flatter, less extreme objective weights.',
      'Paired with newer ranking methods (EDAS, CRADIS, RAM, DOBI).',
    ],
    whenNot: [
      'A criterion is constant: its standard deviation is 0.',
      'You need a well-studied method with known properties: LOPCOW is new and its behaviour is only described empirically.',
    ],
    inputs: ['Decision matrix, any real values, at least 2 alternatives.', 'Criterion type per column: benefit or cost.', 'No parameters.'],
    pitfalls: [
      'Constant column: PV is undefined. Our choice is weight 0 with a warning; no source covers this case.',
      'A column whose RMS equals its standard deviation gets PV = 0 and weight 0 although it varies. This is an artefact of the absolute log form, and the weight rises again on either side of that point.',
      'Sample and population standard deviation give weights that differ by 0.3-0.5 percentage points; the page states which one is used.',
      'Min-max depends on the alternative set, so the weights change when alternatives are added or removed.',
      'Some papers call a different normalization "LOPCOW"; do not use them as references.',
    ],
  },
  tr: {
    summary:
      'LOPCOW her kriteri 0-1 aralığına ölçekler ve tipik büyüklüğünü (karesel ortalama) yayılımıyla (standart sapma) logaritmik ölçekte karşılaştırır. Entropinin üretebildiği büyük ağırlık farklarını yumuşatır ve negatif ham verilerle çalışır. Entropiden daha dengeli nesnel ağırlıklar istediğinde seç.',
    whenToUse: [
      'Veride negatif değerler var (finansal oranlar, büyüme oranları).',
      'Daha düz, daha az uç nesnel ağırlıklar istiyorsun.',
      'Yeni sıralama yöntemleriyle birlikte (EDAS, CRADIS, RAM, DOBI).',
    ],
    whenNot: [
      "Bir kriter sabit: standart sapması 0'dır.",
      'Özellikleri iyi bilinen, çok çalışılmış bir yöntem gerekiyor: LOPCOW yenidir ve davranışı yalnız deneysel olarak anlatılmıştır.',
    ],
    inputs: ['Karar matrisi, herhangi gerçek değerler, en az 2 alternatif.', 'Her sütun için kriter türü: fayda ya da maliyet.', 'Parametre yok.'],
    pitfalls: [
      'Sabit sütun: PV tanımsızdır. Tercihimiz uyarıyla ağırlık 0; bu durumu ele alan bir kaynak yok.',
      'Karesel ortalaması standart sapmasına eşit olan bir sütun, değerleri değişse bile PV = 0 ve ağırlık 0 alır. Bu mutlak logaritma biçiminin bir yan etkisidir; ağırlık o noktanın iki yanında yeniden artar.',
      'Örneklem ve anakütle standart sapması 0,3-0,5 yüzde puan farklı ağırlıklar verir; sayfa hangisinin kullanıldığını belirtir.',
      'Min-maks alternatif kümesine bağlıdır; alternatif eklenip çıkarılınca ağırlıklar değişir.',
      'Bazı makaleler farklı bir normalizasyona "LOPCOW" der; bunları referans olarak kullanma.',
    ],
  },
}
