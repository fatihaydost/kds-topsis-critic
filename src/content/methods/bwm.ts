import type { MethodContent } from '../types'

// Source: docs/research/methods/bwm.md
export const bwm: MethodContent = {
  id: 'bwm',
  name: { en: 'BWM', tr: 'BWM' },
  fullName: { en: 'Best-Worst Method', tr: 'En iyi-en kötü yöntemi' },
  family: 'weighting-subjective',
  status: 'research',
  year: 2015,
  origin: {
    authors: 'Rezaei, J.',
    year: 2015,
    title: 'Best-worst multi-criteria decision-making method',
    venue: 'Omega 53, 49-57',
    doi: '10.1016/j.omega.2014.11.009',
    note: {
      en: 'The 2015 paper has the non-linear model. The linear model with a unique solution is Rezaei (2016), Omega 64, 126-130. The input-based consistency ratio is from Liang, Brunelli & Rezaei (2020).',
      tr: "2015 makalesinde doğrusal olmayan model vardır. Tek çözümlü doğrusal model Rezaei (2016), Omega 64, 126-130'dadır. Girdiye dayalı tutarlılık oranı Liang, Brunelli ve Rezaei (2020) kaynaklıdır.",
    },
  },
  steps: [
    {
      title: { en: 'Two comparison vectors', tr: 'İki karşılaştırma vektörü' },
      tex: String.raw`a_B = (a_{B1}, \dots, a_{Bn}), \qquad a_W = (a_{1W}, \dots, a_{nW}), \qquad a_{BB} = a_{WW} = 1`,
      note: {
        en: 'B is the best (most important) criterion, W the worst. Values on a 1-9 scale; a_BW must be the same number in both vectors.',
        tr: 'B en iyi (en önemli), W en kötü kriterdir. Değerler 1-9 ölçeğinde; a_BW iki vektörde de aynı sayı olmalı.',
      },
    },
    {
      title: { en: 'Linear model (default)', tr: 'Doğrusal model (varsayılan)' },
      tex: String.raw`\begin{aligned} &\min\ \xi^{L} \\ &\left|w_B - a_{Bj} w_j\right| \le \xi^{L},\ \ \left|w_j - a_{jW} w_W\right| \le \xi^{L}\ \ \forall j, \qquad \sum_j w_j = 1,\ \ w_j \ge 0 \end{aligned}`,
      note: {
        en: 'Rezaei (2016). Each absolute value becomes two linear inequalities, so this is a small linear program with a unique solution. A xi close to 0 means high consistency.',
        tr: 'Rezaei (2016). Her mutlak değer iki doğrusal eşitsizliğe açılır; sonuç tek çözümlü küçük bir doğrusal programdır. xi değerinin 0\'a yakın olması yüksek tutarlılık demektir.',
      },
    },
    {
      title: { en: 'Non-linear model (option)', tr: 'Doğrusal olmayan model (seçenek)' },
      tex: String.raw`\begin{aligned} &\min\ \xi \\ &\left|\frac{w_B}{w_j} - a_{Bj}\right| \le \xi,\ \ \left|\frac{w_j}{w_W} - a_{jW}\right| \le \xi\ \ \forall j, \qquad \sum_j w_j = 1,\ \ w_j \ge 0 \end{aligned}`,
      note: {
        en: 'Rezaei (2015). The optimal xi* is unique, the weights may not be. Consistency ratio CR = xi* / CI(a_BW), with CI = 0, 0.44, 1.00, 1.63, 2.30, 3.00, 3.73, 4.47, 5.23 for a_BW = 1 to 9.',
        tr: 'Rezaei (2015). En iyi xi* tektir, ağırlıklar tek olmayabilir. Tutarlılık oranı CR = xi* / CI(a_BW); a_BW = 1 ile 9 için CI = 0; 0,44; 1,00; 1,63; 2,30; 3,00; 3,73; 4,47; 5,23.',
      },
    },
    {
      title: { en: 'Input-based consistency ratio', tr: 'Girdiye dayalı tutarlılık oranı' },
      tex: String.raw`CR^{I} = \max_j \frac{\left|a_{Bj}\, a_{jW} - a_{BW}\right|}{a_{BW}^2 - a_{BW}}`,
      note: {
        en: 'Liang, Brunelli & Rezaei (2020). Needs no optimization; CR^I = 0 when a_BW = 1. Full consistency means a_Bj a_jW = a_BW for every j.',
        tr: 'Liang, Brunelli ve Rezaei (2020). Optimizasyon gerektirmez; a_BW = 1 ise CR^I = 0. Tam tutarlılık, her j için a_Bj a_jW = a_BW demektir.',
      },
    },
  ],
  combinedWith: [
    {
      methodId: 'topsis',
      text: {
        en: 'BWM then TOPSIS or VIKOR are the recurring partners: of 124 BWM publications up to January 2019, 83 integrate BWM with other methods (Mi et al. 2019). Example: You et al. (2017), BWM-TOPSIS.',
        tr: "BWM ardından TOPSIS ya da VIKOR en sık görülen ortaklardır: Ocak 2019'a kadarki 124 BWM yayınının 83'ü BWM'yi başka yöntemlerle birleştirir (Mi vd. 2019). Örnek: You vd. (2017), BWM-TOPSIS.",
      },
    },
    {
      methodId: 'vikor',
      text: {
        en: 'BWM then VIKOR, for example Gupta (2018) on air transport.',
        tr: 'BWM ardından VIKOR; örneğin Gupta (2018), hava taşımacılığı.',
      },
    },
    {
      methodId: 'ahp',
      text: {
        en: 'BWM and AHP are competing subjective methods; Rezaei (2015) compares them.',
        tr: 'BWM ve AHP rakip öznel yöntemlerdir; Rezaei (2015) ikisini karşılaştırır.',
      },
    },
  ],
  reference: {
    source: 'Rezaei, J. (2016). Best-worst multi-criteria decision-making method: Some properties and a linear model. Omega 64, 126-130',
    doi: '10.1016/j.omega.2015.12.001',
    table: 'Tables 2-3 (input), Sections 3 and 4 (output)',
    match: 'match',
    note: {
      en: 'Car purchase, five criteria, best = price, worst = style. Linear-model weights match for the consistent and the inconsistent example (largest difference 4.6e-5, xi^L = 0.0109). The non-linear xi* = 0.1459 matches and our weights fall inside all five published intervals.',
      tr: 'Araba satın alma, beş kriter, en iyi = fiyat, en kötü = stil. Doğrusal model ağırlıkları tutarlı ve tutarsız örnekte örtüşüyor (en büyük fark 4,6e-5, xi^L = 0,0109). Doğrusal olmayan xi* = 0,1459 aynı; ağırlıklarımız yayımlanan beş aralığın hepsinin içinde.',
    },
  },
  sources: [
    { label: 'Rezaei (2015), Omega 53, 49-57', doi: '10.1016/j.omega.2014.11.009' },
    { label: 'Rezaei (2016), Omega 64, 126-130', doi: '10.1016/j.omega.2015.12.001' },
    { label: 'Liang, Brunelli & Rezaei (2020), Omega 96, 102175', doi: '10.1016/j.omega.2019.102175' },
    { label: 'Mi, Tang, Liao, Shen & Lev (2019), Omega 87, 205-225', doi: '10.1016/j.omega.2019.01.009' },
    { label: 'You et al. (2017), Sustainability 9(12), 2329', doi: '10.3390/su9122329' },
    { label: 'Gupta (2018), Journal of Air Transport Management 68, 35-47', doi: '10.1016/j.jairtraman.2017.06.001' },
  ],
  en: {
    summary:
      'In BWM you pick the most important (best) and the least important (worst) criterion, then say how much more important the best one is than each other criterion, and how much more important each criterion is than the worst one (1-9). That is only 2n - 3 judgements instead of the n(n-1)/2 of AHP. The method finds the weights that fit these judgements best and reports how consistent they are.',
    whenToUse: [
      'Subjective weights with fewer questions than AHP.',
      'Between 3 and 10 criteria.',
      'One decision maker, or a group that has agreed on one pair of vectors.',
    ],
    whenNot: [
      'The decision maker cannot name a single best and a single worst criterion.',
      'You need comparisons among the middle criteria: BWM never compares them directly.',
    ],
    inputs: [
      'Which criterion is best (B) and which is worst (W).',
      'Best-to-others vector, values 1-9, with a_BB = 1.',
      'Others-to-worst vector, values 1-9, with a_WW = 1. a_BW must match in both.',
      'Model option: linear (default) or non-linear.',
    ],
    pitfalls: [
      'If the best-to-worst value differs between the two vectors, the input is rejected.',
      'The non-linear model can have many optimal weight vectors with the same xi*. Different solvers return different weights.',
      'xi of the linear model is in weight units and much smaller than xi* of the non-linear model (0.0109 vs 0.1459 in the example). Never divide it by the CI table of the non-linear model.',
      'If two criteria are equally best, pick one as B and enter 1 for the other.',
      'pyDecision\'s bw_method implements neither model and should not be used as a reference.',
    ],
  },
  tr: {
    summary:
      "BWM'de en önemli (en iyi) ve en önemsiz (en kötü) kriteri seçersin; sonra en iyinin diğer her kriterden ne kadar önemli olduğunu ve her kriterin en kötüden ne kadar önemli olduğunu söylersin (1-9). AHP'deki n(n-1)/2 yerine yalnız 2n - 3 yargı gerekir. Yöntem bu yargılara en iyi uyan ağırlıkları bulur ve ne kadar tutarlı olduklarını raporlar.",
    whenToUse: [
      "AHP'den daha az soruyla öznel ağırlık.",
      '3 ile 10 arası kriter.',
      'Tek karar verici ya da tek bir vektör çiftinde uzlaşmış bir grup.',
    ],
    whenNot: [
      'Karar verici tek bir en iyi ve tek bir en kötü kriter gösteremiyor.',
      'Ortadaki kriterlerin birbiriyle karşılaştırılması gerekiyor: BWM bunları doğrudan karşılaştırmaz.',
    ],
    inputs: [
      'Hangi kriterin en iyi (B), hangisinin en kötü (W) olduğu.',
      'En iyiden diğerlerine vektörü, 1-9 değerleri, a_BB = 1.',
      "Diğerlerinden en kötüye vektörü, 1-9 değerleri, a_WW = 1. a_BW iki vektörde aynı olmalı.",
      'Model seçeneği: doğrusal (varsayılan) ya da doğrusal olmayan.',
    ],
    pitfalls: [
      'En iyiden en kötüye değeri iki vektörde farklıysa girdi reddedilir.',
      'Doğrusal olmayan modelin aynı xi* değerini veren birden çok en iyi ağırlık vektörü olabilir. Farklı çözücüler farklı ağırlıklar döndürür.',
      "Doğrusal modelin xi değeri ağırlık birimindedir ve doğrusal olmayan modelin xi* değerinden çok küçüktür (örnekte 0,0109 ve 0,1459). Doğrusal olmayan modelin CI tablosuna bölünmemelidir.",
      'İki kriter eşit derecede en iyiyse birini B seç, diğeri için 1 gir.',
      "pyDecision'daki bw_method iki modeli de uygulamaz; referans olarak kullanılmamalı.",
    ],
  },
}
