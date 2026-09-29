import type { MethodContent } from '../types'

// Source: docs/research/methods/electre-iii.md
export const electreIII: MethodContent = {
  id: 'electre-iii',
  name: { en: 'ELECTRE III', tr: 'ELECTRE III' },
  fullName: { en: 'ELimination Et Choix Traduisant la REalité III', tr: 'Gerçeği yansıtan eleme ve seçim III' },
  family: 'ranking-outranking',
  status: 'research',
  year: 1978,
  origin: {
    authors: 'Roy, B.',
    year: 1978,
    title: 'ELECTRE III : un algorithme de classements fondé sur une représentation floue des préférences en présence de critères multiples',
    venue: 'Cahiers du Centre d\'Études de Recherche Opérationnelle 20(1), 3-24',
    note: {
      en: 'No DOI. The standard modern description is Figueira, Mousseau & Roy (2005).',
      tr: 'DOI yok. Güncel standart anlatım Figueira, Mousseau ve Roy (2005).',
    },
  },
  steps: [
    {
      title: { en: 'Advantage of b over a', tr: "b'nin a karşısındaki üstünlüğü" },
      tex: String.raw`\Delta_j(a,b) = \begin{cases} g_j(b) - g_j(a) & j \in J^{+} \\ g_j(a) - g_j(b) & j \in J^{-} \end{cases}`,
      note: {
        en: 'Thresholds q (indifference), p (preference) and v (veto) are evaluated at g_j(a) (direct thresholds), with 0 <= q <= p <= v.',
        tr: 'q (farksızlık), p (tercih) ve v (veto) eşikleri g_j(a) üzerinden hesaplanır (doğrudan eşik); 0 <= q <= p <= v.',
      },
    },
    {
      title: { en: 'Partial and global concordance', tr: 'Kısmi ve genel uyum' },
      tex: String.raw`c_j(a,b) = \begin{cases} 1 & \Delta_j \le q_j \\ \dfrac{p_j - \Delta_j}{p_j - q_j} & q_j < \Delta_j < p_j \\ 0 & \Delta_j \ge p_j \end{cases} \qquad C(a,b) = \frac{\sum_j w_j\, c_j(a,b)}{\sum_j w_j}`,
    },
    {
      title: { en: 'Partial discordance', tr: 'Kısmi uyumsuzluk' },
      tex: String.raw`d_j(a,b) = \begin{cases} 0 & \Delta_j \le p_j \\ \dfrac{\Delta_j - p_j}{v_j - p_j} & p_j < \Delta_j < v_j \\ 1 & \Delta_j \ge v_j \end{cases}`,
      note: {
        en: 'Without a veto threshold, d is always 0.',
        tr: 'Veto eşiği yoksa d her zaman 0\'dır.',
      },
    },
    {
      title: { en: 'Credibility', tr: 'Güvenilirlik' },
      tex: String.raw`\sigma(a,b) = C(a,b) \prod_{j:\ d_j(a,b) > C(a,b)} \frac{1 - d_j(a,b)}{1 - C(a,b)}`,
      note: {
        en: 'If no d exceeds C, the product is empty and sigma = C. Any d = 1 gives sigma = 0.',
        tr: "Hiçbir d, C'yi aşmıyorsa çarpım boştur ve sigma = C olur. Herhangi bir d = 1 ise sigma = 0.",
      },
    },
    {
      title: { en: 'Distillation', tr: 'Damıtma' },
      tex: String.raw`s(\lambda) = 0.30 - 0.15\,\lambda, \qquad a \mathrel{S^{\lambda}} b \iff \sigma(a,b) > \lambda \ \wedge\ \sigma(a,b) - \sigma(b,a) > s\big(\sigma(a,b)\big)`,
      note: {
        en: 'Qualification Q(a) = number of alternatives a outranks minus number that outrank a. The descending distillation keeps the best Q at shrinking cut levels, the ascending one the worst; the final result is the intersection of the two pre-orders, where disagreement means incomparable.',
        tr: "Nitelik puanı Q(a) = a'nın üstün geldiği alternatif sayısı eksi a'ya üstün gelen sayısı. Azalan damıtma küçülen kesim düzeylerinde en iyi Q'yu, artan damıtma en kötüyü tutar; nihai sonuç iki ön sıralamanın kesişimidir, uyuşmazlık kıyaslanamazlık demektir.",
      },
    },
  ],
  combinedWith: [
    {
      methodId: 'ahp',
      text: {
        en: 'Subjective weights (AHP, direct rating, stakeholder votes) then ELECTRE III is the usual pattern, because ELECTRE weights are voting powers. Example: Hokkanen & Salminen (1994), solid waste management.',
        tr: 'Öznel ağırlıklar (AHP, doğrudan puanlama, paydaş oyları) ardından ELECTRE III olağan kalıptır, çünkü ELECTRE ağırlıkları oy gücüdür. Örnek: Hokkanen ve Salminen (1994), katı atık yönetimi.',
      },
    },
    {
      text: {
        en: 'SMAA-III for robustness when weights or thresholds are uncertain (Tervonen, Figueira, Lahdelma et al.).',
        tr: 'Ağırlıklar ya da eşikler belirsizse sağlamlık için SMAA-III (Tervonen, Figueira, Lahdelma vd.).',
      },
    },
    {
      methodId: 'promethee-ii',
      text: {
        en: 'As a non-compensatory cross-check next to PROMETHEE II or TOPSIS in the same study; Brans et al. (1986) already compare PROMETHEE with ELECTRE III.',
        tr: 'Aynı çalışmada PROMETHEE II ya da TOPSIS yanında telafi etmeyen bir çapraz kontrol olarak; Brans vd. (1986) PROMETHEE\'yi ELECTRE III ile zaten karşılaştırır.',
      },
    },
  ],
  reference: {
    source: 'Wang, X.; Triantaphyllou, E. (2008). Ranking irregularities when evaluating alternatives by using some ELECTRE methods. Omega 36(1), 45-63',
    doi: '10.1016/j.omega.2005.12.003',
    table: 'Section 3.2, pp. 51-53',
    match: 'match',
    note: {
      en: 'Waste incineration strategy, 11 alternatives, 11 criteria, direct relative thresholds, no veto. All 110 credibility cells match at 2 decimals, and both distillation pre-orders and the final result (A7 and A9 on top, incomparable) match. In the modified case the top alternative matches; one lower class is a tie where the paper prints a strict order.',
      tr: 'Atık yakma stratejisi, 11 alternatif, 11 kriter, doğrudan göreli eşikler, veto yok. Güvenilirlik matrisinin 110 hücresi 2 basamakta örtüşüyor; iki damıtma ön sıralaması ve nihai sonuç (A7 ve A9 en üstte, kıyaslanamaz) aynı. Değiştirilmiş durumda en üstteki alternatif örtüşüyor; alttaki bir sınıfta makale kesin sıra basmışken biz eşitlik buluyoruz.',
    },
  },
  sources: [
    { label: 'Roy (1978), Cahiers du CERO 20(1), 3-24' },
    { label: 'Figueira, Mousseau & Roy (2005), ELECTRE methods', doi: '10.1007/0-387-23081-5_4' },
    { label: 'Wang & Triantaphyllou (2008), Omega 36(1), 45-63', doi: '10.1016/j.omega.2005.12.003' },
    { label: 'Govindan & Jepsen (2016), EJOR 250(1), 1-29', doi: '10.1016/j.ejor.2015.07.019' },
    { label: 'Hokkanen & Salminen (1994), ELECTRE III for solid waste management', doi: '10.1007/978-94-017-0767-1_9' },
    { label: 'Tervonen, Figueira, Lahdelma et al., SMAA-III', doi: '10.1007/978-1-4020-9026-4_15' },
  ],
  en: {
    summary:
      'ELECTRE III asks, for every pair, whether there is enough evidence that A is at least as good as B, and whether any criterion strongly objects. Small differences are ignored (indifference threshold q), large ones count fully (preference threshold p), and a very bad score on one criterion can block A from outranking B however good it is elsewhere (veto threshold v). Choose it when a weakness must not be compensated and you accept that some alternatives come out incomparable.',
    whenToUse: [
      'Non-compensation matters: environmental, safety or regulatory limits.',
      'Data are imprecise and the decision maker can state q and p, and optionally v, per criterion.',
      'The audience accepts a partial order with incomparable pairs.',
    ],
    whenNot: [
      'A single score or a strict complete ranking is needed for reporting. Use PROMETHEE II or a compensatory method.',
      'The thresholds cannot be justified.',
      'Many alternatives: repeated distillation can be slow in the browser.',
      'The audience cannot be taught what "incomparable" means.',
    ],
    inputs: [
      'Decision matrix, any real values (only differences are used), criterion directions.',
      'Weights: in ELECTRE they are voting powers, not trade-off coefficients.',
      'Thresholds per criterion in criterion units, 0 <= q <= p <= v; v optional. Each may be constant or a share of the value.',
      'Distillation coefficients, defaults 0.30 and -0.15.',
    ],
    pitfalls: [
      'Distillation is fragile: rounding sigma to 2 decimals before distilling changed the order in the reference case. Compute at full precision, round only for display.',
      'Replacing a non-optimal alternative by a worse one can change the best one (Wang & Triantaphyllou 2008).',
      'Thresholds are in raw units: rescaling a column means rescaling its thresholds.',
      'A "rank" from ELECTRE III is a class in a pre-order, not a score; show incomparable pairs explicitly.',
      'Ranking by net credibility is a popular shortcut but is not Roy\'s method; offer it only with a clear label.',
    ],
  },
  tr: {
    summary:
      "ELECTRE III her çift için A'nın en az B kadar iyi olduğuna dair yeterli kanıt olup olmadığını ve bir kriterin buna ciddi biçimde itiraz edip etmediğini sorar. Küçük farklar yok sayılır (farksızlık eşiği q), büyük farklar tam sayılır (tercih eşiği p); bir kriterde çok kötü bir değer, A başka yerlerde ne kadar iyi olursa olsun A'nın B'ye üstün gelmesini engelleyebilir (veto eşiği v). Bir zayıflık telafi edilmemeliyse ve bazı alternatiflerin kıyaslanamaz çıkmasını kabul ediyorsan seç.",
    whenToUse: [
      'Telafi olmamalı: çevre, güvenlik ya da mevzuat sınırları.',
      'Veri kesin değil ve karar verici her kriter için q ile p, isterse v eşiğini söyleyebiliyor.',
      'Okuyucu kıyaslanamaz çiftler içeren kısmi bir sıralamayı kabul ediyor.',
    ],
    whenNot: [
      'Raporlama için tek bir skor ya da kesin tam sıralama gerekiyor. PROMETHEE II ya da telafi edici bir yöntem kullan.',
      'Eşikler gerekçelendirilemiyor.',
      'Alternatif sayısı çok: tekrarlanan damıtma tarayıcıda yavaşlayabilir.',
      'Okuyucuya "kıyaslanamaz" kavramı anlatılamıyor.',
    ],
    inputs: [
      'Karar matrisi, herhangi gerçek değerler (yalnız farklar kullanılır), kriter yönleri.',
      'Ağırlıklar: ELECTRE\'de ödünleşim katsayısı değil, oy gücüdür.',
      'Her kriter için kriter biriminde eşikler, 0 <= q <= p <= v; v isteğe bağlı. Her biri sabit ya da değerin bir payı olabilir.',
      'Damıtma katsayıları, varsayılan 0,30 ve -0,15.',
    ],
    pitfalls: [
      "Damıtma kırılgandır: referans örnekte sigmayı damıtmadan önce 2 basamağa yuvarlamak sırayı değiştirdi. Tam hassasiyetle hesapla, yalnız gösterirken yuvarla.",
      'En iyi olmayan bir alternatifi daha kötüsüyle değiştirmek en iyiyi değiştirebilir (Wang ve Triantaphyllou 2008).',
      'Eşikler ham birimdedir: bir sütunu yeniden ölçeklemek eşiklerini de ölçeklemeyi gerektirir.',
      "ELECTRE III'ün verdiği \"sıra\" bir skor değil, ön sıralamadaki bir sınıftır; kıyaslanamaz çiftleri açıkça göster.",
      "Net güvenilirliğe göre sıralamak yaygın bir kestirmedir ama Roy'un yöntemi değildir; yalnız açık bir etiketle sun.",
    ],
  },
}
