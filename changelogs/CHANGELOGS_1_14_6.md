# Changelog (`1.14.5 -> 1.14.6`)

## Major Highlights

- Added oversized connector layout ways that render as 2x2 physical cavities.
- Improved connector physical layout rendering consistency across editor previews, physical views, and network summary callouts.
- Kept connector layout controls readable and within UI modularization budgets.

## Patch Notes

- Connector layout normalization now preserves big ways only when the grid can fit their 2x2 footprint.
- Movement, duplicate detection, resize blocking, and selected-way updates now account for every occupied cell instead of only the anchor cell.
- Physical connector drawings now center oversized ways correctly and apply the same scale in catalog previews and network summary callouts.
- Connector way line style rendering and control contrast refinements are included in the release metadata.
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

### Verification

- `npm run ci:blocking`
