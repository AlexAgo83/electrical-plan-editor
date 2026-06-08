## item_435_modeling_analysis_mobile_header_tool_alignment_and_table_compaction - Modeling/Analysis mobile header-tool alignment and table compaction
> From version: 0.9.18
> Status: Done
> Understanding: 99%
> Confidence: 95%
> Progress: 100%
> Complexity: High
> Theme: Mobile table/readability compaction across Catalog, Modeling, Analysis, and Validation
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Multiple table/list surfaces still use desktop-sized labels and columns in mobile mode, causing avoidable wrapping and horizontal pressure.

# Scope
- In:
  - keep `CSV` + `Help` on the same title row (right-aligned) for `Catalog`, `Connectors`, `Splices`, `Nodes`, `Segments`, and `Wires`;
  - mobile label compaction in `Catalog`: `Manufacturer ref` -> `Mnf ref`, `Unit price HT (DEV)` -> `Price`, `Connections` -> `Con.`, `Import CSV` -> `Import`;
  - shared mobile table label compaction: `Reference` -> `Ref.`, `Technical ID` -> `ID`, `Endpoint A/B` -> `End A/B`, `Length (mm)` -> `Len`, `Section (mm2|mm²)` -> `Sec`, `Occupied` -> `Occup.`;
  - mobile column visibility compaction: hide `Route mode` in wire tables and hide `Severity` in Validation table.
- Out:
  - desktop/tablet copy changes;
  - data/export schema changes;
  - sorting/filtering logic changes beyond presentation-level label/visibility adjustments.

# Acceptance criteria
- AC1: On mobile, targeted panel title rows keep `CSV`/`Help` aligned on the same line for `Catalog`, `Connectors`, `Splices`, `Nodes`, `Segments`, and `Wires`.
- AC2: On mobile, Catalog header/action labels are compacted to `Mnf ref`, `Price`, `Con.`, and `Import`.
- AC3: On mobile, shared headers use compact labels (`Ref.`, `ID`, `End A/B`, `Len`, `Sec`, `Occup.`) where applicable.
- AC4: On mobile, `Route mode` is hidden in affected wire tables.
- AC5: On mobile, `Severity` is hidden in Validation table.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_085`.
- Blocks: `item_436`, `task_074`.
- Related AC: `AC5`, `AC6`, `AC7`, `AC8`, `AC9`, `AC10`, `AC11`.
- References:
  - `logics/request/req_085_mobile_onboarding_and_workspace_header_compaction_for_small_screens.md`
  - `src/app/components/workspace/ModelingCatalogListPanel.tsx`
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
  - `src/app/components/workspace/AnalysisConnectorWorkspacePanels.tsx`
  - `src/app/components/workspace/AnalysisSpliceWorkspacePanels.tsx`
  - `src/app/components/workspace/AnalysisNodeSegmentWorkspacePanels.tsx`
  - `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
  - `src/app/components/workspace/ValidationWorkspaceContent.tsx`
  - `src/app/styles/tables.css`
  - `src/tests/app.ui.list-ergonomics.spec.tsx`
  - `src/tests/app.ui.catalog.spec.tsx`

# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: On mobile, onboarding `Close` remains on the same line as icon/title block.
- request-AC2 -> This backlog slice. Evidence needed: On mobile, onboarding `Next` remains on the same line as target action buttons (`Open`/`Scroll`).
- request-AC3 -> This backlog slice. Evidence needed: On mobile, Network Scope action label is `Dup.` and triggers the same duplicate handler/behavior as today.
- request-AC4 -> This backlog slice. Evidence needed: On mobile, `CSV` and `Help` are on the same row as `Network Scope` title and right-aligned.
- request-AC5 -> This backlog slice. Evidence needed: On mobile, `CSV` and `Help` are on the same row as titles for `Catalog`, `Connectors`, `Splices`, `Nodes`, `Segments`, and `Wires`, right-aligned.
- request-AC6 -> This backlog slice. Evidence needed: On mobile, `Route mode` column is hidden in affected wire tables.
- request-AC7 -> This backlog slice. Evidence needed: On mobile, `Occupied` header text is `Occup.` in affected connector/splice tables.
- request-AC8 -> This backlog slice. Evidence needed: On mobile, in `Catalog`, header labels are compacted to `Mnf ref`, `Price`, and `Con.`.
- request-AC9 -> This backlog slice. Evidence needed: On mobile, in `Catalog`, `Import CSV` button label is `Import` and triggers the same import handler/behavior.
- request-AC10 -> This backlog slice. Evidence needed: On mobile, shared table headers are compacted as follows where present: `Reference` -> `Ref.`, `Technical ID` -> `ID`, `Endpoint A/B` -> `End A/B`, `Length (mm)` -> `Len`, `Section (mm2|mm²)` -> `Sec`.
- request-AC11 -> This backlog slice. Evidence needed: On mobile, in `Validation`, `Severity` column is hidden.
- request-AC12 -> This backlog slice. Evidence needed: On mobile, in `Validation`, `CSV` remains on the same row as `Validation center` and right-aligned.
- request-AC13 -> This backlog slice. Evidence needed: `lint`, `typecheck`, and relevant UI tests pass after the responsive compaction changes.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC8 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC9 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC10 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC11 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC12 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC13 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
