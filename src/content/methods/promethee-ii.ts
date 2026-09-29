import type { MethodContent } from '../types'

// Source: docs/research/methods/promethee-ii.md
export const prometheeII: MethodContent = {
  id: 'promethee-ii',
  name: { en: 'PROMETHEE II', tr: 'PROMETHEE II' },
  fullName: {
    en: 'Preference Ranking Organization METHod for Enrichment of Evaluations II',
    tr: 'Değerlendirmeleri zenginleştirmek için tercih sıralama yöntemi II',
  },
  family: 'ranking-outranking',
  status: 'research',
  year: 1986,
  origin: {
    authors: 'Brans, J.-P.; Vincke, Ph.; Mareschal, B.',
    year: 1986,
    title: 'How to select and how to rank projects: The PROMETHEE method',
    venue: 'European Journal of Operational Research 24(2), 228-238',
    doi: '10.1016/0377-2217(86)90044-5',
    note: {
      en: 'First presented by Brans in 1982 (Université Laval). Companion paper: Brans & Vincke (1985), Management Science 31(6), 647-656.',
      tr: 'İlk kez Brans tarafından 1982\'de sunuldu (Université Laval). Eşlik eden makale: Brans ve Vincke (1985), Management Science 31(6), 647-656.',
    },
  },
  steps: [
    {
      title: { en: 'Pairwise differences', tr: 'İkili farklar' },
      tex: String.raw`d_j(a,b) = s_j\left(x_{aj} - x_{bj}\right), \qquad s_j = \begin{cases} +1 & j \in J^{+} \\ -1 & j \in J^{-} \end{cases}`,
      note: {
        en: 'Only differences are used, so there is no normalization step and negative values are fine.',
        tr: 'Yalnız farklar kullanıldığından normalizasyon adımı yoktur; negatif değerler sorun değildir.',
      },
    },
    {
      title: { en: 'Preference function per criterion', tr: 'Kriter başına tercih fonksiyonu' },
      tex: String.raw`P_j(a,b) = F_j\big(d_j(a,b)\big) \in [0,1], \qquad F_j(d) = 0 \ \ (d \le 0)`,
      note: {
        en: 'Six types: I usual (any difference counts), II U-shape (q), III V-shape (p), IV level (q, p), V linear with indifference (q, p), VI Gaussian (s).',
        tr: 'Altı tür: I olağan (her fark sayılır), II U biçimli (q), III V biçimli (p), IV kademeli (q, p), V farksızlık bölgeli doğrusal (q, p), VI Gauss (s).',
      },
    },
    {
      title: { en: 'Example: type V, linear with indifference', tr: 'Örnek: V türü, farksızlık bölgeli doğrusal' },
      tex: String.raw`F(d) = \begin{cases} 0 & d \le q \\ \dfrac{d - q}{p - q} & q < d \le p \\ 1 & d > p \end{cases}`,
      note: {
        en: 'Differences up to q are ignored, differences above p count fully, and preference grows linearly in between.',
        tr: "q'ya kadar olan farklar yok sayılır, p'nin üstündeki farklar tam sayılır, arada tercih doğrusal artar.",
      },
    },
    {
      title: { en: 'Aggregated preference index', tr: 'Birleşik tercih indeksi' },
      tex: String.raw`\pi(a,b) = \sum_{j=1}^{n} w_j\, P_j(a,b), \qquad \sum_j w_j = 1`,
    },
    {
      title: { en: 'Leaving and entering flows', tr: 'Çıkan ve giren akışlar' },
      tex: String.raw`\phi^{+}(a) = \frac{1}{m-1}\sum_{b \ne a} \pi(a,b), \qquad \phi^{-}(a) = \frac{1}{m-1}\sum_{b \ne a} \pi(b,a)`,
      note: {
        en: 'm is the number of alternatives. The 1986 paper reports plain sums without 1/(m-1); the ranking is the same.',
        tr: "m alternatif sayısıdır. 1986 makalesi 1/(m-1) olmadan düz toplamlar verir; sıralama aynıdır.",
      },
    },
    {
      title: { en: 'Net flow', tr: 'Net akış' },
      tex: String.raw`\phi(a) = \phi^{+}(a) - \phi^{-}(a) \in [-1, 1], \qquad \sum_a \phi(a) = 0`,
      note: {
        en: 'PROMETHEE II ranks by decreasing net flow. PROMETHEE I uses the two flows separately and shows pairs where they disagree as incomparable.',
        tr: 'PROMETHEE II net akışa göre büyükten küçüğe sıralar. PROMETHEE I iki akışı ayrı kullanır ve uyuşmadıkları çiftleri kıyaslanamaz gösterir.',
      },
    },
  ],
  combinedWith: [
    {
      methodId: 'ahp',
      text: {
        en: 'AHP then PROMETHEE (1,484 OpenAlex co-mentions): Dağdeviren (2008), equipment selection. The first AHP-PROMETHEE paper is dated 1995 by Çebi et al. (2022).',
        tr: "AHP ardından PROMETHEE (OpenAlex'te 1.484 ortak geçiş): Dağdeviren (2008), ekipman seçimi. Çebi vd. (2022) ilk AHP-PROMETHEE makalesini 1995'e tarihler.",
      },
    },
    {
      text: {
        en: 'Fuzzy ANP or fuzzy AHP then PROMETHEE: Tuzkaya et al. (2010), material handling equipment.',
        tr: 'Bulanık ANP ya da bulanık AHP ardından PROMETHEE: Tuzkaya vd. (2010), malzeme taşıma ekipmanı.',
      },
    },
    {
      methodId: 'entropy',
      text: {
        en: 'Entropy or CRITIC then PROMETHEE is common, but PROMETHEE does not normalize: weights computed on a normalized matrix and thresholds in raw units describe different things.',
        tr: 'Entropi ya da CRITIC ardından PROMETHEE yaygındır, ama PROMETHEE normalize etmez: normalize matris üzerinde hesaplanan ağırlıklar ile ham birimdeki eşikler farklı şeyleri anlatır.',
      },
    },
    {
      methodId: 'topsis',
      text: {
        en: 'As a cross-check next to TOPSIS, VIKOR and COPRAS: Sałabun, Wątróbski & Shekhovtsov (2020).',
        tr: 'TOPSIS, VIKOR ve COPRAS yanında çapraz kontrol olarak: Sałabun, Wątróbski ve Shekhovtsov (2020).',
      },
    },
  ],
  reference: {
    source: 'Brans, J.-P.; Vincke, Ph.; Mareschal, B. (1986). How to select and how to rank projects: The PROMETHEE method. European Journal of Operational Research 24(2), 228-238',
    doi: '10.1016/0377-2217(86)90044-5',
    table: 'Hydroelectric power station example (input from Mareschal 2019, Table 1)',
    match: 'match',
    note: {
      en: 'Six projects, six criteria, one preference type per criterion. The ranking a5 > a2 > a4 > a6 > a3 > a1 matches; pi differs by at most 0.001 and the summed net flow by 0.002, because the source rounds pi before summing. PROMETHEE I also shows a1 and a2 as incomparable, as the source says. pyDecision agrees to 1e-16.',
      tr: "Altı proje, altı kriter, her kriter için bir tercih türü. a5 > a2 > a4 > a6 > a3 > a1 sıralaması örtüşüyor; kaynak pi değerlerini toplamadan önce yuvarladığı için pi en fazla 0,001, toplam net akış 0,002 farklı. PROMETHEE I de kaynağın dediği gibi a1 ile a2'yi kıyaslanamaz gösteriyor. pyDecision 1e-16 düzeyinde uyuşuyor.",
    },
  },
  sources: [
    { label: 'Brans, Vincke & Mareschal (1986), European Journal of Operational Research 24(2), 228-238', doi: '10.1016/0377-2217(86)90044-5' },
    { label: 'Brans & Vincke (1985), Management Science 31(6), 647-656', doi: '10.1287/mnsc.31.6.647' },
    { label: 'Brans & Mareschal (2005), PROMETHEE methods', doi: '10.1007/0-387-23081-5_5' },
    { label: 'Mareschal (2015), Note on the PROMETHEE net flow computation', url: 'https://bertrand.mareschal.web.ulb.be/PG2024/assets/promethee_net_flow.pdf' },
    { label: 'Mareschal (2019), Exercises with Visual PROMETHEE', url: 'https://bertrand.mareschal.web.ulb.be/PG2024/assets/exercises-vp-2019.pdf' },
    { label: 'Behzadian et al. (2010), 217 PROMETHEE papers reviewed, EJOR 200(1), 198-215', doi: '10.1016/j.ejor.2009.01.021' },
    { label: 'De Keyser & Peeters (1996), EJOR 89, 457-461', doi: '10.1016/0377-2217(94)00307-6' },
    { label: 'Verly & De Smet (2013), IJMCDM 3(4), 325-345', doi: '10.1504/IJMCDM.2013.056781' },
    { label: 'Sałabun, Wątróbski & Shekhovtsov (2020), Symmetry 12(9), 1549', doi: '10.3390/sym12091549' },
  ],
  en: {
    summary:
      'PROMETHEE compares every pair of alternatives criterion by criterion and asks how strongly A is preferred to B there, using a preference function you choose per criterion (for example "any difference counts" or "differences under q are ignored, above p they count fully"). It then subtracts how much each alternative is beaten (negative flow) from how much it beats the others (positive flow). Pick it when small differences should not count, when criteria are on very different scales, or when you want to see which alternatives are incomparable (PROMETHEE I).',
    whenToUse: [
      'The decision maker can say what size of difference is negligible (q) and what size is decisive (p).',
      'Criteria are on very different scales and you do not want a normalization step to decide their spread.',
      'Partial compensation is acceptable: bounded preference functions cap how much one large advantage can buy.',
      'You want PROMETHEE I\'s partial order to expose incomparable pairs.',
    ],
    whenNot: [
      'Very many alternatives: the pairwise cost grows with the square of their number (fine up to about 300 in the browser).',
      'The thresholds would be picked at random: the result is then harder to defend than a plain weighted sum.',
      'Ranks must not depend on other alternatives: rank reversal is possible.',
      'A veto is needed: PROMETHEE has none; use ELECTRE III.',
    ],
    inputs: [
      'Decision matrix, at least 2 alternatives, any real values.',
      'Criterion type per column: benefit or cost.',
      'Weights, non-negative, normalized to sum 1.',
      'Per criterion a preference function and its parameters (q, p or s) in the units of that criterion. Suggested start: type V with q = 0 and p = the column range.',
    ],
    pitfalls: [
      'Rank reversal: adding or removing an alternative can swap two others. Removing one cannot swap a and b when their net flows differ by more than 2/(m-1); flag closer pairs.',
      'Thresholds are in raw units: rescaling a column (EUR to thousand EUR) means rescaling its thresholds.',
      'Results can change with q and p; include them in the sensitivity panel.',
      'A constant column makes every P = 0, so the criterion is silently inactive; warn.',
      'With V-shape functions and p at least the column range, the net flow is a weighted sum in disguise; with all usual functions it is a weighted Borda count. PROMETHEE adds value only when thresholds are chosen on purpose.',
    ],
  },
  tr: {
    summary:
      "PROMETHEE alternatifleri ikişer ikişer, her kriterde ayrı ayrı karşılaştırır ve orada A'nın B'ye ne kadar tercih edildiğini sorar; bunu her kriter için seçtiğin bir tercih fonksiyonuyla yapar (örneğin \"her fark sayılır\" ya da \"q'nun altındaki farklar yok sayılır, p'nin üstü tam sayılır\"). Sonra her alternatifin diğerlerini ne kadar geçtiğinden (pozitif akış) ne kadar geçildiğini (negatif akış) çıkarır. Küçük farklar sayılmamalıysa, kriterler çok farklı ölçeklerdeyse ya da kıyaslanamayan alternatifleri görmek istiyorsan (PROMETHEE I) seç.",
    whenToUse: [
      'Karar verici hangi büyüklükte farkın önemsiz (q), hangisinin belirleyici (p) olduğunu söyleyebiliyor.',
      'Kriterler çok farklı ölçeklerde ve yayılımlarına bir normalizasyon adımının karar vermesini istemiyorsun.',
      'Kısmi telafi kabul edilebilir: sınırlı tercih fonksiyonları tek bir büyük üstünlüğün ne kadar şey satın alabileceğini sınırlar.',
      'PROMETHEE I\'in kısmi sıralamasıyla kıyaslanamaz çiftleri görmek istiyorsun.',
    ],
    whenNot: [
      'Alternatif sayısı çok fazla: ikili karşılaştırma maliyeti sayının karesiyle büyür (tarayıcıda 300 civarına kadar sorun yok).',
      'Eşikler rastgele seçilecek: sonuç bu durumda düz bir ağırlıklı toplamdan daha zor savunulur.',
      'Sıralar diğer alternatiflere bağlı olmamalı: sıralamanın tersine dönmesi mümkündür.',
      'Veto gerekiyor: PROMETHEE\'de veto yoktur; ELECTRE III kullan.',
    ],
    inputs: [
      'Karar matrisi, en az 2 alternatif, herhangi gerçek değerler.',
      'Her sütun için kriter türü: fayda ya da maliyet.',
      'Negatif olmayan, toplamı 1\'e normalize edilen ağırlıklar.',
      'Her kriter için bir tercih fonksiyonu ve o kriterin biriminde parametreleri (q, p ya da s). Önerilen başlangıç: q = 0 ve p = sütun aralığı olan V türü.',
    ],
    pitfalls: [
      "Sıralamanın tersine dönmesi: bir alternatif eklemek ya da çıkarmak başka iki alternatifin yerini değiştirebilir. Net akışları 2/(m-1)'den fazla farklı olan a ile b, bir alternatif çıkarılınca yer değiştiremez; daha yakın çiftleri işaretle.",
      'Eşikler ham birimdedir: bir sütunu yeniden ölçeklemek (avrodan bin avroya) eşiklerini de ölçeklemeyi gerektirir.',
      'Sonuçlar q ve p ile değişebilir; bunları duyarlılık paneline ekle.',
      'Sabit bir sütunda her P = 0 olur, kriter sessizce devre dışı kalır; uyar.',
      "V biçimli fonksiyonlarda p sütun aralığına eşit ya da büyükse net akış kılık değiştirmiş bir ağırlıklı toplamdır; tüm fonksiyonlar olağan türdeyse ağırlıklı Borda sayımıdır. PROMETHEE ancak eşikler bilinçli seçildiğinde bir şey katar.",
    ],
  },
}
