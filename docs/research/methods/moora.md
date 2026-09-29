# Multi-Objective Optimization on the basis of Ratio Analysis (MOORA) — ratio system

- **Family:** ranking (compensatory / ratio — vector-normalized additive)
- **Origin:** Brauers, W.K.M.; Zavadskas, E.K. (2006). The MOORA method and its application to privatization in a transition economy. *Control and Cybernetics* 35(2):445–469 (EuDML: https://eudml.org/doc/209425; **no DOI**; not opened). Ratio system first in Brauers (2004, book). Reference example from the method authors' open-access paper Brauers & Zavadskas (2010), doi:10.3846/tede.2010.01.
- **Popularity:** Crossref cited-by: 575 for Brauers & Zavadskas 2010 (MULTIMOORA), 156 for Brauers et al. 2008 (contractors) (checked 2026-09-29); the 2006 origin has no DOI (Exa's index lists ~976 citations).

## For users (site copy)
- **EN:** MOORA divides each value by the "length" of its criterion column, then adds up the benefit ratios and subtracts the cost ratios. The alternative with the highest net ratio wins. It is quick, needs no reference point, and optional weights (importance coefficients) can be applied.
- **TR:** MOORA her değeri kendi kriter sütununun "uzunluğuna" böler, sonra fayda oranlarını toplayıp maliyet oranlarını çıkarır. Net oranı en yüksek olan alternatif kazanır. Hızlıdır, referans nokta gerektirmez; istenirse önem katsayıları (ağırlıklar) uygulanabilir.

## When to use / when not
- Use: many objectives, quick screening, want the same normalization as TOPSIS but an additive score.
- Avoid / warn: the net score can be negative (costs dominate) — fine for ranking, confusing for users; vector normalization is not invariant to affine unit changes (same caveat as TOPSIS).

## Inputs
- Decision matrix `X` (m × n); types `benefit|cost`; optional weights (importance coefficients) `w` — the origin uses **no weights** (w = 1) and prefers splitting an important objective into sub-objectives.
- No parameters.

## Algorithm (ratio system)
1. $x^*_{ij} = x_{ij} / \sqrt{\sum_{i=1}^{m} x_{ij}^2}$.
2. $y^*_i = \sum_{j \in B} w_j x^*_{ij} - \sum_{j \in C} w_j x^*_{ij}$ (w = 1 by default).
3. Rank by decreasing $y^*_i$.

**Reference point part (second half of MOORA):** $r_j = \max_i x^*_{ij}$ (benefit) / $\min_i x^*_{ij}$ (cost); score $\max_j |r_j - x^*_{ij}|$ (Tchebycheff), rank ascending.

**MULTIMOORA (short note):** MOORA ratio system + reference point + **full multiplicative form** $U_i = \prod_{j\in B} x_{ij} / \prod_{j\in C} x_{ij}$ (on raw data, no normalization, no weights); the three rankings are merged into one final ranking (Brauers & Zavadskas 2010, Table 1, done by inspection; later MULTIMOORA papers formalize this as "dominance theory" — not opened here). pyDecision `multimoora_method` returns the three scores but **not** the dominance aggregation. Out of scope for v1; the fixture below includes all three parts so it can be added later.

## Commonly combined with
- Sub-objectives instead of weights (Brauers et al. 2008; Brauers & Zavadskas 2010).
- Weighted MOORA with AHP/entropy weights is common in manufacturing applications (e.g. works by Chakraborty et al.) — not verified individually here.
- Used as a comparison method in MABAC (2015) and CoCoSo (2019).

## Pitfalls
- Negative net scores; the 2008 paper adds a constant to make the smallest sum = 1 for readability — do not do this silently.
- All-zero column → norm 0 (guard r = 0).
- Unit dependence of vector normalization (rank changes under φ = a·f + b).
- Unweighted by default in the origin; pyDecision `moora_method` requires weights → pass ones to reproduce the origin.
- Internal inconsistency in Brauers et al. (2008) contractor example (see below) — do not use it as a fixture.

## Reference example (test fixture)
- **Source:** Brauers, W.K.M.; Zavadskas, E.K. (2010). Project management by MULTIMOORA as an instrument for transition economies. *Technological and Economic Development of Economy* 16(1):5–24. doi:10.3846/tede.2010.01 (DOI printed in the PDF; open access). **Appendix C, Table 2** (2a matrix, 2b roots, 2c ratios and sums, 2d–2e reference point), **Appendix D, Table 3** (full multiplicative form), **Table 1** (rankings).

```json
{
  "id": "moora-brauers-zavadskas-2010",
  "alternatives": ["A", "B", "C"],
  "criteria": ["NPV", "IRR", "payback", "government income", "employment", "value added", "risk", "balance of payments", "investment"],
  "types": ["benefit", "benefit", "cost", "benefit", "benefit", "benefit", "cost", "benefit", "benefit"],
  "weights": [1, 1, 1, 1, 1, 1, 1, 1, 1],
  "matrix": [
    [1, 14, 9, 200, 600, 20, 20, 3.5, 2.5],
    [1.6, 16, 7, 150, 800, 13.5, 25, 4, 1.5],
    [2, 17, 5, 80, 1200, 10, 30, 3.8, 1.25]
  ],
  "expected": {
    "roots": [2.749545, 27.221, 12.45, 262.4881, 1562.05, 26.12, 43.875, 6.533758, 3.1721444],
    "y": [2.93480, 2.723, 2.698],
    "ranking_ratio": [1, 2, 3],
    "refpoint_max_dev": [0.38411, 0.3152442, 0.4571636],
    "ranking_refpoint": [2, 1, 3],
    "full_multiplicative": [1633333, 1421897, 1033600],
    "ranking_multiplicative": [1, 2, 3],
    "ranking_multimoora": [1, 2, 3],
    "tolerance": 0.0005
  }
}
```

- **Published outputs:** ratio sums 2.93480, 2.723, 2.698 (A ≻ B ≻ C); reference point max deviations 0.38411, 0.3152442, 0.4571636 (B ≻ A ≻ C); full multiplicative 1,633,333; 1,421,897; 1,033,600 (A ≻ B ≻ C); MULTIMOORA A ≻ B ≻ C.
- **Recomputed (numpy):** roots 2.7495, 27.2213, 12.4499, 262.4881, 1562.0499, 26.1199, 43.8748, 6.5338, 3.1721; y* = 2.93480, 2.72315, 2.69803 — **MATCH** (max abs diff 0.00015; the paper prints B/C to 3 dp); reference point 0.38411, 0.31524, 0.45716 — **MATCH** (1e-6); full multiplicative 1,633,333.3; 1,421,897.1; 1,033,600 — **MATCH** (paper truncates decimals).
- **pyDecision 5.1.1:** `moora_method(X, weights=ones, types)` → y* **MATCH** (0.00015). `multimoora_method` → ratio, reference-point and multiplicative rankings **MATCH** ([1,2,3], [2,1,3], [1,2,3]); it returns each score divided by its max.
- **Rejected candidate:** Brauers, Zavadskas, Turskis, Vilutienė (2008), JBEM 9(4):245–255, doi:10.3846/1611-1699.2008.9.245-255 (15 contractors × 9 objectives). Its reference-point ranking reproduces 15/15 (max dev diff 0.001), but the ratio-system sums do **not** (max abs diff 0.051; a4/a10 swap): Appendix B Table 1b squares were computed from data that differ from Table 2/1a (e.g. a10: x8 0.2 vs 0.23, x9 0.7 vs 0.73, x2 13.5 vs 13.47). **MISMATCH due to internal inconsistency of the paper.**

## Implementation notes
- pyDecision: `moora_method(dataset, weights, criterion_type, graph, verbose)` (weights required); `multimoora_method(dataset, criterion_type, graph)` (unweighted; returns `(flow_1, flow_2, flow_3)`).
- Our v1: ratio system with optional weights (default 1 → matches origin); also return the reference-point score (cheap) so the site can show "two MOORA views".
- MULTIMOORA later: implement dominance-based aggregation explicitly (not rank averaging).

## Sources
- Brauers & Zavadskas 2010, TEDE 16(1):5–24, doi:10.3846/tede.2010.01, PDF: https://journals.vilniustech.lt/index.php/TEDE/article/download/5832/5078/13168 (Table 1; Appendix C Table 2; Appendix D Table 3).
- Brauers et al. 2008, JBEM 9(4):245–255, doi:10.3846/1611-1699.2008.9.245-255, PDF: https://journals.vilniustech.lt/index.php/JBEM/article/download/6885/5946 (Tables 2–3, Appendix B).
- Brauers & Zavadskas 2006, Control and Cybernetics 35(2):445–469, https://eudml.org/doc/209425 (origin; not opened).
- pyDecision 5.1.1, `pyDecision/algorithm/moora.py`, `multimoora.py`.
- Recompute script: `scratchpad/mcdm/siralama/scripts/moora_mabac_marcos_cocoso.py`.
