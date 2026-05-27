# Changelog (`1.9.3 -> 1.9.4`)

## Major Highlights

- Added catalog item additional accessories for connector locks, caps, and similar optional parts.
- Extended catalog editing with repeatable accessory reference/name rows and aligned form controls.
- Included catalog accessories in catalog CSV import/export and BOM exports.
- Extended selected harness Agent JSON exports so AI consumers see accessories as explicit catalog parts, BOM quantities, and relationships.

## Version 1.9.4 - Catalog Accessories and Agent Export Enrichment

### Catalog Accessories

- Added `additionalAccessories` to catalog items with an accessory reference and optional display name.
- Added repeatable accessory rows in the catalog item form.
- Normalized accessory data during catalog upsert and imported payload handling.
- Kept existing catalog items backward-compatible when no accessory data is present.

### BOM and CSV Export

- Added an `Additional accessories (JSON)` column to catalog CSV exports.
- Preserved support for previous current-format catalog CSV files and legacy five-column imports.
- Added catalog accessory rows to BOM exports, counted per linked connector or splice.

### Agent JSON Export

- Added catalog accessories to selected harness Agent JSON `catalogParts`.
- Added accessory quantities to Agent JSON `bomQuantities`.
- Added `catalog-item-additional-accessory` relationships so AI consumers can trace accessories back to their catalog item and linked component usage.

### Documentation and Version Alignment

- Aligned release metadata to `1.9.4` across `VERSION`, `package.json`, `package-lock.json`, and README.

## Validation and Regression Evidence

- `npm run -s typecheck`
- `npm test -- --run src/tests/catalog.csv-import-export.spec.ts src/tests/network-summary-bom-csv.spec.ts src/tests/app.ui.catalog.spec.tsx`
- `npm test -- --run src/tests/selected-harness-agent-json.spec.ts src/tests/harness-assembly-agent-json-ui.spec.tsx`
