# Changelog (`1.16.10 -> 1.16.11`)

## Major Highlights

- Wire table exports now apply the twisted-pair length coefficient even when the current Modeling or Analysis table is filtered to only part of a twist group.

## Patch Notes

- Modeling and Analysis wire exports now compute twist-group membership from all wires in the active network, not only from the currently visible/exported rows.
- This keeps `Length (mm)` coefficient-adjusted for a twisted wire when its matching pair is hidden by a filter, while the export still only includes the selected/visible rows.
- Grouped wire-list exports were already using the full export set and are unchanged.
- Aligned release metadata to `1.16.11` across `VERSION`, `package.json`, `package-lock.json`, and `README.md`.

## Version 1.16.11 - Filter-Safe Twisted Wire Export Lengths

### Exports

- Fixed filtered wire-to-wire exports so twisted wire lengths no longer fall back to raw segment totals when the companion wire is not visible in the exported table.

### Verification

- `npm run -s typecheck`
- Focused suites: `wire-list-export`, `app.ui.wire-export-preview`

### Notes

- Builds on `1.16.10`.
