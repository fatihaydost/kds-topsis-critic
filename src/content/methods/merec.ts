import type { MethodContent } from '../types'

// Source: docs/research/methods/merec.md
export const merec: MethodContent = {
  id: 'merec',
  name: { en: 'MEREC', tr: 'MEREC' },
  fullName: { en: 'MEthod based on the Removal Effects of Criteria', tr: 'Kriter çıkarma etkisine dayalı yöntem' },
  family: 'weighting-objective',
  status: 'research',
  year: 2021,
  origin: {
    authors: 'Keshavarz-Ghorabaee, M.; Amiri, M.; Zavadskas, E.K.; Turskis, Z.; Antucheviciene, J.',
    year: 2021,
    title: 'Determination of Objective Weights Using a New Method Based on the Removal Effects of Criteria (MEREC)',
    venue: 'Symmetry 13(4), 525',
    doi: '10.3390/sym13040525',
  },
  steps: [
    {
      title: { en: 'Normalize so that smaller is better', tr: 'Küçük olan iyi olacak biçimde normalize et' },
      tex: String.raw`n_{ij} = \begin{cases} \dfrac{\min_k x_{kj}}{x_{ij}} & j \in J^{+} \\[2ex] \dfrac{x_{ij}}{\max_k x_{kj}} & j \in J^{-} \end{cases} \qquad 0 < n_{ij} \le 1`,
      note: {
        en: 'The best value maps to the smallest n; this is the reverse of the WASPAS normalization.',
        tr: 'En iyi değer en küçük n değerine gider; WASPAS normalizasyonunun tersidir.',
      },
    },
    {
      title: { en: 'Overall performance', tr: 'Genel performans' },
      tex: String.raw`S_i = \ln\!\left(1 + \frac{1}{n}\sum_{j=1}^{n} \left|\ln n_{ij}\right|\right)`,
    },
    {
      title: { en: 'Performance without criterion j', tr: 'j kriteri olmadan performans' },
      tex: String.raw`S'_{ij} = \ln\!\left(1 + \frac{1}{n}\sum_{k \ne j} \left|\ln n_{ik}\right|\right)`,
      note: {
        en: 'The denominator stays n, as in Eq. (4) of the paper.',
        tr: "Makaledeki Denklem (4)'te olduğu gibi payda n kalır.",
      },
    },
    {
      title: { en: 'Removal effect', tr: 'Çıkarma etkisi' },
      tex: String.raw`E_j = \sum_{i=1}^{m} \left|S'_{ij} - S_i\right|`,
    },
    {
      title: { en: 'Weights', tr: 'Ağırlıklar' },
      tex: String.raw`w_j = \frac{E_j}{\sum_{k=1}^{n} E_k}`,
    },
  ],
  combinedWith: [
    {
      text: {
        en: 'MEREC with other objective weightings, then MARA, RAM and PIV for material selection: Trung et al. (2024). Their MEREC weights are reproduced exactly by our code.',
        tr: 'Malzeme seçimi için diğer nesnel ağırlıklandırmalarla birlikte MEREC, ardından MARA, RAM ve PIV: Trung vd. (2024). Onların MEREC ağırlıkları kodumuzla birebir elde ediliyor.',
      },
    },
    {
      methodId: 'cocoso',
      text: {
        en: 'LOPCOW and MEREC then CoCoSo or EDAS in the insurance sector (Bektaş 2022), as listed in Keleş (2023), Table 1.',
        tr: "Sigorta sektöründe LOPCOW ile MEREC ardından CoCoSo ya da EDAS (Bektaş 2022), Keleş (2023) Tablo 1'de listelendiği gibi.",
      },
    },
    {
      methodId: 'critic',
      text: {
        en: 'The origin paper compares MEREC with CRITIC, Entropy and SD (section 4.2).',
        tr: "Özgün makale MEREC'i CRITIC, Entropi ve SD ile karşılaştırır (4.2 bölümü).",
      },
    },
  ],
  reference: {
    source: 'Keshavarz-Ghorabaee, M.; Amiri, M.; Zavadskas, E.K.; Turskis, Z.; Antucheviciene, J. (2021). Determination of Objective Weights Using a New Method Based on the Removal Effects of Criteria (MEREC). Symmetry 13(4), 525',
    doi: '10.3390/sym13040525',
    table: 'Section 4.1, Tables 2-4; Section 4.2, Tables 5-6',
    match: 'match',
    note: {
      en: 'Illustrative example (5 x 4) and comparative example (10 x 7). Weights match to 4 and 3 decimals, and all 20 values of S\' match Table 4. Test against the weights, not the printed E values: those are rounded to 2 decimals and do not give the published weights.',
      tr: "Açıklayıcı örnek (5 x 4) ve karşılaştırmalı örnek (10 x 7). Ağırlıklar 4 ve 3 basamakta örtüşüyor; S' değerlerinin 20'si de Tablo 4 ile aynı. Test ağırlıklara göre yapılmalı, basılı E değerlerine göre değil: onlar 2 basamağa yuvarlanmıştır ve yayımlanan ağırlıkları vermez.",
    },
  },
  sources: [
    { label: 'Keshavarz-Ghorabaee, Amiri, Zavadskas, Turskis & Antucheviciene (2021), Symmetry 13(4), 525', doi: '10.3390/sym13040525' },
    { label: 'Trung et al. (2024), EUREKA: Physics and Engineering', doi: '10.21303/2461-4262.2024.003171' },
    { label: 'Keleş (2023), Ömer Halisdemir Üniversitesi İİBF Dergisi 16(3), 727-747', doi: '10.25287/ohuiibf.1239201' },
  ],
  en: {
    summary:
      'MEREC asks, for each criterion, how much the alternatives\' overall scores would change if that criterion were removed. Criteria whose removal changes the scores most get the largest weights. It needs strictly positive data. Pick it when the weights should reflect each criterion\'s effect on the result rather than just its spread.',
    whenToUse: [
      'Data are positive ratio-scale values.',
      'You want an objective method that is less driven by pure variance than SD or Entropy.',
    ],
    whenNot: [
      'The matrix has zeros or negatives: the logarithm is undefined, and a shift changes the weights.',
      'A criterion has one extreme outlier: min/x ratios explode and that criterion takes most of the weight.',
    ],
    inputs: ['Decision matrix, every value above 0.', 'Criterion type per column: benefit or cost.', 'No parameters.'],
    pitfalls: [
      'Zeros and negatives are rejected. A shift (x - min + 1) is possible only with a warning that the weights depend on it.',
      'A constant column has |ln n| = 0 everywhere, so removing it changes nothing and its weight is 0.',
      'Outliers dominate: in the paper\'s example one value of 5 against 450 gives that criterion a weight of 0.575. Show E next to w.',
      'Min and max change when alternatives are added or removed, and so do the weights.',
    ],
  },
  tr: {
    summary:
      'MEREC her kriter için şunu sorar: bu kriter çıkarılsa alternatiflerin genel puanları ne kadar değişir? Çıkarıldığında puanları en çok değiştiren kriterler en büyük ağırlığı alır. Kesinlikle pozitif veri ister. Ağırlıkların yalnız yayılımı değil, kriterin sonuç üzerindeki etkisini yansıtmasını istediğinde seç.',
    whenToUse: [
      'Veriler pozitif, oran ölçekli değerler.',
      "SD ya da Entropiden daha az salt varyansa dayanan nesnel bir yöntem istiyorsun.",
    ],
    whenNot: [
      'Matriste sıfır ya da negatif değer var: logaritma tanımsızdır, kaydırma da ağırlıkları değiştirir.',
      'Bir kriterde tek bir uç değer var: min/x oranları patlar ve ağırlığın çoğunu o kriter alır.',
    ],
    inputs: ["Her değeri 0'dan büyük karar matrisi.", 'Her sütun için kriter türü: fayda ya da maliyet.', 'Parametre yok.'],
    pitfalls: [
      'Sıfır ve negatif değerler reddedilir. Kaydırma (x - min + 1) ancak ağırlıkların buna bağlı olduğu uyarısıyla yapılabilir.',
      "Sabit bir sütunda her yerde |ln n| = 0 olur; onu çıkarmak hiçbir şeyi değiştirmez ve ağırlığı 0'dır.",
      "Uç değerler baskın çıkar: makaledeki örnekte 450'ye karşı tek bir 5 değeri o kritere 0,575 ağırlık verir. w'nin yanında E'yi de göster.",
      'Alternatif eklenip çıkarılınca min ve maks değişir, ağırlıklar da.',
    ],
  },
}
