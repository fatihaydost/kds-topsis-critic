# Measurement of Alternatives and Ranking according to COmpromise Solution (MARCOS)

- **Family:** ranking (compensatory / utility — ratio to ideal and anti-ideal reference alternatives)
- **Origin:** Stević, Ž.; Pamučar, D.; Puška, A.; Chatterjee, P. (2020). Sustainable supplier selection in healthcare industries using a new MCDM method: Measurement of alternatives and ranking according to COmpromise solution (MARCOS). *Computers & Industrial Engineering* 140:106231, doi:10.1016/j.cie.2019.106231 (DOI/title/authors verified via Crossref; paywalled, full text **not opened**). Reference example taken from the open-access companion paper by the method's first author: Stević, Ž.; Brković, N. (2020). A Novel Integrated FUCOM-MARCOS Model for Evaluation of Human Resources in a Transport Company. *Logistics* 4(1):4, doi:10.3390/logistics4010004.
- **Popularity:** Newer method (2020) but fast-growing: Crossref "cited-by" count 1,235 for the CIE origin paper and 201 for the Logistics paper (api.crossref.org, checked 2026-09-29).

## For users (site copy)
- **EN:** MARCOS adds an ideal and an anti-ideal alternative to the table, scores every alternative against both, and combines the two into one utility value. It is simple to compute and explain, and gives the same order as a weighted sum with best-value normalization.
- **TR:** MARCOS tabloya ideal ve anti-ideal iki sanal alternatif ekler, her alternatifi ikisine göre puanlar ve bunları tek bir fayda değerinde birleştirir. Hesabı ve anlatımı basittir; en iyi değere göre normalize edilmiş ağırlıklı toplamla aynı sıralamayı verir.

## When to use / when not
- Use: when stakeholders like "distance to ideal / anti-ideal" wording but you want a transparent additive model.
- Avoid / warn: do not present it as giving different information than SAW: with AI/AAI taken from the data, $f(K^-)$ and $f(K^+)$ are the same constants for every alternative (Table 5 shows 0.320/0.680 in every row), so $f(K_i)$ is proportional to $S_i$ and the ranking equals the ranking by $S_i$ (a SAW with linear max/min normalization). Zero values in cost criteria break normalization (the paper replaces 0 damage by 0.001).

## Inputs
- Decision matrix `X` (m × n), strictly positive for cost criteria; types `benefit|cost`; weights `w` (sum to 1).
- Optional: user-defined AI/AAI values (origin allows defining them; default = column best/worst). No other parameters.

## Algorithm
1. Extended matrix with $AAI_j = \min_i x_{ij}$ (benefit) / $\max_i x_{ij}$ (cost) and $AI_j = \max_i x_{ij}$ (benefit) / $\min_i x_{ij}$ (cost).
2. Normalize (including AI, AAI rows): benefit $n_{ij} = x_{ij}/x_{ai,j}$; cost $n_{ij} = x_{ai,j}/x_{ij}$.
3. $v_{ij} = w_j n_{ij}$; $S_i = \sum_j v_{ij}$ (also $S_{aai}$, $S_{ai}$; $S_{ai} = 1$ when AI is the column best and $\sum w = 1$).
4. $K_i^- = S_i/S_{aai}$, $K_i^+ = S_i/S_{ai}$.
5. $f(K_i^-) = K_i^+/(K_i^+ + K_i^-)$, $f(K_i^+) = K_i^-/(K_i^+ + K_i^-)$.
6. $f(K_i) = \dfrac{K_i^+ + K_i^-}{1 + \frac{1 - f(K_i^+)}{f(K_i^+)} + \frac{1 - f(K_i^-)}{f(K_i^-)}}$; rank by decreasing $f(K_i)$.

Variants: fuzzy/grey/rough MARCOS; user-defined ideal. **We implement the crisp version with data-derived AI/AAI** (same as pyDecision `marcos_method`).

## Commonly combined with
- FUCOM → MARCOS (Stević & Brković 2020, this reference example).
- Many later papers by the same group pair MARCOS with FUCOM/BWM/LBWA/CRITIC — not verified individually here.

## Pitfalls
- **Equivalence to SAW ordering** (see above) — worth stating on the site so users don't double-count it as independent evidence.
- Cost criterion with 0 → division by zero (paper: substitute 0.001). Any "small epsilon" choice changes the scale of that column dramatically (0.001 vs 0.050 → 0.02 normalized).
- $S_{aai} = 0$ impossible with positive data; if all alternatives equal, $K^- = K^+ = 1$ everywhere (tie).
- Rank reversal when AI/AAI change with the alternative set; fixing AI/AAI externally avoids it.

## Reference example (test fixture)
- **Source:** Stević & Brković (2020), *Logistics* 4(1):4, doi:10.3390/logistics4010004 (DOI printed in the PDF). Table 2 (extended matrix), Tables 3–4, **Table 5** (S, K−, K+, f(K−), f(K+), f(K), rank). Weights: Figure 2 (FUCOM).
- **Inconsistency in the paper:** FUCOM (Table 1 order C1 > C2 > C4 > C3 > C5, Figure 2) gives w(C4) = 0.128, w(C3) = 0.096, but **Table 4 applies 0.128 to C3 and 0.096 to C4** (e.g. A1: C3 0.778 × 0.128 = 0.099, C4 1.000 × 0.096 = 0.096). Table 5 follows Table 4. The fixture uses the weights as applied in Table 4; with the Figure 2 weights the ranking changes (e.g. A1 12th → 11th, A13 11th → 15th).

```json
{
  "id": "marcos-stevic-brkovic-2020",
  "criteria": ["fuel consumption l/100km", "damage per km", "vehicle maintenance", "information timeliness", "loyalty"],
  "types": ["cost", "cost", "benefit", "benefit", "benefit"],
  "weights": [0.434, 0.255, 0.128, 0.096, 0.087],
  "weights_note": "as applied in Table 4; FUCOM Figure 2 gives [0.434, 0.255, 0.096, 0.128, 0.087]",
  "matrix": [
    [33.9, 0.001, 7, 9, 7], [30.0, 0.001, 9, 7, 7], [31.5, 0.001, 9, 7, 9], [33.0, 0.001, 7, 9, 9],
    [31.9, 0.001, 9, 7, 7], [31.1, 0.050, 7, 7, 9], [34.8, 0.001, 7, 7, 7], [25.8, 0.001, 7, 7, 7],
    [31.7, 0.001, 7, 7, 9], [35.7, 0.001, 7, 7, 7], [34.2, 0.001, 7, 7, 9], [29.6, 0.100, 7, 7, 7],
    [30.2, 0.001, 9, 5, 5], [34.3, 0.001, 7, 7, 9], [31.0, 0.001, 5, 7, 7], [34.5, 0.001, 7, 7, 7],
    [33.9, 0.001, 5, 7, 7], [33.1, 0.001, 9, 9, 9], [32.7, 0.001, 9, 9, 9], [35.0, 0.001, 9, 9, 7],
    [31.8, 0.001, 5, 7, 9], [31.0, 0.001, 9, 7, 7], [32.5, 0.001, 7, 7, 3]
  ],
  "expected": {
    "S_aai": 0.470, "S_ai": 1.000,
    "S": [0.849, 0.898, 0.900, 0.877, 0.876, 0.626, 0.819, 0.931, 0.869, 0.811, 0.844, 0.623, 0.856, 0.843, 0.830, 0.822, 0.799, 0.904, 0.908, 0.867, 0.840, 0.887, 0.803],
    "fK_minus": 0.320, "fK_plus": 0.680,
    "fK": [0.738, 0.781, 0.783, 0.763, 0.762, 0.544, 0.712, 0.809, 0.756, 0.705, 0.734, 0.541, 0.744, 0.733, 0.722, 0.714, 0.695, 0.786, 0.790, 0.754, 0.730, 0.771, 0.698],
    "ranking": [12, 5, 4, 7, 8, 22, 18, 1, 9, 19, 13, 23, 11, 14, 16, 17, 21, 3, 2, 10, 15, 6, 20],
    "tolerance": 0.001
  }
}
```

- **Published outputs:** as in JSON (Table 5, 3 dp); A8 ≻ A19 ≻ A18 ≻ A3 ≻ A2 …
- **Recomputed (numpy):** $S_{aai}$ = 0.4696, $S_{ai}$ = 1.0000, f(K−) = 0.3196, f(K+) = 0.6804 for every row; f(K) = 0.7378, 0.7813, 0.7827, 0.7624, 0.7620, 0.5446, 0.7118, 0.8094, 0.7560, 0.7048, 0.7335, 0.5415, 0.7438, 0.7327, 0.7214, 0.7143, 0.6945, 0.7863, 0.7899, 0.7535, 0.7303, 0.7708, 0.6980. **MATCH** at the paper's 3-dp precision: max abs diff 0.00057 (S), 0.00062 (f(K)) — slightly above 0.0005 because the paper chains rounded intermediates (0.470, 0.320); ranking identical 23/23. Ranking by f(K) equals ranking by S (verified).
- **pyDecision 5.1.1 `marcos_method`:** identical to ours (diff 0) → same verdict.

## Implementation notes
- pyDecision: `marcos_method(dataset, weights, criterion_type, graph, verbose)` → f(K).
- Return S, K−, K+, f(K−), f(K+), f(K). Consider showing a note "ordering identical to weighted sum of best-normalized values".
- Zero in cost column: reject with a message (do not silently substitute).

## Sources
- Stević & Brković 2020, Logistics 4(1):4, doi:10.3390/logistics4010004, PDF: https://mdpi-res.com/d_attachment/logistics/logistics-04-00004/article_deploy/logistics-04-00004.pdf (Tables 1–5, Figure 2).
- Stević et al. 2020, CIE 140:106231, doi:10.1016/j.cie.2019.106231 (origin; not opened).
- pyDecision 5.1.1, `pyDecision/algorithm/marcos.py`.
- Recompute script: `scratchpad/mcdm/siralama/scripts/moora_mabac_marcos_cocoso.py`.
