# Landing and method pages: pre-flight check

The `design-taste-frontend` skill §14 check, run on `/`, `/methods`, `/methods/topsis`, `/methods/vikor`
(light and dark, 1440 and 390, production build via `pnpm shot --preview`), 29.09.2026.

**Design read:** a product landing page plus reference pages for recruiters, researchers and analysts,
written like a technical report and built to feel like a measuring instrument: Tailwind v4 on
`tokens.css`, Radix primitives, IBM Plex, KaTeX (DESIGN.md).
**Dials:** variance 5, motion 3, density 5 (DESIGN.md, landing and method pages row).
**Owner review (29.09):** less text, more seeing. Every section is a headline, at most one sentence,
then a visual or the real component. Details sit behind disclosures (`details`, tabs). The check below
was re-run after that cut.
**Skill overrides for this project:** §4.8 (photography) does not apply. The hero visual is the real
result component (CRITIC then TOPSIS computed live from `src/data/examples.ts`). The pipeline diagram
shows the real stages. No stock images, no picsum, no fake screenshots.

| Check | Result | Note |
|---|---|---|
| Brief inference declared | pass | Above. |
| Dial values explicit | pass | 5 / 3 / 5 from DESIGN.md. |
| Design system | pass | Tailwind v4 on project tokens and Radix. No second system. |
| Redesign audit | n/a | The pages are new; they replace stubs. |
| Zero em dashes / en dashes | pass | `grep -rn '[—–]' src`: only a regex in `features/io/numbers.ts` and the dash constants in `content/content.test.ts`, both code. The i18n test blocks dashes in strings. |
| Page theme lock | pass | Tokens only. No section inverts. |
| Colour consistency lock | pass | Petrol accent only on the primary action, the rank 1 row, the top weight bar, links and focus. The status labels are text in a hairline box. Risk items in the guide use the warning tint (a method warning, as DESIGN.md allows). |
| Shape consistency lock | pass | 2 px on controls, boxes and panels. Nothing else is rounded. |
| Button contrast | pass | Primary uses `accent` / `accent-fg`, secondary uses `surface` / `text`, both themes. |
| CTA wrap | pass | "Open workbench" / "Çalışma alanını aç" stay on one line at 1440 and 390. |
| Form contrast | pass | The only form controls are the segmented filters and the guide's answer buttons. Both use `text` / `text-2` on `surface`. |
| Serif discipline | n/a | No serif. |
| Premium consumer palette | n/a | Not a consumer brief. Cool neutral greys. |
| Italic descender clearance | n/a | No italic display type. |
| Hero fits the viewport | pass | 1440 x 900: two-line headline, 20-word lead, both CTAs and the full result panel above the fold. At 390 the CTAs sit above the fold and the panel follows. |
| Hero top padding | pass | 64 px (`lg:py-16`). |
| Hero stack (4 text elements max) | pass | Headline, lead, two CTAs. No eyebrow, no tagline. |
| Eyebrow count | pass | Zero eyebrows on the landing page. The small "Weights" / "Ranking" line in the guide is a label inside a component, not a section eyebrow. |
| Split-header ban | pass | Every section header stacks the heading over at most one sentence. |
| Zigzag cap | pass | No image and text zigzag. |
| No duplicate CTA intent | pass | One label per intent: "Open workbench", "Methods". The top bar links carry the same names. |
| Logo wall | n/a | None, by design. |
| Bento background diversity | n/a | No bento. |
| Copy self-audit | pass | Re-read in EN and TR. Numbers are computed (closeness, weights, method counts) or come from fixtures (tolerances) and `examples.ts` (citations). The hero footnote says the paper stops at the weights, so the TOPSIS ranking is the site's own result. |
| Motion motivated | pass | No entrance motion. The chart's value transition comes from `features/charts` and follows reduced motion. |
| Marquee | n/a | None. |
| Navigation on one line, height 80 px or less | pass | 48 px top bar (shell). |
| Section layout repetition | pass | Split hero with a live component, a stage row with connectors, two verification panels, a grid of grouped families, a footer strip. Five sections, five layout families. |
| Bento cell count | n/a | No bento. |
| Long lists | pass | Landing: 26 methods as six family groups of names. `/methods`: a card grid (name, one clamped line, status, family), narrowed by the family and status filters. |
| Real images | n/a (override) | The real component and data pictures take their place: `PipelineDiagram` on the landing page, `TopsisGeometry` and `CriticIdea` on the TOPSIS and CRITIC pages (both computed by the core from the published examples), and family glyphs in the catalogue (`src/features/illustrations`). |
| Hand-rolled SVG | pass | Icons and family glyphs are Phosphor. The hand-drawn SVG is limited to the data pictures, which the owner asked for on 29.09. |
| Pills on images, photo credits, version footers | pass | None. |
| Micro-meta sentences, hero text strip, floating corner text | pass | None. |
| Scoring bars with filled tracks | pass | The weight bars have no background track. |
| Locale strips, scroll cues, version labels | pass | None. "Planned after v1" on the robustness stage is a real status, not a hero label. |
| Section-number eyebrows, decorative dots | pass | None. |
| Border on every row | pass | No row lists on the landing page. The algorithm steps are collapsed rows with one hairline between them. |
| Content density | pass | One sentence per section at most. Method pages: 3 summary bullets, then the when / avoid / inputs / pitfalls tabs. Algorithm steps show titles only, and each step opens to its formula. Sources and reference details are collapsed. |
| Quotes | n/a | None. |
| Motion claimed = motion shown | pass | Motion dial is 3, and the page is static on purpose (DESIGN.md: no entry fades, no scroll reveal). |
| GSAP patterns, scroll listeners | n/a | None. |
| Reduced motion | pass | No custom motion added. |
| Dark mode tested | pass | All four routes in dark at 1440 and 390. |
| Mobile collapse explicit | pass | Hero, ledger, family grid, catalogue rows, method page sections and the table of contents each set their below-768 or below-1280 layout in the component. |
| Viewport stability | pass | No `h-screen`. The route fallback reserves `100dvh - 48px`. |
| `useEffect` cleanup | pass | `usePageMeta` restores the previous title and description on leave. |
| Empty / loading / error states | pass | Catalogue: empty state for filters with no match, plus a reset action. Landing: skeleton shaped like the lazily loaded catalogue preview. Unknown method id: not-found page with a way back. |
| Cards omitted where possible | pass | Only the hero result panel, the diagram nodes and the guide box have a border. Each one frames a real component or a stage, not decoration. |
| Icons from an allowed library | pass | Phosphor, regular weight. |
| Motion isolated in client leaves | n/a | Vite SPA, no RSC. No motion components. |
| No AI tells (§9) | pass | No Inter, no purple, no three-card row, no invented names or numbers. |
| Core Web Vitals plausible | pass | The landing page is its own chunk (13 kB). KaTeX (260 kB) and the method content (186 kB) load only on method pages and for the catalogue preview. The main chunk dropped from 652 kB to 353 kB. |
| One design system | pass | |

## Open items

- The repo has no `LICENSE` file. The footer says "MIT License" as plain text, without a link.
- `/app?example=<id>` (link on the method pages) needs the workbench to read the query. Reported to
  the workbench pass.
- Methods in research show only their family glyph as the picture. They get their own illustration
  when they are implemented.
