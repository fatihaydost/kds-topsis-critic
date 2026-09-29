# <Method name> (<ID>)

- **Family:** weighting (objective | subjective) | ranking (compensatory / distance | utility | ratio | outranking)
- **Origin:** <authors, year, title, journal, DOI>
- **Popularity:** <rough evidence: e.g. Scopus/Google Scholar hit counts or review papers ranking it>

## For users (site copy)
- **EN:** 2–3 plain sentences: what it does, when to pick it.
- **TR:** same in Turkish.

## When to use / when not
## Inputs
Decision matrix, criterion types (benefit/cost), weights, extra inputs (pairwise comparisons, best/worst vectors, thresholds, preference functions), parameters with defaults and allowed ranges.

## Algorithm
Numbered steps with LaTeX formulas. State the normalization. List known variants and say which one we implement (default: the one in the origin paper; note if pyDecision differs).

## Commonly combined with
Weighting ↔ ranking pairings seen in the literature, with 2–3 cited example papers.

## Pitfalls
Rank reversal, zero/negative values, division by zero, ties, degenerate inputs (single alternative, constant column), parameter sensitivity.

## Reference example (test fixture)
- Source (paper + DOI, table numbers).
- Input matrix, criterion types, weights, parameters — full, copy-pasteable (JSON block).
- Published outputs (scores/weights to 4 decimals, ranking).
- **Recomputed:** our own numpy script result + pyDecision result; state MATCH / MISMATCH (max abs diff) and explain any mismatch (typo in paper, variant, rounding).

## Implementation notes
pyDecision function name, deviations, edge-case handling we should choose.

## Sources
