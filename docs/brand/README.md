# MCDM Workbench mark

A matrix in brackets, with the decision inside. The brackets are how a matrix is written; the diamond is the
same marker the site uses for the ideal solution (A+) in its illustrations.

![Horizontal lockup](lockup-horizontal.svg)

## Files

| File | Use |
|---|---|
| `symbol.svg` | The mark at 24 px and above (petrol) |
| `symbol-small.svg` | Below 24 px: stems and arms on a 16 px grid so they stay crisp (favicon) |
| `symbol-current.svg` | Inherits the text colour (`currentColor`), for UI |
| `symbol-black.svg`, `symbol-white.svg` | One-colour versions |
| `lockup-horizontal.svg`, `-dark.svg`, `-black.svg` | Mark and wordmark side by side |
| `lockup-stacked.svg` | Mark above the wordmark |
| `mcdm-app-icon.svg` | White mark on a petrol tile |

The wordmark is IBM Plex Sans (600 for "MCDM", 400 for "Workbench"), converted to outlines, so the files need
no font. Plex is licensed under the SIL Open Font License.

## Colour

| | Light | Dark |
|---|---|---|
| Mark | `#106579` (`oklch(0.47 0.08 218)`, the site accent) | `#5fbacc` (`oklch(0.74 0.09 212)`) |
| Wordmark | `#191c20` | `#eef1f4` |

## Rules

- Clear space around the mark: the width of one bracket arm (42 of 256 units) on every side.
- Minimum size: 16 px with `symbol-small.svg`, 24 px with `symbol.svg`; the horizontal lockup from 20 px high.
- Do not recolour the diamond separately, rotate the mark, add effects, or set the wordmark in another font.
