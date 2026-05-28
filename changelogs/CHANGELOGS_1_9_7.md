# Changelog (`1.9.6 -> 1.9.7`)

## Version 1.9.7 - Connector BOM and Harness Import Cleanup

### BOM Export

- Added connector manufacturer references and resolved names to the "By connector" workbook sheet.
- Kept connector rows navigable from the BOM preview while exposing the catalog identity in the exported row.

### Connector Catalog Materials

- Added a connector edit action to clear all terminal and seal overrides so catalog defaults regain priority.
- Fixed stale connector form display when switching connectors, keeping catalog item, manufacturer reference, and way count synchronized immediately.

### Import / Export

- Prevented duplicate harness assemblies when imported networks are overwritten by replacing the matching existing assembly instead of importing a renamed copy.

## Validation and Regression Evidence

- `npm test -- --run src/tests/network-summary-bom-csv.spec.ts src/tests/network-file-harness-assembly.spec.ts`
- `npm test -- --run src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
- `npm test -- --run src/tests/app.ui.network-summary-bom-export.spec.tsx`
- `npm run -s typecheck`
- `npm run -s lint`
