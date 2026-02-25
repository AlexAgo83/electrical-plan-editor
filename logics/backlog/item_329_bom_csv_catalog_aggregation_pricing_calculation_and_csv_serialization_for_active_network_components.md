## item_329_bom_csv_catalog_aggregation_pricing_calculation_and_csv_serialization_for_active_network_components - BOM CSV Catalog Aggregation, Pricing Calculation, and CSV Serialization for Active-Network Components
> From version: 0.9.5
> Understanding: 99%
> Confidence: 96%
> Progress: 0%
> Complexity: High
> Theme: Implement BOM aggregation/serialization engine for catalog-backed connectors/splices in the active network
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The app lacks a BOM export engine that aggregates catalog-backed components and computes pricing totals from `unitPriceExclTax`.

# Scope
- In:
  - Build BOM data extraction for active-network connectors/splices (not viewport-limited).
  - Filter to entities with resolvable `catalogItemId`.
  - Aggregate rows by catalog item.
  - Compute quantity, connector quantity, splice quantity, line totals, and priced-rows total.
  - Preserve rows with missing unit price while leaving price/total cells blank.
  - Implement deterministic row ordering and CSV-safe serialization/escaping.
  - Exclude a separate `Type` column (use connector/splice quantity columns instead).
- Out:
  - UI button placement/integration (handled in item_330).
  - PDF/XLSX export formats.

# Acceptance criteria
- BOM engine aggregates active-network connector/splice usage by catalog item.
- Line totals and priced-rows total are computed correctly when prices exist.
- Missing prices keep rows present with blank price/total cells.
- CSV serialization handles commas/quotes/newlines safely.
- Output omits a separate `Type` column and includes connector/splice quantity columns.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_056`, `req_051`.
- Blocks: item_330, item_331, item_332.
- Related AC: AC2, AC2a, AC3, AC4, AC5, AC7, AC8.
- References:
  - `logics/request/req_056_bom_csv_export_from_network_summary_header_for_rendered_catalog_backed_components.md`
  - `src/store/catalog.ts`
  - `src/app/components/NetworkSummaryPanel.tsx`

