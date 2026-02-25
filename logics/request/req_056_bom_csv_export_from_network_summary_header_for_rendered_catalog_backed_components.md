## req_056_bom_csv_export_from_network_summary_header_for_rendered_catalog_backed_components - BOM CSV Export from 2D Render Header for Rendered Catalog-Backed Components
> From version: 0.9.5
> Understanding: 100% (BOM defaults clarified + backlog/task linkage added)
> Confidence: 96% (export behavior contracts narrowed and decomposed)
> Complexity: Medium-High
> Theme: Add a BOM CSV export action in the 2D render header using catalog-linked connector/splice data and unit pricing
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Users need to generate a BOM (Bill of Materials) directly from the 2D render workflow.
- The export action should be available in the `Network summary` / 2D render header, next to the existing `Export PNG` action.
- The BOM should export CSV rows for components used in the 2D render that reference `Catalog` items, including unit price and total price calculations.

# Context
`req_051` introduced a network-scoped `Catalog` with `unitPriceExclTax` and `catalogItemId` links for `Connectors` / `Splices`.
This makes it possible to generate a cost-oriented BOM based on actual modeled components.

The user specifically wants the export action in the 2D render header (to the right of the PNG export button), so the BOM is generated from the same working context as the visual plan export.

# Objective
- Add a `BOM CSV` export action in the 2D render (`Network summary`) header, positioned to the right of `Export PNG`.
- Export a CSV of rendered components (`Connectors` / `Splices`) that use `Catalog` items.
- Include quantity aggregation and pricing fields (`unit price`, `line total`, and a global total row) based on catalog unit price.

# Functional scope
## A. UI action placement in 2D render header (high priority)
- Add a new export action/button in the `Network summary` header, positioned to the right of the existing `Export PNG` button.
- Recommended label:
  - `Export BOM CSV`
- Icon contract (V1):
  - use the existing CSV export icon asset `public/icons/export_csv.svg` for the BOM export button
- The action should follow the existing header action styling and theme behavior.
- The action must be available in the same screen contexts as `Export PNG` (desktop and responsive layouts as applicable).

## B. BOM source dataset (high priority)
- BOM export includes components currently relevant to the active 2D render context:
  - `Connectors`
  - `Splices`
- V1 scope contract for "used in the 2D render":
  - include all connectors/splices belonging to the active network render context
  - do not limit export to viewport visibility, zoom level, or transient canvas framing
  - do not include cross-network workspace data
- Components must be included only when they:
  - are part of the active network being rendered,
  - are represented in the 2D render/model context (same scope expectation as the `Network summary` render, not cross-network workspace data),
  - have a resolvable `catalogItemId` pointing to an existing catalog item.
- Components without a resolvable catalog item should be excluded from priced BOM rows in V1 (and should not crash export).
- If helpful, the implementation may optionally add a CSV note row or warning behavior for skipped unresolved entities, but this is not required in V1.

## C. BOM row grouping and fields (high priority)
- V1 output groups rows by `Catalog` item (not one row per instance), because BOMs are typically quantity-aggregated.
- Grouping key (recommended):
  - `catalogItemId` (internal)
  - exported display key: catalog `manufacturerReference`
- For each grouped row, compute and export at minimum:
  - `Manufacturer reference`
  - `Name` (catalog item name, optional column may be empty)
  - `Component quantity` (count of rendered connector/splice instances using this catalog item)
  - `Unit price (excl. tax)` (from catalog `unitPriceExclTax`)
  - `Line total (excl. tax)` = `quantity * unitPriceExclTax` when unit price is present
- Recommended additional V1 columns (useful, low cost):
  - `Connector quantity`
  - `Splice quantity`
  - `Connection count` (catalog metadata)
  - `URL`
- V1 column decision:
  - do **not** add a separate `Type` column for aggregated catalog rows
  - `Connector quantity` + `Splice quantity` are the canonical type-distribution indicators in V1
- Column names should be stable and English UI-consistent.

## D. Pricing behavior and missing price handling (high priority)
- Pricing uses catalog `unitPriceExclTax` (numeric amount without currency metadata, consistent with `req_051`).
- If `unitPriceExclTax` is missing/null for a catalog item:
  - include the row in the CSV,
  - leave `Unit price (excl. tax)` empty (or implementation-standard blank),
  - leave `Line total (excl. tax)` empty (do not coerce to `0`).
- V1 footer/summary rows contract:
  - include `TOTAL (priced rows only)` amount
  - `Unpriced rows count` remains optional
- Decimal formatting should be deterministic and CSV-safe (recommended `.` decimal separator).

## E. CSV generation behavior (medium priority)
- Export format: `.csv` file downloadable from the browser (same pattern as PNG export action).
- Filename should be deterministic and timestamped similarly to existing exports (recommended):
  - `network-bom-<timestamp>.csv`
- CSV escaping/quoting must handle commas, quotes, and line breaks in user-entered catalog fields (`name`, `manufacturerReference`, `url`).
- The export should not require backend/server support.

## F. Interplay with validation and corrupted data (medium priority)
- Export must remain safe when catalog integrity issues exist:
  - broken `catalogItemId` references,
  - invalid/missing price values,
  - malformed optional text fields.
- V1 BOM export is not a validation substitute:
  - corrupted links may be skipped,
  - pricing blanks are acceptable.
- If `req_053` is implemented, users can use Validation to repair catalog-link integrity issues surfaced outside the BOM export.

## G. Samples/fixtures/tests alignment (medium priority)
- Add/adjust fixtures to cover:
  - priced catalog items used by rendered connectors/splices,
  - mixed connector/splice usage for the same catalog item,
  - missing unit price rows,
  - unresolved `catalogItemId` skipped behavior.
- Ensure sample/demo data remains usable for manual BOM export smoke testing (at least one priced catalog-backed component in a realistic path).
- `req_054` interplay note (V1 recommendation):
  - align seeded catalog defaults with BOM smoke-test usefulness by keeping non-null deterministic `unitPriceExclTax` values on default seeded items.

# Non-functional requirements
- No noticeable UI lag for typical network sizes; aggregation should be linear in the number of relevant connectors/splices.
- Deterministic row ordering (recommended sort by `manufacturerReference`, then `catalogItemId`) to avoid noisy diffs and flaky tests.
- No regressions to existing `Export PNG` behavior or 2D render interactions.

# Validation and regression safety
- Add/extend tests for:
  - header shows `Export BOM CSV` action next to `Export PNG`
  - CSV export aggregates connector/splice instances by catalog item
  - CSV uses `Connector quantity` + `Splice quantity` columns without a separate `Type` column
  - line total uses `quantity * unitPriceExclTax`
  - missing `unitPriceExclTax` yields blank price/total cells but row remains present
  - unresolved `catalogItemId` entities do not crash export and are skipped (or handled per chosen V1 behavior)
  - CSV escaping works for catalog names/refs/URLs containing commas or quotes
  - `Export PNG` behavior remains functional (no regression)

# Acceptance criteria
- AC1: The 2D render (`Network summary`) header exposes an `Export BOM CSV` action positioned to the right of `Export PNG`.
- AC1a: The `Export BOM CSV` header action uses the existing CSV export icon (`public/icons/export_csv.svg`).
- AC2: Exported CSV includes rendered connector/splice components that reference catalog items, grouped into BOM rows with quantity aggregation.
- AC2a: V1 BOM CSV scope includes all connector/splice instances in the active network (not viewport-limited visibility subsets).
- AC3: CSV rows include unit price and line total fields derived from catalog `unitPriceExclTax` when available.
- AC4: Rows with missing unit price remain exported, with blank price/total fields (no crash/no forced zero).
- AC5: Broken or unresolved catalog links do not break BOM export; behavior is safe and deterministic.
- AC6: Existing PNG export and 2D render workflows remain functional after BOM export integration.
- AC7: CSV includes a `TOTAL (priced rows only)` summary row with deterministic formatting.
- AC8: Aggregated BOM rows expose connector/splice distribution via `Connector quantity` and `Splice quantity` columns and do not introduce a separate `Type` column in V1.

# Out of scope
- PDF/XLSX BOM export formats.
- Currency conversion, VAT/tax calculations, or locale-specific accounting formatting.
- BOM filtering UI (e.g. visible-only viewport subset, layer filters) beyond the default 2D render context.
- Backend upload/sharing of BOM exports.

# Backlog
- `logics/backlog/item_329_bom_csv_catalog_aggregation_pricing_calculation_and_csv_serialization_for_active_network_components.md`
- `logics/backlog/item_330_network_summary_header_export_bom_csv_action_integration_and_download_workflow.md`
- `logics/backlog/item_331_regression_coverage_fixtures_and_png_non_regression_for_bom_csv_export.md`
- `logics/backlog/item_332_req_052_to_req_056_catalog_follow_ups_bundle_closure_ci_build_and_ac_traceability.md`

# Orchestration task
- `logics/tasks/task_053_req_052_to_req_056_catalog_follow_ups_bundle_orchestration_and_delivery_control.md`

# References
- `logics/request/req_051_catalog_screen_with_catalog_item_crud_navigation_integration_and_required_manufacturer_reference_connection_count.md`
- `logics/request/req_053_validation_catalog_integrity_issues_and_catalog_go_to_navigation_support.md`
- `logics/request/req_055_catalog_analysis_panel_linked_connectors_and_splices_usage_listing.md`
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/AppController.tsx`
- `src/store/catalog.ts`
- `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
