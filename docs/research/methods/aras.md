# Additive Ratio ASsessment (ARAS)

- **Family:** ranking (compensatory / utility — additive, ratio to an optimal alternative)
- **Origin:** Zavadskas, E.K.; Turskis, Z. (2010). A new additive ratio assessment (ARAS) method in multicriteria decision-making. *Technological and Economic Development of Economy* 16(2):159–172. doi:10.3846/tede.2010.10 (DOI printed in the PDF; open access).
- **Popularity:** Crossref cited-by count 857 (checked 2026-09-29).

## For users (site copy)
- **EN:** ARAS adds an "optimal" alternative (the best value on each criterion, or a target you define), scores every alternative with a weighted sum of sum-normalized values, and reports each alternative as a percentage of the optimum (utility degree K). Choose it when "how close to the target are we, in %?" is the question.
- **TR:** ARAS tabloya "optimal" bir alternatif ekler (her kriterdeki en iyi değer ya da sizin belirlediğiniz hedef), her alternatifi toplam-normalize edilmiş değerlerin ağırlıklı toplamıyla puanlar ve sonucu optimumun yüzdesi olarak verir (fayda derecesi K). "Hedefe yüzde kaç yakınız?" sorusu için uygundur.

## When to use / when not
- Use: when a meaningful target/optimal value exists per criterion (norms, specifications), and a % of optimum is useful.
- Avoid / warn: cost criteria use 1/x, so zeros are impossible and the transformation is non-linear; results depend on the chosen optimal row.

## Inputs
- Decision matrix `X` (m × n), strictly positive for cost criteria; types `benefit|cost`; weights `w` (sum to 1).
- Optional **optimal alternative** $x_{0j}$ per criterion. Default (when not given): $x_{0j} = \max_i x_{ij}$ (benefit) / $\min_i x_{ij}$ (cost). The origin example uses **given** optimal values (norms), not the column best.

## Algorithm
1. Extended matrix with row 0 = optimal alternative.
2. Cost criteria: $x^*_{ij} = 1/x_{ij}$ (including row 0).
3. Sum normalization over the extended column (rows 0..m): $\bar x_{ij} = x_{ij} / \sum_{i=0}^{m} x_{ij}$.
4. $\hat x_{ij} = w_j \bar x_{ij}$; $S_i = \sum_j \hat x_{ij}$.
5. Utility degree $K_i = S_i / S_0$; rank by decreasing $K_i$.

Variants: fuzzy/grey ARAS. **We implement the crisp 2010 version with an optional user optimal row**; default = column best (pyDecision convention).

## Commonly combined with
- Expert pairwise-comparison weights (origin paper, 38 experts).
- ARAS with AHP / SWARA weights is common in later Lithuanian-school papers — not verified individually here.
- Same microclimate data reused in CODAS 2016 (Example 2).

## Pitfalls
- Cost value 0 → 1/0; negative values meaningless.
- If the optimal row is worse than an alternative on some criterion, K can exceed 1.
- Rank reversal when alternatives are added (sum normalization).
- The default "optimal = column best" differs from the origin example; K values differ a lot (room 9: 0.7734 with norms, 0.9455 with column best) although here the ranking is the same.

## Reference example (test fixture)
- **Source:** Zavadskas & Turskis (2010), doi:10.3846/tede.2010.10. **Table 1** (14 office rooms × 6 criteria, weights, optimal row 0), **Table 2** (normalized), **Table 3** (weighted, S, K, rank).
- **Typo in the paper (verified):** Table 2 row 8, criterion x4 is printed 0.0825 (the value of room 1, 390 lx); room 8 has 400 lx = the optimal value, so it should be **0.0846** (same as row 0). The error propagates to Table 3 (S8 = 0.0771, K8 = 0.7727) and **flips the top two**: the paper ranks room 9 first, the correct computation ranks room 8 first (K8 = 0.7762 > K9 = 0.7734). Recomputing with the typo value reproduces Table 3 exactly (max abs diff 0.0003). CODAS 2016 (same data, Example 2) also has A8 best.

```json
{
  "id": "aras-2010-microclimate",
  "criteria": ["air per head m3/h", "relative humidity %", "air temperature C", "illumination lx", "air flow rate m/s", "dew point C"],
  "types": ["benefit", "benefit", "benefit", "benefit", "cost", "cost"],
  "weights": [0.21, 0.16, 0.26, 0.17, 0.12, 0.08],
  "optimal": [15, 50, 24.5, 400, 0.05, 5],
  "matrix": [
    [7.6, 46, 18, 390, 0.1, 11], [5.5, 32, 21, 360, 0.05, 11], [5.3, 32, 21, 290, 0.05, 11],
    [5.7, 37, 19, 270, 0.05, 9], [4.2, 38, 19, 240, 0.1, 8], [4.4, 38, 19, 260, 0.1, 8],
    [3.9, 42, 16, 270, 0.1, 5], [7.9, 44, 20, 400, 0.05, 6], [8.1, 44, 20, 380, 0.05, 6],
    [4.5, 46, 18, 320, 0.1, 7], [5.7, 48, 20, 320, 0.05, 11], [5.2, 48, 20, 310, 0.05, 11],
    [7.1, 49, 19, 280, 0.1, 12], [6.9, 50, 16, 250, 0.05, 10]
  ],
  "expected_published": {
    "S0": 0.0997,
    "S": [0.0669, 0.0655, 0.0625, 0.0630, 0.0545, 0.0556, 0.0564, 0.0771, 0.0771, 0.0599, 0.0675, 0.0661, 0.0632, 0.0649],
    "K": [0.6707, 0.6564, 0.6269, 0.6315, 0.5464, 0.5580, 0.5659, 0.7727, 0.7734, 0.6004, 0.6773, 0.6628, 0.6334, 0.6511],
    "ranking": [4, 6, 10, 9, 14, 13, 12, 2, 1, 11, 3, 5, 8, 7]
  },
  "expected_corrected": {
    "S0": 0.0997,
    "S": [0.0669, 0.0654, 0.0625, 0.0630, 0.0545, 0.0556, 0.0564, 0.0774, 0.0771, 0.0599, 0.0675, 0.0661, 0.0631, 0.0649],
    "K": [0.6706, 0.6564, 0.6269, 0.6315, 0.5464, 0.5580, 0.5658, 0.7762, 0.7734, 0.6003, 0.6772, 0.6628, 0.6334, 0.6511],
    "ranking": [4, 6, 10, 9, 14, 13, 12, 1, 2, 11, 3, 5, 8, 7],
    "tolerance": 0.0005
  }
}
```

- **Published outputs:** Table 3 as in `expected_published`; order 9 ≻ 8 ≻ 11 ≻ 1 ≻ 12 ≻ 2 ≻ 14 ≻ 13 ≻ 4 ≻ 3 ≻ 10 ≻ 7 ≻ 6 ≻ 5.
- **Recomputed (numpy):** Table 2 row 0 = 0.1546, 0.0776, 0.0843, 0.0846, 0.0833, 0.1067 (MATCH). S: **MATCH** (max abs diff 0.0003). K: **MISMATCH** — max abs diff 0.0035, only room 8 (0.7762 vs 0.7727), explained by the Table 2 typo above; all other K within 0.0001. Use `expected_corrected` as the test fixture.
- **pyDecision 5.1.1 `aras_method`:** **MISMATCH vs paper** (max abs diff 0.176) because pyDecision uses the column best as the optimal row and ignores user norms; it equals our implementation with `optimal = column best` exactly (diff 0; K = 0.8210, 0.8002, 0.7645, 0.7706, 0.6656, 0.6799, 0.6879, 0.9485, 0.9455, 0.7307, 0.8255, 0.8072, 0.7756, 0.7960; same ranking as `expected_corrected`).

## Implementation notes
- pyDecision: `aras_method(dataset, weights, criterion_type, graph, verbose)` → K for alternatives only (row 0 not returned); no optimal-row argument.
- Our API: `optimal?: number[]` (default column best). Validate cost values > 0. Return S0, S, K (show K as %).

## Sources
- Zavadskas & Turskis 2010, TEDE 16(2):159–172, doi:10.3846/tede.2010.10, PDF: https://journals.vilniustech.lt/index.php/TEDE/article/download/5850/5093 (Tables 1–3).
- Keshavarz Ghorabaee et al. 2016 (CODAS), Example 2 — same data.
- pyDecision 5.1.1, `pyDecision/algorithm/aras.py`.
- Recompute script: `scratchpad/mcdm/siralama/scripts/edas_aras_waspas.py`.
