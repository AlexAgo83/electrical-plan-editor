## item_334_bom_csv_ttc_column_and_total_with_tax_enabled_conditional_export_behavior - BOM CSV TTC column and total with tax-enabled conditional export behavior
> From version: 0.9.6
> Status: Done
> Understanding: 95%
> Confidence: 89%
> Progress: 100%
> Complexity: Medium-High
> Theme: BOM pricing export extension with conditional TTC outputs and tax-aware totals
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`req_056` delivers HT-oriented BOM CSV export only. Users now need TTC pricing rows/totals based on workspace tax settings, while preserving existing HT outputs and omitting TTC data when tax is disabled.

# Scope
- In:
  - Extend BOM CSV generation to consume workspace currency/tax settings.
  - Preserve existing HT columns/totals.
  - When tax is enabled:
    - add TTC line total column
    - add `Total TTC` summary
    - compute TTC deterministically from excl-tax amount and configured tax rate
  - When tax is disabled:
    - omit TTC column and `Total TTC`
    - keep BOM export HT-only
  - Include explicit pricing context metadata in CSV (currency + tax state/rate).
  - Preserve missing-price behavior (blank HT/TTC totals when unit price is missing).
  - Add/update BOM export tests for both tax-enabled and tax-disabled paths.
- Out:
  - Settings UI/persistence implementation for currency/tax controls (handled in `item_333`).
  - Catalog UI static currency display beside unit prices (handled in `item_335`).

# Acceptance criteria
- BOM CSV export remains functional and preserves existing HT columns/totals.
- When tax is enabled, BOM CSV adds a TTC line-total column and a `Total TTC` summary with deterministic calculation.
- When tax is disabled, BOM CSV omits TTC column/total and remains HT-only.
- Export output includes explicit pricing context metadata (currency and tax state/rate).
- Rows with missing `unitPriceExclTax` remain present and keep HT/TTC totals blank.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_057`, `req_056`, `item_333`.
- Blocks: `task_054` final validation/closure.
- Related AC: req_057 AC4, AC4a, AC6.
- Chosen export context contract: append `PRICING CONTEXT` metadata rows (`Currency`, `Tax enabled`, `Tax rate (%)`) after summary rows.
- References:
  - `logics/request/req_056_bom_csv_export_from_network_summary_header_for_rendered_catalog_backed_components.md`
  - `logics/request/req_057_catalog_and_bom_settings_currency_and_tax_defaults.md`
  - `src/app/lib/networkSummaryBomCsv.ts`
  - `src/tests/network-summary-bom-csv.spec.ts`
  - `src/tests/app.ui.network-summary-bom-export.spec.tsx`

# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: The 2D render (`Network summary`) header exposes an `Export BOM CSV` action positioned to the right of `Export PNG`.
- request-AC2 -> This backlog slice. Evidence needed: Exported CSV includes rendered connector/splice components that reference catalog items, grouped into BOM rows with quantity aggregation.
- request-AC3 -> This backlog slice. Evidence needed: CSV rows include unit price and line total fields derived from catalog `unitPriceExclTax` when available.
- request-AC4 -> This backlog slice. Evidence needed: Rows with missing unit price remain exported, with blank price/total fields (no crash/no forced zero).
- request-AC5 -> This backlog slice. Evidence needed: Broken or unresolved catalog links do not break BOM export; behavior is safe and deterministic.
- request-AC6 -> This backlog slice. Evidence needed: Existing PNG export and 2D render workflows remain functional after BOM export integration.
- request-AC7 -> This backlog slice. Evidence needed: CSV includes a `TOTAL (priced rows only)` summary row with deterministic formatting.
- request-AC8 -> This backlog slice. Evidence needed: Aggregated BOM rows expose connector/splice distribution via `Connector quantity` and `Splice quantity` columns and do not introduce a separate `Type` column in V1.
- request-AC1 -> This backlog slice. Evidence needed: `Settings` includes a dedicated section for catalog/BOM pricing setup with configurable `Currency` and `Tax rate (%)`.
- request-AC2 -> This backlog slice. Evidence needed: Currency, tax enabled state, and tax rate settings are persisted and restored across app reloads.
- request-AC3 -> This backlog slice. Evidence needed: Catalog UI displays the selected currency statically next to `Unit price (excl. tax)` while catalog item prices remain stored as excl-tax numeric amounts; value-adjacent displays prefer the currency symbol and labels/metadata may use the code.
- request-AC4 -> This backlog slice. Evidence needed: BOM workflows/export use the configured currency/tax values as explicit pricing context, preserve HT outputs, and include a TTC line column plus a `Total TTC` summary only when tax is enabled.
- request-AC5 -> This backlog slice. Evidence needed: Missing or malformed persisted currency/tax settings fall back to deterministic safe defaults without breaking load.
- request-AC6 -> This backlog slice. Evidence needed: Existing catalog CRUD and BOM export behaviors remain functional under default and customized settings values.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC8 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
