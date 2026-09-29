# COmbined COmpromise SOlution (CoCoSo)

- **Family:** ranking (compensatory / utility — aggregation of additive (WSM) and exponential (WPM-like) scores)
- **Origin:** Yazdani, M.; Zaraté, P.; Zavadskas, E.K.; Turskis, Z. (2019). A combined compromise solution (CoCoSo) method for multi-criteria decision-making problems. *Management Decision* 57(9):2501–2519. doi:10.1108/MD-05-2017-0458 (DOI in the author version and verified via Crossref). Read as the author's accepted version on HAL/OATAO (hal-02879091), open access.
- **Popularity:** Crossref cited-by count 994 (checked 2026-09-29); rankless.org lists it as a "hit paper" (768 indexed citations).

## For users (site copy)
- **EN:** CoCoSo computes two scores per alternative — a weighted sum and a "power-weighted" sum — and combines them with three different aggregation strategies into one final score. It is useful when you want a single result that balances additive and multiplicative views of performance.
- **TR:** CoCoSo her alternatif için iki skor hesaplar — ağırlıklı toplam ve "üs-ağırlıklı" toplam — ve bunları üç farklı birleştirme stratejisiyle tek bir nihai skora dönüştürür. Toplamsal ve çarpımsal bakışı dengeleyen tek bir sonuç istediğinizde kullanışlıdır.

## When to use / when not
- Use: when WSM and WPM-type views should both count; data with a clear best/worst per criterion.
- Avoid / warn: the final k is not bounded or interpretable as a percentage; an alternative that is worst on every criterion gets S = P = 0 and breaks $k_b$ (division by min S).

## Inputs
- Decision matrix `X` (m × n); types `benefit|cost`; weights `w` (sum to 1).
- Parameter **λ ∈ [0, 1]**, default **0.5** (Eq. 8, "usually λ = 0.5").

## Algorithm
1. Min–max ("compromise") normalization: benefit $r_{ij} = (x_{ij} - \min_i x_{ij})/(\max_i x_{ij} - \min_i x_{ij})$; cost $r_{ij} = (\max_i x_{ij} - x_{ij})/(\max_i x_{ij} - \min_i x_{ij})$.
2. $S_i = \sum_j w_j r_{ij}$; $P_i = \sum_j r_{ij}^{\,w_j}$ (with $0^{w} = 0$).
3. $k_{ia} = \dfrac{P_i + S_i}{\sum_i (P_i + S_i)}$; $k_{ib} = \dfrac{S_i}{\min_i S_i} + \dfrac{P_i}{\min_i P_i}$; $k_{ic} = \dfrac{\lambda S_i + (1-\lambda) P_i}{\lambda \max_i S_i + (1-\lambda)\max_i P_i}$.
4. $k_i = (k_{ia} k_{ib} k_{ic})^{1/3} + \tfrac13 (k_{ia} + k_{ib} + k_{ic})$; rank by decreasing $k_i$.

Variants: fuzzy / grey / rough CoCoSo; some later papers use a product for P (true WPM) — the origin uses a **sum of powers**. **We implement the origin formulas** (same as pyDecision `cocoso_method`).

## Commonly combined with
- The origin uses weights given with the data (the same weights as the robot-selection problem, see below) and a 48-scenario weight-swap sensitivity (Table VII).
- The origin compares CoCoSo with WASPAS, VIKOR, TOPSIS, CODAS, MOORA, COPRAS and EDAS (Spearman correlations, §3.2.2).
- Objective weights (e.g. CRITIC/Entropy/MEREC) → CoCoSo are common later — not verified individually here.

## Pitfalls
- **min S = 0 or min P = 0** (an alternative worst on all criteria) → $k_b$ division by zero. pyDecision silently adds 1 to all S (or P) in that case, which changes $k_a$, $k_c$ as well; prefer an explicit error or a documented ε.
- Constant column → min–max division by zero (set r = 0 and warn).
- Rank reversal when alternatives are added (min–max and the min/max in $k_b$, $k_c$ move).
- Printed k values are rounded and trailing zeros dropped ("1.3", "2.52") → use tolerance 0.0015 for k.

## Reference example (test fixture)
- **Source:** Yazdani et al. (2019), doi:10.1108/MD-05-2017-0458 (HAL hal-02879091 author version). **Table I** (7 alternatives × 5 criteria, weights), **Table III** (normalized r), **Tables IV–V** (S, P), **Table VI** (ka, kb, kc, k, ranks).
- **Notes found while reproducing:** (i) Table I's data are **identical to the industrial-robot selection data** (Chakraborty & Zavadskas 2014) used in CODAS 2016 Example 1, relabelled as logistics providers (C2 = the 0.4/0.15/… column is the cost criterion). (ii) **Table II** ("normalised decision-making matrix") is actually a **sum normalization** (e.g. 60/93.15 = 0.6441) and is not used by the method; the min–max values are in **Table III**. (iii) The text refers to "Equations (7), (8) and (9)" for ka, kb, kc and "(10)" for k, while the method section numbers them (6)–(9) — numbering typo only.

```json
{
  "id": "cocoso-2019-table1",
  "types": ["benefit", "cost", "benefit", "benefit", "benefit"],
  "weights": [0.036, 0.192, 0.326, 0.326, 0.12],
  "params": { "lambda": 0.5 },
  "matrix": [
    [60, 0.4, 2540, 500, 990], [6.35, 0.15, 1016, 3000, 1041], [6.8, 0.1, 1727.2, 1500, 1676],
    [10, 0.2, 1000, 2000, 965], [2.5, 0.1, 560, 500, 915], [4.5, 0.08, 1016, 350, 508],
    [3, 0.1, 1778, 1000, 920]
  ],
  "expected": {
    "S":  [0.43, 0.6082, 0.6363, 0.4471, 0.2403, 0.2683, 0.5031],
    "P":  [3.2914, 4.3907, 4.502, 4.2058, 2.261, 2.5057, 4.1991],
    "ka": [0.131, 0.175, 0.18, 0.163, 0.088, 0.097, 0.165],
    "kb": [3.245, 4.473, 4.64, 3.721, 2, 2.225, 3.951],
    "kc": [0.724, 0.973, 1, 0.906, 0.487, 0.54, 0.915],
    "k":  [2.041, 2.788, 2.882, 2.416, 1.3, 1.443, 2.52],
    "ranking": [5, 2, 1, 4, 7, 6, 3],
    "tolerance": { "S": 0.0005, "P": 0.0005, "ka": 0.0005, "kb": 0.0005, "kc": 0.0005, "k": 0.0015 }
  }
}
```

- **Published outputs:** as in JSON; A3 ≻ A2 ≻ A7 ≻ A4 ≻ A1 ≻ A6 ≻ A5 (all three partial k's give the same order).
- **Recomputed (numpy):** S = 0.4300, 0.6082, 0.6363, 0.4471, 0.2403, 0.2683, 0.5031; P = 3.2914, 4.3907, 4.5020, 4.2058, 2.2610, 2.5057, 4.1991; ka = 0.1306, 0.1755, 0.1804, 0.1633, 0.0878, 0.0974, 0.1651; kb = 3.2453, 4.4735, 4.6396, 3.7209, 2.0000, 2.2250, 3.9513; kc = 0.7242, 0.9729, 1.0000, 0.9055, 0.4868, 0.5399, 0.9151; k = 2.0413, 2.7880, 2.8823, 2.4160, 1.2987, 1.4431, 2.5191. S, P, ka, kb, kc **MATCH** (max abs diff ≤ 0.0005); k max abs diff **0.0013** (A5 1.2987 vs "1.3", A7 2.5191 vs "2.52") — beyond strict 3-dp rounding, so formally a **MISMATCH at 0.0005**. Recomputing k from the printed (rounded) ka/kb/kc does not close the gap either (max 0.0012), so the paper rounded at some other stage; the deviation is small and the ranking is identical. Verdict: **MATCH within tolerance 0.0015 on k** (strict 0.0005: MISMATCH, cause = rounding in the paper, not a formula difference — pyDecision agrees with us to 1e-15).
- **pyDecision 5.1.1 `cocoso_method`:** identical to ours (diff 4e-16) → same verdict.

## Implementation notes
- pyDecision: `cocoso_method(dataset, criterion_type, weights, L=0.5, graph, verbose)` — note argument order (types before weights); contains the "+1 if min is 0" hack.
- Return r, S, P, ka, kb, kc, k. Decide explicitly on min S = 0 / min P = 0 (error with message recommended).
- Share the matrix with the CODAS fixture (same data) for a cross-method test.

## Sources
- Yazdani et al. 2019, Management Decision 57(9):2501–2519, doi:10.1108/MD-05-2017-0458; author version: https://hal.archives-ouvertes.fr/hal-02879091/document (Eqs. 1–9, Tables I–VII).
- Keshavarz Ghorabaee et al. 2016 (CODAS), Example 1 — same data.
- pyDecision 5.1.1, `pyDecision/algorithm/cocoso.py`.
- Recompute script: `scratchpad/mcdm/siralama/scripts/moora_mabac_marcos_cocoso.py`.
