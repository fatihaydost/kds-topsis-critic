# Standard Deviation weighting (sd)

- **Family:** weighting (objective)
- **Origin:** No single founding paper found. Mukhametzyanov (2021, DMAME 4(2):76–105, Sec. 2) credits "standard deviation or an entropy measure of importance" for contrast intensity to Zeleny (1982, *Multiple Criteria Decision Making*, McGraw-Hill; no DOI). Many papers cite Diakoulaki, Mavrotas & Papayannakis (1995), *Computers & Operations Research* 22(7):763–770, DOI [10.1016/0305-0548(94)00059-H](https://doi.org/10.1016/0305-0548(94)00059-H), where SD appears as a comparison baseline for CRITIC — **not verified from the full text** (paywalled).
- **Popularity:** In the 30-study review table of Keshavarz-Ghorabaee et al. (2021, Symmetry 13:525, Table 1; studies from 2020–2021) SD is used in 8 studies (Entropy 12, CRITIC 13); it is one of their three comparison methods.

## For users (site copy)
- **EN:** SD weighting scales every criterion to 0–1 and gives more weight to criteria whose values are more spread out across the alternatives. It is the simplest objective method: no correlations, no logarithms. Use it as a transparent baseline or when criteria are not strongly related to each other.
- **TR:** SD ağırlıklandırması her kriteri 0–1 aralığına ölçekler ve değerleri alternatifler arasında daha çok yayılan kriterlere daha çok ağırlık verir. En basit nesnel yöntemdir: korelasyon yok, logaritma yok. Şeffaf bir karşılaştırma tabanı olarak ya da kriterler birbirine çok bağlı değilse kullanın.

## When to use / when not
- **Use when:** a quick, explainable objective weighting is needed; as a sanity check against CRITIC (CRITIC = SD × conflict).
- **Do not use when:** criteria are highly correlated (SD double-counts them; use CRITIC); there are outliers (one extreme value compresses the rest of the min–max range, see Pitfalls).

## Inputs
- Decision matrix X (m × n), real values (negatives fine), m ≥ 2.
- Criterion types `max`/`min` (used only in normalization; for min–max the SD is the same either way, see Pitfalls).
- No parameters.

## Algorithm
1. Min–max normalization with cost inversion (same as CRITIC step 1):
   $r_{ij} = \frac{x_{ij}-x_j^{\min}}{x_j^{\max}-x_j^{\min}}$ (benefit), $r_{ij} = \frac{x_j^{\max}-x_{ij}}{x_j^{\max}-x_j^{\min}}$ (cost).
2. $\sigma_j = \sqrt{\tfrac{1}{m-1}\sum_i (r_{ij}-\bar r_j)^2}$.
3. $w_j = \sigma_j / \sum_k \sigma_k$.

**Variants.** (i) n vs n−1 in σ: no effect on weights (common factor cancels; checked, difference 2.8e-17). (ii) Other normalizations (x/max, sum, vector, WASPAS-type): change the weights strongly — Mukhametzyanov (2021) Table 4 shows w4 ranging from 0.135 (dSum) to 0.411 (Sum) on the same data (0.183 with min–max); Keshavarz-Ghorabaee et al. (2021) Table 6 uses WASPAS-type normalization. We implement min–max (the form in Mukhametzyanov 2021 Sec. 2.3). pyDecision has no SD function.

## Commonly combined with
- SD → MULTIMOORA / MOOSRA (EDM process parameters, Anitha & Das), SD → EDAS/COPRAS/TOPSIS/ARAS (brake disc design, Maheshwari et al.), SD → GRA/TOPSIS/ORESTE (material selection, Şahin) — all as reviewed in Keshavarz-Ghorabaee et al. (2021) Sec. 2, DOI [10.3390/sym13040525](https://doi.org/10.3390/sym13040525).
- SD vs Entropy vs CRITIC comparison: Mukhametzyanov (2021), DOI [10.31181/dmame210402076i](https://doi.org/10.31181/dmame210402076i).

## Pitfalls
- **Constant column:** range 0 → set r = 0, σ = 0, weight 0 with warning. All constant → equal weights with warning.
- **Direction does not matter for min–max:** r_cost = 1 − r_benefit has the same σ, so `types` has no effect on SD weights (only on the displayed r). Say this on the site so users are not surprised.
- **Outliers:** one extreme value shrinks the spread of all other normalized values in that column and lowers its σ.
- **Rank reversal of criteria:** adding/removing an alternative changes min/max and σ.
- **Range bound:** min–max σ lies in (0, ~0.707] (sample SD, m = 2), so SD weights tend to be flat (Mukhametzyanov Table 2: 0.183–0.210) — often flatter than users expect.

## Reference example (test fixture)
- **Source:** Mukhametzyanov, I.Z. (2021). Specific character of objective methods for determining weights of criteria in MCDM problems: Entropy, CRITIC, SD. *Decision Making: Applications in Management and Engineering* 4(2), 76–105. DOI [10.31181/dmame210402076i](https://doi.org/10.31181/dmame210402076i). Input: Table 1 (DM-1 and DM-2, 8 alternatives × 5 criteria). Output: Table 2, block "SD", rows DM-1 and DM-2 (3 decimals); Table 4 row "Max-Min" gives σ of DM-1.

```json
{
  "id": "sd-mukhametzyanov2021",
  "source": "Mukhametzyanov 2021, DMAME 4(2):76-105, Table 1 (input), Table 2 SD and Table 4 Max-Min (output)",
  "types": ["max", "min", "max", "max", "min"],
  "cases": [
    {
      "name": "DM-1",
      "matrix": [[71, 4500, 150, 1056, 478], [85, 5800, 145, 2680, 564], [76, 5600, 135, 1230, 620], [74, 4200, 160, 1480, 448], [82, 6200, 183, 1350, 615], [81, 6000, 178, 2065, 580], [80, 5900, 160, 1650, 610], [85, 6500, 140, 1650, 667]],
      "expected": {"sigma_sample_minmax": [0.366, 0.354, 0.361, 0.319, 0.341], "weights": [0.210, 0.203, 0.207, 0.183, 0.196], "ranking": [1, 3, 2, 5, 4], "tolerance": 5e-4}
    },
    {
      "name": "DM-2",
      "matrix": [[83, 5322, 170, 1682, 500], [84, 6021, 155, 2140, 513], [76, 4219, 155, 1613, 454], [73, 6154, 157, 2047, 582], [78, 5453, 173, 2136, 598], [82, 6030, 174, 1238, 587], [80, 4344, 172, 1365, 507], [77, 6114, 158, 1585, 592]],
      "expected": {"weights": [0.175, 0.206, 0.231, 0.195, 0.192], "tolerance": 5e-4}
    }
  ]
}
```

- **Recomputed** (`scratchpad/mcdm/agirlik/recompute_all.py`):
  - DM-1: numpy = [0.21021, 0.20322, 0.20730, 0.18347, 0.19580]; σ (n−1) = [0.3657, 0.3536, 0.3607, 0.3192, 0.3406] vs Table 4 [0.366, 0.354, 0.361, 0.319, 0.341] → **MATCH**, max abs diff 4.7e-4 (3-decimal rounding).
  - DM-2: numpy = [0.17485, 0.20649, 0.23148, 0.19523, 0.19195] → **MATCH**, max abs diff 4.9e-4.
  - pyDecision: **not run** (library has no SD weighting function in v5.1.1).
  - Also reproduced (variant, not fixture): Keshavarz-Ghorabaee et al. (2021) Table 6 "Standard Deviation" = SD on WASPAS-normalized matrix → MATCH at 3 d.p. (max 4.9e-4).

## Implementation notes
- Share the min–max step and σ with CRITIC (CRITIC's C_j = σ_j · Σ(1 − ρ_jk)); SD is CRITIC with the conflict term set to 1.
- Keep ddof = 1 for displayed σ (Excel `STDEV`), weights unaffected.

## Sources
- Mukhametzyanov (2021), DOI 10.31181/dmame210402076i — full PDF (dmame-journal.org), Tables 1, 2, 4.
- Keshavarz-Ghorabaee et al. (2021), DOI 10.3390/sym13040525 — full PDF, Sec. 2 and Table 6.
- Diakoulaki et al. (1995) — Crossref metadata only.
