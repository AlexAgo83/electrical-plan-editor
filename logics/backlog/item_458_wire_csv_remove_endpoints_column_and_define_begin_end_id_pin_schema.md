## item_458_wire_csv_remove_endpoints_column_and_define_begin_end_id_pin_schema - wire csv remove endpoints column and define begin end id pin schema
> From version: 0.9.18
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Wire CSV currently exports dense `Endpoints` aggregate plus `Begin`/`End` text fields, which are ambiguous for filtering and downstream processing.

# Scope
- In:
  - remove `Endpoints` column from wire CSV exports.
  - define explicit endpoint columns: `Begin ID`, `Begin pin`, `End ID`, `End pin`.
  - enforce `pin` format convention:
    - connector cavity -> `C{index}`,
    - splice port -> `P{index}`.
  - keep other wire CSV fields unchanged unless needed for schema alignment.
- Out:
  - viewport table column redesign in UI.
  - endpoint domain model changes.

# Acceptance criteria
- AC1: `Endpoints` column is removed from wire CSV export headers/rows.
- AC2: Headers include `Begin ID`, `Begin pin`, `End ID`, `End pin`.
- AC3: Exported pin values follow `C{index}` / `P{index}` convention.
- AC4: Values are derived deterministically from endpoint A/B metadata.

# AC Traceability
- AC1/AC2/AC4 -> `src/app/components/workspace/ModelingSecondaryTables.tsx` and `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx` export row builders.
- AC3 -> `src/app/hooks/useWireEndpointDescriptions.ts` (or equivalent helper) and CSV row generation logic.
- request-AC1 -> This backlog slice. Evidence needed: Accented characters in wire CSV export are preserved correctly (no `Ã©`-style corruption).
- request-AC2 -> This backlog slice. Evidence needed: `Endpoints` column is no longer present in wire CSV exports.
- request-AC3 -> This backlog slice. Evidence needed: Wire CSV exports include explicit `Begin ID`, `Begin pin`, `End ID`, `End pin` columns.
- request-AC4 -> This backlog slice. Evidence needed: Begin/end split values are populated deterministically from wire endpoint A/B metadata, with `pin` values using `C{index}` / `P{index}` convention.
- request-AC5 -> This backlog slice. Evidence needed: Modeling and Analysis wire CSV exports share the same endpoint column schema.
- request-AC6 -> This backlog slice. Evidence needed: Existing CSV formula-injection neutralization remains non-regressed.
- request-AC7 -> This backlog slice. Evidence needed: `lint`, `typecheck`, and relevant tests pass after the change.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`

# Priority
- Impact: High (requested schema change).
- Urgency: High (paired with encoding fix for user-facing export quality).

# Notes
- Risks:
  - downstream tools depending on old `Endpoints` column may break.
  - inconsistent A/B formatting across surfaces can create schema drift.
- References:
  - `logics/request/req_091_wire_csv_export_encoding_hardening_and_endpoint_column_split_for_begin_end_id_pin.md`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
  - `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
  - `src/app/hooks/useWireEndpointDescriptions.ts`
