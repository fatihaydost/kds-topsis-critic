import type { MethodContent } from '../types'

// Source: docs/research/methods/electre-i.md
export const electreI: MethodContent = {
  id: 'electre-i',
  name: { en: 'ELECTRE I', tr: 'ELECTRE I' },
  fullName: { en: 'ELimination Et Choix Traduisant la REalité I', tr: 'Gerçeği yansıtan eleme ve seçim I' },
  family: 'ranking-outranking',
  status: 'research',
  year: 1968,
  origin: {
    authors: 'Roy, B.',
    year: 1968,
    title: 'Classement et choix en présence de points de vue multiples (la méthode ELECTRE)',
    venue: 'Revue française d\'informatique et de recherche opérationnelle 2(8), 57-75',
    doi: '10.1051/ro/196802V100571',
    note: {
      en: 'Earlier SEMA report: Benayoun, Roy & Sussmann (1966). The normalized textbook variant common in Turkish papers follows Hwang & Yoon (1981) and Yoon & Hwang (1995).',
      tr: 'Daha önceki SEMA raporu: Benayoun, Roy ve Sussmann (1966). Türkçe makalelerde yaygın olan normalize ders kitabı varyantı Hwang ve Yoon (1981) ile Yoon ve Hwang (1995) kaynaklarını izler.',
    },
  },
  steps: [
    {
      title: { en: 'Orient all criteria', tr: 'Tüm kriterleri aynı yöne çevir' },
      tex: String.raw`g_j(a) = \begin{cases} x_{aj} & j \in J^{+} \\ -x_{aj} & j \in J^{-} \end{cases}`,
    },
    {
      title: { en: 'Concordance', tr: 'Uyum' },
      tex: String.raw`C(a,b) = \frac{\sum_{j:\, g_j(a) \ge g_j(b)} w_j}{\sum_{j} w_j}`,
      note: {
        en: 'The weighted share of criteria on which a is at least as good as b. Ties count as concordant.',
        tr: "a'nın en az b kadar iyi olduğu kriterlerin ağırlıklı payı. Eşitlikler uyumlu sayılır.",
      },
    },
    {
      title: { en: 'Discordance', tr: 'Uyumsuzluk' },
      tex: String.raw`D(a,b) = \frac{\max\left(0,\ \max_j \left[g_j(b) - g_j(a)\right]\right)}{\delta}, \qquad \delta = \max_j \left(\max_i g_{ij} - \min_i g_{ij}\right)`,
      note: {
        en: 'Roy variant: delta is the largest range on the common scale. Dividing each difference by its own criterion range is an option that removes the common-scale requirement.',
        tr: 'Roy varyantı: delta ortak ölçekteki en geniş aralıktır. Her farkı kendi kriterinin aralığına bölmek, ortak ölçek şartını kaldıran bir seçenektir.',
      },
    },
    {
      title: { en: 'Outranking relation', tr: 'Üstünlük ilişkisi' },
      tex: String.raw`a \mathrel{S} b \iff C(a,b) \ge \hat c \ \wedge\ D(a,b) \le \hat d, \qquad a \ne b`,
    },
    {
      title: { en: 'Kernel', tr: 'Çekirdek' },
      tex: String.raw`K \subseteq A: \quad \nexists\, a, b \in K:\ a \mathrel{S} b, \qquad \forall\, b \notin K\ \exists\, a \in K:\ a \mathrel{S} b`,
      note: {
        en: 'First merge every cycle of S into one class, then repeatedly take the classes with no incoming arc and delete what they outrank. No member outranks another; every non-member is outranked by some member.',
        tr: "Önce S içindeki her döngü tek bir sınıfa birleştirilir; sonra gelen oku olmayan sınıflar alınır ve üstün geldikleri silinir, bu tekrarlanır. Hiçbir üye diğerine üstün değildir; üye olmayan her alternatife bir üye üstün gelir.",
      },
    },
  ],
  combinedWith: [
    {
      methodId: 'ahp',
      text: {
        en: 'AHP then ELECTRE (Hwang-Yoon variant): Soner & Önüt (2006), supplier selection. ANP then ELECTRE also appears in Turkish supplier-selection work.',
        tr: 'AHP ardından ELECTRE (Hwang-Yoon varyantı): Soner ve Önüt (2006), tedarikçi seçimi. Türkçe tedarikçi seçimi çalışmalarında ANP ardından ELECTRE de görülür.',
      },
    },
    {
      methodId: 'entropy',
      text: {
        en: 'Entropy or CRITIC then ELECTRE for the financial performance of Turkish banks and firms (for example Çağıl 2011).',
        tr: 'Türk banka ve şirketlerinin finansal performansı için Entropi ya da CRITIC ardından ELECTRE (örneğin Çağıl 2011).',
      },
    },
    {
      text: {
        en: 'Chains such as SMART then ELECTRE then TOPSIS (Sayed 2016) re-rank a kernel with a compensatory method without a stated reason; the site discourages them.',
        tr: 'SMART ardından ELECTRE ardından TOPSIS gibi zincirler (Sayed 2016) çekirdeği gerekçe göstermeden telafi edici bir yöntemle yeniden sıralar; site bunları önermez.',
      },
    },
  ],
  reference: {
    source: 'Wang, X.; Triantaphyllou, E. (2008). Ranking irregularities when evaluating alternatives by using some ELECTRE methods. Omega 36(1), 45-63',
    doi: '10.1016/j.omega.2005.12.003',
    table: 'Section 3.1, pp. 48-49 (concordance and discordance matrices)',
    match: 'match',
    note: {
      en: 'Galway wastewater plant, 5 alternatives, 7 criteria. Concordance and discordance matrices match exactly. The paper goes on to ELECTRE II, so no kernel is published; ours is {A2 = A3 (a cycle), A5}. A second check on the Turkish Hwang-Yoon variant (Soner & Önüt 2006) matches only partly because of two apparent typos in its discordance table.',
      tr: 'Galway atık su tesisi, 5 alternatif, 7 kriter. Uyum ve uyumsuzluk matrisleri birebir örtüşüyor. Makale ELECTRE II ile devam ettiği için çekirdek yayımlanmamış; bizim çekirdeğimiz {A2 = A3 (döngü), A5}. Türkçe Hwang-Yoon varyantı üzerindeki ikinci kontrol (Soner ve Önüt 2006) uyumsuzluk tablosundaki iki olası baskı hatası yüzünden kısmen örtüşüyor.',
    },
  },
  sources: [
    { label: 'Roy (1968), RIRO 2(8), 57-75', doi: '10.1051/ro/196802V100571' },
    { label: 'Hwang & Yoon (1981), Multiple Attribute Decision Making, Springer', doi: '10.1007/978-3-642-48318-9' },
    { label: 'Yoon & Hwang (1995), Sage', doi: '10.4135/9781412985161' },
    { label: 'Figueira, Mousseau & Roy (2005), ELECTRE methods', doi: '10.1007/0-387-23081-5_4' },
    { label: 'Wang & Triantaphyllou (2008), Omega 36(1), 45-63', doi: '10.1016/j.omega.2005.12.003' },
    { label: 'Soner & Önüt (2006), Çok kriterli tedarikçi seçimi: bir ELECTRE-AHP uygulaması, Sigma 24(4), 110-120' },
    { label: 'Govindan & Jepsen (2016), EJOR 250(1), 1-29', doi: '10.1016/j.ejor.2015.07.019' },
  ],
  en: {
    summary:
      'ELECTRE I keeps an alternative in the running unless another one beats it on enough of the weighted criteria and is never much worse on any single criterion. The result is a short list (the kernel) of alternatives that nobody convincingly beats, not a full ranking. Use it to screen a long list down to a few candidates.',
    whenToUse: [
      'The task is choice or screening, not ranking.',
      'You want a transparent majority rule with a veto.',
      'Teaching outranking before ELECTRE III or PROMETHEE.',
    ],
    whenNot: [
      'A complete ranking is required. The Turkish "net concordance and net discordance" add-on gives one, but that is a different variant.',
      'Criteria are on different scales and the Roy variant is used without a common scale: its discordance compares raw differences across criteria.',
      'You cannot justify the thresholds c and d.',
    ],
    inputs: [
      'Decision matrix, criterion directions, positive weights.',
      'Roy variant: concordance threshold c between 0.5 and 1 (default 0.75) and discordance threshold d between 0 and 1 (default 0.50). Criteria must share one scale.',
      'Hwang-Yoon variant: thresholds are the means of C and D; needs a normalization.',
    ],
    pitfalls: [
      'With mixed units the criterion with the largest unit dominates D. Check the scale or use per-criterion ranges.',
      'S can contain cycles; the kernel exists only after merging them. pyDecision returns a kernel that violates internal stability in one of our tests.',
      'The kernel changes with c and d; show it on a small grid of thresholds.',
      'In the Hwang-Yoon variant the thresholds are averages over the current set, so adding or removing an alternative can change the dominance among the others.',
      'A constant column is concordant for every pair and inflates C.',
    ],
  },
  tr: {
    summary:
      'ELECTRE I bir alternatifi, ancak başka bir alternatif onu ağırlıklı kriterlerin yeterince çoğunda geçiyor ve hiçbir kriterde ondan çok kötü kalmıyorsa eler. Sonuç tam bir sıralama değil, kimsenin ikna edici biçimde geçemediği kısa bir listedir (çekirdek). Uzun bir listeyi birkaç adaya indirmek için kullan.',
    whenToUse: [
      'İş sıralama değil, seçim ya da eleme.',
      'Veto hakkı olan şeffaf bir çoğunluk kuralı istiyorsun.',
      'ELECTRE III ya da PROMETHEE öncesinde üstünlük mantığını öğretmek.',
    ],
    whenNot: [
      'Tam sıralama gerekiyor. Türkçe literatürdeki "net uyum ve net uyumsuzluk" eki bir sıralama verir, ama o ayrı bir varyanttır.',
      'Kriterler farklı ölçeklerde ve Roy varyantı ortak ölçek olmadan kullanılıyor: uyumsuzluk kriterler arasında ham farkları karşılaştırır.',
      'c ve d eşiklerini gerekçelendiremiyorsun.',
    ],
    inputs: [
      'Karar matrisi, kriter yönleri, pozitif ağırlıklar.',
      "Roy varyantı: 0,5 ile 1 arasında uyum eşiği c (varsayılan 0,75) ve 0 ile 1 arasında uyumsuzluk eşiği d (varsayılan 0,50). Kriterler tek bir ölçeği paylaşmalı.",
      'Hwang-Yoon varyantı: eşikler C ve D ortalamalarıdır; normalizasyon gerekir.',
    ],
    pitfalls: [
      "Karışık birimlerde en büyük birimli kriter D'ye hükmeder. Ölçeği denetle ya da kriter başına aralık kullan.",
      "S döngü içerebilir; çekirdek ancak döngüler birleştirildikten sonra tanımlıdır. pyDecision testlerimizden birinde iç kararlılığı bozan bir çekirdek döndürüyor.",
      'Çekirdek c ve d ile değişir; küçük bir eşik ızgarasında göster.',
      'Hwang-Yoon varyantında eşikler mevcut kümenin ortalamasıdır; alternatif eklemek ya da çıkarmak diğerleri arasındaki baskınlığı değiştirebilir.',
      "Sabit bir sütun her çift için uyumludur ve C'yi şişirir.",
    ],
  },
}
