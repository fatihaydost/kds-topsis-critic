import type { MethodContent } from '../types'

// Source: docs/research/methods/entropy.md
export const entropy: MethodContent = {
  id: 'entropy',
  name: { en: 'Entropy', tr: 'Entropi' },
  fullName: { en: 'Entropy weighting (Shannon)', tr: 'Entropi ağırlıklandırması (Shannon)' },
  family: 'weighting-objective',
  status: 'research',
  year: 1981,
  origin: {
    authors: 'Hwang, C.-L.; Yoon, K.',
    year: 1981,
    title: 'Multiple Attribute Decision Making: Methods and Applications',
    venue: 'Springer, Lecture Notes in Economics and Mathematical Systems 186',
    doi: '10.1007/978-3-642-48318-9',
    note: {
      en: 'The information measure is Shannon (1948). Its use as a weighting method is usually credited to Zeleny (1982) and Hwang & Yoon (1981). Neither book was read; the algorithm follows open-access restatements.',
      tr: 'Bilgi ölçüsü Shannon (1948) kaynaklıdır. Ağırlıklandırma yöntemi olarak kullanımı genellikle Zeleny (1982) ile Hwang ve Yoon (1981) kaynaklarına bağlanır. İki kitap da okunmadı; algoritma açık erişimli anlatımları izler.',
    },
  },
  steps: [
    {
      title: { en: 'Proportions', tr: 'Paylar' },
      tex: String.raw`p_{ij} = \frac{x_{ij}}{\sum_{i=1}^{m} x_{ij}}`,
      note: {
        en: 'Default variant: raw data, criterion type ignored. The min-max option first normalizes with cost inversion, then takes shares.',
        tr: 'Varsayılan varyant: ham veri, kriter türü dikkate alınmaz. Min-maks seçeneği önce maliyet ters çevrilerek normalize eder, sonra payları alır.',
      },
    },
    {
      title: { en: 'Entropy per criterion', tr: 'Kriter başına entropi' },
      tex: String.raw`e_j = -\frac{1}{\ln m}\sum_{i=1}^{m} p_{ij} \ln p_{ij}, \qquad 0 \cdot \ln 0 := 0, \qquad 0 \le e_j \le 1`,
    },
    {
      title: { en: 'Degree of diversification', tr: 'Çeşitlenme derecesi' },
      tex: String.raw`d_j = 1 - e_j`,
    },
    {
      title: { en: 'Weights', tr: 'Ağırlıklar' },
      tex: String.raw`w_j = \frac{d_j}{\sum_{k=1}^{n} d_k}`,
    },
  ],
  combinedWith: [
    {
      methodId: 'topsis',
      text: {
        en: 'Entropy then TOPSIS is the second most common pipeline (4,639 OpenAlex co-mentions) and the standard template of Turkish financial-performance papers, for example Ersoy & Orçun (2022).',
        tr: "Entropi ardından TOPSIS en yaygın ikinci boru hattıdır (OpenAlex'te 4.639 ortak geçiş) ve Türkçe finansal performans makalelerinin standart kalıbıdır; örneğin Ersoy ve Orçun (2022).",
      },
    },
    {
      methodId: 'edas',
      text: {
        en: 'Entropy then EDAS: a renewable-energy study reviewed by Keshavarz-Ghorabaee et al. (2021), and Turkish studies of BIST insurers and exporters.',
        tr: 'Entropi ardından EDAS: Keshavarz-Ghorabaee vd. (2021) tarafından incelenen bir yenilenebilir enerji çalışması ve BIST sigorta şirketleri ile ihracatçılar üzerine Türkçe çalışmalar.',
      },
    },
    {
      methodId: 'cilos',
      text: {
        en: 'Entropy times CILOS gives IDOCRIW, used with EDAS and SAW by Zavadskas et al. (2017).',
        tr: 'Entropi ile CILOS çarpılınca IDOCRIW elde edilir; Zavadskas vd. (2017) bunu EDAS ve SAW ile kullanır.',
      },
    },
    {
      methodId: 'moora',
      text: {
        en: 'Entropy then MOORA or SAW for air-conditioner selection, with CRITIC as the alternative weighting (Tehnika 2017; authors and DOI not checked).',
        tr: 'Klima seçimi için Entropi ardından MOORA ya da SAW, alternatif ağırlıklandırma olarak CRITIC ile (Tehnika 2017; yazarlar ve DOI doğrulanmadı).',
      },
    },
  ],
  reference: {
    source: 'Zavadskas, E.K.; Cavallaro, F.; Podvezko, V.; Ubarte, I.; Kaklauskas, A. (2017). MCDM Assessment of a Healthy and Safe Built Environment According to Sustainable Development Principles: A Practical Neighborhood Approach in Vilnius. Sustainability 9(5), 702',
    doi: '10.3390/su9050702',
    table: 'Table 4 (input, economic block), Table 8 (Entropy)',
    match: 'partial',
    note: {
      en: 'Twenty-one Vilnius neighbourhoods, five economic criteria. All five published weights are reproduced to 4 decimals, but the paper assigns them to the wrong criteria (a fixed permutation of the rows). Matched after undoing it. The min-max option matches Krishnan et al. (2021), Table 5, with consistent labels.',
      tr: 'Yirmi bir Vilnius mahallesi, beş ekonomik kriter. Yayımlanan beş ağırlığın hepsi 4 basamakta elde ediliyor, ama makale bunları yanlış kriterlere atamış (satırların sabit bir permütasyonu). Permütasyon geri alınınca örtüşüyor. Min-maks seçeneği, etiketleri tutarlı olan Krishnan vd. (2021) Tablo 5 ile örtüşüyor.',
    },
  },
  sources: [
    { label: 'Shannon (1948), A Mathematical Theory of Communication, Bell System Technical Journal 27(3), 379-423', doi: '10.1002/j.1538-7305.1948.tb01338.x' },
    { label: 'Hwang & Yoon (1981), Multiple Attribute Decision Making, Springer', doi: '10.1007/978-3-642-48318-9' },
    { label: 'Zeleny (1982), Multiple Criteria Decision Making, McGraw-Hill' },
    { label: 'Zavadskas, Cavallaro, Podvezko, Ubarte & Kaklauskas (2017), Sustainability 9(5), 702', doi: '10.3390/su9050702' },
    { label: 'Krishnan, Kasim, Hamid & Ghazali (2021), Symmetry 13(6), 973', doi: '10.3390/sym13060973' },
    { label: 'Mukhametzyanov (2021), DMAME 4(2), 76-105', doi: '10.31181/dmame210402076i' },
    { label: 'Keshavarz-Ghorabaee et al. (2021), Symmetry 13(4), 525', doi: '10.3390/sym13040525' },
  ],
  en: {
    summary:
      'Entropy weighting treats each criterion as a source of information: if all alternatives score almost the same on a criterion, it cannot tell them apart and gets little weight; if scores are spread unevenly, it gets more. It looks only at the data, not at what the criterion means. Pick it for a quick, fully objective weighting of a filled decision matrix.',
    whenToUse: [
      'Positive, ratio-scale data (counts, prices, rates) and you want dispersion-based weights.',
      'As a baseline next to CRITIC, SD and MEREC.',
    ],
    whenNot: [
      'The data contain negatives or zeros you cannot shift sensibly.',
      'The matrix is very homogeneous: all entropies are close to 1, so tiny differences decide the weights.',
      'The importance of the criteria is known from the decision context.',
    ],
    inputs: [
      'Decision matrix. The default variant needs values of 0 or more and each column sum above 0.',
      'Criterion types are not used by the default variant; the min-max option uses them.',
      'Option: normalization sum (default) or min-max.',
    ],
    pitfalls: [
      'A column of all zeros has sum 0 and is rejected.',
      'Negative values are invalid in the default variant. Reject, switch to min-max, or shift the data; shifting changes the weights, and the page says so.',
      'A constant column gets entropy 1 and weight 0, as expected. If every column is constant, we fall back to equal weights and warn.',
      'Homogeneous data amplify noise: entropies of 0.991-0.999 gave weights of 0.024-0.378 in one published study. Show d next to w.',
      'The normalization variant changes the result a lot (up to 0.2 per weight on the Vilnius data). pyDecision uses yet another variant.',
      'Multiplying a column by a constant does not change the weights, adding a constant does (degrees C and K give different weights).',
    ],
  },
  tr: {
    summary:
      'Entropi ağırlıklandırması her kriteri bir bilgi kaynağı gibi görür: tüm alternatifler bir kriterde hemen hemen aynı puanı alıyorsa o kriter onları ayırt edemez ve az ağırlık alır; puanlar dengesiz dağılıyorsa daha çok ağırlık alır. Yalnız veriye bakar, kriterin anlamına bakmaz. Dolu bir karar matrisi için hızlı ve tamamen nesnel bir ağırlık istediğinde seç.',
    whenToUse: [
      'Pozitif, oran ölçekli veri (adet, fiyat, oran) ve yayılıma dayalı ağırlık istiyorsun.',
      'CRITIC, SD ve MEREC yanında bir karşılaştırma tabanı olarak.',
    ],
    whenNot: [
      'Veride makul biçimde kaydırılamayan negatif değerler ya da sıfırlar var.',
      "Matris çok homojen: tüm entropiler 1'e yakın olur ve ağırlıkları çok küçük farklar belirler.",
      'Kriterlerin önemi karar bağlamından biliniyor.',
    ],
    inputs: [
      'Karar matrisi. Varsayılan varyant 0 ya da daha büyük değerler ve toplamı 0\'dan büyük sütunlar ister.',
      'Varsayılan varyant kriter türlerini kullanmaz; min-maks seçeneği kullanır.',
      'Seçenek: toplam (varsayılan) ya da min-maks normalizasyonu.',
    ],
    pitfalls: [
      "Tamamı sıfır olan sütunun toplamı 0'dır ve reddedilir.",
      'Varsayılan varyantta negatif değer geçersizdir. Reddet, min-maks seçeneğine geç ya da veriyi kaydır; kaydırma ağırlıkları değiştirir ve sayfa bunu belirtir.',
      "Sabit bir sütun entropi 1 ve ağırlık 0 alır, beklendiği gibi. Bütün sütunlar sabitse eşit ağırlığa döner ve uyarırız.",
      "Homojen veri gürültüyü büyütür: yayımlanmış bir çalışmada 0,991-0,999 arası entropiler 0,024-0,378 arası ağırlıklar verdi. w'nin yanında d'yi de göster.",
      'Normalizasyon varyantı sonucu çok değiştirir (Vilnius verisinde ağırlık başına 0,2\'ye kadar). pyDecision ise başka bir varyant kullanır.',
      'Bir sütunu sabitle çarpmak ağırlıkları değiştirmez, sabit eklemek değiştirir (santigrat ve kelvin farklı ağırlık verir).',
    ],
  },
}
