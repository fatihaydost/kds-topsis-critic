# Build plan (v1: CRITIC + TOPSIS, bilingual, browser-only)

Status as of 2026-09-29 evening. Read DESIGN.md first, then FOUNDATION.md (written by the foundation pass).

## Done
- `legacy/`: the original Flask coursework, untouched.
- `src/core/`: CRITIC and TOPSIS in TypeScript, validation, registry; 53 tests against published examples
  (Krishnan 2021, Opricovic & Tzeng 2004) and the hand-solved `legacy/CRITIC(2).xlsx`.
- `docs/research/`: 26 draft method cards + `combinations.md` (general scan; each method is re-researched
  when it is implemented).
- `docs/design/DESIGN.md` + `src/styles/tokens.css`: design spec and tokens.

## Built (29.09, v1 first pass)
- Foundation (`src/ui`, `src/i18n`, `src/state`, theme, routing, `pnpm shot`), content (`src/content`, 26 methods TR/EN),
  grid and charts, IO (CSV/xlsx), illustrations (`src/features/illustrations`), workbench (`/app`, e2e `pnpm e2e`),
  landing, catalogue, method pages and the method-choice guide. 561 unit tests + 7 e2e.
- Owner review: "less text, more visuals" (DESIGN.md §Copy). Applied once; independent review running.

## Decisions (Fatih)
- Decided 29.09: MIT licence (`LICENSE`), product name "MCDM Workbench" (TR subtitle "Çok kriterli karar analizi"),
  Turkish address form "siz". Apply all three in the fix round.

## Next
1. ~~Workbench~~ done. (`/app`): spreadsheet-like decision matrix grid (keyboard, paste from Excel, import
   xlsx/csv), criterion header with benefit/cost, weights stage (CRITIC / equal / manual with sum check),
   ranking stage (TOPSIS), results (ranking table, SVG bar chart, worked calculation from `result.steps`
   with KaTeX and copy as TSV/LaTeX), export full calculation to xlsx, four states on every stage,
   GOV.UK error summary.
2. ~~Landing~~ done. (`/`) with a live results component, pipeline diagram, methods catalogue with honest status,
   "verified against the literature" section from the test fixtures; **method pages** (`/methods/:id`)
   and the method-choice guide, all from `src/content/`.
3. **Review** (reviewer report in scratchpad `review/`, then fix round): screenshots in light/dark at 1440 and 390, keyboard pass, contrast, copy audit (no em dash),
   DESIGN.md banned-patterns pass; an independent reviewer agent; fix round.
4. **Ship**: README (English, screenshots), GitHub Pages workflow. Push and deploy need Fatih's approval.
5. After v1: robustness panel (weight perturbation, Monte Carlo, rank agreement), then methods one at a
   time following the cards (review card, implement, reference test, method page).
