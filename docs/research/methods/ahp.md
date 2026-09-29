# AHP — Analytic Hierarchy Process, criteria weights from pairwise comparisons (ahp)

- **Family:** weighting (subjective)
- **Origin:** Saaty, T.L. (1977). A scaling method for priorities in hierarchical structures. *Journal of Mathematical Psychology* 15(3), 234–281. DOI [10.1016/0022-2496(77)90033-5](https://doi.org/10.1016/0022-2496(77)90033-5) (Crossref verified; not read). Book: Saaty (1980), *The Analytic Hierarchy Process*, McGraw-Hill (not read). Geometric-mean (row geometric mean) variant: Crawford, G. & Williams, C. (1985). A note on the analysis of subjective judgment matrices. *J. Math. Psych.* 29(4), 387–405. DOI [10.1016/0022-2496(85)90002-1](https://doi.org/10.1016/0022-2496(85)90002-1) (Crossref verified; not read). The algorithm and consistency rule below are from Saaty (2008, open access copy, read) and Saaty (1988, ISAHP proceedings "How to make a decision", read via exa.ai library text).
- **Popularity:** Crossref cited-by 7,969 (Saaty 1977) and 4,935 (Saaty 2008) on 2026-09-29; by far the most used subjective weighting method.

## For users (site copy)
- **EN:** In AHP you compare criteria two at a time ("how much more important is A than B?", on a 1–9 scale). The method turns these judgements into weights and tells you how consistent they were (consistency ratio, CR; below 0.10 is usually acceptable). Use it when an expert or a group can judge importance but not assign numbers directly.
- **TR:** AHP'de kriterleri ikişer ikişer karşılaştırırsınız ("A, B'den ne kadar önemli?", 1–9 ölçeği). Yöntem bu yargıları ağırlığa çevirir ve ne kadar tutarlı olduklarını söyler (tutarlılık oranı, CR; 0,10'un altı genelde kabul edilir). Bir uzman ya da grup önemi yargılayabiliyor ama doğrudan sayı veremiyorsa kullanın.

## When to use / when not
- **Use when:** importance comes from people; n ≤ ~9 criteria (n(n−1)/2 comparisons: 36 at n = 9); you want a consistency check.
- **Do not use when:** n is large (comparison fatigue; consider BWM, 2n − 3 comparisons); weights must be objective; the judges cannot accept ratio statements.

## Inputs
- Positive reciprocal matrix A (n × n): $a_{ii}=1$, $a_{ji} = 1/a_{ij}$, entries from Saaty's 1–9 scale and reciprocals (Saaty 2008 Table 1; 1.1–1.9 allowed for close items). UI should ask only the upper triangle and fill the rest.
- Parameter `method` ∈ {`eigen` (default), `geometric`, `mean`}.
- Output: w, λ_max, CI, CR.

## Algorithm
1. **Eigenvector (default, Saaty):** $A w = \lambda_{\max} w$, w = principal right eigenvector (Perron), normalized to $\sum w_j = 1$. Saaty (2008) computes it by raising A to large powers and normalizing row sums; power iteration until max change < 1e-12 is fine in TS.
2. **Geometric mean (option):** $g_i = \big(\prod_j a_{ij}\big)^{1/n}$, $w_i = g_i/\sum_k g_k$; then $\lambda_{\max} = \frac1n\sum_i (Aw)_i / w_i$.
3. **Additive normalization / "mean" (option; pyDecision default):** normalize each column to sum 1, average across each row; λ_max as in 2.
4. Consistency: $CI = \dfrac{\lambda_{\max}-n}{n-1}$, $CR = CI / RI_n$, accept if CR ≤ 0.10 (Saaty 1988: "10% or less").
5. Random index (Saaty; as used by pyDecision and reproduced below for n = 3 and n = 7): n = 1–2: 0; 3: 0.58; 4: 0.90; 5: 1.12; 6: 1.24; 7: 1.32; 8: 1.41; 9: 1.45; 10: 1.49; 11: 1.51; 12: 1.48; 13: 1.56; 14: 1.57; 15: 1.59. (n ≥ 11 values differ between published tables; we only verified n = 3 and n = 7 against published CRs.)

**Variants.** For n = 3 the eigenvector and geometric-mean weights coincide (confirmed numerically). For n ≥ 4 they differ (Saaty 2008 Table 3: max 0.0095 between them). Group AHP (aggregation of individual judgements by geometric mean) is out of scope for this card. We implement eigenvector by default; pyDecision `ahp_method` default `wd='m'` is the additive approximation, so call it with `wd='me'` when comparing.

## Commonly combined with
- AHP → TOPSIS / VIKOR / PROMETHEE are the most frequent integrations (see the PROMETHEE card and `../combinations.md` if present). Example with a DOI we checked: AHP → PROMETHEE, Dağdeviren (2008), *J. Intelligent Manufacturing* 19, 397–406, DOI [10.1007/s10845-008-0091-7](https://doi.org/10.1007/s10845-008-0091-7) (cited in `promethee-ii.md`, not read by us).
- AHP with rank-based weights as a comparison: Roszkowska (2013), DOI [10.15290/ose.2013.05.65.02](https://doi.org/10.15290/ose.2013.05.65.02), table comparing AHP weights from ROC/RR/RS-shaped comparison matrices with the rank formulas for n = 5 (CRs reported, e.g. 1.8%; seen only as text extract).

## Pitfalls
- **Non-reciprocal input** (typo or user error): eigenvector still computes but CR is meaningless. Enforce reciprocity in the UI (see the drinks typo below).
- **CR > 0.10:** show it prominently and point to the most inconsistent judgement, $\max_{ij} a_{ij} w_j / w_i$ (suggested in Saaty, "Relative Measurement and Its Generalization in Decision Making", seen as text extract only).
- **n = 1, 2:** CI = 0 by construction, RI = 0 → CR undefined; report CR = 0 / "not applicable".
- **Complex eigenvalues:** take the real part of the eigenvalue with largest real part; its eigenvector is real and positive for positive matrices (Perron–Frobenius). Power iteration avoids the issue.
- **Rank reversal** when alternatives (not criteria) are added in distributive-mode AHP — not relevant when AHP is only used for criteria weights, as here.
- **Scale extremes:** entries must be > 0; zero means "no judgement", not allowed.

## Reference example (test fixture)
- **Source:** Saaty, T.L. (2008). Decision making with the analytic hierarchy process. *International Journal of Services Sciences* 1(1), 83–98. DOI [10.1504/IJSSCI.2008.017590](https://doi.org/10.1504/IJSSCI.2008.017590). Table 3 (criteria of the "best job" decision, 5 × 5, priorities); Table 4 (3 × 3 subcriteria); Table 2 (drinks, 7 × 7, priorities and CR = 0.022).
- **Typos found:**
  1. **Table 2 (drinks) is not reciprocal:** row Tea/col Wine = 2 but row Wine/col Tea = 1/3. With the matrix as printed, eigen priorities are [0.1777, 0.0193, **0.0393**, 0.1167, 0.1904, 0.1292, 0.3274] and CR = 0.0142 — tea misses the published 0.042 and CR misses 0.022. Setting a(Tea, Wine) = 3 reproduces every published value (priorities to 3 d.p. and CR 0.0223 → 0.022). So the "2" is the typo.
  2. **Table 8 (job security ratings) is printed transposed:** as printed, eigen priorities are [0.0841, 0.2109, 0.7049]; the published [0.6586, 0.2628, 0.0786] belong to the transpose.

```json
{
  "id": "ahp-saaty2008-job-criteria",
  "source": "Saaty 2008, IJSS 1(1):83-98, Table 3",
  "criteria": ["flexibility", "opportunities", "security", "reputation", "salary"],
  "matrix": [
    [1, 0.25, 0.16666666666666666, 0.25, 0.125],
    [4, 1, 0.3333333333333333, 3, 0.14285714285714285],
    [6, 3, 1, 4, 0.5],
    [4, 0.3333333333333333, 0.25, 1, 0.14285714285714285],
    [8, 7, 2, 7, 1]
  ],
  "method": "eigen",
  "expected": {"weights": [0.036, 0.122, 0.262, 0.075, 0.506], "tolerance": 5e-4},
  "our_values_not_published": {"lambda_max": 5.3263, "CI": 0.0816, "CR": 0.0728, "geometric_weights": [0.0351, 0.1185, 0.2715, 0.0721, 0.5027], "mean_weights": [0.0383, 0.1241, 0.2621, 0.0819, 0.4936]}
}
```

```json
{
  "id": "ahp-saaty2008-drinks-corrected",
  "source": "Saaty 2008, Table 2, with a(Tea,Wine) corrected from 2 to 3 (see typo note)",
  "items": ["coffee", "wine", "tea", "beer", "sodas", "milk", "water"],
  "matrix": [
    [1, 9, 5, 2, 1, 1, 0.5],
    [0.1111111111111111, 1, 0.3333333333333333, 0.1111111111111111, 0.1111111111111111, 0.1111111111111111, 0.1111111111111111],
    [0.2, 3, 1, 0.3333333333333333, 0.25, 0.3333333333333333, 0.1111111111111111],
    [0.5, 9, 3, 1, 0.5, 1, 0.3333333333333333],
    [1, 9, 4, 2, 1, 2, 0.5],
    [1, 9, 3, 1, 0.5, 1, 0.3333333333333333],
    [2, 9, 9, 3, 2, 3, 1]
  ],
  "method": "eigen",
  "expected": {"weights": [0.177, 0.019, 0.042, 0.116, 0.190, 0.129, 0.327], "CR": 0.022, "tolerance": {"weights": 5e-4, "CR": 5e-4}}
}
```

```json
{
  "id": "ahp-saaty2008-flexibility-3x3",
  "source": "Saaty 2008, Table 4",
  "matrix": [[1, 0.3333333333333333, 0.16666666666666666], [3, 1, 0.25], [6, 4, 1]],
  "method": "eigen",
  "expected": {"weights": [0.091, 0.218, 0.691], "tolerance": 5e-4, "note": "geometric method gives identical weights for n = 3"}
}
```

- **Recomputed** (`scratchpad/mcdm/agirlik/recompute_all.py`):
  - Table 3, eigen: numpy = [0.03605, 0.12190, 0.26189, 0.07455, 0.50560] → **MATCH** (max abs diff 4.5e-4, 3-d.p. rounding); pyDecision `ahp_method(wd='me')` identical (0.0). Geometric (0.0351, …) and mean (0.0383, …) do **not** match the published numbers (max 9.5e-3 and 1.2e-2) → Saaty used the eigenvector, as stated.
  - Table 2 corrected: numpy = [0.1775, 0.0191, 0.0418, 0.1164, 0.1896, 0.1288, 0.3268], CR = 0.0223 → **MATCH** (4.6e-4 on weights; CR 0.0003); pyDecision identical. As printed: **MISMATCH** (typo).
  - Table 4: [0.0914, 0.2176, 0.6910] → **MATCH**.
  - Extra CR check for RI(3) = 0.58: Saaty (1988) "Size of house" matrix [[1,6,8],[1/6,1,4],[1/8,1/4,1]] gives λ = 3.1356, CI = 0.0678, CR = 0.1169 vs published 3.136 / .068 / .117 → MATCH (ISAHP proceedings copy; not used as fixture because the table text was OCR-garbled).

## Implementation notes
- pyDecision: `ahp_method(dataset, wd='me'|'g'|'m')` → (weights, CR). Default is `'m'`.
- TS: power iteration on A (start with equal vector, normalize each step, stop at 1e-12 or 1000 iterations); λ_max = mean((Aw)_i / w_i).
- Validate: square, positive, reciprocal within 1e-9 (or build from upper triangle only).
- Hierarchies (sub-criteria, alternatives) are out of scope of the weighting card; for criteria weights only the top-level matrix is needed.

## Sources
- Saaty (2008), DOI 10.1504/IJSSCI.2008.017590 — full PDF (rafikulislam.com copy), Tables 1–8.
- Saaty (1988), "How to make a decision: the analytic hierarchy process", ISAHP proceedings — text via exa.ai library (house example, CR rule).
- Saaty (1977); Crawford & Williams (1985) — Crossref metadata only.
- pyDecision 5.1.1 `algorithm/ahp.py` (read).
