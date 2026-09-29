# CILOS — Criterion Impact LOSs (cilos)

- **Family:** weighting (objective)
- **Origin:** Idea from Mirkin, B.G. (1974), *Problema gruppovogo vybora* (The problem of group choice), Nauka, Moscow (Russian book; no DOI; not read — attribution as given in Zavadskas et al. 2017 ref. [80] and in DergiPark papers citing "Mirkin, 1974: 256"). Formalized as a weighting method in Zavadskas, E.K. & Podvezko, V. (2016). Integrated Determination of Objective CRIteria Weights in MCDM. *International Journal of Information Technology & Decision Making* 15(2), 267–283. DOI [10.1142/S0219622016500036](https://doi.org/10.1142/S0219622016500036) (Crossref verified; full text not read). The algorithm below is from the same authors' open-access paper Zavadskas et al. (2017), Sec. 5.1.2, Eqs. (5)–(8).
- **Popularity:** Crossref cited-by 330 for Zavadskas & Podvezko (2016) (2026-09-29). Niche: mostly used together with Entropy inside IDOCRIW.

## For users (site copy)
- **EN:** CILOS asks: if we pick the alternative that is best on criterion i, how much do we lose on every other criterion? A criterion whose "best choice" costs a lot elsewhere gets less weight; one that can be optimized with little loss gets more. It is the counterpart of Entropy and is often multiplied with it (IDOCRIW).
- **TR:** CILOS şunu sorar: i. kriterde en iyi alternatifi seçersek diğer her kriterde ne kadar kaybederiz? "En iyi seçimi" başka yerlerde çok kayba yol açan kriter daha az, az kayıpla optimize edilebilen kriter daha çok ağırlık alır. Entropinin tamamlayıcısıdır ve çoğu zaman onunla çarpılır (IDOCRIW).

## When to use / when not
- **Use when:** data are positive; you want to combine with Entropy (IDOCRIW) as in the Vilnius-school papers.
- **Do not use when:** a criterion is constant (a whole column of P is zero → the linear system is singular, noted by the authors themselves); many alternatives are best on several criteria at once (duplicate rows in A make the system ill-conditioned); data contain zeros in cost criteria (min/x).

## Inputs
- Decision matrix X (m × n), x_ij > 0.
- Criterion types `max`/`min`.
- No parameters. n ≥ 2.

## Algorithm
1. Turn cost criteria into benefit: $x_{ij} \leftarrow \dfrac{\min_i x_{ij}}{x_{ij}}$ for cost columns (Eq. 5); benefit columns unchanged.
2. Sum normalization: $\bar x_{ij} = x_{ij} / \sum_i x_{ij}$.
3. For each criterion j find the row $k_j$ with the maximum $\bar x_{k_j j}$. Build the square matrix $A$ ($n\times n$) whose row $i$ is row $k_i$ of $\bar X$, so $a_{ii} = \max_k \bar x_{ki}$.
4. Relative losses: $p_{ij} = \dfrac{a_{jj} - a_{ij}}{a_{jj}}$, $p_{ii} = 0$ — the loss on criterion j when criterion i is made best (Eq. 6).
5. $F = P$ with the diagonal replaced by $f_{jj} = -\sum_{i} p_{ij}$ (column sums, Eq. 8).
6. Solve $F q = 0$ with $\sum_j q_j = 1$ (homogeneous system, Eq. 7); weights $w = q$.

**Implementation of step 6.** Stack $[F;\ \mathbf 1^\top]$ and solve by least squares against $[0,\dots,0,1]$, or replace one equation of F by the normalization row and solve. Columns of F sum to zero, so F is singular by construction and a unique normalized solution exists when F has rank n − 1.

**Variants / deviations.**
- **pyDecision `cilos_method` deviates:** it divides benefit columns by their min and cost columns by their max (both are pure rescalings that step 2 cancels), so **cost criteria are never inverted**; and it adds uniform random noise (1e-2…1e-1) to constant columns, making results non-deterministic. Do not use it as oracle.
- IDOCRIW (Zavadskas & Podvezko 2016): $\omega_j = q_j W_j / \sum_k q_k W_k$ with $W$ = Entropy weights (Entropy variant (a), raw data). Not a separate card; can be added as a combination on the site.

## Commonly combined with
- CILOS × Entropy → IDOCRIW, then EDAS and other rankings: Zavadskas et al. (2017), DOI [10.3390/su9050702](https://doi.org/10.3390/su9050702).
- CILOS among five objective methods compared on one matrix (with Entropy, IDOCRIW, CRITIC, D-CRITIC): Krishnan et al. (2021), DOI [10.3390/sym13060973](https://doi.org/10.3390/sym13060973).
- Fuzzy extension FCILOS/FIDOCRIW: Podvezko, Zavadskas & Podviezko (2020), *Economic Computation and Economic Cybernetics Studies and Research* 54(2), DOI 10.24818/18423264/54.2.20.04 (DOI printed in the PDF; not checked on Crossref).

## Pitfalls
- **Constant column** → zero column in P → F rank-deficient; authors: "the linear system … makes no sense". Our choice: drop the column (weight 0) and warn, then solve for the rest.
- **Same alternative best on several criteria** → identical rows in A; the system can still be solvable but becomes sensitive. Show A to the user.
- **Ties for the maximum** in a column: which row is chosen changes A. Our choice: first occurrence (NumPy `argmax` behaviour), document it.
- **Zeros:** min/x fails if a cost value is 0; sum normalization fails for an all-zero column. Reject.
- **Negative solution components** can appear for ill-conditioned F; clip is not in the method — show an error instead.

## Reference example (test fixture)
- **Source:** Zavadskas, E.K., Cavallaro, F., Podvezko, V., Ubarte, I. & Kaklauskas, A. (2017). MCDM Assessment of a Healthy and Safe Built Environment According to Sustainable Development Principles: A Practical Neighborhood Approach in Vilnius. *Sustainability* 9(5), 702. DOI [10.3390/su9050702](https://doi.org/10.3390/su9050702). Input: Table 4 (21 neighbourhoods), social block (5 criteria). Output: Table 10, column "CILOS". Authors = the method's authors.
- **Label errors in the paper (found by recomputation):** the published CILOS and Entropy values are all reproduced to 4 decimals, but attached to the wrong criterion rows. In Table 10 the first two rows (educational institutions ↔ kindergarten places) are swapped; in Table 8 the rows follow the permutation [2, 4, 0, 1, 3]; in Table 12 the no2/distance rows are swapped **and** the Entropy and CILOS columns are exchanged. Table 12 also prints IDOCRIW for green spaces as 0.1606; recomputation gives 0.4606 (and the four printed IDOCRIW values only sum to 1 with 0.4606) — a typo. Fixture values below are **in Table-4 column order**, i.e. what the data give.

```json
{
  "id": "cilos-zavadskas2017-social",
  "source": "Zavadskas et al. 2017, Sustainability 9(5):702, Table 4 (input, social block), Table 10 CILOS (output; rows 1-2 swapped in paper)",
  "criteria": ["educational_institutions_per_1000", "kindergarten_places", "healthcare_institutions_per_1000", "recreational_facilities_per_1000", "crime_rate_per_1000"],
  "types": ["max", "max", "max", "max", "min"],
  "matrix_transposed_by_criterion": {
    "educational_institutions_per_1000": [0.4366, 0.2515, 0.3563, 0.2549, 0.3667, 0.2894, 0.5596, 0.1925, 0.5454, 0.3876, 0.1513, 0.1969, 0.2831, 0.9256, 0.2553, 0.1897, 0.2811, 0.5430, 0.2588, 0.5416, 0.2607],
    "kindergarten_places": [1630, 1567, 634, 1731, 1541, 2104, 1507, 1371, 1250, 318, 1679, 551, 513, 1015, 2067, 1787, 1009, 897, 1479, 1002, 746],
    "healthcare_institutions_per_1000": [0.4622, 0.1006, 0.0891, 0.1821, 0.1100, 0.0965, 0.3444, 0.1283, 0.0962, 0.2584, 0.1513, 0.1476, 0.1887, 0.4628, 0.0638, 0.3319, 0.4685, 0.0679, 0.2804, 0.2708, 0.0652],
    "recreational_facilities_per_1000": [0.0770, 0.1006, 0.5345, 0.1457, 0.1834, 0.0965, 0.3874, 0.2566, 0.1283, 0.3876, 0.0908, 0.3445, 0.0944, 0.8227, 0.1596, 0.0948, 0.0937, 0.4751, 0.2157, 0.7221, 0.3911],
    "crime_rate_per_1000": [5.6497, 6.2627, 5.7907, 4.843, 5.6105, 4.7395, 13.1284, 15.2385, 8.9562, 13.6951, 5.9595, 4.5276, 13.7775, 13.421, 5.9681, 5.9983, 11.1965, 6.7195, 5.9737, 7.2207, 13.9486]
  },
  "alternatives_order": ["Antakalnis", "Fabijoniškės", "Grigiškės", "Justiniškės", "Karoliniškės", "Lazdynai", "Naujamiestis", "Naujininkai", "Naujoji Vilnia", "Paneriai", "Pašilaičiai", "Pilaitė", "Rasos", "Senamiestis", "Šeškinė", "Verkiai", "Vilkpėdė", "Viršuliškės", "Žirmūnai", "Žvėrynas", "Šnipiškės"],
  "published_as_printed": {"cilos": [0.1924, 0.1277, 0.2993, 0.1180, 0.2626], "entropy": [0.1185, 0.1439, 0.2638, 0.3546, 0.1192]},
  "expected": {"weights": [0.1277, 0.1924, 0.2993, 0.1180, 0.2626], "entropy_variant_a": [0.1439, 0.1185, 0.2638, 0.3546, 0.1192], "tolerance": 1e-4}
}
```

- **Second case (same paper, economic block, Table 8):** criteria [housing price, population density, single-family density, blocks-of-flats density, jobs per 1000] with types as printed in Table 4: ["min", "min", "max", "min", "max"]; data are those in `entropy.md` fixture `entropy-zavadskas2017-economic`. Expected CILOS in Table-4 order: [0.3188, 0.1369, 0.2132, 0.1378, 0.1933] (printed: [0.2132, 0.1933, 0.3188, 0.1369, 0.1378]).
- **Recomputed** (`scratchpad/mcdm/agirlik/recompute_all.py`):
  - Social: numpy = [0.12770, 0.19241, 0.29933, 0.11797, 0.26259] → **MATCH** with the published values after swapping rows 1–2, max abs diff 3.4e-5 (against the rows as printed: MISMATCH, 0.065). Entropy of the same block also MATCH (3.6e-5) under the same swap — so the swap is in the table labels, not in one method.
  - Economic: **MATCH** under permutation [2, 4, 0, 1, 3] (4.7e-5). Environmental: **MATCH** under row swap + column swap (4.6e-5).
  - pyDecision `cilos_method` (social) = [0.0859, 0.2808, 0.2327, 0.0761, 0.3246] in Table-4 order → **MISMATCH** (max abs diff to ours 0.088), explained by the missing cost inversion.
  - Checked, unexplained: Krishnan et al. (2021) Table 5 "CILOS" [0.0738, 0.3864, 0.0997, 0.1467, 0.2934] is not reproduced by our CILOS ([0.0896, 0.2817, 0.1165, 0.2064, 0.3058]), by pyDecision, or by CILOS on min–max data. Their supplementary sheet (mdpi.com …/s1) was blocked (HTTP 403), so the cause is unknown.

## Implementation notes
- pyDecision: `cilos_method(dataset, criterion_type)` — deviates (see Variants); only usable as oracle when all criteria are benefit and no column is constant.
- TS: pick `argmax` with first-occurrence tie rule; solve the (n+1)×n least-squares system via QR, or Gaussian elimination after replacing the last row of F by ones.
- Return transformed X, X̄, A, P, F, q.

## Sources
- Zavadskas et al. (2017), DOI 10.3390/su9050702 — full PDF (talpykla.elaba.lt), Sec. 5.1.2, Tables 4, 8, 10, 12.
- Zavadskas & Podvezko (2016), DOI 10.1142/S0219622016500036 — Crossref metadata and RePEc abstract only.
- Krishnan et al. (2021), DOI 10.3390/sym13060973 — full text, Table 5.
- pyDecision 5.1.1 source `pyDecision/algorithm/cilos.py` (read).
