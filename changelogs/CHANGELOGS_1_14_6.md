# Changelog (`1.14.5 -> 1.14.6`)

## Major Highlights

- Added oversized connector layout ways that render as 2x2 physical cavities.
- Improved connector physical layout rendering consistency across editor previews, physical views, and network summary callouts.
- Restored explicit wire color intent with a selectable `Free` mode distinct from an empty `Not specified` color.
- Kept connector layout controls readable and within UI modularization budgets.

## Patch Notes

- Connector layout normalization now preserves big ways only when the grid can fit their 2x2 footprint.
- Movement, duplicate detection, resize blocking, and selected-way updates now account for every occupied cell instead of only the anchor cell.
- Physical connector drawings now center oversized ways correctly and apply the same scale in catalog previews and network summary callouts.
- Connector way line style rendering and control contrast refinements are included in the release metadata.
- Wire creation/editing now exposes `Not specified`, `Free`, and `Selected color` modes instead of treating the empty primary-color option as the only no-color path.
- Wire tables render `Not specified` color values as empty cells, while deliberate free-color wires render as `Free`.
- Keying-control CSS moved into a dedicated module to keep the connector layout stylesheet below the UI quality gate line budget.

## Version 1.14.6 - Connector Layout Way Sizing

### Connector Layouts

- Added a `Way size` selector with `Normal` and `Big (2 x 2)` options for catalog connector layouts.
- Disabled invalid big-way updates when the target 2x2 footprint would leave the grid or overlap another cavity.
- Updated way position limits so oversized ways stay anchored inside the available grid.

### Rendering

- Aligned oversized-way centers for the layout editor, physical connector view, and network summary connector callouts.
- Scaled round, square, and slot way shapes consistently for big ways.
- Preserved dashed/solid way line styling while applying the new size model.

### Wire Colors

- Added an explicit wire `Color mode` selector with `Not specified`, `Free`, and `Selected color` options.
- Kept catalog primary/secondary selectors available only when `Selected color` is chosen.
- Preserved free-color mode when editing existing wires instead of loading it as an unspecified color.
- Kept unspecified wire color labels blank in wire tables so missing color data does not look like an intentional instruction.

### Verification

- `npm run ci:blocking`
- `npx vitest run src/tests/app.ui.wire-free-color-mode.spec.tsx src/tests/app.ui.list-ergonomics-wire-colors.spec.tsx src/tests/app.ui.creation-flow-wire-ergonomics.spec.tsx --pool=forks --maxWorkers=2 --testTimeout=15000`
- `npm run -s typecheck`
- `npm run -s lint`
