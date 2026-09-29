import type { MethodContent } from '../types'

// Source: docs/research/methods/critic.md
export const critic: MethodContent = {
  id: 'critic',
  name: { en: 'CRITIC', tr: 'CRITIC' },
  fullName: {
    en: 'CRiteria Importance Through Intercriteria Correlation',
    tr: 'Kriterler arası korelasyon yoluyla kriter önemi',
  },
  family: 'weighting-objective',
  status: 'available',
  year: 1995,
  origin: {
    authors: 'Diakoulaki, D.; Mavrotas, G.; Papayannakis, L.',
    year: 1995,
    title: 'Determining objective weights in multiple criteria problems: The CRITIC method',
    venue: 'Computers & Operations Research 22(7), 763-770',
    doi: '10.1016/0305-0548(94)00059-H',
    note: {
      en: 'The origin paper is paywalled and was not read. The steps follow the open-access restatements by Krishnan et al. (2021) and Mukhametzyanov (2021), which agree with each other.',
      tr: 'Özgün makale ücretli erişimde olduğu için okunmadı. Adımlar, birbiriyle uyumlu olan açık erişimli Krishnan vd. (2021) ve Mukhametzyanov (2021) anlatımlarından alındı.',
    },
  },
  steps: [
    {
      title: { en: 'Min-max normalization', tr: 'Min-maks normalizasyonu' },
      tex: String.raw`r_{ij} = \begin{cases} \dfrac{x_{ij} - x_j^{\min}}{x_j^{\max} - x_j^{\min}} & j \in J^{+} \\[2ex] \dfrac{x_j^{\max} - x_{ij}}{x_j^{\max} - x_j^{\min}} & j \in J^{-} \end{cases}`,
      note: {
        en: 'J+ are the benefit criteria, J- the cost criteria. This is the "ideal point" transformation of the origin paper: every column ends up between 0 and 1, with 1 the best value.',
        tr: 'J+ fayda, J- maliyet kriterleridir. Özgün makaledeki "ideal nokta" dönüşümüdür: her sütun 0 ile 1 arasına iner, 1 en iyi değerdir.',
      },
    },
    {
      title: { en: 'Contrast: standard deviation', tr: 'Kontrast: standart sapma' },
      tex: String.raw`\sigma_j = \sqrt{\frac{1}{m-1}\sum_{i=1}^{m} \left(r_{ij} - \bar r_j\right)^2}`,
      note: {
        en: 'Sample standard deviation, as Excel STDEV. Using m instead of m - 1 scales every sigma by the same factor, so the weights do not change.',
        tr: "Örneklem standart sapması (Excel'deki STDEV). m - 1 yerine m kullanmak her sigmayı aynı çarpanla ölçekler, ağırlıklar değişmez.",
      },
    },
    {
      title: { en: 'Correlation between criteria', tr: 'Kriterler arası korelasyon' },
      tex: String.raw`\rho_{jk} = \operatorname{corr}\left(r_{\cdot j},\, r_{\cdot k}\right)`,
      note: {
        en: 'Pearson correlation of the normalized columns, without absolute value.',
        tr: 'Normalize sütunlar arasındaki Pearson korelasyonu, mutlak değer alınmadan.',
      },
    },
    {
      title: { en: 'Information content', tr: 'Bilgi miktarı' },
      tex: String.raw`C_j = \sigma_j \sum_{k=1}^{n} \left(1 - \rho_{jk}\right)`,
      note: {
        en: 'Contrast times conflict. A criterion that is spread out and disagrees with the others carries more information.',
        tr: 'Kontrast çarpı çatışma. Değerleri yayılan ve diğer kriterlerle çelişen kriter daha çok bilgi taşır.',
      },
    },
    {
      title: { en: 'Weights', tr: 'Ağırlıklar' },
      tex: String.raw`w_j = \frac{C_j}{\sum_{k=1}^{n} C_k}`,
    },
  ],
  combinedWith: [
    {
      methodId: 'topsis',
      text: {
        en: 'CRITIC then TOPSIS is the pipeline this site started from. Keshavarz-Ghorabaee et al. (2021) review a material-selection study that feeds CRITIC weights into TOPSIS, GRA and ORESTE.',
        tr: 'CRITIC ardından TOPSIS, bu sitenin çıkış noktası olan boru hattıdır. Keshavarz-Ghorabaee vd. (2021), CRITIC ağırlıklarını TOPSIS, GRA ve ORESTE ile kullanan bir malzeme seçimi çalışmasını inceler.',
      },
    },
    {
      methodId: 'entropy',
      text: {
        en: 'Often run next to Entropy, SD and MEREC as competing objective weightings on the same matrix (Keshavarz-Ghorabaee et al. 2021, Table 6; Mukhametzyanov 2021).',
        tr: 'Aynı matris üzerinde Entropi, SD ve MEREC ile rakip nesnel ağırlıklandırmalar olarak yan yana hesaplanır (Keshavarz-Ghorabaee vd. 2021, Tablo 6; Mukhametzyanov 2021).',
      },
    },
    {
      methodId: 'edas',
      text: {
        en: 'CRITIC then EDAS is common in Turkish financial-performance studies, for example Bayram (2021) on participation banks.',
        tr: 'CRITIC ardından EDAS, Türkçe finansal performans çalışmalarında yaygındır; örneğin Bayram (2021) katılım bankaları üzerine.',
      },
    },
  ],
  reference: {
    source: 'Krishnan, A.R.; Kasim, M.M.; Hamid, R.; Ghazali, M.F. (2021). A Modified CRITIC Method to Estimate the Objective Weights of Decision Criteria. Symmetry 13(6), 973',
    doi: '10.3390/sym13060973',
    table: 'Table 1 (input), Table 2 and Table 5 (output)',
    match: 'match',
    note: {
      en: 'Five smartphones and five criteria. Our weights match the published ones to 4 decimals (largest difference 4.6e-5) and the standard deviations match Table 2. A second check against the project\'s own Excel sheet agrees to 1e-12.',
      tr: "Beş akıllı telefon ve beş kriter. Ağırlıklarımız yayımlanan değerlerle 4 basamakta örtüşüyor (en büyük fark 4,6e-5); standart sapmalar Tablo 2 ile aynı. Projenin kendi Excel dosyasıyla yapılan ikinci kontrol 1e-12 düzeyinde uyuşuyor.",
    },
  },
  sources: [
    { label: 'Diakoulaki, Mavrotas & Papayannakis (1995), Computers & Operations Research 22(7), 763-770', doi: '10.1016/0305-0548(94)00059-H' },
    { label: 'Krishnan, Kasim, Hamid & Ghazali (2021), Symmetry 13(6), 973', doi: '10.3390/sym13060973' },
    { label: 'Mukhametzyanov (2021), Decision Making: Applications in Management and Engineering 4(2), 76-105', doi: '10.31181/dmame210402076i' },
    { label: 'Keshavarz-Ghorabaee et al. (2021), Symmetry 13(4), 525', doi: '10.3390/sym13040525' },
  ],
  en: {
    summary:
      'CRITIC gives more weight to a criterion when its values vary a lot across alternatives (contrast) and when it disagrees with the other criteria (conflict). Two criteria that tell the same story share weight instead of being counted twice. Use it when you have a filled decision matrix and no expert opinion about importance.',
    whenToUse: [
      'Weights must come from the data, not from people.',
      'Criteria may be correlated (financial ratios, technical specifications) and you want redundancy to cost weight.',
      'You want a method whose steps (standard deviation, correlation, information) are easy to show.',
    ],
    whenNot: [
      'There are very few alternatives: with 3 or fewer, correlations are +1, -1 or unstable.',
      'The decision maker has clear views on importance. Use AHP, BWM or SWARA, or combine the two.',
      'You expect to add or remove alternatives later: the weights change with the set.',
    ],
    inputs: [
      'Decision matrix with m alternatives and n criteria, real numbers. At least 4 alternatives recommended, 2 is the technical minimum.',
      'Criterion type per column (benefit or cost). It is used only in the normalization.',
      'No parameters.',
    ],
    pitfalls: [
      'A constant column cannot be normalized. We set its values to 0, which gives it weight 0, and show a warning.',
      'If every column is constant there is no information at all; we fall back to equal weights and warn.',
      'With fewer than 4 alternatives the correlations jump around; we warn below 4.',
      'Negative correlation raises weight: 1 - rho can reach 2, so strongly opposed criteria get large weights. This is by design in the origin method; Mukhametzyanov (2021) argues it is a flaw and proposes using |rho|.',
      'Adding or removing an alternative changes min, max, spread and correlations, so the weights and their order can change.',
      'Negative raw values are fine, min-max handles them.',
    ],
  },
  tr: {
    summary:
      'CRITIC, bir kriterin değerleri alternatifler arasında çok değişiyorsa (kontrast) ve diğer kriterlerle çelişiyorsa (çatışma) o kritere daha çok ağırlık verir. Aynı şeyi söyleyen iki kriter ağırlığı paylaşır, iki kez sayılmaz. Dolu bir karar matrisin varsa ve önem konusunda uzman görüşü yoksa kullan.',
    whenToUse: [
      'Ağırlıklar kişilerden değil veriden gelmeli.',
      'Kriterler birbiriyle ilişkili olabilir (finansal oranlar, teknik özellikler) ve tekrarlanan bilginin ağırlık kaybettirmesini istiyorsun.',
      'Adımları (standart sapma, korelasyon, bilgi miktarı) adım adım gösterilebilen bir yöntem arıyorsun.',
    ],
    whenNot: [
      'Alternatif sayısı çok az: 3 veya daha az alternatifte korelasyonlar +1, -1 çıkar ya da oynaktır.',
      'Karar vericinin önem konusunda net görüşü var. AHP, BWM veya SWARA kullan ya da ikisini birleştir.',
      'İleride alternatif ekleyip çıkarmayı bekliyorsun: ağırlıklar kümeyle birlikte değişir.',
    ],
    inputs: [
      'm alternatif ve n kriterden oluşan karar matrisi, gerçek sayılar. En az 4 alternatif önerilir, teknik alt sınır 2.',
      'Her sütun için kriter türü (fayda ya da maliyet). Yalnız normalizasyonda kullanılır.',
      'Parametre yok.',
    ],
    pitfalls: [
      'Sabit bir sütun normalize edilemez. Değerlerini 0 yaparız, bu da ağırlığını 0 yapar, ve uyarı gösteririz.',
      'Bütün sütunlar sabitse hiç bilgi yoktur; eşit ağırlığa döner ve uyarırız.',
      '4\'ten az alternatifte korelasyonlar sıçrar; 4\'ün altında uyarırız.',
      'Negatif korelasyon ağırlığı artırır: 1 - rho 2\'ye kadar çıkabilir, bu yüzden birbirine çok zıt kriterler büyük ağırlık alır. Özgün yöntemde bu bilinçli bir tasarımdır; Mukhametzyanov (2021) bunu kusur sayar ve |rho| kullanmayı önerir.',
      'Alternatif eklemek ya da çıkarmak min, maks, yayılım ve korelasyonları değiştirir; ağırlıklar ve sıraları değişebilir.',
      'Negatif ham değerler sorun değildir, min-maks normalizasyonu bunları karşılar.',
    ],
  },
}
