## item_433_onboarding_modal_mobile_single_row_header_and_action_alignment - Onboarding modal mobile single-row header and action alignment
> From version: 0.9.18
> Status: Done
> Understanding: 99%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: Mobile onboarding layout compaction
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
On narrow mobile viewports, onboarding modal controls currently wrap into multiple lines, reducing readability and slowing completion of guided steps.

# Scope
- In:
  - keep onboarding `Close` on the same row as icon/title block in mobile mode;
  - keep onboarding target action buttons (`Open`/`Scroll`) and `Next` on one row in mobile mode;
  - preserve full-flow and contextual-help behavior parity.
- Out:
  - onboarding content rewrite;
  - onboarding step sequencing changes;
  - desktop/tablet layout redesign.

# Acceptance criteria
- AC1: On mobile, onboarding header keeps icon/title/progress and `Close` on one line without clipping.
- AC2: On mobile, onboarding footer keeps target actions and `Next` on one line for normal narrow-phone widths.
- AC3: Keyboard focus trap, Escape close, and close/focus restoration behavior remain unchanged.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_085`.
- Blocks: `item_436`, `task_074`.
- Related AC: `AC1`, `AC2`.
- References:
  - `logics/request/req_085_mobile_onboarding_and_workspace_header_compaction_for_small_screens.md`
  - `src/app/components/onboarding/OnboardingModal.tsx`
  - `src/app/styles/onboarding.css`
  - `src/tests/app.ui.onboarding.spec.tsx`

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
