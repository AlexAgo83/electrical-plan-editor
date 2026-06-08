## item_587_parallel_csv_and_xlsx_export_options - Parallel CSV and XLSX Export Options
> From version: 1.4.4
> Schema version: 1.0
> Status: Done
> Understanding: 100%
> Confidence: 100%
> Progress: 100%
> Complexity: High
> Theme: Export
> Non-semantic edit: linked adr_005_bom_and_export_contracts_for_csv_xlsx_and_reference_naming
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
Users want BOM and wire-by-wire exports in Excel format, but the app currently only exposes CSV export paths.

# Scope
- In:
  - Add an explicit export option to choose CSV or XLSX.
  - Apply the format choice to BOM export and wire-by-wire export.
  - Keep CSV behavior unchanged when CSV is selected.
- Out:
  - BOM row-model changes.
  - XLSX workbook formatting details.
  - Catalog export column toggles.

```mermaid
%% logics-kind: backlog
%% logics-signature: backlog|parallel-csv-and-xlsx-export-options|req-119-bom-and-catalog-export-enhanceme|users-want-bom-and-wire-by-wire-exports|ac1-the-user-can-explicitly-choose
flowchart TD
    Request[req 119 bom and catalog export enhancements] --> Problem[CSV or XLSX choice]
    Problem --> Scope[Parallel export formats]
    Scope --> Acceptance[AC1 format choice]
    Acceptance --> Tasks[Implementation task]
```

# Acceptance criteria
- AC1: The user can explicitly choose CSV or XLSX for BOM export and wire-by-wire export.
- AC2: CSV export remains available and behaves the same when selected.
- AC3: XLSX export is available without forcing a CSV workflow change.

# AC Traceability
- AC1 -> Explicit CSV or XLSX choice.
- AC2 -> Preserve CSV behavior.
- AC3 -> Add XLSX without removing CSV.
- request-AC1 -> This backlog slice. Evidence needed: Users can hide selected catalog columns only when exporting, without affecting the catalog table shown in the UI.
- request-AC2 -> This backlog slice. Evidence needed: Seal and connection references can each store an optional name, and a previously entered name is reused as a fallback when the same reference is typed again.
- request-AC3 -> This backlog slice. Evidence needed: BOM export no longer splits connector, seal, and connection reference data into separate sections; they appear on one common structure with consistent columns.
- request-AC4 -> This backlog slice. Evidence needed: BOM export and wire-by-wire export can be produced as CSV or XLSX in parallel, with XLSX chosen through an explicit option.
- request-AC5 -> This backlog slice. Evidence needed: The BOM XLSX export contains two sheets, one global summary sheet and one connector-grouped sheet with merged connector ID and name cells, correct quantities, and connector-order grouping.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`

# Decision framing
- Product framing: Not needed
- Architecture framing: Required
- Architecture signals: file export contracts, dependency selection, and integration
- Architecture follow-up: Create or link an architecture decision before implementation because XLSX support introduces a new dependency surface.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): `adr_005_bom_and_export_contracts_for_csv_xlsx_and_reference_naming`
- Request: `req_119_bom_and_catalog_export_enhancements`
- Primary task(s): `task_098_parallel_csv_and_xlsx_export_options`

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from request `req_119_bom_and_catalog_export_enhancements`.
- Source file: `logics/request/req_119_bom_and_catalog_export_enhancements.md`.
- This slice covers format selection only.
