# Changelog (`1.15.8 -> 1.15.9`)

## Major Highlights

- Fixed harness assembly fuse traversal so functional schematic continuity now works from either side of a configured fuse pair.
- Reworked `Settings` to start with `Workspace storage`, move `Import / Export networks` to the top, and package selected exports by intent instead of a long flat action list.

## Patch Notes

- Assembly functional schematics now traverse configured fuse pairs from both `pinA` and `pinB`, fixing cases where a protected branch such as `PRI-W-109` stopped at the fuse even though the paired feed wire existed.
- Added grouped `Wire list (XLSX)` export for selected networks and split it from the grouped BOM workbook flow.
- Reorganized selected export actions into `Network JSON`, `BOM`, `Wire list`, and grouped network plan outputs (`SVG`, `PNG`, `PDF`).
- Added a dedicated `Dressings` icon in the network summary `View` menu.
- Updated regression coverage for functional schematic fuse traversal and the redesigned import/export settings workspace.

## Verification

- `npm run -s test:ci -- src/tests/core.functional-schematic.spec.ts src/tests/app.ui.import-export.spec.tsx src/tests/app.ui.settings.spec.tsx src/tests/app.ui.settings-search.spec.tsx src/tests/app.ui.network-summary-viewport-persistence.spec.tsx`
- `npm run -s lint`
- `npm run -s ci:blocking`
