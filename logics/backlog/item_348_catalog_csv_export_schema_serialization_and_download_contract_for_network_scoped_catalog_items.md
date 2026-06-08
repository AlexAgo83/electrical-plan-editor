## item_348_catalog_csv_export_schema_serialization_and_download_contract_for_network_scoped_catalog_items - Catalog CSV export schema, serialization, and download contract for network-scoped catalog items
> From version: 0.9.8
> Status: Done
> Understanding: 97%
> Confidence: 94%
> Progress: 100%
> Complexity: Medium
> Theme: Catalog CSV export engine + schema contract
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The Catalog screen lacks a CSV export engine/contract, so users cannot bulk review or edit catalog items outside the app.

# Scope
- In:
  - Define a deterministic CSV schema for exporting active-network catalog items.
  - Keep V1 schema business-facing (no internal `Catalog item ID` column).
  - Implement row extraction from the active network catalog (network-scoped only).
  - Serialize rows to CSV with stable ordering and CSV-safe escaping.
  - Wire browser download filename contract (timestamped, catalog-specific).
  - Preserve blank optional fields and deterministic numeric formatting.
- Out:
  - Catalog UI button placement/wiring (handled in `item_350`).
  - CSV import parsing/upsert (handled in `item_349`).

# Acceptance criteria
- Export engine produces deterministic CSV rows for active-network catalog items with stable column order.
- Export schema excludes internal `Catalog item ID` in V1 and remains compatible with `manufacturerReference`-based round-trip import.
- CSV escaping handles commas/quotes/newlines in user fields (`manufacturerReference`, `name`, `url`).
- Export is network-scoped and does not include cross-network catalog data.
- Download contract is browser-based and uses a deterministic timestamped filename.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_062`, `req_051`.
- Blocks: `item_350`, `item_351`, `task_059`.
- Related AC: AC3.
- References:
  - `logics/request/req_062_catalog_csv_import_export_actions_and_round_trip_support.md`
  - `src/app/lib/csv.ts`
  - `src/app/lib/catalogCsv.ts`
  - `src/app/AppController.tsx`
  - `src/store/catalog.ts`
  - `src/core/entities.ts`

# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: The Catalog screen exposes a CSV export action in the list header tools row, positioned **before `Help`**.
- request-AC2 -> This backlog slice. Evidence needed: The Catalog screen exposes a CSV import action in the bottom action row, positioned **between `Edit` and `Delete`**.
- request-AC3 -> This backlog slice. Evidence needed: Catalog CSV export downloads a deterministic CSV of active-network catalog items with stable columns and safe escaping.
- request-AC4 -> This backlog slice. Evidence needed: Catalog CSV import parses supported CSV rows and creates/updates catalog items using a documented deterministic conflict policy.
- request-AC5 -> This backlog slice. Evidence needed: Invalid CSV rows (including invalid URL / invalid numeric fields) do not crash import and are strictly skipped/rejected with deterministic error reporting and user-visible feedback.
- request-AC6 -> This backlog slice. Evidence needed: Existing Catalog CRUD/help interactions remain functional and visually coherent after adding the new actions.
- request-AC7 -> This backlog slice. Evidence needed: Regression coverage exists for action placement, export schema/escaping, import parsing/conflicts, and a round-trip smoke path.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
