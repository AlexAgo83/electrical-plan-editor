# Changelog (`1.4.1 -> 1.4.2`)

## Major Highlights

- Corrected the `Network summary` BOM wire-termination contract to aggregate by reference text only.
- Connection and seal occurrences with the same text now collapse into a single quantity row in the exported BOM.
- The `Wire terminations` section schema was simplified to `Reference` and `Quantity`.

## Version 1.4.2 - Req_108 Delivery

### BOM Wire Terminations

- Updated BOM aggregation so all four wire-side termination fields contribute to the same grouping model:
  - `endpointAConnectionReference`
  - `endpointASealReference`
  - `endpointBConnectionReference`
  - `endpointBSealReference`
- Replaced the previous `Type + Reference` grouping with normalized `Reference` only.
- If the same text appears in both a connection field and a seal field, the BOM now exports one merged quantity line.

### Export Schema Alignment

- Removed the obsolete `Type` column from the `Wire terminations` section.
- The section now exports stable headers:
  - `Reference`
  - `Quantity`
- Existing catalog-backed BOM rows, totals, and pricing-context rows remain unchanged.

### Regression Coverage

- Added regression coverage for:
  - connection-only repeated references;
  - mixed connection and seal same-text aggregation;
  - empty/whitespace-only reference ignoring;
  - updated export-facing section headers in the BOM CSV payload.

## Validation and Regression Evidence

- Targeted req_108 regression suite passed:
  - `npm test -- --run src/tests/network-summary-bom-csv.spec.ts src/tests/app.ui.network-summary-bom-export.spec.tsx`
- Static validation passed:
  - `npm run -s lint`
  - `npm run -s typecheck`
