# Rank-order weights: ROC, Rank Sum, Rank Reciprocal (roc)

- **Family:** weighting (subjective; from a ranking only)
- **Origin:**
  - ROC (rank order centroid): Barron, F.H. & Barrett, B.E. (1996). Decision Quality Using Ranked Attribute Weights. *Management Science* 42(11), 1515–1523. DOI [10.1287/mnsc.42.11.1515](https://doi.org/10.1287/mnsc.42.11.1515) (Crossref verified; not read). Roszkowska (2013) also credits Solymosi & Dombi (1985, EJOR 26:35–41) for centroid weights.
  - Rank Sum (RS) and Rank Reciprocal (RR): Stillwell, W.G., Seaver, D.A. & Edwards, W. (1981). A comparison of weight approximation techniques in multiattribute utility decision making. *Organizational Behavior and Human Performance* 28(1), 62–77. DOI [10.1016/0030-5073(81)90015-5](https://doi.org/10.1016/0030-5073(81)90015-5) (Crossref verified; not read).
  - Formulas as restated in Roszkowska, E. (2013). Rank Ordering Criteria Weighting Methods – a Comparative Overview. *Optimum. Studia Ekonomiczne* 5(65), 14–33. DOI [10.15290/ose.2013.05.65.02](https://doi.org/10.15290/ose.2013.05.65.02) (read as text extract).
- **Popularity:** Crossref cited-by 527 (Barron & Barrett 1996), 386 (Stillwell et al. 1981) on 2026-09-29.

## For users (site copy)
- **EN:** If you can only say which criterion matters most, second most and so on, these formulas turn that ranking into weights. ROC gives the top criterion a clearly larger share; Rank Sum decreases evenly; Rank Reciprocal drops sharply after the first. ROC is the usual default.
- **TR:** Yalnızca hangi kriterin en önemli, ikinci önemli vb. olduğunu söyleyebiliyorsanız bu formüller sıralamayı ağırlığa çevirir. ROC ilk kritere belirgin biçimde büyük pay verir; Sıra Toplamı eşit adımlarla azalır; Ters Sıra ilk kriterden sonra hızla düşer. Genelde varsayılan ROC'tur.

## When to use / when not
- **Use when:** only ordinal information is available or agreed (groups, time pressure).
- **Do not use when:** the decision maker can quantify differences (use SWARA/AHP/BWM); ties are frequent (formulas assume a strict ranking; see Pitfalls).

## Inputs
- Rank $r_j \in \{1..n\}$ per criterion (1 = most important), strict ranking.
- Parameter `formula` ∈ {`roc` (default), `rs`, `rr`}.

## Algorithm
For rank $r$ out of $n$:
- ROC: $w(r) = \dfrac{1}{n}\sum_{k=r}^{n}\dfrac{1}{k}$.
- RS: $w(r) = \dfrac{2(n + 1 - r)}{n(n+1)}$.
- RR: $w(r) = \dfrac{1/r}{\sum_{k=1}^{n} 1/k}$.
Each sums to 1 without further normalization. Map back: $w_j = w(r_j)$.

**Variants.** Rank exponent (RS with power z) and geometric weights exist (Roszkowska 2013) but are not implemented. pyDecision `roc_method(criteria_rank)` and `rsw_method(criteria_rank)` take the ranking as a list of labels like `['C3','C1','C4','C2']` (C3 ranked first) and return weights in C1..Cn order; RR is not in pyDecision.

## Commonly combined with
- ROC/RS/RR → SAW, and AHP vs rank weights comparison: Roszkowska (2013), DOI [10.15290/ose.2013.05.65.02](https://doi.org/10.15290/ose.2013.05.65.02).
- Rank weights as surrogate weights in decision-quality simulations: Barron & Barrett (1996) (not read).

## Pitfalls
- **Ties:** formulas are undefined for ties. Our choice: average the weights of the tied positions (e.g., ranks 2 and 3 tied → both get (w(2)+w(3))/2); document it. Not from a source.
- **n = 1:** w = 1.
- **Order convention:** rank 1 = most important. pyDecision's input is an ordered label list, not a rank vector — easy to invert by mistake.

## Reference example (test fixture)
- **Source:** Roszkowska (2013), Table 4 ("Approximations for criteria weights"), n = 2…7, 2 decimals. We use **n = 4**, the only row where all three formulas match the printed values (see below).
- **Errors in the source table** (found by recomputation, 2-decimal rounding): n = 3 ROC printed [0.62, 0.28, 0.12] (sums to 1.02; correct [0.61, 0.28, 0.11]); n = 5 ROC w1 printed 0.45 (0.4567 → 0.46); n = 5 RR w3 0.14 (0.146 → 0.15); n = 5 RS printed [0.33, 0.27, 0.21, 0.12, 0.07] (correct [0.33, 0.27, 0.20, 0.13, 0.07]); n = 6 RR w2, w3 printed 0.21, 0.13 (0.204, 0.136 → 0.20, 0.14); n = 6 RS w5 0.09 (0.095 → 0.10); n = 7 RR w4, w6, w7 off by 0.01. Most look like manual adjustment to make the row sum to 1. Do not use these rows as fixtures.

```json
{
  "id": "rank-weights-roszkowska2013-n4",
  "source": "Roszkowska 2013, Optimum. Studia Ekonomiczne 5(65):14-33, Table 4, row n = 4",
  "n": 4,
  "ranks": [1, 2, 3, 4],
  "expected": {
    "roc": [0.52, 0.27, 0.15, 0.06],
    "rs": [0.40, 0.30, 0.20, 0.10],
    "rr": [0.48, 0.24, 0.16, 0.12],
    "tolerance": 5e-3
  },
  "exact_values": {
    "roc": [0.5208333333, 0.2708333333, 0.1458333333, 0.0625],
    "rs": [0.4, 0.3, 0.2, 0.1],
    "rr": [0.48, 0.24, 0.16, 0.12]
  }
}
```

- **Recomputed** (`scratchpad/mcdm/agirlik/recompute_all.py`): ROC [0.52083, 0.27083, 0.14583, 0.06250], RS [0.4, 0.3, 0.2, 0.1], RR [0.48, 0.24, 0.16, 0.12] → **MATCH** (max 4.2e-3 for ROC at 2 d.p.; RS, RR exact). pyDecision `roc_method` and `rsw_method` → **MATCH** (5.6e-17); ranking-input check `roc_method(['C3','C1','C4','C2'])` = [0.2708, 0.0625, 0.5208, 0.1458] as expected.
- Use `exact_values` for tight tests (these are closed forms, 1e-12 tolerance), the 2-decimal row only to tie the fixture to the publication.

## Implementation notes
- Closed forms; O(n²) at most. Provide a ranking UI (drag to sort) shared with SWARA.

## Sources
- Roszkowska (2013), DOI 10.15290/ose.2013.05.65.02 — Table 4 and formulas via full-text extract (exa.ai library copy).
- Barron & Barrett (1996); Stillwell et al. (1981) — Crossref metadata only.
- pyDecision 5.1.1 `algorithm/roc.py`, `algorithm/rsw.py` (read).
