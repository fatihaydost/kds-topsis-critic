# COmplex PRoportional ASsessment (COPRAS)

- **Family:** ranking (compensatory / utility — additive with separate treatment of benefit and cost sums)
- **Origin:** Commonly cited as Zavadskas, E.K.; Kaklauskas, A.; Šarka, V. (1994). The new method of multicriteria complex proportional assessment of projects. *Technological and Economic Development of Economy* 1(3):131–139 (bibliographic details not verified against a primary page); Podvezko (2011) attributes the method to Zavadskas & Kaklauskas (1996). **Neither opened, no DOI found.** Formulas below follow Podvezko (2011), doi:10.5755/j01.ee.22.2.310, Eqs. (8)–(11), which restates the original.
- **Popularity:** Podvezko (2011) calls COPRAS "most commonly used in Lithuania" alongside SAW and TOPSIS; Crossref cited-by count of Podvezko (2011) = 249 (checked 2026-09-29). No origin-paper count available.

## For users (site copy)
- **EN:** COPRAS adds up the weighted shares of the "more is better" criteria and, separately, of the "less is better" criteria, then rewards alternatives with a small cost sum. The result is a utility score in % of the best alternative. Good when you want benefits and costs handled explicitly rather than by flipping cost values.
- **TR:** COPRAS "çok olsun" kriterlerinin ağırlıklı paylarını ve ayrıca "az olsun" kriterlerinin paylarını toplar; maliyet toplamı küçük olan alternatifi ödüllendirir. Sonuç, en iyi alternatifin yüzdesi olarak bir fayda skorudur. Fayda ve maliyetin, maliyet değerleri ters çevrilmeden açıkça ayrı ele alınmasını istediğinizde uygundur.

## When to use / when not
- Use: mixed benefit/cost criteria, positive data, users comfortable with proportional (sum) normalization.
- Avoid / warn: COPRAS can be unstable under small data changes when cost criteria dominate (Podvezko 2011, Tables 7–8: a small change in one cost value reverses the ranking 1-3-2 → 3-2-1). With only benefit criteria it reduces exactly to SAW with sum normalization.

## Inputs
- Decision matrix `X` (m × n), strictly positive; types `benefit|cost`; weights `w` (sum to 1). No parameters.

## Algorithm
1. Sum normalization and weighting: $d_{ij} = w_j x_{ij} / \sum_{i} x_{ij}$.
2. $S_{+i} = \sum_{j \in B} d_{ij}$, $S_{-i} = \sum_{j \in C} d_{ij}$.
3. Relative significance: $Q_i = S_{+i} + \dfrac{S_{-\min} \sum_i S_{-i}}{S_{-i} \sum_i (S_{-\min} / S_{-i})}$ (equivalently $S_{+i} + \dfrac{\sum_i S_{-i}}{S_{-i}\sum_i (1/S_{-i})}$).
4. Utility degree $N_i = Q_i / Q_{\max} \times 100\%$; rank by decreasing Q.
5. If there are no cost criteria, $Q_i = S_{+i}$.

Variants: COPRAS-G (grey), fuzzy COPRAS. **We implement the crisp version** (same formula as pyDecision `copras_method`).

## Commonly combined with
- AHP / expert weights in the Vilnius school (see the many COPRAS applications listed by Podvezko 2011).
- Used as a comparison method in EDAS (2015), CODAS (2016), MABAC (2015) and CoCoSo (2019) papers.

## Pitfalls
- Zero or negative values: sum normalization and $1/S_{-i}$ fail; require positive data.
- $S_{-i} = 0$ for an alternative (all its cost entries 0) → division by zero.
- Instability / rank reversal for small cost changes (Podvezko 2011) and when alternatives are added (sum normalization).
- Property useful for tests: $\sum_i Q_i = \sum_j w_j$ (= 1) (Podvezko 2011, Eq. 20).

## Reference example (test fixture)
- **Source:** Podvezko, V. (2011). The Comparative Analysis of MCDA Methods SAW and COPRAS. *Inžinerinė ekonomika – Engineering Economics* 22(2):134–146. doi:10.5755/j01.ee.22.2.310 (DOI printed in the PDF; open access). **Table 7** (3 alternatives × 4 criteria, two variants), **Table 8** (S+, S−, Z = Q, ranks).
- **Typos in the paper (found by recomputation):** (i) For Variant I, the printed S− (0.147, 0.199, 0.165) and the TOPSIS values in Table 8 are reproduced only if A2-R4 = **220**, not the printed 215. (ii) The Z row of Variant I (0.332, 0.334, 0.335) is identical to Variant II's and is inconsistent with its own rank row (1, 3, 2). We therefore use **Variant II** as the fixture.

```json
{
  "id": "copras-podvezko-2011-variant2",
  "types": ["benefit", "benefit", "cost", "cost"],
  "weights": [0.26, 0.23, 0.24, 0.27],
  "matrix": [[42, 19, 13, 110], [71, 18, 11, 200], [53, 20, 12, 149]],
  "expected": {
    "S_plus": [0.142, 0.184, 0.164],
    "S_minus": [0.151, 0.191, 0.168],
    "Q": [0.332, 0.334, 0.335],
    "ranking": [3, 2, 1],
    "tolerance": 0.0005
  }
}
```

- **Published outputs (Variant II):** S+ = 0.142, 0.184, 0.164; S− = 0.151, 0.191, 0.168; Z = 0.332, 0.334, 0.335; ranks 3, 2, 1.
- **Recomputed (numpy):** S+ = 0.1424, 0.1838, 0.1637; S− = 0.1514, 0.1910, 0.1676; Q = 0.3317, 0.3338, 0.3345; N = 99.13 %, 99.78 %, 100 %; ranks 3, 2, 1. **MATCH** (max abs diff 0.00045). Variant I as printed: S+ MATCH, S− MISMATCH (0.0019), Z MISMATCH (0.0056) — explained above; with A2-R4 = 220, S− matches (0.0005) and our Q = 0.3367, 0.3271, 0.3363 gives the printed ranks 1, 3, 2.
- **Secondary (ranks, 7 weight sets):** Keshavarz Ghorabaee et al. (2015), doi:10.15388/Informatica.2015.57, Tables 5–7 (JSON in `edas.md`): our COPRAS ranks equal the published COPRAS ranks in **7/7 sets (MATCH)**.
- **pyDecision 5.1.1 `copras_method`:** returns $Q/Q_{\max}$ (not ×100); equal to ours (diff 0) → **MATCH** after scaling.

## Implementation notes
- pyDecision: `copras_method(dataset, weights, criterion_type, graph, verbose)` → `u_i = q_i / max(q_i)`.
- Return S+, S−, Q and N (%); validate positivity.
- Add the invariant $\sum Q_i = \sum w_j$ as a property test.

## Sources
- Podvezko 2011, Engineering Economics 22(2):134–146, doi:10.5755/j01.ee.22.2.310, PDF: https://inzeko.ktu.lt/index.php/EE/article/download/310/19875 (Eqs. 8–14, Tables 7–9).
- Keshavarz Ghorabaee et al. 2015, Informatica 26(3):435–451, doi:10.15388/Informatica.2015.57 (Tables 5–7).
- pyDecision 5.1.1, `pyDecision/algorithm/copras.py`.
- Recompute script: `scratchpad/mcdm/siralama/scripts/saw_copras.py`.
