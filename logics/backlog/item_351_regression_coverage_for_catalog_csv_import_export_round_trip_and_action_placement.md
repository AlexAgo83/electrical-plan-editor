## item_351_regression_coverage_for_catalog_csv_import_export_round_trip_and_action_placement - Regression coverage for catalog CSV import/export round-trip and action placement
> From version: 0.9.8
> Status: Done
> Understanding: 97%
> Confidence: 94%
> Progress: 100%
> Complexity: Medium-High
> Theme: Regression safety for catalog CSV portability workflows
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Catalog CSV import/export touches UI action layout, CSV formatting, parsing, validation interplay, and CRUD workflows. Without targeted regression coverage, action order, parsing rules, or existing catalog interactions may regress.

# Scope
- In:
  - Add tests for Catalog header export action placement before `Help`.
  - Add tests for Catalog bottom import action placement between `Edit` and `Delete`.
  - Add export CSV schema/order/escaping tests.
  - Add import parsing tests for valid rows, strict-invalid rows (including URL/numeric failures), strict-header rejection, and deterministic error/skip behavior.
  - Add conflict-policy tests (create vs update by trimmed `manufacturerReference`; duplicate rows in import file with `last row wins` warnings).
  - Add UI tests for non-empty-catalog confirmation before import and Catalog-local import summary rendering.
  - Add round-trip smoke coverage (`export -> import`) on representative catalog data.
  - Add non-regression assertions for existing Catalog CRUD/help behavior after action insertion.
- Out:
  - Full visual snapshot testing for all catalog states.

# Acceptance criteria
- Automated tests cover UI placement contracts for both new Catalog CSV actions.
- Automated tests cover export serialization and import parsing/conflict behavior.
- Automated tests assert the V1 schema contract (no internal `Catalog item ID` column), strict headers, strict invalid-row handling, and Catalog-local import summary behavior.
- Round-trip smoke coverage exists for representative catalog data.
- Catalog CRUD/help non-regression remains green after the new actions are added.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_062`, `item_348`, `item_349`, `item_350`.
- Blocks: `task_059`.
- Related AC: AC1, AC2, AC3, AC4, AC5, AC6, AC7.
- References:
  - `logics/request/req_062_catalog_csv_import_export_actions_and_round_trip_support.md`
  - `src/tests/app.ui.catalog.spec.tsx`
  - `src/tests/app.ui.catalog-csv-import-export.spec.tsx`
  - `src/tests/catalog.csv-import-export.spec.ts`
  - `src/tests/csv.export.spec.ts`
  - `src/store/sampleNetwork.ts`
  - `src/store/sampleNetworkPricingQaSample.ts`

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
