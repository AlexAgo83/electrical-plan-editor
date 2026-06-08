## item_585_reference_naming_fallback_for_wire_terminations - Reference Naming Fallback for Wire Terminations
> From version: 1.4.4
> Schema version: 1.0
> Status: Done
> Understanding: 100%
> Confidence: 100%
> Progress: 100%
> Complexity: High
> Theme: Data Model
> Non-semantic edit: linked adr_005_bom_and_export_contracts_for_csv_xlsx_and_reference_naming
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
Seal and connection references need an optional friendly name, and the app should remember a previously entered name for a reference when that reference is used again.

# Scope
- In:
  - Add an optional name field for seal references and connection references.
  - Allow the name to be edited later from both the form entry flow and the catalog-linked flow.
  - Reuse the last known name as a fallback when the same reference is entered again.
  - Keep the name field optional and leave it blank when no name is known.
- Out:
  - Automatic renaming of existing references.
  - Changing connector or splice model fields.
  - BOM layout changes.

```mermaid
%% logics-kind: backlog
%% logics-signature: backlog|reference-naming-fallback-for-wire-termi|req-119-bom-and-catalog-export-enhanceme|seal-and-connection-references-need-an|ac1-seal-and-connection-references-can
flowchart TD
    Request[req 119 bom and catalog export enhancements] --> Problem[Reference naming fallback]
    Problem --> Scope[Optional wire termination names]
    Scope --> Acceptance[AC1 optional names and reuse]
    Acceptance --> Tasks[Implementation task]
```

# Acceptance criteria
- AC1: Seal and connection references can each store an optional name.
- AC2: When the same reference is entered again, the previous name is suggested or reused as a fallback.
- AC3: If the name is still empty, the saved value remains blank.

# AC Traceability
- AC1 -> Optional name fields for wire terminations.
- AC2 -> Reuse last known name for the same reference.
- AC3 -> Blank name stays blank.
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
- Architecture signals: data model, persistence, and form contracts
- Architecture follow-up: Create or link an architecture decision before implementation because this changes the stored shape of wire termination metadata.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): `adr_005_bom_and_export_contracts_for_csv_xlsx_and_reference_naming`
- Request: `req_119_bom_and_catalog_export_enhancements`
- Primary task(s): `task_099_reference_naming_fallback_for_wire_terminations`

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from request `req_119_bom_and_catalog_export_enhancements`.
- Source file: `logics/request/req_119_bom_and_catalog_export_enhancements.md`.
- Keep this slice focused on naming behavior only.
