## item_420_req_081_validation_matrix_and_closure_traceability - Req 081 validation matrix and closure traceability
> From version: 0.9.18
> Status: Done
> Understanding: 96%
> Confidence: 94%
> Progress: 100%
> Complexity: Medium
> Theme: Closure governance for selected-callout-only preference rollout
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
`req_081` spans preferences, rendering, and integration tests. Closure requires explicit AC traceability to avoid ambiguity.

# Scope
- In:
  - compile req_081 AC matrix with implementation and test evidence;
  - capture required validation commands and outcomes;
  - synchronize request/backlog/task statuses.
- Out:
  - feature additions beyond req_081 closure.

# Acceptance criteria
- AC1: Req_081 acceptance criteria are fully mapped to evidence.
- AC2: Validation bundle includes lint/typecheck/targeted tests.
- AC3: Request/backlog/task docs are synchronized at closure.

# Priority
- Impact: Medium.
- Urgency: Medium.

# Notes
- Dependencies: `item_417`, `item_418`, `item_419`.
- Blocks: `task_073` completion.
- Related AC: `AC1`, `AC2`, `AC3`, `AC4`, `AC5`, `AC6`.
- References:
  - `logics/request/req_081_canvas_tools_preference_selected_callout_only_visibility_override.md`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/tests/app.ui.settings-canvas-render.spec.tsx`
  - `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`

# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: A new toggle exists in `Canvas tools preferences` for selected-callout-only visibility and is unchecked by default.
- request-AC2 -> This backlog slice. Evidence needed: The new preference is persisted and restored across remount/reload.
- request-AC3 -> This backlog slice. Evidence needed: Enabling selected-callout-only mode shows at most one callout, bound to current connector/splice selection.
- request-AC4 -> This backlog slice. Evidence needed: In selected-callout-only mode, selecting non-callout entities (for example segment/node/wire) renders no callout.
- request-AC5 -> This backlog slice. Evidence needed: Disabling selected-callout-only restores full callout rendering behavior (subject to existing `Callouts` toggle).
- request-AC6 -> This backlog slice. Evidence needed: `lint`, `typecheck`, and `test:ci` pass with updated callout/settings tests.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
