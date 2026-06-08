## item_331_regression_coverage_fixtures_and_png_non_regression_for_bom_csv_export - Regression Coverage, Fixtures, and PNG Non-Regression for BOM CSV Export
> From version: 0.9.5
> Status: Done
> Understanding: 99% (CSV icon regression expectation added)
> Confidence: 96% (BOM header regression scope clarified)
> Progress: 100%
> Complexity: Medium-High
> Theme: Regression safety for BOM CSV export aggregation, CSV formatting edge cases, and PNG export coexistence
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
BOM export spans UI, CSV formatting, catalog pricing, and network-summary header actions. Without targeted regression coverage, pricing math, CSV escaping, or PNG export behavior may regress.

# Scope
- In:
  - Add tests for BOM header action presence/ordering relative to `Export PNG`.
  - Add a regression assertion that the BOM header action uses the existing CSV export icon (`public/icons/export_csv.svg`).
  - Add tests for aggregation, line totals, priced total row, and missing-price blanks.
  - Add CSV escaping tests for commas/quotes/newlines in catalog fields.
  - Add safe-behavior tests for unresolved `catalogItemId` skipping.
  - Add non-regression coverage for `Export PNG`.
  - Add/adjust fixtures/sample data for priced catalog-backed connector/splice usage.
- Out:
  - Visual redesign of network summary header actions.

# Acceptance criteria
- Regression tests cover BOM export action, aggregation math, missing-price handling, and CSV escaping.
- Regression tests cover BOM header action icon usage (`export_csv.svg`) and ordering relative to `Export PNG`.
- Regression tests confirm unresolved catalog links do not crash export.
- Regression tests confirm PNG export remains functional after BOM action integration.
- Fixtures support mixed connector/splice usage for the same catalog item and priced/unpriced scenarios.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_056`, item_329, item_330, item_324 (recommended for seeded priced smoke paths).
- Blocks: item_332.
- Related AC: AC3-AC8.
- References:
  - `logics/request/req_056_bom_csv_export_from_network_summary_header_for_rendered_catalog_backed_components.md`
  - `public/icons/export_csv.svg`
  - `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
  - `src/store/sampleNetwork.ts`
  - `src/store/sampleNetworkAdditionalDemos.ts`

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
