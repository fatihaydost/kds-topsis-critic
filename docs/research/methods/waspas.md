# Weighted Aggregated Sum Product ASsessment (WASPAS)

- **Family:** ranking (compensatory / utility — convex combination of WSM and WPM)
- **Origin:** Zavadskas, E.K.; Turskis, Z.; Antucheviciene, J.; Zakarevicius, A. (2012). Optimization of Weighted Aggregated Sum Product Assessment. *Elektronika ir Elektrotechnika* 122(6):3–6. doi:10.5755/j01.eee.122.6.1810 (DOI printed in the PDF; open access).
- **Popularity:** Crossref cited-by count 932 (checked 2026-09-29). Frequently used as a comparison method (CODAS 2016, CoCoSo 2019).

## For users (site copy)
- **EN:** WASPAS blends two classic scores: the weighted sum (good when trade-offs are linear) and the weighted product (which punishes very weak values more). The λ slider sets the mix: λ = 1 is pure weighted sum, λ = 0 pure weighted product, 0.5 an even blend.
- **TR:** WASPAS iki klasik skoru harmanlar: ağırlıklı toplam (ödünleşimler doğrusal ise iyi) ve ağırlıklı çarpım (çok zayıf değerleri daha sert cezalandırır). λ ayarı karışımı belirler: λ = 1 saf ağırlıklı toplam, λ = 0 saf ağırlıklı çarpım, 0,5 eşit karışım.

## When to use / when not
- Use: positive ratio-scale data, want robustness between additive and multiplicative aggregation; a simple sensitivity analysis over λ.
- Avoid / warn: zeros make the product term 0 for that alternative (WPM = 0 regardless of other criteria); λ changes rankings (origin Fig. 1).

## Inputs
- Decision matrix `X` (m × n), strictly positive recommended; types `benefit|cost`; weights `w` (sum to 1).
- Parameter **λ ∈ [0, 1]**, default **0.5** (Eq. 5 of the origin is the λ = 0.5 case; Eq. 6 general). Optional "optimal λ" per alternative (Eq. 19) — not in v1.

## Algorithm
1. Linear normalization: benefit $\bar x_{ij} = x_{ij}/\max_i x_{ij}$; cost $\bar x_{ij} = \min_i x_{ij}/x_{ij}$.
2. $Q_i^{(1)} = \sum_j w_j \bar x_{ij}$ (WSM); $Q_i^{(2)} = \prod_j \bar x_{ij}^{\,w_j}$ (WPM).
3. $Q_i = \lambda Q_i^{(1)} + (1-\lambda) Q_i^{(2)}$; rank by decreasing $Q_i$.
4. (Optional, origin §"Optimization") $\lambda_i^{opt} = \dfrac{\sigma^2(Q_i^{(2)})}{\sigma^2(Q_i^{(1)}) + \sigma^2(Q_i^{(2)})}$ with $\sigma^2(\bar x_{ij}) = (0.05\,\bar x_{ij})^2$.

Variants: pyDecision uses **1 + min–max** normalization instead of linear max normalization (not the origin). **We implement the origin (linear max) normalization.**

## Commonly combined with
- Entropy weights (the origin example's weights "were determined by means of entropy", citing Saparauskas et al. 2011).
- Chakraborty & Zavadskas (2014), *Applications of WASPAS method in manufacturing decision making*, Informatica 25(1):1–20 (cited in EDAS/CODAS papers; DOI not checked) — the industrial-robot data reused in CODAS/CoCoSo comes from there.

## Pitfalls
- Zero in any benefit value → product term 0; zero in cost value → division by zero. Require positive data or document the behaviour.
- λ sensitivity: report rankings for λ ∈ {0, 0.5, 1} at least.
- Rank reversal on adding alternatives (max/min normalization).
- Very small weights make $\bar x^{w}$ close to 1 → WPM loses discrimination.

## Reference example (test fixture)
- **Source:** Zavadskas et al. (2012), doi:10.5755/j01.eee.122.6.1810. **Table 1** (already-normalized 4 × 12 matrix and entropy weights), **Table 2** (Q for λ = 0, 0.1, …, 1), **Table 4** (Q at "optimal" λ).
- **Typo in Table 1 (found by recomputation):** alternative a1, criterion x̄5 is printed **1.0000**; every value of Table 2 for a1 (and Table 4) is reproduced only with **0.1000** (e.g. λ = 1: 0.6120 vs 0.6683 with 1.0000; λ = 0: 0.4912 vs 0.5672). Rows a2–a4 match as printed. The fixture uses 0.1000.
- The matrix is already normalized and every column has max 1.0000, so treating all criteria as `benefit` with max-normalization leaves it unchanged. Weights sum to 1.0001 (rounding in the paper; use as printed).

```json
{
  "id": "waspas-2012-table1",
  "types": ["benefit", "benefit", "benefit", "benefit", "benefit", "benefit", "benefit", "benefit", "benefit", "benefit", "benefit", "benefit"],
  "weights": [0.0627, 0.0508, 0.1114, 0.0874, 0.0625, 0.1183, 0.0784, 0.0984, 0.0530, 0.1417, 0.0798, 0.0557],
  "matrix": [
    [0.8486, 0.6364, 0.7982, 0.6707, 0.1000, 0.8534, 0.6622, 0.8618, 0.1432, 0.1585, 1.0000, 0.4531],
    [1.0000, 1.0000, 1.0000, 0.7976, 0.7000, 0.9005, 0.9324, 0.6788, 1.0000, 0.6500, 0.7270, 0.7346],
    [0.6542, 0.7000, 0.9169, 0.8951, 0.6000, 0.9791, 0.6216, 0.9479, 0.1340, 0.1585, 0.9795, 0.6728],
    [0.3694, 0.4375, 0.9407, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 0.5478, 1.0000, 0.3754, 1.0000]
  ],
  "matrix_note": "a1 x5 printed as 1.0000 in the paper; 0.1000 reproduces Tables 2 and 4",
  "expected": {
    "lambda_grid": [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    "Q": [
      [0.4912, 0.5033, 0.5154, 0.5274, 0.5395, 0.5516, 0.5637, 0.5758, 0.5878, 0.5999, 0.6120],
      [0.8173, 0.8185, 0.8197, 0.8209, 0.8221, 0.8233, 0.8244, 0.8256, 0.8268, 0.8280, 0.8292],
      [0.5873, 0.5983, 0.6093, 0.6203, 0.6313, 0.6423, 0.6532, 0.6642, 0.6752, 0.6862, 0.6972],
      [0.8015, 0.8066, 0.8116, 0.8167, 0.8217, 0.8268, 0.8318, 0.8369, 0.8419, 0.8470, 0.8520]
    ],
    "ranking_lambda_0.5": [4, 2, 3, 1],
    "table4": { "lambda_opt": [0.32, 0.49, 0.37, 0.43], "Q": [0.5303, 0.8232, 0.6284, 0.8233] },
    "tolerance": 0.0005
  }
}
```

- **Published outputs:** Table 2 as above (e.g. λ = 0.5: 0.5516, 0.8233, 0.6423, 0.8268 → a4 ≻ a2 ≻ a3 ≻ a1); Table 4 ranking a4 = a2 ≻ a3 ≻ a1.
- **Recomputed (numpy):** with a1-x̄5 = 0.1000: WSM = 0.6121, 0.8288, 0.6975, 0.8516; WPM = 0.4912, 0.8173, 0.5872, 0.8015; λ = 0.5: 0.5516, 0.8231, 0.6424, 0.8265. All 44 Table 2 values **MATCH** (max abs diff 0.00044); Table 4 at the printed λ_opt **MATCH** (0.00045). With the matrix as printed: **MISMATCH** (max abs diff 0.076, row a1 only).
- **pyDecision 5.1.1 `waspas_method`:** **MISMATCH** (λ = 0.5: 1.2487, 1.5686, 1.4368, 1.7189) — it normalizes with $1 + (x - \min)/(\max - \min)$, a different variant; not usable as a reference for the origin.

## Implementation notes
- pyDecision: `waspas_method(dataset, criterion_type, weights, lambda_value, graph)` → `(wsm, wpm, waspas)`; normalization differs (see above).
- Return WSM, WPM and Q; the site can show a λ slider using WSM/WPM without recomputing normalization.
- λ = 1 gives SAW/WSM with linear max normalization — reuse the SAW fixture as a cross-check.

## Sources
- Zavadskas et al. 2012, Elektronika ir Elektrotechnika 122(6):3–6, doi:10.5755/j01.eee.122.6.1810, PDF: https://eejournal.ktu.lt/index.php/elt/article/download/1810/1468 (Eqs. 1–6, 19; Tables 1, 2, 4).
- pyDecision 5.1.1, `pyDecision/algorithm/waspas.py`.
- Recompute script: `scratchpad/mcdm/siralama/scripts/edas_aras_waspas.py`.
