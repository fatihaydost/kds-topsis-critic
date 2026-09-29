# BWM — Best-Worst Method (bwm)

- **Family:** weighting (subjective)
- **Origin:**
  - Original (non-linear min–max) model and consistency ratio: Rezaei, J. (2015). Best-worst multi-criteria decision-making method. *Omega* 53, 49–57. DOI [10.1016/j.omega.2014.11.009](https://doi.org/10.1016/j.omega.2014.11.009) (Crossref verified; full text not read — its CI table and model (2) are reproduced in Rezaei 2016, which we read).
  - **Linear model** (unique solution) and interval analysis: Rezaei, J. (2016). Best-worst multi-criteria decision-making method: Some properties and a linear model. *Omega* 64, 126–130. DOI [10.1016/j.omega.2015.12.001](https://doi.org/10.1016/j.omega.2015.12.001) (read in full, accepted-manuscript copy).
  - Note for the brief: the **linear model is Rezaei 2016**, not 2015. The 2015 paper's model is the non-linear one.
  - Input-based consistency ratio and thresholds: Liang, F., Brunelli, M. & Rezaei, J. (2020). Consistency issues in the best worst method: Measurements and thresholds. *Omega* 96, 102175. DOI [10.1016/j.omega.2019.102175](https://doi.org/10.1016/j.omega.2019.102175) (Crossref verified; not read — formula taken from pyDecision's implementation, see Pitfalls).
- **Popularity:** Crossref cited-by 3,877 (Rezaei 2015) and 1,543 (Rezaei 2016) on 2026-09-29.

## For users (site copy)
- **EN:** In BWM you pick the most important (best) and the least important (worst) criterion, then say how much more important the best one is than each other criterion, and how much more important each criterion is than the worst one (1–9). That is only 2n − 3 judgements instead of AHP's n(n−1)/2. The method finds the weights that fit these judgements best and reports how consistent they are.
- **TR:** BWM'de en önemli (en iyi) ve en önemsiz (en kötü) kriteri seçersiniz; sonra en iyinin diğer her kriterden ne kadar önemli olduğunu ve her kriterin en kötüden ne kadar önemli olduğunu söylersiniz (1–9). AHP'deki n(n−1)/2 yerine yalnızca 2n − 3 yargı gerekir. Yöntem bu yargılara en iyi uyan ağırlıkları bulur ve ne kadar tutarlı olduklarını raporlar.

## When to use / when not
- **Use when:** subjective weights with fewer questions than AHP; n = 3–10 criteria; one decision maker or an aggregated group vector.
- **Do not use when:** the decision maker cannot name a single best and worst criterion; you need pairwise information among "middle" criteria (BWM never compares them directly).

## Inputs
- Index of best criterion B and worst criterion W.
- Best-to-Others vector $a_B = (a_{B1},\dots,a_{Bn})$, $a_{BB} = 1$, values in 1–9.
- Others-to-Worst vector $a_W = (a_{1W},\dots,a_{nW})$, $a_{WW} = 1$, and $a_{BW}$ must be the same number in both vectors.
- Parameter `model` ∈ {`linear` (default), `nonlinear`}.
- Output: w, ξ (ξ^L for linear, ξ* for non-linear), consistency ratio.

## Algorithm
**Linear model (Rezaei 2016, model (19)) — default.**
$$\min \xi^L \quad \text{s.t.}\quad |w_B - a_{Bj} w_j| \le \xi^L,\ \ |w_j - a_{jW} w_W| \le \xi^L\ \ \forall j,\quad \sum_j w_j = 1,\ w_j \ge 0.$$
Each absolute value becomes two linear inequalities → an LP with n + 1 variables and 4n inequality rows; solve with any LP solver (HiGHS/simplex). Unique solution. Rezaei (2016): "ξ^L can be directly considered as an indicator of the consistency … values close to zero show a high level of consistency" (no CI table for the linear model).

**Non-linear model (Rezaei 2015, model (2) as restated in 2016) — option.**
$$\min \xi \quad \text{s.t.}\quad \Big|\frac{w_B}{w_j} - a_{Bj}\Big| \le \xi,\ \ \Big|\frac{w_j}{w_W} - a_{jW}\Big| \le \xi,\ \ \sum_j w_j = 1,\ w_j \ge 0.$$
May have multiple optimal w (Rezaei 2016 gives intervals); ξ* is unique. Consistency ratio $CR = \xi^* / CI(a_{BW})$ with CI (Rezaei 2016 Table 1, citing 2015):

| a_BW | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|
| CI (max ξ) | 0.00 | 0.44 | 1.00 | 1.63 | 2.30 | 3.00 | 3.73 | 4.47 | 5.23 |

**Input-based CR (Liang et al. 2020) — display option:** $CR^I = \max_j \dfrac{|a_{Bj}\,a_{jW} - a_{BW}|}{a_{BW}^2 - a_{BW}}$ ($CR^I = 0$ if $a_{BW} = 1$). Needs no optimization; full consistency ⇔ $a_{Bj}a_{jW} = a_{BW}\ \forall j$ (Rezaei 2016 Definition 1).

**What we implement:** linear model + ξ^L, plus CR^I for the "is this consistent?" message. Non-linear model optional (multi-start SLSQP in our Python check; in TS it needs a non-linear solver, so defer).

## Commonly combined with
- BWM → TOPSIS / VIKOR / ranking of alternatives, or BWM to weigh both criteria and alternatives (Rezaei 2015 applications). No combination paper was read for this card; see `../combinations.md` if present.
- BWM vs AHP as competing subjective methods: Rezaei (2015) compares them (not read).

## Pitfalls
- **a_BW mismatch:** the BO entry for W must equal the OW entry for B; reject otherwise.
- **Multiple optima (non-linear):** different solvers return different w with the same ξ*. Rezaei 2016 Example 2 intervals: w1 ∈ [0.2145, 0.2289], w2 ∈ [0.4461, 0.4571], w3 ∈ [0.1085, 0.1176], w4 ∈ [0.1563, 0.1602], w5 ∈ [0.0548, 0.0561]. Tests of the non-linear model must check ξ* and interval membership, not exact w.
- **pyDecision `bw_method` is neither model:** it minimizes `ξ + Σ max(0, violation − ξ)` over the linear-form constraints with `trust-constr` from a seeded random start. On Rezaei 2016 Example 2 it returns [0.2234, 0.4520, 0.1151, 0.1543, 0.0551] (max diff to the published linear solution 6.1e-3); on Example 3 [0.2059, 0.4538, 0.1297, 0.1621, 0.0486] vs our linear [0.2462, 0.4308, 0.1231, 0.1538, 0.0462]. Do not use it as oracle. Its printed CR is the input-based CR^I, compared with a single threshold row `[0,0,0,0.1667,0.1898,0.2306,0.2643,0.2819,0.2958,0.3062]` indexed by a_BW (source of that row not verified by us).
- **ξ scales differ:** ξ^L (linear, weight units) is much smaller than ξ* (ratio units): Example 2 gives ξ^L = 0.0109 vs ξ* = 0.1459. Never divide ξ^L by the 2015 CI table.
- **Ties for best/worst:** if two criteria are equally best, the method needs one chosen; UI should let the user pick one and enter 1 for the other.

## Reference example (test fixture)
- **Source:** Rezaei (2016), *Omega* 64:126–130, DOI 10.1016/j.omega.2015.12.001. Car purchase, 5 criteria (quality, price, comfort, safety, style), best = price, worst = style. Example 1 = Table 2 (fully consistent), Example 2 = Table 3; weights of the linear model in Sec. 4, ξ* and intervals of the non-linear model in Sec. 3.

```json
{
  "id": "bwm-rezaei2016",
  "source": "Rezaei 2016, Omega 64:126-130, Tables 2-3 (input), Sec. 3 and Sec. 4 (output)",
  "criteria": ["quality", "price", "comfort", "safety", "style"],
  "best": "price",
  "worst": "style",
  "cases": [
    {
      "name": "example1_consistent",
      "best_to_others": [2, 1, 4, 2, 8],
      "others_to_worst": [4, 8, 2, 4, 1],
      "expected_linear": {"weights": [0.2105, 0.4211, 0.1053, 0.2105, 0.0526], "xi_L": 0.0},
      "expected_nonlinear": {"xi": 0.0}
    },
    {
      "name": "example2",
      "best_to_others": [2, 1, 4, 3, 8],
      "others_to_worst": [4, 8, 2, 3, 1],
      "expected_linear": {"weights": [0.2295, 0.4481, 0.1148, 0.1530, 0.0546], "xi_L": 0.0109},
      "expected_nonlinear": {"xi": 0.1459, "weight_intervals": [[0.2145, 0.2289], [0.4461, 0.4571], [0.1085, 0.1176], [0.1563, 0.1602], [0.0548, 0.0561]]}
    }
  ],
  "tolerance": 5e-5,
  "our_values_not_published": {"example2": {"CR_output_xi_over_CI8": 0.0326, "CR_input_Liang2020": 0.0179}}
}
```

- **Recomputed** (`scratchpad/mcdm/agirlik/recompute_all.py`, scipy `linprog(method='highs')` for linear; 200-start SLSQP for non-linear):
  - Example 1: linear [0.21053, 0.42105, 0.10526, 0.21053, 0.05263], ξ^L = 0 → **MATCH**. pyDecision → MATCH (3.9e-7) — consistent case only.
  - Example 2: linear [0.22951, 0.44809, 0.11475, 0.15301, 0.05464], ξ^L = 0.01093 → **MATCH** (max 4.6e-5). Non-linear ξ* = 0.1459 → **MATCH**; our w [0.2190, 0.4512, 0.1164, 0.1581, 0.0554] lies inside all five published intervals. pyDecision → **MISMATCH** (6.1e-3, see Pitfalls).
  - Example 3 (Table 4, BO [2,1,4,3,8], OW [4,8,4,2,1]): paper gives only non-linear ξ = 1 and intervals; we get ξ* = 1.0000 → MATCH. Note the Table 4 OW vector has comfort = 4 and safety = 2 (with BO safety = 3 this is the deliberately inconsistent case).
  - No typo found.

## Implementation notes
- pyDecision: `bw_method(mic, lic, eps_penalty=1, verbose=True)` — heuristic, see Pitfalls.
- TS: need a small LP solver (e.g., `javascript-lp-solver` or a hand-written simplex for ≤ 10 variables). Variables w_1..w_n, ξ; minimize ξ.
- Show both vectors, ξ^L, and CR^I with a threshold hint; the thresholds of Liang et al. (2020) should be taken from the paper itself before being shown as pass/fail (not done here).

## Sources
- Rezaei (2016), DOI 10.1016/j.omega.2015.12.001 — full text (accepted-manuscript PDF via text2fa.ir), Tables 1–4, Sec. 3–4.
- Rezaei (2015), DOI 10.1016/j.omega.2014.11.009; Liang et al. (2020), DOI 10.1016/j.omega.2019.102175 — Crossref metadata only.
- pyDecision 5.1.1 `algorithm/bwm.py` (read).
