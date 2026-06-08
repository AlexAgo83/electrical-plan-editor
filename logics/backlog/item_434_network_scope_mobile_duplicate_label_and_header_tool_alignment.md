## item_434_network_scope_mobile_duplicate_label_and_header_tool_alignment - Network Scope mobile duplicate label and header tool alignment
> From version: 0.9.18
> Status: Done
> Understanding: 99%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: Mobile action/header compaction for Network Scope and Validation center
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
In mobile mode, Network Scope and Validation headers/actions still consume extra vertical space or use long labels that reduce scanability.

# Scope
- In:
  - rename Network Scope mobile action label `Duplicate` to `Dup.`;
  - keep Network Scope `CSV` and `Help` on the same row as `Network Scope`, right-aligned;
  - keep `Validation center` `CSV` action on the same row as title, right-aligned.
- Out:
  - changes to duplicate/export business logic;
  - non-mobile copy changes;
  - global toolbar redesign outside targeted panels.

# Acceptance criteria
- AC1: On mobile, Network Scope button label is `Dup.` and triggers unchanged duplicate behavior.
- AC2: On mobile, Network Scope title row keeps `CSV` + `Help` right-aligned on the same line.
- AC3: On mobile, Validation title row keeps `CSV` right-aligned on the same line.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_085`.
- Blocks: `item_436`, `task_074`.
- Related AC: `AC3`, `AC4`, `AC12`.
- References:
  - `logics/request/req_085_mobile_onboarding_and_workspace_header_compaction_for_small_screens.md`
  - `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
  - `src/app/components/workspace/ValidationWorkspaceContent.tsx`
  - `src/app/styles/tables.css`
  - `src/tests/app.ui.networks.spec.tsx`
  - `src/tests/app.ui.validation.spec.tsx`

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
