# Entropy weighting (Shannon) (entropy)

- **Family:** weighting (objective)
- **Origin:** Shannon, C.E. (1948). A Mathematical Theory of Communication. *Bell System Technical Journal* 27(3), 379–423. DOI [10.1002/j.1538-7305.1948.tb01338.x](https://doi.org/10.1002/j.1538-7305.1948.tb01338.x) (information measure). Use as an MCDM weighting method is usually credited to Zeleny (1982, *Multiple Criteria Decision Making*, McGraw-Hill; no DOI) and Hwang, C.-L. & Yoon, K. (1981), *Multiple Attribute Decision Making*, Springer LNEMS 186, DOI [10.1007/978-3-642-48318-9](https://doi.org/10.1007/978-3-642-48318-9). Both books not read; the algorithm is taken from the open-access restatements listed in Sources.
- **Popularity:** Crossref cited-by 6,998 for Hwang & Yoon (1981) (2026-09-29). In the 30-study review table of Keshavarz-Ghorabaee et al. (2021, Symmetry 13:525, Table 1; 2020–2021) Entropy is used in 12 studies (CRITIC 13, SD 8).

## For users (site copy)
- **EN:** Entropy weighting treats each criterion as a source of information: if all alternatives score almost the same on a criterion, that criterion cannot tell them apart and gets little weight; if scores are spread unevenly, it gets more. It only looks at the data, not at what the criterion means. Pick it for a quick, fully objective weighting of a filled decision matrix.
- **TR:** Entropi ağırlıklandırması her kriteri bir bilgi kaynağı gibi görür: tüm alternatifler bir kriterde hemen hemen aynı puanı alıyorsa o kriter onları ayırt edemez ve az ağırlık alır; puanlar dengesiz dağılıyorsa daha çok ağırlık alır. Yalnız veriye bakar, kriterin anlamına bakmaz. Dolu bir karar matrisi için hızlı ve tamamen nesnel bir ağırlık istediğinizde seçin.

## When to use / when not
- **Use when:** you have positive, ratio-scale data (counts, prices, rates) and want dispersion-based weights; as a baseline next to CRITIC/SD/MEREC.
- **Do not use when:** data contain negatives or zeros you cannot shift sensibly; the matrix is very homogeneous (weights become near-random because 1 − e_j are tiny, see Pitfalls); the importance of criteria is known from the decision context.

## Inputs
- Decision matrix X (m × n). Default variant needs x_ij ≥ 0 and each column sum > 0.
- Criterion types are **not used** by the default variant (a): it measures dispersion only, direction does not enter. Variant (b) uses them (cost inversion inside min–max).
- Parameter `normalization` ∈ {`sum` (default), `minmax`}; see Variants.

## Algorithm
1. Proportions: $p_{ij} = x_{ij} / \sum_{i=1}^{m} x_{ij}$.
2. Entropy: $e_j = -\dfrac{1}{\ln m}\sum_{i=1}^{m} p_{ij}\ln p_{ij}$, with $0\cdot\ln 0 := 0$; $0 \le e_j \le 1$.
3. Degree of diversification: $d_j = 1 - e_j$.
4. Weights: $w_j = d_j / \sum_k d_k$.

**Variants (normalization before step 1).** The literature does not agree on what p_ij is computed from:
- **(a) `sum` on raw data** — p = x/Σx, criterion type ignored. This is the form used by Zavadskas & Podvezko's group (reproduced below, Zavadskas et al. 2017) and by Hwang & Yoon. **Default.**
- **(b) `minmax` first** — r by min–max with cost inversion, then p = r/Σr (Mukhametzyanov 2021 Eqs. 1–3; Krishnan et al. 2021 Table 5). Handles negatives and cost criteria, but the worst alternative always gets r = 0.
- **(c) WASPAS-type** x/max (benefit), min/x (cost), then p (Keshavarz-Ghorabaee et al. 2021, comparative analysis). Not offered.
- **(d) pyDecision** `entropy_method`: benefit p = x/Σx, cost p = (1/x)/Σ(1/x), plus 1e-9 guards. Equivalent to (c) up to scaling; **differs from (a) and (b)** (see Recomputed). Not our default.
We implement (a) as default and (b) as an option, and label the option in the UI.

## Commonly combined with
- Entropy → EDAS: Yazdani et al., renewable energy evaluation, as reviewed in Keshavarz-Ghorabaee et al. (2021) Sec. 2, DOI [10.3390/sym13040525](https://doi.org/10.3390/sym13040525).
- Entropy → MOORA / SAW (air-conditioner selection) with CRITIC as the alternative weighting: "Comparative Analysis of Objective Techniques for Criteria Weighing in Two MCDM Methods on Example of an Air Conditioner Selection", *Tehnika* 2017 no. 3, p. 422 ff., https://scindeks-clanci.ceon.rs/data/pdf/0040-2176/2017/0040-21761703422V.pdf (authors and DOI not checked; seen only in a search snippet).
- Entropy × CILOS → IDOCRIW, then EDAS/SAW: Zavadskas et al. (2017), DOI [10.3390/su9050702](https://doi.org/10.3390/su9050702).

## Pitfalls
- **Zeros:** 0·ln 0 is defined as 0; a column of all zeros has Σx = 0 → undefined; reject.
- **Negatives:** variant (a) is invalid with negative values (p < 0). Either reject, or switch to (b), or shift (x − min + ε) — shifting changes the weights; say so in the UI.
- **Constant column:** p = 1/m for all i → e = 1 → d = 0 → weight 0 (correct and expected).
- **All columns constant:** Σd = 0 → fall back to equal weights with warning.
- **Homogeneous data amplify noise:** when all e_j ≈ 1, tiny differences in d_j decide the weights (e.g., the *Tehnika* 2017 air-conditioner study, Table 4: e_j = 0.991…0.999 give weights 0.024…0.378, a 16× spread from differences in the third decimal). Show d_j next to w_j.
- **Variant choice changes results a lot:** on the Krishnan et al. (2021) matrix, variant (b) gives w1 = 0.348, pyDecision gives 0.443; on Zavadskas et al. (2017) data (a) vs pyDecision differ by up to 0.2 per weight.
- **Scale invariance:** (a) is invariant to multiplying a column by a constant but **not** to adding one (°C vs K give different weights).
- **m = 1:** ln m = 0 → undefined; require m ≥ 2.

## Reference example (test fixture)
- **Source A (default variant (a), raw data):** Zavadskas, E.K., Cavallaro, F., Podvezko, V., Ubarte, I. & Kaklauskas, A. (2017). MCDM Assessment of a Healthy and Safe Built Environment According to Sustainable Development Principles: A Practical Neighborhood Approach in Vilnius. *Sustainability* 9(5), 702. DOI [10.3390/su9050702](https://doi.org/10.3390/su9050702). Input: Table 4 (21 neighbourhoods; economic criteria). Output: Table 8, column "Entropy".
  - **Label error in the paper:** the five published values match our recomputation exactly, but assigned to the wrong rows. Published row k equals our column perm[k] with perm = [2, 4, 0, 1, 3] (e.g., the paper labels 0.0308 as "Density of single-family houses"; from the data it belongs to "Housing prices", whose values are the most homogeneous). The same happens in Tables 10 and 12 (Table 12 even swaps the Entropy and CILOS columns). The fixture below lists expected weights **in Table-4 column order**, i.e. what the data give.
- **Source B (option (b), min–max):** Krishnan et al. (2021), *Symmetry* 13(6), 973, DOI [10.3390/sym13060973](https://doi.org/10.3390/sym13060973), Table 1 input, Table 5 column "Entropy". Labels consistent.

```json
{
  "id": "entropy-zavadskas2017-economic",
  "variant": "sum (raw data, types ignored)",
  "source": "Zavadskas et al. 2017, Sustainability 9(5):702, Table 4 (input, economic block), Table 8 Entropy (output, rows permuted in paper)",
  "criteria": ["housing_price", "population_density", "single_family_density", "blocks_of_flats_density", "jobs_per_1000"],
  "types": ["min", "min", "max", "min", "max"],
  "matrix_transposed_by_criterion": {
    "housing_price": [1888.34, 1154.10, 676.10, 1080.61, 1222.06, 1190.30, 1711.44, 967.13, 854.64, 950.14, 1136.80, 1243.52, 1601.00, 2221.89, 1055.02, 1481.19, 1205.37, 1175.03, 1582.93, 2153.47, 1612.65],
    "population_density": [504.40, 9697.32, 1580.99, 9215.44, 6817.50, 3019.13, 4840.00, 758.42, 793.16, 91.12, 4031.22, 1472.46, 834.41, 4321.56, 7121.14, 757.93, 2072.43, 5893.20, 5455.29, 4103.33, 4917.31],
    "single_family_density": [44.62, 106.59, 76.90, 39.26, 11.50, 54.66, 116.04, 40.54, 89.03, 19.11, 74.88, 48.84, 97.48, 186.22, 55.00, 70.87, 38.54, 22.80, 23.18, 256.30, 188.78],
    "blocks_of_flats_density": [3.60, 42.20, 14.79, 86.58, 12.75, 14.17, 33.54, 6.18, 8.22, 1.04, 13.29, 7.68, 9.37, 40.67, 41.36, 5.03, 11.55, 31.60, 27.65, 72.59, 56.09],
    "jobs_per_1000": [18.20, 9.30, 2.00, 4.60, 7.20, 7.20, 94.60, 21.50, 11.00, 41.70, 10.70, 6.00, 7.70, 49.20, 9.20, 22.30, 9.50, 7.30, 37.90, 10.40, 21.50]
  },
  "alternatives_order": ["Antakalnis", "Fabijoniškės", "Grigiškės", "Justiniškės", "Karoliniškės", "Lazdynai", "Naujamiestis", "Naujininkai", "Naujoji Vilnia", "Paneriai", "Pašilaičiai", "Pilaitė", "Rasos", "Senamiestis", "Šeškinė", "Verkiai", "Vilkpėdė", "Viršuliškės", "Žirmūnai", "Žvėrynas", "Šnipiškės"],
  "published_as_printed": {"rows": ["housing_price", "population_density", "single_family_density", "blocks_of_flats_density", "jobs_per_1000"], "weights": [0.1879, 0.2970, 0.0308, 0.2196, 0.2648]},
  "expected": {"weights": [0.0308, 0.2196, 0.1879, 0.2648, 0.2970], "tolerance": 1e-4}
}
```

```json
{
  "id": "entropy-krishnan2021-minmax",
  "variant": "minmax (cost inverted) then p = r / sum r",
  "source": "Krishnan et al. 2021, Symmetry 13(6):973, Table 1 (input), Table 5 Entropy (output)",
  "types": ["min", "max", "max", "min", "min"],
  "matrix": [[649, 4.7, 326, 7.1, 143], [749, 5.5, 401, 7.3, 192], [740, 5.7, 520, 7.6, 171], [400, 5.7, 520, 11.1, 179], [600, 5.5, 538, 8.9, 152]],
  "expected": {"weights": [0.3481, 0.1360, 0.1690, 0.1463, 0.2006], "tolerance": 5e-5}
}
```

- **Recomputed** (`scratchpad/mcdm/agirlik/recompute_all.py`):
  - A: numpy (a) = [0.03076, 0.21956, 0.18785, 0.26480, 0.29703]; against the published numbers after undoing the row permutation → **MATCH**, max abs diff 4.6e-5. Against the rows as printed → MISMATCH (label error in paper, explained above). pyDecision (1/x for cost) = [0.0172, 0.4181, 0.1063, 0.2903, 0.1681] → **MISMATCH** (different variant, max abs diff 0.198).
  - B: numpy (b) = [0.34814, 0.13603, 0.16897, 0.14626, 0.20060] → **MATCH**, max abs diff 4.5e-5. pyDecision = [0.4429, 0.0356, 0.2524, 0.1835, 0.0856] → MISMATCH (variant d).
  - Also reproduced (not fixtures): Mukhametzyanov (2021) Table 2 DM-1 entropy (variant b) [0.146, 0.228, 0.211, 0.223, 0.191] → MATCH at 3 d.p. (max 4.6e-4); Keshavarz-Ghorabaee et al. (2021) Table 6 Entropy (variant c) → MATCH at 3 d.p. (max 3.8e-4).

## Implementation notes
- pyDecision: `entropy_method(dataset, criterion_type)` = variant (d). Do not use it as oracle for our default.
- TS: compute in float64; use `p > 0 ? p*Math.log(p) : 0`. Reject negatives in variant (a) with a message offering variant (b).
- Return p, e, d for the step view.

## Sources
- Zavadskas et al. (2017), DOI 10.3390/su9050702 — full PDF (Vilnius Tech repository elaba.lt), Tables 4, 8, 10, 12.
- Krishnan et al. (2021), DOI 10.3390/sym13060973 — full text (mdpi.com).
- Mukhametzyanov (2021), DOI 10.31181/dmame210402076i — full PDF.
- Keshavarz-Ghorabaee et al. (2021), DOI 10.3390/sym13040525 — full PDF.
- Shannon (1948); Hwang & Yoon (1981) — Crossref metadata only.
