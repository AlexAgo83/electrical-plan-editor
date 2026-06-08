## item_436_req_085_mobile_compaction_validation_matrix_and_closure_traceability - Req 085 mobile compaction validation matrix and closure traceability
> From version: 0.9.18
> Status: Done
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Closure governance for req_085 mobile compaction rollout
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Req_085 spans onboarding, list headers, table columns, and mobile label contracts. Without explicit closure evidence, regressions and AC drift are likely.

# Scope
- In:
  - produce req_085 AC traceability matrix linked to code/tests;
  - capture validation command evidence for mobile viewport checks and targeted suites;
  - synchronize request/backlog/task status and references at closure.
- Out:
  - new feature scope beyond req_085;
  - unrelated architecture/process changes.

# Acceptance criteria
- AC1: Req_085 AC matrix is complete and auditable.
- AC2: Validation matrix includes mobile viewport checks (`390x844`, `360x800`) and targeted UI suites.
- AC3: Request/backlog/task statuses and cross-links are synchronized at closure.

# Priority
- Impact: Medium.
- Urgency: Medium.

# Notes
- Dependencies: `item_433`, `item_434`, `item_435`.
- Blocks: `task_074` completion.
- Related AC: `AC1` to `AC13`.
- References:
  - `logics/request/req_085_mobile_onboarding_and_workspace_header_compaction_for_small_screens.md`
  - `src/app/styles/onboarding.css`
  - `src/app/styles/tables.css`
  - `src/tests/app.ui.onboarding.spec.tsx`
  - `src/tests/app.ui.networks.spec.tsx`
  - `src/tests/app.ui.list-ergonomics.spec.tsx`
  - `src/tests/app.ui.catalog.spec.tsx`
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
