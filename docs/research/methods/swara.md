# SWARA — Step-wise Weight Assessment Ratio Analysis (swara)

- **Family:** weighting (subjective)
- **Origin:** Keršulienė, V., Zavadskas, E.K. & Turskis, Z. (2010). Selection of rational dispute resolution method by applying new step-wise weight assessment ratio analysis (SWARA). *Journal of Business Economics and Management* 11(2), 243–258. DOI [10.3846/jbem.2010.12](https://doi.org/10.3846/jbem.2010.12) (open access; read in full).
- **Popularity:** Crossref cited-by 1,356 (2026-09-29). Used with Entropy in Torkashvand et al. (2020), listed in Keshavarz-Ghorabaee et al. (2021) Table 1.

## For users (site copy)
- **EN:** In SWARA you first sort the criteria from most to least important. Then, going down the list, you say how much less important each criterion is than the one just above it (for example 0.15 = "15% less important"). The method chains these steps into weights. Pick it when experts find ranking plus "a bit / much less important" easier than full pairwise comparisons.
- **TR:** SWARA'da önce kriterleri en önemliden en önemsize sıralarsınız. Sonra listede aşağı inerken her kriterin hemen üstündekinden ne kadar daha az önemli olduğunu söylersiniz (örneğin 0,15 = "%15 daha az önemli"). Yöntem bu adımları zincirleyerek ağırlıklara çevirir. Uzmanlar tam ikili karşılaştırma yerine sıralama ve "biraz / çok daha az önemli" demeyi daha kolay buluyorsa seçin.

## When to use / when not
- **Use when:** experts can agree on a ranking and on step sizes; you want n − 1 judgements only; no consistency check is needed (SWARA is consistent by construction).
- **Do not use when:** the ranking itself is disputed (SWARA takes it as given); you need a consistency indicator (use AHP/BWM).

## Inputs
- Criteria sorted by decreasing importance (rank 1 first).
- Comparative importance $s_j \ge 0$ for j = 2..n: how much criterion j−1 is more important than criterion j, as a ratio (0.15 = 15%). Typically averaged over experts ("comparative importance of average value" in the paper). $s_1$ is not used.
- Output: weights in the sorted order; map back to the original criterion order.

## Algorithm
Notation as in the origin paper's Table 1 (the paper calls the unnormalized weight $w_j$ and the final weight $q_j$; later papers usually swap the letters — we use $q$ for the unnormalized one to avoid confusion with other cards):
1. $k_1 = 1$; $k_j = s_j + 1$ for $j \ge 2$.
2. $q_1 = 1$; $q_j = q_{j-1} / k_j$ for $j \ge 2$ (the paper's "recalculated weight", $w_j = x_{j-1}/k_j$).
3. $w_j = q_j / \sum_k q_k$.

**Variants.** Only the origin form is implemented (later modifications exist in the literature but were not reviewed for this card). Group SWARA: average s_j across experts before step 1 (as the origin paper does). pyDecision v5.1.1 has **no SWARA** function.

## Commonly combined with
- SWARA with Entropy (combined subjective–objective weights), groundwater vulnerability: Torkashvand et al. (2020), as listed in Keshavarz-Ghorabaee et al. (2021) Table 1, DOI [10.3390/sym13040525](https://doi.org/10.3390/sym13040525).
- SWARA → SAW-type evaluation of dispute resolution methods: origin paper (Keršulienė et al. 2010).

## Pitfalls
- **Order matters:** the same s values in a different order give different weights. The UI must enforce sorting first.
- **s_j = 0** means "equally important as the previous one" → same weight; allowed.
- **Negative s_j** would make a lower-ranked criterion more important than the one above it → contradicts the ranking; reject.
- **Large s_j** (e.g., 1 = "twice as important") compound quickly; show q_j.
- **Rounding in the source:** the paper prints only 2 decimals, so tests on this fixture must use a 0.005 tolerance.

## Reference example (test fixture)
- **Source:** Keršulienė, Zavadskas & Turskis (2010), JBEM 11(2):243–258, DOI 10.3846/jbem.2010.12, Table 1 ("Attributes describing resolution methods and their parameters"): s_j, k_j, recalculated weight, final weight; the same weights are stated in the text of Sec. 4.

```json
{
  "id": "swara-kersuliene2010",
  "source": "Kersuliene, Zavadskas & Turskis 2010, JBEM 11(2):243-258, Table 1",
  "criteria_sorted": ["expedition_of_dispute_resolution", "price_of_dispute_resolution", "possibility_to_appeal", "confidentiality", "authority_of_person_solving", "legal_advice"],
  "s": [null, 0.15, 0.04, 0.29, 0.02, 0.04],
  "expected": {
    "k": [1, 1.15, 1.04, 1.29, 1.02, 1.04],
    "q_recalculated": [1, 0.87, 0.84, 0.65, 0.64, 0.61],
    "weights": [0.22, 0.19, 0.18, 0.14, 0.14, 0.13],
    "tolerance": 5e-3
  }
}
```

- **Recomputed** (`scratchpad/mcdm/agirlik/recompute_all.py`): q = [1, 0.8696, 0.8361, 0.6482, 0.6354, 0.6110], w = [0.21738, 0.18902, 0.18175, 0.14089, 0.13813, 0.13282] → **MATCH** at the published 2-decimal precision (max abs diff 2.8e-3 for w, 4.6e-3 for q). pyDecision: **not run** (no SWARA in v5.1.1). No typo found; note only the letter swap (w/q) described above.

## Implementation notes
- UI: step 1 drag-to-sort; step 2 one numeric input per adjacent pair ("how much less important than the one above?", default 0).
- Return k, q, w in sorted order and the mapping back to input order.

## Sources
- Keršulienė et al. (2010), DOI 10.3846/jbem.2010.12 — full PDF (journals.vilniustech.lt), Fig. 2, Table 1, Sec. 3–4.
- Keshavarz-Ghorabaee et al. (2021), DOI 10.3390/sym13040525, Table 1.
