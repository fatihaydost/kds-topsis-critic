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
      en: 'The information measure is Shannon (1948); its use as a weighting method is usually credited to Zeleny (1982) and Hwang & Yoon (1981), and the algorithm follows open-access restatements.',
      tr: 'Bilgi ölçüsü Shannon (1948) kaynaklıdır; ağırlıklandırmada kullanımı genellikle Zeleny (1982) ile Hwang ve Yoon (1981) kaynaklarına bağlanır, algoritma açık erişimli anlatımları izler.',
    },
  },
  steps: [
    {
      title: { en: 'Proportions', tr: 'Paylar' },
      tex: String.raw`p_{ij} = \frac{x_{ij}}{\sum_{i=1}^{m} x_{ij}}`,
      note: {
        en: 'Default variant: raw data, criterion type ignored; the min-max option first normalizes with cost inversion, then takes shares.',
        tr: 'Varsayılan varyant: ham veri, kriter türü dikkate alınmaz; min-maks seçeneği önce maliyeti ters çevirerek normalize eder, sonra payları alır.',
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
    match: 'partial',
    note: {
      en: 'Published example (Table 4 (input, economic block), Table 8 (Entropy)); this method is not computed here yet, only recomputed during research. Twenty-one Vilnius neighbourhoods, five economic criteria. All five published weights are reproduced to 4 decimals, but the paper assigns them to the wrong criteria (a fixed permutation of the rows). Matched after undoing it. The min-max option matches Krishnan et al. (2021), Table 5, with consistent labels.',
      tr: 'Yayımlanmış örnek (Tablo 4 (girdi, ekonomik blok), Tablo 8 (Entropi)); bu yöntem sitede henüz hesaplanmıyor, yalnız araştırmada yeniden hesaplandı. Yirmi bir Vilnius mahallesi, beş ekonomik kriter. Yayımlanan beş ağırlığın hepsi 4 basamakta elde ediliyor, ama makale bunları yanlış kriterlere atamış (satırların sabit bir permütasyonu). Permütasyon geri alınınca örtüşüyor. Min-maks seçeneği, etiketleri tutarlı olan Krishnan vd. (2021) Tablo 5 ile örtüşüyor.',
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
      'Entropy gives little weight to criteria on which all alternatives score almost the same, and more to criteria with uneven scores. Use it for quick, fully objective weights from a filled matrix.',
    whenToUse: [
      'Positive ratio-scale data (counts, prices, rates), dispersion-based weights wanted.',
      'As a baseline next to CRITIC, SD and MEREC.',
    ],
    whenNot: [
      'Negatives or zeros you cannot shift sensibly.',
      'Very homogeneous data: entropies near 1, tiny differences decide.',
      'Importance is known from the decision context.',
    ],
    inputs: [
      'Decision matrix. The default variant needs values of 0 or more and each column sum above 0.',
      'Criterion types are not used by the default variant; the min-max option uses them.',
      'Option: normalization sum (default) or min-max.',
    ],
    pitfalls: [
      'Negative values are invalid in the default variant; switch to min-max or shift the data, which changes the weights.',
      'Homogeneous data amplify noise: entropies of 0.991-0.999 gave weights of 0.024-0.378 in one published study.',
      'The normalization variant (up to 0.2 per weight on the Vilnius data) and adding a constant (C vs K) both change the weights; multiplying does not.',
    ],
  },
  tr: {
    summary:
      'Entropi, tüm alternatiflerin hemen hemen aynı puanı aldığı kriterlere az, puanları dengesiz dağılan kriterlere daha çok ağırlık verir. Dolu bir matristen hızlı ve tamamen nesnel ağırlık için kullanın.',
    whenToUse: [
      'Pozitif, oran ölçekli veri (adet, fiyat, oran); yayılıma dayalı ağırlık isteniyor.',
      'CRITIC, SD ve MEREC yanında bir karşılaştırma tabanı olarak.',
    ],
    whenNot: [
      'Makul biçimde kaydırılamayan negatif değerler ya da sıfırlar var.',
      "Veri çok homojen: entropiler 1'e yakın, küçük farklar belirleyici olur.",
      'Önem karar bağlamından biliniyor.',
    ],
    inputs: [
      "Karar matrisi. Varsayılan varyant 0 ya da daha büyük değerler ve toplamı 0'dan büyük sütunlar ister.",
      'Varsayılan varyant kriter türlerini kullanmaz; min-maks seçeneği kullanır.',
      'Seçenek: toplam (varsayılan) ya da min-maks normalizasyonu.',
    ],
    pitfalls: [
      'Varsayılan varyantta negatif değer geçersizdir; min-maks seçeneğine geçin ya da veriyi kaydırın, ama kaydırma ağırlıkları değiştirir.',
      'Homojen veri gürültüyü büyütür: yayımlanmış bir çalışmada 0,991-0,999 arası entropiler 0,024-0,378 arası ağırlıklar verdi.',
      "Normalizasyon varyantı (Vilnius verisinde ağırlık başına 0,2'ye kadar) ve sabit eklemek (santigrat ve kelvin) ağırlıkları değiştirir; sabitle çarpmak değiştirmez.",
    ],
  },
}
