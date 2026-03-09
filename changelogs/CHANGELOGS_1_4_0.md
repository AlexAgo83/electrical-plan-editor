# Changelog (`1.3.3 -> 1.4.0`)

## Major Highlights

- Delivered **req_106** export, analysis-navigation, and render-readability hardening:
  - BOM CSV now uses UTF-8 BOM download compatibility and adds a `Wire terminations` section aggregated from per-wire connection/seal references,
  - wire CSV exports now expose explicit begin/end connection and seal reference columns in both Modeling and Analysis,
  - `Node analysis` and `Segment analysis` tables now expose iconized `Go to` actions following the existing action-column pattern,
  - network-summary cartouche sizing and segment-label offsets were adjusted to reduce truncation and improve horizontal-wire readability in both plan and exports.
- Added a post-delivery export regression fix so cartouche background colors remain readable even when SVG export runs without visible callout frames in the source canvas.

## Version 1.4.0 - Req_106 Delivery

### BOM and Wire CSV Exports

- Hardened `Network summary` BOM CSV downloads with explicit UTF-8 BOM output for accented/special-character compatibility in spreadsheet tools.
- Extended BOM aggregation beyond catalog-backed connectors/splices with a dedicated `Wire terminations` section.
- Aggregated `Connection` and `Seal` references independently by `type + reference`, skipping empty values.
- Preserved existing pricing-context rows and catalog-backed BOM pricing behavior.
- Added wire CSV export columns in both Modeling and Analysis:
  - `Begin connection ref`
  - `Begin seal ref`
  - `End connection ref`
  - `End seal ref`

### Analysis Navigation

- Added `Actions` columns with iconized `Go to` buttons in:
  - `Node analysis` associated-segment rows,
  - `Segment analysis` traversing-wire rows.
- `Go to` from `Node analysis` now opens `Segment analysis` with the targeted segment selected.
- `Go to` from `Segment analysis` now opens `Wire analysis` with the targeted wire selected.

### Render and Export Readability

- Increased cartouche width flexibility so ordinary metadata values such as `Author` are less likely to be truncated.
- Kept ellipsis as a fallback for genuinely constrained export cases.
- Increased label offset for horizontal and near-horizontal segments.
- Shared the same label-spacing behavior between on-screen plan rendering and SVG/PNG export output.
- Fixed cartouche export color fallback so the exported frame no longer degrades to a black fill when no `.network-callout-frame` is present in the source SVG.
- Added a regression test covering SVG export with metadata enabled and callout frames absent from the source canvas.

## Validation and Regression Evidence

- Documentation and request/task traceability validated:
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- Static validation passed:
  - `npm run lint`
  - `npm run typecheck`
- Targeted regression suites passed:
  - `npm test -- --run src/tests/network-summary-bom-csv.spec.ts src/tests/network-summary-graph-model.spec.ts src/tests/app.ui.list-ergonomics.spec.tsx src/tests/app.ui.network-summary-bom-export.spec.tsx src/tests/app.ui.analysis-go-to-wire.spec.tsx`
- Post-delivery cartouche regression checks passed:
  - `npm test -- --run src/tests/app.ui.network-summary-bom-export.spec.tsx`
  - `npm run lint`
  - `npm run typecheck`
- Extended validation passed:
  - `npm run test:ci:ui`
  - `npm run build`
