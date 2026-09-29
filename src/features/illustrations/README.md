# Illustrations (`src/features/illustrations`)

Small SVG pictures that carry a method's idea so the text around them can be shorter. Same rules
as the charts: colours only from tokens (UI colour for chrome, `--data-context` / `--data-accent`
for marks), IBM Plex with tabular numbers, no gradient, shadow or decorative motion. The only
motion is a 200 ms transition when the selection changes (0 under `prefers-reduced-motion`).
Numbers are always computed by `src/core` (`geometry.ts` reads the core's steps), never typed in.

**No visible text is built in.** Every component takes a `labels` prop (partial; missing keys fall
back to the exported English `*_LABELS_EN`, meant for development only). Pass translated strings
from `src/i18n`. Number formats come in as `format` (use `useNumberFormat().format` with 3 or 4
decimals).

```ts
import { PipelineDiagram, TopsisGeometry, CriticIdea, StepFlow, TOPSIS_FLOW, CRITIC_FLOW, MethodGlyph, EmptyMatrixHint } from '../features/illustrations'
```

Preview: `/dev/illustrations` (dev only, `Preview.tsx`), e.g.
`pnpm shot /dev/illustrations --theme both --width 1440,390`.

## PipelineDiagram

Data to weights to ranking to result (plus a faded "robustness, coming later" box). Each box has a
sketch of what it holds: a 3 x 3 matrix, weight bars, 1-2-3, a result table. A row of boxes in a
container of at least 600 px, a column below that (container query, so it also fits the 224 px
rail). One `role="img"` figure; its name lists the stages.

| Prop | Type | Notes |
|---|---|---|
| `active` | `'data' \| 'weights' \| 'ranking' \| 'results' \| 'robustness'` | Stage in the accent. |
| `methods` | `Partial<Record<stage, string>>` | Small line under a stage, e.g. `{ weights: 'CRITIC', ranking: 'TOPSIS' }`. |
| `weights` | `number[]` | Real weights for the bars (up to 6); without it a neutral shape. |
| `showRobustness` | `boolean` | Default `true`. |
| `labels` | `{ data, weights, ranking, results, robustness, soon, ariaLabel? }` | |

Use: landing "How it works" (full width, with the example's weights), workbench rail or stage
header (`active={stage}`, `showRobustness={false}`).

## TopsisGeometry

Alternatives as points in the weighted normalized space of two criteria, A+ and A-, and the two
distance lines of the selected alternative. Better is always right and up (a cost axis is
reversed; the arrowheads mark "better"), one scale on both axes so lengths are true distances.
Below: a readout with the real n-criteria D+, D- and C, then one caption line; with more than two
criteria the `projectionNote` is appended. Points are a radio group: click, or Tab to it and use
the arrow keys / Home / End. Table equivalent behind "Show as table" (v on both axes, D+, D-, C,
and rows for A+ and A-).

| Prop | Type | Notes |
|---|---|---|
| `problem` | `Problem` | Valid, numeric (render nothing when TOPSIS cannot run). |
| `weights` | `number[]` | |
| `axes` | `[number, number]` | Criterion indices; default the two largest weights. |
| `selected`, `onSelectedChange` | `number`, `(i) => void` | Controlled if `selected` is set; default the best ranked. |
| `format` | `(n) => string` | Readout and table. |
| `labels` | `{ title, caption, projectionNote, ideal, antiIdeal, dPlus, dMinus, formula, select, point(name, c), showTable, alternative, closeness }` | |

Use: `/methods/topsis` "The idea" (the Opricovic and Tzeng example, `weights=[0.5, 0.5]`, max 760 px);
workbench Results next to the closeness bars (current problem and weights).

## CriticIdea

One row per criterion, read left to right: contrast (normalized values as dots on 0..1, with a
mean ± σ bracket) × conflict Σ(1 − ρ) (bar) → weight (bar with its value; the largest in the
accent). Column heads break onto two lines when narrow. Table: σ, conflict, information C, weight.

| Prop | Type | Notes |
|---|---|---|
| `problem` | `Problem` | Renders nothing when CRITIC cannot run. |
| `highlight` | `number` | Criterion in the accent; default the largest weight. |
| `format` | `(n) => string` | Weight labels and table (4 decimals). |
| `labels` | `{ title, caption?, contrast, conflict, weight, information, showTable, criterion }` | |

Use: `/methods/critic` "The idea" (Krishnan et al. 2021 example); workbench Weights stage when
the method is CRITIC.

## StepFlow

Map of the worked calculation: numbered square nodes on a hairline, the active one in the accent,
each a button (`aria-current="step"`), inside a `<nav>`. Scrolls sideways in itself when narrow.
`TOPSIS_FLOW` (Normalize, Weight, Ideal points, Distances, Closeness) and `CRITIC_FLOW` (Normalize,
Contrast, Correlation, Information, Weights) give the node keys (the first core step key of each
node) and `stepKeys` (all core steps the node covers); add your labels:

```tsx
<StepFlow
  steps={TOPSIS_FLOW.map((n) => ({ ...n, label: t(`flow.${n.key}`) }))}
  active={currentStepKey}                // any core step key, e.g. 'topsis.idealWorst' marks node 3
  onSelect={(key) => scrollToStep(key)}   // key = node key = first core step key
  labels={{ nav: t('calc.steps') }}
/>
```

Without `onSelect` the nodes are disabled buttons (a static picture). Use: above the workbench's
"Show the calculation" view; method pages' algorithm section could use it static.

## MethodGlyph

One mark per **method family** (`MethodFamily` from `src/content/types`, i.e. `method.family`),
in `currentColor`, Phosphor regular weight: objective weights `ChartBar`, subjective weights
`SlidersHorizontal`, distance `LineSegment`, utility a Σ drawn on Phosphor's 256 grid (stroke 16),
ratio `Divide`, outranking `ArrowsLeftRight`.

| Prop | Type | Notes |
|---|---|---|
| `family` | `MethodFamily` | Not the method id: `<MethodGlyph family={method.family} />`. |
| `size` | `number` | Default 20; 16 in dense lists, 32 to 48 for a page's idea block. |
| `label` | `string` | Accessible name; without it the glyph is `aria-hidden` (put it next to the visible family label). |

Use: catalogue cards next to the family label (20 px), landing catalogue preview, research-method
pages' "The idea" (large).

## EmptyMatrixHint

The empty Data stage: header row, direction row (↑ ↓), three empty rows, the first cell framed in
the accent with a caret. `role="img"`.

| Prop | Type | Notes |
|---|---|---|
| `label` | `string` | Accessible name. |
| `maxWidth` | `number` | Default 216 px; shrinks with the container. |

Use: the workbench's empty Data state, above "Load example" / "Start blank".

## Pure helpers (`geometry.ts`, tested in `geometry.test.ts`)

`topsisProjection(problem, weights, axes?)`, `defaultAxes(weights)`, `fitPlot(...)` (equal-scale,
better-is-up-right screen scales), `segmentTransform(...)`, `planarDistance`, `criticParts(problem)`,
`argMax`, `flowIndex`, `TOPSIS_FLOW`, `CRITIC_FLOW`. The tests check that A+ / A- and C equal the core
and the published values (Opricovic and Tzeng 2004: C = 0.762, 0.722, 0.238; Krishnan et al. 2021:
σ and weights), and that the plot uses one scale on both axes.
