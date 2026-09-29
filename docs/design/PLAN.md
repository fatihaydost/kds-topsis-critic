# Build plan

Status as of 2026-09-30. Read DESIGN.md first, then FOUNDATION.md, then this file.

## Where v1 stands
MCDM Workbench v1 is built and reviewed, not yet published. The local commits on `main` are ahead of `origin/main`.

- **Methods that compute:** CRITIC, equal weights, manual weights, TOPSIS (`src/core`). 26 methods have draft
  research cards (`docs/research/`) and bilingual content (`src/content`); 23 are marked "in research".
- **Site:** landing (`/`), workbench (`/app`), catalogue and method-choice guide (`/methods`), method pages
  (`/methods/:id`), TR/EN, light/dark, every route prerendered with its own `index.html`, `sitemap.xml`.
- **Quality:** 714 unit tests, 24 e2e (`pnpm e2e`); two independent reviews (round 1 REVISE with 7 blockers,
  round 2 APPROVE: 88 screens with no axe, overflow or console errors); a polish round after it.
  Lighthouse mobile: landing 93, method page 90, catalogue 91, workbench 82.
- **Brand:** MCDM Workbench mark, a matrix in brackets with the decision inside (`docs/brand/`, three drawings:
  16 px cut, 24 px cut, master), favicon and web icons, top bar and hero logo, sharing image. MIT licence.
- **Ship prep:** English README with screenshots, `.github/workflows/pages.yml` (triggers on `main`), `.nvmrc`.

## Decisions (Fatih)
- Same repo; site in Turkish and English; code, comments and commits in English.
- Methods are added one at a time; the 29.09 research is a general scan and each method is re-researched when added.
- Less text, more visuals (DESIGN.md §Copy).
- Name "MCDM Workbench" (TR subtitle "Çok kriterli karar analizi"); Turkish address form "siz"; MIT licence.
- Logo: concept C, brackets with a diamond. In the top bar the subtitle sits under the name; the header content
  lines up with the page container; the hero carries the mark on wide screens.

## Next
1. **Publish** (needs Fatih): GitHub repo Settings → Pages → Source: **GitHub Actions**, then approve the push of
   `main`. After the Pages run, open every route on the live site and check it (deep links, TR/EN, icons, OG).
2. **Small leftovers:** `/app` Lighthouse 82 (the shared entry bundle is about 370 kB; split the inactive language
   and heavy modules); prerendered charts stay hidden until the app loads (review-2 P2-6); the grid has no
   single tab stop (roving tabindex).
3. **Robustness panel:** one-at-a-time weight perturbation (±5/10/20 %), Monte Carlo weights (Dirichlet) with
   rank acceptability, criterion removal, agreement between methods (Spearman, Kendall τ_b, WS), Borda merge.
   Sources and formulas: `docs/research/combinations.md` §C and §D.
4. **Methods, one at a time**, in the order `combinations.md` §E suggests (first: Entropy, SD, MEREC, ROC, AHP; SAW,
   VIKOR, EDAS, WASPAS, COPRAS, MOORA, PROMETHEE II, ELECTRE I). For each: review the card with Fatih, re-research
   it, implement in `src/core`, reference test from the published example (not pyDecision), method page and
   illustration, flip its status to available.
