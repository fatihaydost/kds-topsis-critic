# Simple Additive Weighting / Weighted Sum Model (SAW / WSM)

- **Family:** ranking (compensatory / utility — additive value model)
- **Origin:** Classical; usually traced to Churchman & Ackoff (1954), "An approximate measure of value", *Operations Research* 2:172–180, and MacCrimmon (1968, RAND RM-4823-ARPA); textbook statement in Hwang & Yoon (1981). **None opened, no DOI checked** (details as given in the reference lists of Brauers et al. 2008 and other papers). Formulas and example from Podvezko (2011), doi:10.5755/j01.ee.22.2.310.
- **Popularity:** Podvezko (2011): "SAW (Simple Additive Weighting) is the oldest, most widely known and practically used method". Used as a baseline in EDAS (2015), MABAC (2015) and many others. No citation count (no single origin paper).

## For users (site copy)
- **EN:** SAW turns every criterion into a 0–1 "the higher the better" score, multiplies by the criterion weight and adds everything up. It is the most transparent method: each point of the final score can be traced to a criterion. Choose it when trade-offs are genuinely linear.
- **TR:** SAW her kriteri 0–1 arası "ne kadar yüksekse o kadar iyi" skora çevirir, kriter ağırlığıyla çarpar ve hepsini toplar. En şeffaf yöntemdir: nihai skordaki her puan bir kritere kadar izlenebilir. Ödünleşimler gerçekten doğrusal ise tercih edin.

## When to use / when not
- Use: baseline, explanations, sanity checks; data on ratio scales.
- Avoid / warn: full compensation (a terrible value can be offset); result depends on the normalization chosen (max, sum, min–max give different scores and sometimes different ranks — see EDAS Table 7 check below); rank reversal on adding alternatives.

## Inputs
- Decision matrix `X` (m × n), positive values; types `benefit|cost`; weights `w` (sum to 1).
- Option `normalization`: **`linear-max` (default)** — benefit $x/\max x$, cost $\min x / x$ (Podvezko 2011 Eqs. 2–3; Zavadskas et al. 2012 WSM Eqs. 2–3; pyDecision `saw_method`) | `sum` — cost converted by $\min x/x$ then $x/\sum x$ (Podvezko 2011 Eq. 6) | `min-max`.

## Algorithm
1. Normalize: benefit $r_{ij} = x_{ij}/\max_i x_{ij}$; cost $r_{ij} = \min_i x_{ij} / x_{ij}$.
2. $S_i = \sum_j w_j r_{ij}$; rank by decreasing $S_i$.
3. (Optional) relative score $\tilde S_i = S_i / \sum_i S_i$ (Podvezko 2011 Eq. 5).

## Commonly combined with
- Any weighting method (AHP, Entropy, CRITIC); SAW is the λ = 1 limit of WASPAS and the benefit-only special case of COPRAS (sum normalization).
- Used as the comparison baseline in EDAS (Keshavarz Ghorabaee et al. 2015) and MABAC (Pamučar & Ćirović 2015, abstract).

## Pitfalls
- Zero in a cost criterion → division by zero; negative values need shifting (Podvezko Eq. 4 suggests $r + |\min r| + 1$ — changes results).
- Normalization choice changes ranks (verified: with the EDAS Table 5 data, `sum` normalization gives different ranks than `linear-max` in 3 of 7 weight sets; the paper's SAW ranks match `linear-max` 7/7).
- MARCOS with data-derived ideal points produces exactly the same ordering as `linear-max` SAW (see `marcos.md`).

## Reference example (test fixture)
- **Source:** Podvezko, V. (2011). The Comparative Analysis of MCDA Methods SAW and COPRAS. *Inžinerinė ekonomika – Engineering Economics* 22(2):134–146. doi:10.5755/j01.ee.22.2.310 (DOI printed in the PDF; open access). **Table 1** (4 countries × 5 criteria), **Table 2** (transformed values, weights), **Table 3** (SAW S), **Tables 5–6** (sum-normalized variant).
- **Typo in Table 2 (found by recomputation):** Lithuania, "Average annual salary": 306/501 = **0.611**, printed **0.599**; Table 3's S(Lithuania) = 0.872 was computed with 0.599 (with 0.611 it is 0.874). Table 5 (sum normalization) uses 306 correctly (0.199), so Table 1 is right and Table 2 is the typo.

```json
{
  "id": "saw-podvezko-2011",
  "alternatives": ["Estonia", "Latvia", "Lithuania", "Poland"],
  "criteria": ["GDP growth %", "production growth %", "average salary EUR", "unemployment %", "export/import"],
  "types": ["benefit", "benefit", "benefit", "cost", "benefit"],
  "weights": [0.35, 0.10, 0.17, 0.25, 0.13],
  "matrix": [
    [5.1, 9.8, 430, 9.3, 0.70],
    [7.5, 6.5, 298, 10.3, 0.55],
    [9.7, 16.1, 306, 11.6, 0.73],
    [3.8, 8.4, 501, 19.3, 0.79]
  ],
  "expected_published": { "S": [0.756, 0.728, 0.872, 0.610], "ranking": [2, 3, 1, 4] },
  "expected_corrected": { "S": [0.7560, 0.7283, 0.8744, 0.6098], "ranking": [2, 3, 1, 4], "tolerance": 0.0005 },
  "expected_sum_normalization_table6": { "S": [0.251, 0.246, 0.301, 0.202], "tolerance": 0.0005 }
}
```

- **Published outputs:** Table 3 S = 0.756, 0.728, 0.872, 0.610 (Lithuania ≻ Estonia ≻ Latvia ≻ Poland); Table 6 (sum normalization) 0.251, 0.246, 0.301, 0.202.
- **Recomputed (numpy):** linear-max S = 0.7560, 0.7283, 0.8744, 0.6098 → **MISMATCH** vs Table 3 (max abs diff 0.0024, Lithuania only), fully explained by the Table 2 typo; ranking identical. Sum-normalized S → **MATCH** (max abs diff 0.0004).
- **Secondary (ranks, 7 weight sets):** Keshavarz Ghorabaee et al. (2015), doi:10.15388/Informatica.2015.57, Tables 5–7 (JSON in `edas.md`): linear-max SAW ranks equal the published SAW ranks in **7/7 sets (MATCH)**.
- **Secondary (values):** WASPAS paper (Zavadskas et al. 2012, Table 2, λ = 1 column = WSM): 0.6120, 0.8292, 0.6972, 0.8520 — ours 0.6121, 0.8288, 0.6975, 0.8516 **MATCH** (with the a1-x̄5 typo fix, see `waspas.md`).
- **pyDecision 5.1.1 `saw_method`:** identical to ours (linear-max; diff 0) → same verdict.

## Implementation notes
- pyDecision: `saw_method(dataset, criterion_type, weights, graph, verbose)` — linear-max normalization; returns `[alt, score]` rows.
- Expose the normalization option (default `linear-max`); tests: Podvezko corrected + Table 6 sum variant + EDAS Table 7 ranks.

## Sources
- Podvezko 2011, Engineering Economics 22(2):134–146, doi:10.5755/j01.ee.22.2.310, PDF: https://inzeko.ktu.lt/index.php/EE/article/download/310/19875 (Eqs. 1–6; Tables 1–6).
- Keshavarz Ghorabaee et al. 2015, Informatica 26(3):435–451, doi:10.15388/Informatica.2015.57 (Tables 5–7).
- Zavadskas et al. 2012, doi:10.5755/j01.eee.122.6.1810 (WSM, Table 2).
- pyDecision 5.1.1, `pyDecision/algorithm/saw.py`.
- Recompute script: `scratchpad/mcdm/siralama/scripts/saw_copras.py`.
