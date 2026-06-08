## item_329_bom_csv_catalog_aggregation_pricing_calculation_and_csv_serialization_for_active_network_components - BOM CSV Catalog Aggregation, Pricing Calculation, and CSV Serialization for Active-Network Components
> From version: 0.9.5
> Status: Done
> Understanding: 99%
> Confidence: 96%
> Progress: 100%
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


# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: The 2D render (`Network summary`) header exposes an `Export BOM CSV` action positioned to the right of `Export PNG`.
- request-AC2 -> This backlog slice. Evidence needed: Exported CSV includes rendered connector/splice components that reference catalog items, grouped into BOM rows with quantity aggregation.
- request-AC3 -> This backlog slice. Evidence needed: CSV rows include unit price and line total fields derived from catalog `unitPriceExclTax` when available.
- request-AC4 -> This backlog slice. Evidence needed: Rows with missing unit price remain exported, with blank price/total fields (no crash/no forced zero).
- request-AC5 -> This backlog slice. Evidence needed: Broken or unresolved catalog links do not break BOM export; behavior is safe and deterministic.
- request-AC6 -> This backlog slice. Evidence needed: Existing PNG export and 2D render workflows remain functional after BOM export integration.
- request-AC7 -> This backlog slice. Evidence needed: CSV includes a `TOTAL (priced rows only)` summary row with deterministic formatting.
- request-AC8 -> This backlog slice. Evidence needed: Aggregated BOM rows expose connector/splice distribution via `Connector quantity` and `Splice quantity` columns and do not introduce a separate `Type` column in V1.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC8 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
