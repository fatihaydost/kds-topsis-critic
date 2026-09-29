import type { MethodContent } from '../types'

// Source: docs/research/methods/vikor.md
export const vikor: MethodContent = {
  id: 'vikor',
  name: { en: 'VIKOR', tr: 'VIKOR' },
  fullName: { en: 'VIseKriterijumska Optimizacija I Kompromisno Resenje', tr: 'Çok kriterli optimizasyon ve uzlaşık çözüm' },
  family: 'ranking-distance',
  status: 'research',
  year: 1998,
  origin: {
    authors: 'Opricovic, S.',
    year: 1998,
    title: 'Multicriteria Optimization of Civil Engineering Systems',
    venue: 'Faculty of Civil Engineering, Belgrade',
    note: {
      en: 'Book in Serbian, not opened. The English statement used here is Opricovic & Tzeng (2004).',
      tr: 'Sırpça kitap, açılmadı. Burada kullanılan İngilizce anlatım Opricovic ve Tzeng (2004).',
    },
  },
  steps: [
    {
      title: { en: 'Best and worst per criterion', tr: 'Kriter başına en iyi ve en kötü' },
      tex: String.raw`f_j^{*} = \begin{cases} \max_i x_{ij} & j \in J^{+} \\ \min_i x_{ij} & j \in J^{-} \end{cases} \qquad f_j^{-} = \begin{cases} \min_i x_{ij} & j \in J^{+} \\ \max_i x_{ij} & j \in J^{-} \end{cases}`,
    },
    {
      title: { en: 'Group utility and individual regret', tr: 'Grup faydası ve bireysel pişmanlık' },
      tex: String.raw`S_i = \sum_{j=1}^{n} w_j \frac{f_j^{*} - x_{ij}}{f_j^{*} - f_j^{-}}, \qquad R_i = \max_j\ w_j \frac{f_j^{*} - x_{ij}}{f_j^{*} - f_j^{-}}`,
    },
    {
      title: { en: 'Compromise index', tr: 'Uzlaşı indeksi' },
      tex: String.raw`Q_i = v\,\frac{S_i - S^{*}}{S^{-} - S^{*}} + (1 - v)\,\frac{R_i - R^{*}}{R^{-} - R^{*}}`,
      note: {
        en: 'S* = min S, S- = max S, and the same for R. Rank by S, R and Q ascending: lower is better.',
        tr: "S* = min S, S- = maks S; R için de aynısı. S, R ve Q'ya göre küçükten büyüğe sıralanır: küçük olan iyidir.",
      },
    },
    {
      title: { en: 'Acceptable advantage and stability', tr: 'Kabul edilebilir üstünlük ve kararlılık' },
      tex: String.raw`C1:\ Q(a'') - Q(a') \ge DQ, \qquad DQ = \frac{1}{m - 1}`,
      note: {
        en: "a' is best by Q, a'' second. C2: a' is also best by S or by R. Both hold: a' alone. Only C1: a' and a''. C1 fails: every alternative whose Q is within DQ of a'.",
        tr: "a' Q'ya göre birinci, a'' ikincidir. C2: a' aynı zamanda S'ye ya da R'ye göre de birincidir. İkisi de sağlanırsa yalnız a'. Yalnız C1 sağlanırsa a' ve a''. C1 sağlanmazsa Q değeri a' değerine DQ'dan yakın olan tüm alternatifler.",
      },
    },
  ],
  combinedWith: [
    {
      methodId: 'ahp',
      text: {
        en: 'AHP then VIKOR, and fuzzy Delphi with AHP then VIKOR, in sustainability and renewable-energy papers (Mardani et al. 2016). 1,753 AHP-VIKOR co-mentions in OpenAlex.',
        tr: "Sürdürülebilirlik ve yenilenebilir enerji makalelerinde AHP ardından VIKOR ve bulanık Delphi ile AHP ardından VIKOR (Mardani vd. 2016). OpenAlex'te 1.753 AHP-VIKOR ortak geçişi.",
      },
    },
    {
      methodId: 'topsis',
      text: {
        en: 'VIKOR together with TOPSIS for comparison (Opricovic & Tzeng 2004).',
        tr: 'Karşılaştırma için TOPSIS ile birlikte VIKOR (Opricovic ve Tzeng 2004).',
      },
    },
    {
      methodId: 'bwm',
      text: {
        en: 'BWM then VIKOR, for example Gupta (2018).',
        tr: 'BWM ardından VIKOR; örneğin Gupta (2018).',
      },
    },
  ],
  reference: {
    source: 'Opricovic, S.; Tzeng, G.-H. (2004). Compromise solution by MCDM methods: A comparative analysis of VIKOR and TOPSIS. European Journal of Operational Research 156(2), 445-455',
    doi: '10.1016/S0377-2217(03)00020-1',
    table: 'Tables 1-3',
    match: 'match',
    note: {
      en: 'Mountain-climber example: S, R and Q match exactly, C1 and C2 hold, the compromise is A2, and the result is the same in both unit encodings. Q ranks also match Keshavarz Ghorabaee et al. (2015) in 7 of 7 weight sets, assuming v = 0.5 (the paper does not state v).',
      tr: "Dağcı örneği: S, R ve Q birebir örtüşüyor, C1 ve C2 sağlanıyor, uzlaşık çözüm A2 ve sonuç iki birim gösteriminde de aynı. Q sıraları Keshavarz Ghorabaee vd. (2015) ile 7 ağırlık setinin 7'sinde aynı; bunun için v = 0,5 varsayıldı (makale v'yi belirtmiyor).",
    },
  },
  sources: [
    { label: 'Opricovic (1998), Multicriteria Optimization of Civil Engineering Systems, Belgrade' },
    { label: 'Opricovic & Tzeng (2004), European Journal of Operational Research 156(2), 445-455', doi: '10.1016/S0377-2217(03)00020-1' },
    { label: 'Keshavarz Ghorabaee, Zavadskas, Olfat & Turskis (2015), Informatica 26(3), 435-451', doi: '10.15388/Informatica.2015.57' },
    { label: 'Mardani et al. (2016), VIKOR Technique: A Systematic Review, Sustainability 8(1), 37', doi: '10.3390/su8010037' },
    { label: 'pyDecision 5.1.1, vikor_method', url: 'https://github.com/Valdecy/pyDecision' },
  ],
  en: {
    summary:
      'VIKOR looks for a compromise: the alternative that is best for the group overall (S) while keeping the worst single-criterion regret small (R). It also tells you whether the winner is clearly ahead; if not, it returns a short list of equally acceptable compromise options.',
    whenToUse: [
      'Conflicting criteria and decision makers who want a compromise.',
      'You want an explicit test of whether the winner is stable (conditions C1 and C2).',
      'Units may change: the linear normalization is unaffected, unlike vector-normalized TOPSIS.',
    ],
    whenNot: [
      'Very few alternatives: DQ = 1/(m-1) is large (0.5 with 3 alternatives), so C1 rarely holds.',
      'The alternative set will change: best and worst values move with it.',
    ],
    inputs: [
      'Decision matrix, criterion type per column, weights summing to 1.',
      'Parameter v between 0 and 1, default 0.5 (weight of the "majority of criteria" strategy). Above 0.5 leans to majority, below to veto.',
      'Output: S, R, Q (lower is better), three rankings, conditions C1 and C2, and the compromise set.',
    ],
    pitfalls: [
      'A constant column makes a term 0/0; set it to 0.',
      'If all S (or all R) are equal, Q is undefined; use only the other term and warn.',
      'With 2 alternatives DQ = 1, so C1 needs a Q gap of 1.',
      'Ties in Q at the top: decide the second place by a stable rule and report the tie.',
      'Q is relative to this alternative set (0 best, 1 worst); do not compare it across problems.',
      'pyDecision\'s compromise-set logic differs from the paper; the three branches are implemented as described.',
    ],
  },
  tr: {
    summary:
      'VIKOR bir uzlaşı arar: genel toplamda en iyi (S) olurken tek bir kriterdeki en büyük pişmanlığı da küçük tutan (R) alternatifi seçer. Kazananın açık ara önde olup olmadığını da söyler; değilse eşit ölçüde kabul edilebilir uzlaşık seçeneklerden oluşan kısa bir liste döndürür.',
    whenToUse: [
      'Birbiriyle çelişen kriterler ve uzlaşı arayan karar vericiler.',
      'Kazananın kararlı olup olmadığını açıkça sınamak istiyorsun (C1 ve C2 koşulları).',
      "Birimler değişebilir: doğrusal normalizasyon, vektör normalizasyonlu TOPSIS'in aksine bundan etkilenmez.",
    ],
    whenNot: [
      'Alternatif sayısı çok az: DQ = 1/(m-1) büyük olur (3 alternatifte 0,5), C1 nadiren sağlanır.',
      'Alternatif kümesi değişecek: en iyi ve en kötü değerler onunla birlikte kayar.',
    ],
    inputs: [
      'Karar matrisi, her sütun için kriter türü, toplamı 1 olan ağırlıklar.',
      "0 ile 1 arasında v parametresi, varsayılan 0,5 (\"kriterlerin çoğunluğu\" stratejisinin ağırlığı). 0,5'in üstü çoğunluğa, altı vetoya yaklaşır.",
      'Çıktı: S, R, Q (küçük olan iyi), üç sıralama, C1 ve C2 koşulları ve uzlaşık çözüm kümesi.',
    ],
    pitfalls: [
      'Sabit bir sütun bir terimi 0/0 yapar; 0 al.',
      'Bütün S (ya da bütün R) değerleri eşitse Q tanımsızdır; yalnız diğer terimi kullan ve uyar.',
      "2 alternatifte DQ = 1 olur; C1 için Q farkının 1 olması gerekir.",
      'Q\'da en üstte eşitlik: ikinciyi kararlı bir kuralla belirle ve eşitliği raporla.',
      "Q bu alternatif kümesine göredir (0 en iyi, 1 en kötü); problemler arasında karşılaştırma.",
      "pyDecision'ın uzlaşık küme mantığı makaleden farklıdır; üç dal burada anlatıldığı gibi uygulanır.",
    ],
  },
}
