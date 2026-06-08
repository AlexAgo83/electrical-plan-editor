## item_586_flatten_bom_export_into_a_single_plane - Flatten BOM Export Into a Single Plane
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
The current BOM output uses a separate wire termination block. The export needs one flat BOM structure so connectors, seals, and connection references are represented with the same column layout.

# Scope
- In:
  - Replace the separate wire termination block with a single BOM row structure.
  - Keep connector, seal, and connection reference data on the same plane.
  - Preserve deterministic ordering for the unified BOM rows.
- Out:
  - XLSX workbook formatting.
  - Optional CSV/XLSX format selection.
  - Catalog export column toggles.

```mermaid
%% logics-kind: backlog
%% logics-signature: backlog|flatten-bom-export-into-a-single-plane|req-119-bom-and-catalog-export-enhanceme|the-current-bom-output-uses-a|ac1-bom-export-uses-one-common
flowchart TD
    Request[req 119 bom and catalog export enhancements] --> Problem[Flat BOM structure]
    Problem --> Scope[Single plane BOM rows]
    Scope --> Acceptance[AC1 unified BOM rows]
    Acceptance --> Tasks[Implementation task]
```

# Acceptance criteria
- AC1: BOM export uses one common row structure for connector, seal, and connection reference data.
- AC2: The old separate wire termination section no longer appears in the exported BOM.
- AC3: The unified export keeps a stable and readable row order.

# AC Traceability
- AC1 -> Unified BOM rows.
- AC2 -> Remove separate wire termination section.
- AC3 -> Stable export ordering.
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
- Architecture signals: export schema and serialization contract
- Architecture follow-up: Create or link an architecture decision if the unified BOM row model changes the shared export contract.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): `adr_005_bom_and_export_contracts_for_csv_xlsx_and_reference_naming`
- Request: `req_119_bom_and_catalog_export_enhancements`
- Primary task(s): `task_100_flatten_bom_export_into_a_single_plane`

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from request `req_119_bom_and_catalog_export_enhancements`.
- Source file: `logics/request/req_119_bom_and_catalog_export_enhancements.md`.
- This slice is the BOM row-model normalization.
