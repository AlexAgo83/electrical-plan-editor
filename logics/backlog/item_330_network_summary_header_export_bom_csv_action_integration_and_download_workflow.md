## item_330_network_summary_header_export_bom_csv_action_integration_and_download_workflow - Network Summary Header Export BOM CSV Action Integration and Download Workflow
> From version: 0.9.5
> Status: Done
> Understanding: 99% (CSV icon asset contract added)
> Confidence: 96% (UI integration contract narrowed)
> Progress: 100%
> Complexity: Medium
> Theme: Add BOM CSV export action in Network summary header next to Export PNG and wire it to browser download flow
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Without UI integration in the 2D render header, BOM export is not accessible in the intended workflow alongside `Export PNG`.

# Scope
- In:
  - Add `Export BOM CSV` action to `Network summary` header positioned to the right of `Export PNG`.
  - Use the existing CSV export icon asset `public/icons/export_csv.svg` for the BOM header action.
  - Wire browser download behavior and timestamped filename (`network-bom-<timestamp>.csv`).
  - Reuse header action styling/theme patterns.
  - Keep behavior safe if no exportable rows exist (implementation-defined empty CSV or benign export outcome).
  - Preserve existing `Export PNG` behavior/layout.
- Out:
  - BOM aggregation logic internals (handled in item_329).

# Acceptance criteria
- `Export BOM CSV` appears in Network summary header to the right of `Export PNG`.
- `Export BOM CSV` uses the existing CSV export icon (`public/icons/export_csv.svg`).
- Clicking the action downloads a CSV built from the BOM engine output.
- Existing PNG export remains functional and visually aligned.
- Responsive header layouts remain usable.

# Priority
- Impact: High.
- Urgency: Medium.

# Notes
- Dependencies: `req_056`, item_329.
- Blocks: item_331, item_332.
- Related AC: AC1, AC1a, AC6.
- References:
  - `logics/request/req_056_bom_csv_export_from_network_summary_header_for_rendered_catalog_backed_components.md`
  - `public/icons/export_csv.svg`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/app/AppController.tsx`

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
