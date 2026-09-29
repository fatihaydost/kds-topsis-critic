# Multi-Attributive Border Approximation area Comparison (MABAC)

- **Family:** ranking (compensatory / distance — distance from a border approximation area)
- **Origin:** Pamučar, D.; Ćirović, G. (2015). The selection of transport and handling resources in logistics centers using Multi-Attributive Border Approximation area Comparison (MABAC). *Expert Systems with Applications* 42(6):3016–3028. doi:10.1016/j.eswa.2014.11.057 (DOI/title/authors verified via Crossref). **Paywalled; full text not accessible** — the reference example is therefore taken from an open-access application paper (below). The origin's input data (forklift problem, 7 alternatives × 10 criteria, DEMATEL weights) is available in the CRAN package `mabacR` (dataset `mabac_df`), but its published outputs could not be read, so it is **not** used as a fixture.
- **Popularity:** Crossref cited-by count 985 for the origin (checked 2026-09-29).

## For users (site copy)
- **EN:** MABAC builds a "border" value for each criterion (the geometric mean of all alternatives) and measures how far above or below that border every alternative lies. Alternatives with many criteria in the upper area and few in the lower area score highest. The score is positive for above-border and negative for below-border alternatives.
- **TR:** MABAC her kriter için bir "sınır" değeri kurar (tüm alternatiflerin geometrik ortalaması) ve her alternatifin bu sınırın ne kadar üstünde ya da altında kaldığını ölçer. Kriterlerinin çoğu üst bölgede olan alternatif en yüksek skoru alır. Skor sınırın üstündekiler için pozitif, altındakiler için negatiftir.

## When to use / when not
- Use: want a signed score (above/below a data-driven border) and stable behaviour under changes of measurement units (min–max normalization is affine-invariant).
- Avoid / warn: constant column → min–max undefined; border depends on all alternatives (rank reversal possible when adding/removing).

## Inputs
- Decision matrix `X` (m × n); types `benefit|cost`; weights `w` (sum to 1). No parameters.

## Algorithm
1. Min–max normalization: benefit $t_{ij} = (x_{ij} - x_j^-)/(x_j^+ - x_j^-)$; cost $t_{ij} = (x_{ij} - x_j^+)/(x_j^- - x_j^+)$, with $x_j^+ = \max_i x_{ij}$, $x_j^- = \min_i x_{ij}$.
2. Weighted matrix: $v_{ij} = w_j (t_{ij} + 1)$.
3. Border approximation area: $g_j = \left(\prod_{i=1}^{m} v_{ij}\right)^{1/m}$.
4. Distance matrix: $q_{ij} = v_{ij} - g_j$ (upper area if > 0, lower if < 0).
5. $S_i = \sum_j q_{ij}$; rank by decreasing $S_i$.

Variants: rough/fuzzy/neutrosophic MABAC (later papers). **We implement the crisp version** as restated in Biswas & Das (2018), Eqs. 7–12 (consistent with pyDecision except for weights — see below).

## Commonly combined with
- DEMATEL → MABAC (Pamučar & Ćirović 2015, origin; per abstract).
- Entropy → MABAC (Biswas & Das 2018, the reference example).
- The origin compares MABAC with SAW, COPRAS, TOPSIS, MOORA and VIKOR (abstract).

## Pitfalls
- Constant column: $x^+ = x^-$ → division by zero; set $t = 0$ (pyDecision does this) — then $v = w$ for all and $q = 0$.
- $v_{ij} \ge w_j > 0$, so the geometric mean is always defined (the +1 shift exists for this reason); a zero weight makes the column vanish (fine).
- Rank reversal when the alternative set changes (min/max and g move).
- pyDecision's `mabac_method` has **no weights argument** (see implementation notes).

## Reference example (test fixture)
- **Source:** Biswas, T.K.; Das, M.C. (2018). Selection of hybrid vehicle for green environment using multi-attributive border approximation area comparison method. *Management Science Letters* 8:121–130. doi:10.5267/j.msl.2017.11.004 (DOI printed in the PDF; CC-BY open access). **Table 2** (9 HEVs × 5 criteria), **Tables 3–7** (N, V, G, Q, S_i, rank).
- **Weights:** the paper gives them in a pie chart (Fig. 1); the text states the extremes (0.1406 fuel economy, 0.3342 price). The other three are read off Table 4 where $t_{ij} = 0$ (then $v_{ij} = w_j$): C2 = 0.1671 (HEV3), C3 = 0.183 (HEV4), C4 = 0.1751 (HEV3). Sum = 1.0000. Criterion directions follow Table 3 (C1, C2, C4 benefit; C3 emissions, C5 price cost).

```json
{
  "id": "mabac-biswas-das-2018",
  "alternatives": ["HEV1", "HEV2", "HEV3", "HEV4", "HEV5", "HEV6", "HEV7", "HEV8", "HEV9"],
  "criteria": ["fuel economy MPG", "tank size gal", "emissions t/yr", "passenger volume ft3", "base price k$"],
  "types": ["benefit", "benefit", "cost", "benefit", "cost"],
  "weights": [0.1406, 0.1671, 0.183, 0.1751, 0.3342],
  "matrix": [
    [39, 13.5, 3.1, 100, 24], [48, 11, 4.5, 103, 29.6], [36, 10.6, 4.3, 49.1, 20.295],
    [30, 17.8, 5.1, 100, 50], [42, 11.9, 3.5, 86, 31], [40, 17.2, 3.6, 101, 26],
    [56, 11.9, 2.8, 96, 25], [44, 11.9, 3.3, 94, 31.12], [46, 13, 3.2, 95, 28.756]
  ],
  "expected": {
    "G": [0.203764178, 0.221141521, 0.287306161, 0.307462238, 0.555521737],
    "S": [0.157778583, -0.01622203, -0.14489751, -0.24274166, -0.0191927, 0.190021847, 0.212200519, 0.032174523, 0.106320697],
    "ranking": [3, 6, 8, 9, 7, 2, 1, 5, 4],
    "tolerance": 0.000005
  }
}
```

- **Published outputs:** Table 5 G and Table 7 S as in JSON; HEV7 ≻ HEV6 ≻ HEV1 ≻ HEV9 ≻ HEV8 ≻ HEV2 ≻ HEV5 ≻ HEV3 ≻ HEV4.
- **Recomputed (numpy):** G = 0.203764, 0.221142, 0.287306, 0.307462, 0.555522; S = 0.157779, −0.016222, −0.144898, −0.242742, −0.019193, 0.190022, 0.212201, 0.032175, 0.106321. **MATCH** (max abs diff < 1e-6 on G, Q and S; paper prints 9 digits).
- **pyDecision 5.1.1 `mabac_method`:** **MISMATCH** (max abs diff 0.152): it uses $v_{ij} = \frac{1}{m}(t_{ij} + 1)$ — i.e. ignores criterion weights and uses 1/(number of alternatives). Workaround that reproduces the paper exactly (diff < 1e-6): run it per column and rescale, $S_i = \sum_j m\,w_j\,S^{py}_i(X_{\cdot j})$.

## Implementation notes
- pyDecision: `mabac_method(dataset, criterion_type, graph, verbose)` — no weights (bug/variant, see above).
- Return N, V, G, Q and S; the site can colour Q cells by sign (upper vs lower area).
- Guard constant columns ($t = 0$).
- If the origin paper becomes readable, add its forklift example (input in `mabacR::mabac_df`) as a second fixture.

## Sources
- Biswas & Das 2018, Management Science Letters 8:121–130, doi:10.5267/j.msl.2017.11.004, PDF: https://pdfs.semanticscholar.org/fd88/d941691858669a0b2ee93e89a871a99b5640.pdf (Eqs. 7–12, Tables 2–7).
- Pamučar & Ćirović 2015, ESWA 42(6):3016–3028, doi:10.1016/j.eswa.2014.11.057 (origin; abstract only).
- CRAN `mabacR` 0.1.0, dataset `mabac_df` (origin input data).
- pyDecision 5.1.1, `pyDecision/algorithm/mabac.py`.
- Recompute script: `scratchpad/mcdm/siralama/scripts/moora_mabac_marcos_cocoso.py`.
