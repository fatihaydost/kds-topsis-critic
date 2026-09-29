# Evaluation based on Distance from Average Solution (EDAS)

- **Family:** ranking (compensatory / distance — distance from the average solution)
- **Origin:** Keshavarz Ghorabaee, M.; Zavadskas, E.K.; Olfat, L.; Turskis, Z. (2015). Multi-Criteria Inventory Classification Using a New Method of Evaluation Based on Distance from Average Solution (EDAS). *Informatica* 26(3):435–451. doi:10.15388/Informatica.2015.57 (DOI printed in the PDF; open access).
- **Popularity:** Crossref cited-by count 1,216 (checked 2026-09-29). Widely used as a comparison method in later papers (CODAS 2016, CoCoSo 2019).

## For users (site copy)
- **EN:** EDAS compares every alternative with the average of all alternatives: how much better than average it is (positive distance) and how much worse (negative distance), weighted by criterion importance. Good when you want a simple, robust score and an "average performer" is a meaningful benchmark.
- **TR:** EDAS her alternatifi tüm alternatiflerin ortalamasıyla karşılaştırır: ortalamadan ne kadar iyi (pozitif uzaklık) ve ne kadar kötü (negatif uzaklık) olduğunu kriter ağırlıklarıyla toplar. Basit ve sağlam bir skor istediğinizde ve "ortalama performans" anlamlı bir referanssa uygundur.

## When to use / when not
- Use: many alternatives (e.g., ABC/inventory classification), no natural ideal point, want less sensitivity to one extreme alternative than ideal-point methods.
- Avoid / warn: criteria whose average is 0 or negative (division by AV); when the average itself is meaningless (ordinal codes); results depend on the alternative set (the average moves).

## Inputs
- Decision matrix `X` (n × m), positive values recommended; types `benefit|cost`; weights `w` (sum to 1; EDAS is invariant to a common scale of `w`).
- No extra parameters.

## Algorithm
1. Average solution: $AV_j = \frac{1}{n}\sum_i X_{ij}$.
2. Benefit criterion: $PDA_{ij} = \max(0, X_{ij} - AV_j)/AV_j$, $NDA_{ij} = \max(0, AV_j - X_{ij})/AV_j$. Cost criterion: swap the two numerators.
3. $SP_i = \sum_j w_j PDA_{ij}$, $SN_i = \sum_j w_j NDA_{ij}$.
4. $NSP_i = SP_i / \max_i SP_i$, $NSN_i = 1 - SN_i / \max_i SN_i$.
5. $AS_i = \tfrac12 (NSP_i + NSN_i)$, $0 \le AS_i \le 1$; rank by decreasing AS.

Variants: fuzzy EDAS, stochastic EDAS (later papers). **We implement the 2015 crisp version** (same as pyDecision `edas_method`).

## Commonly combined with
- Equal weights (the 47-SKU example) and simulated weight sets (Tables 6–7 of the origin paper).
- Frequently paired with objective weights (CRITIC/Entropy/MEREC) in later applications — not verified with specific papers here.
- Used as a benchmark in CODAS (Keshavarz Ghorabaee et al. 2016) and CoCoSo (Yazdani et al. 2019).

## Pitfalls
- $AV_j = 0$ → division by zero; negative AV flips the meaning. Require positive data or shift columns.
- $\max SP = 0$ (no alternative above average on any criterion — only possible if all rows equal) or $\max SN = 0$ → NSP/NSN undefined; define NSP = 0 / NSN = 1 and flag.
- Constant column contributes nothing (fine).
- Rank reversal when alternatives are added/removed (AV changes).
- The paper prints values at 2 decimals; tests must use tolerance ≥ 0.006 on AS.

## Reference example (test fixture)
- **Source:** Keshavarz Ghorabaee et al. (2015), doi:10.15388/Informatica.2015.57. **Table 1** (47 SKUs × 3 benefit criteria: average unit cost, annual dollar usage, lead time; equal weights), **Table 2** (PDA, NDA, SP, NSP, SN, NSN, AS). Secondary: **Tables 5–7** (10 × 7 MCDM example, 7 weight sets, ranks).

```json
{
  "id": "edas-2015-table1",
  "types": ["benefit", "benefit", "benefit"],
  "weights": [0.3333333333, 0.3333333333, 0.3333333333],
  "matrix": [
    [49.92, 5840.64, 2], [210, 5670, 5], [23.76, 5037.12, 4], [27.73, 4769.56, 1], [57.98, 3478.8, 3],
    [31.24, 2936.67, 3], [28.2, 2820, 3], [55, 2640, 4], [73.44, 2423.52, 6], [160.5, 2407.5, 4],
    [5.12, 1075.2, 2], [20.87, 1043.5, 5], [86.5, 1038, 7], [110.4, 883.2, 5], [71.2, 854.4, 3],
    [45, 810, 3], [14.66, 703.68, 4], [49.5, 594, 6], [47.5, 570, 5], [58.45, 467.6, 4],
    [24.4, 463.6, 4], [65, 455, 4], [86.5, 432.5, 4], [33.2, 398.4, 3], [37.05, 370.5, 1],
    [33.84, 338.4, 3], [84.03, 336.12, 1], [78.4, 313.6, 6], [134.34, 268.68, 7], [56, 224, 1],
    [72, 216, 5], [53.02, 212.08, 2], [49.48, 197.92, 5], [7.07, 190.89, 7], [60.6, 181.8, 3],
    [40.82, 163.28, 3], [30, 150, 5], [67.4, 134.8, 3], [59.6, 119.2, 5], [51.68, 103.36, 6],
    [19.8, 79.2, 2], [37.7, 75.4, 2], [29.89, 59.78, 5], [48.3, 48.3, 3], [34.4, 34.4, 7],
    [28.8, 28.8, 3], [8.46, 25.38, 5]
  ],
  "expected": {
    "AV": [54.44, 1099.68, 3.91],
    "AS": [0.66, 1.00, 0.61, 0.43, 0.60, 0.45, 0.43, 0.60, 0.64, 0.72, 0.16, 0.36, 0.58, 0.54, 0.41, 0.34, 0.24, 0.40, 0.37, 0.37,
           0.23, 0.37, 0.39, 0.19, 0.08, 0.18, 0.19, 0.39, 0.47, 0.13, 0.35, 0.18, 0.30, 0.14, 0.25, 0.18, 0.20, 0.25, 0.31, 0.30,
           0.00, 0.08, 0.18, 0.18, 0.23, 0.09, 0.08],
    "tolerance": 0.006
  },
  "note": "The paper's SP/SN in Table 2 are unweighted sums (w = 1 each); AS is unchanged by a common weight scale."
}
```

```json
{
  "id": "edas-2015-table5-set1",
  "types": ["benefit", "benefit", "benefit", "cost", "cost", "cost", "cost"],
  "weights": [0.250, 0.214, 0.179, 0.143, 0.107, 0.071, 0.036],
  "matrix": [
    [23, 264, 2.37, 0.05, 167, 8900, 8.71], [20, 220, 2.2, 0.04, 171, 9100, 8.23],
    [17, 231, 1.98, 0.15, 192, 10800, 9.91], [12, 210, 1.73, 0.2, 195, 12300, 10.21],
    [15, 243, 2, 0.14, 187, 12600, 9.34], [14, 222, 1.89, 0.13, 180, 13200, 9.22],
    [21, 262, 2.43, 0.06, 160, 10300, 8.93], [20, 256, 2.6, 0.07, 163, 11400, 8.44],
    [19, 266, 2.1, 0.06, 157, 11200, 9.04], [8, 218, 1.94, 0.11, 190, 13400, 10.11]
  ],
  "weight_sets_table6": [
    [0.250, 0.214, 0.179, 0.143, 0.107, 0.071, 0.036], [0.182, 0.212, 0.182, 0.152, 0.121, 0.091, 0.061],
    [0.139, 0.167, 0.194, 0.167, 0.139, 0.111, 0.083], [0.108, 0.135, 0.162, 0.189, 0.162, 0.135, 0.108],
    [0.083, 0.111, 0.139, 0.167, 0.194, 0.167, 0.139], [0.061, 0.091, 0.121, 0.152, 0.182, 0.212, 0.182],
    [0.036, 0.071, 0.107, 0.143, 0.179, 0.214, 0.250]
  ],
  "expected_ranks_table7": {
    "EDAS":   [[1,4,6,10,7,8,2,3,5,9],[1,4,6,10,7,8,2,3,5,9],[1,3,7,10,6,8,2,4,5,9],[1,2,7,10,6,8,3,4,5,9],[1,2,6,10,7,8,3,4,5,9],[1,2,6,10,7,8,3,4,5,9],[1,2,6,10,7,8,3,4,5,9]],
    "VIKOR":  [[2,5,7,9,6,8,1,3,4,10],[2,5,7,10,6,8,1,3,4,9],[2,5,7,10,6,8,1,3,4,9],[1,5,8,10,6,7,2,3,4,9],[1,5,8,10,6,7,2,3,4,9],[1,3,6,9,7,8,2,4,5,10],[1,2,8,10,6,7,3,4,5,9]],
    "TOPSIS": [[1,4,6,10,7,8,2,3,5,9],[1,4,6,10,7,8,2,3,5,9],[1,3,9,10,8,7,2,4,5,6],[1,2,9,10,8,7,3,5,4,6],[1,2,9,10,8,7,3,5,4,6],[1,2,9,10,8,7,3,5,4,6],[1,2,9,10,8,7,3,5,4,6]],
    "SAW":    [[1,3,6,9,7,8,2,4,5,10],[1,2,6,10,7,8,3,4,5,9],[1,2,6,10,7,8,3,4,5,9],[1,2,6,10,7,8,3,4,5,9],[1,2,6,10,7,8,3,4,5,9],[2,1,6,10,7,8,3,4,5,9],[2,1,6,10,7,8,3,4,5,9]],
    "COPRAS": [[1,3,6,10,7,8,2,4,5,9],[1,3,6,10,7,8,2,4,5,9],[1,2,6,10,7,8,3,4,5,9],[1,2,7,10,6,8,3,4,5,9],[1,2,7,10,6,8,3,4,5,9],[1,2,6,10,7,8,3,4,5,9],[2,1,7,10,6,8,3,4,5,9]]
  }
}
```

- **Published outputs:** Table 1 AV = 54.44, 1099.68, 3.91; Table 2 AS (2 dp) as above; best SKU S2 (AS = 1.00), worst S41 (AS = 0.00). Table 7 ranks as above.
- **Recomputed (numpy):** AV = 54.44, 1099.68, 3.91 (MATCH). AS (4 dp): 0.6563, 1.0000, 0.6098, 0.4281, 0.5959, 0.4539, 0.4330, 0.5983, 0.6430, 0.7167, 0.1549, 0.3564, 0.5808, 0.5416, 0.4099, 0.3367, 0.2359, 0.4025, 0.3707, 0.3666, 0.2263, 0.3720, 0.3941, 0.1928, 0.0795, 0.1824, 0.1869, 0.3927, 0.4707, 0.1268, 0.3455, 0.1780, 0.2971, 0.1409, 0.2476, 0.1748, 0.1994, 0.2458, 0.3084, 0.3036, 0.0000, 0.0792, 0.1789, 0.1828, 0.2285, 0.0913, 0.0755. Max abs diff vs Table 2 = **0.0052** (items 11, 36: 0.1549/0.1748 printed as 0.16/0.18) — i.e. at the edge of 2-dp rounding; the paper apparently rounded intermediate values. **MATCH at published precision (tol 0.006)**, not at 0.005. SP (unweighted) for SKUs 1–10 matches Table 2 within 0.0046.
- Table 5–7 check: our EDAS ranks equal published EDAS ranks in **7/7 sets (MATCH)**. Our set-1 AS (4 dp, derived, for tighter tests): 1.0000, 0.8205, 0.3380, 0.0000, 0.3220, 0.2731, 0.8995, 0.8410, 0.7732, 0.1527.
- **pyDecision 5.1.1 `edas_method`:** identical to ours (diff 0) → same verdict.

## Implementation notes
- pyDecision: `edas_method(dataset, criterion_type, weights, graph, verbose)` — note argument order (types before weights). Returns AS vector.
- Guard AV ≤ 0 (reject or warn), $\max SP = 0$, $\max SN = 0$.
- Use the 10 × 7 matrix (Table 5) as the shared cross-method fixture: one input exercises EDAS, VIKOR, TOPSIS, SAW, COPRAS ranks for 7 weight sets.

## Sources
- Keshavarz Ghorabaee et al. 2015, Informatica 26(3):435–451, doi:10.15388/Informatica.2015.57, PDF: https://informatica.vu.lt/journal/INFORMATICA/article/779/file/pdf (Tables 1, 2, 5, 6, 7).
- pyDecision 5.1.1, `pyDecision/algorithm/edas.py`.
- Recompute script: `scratchpad/mcdm/siralama/scripts/edas_aras_waspas.py`.
