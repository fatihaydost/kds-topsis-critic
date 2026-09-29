# Build plan (v1: CRITIC + TOPSIS, bilingual, browser-only)

Status as of 2026-09-29 evening. Read DESIGN.md first, then FOUNDATION.md (written by the foundation pass).

## Done
- `legacy/`: the original Flask coursework, untouched.
- `src/core/`: CRITIC and TOPSIS in TypeScript, validation, registry; 53 tests against published examples
  (Krishnan 2021, Opricovic & Tzeng 2004) and the hand-solved `legacy/CRITIC(2).xlsx`.
- `docs/research/`: 26 draft method cards + `combinations.md` (general scan; each method is re-researched
  when it is implemented).
- `docs/design/DESIGN.md` + `src/styles/tokens.css`: design spec and tokens.

## In progress (29.09)
- Foundation pass: Tailwind v4 on tokens, fonts, i18n, theme, routing, `src/ui` primitives, zustand store,
  example datasets, `/dev/ui`, `pnpm shot` screenshot tool.
- Content pass: `src/content/` bilingual method content, step descriptions, method-choice guide.
- Grid and charts: `src/features/grid/` (spreadsheet-like decision matrix) and `src/features/charts/`
  (SVG bar and heatmap), API in `src/features/README.md`.
- IO: `src/features/io/` (CSV/xlsx import and export, copy step as TSV/LaTeX).
- If a pass was cut off by the session limit: check `git log` and each folder, then resume from its brief.

## Next
1. **Workbench** (`/app`): spreadsheet-like decision matrix grid (keyboard, paste from Excel, import
   xlsx/csv), criterion header with benefit/cost, weights stage (CRITIC / equal / manual with sum check),
   ranking stage (TOPSIS), results (ranking table, SVG bar chart, worked calculation from `result.steps`
   with KaTeX and copy as TSV/LaTeX), export full calculation to xlsx, four states on every stage,
   GOV.UK error summary.
2. **Landing** (`/`) with a live results component, pipeline diagram, methods catalogue with honest status,
   "verified against the literature" section from the test fixtures; **method pages** (`/methods/:id`)
   and the method-choice guide, all from `src/content/`.
3. **Review**: screenshots in light/dark at 1440 and 390, keyboard pass, contrast, copy audit (no em dash),
   DESIGN.md banned-patterns pass; an independent reviewer agent; fix round.
4. **Ship**: README (English, screenshots), GitHub Pages workflow. Push and deploy need Fatih's approval.
5. After v1: robustness panel (weight perturbation, Monte Carlo, rank agreement), then methods one at a
   time following the cards (review card, implement, reference test, method page).
