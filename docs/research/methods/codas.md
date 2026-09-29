# COmbinative Distance-based ASsessment (CODAS)

- **Family:** ranking (compensatory / distance — Euclidean + Taxicab distance from the negative-ideal point)
- **Origin:** Keshavarz Ghorabaee, M.; Zavadskas, E.K.; Turskis, Z.; Antucheviciene, J. (2016). A new combinative distance-based assessment (CODAS) method for multi-criteria decision-making. *Economic Computation and Economic Cybernetics Studies and Research* 50(3):25–44. **No DOI found** (none printed in the PDF; RePEc handle `RePEc:cys:ecocyb:v:50:y:2016:i:3:p:25-44`). Open access PDF.
- **Popularity:** ~505 citations in Exa's scholarly index; 51 citations in EconPapers/CitEc (both checked 2026-09-29).

## For users (site copy)
- **EN:** CODAS measures how far each alternative is from the worst possible point, mainly by straight-line (Euclidean) distance, and uses city-block (Taxicab) distance as a second measure. Each alternative is compared with every other one; the one that beats the others by the largest total margin wins.
- **TR:** CODAS her alternatifin olası en kötü noktadan ne kadar uzak olduğunu ölçer; ana ölçü düz (Öklid) uzaklık, ikinci ölçü şehir-bloğu (Taxicab) uzaklığıdır. Her alternatif diğerleriyle tek tek karşılaştırılır; toplamda diğerlerini en büyük farkla geçen kazanır.

## When to use / when not
- Use: benefit/cost data, want pairwise-comparison-style aggregation with two distance notions.
- Avoid / warn: results depend on the threshold τ and the (documented below) ambiguity of the ψ function; zero values in cost criteria (min/x normalization) break it.

## Inputs
- Decision matrix `X` (n × m), $x_{ij} \ge 0$ (cost criteria need $x_{ij} > 0$); types `benefit|cost`; weights `w` (sum to 1).
- Parameter **τ** (threshold), default **0.02**, suggested range 0.01–0.05 (origin paper, Step 6).

## Algorithm
1. Linear normalization: benefit $n_{ij} = x_{ij}/\max_i x_{ij}$; cost $n_{ij} = \min_i x_{ij}/x_{ij}$.
2. $r_{ij} = w_j n_{ij}$.
3. Negative-ideal point $ns_j = \min_i r_{ij}$.
4. $E_i = \sqrt{\sum_j (r_{ij} - ns_j)^2}$, $T_i = \sum_j |r_{ij} - ns_j|$.
5. Relative assessment matrix $h_{ik} = (E_i - E_k) + \psi(E_i - E_k)\,(T_i - T_k)$, with
   $\psi(x) = 1$ if $|x| \ge \tau$, $0$ if $|x| < \tau$ (Eq. 10 as printed).
6. $H_i = \sum_k h_{ik}$; rank by decreasing H.

**Important — ψ contradiction in the origin paper.** The text says "If the difference between Euclidean distances of two alternatives is less than τ, these two alternatives are also compared by the Taxicab distance", i.e. ψ should be 1 when $|x| < \tau$. Eq. (10) says the opposite, and **all published numbers (Tables 4 and 8) follow Eq. (10) literally** (e.g. $h_{12} = -0.0439 + (-0.1116) = -0.1554$ with $|\Delta E| = 0.044 \ge \tau$; $h_{13} = 0.0178$ with $|\Delta E| < \tau$, no Taxicab term). **We implement Eq. (10) as printed** (reproduces the paper) and can expose the "text" variant as an option later, clearly labelled.

## Commonly combined with
- Weights given in the problem (Example 1 weights taken from Chakraborty & Zavadskas 2014; Example 2 expert weights from Zavadskas & Turskis 2010).
- Simulated weight sets for sensitivity (origin paper, Tables 9–11, compared with WASPAS, COPRAS, TOPSIS, VIKOR, EDAS).
- Objective-weight pairings (Entropy/CRITIC–CODAS) are common in later literature — not verified with specific papers here.

## Pitfalls
- ψ semantics (above) — the single biggest trap; document the choice in the UI.
- τ is in units of weighted-normalized distance, so its effect depends on weights and m; ranking can change with τ (origin paper Table 13).
- Cost criterion with $x_{ij} = 0$ → division by zero; benefit column all zeros → $\max = 0$.
- $h_{ik}$ is antisymmetric, $\sum_i H_i = 0$; H is not bounded to [0,1] and not comparable across problems.
- Near-ties in E (|ΔE| < τ) are decided by E only under Eq. (10); e.g. Example 2 A8 vs A9: ΔE = −0.00006, ΔT = 0.0033, published $h_{89} = 0.000$.

## Reference example (test fixture)
- **Source:** Keshavarz Ghorabaee et al. (2016), ECECSR 50(3):25–44, **Example 1**: Table 1 (data, weights), Table 2 (normalized), Table 3 (weighted, ns, E, T), Table 4 (Ra matrix, H). **Example 2**: Table 5 (data) → Table 8 (H, 3 dp).
- **Typo in Table 1/Table 2 headers:** the data under "Maximum tip speed" (0.4, 0.15, …) are the repeatability values (cost) and the data under "Repeatability" (2540, 1016, …) are the tip speeds (benefit); the weights row follows the header order (tip speed 0.326, repeatability 0.192). Confirmed by Table 3 ($0.2 \times 0.192 = 0.0384$). Below, columns are re-ordered to the header order.

```json
{
  "id": "codas-2016-example1",
  "criteria": ["load capacity", "max tip speed", "repeatability", "memory capacity", "manipulator reach"],
  "types": ["benefit", "benefit", "cost", "benefit", "benefit"],
  "weights": [0.036, 0.326, 0.192, 0.326, 0.120],
  "params": { "tau": 0.02 },
  "matrix": [
    [60, 2540, 0.4, 500, 990], [6.35, 1016, 0.15, 3000, 1041], [6.8, 1727.2, 0.10, 1500, 1676],
    [10, 1000, 0.2, 2000, 965], [2.5, 560, 0.10, 500, 915], [4.5, 1016, 0.08, 350, 508],
    [3, 1778, 0.1, 1000, 920]
  ],
  "expected": {
    "E": [0.2593, 0.3032, 0.2415, 0.1947, 0.1199, 0.1644, 0.2087],
    "T": [0.3394, 0.4510, 0.4762, 0.3114, 0.1606, 0.2133, 0.3720],
    "H": [0.5122, 1.4633, 1.0715, -0.2125, -1.8515, -1.1717, 0.1887],
    "ranking": [3, 1, 2, 5, 7, 6, 4],
    "tolerance": 0.0005
  }
}
```

```json
{
  "id": "codas-2016-example2",
  "types": ["benefit", "benefit", "benefit", "benefit", "cost", "cost"],
  "weights": [0.21, 0.16, 0.26, 0.17, 0.12, 0.08],
  "params": { "tau": 0.02 },
  "matrix": [
    [7.6, 46, 18, 390, 0.1, 11], [5.5, 32, 21, 360, 0.05, 11], [5.3, 32, 21, 290, 0.05, 11],
    [5.7, 37, 19, 270, 0.05, 9], [4.2, 38, 19, 240, 0.1, 8], [4.4, 38, 19, 260, 0.1, 8],
    [3.9, 42, 16, 270, 0.1, 5], [7.9, 44, 20, 400, 0.05, 6], [8.1, 44, 20, 380, 0.05, 6],
    [4.5, 46, 18, 320, 0.1, 7], [5.7, 48, 20, 320, 0.05, 11], [5.2, 48, 20, 310, 0.05, 11],
    [7.1, 49, 19, 280, 0.1, 12], [6.9, 50, 16, 250, 0.05, 10]
  ],
  "expected": {
    "H": [0.768, 0.363, -0.105, -0.329, -2.384, -2.207, -2.043, 2.929, 2.890, -1.282, 0.568, 0.313, 0.157, 0.364],
    "ranking": [3, 6, 9, 10, 14, 13, 12, 1, 2, 11, 4, 7, 8, 5],
    "tolerance": 0.0005
  }
}
```

- **Published outputs:** Example 1 as in JSON; ranking A2 ≻ A3 ≻ A1 ≻ A7 ≻ A4 ≻ A6 ≻ A5. Example 2: A8 ≻ A9 ≻ A1 ≻ A11 ≻ A14 ≻ A2 ≻ A12 ≻ A13 ≻ A3 ≻ A4 ≻ A10 ≻ A7 ≻ A6 ≻ A5.
- **Recomputed (numpy, Eq. 10 as printed):** Example 1 E, T, H equal the JSON values; **MATCH** (max abs diff 0.00004 on E/T/H). Example 2 H = 0.7681, 0.3627, −0.1053, −0.3292, −2.3844, −2.2069, −2.0434, 2.9285, 2.8896, −1.2818, 0.5680, 0.3127, 0.1571, 0.3645; **MATCH** (max abs diff 0.00049, paper 3 dp), rankings identical.
- **pyDecision 5.1.1 `codas_method`:** **MISMATCH** (Example 1 H = 0.3241, 0.6327, 0.2002, −0.1281, −0.6491, −0.3395, −0.0299; max abs diff 1.20; ranks differ: A1 and A3 swap). Cause: pyDecision computes $h_{ik} = \Delta E + \text{lmbd}\cdot(\Delta E \cdot \Delta T)$ — it multiplies by the threshold instead of applying ψ, and multiplies ΔE·ΔT. Not a usable reference.

## Implementation notes
- pyDecision: `codas_method(dataset, weights, criterion_type, lmbd=0.02, graph, verbose)` — formula deviates (see above); do not mirror it.
- Our implementation: vectorized $\Delta E$, $\Delta T$ matrices; `psi = abs(dE) >= tau`; H = row sums. Offer `psiMode: "paper-eq10" | "paper-text"` only if needed; default `"paper-eq10"`.
- Validate: cost columns strictly positive, benefit column max > 0.

## Sources
- Keshavarz Ghorabaee et al. 2016, ECECSR 50(3):25–44, PDF: https://ecocyb.ase.ro/nr20163/02%20-%20Mehdi%20K.%20GHORABAEE,%20Ed.%20Zavadskas(T).pdf ; RePEc: https://ideas.repec.org/a/cys/ecocyb/v50y2016i3p25-44.html (Tables 1–8, 13).
- pyDecision 5.1.1, `pyDecision/algorithm/codas.py`.
- Recompute script: `scratchpad/mcdm/siralama/scripts/codas.py`.
