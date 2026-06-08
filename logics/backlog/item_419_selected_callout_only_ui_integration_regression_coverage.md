## item_419_selected_callout_only_ui_integration_regression_coverage - Selected-callout-only UI integration regression coverage
> From version: 0.9.18
> Status: Done
> Understanding: 97%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Test hardening for callout preference override behavior
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Without focused integration tests, selected-callout-only behavior can regress silently under settings/persistence and selection transitions.

# Scope
- In:
  - add/update integration tests for default-off behavior;
  - add persistence/reload coverage;
  - add selection-switch coverage across connector/splice/non-callout entities.
- Out:
  - unrelated canvas rendering perf benchmarks.

# Acceptance criteria
- AC1: Tests assert default-off and enabled-mode behavior differences.
- AC2: Tests assert persistence and restoration after reload/remount.
- AC3: Tests cover eligible and non-eligible selection transitions.

# Priority
- Impact: High.
- Urgency: Medium.

# Notes
- Dependencies: `item_417`, `item_418`.
- Blocks: `item_420`, `task_073`.
- Related AC: `AC2`, `AC3`, `AC4`, `AC5`, `AC6`.
- References:
  - `logics/request/req_081_canvas_tools_preference_selected_callout_only_visibility_override.md`
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
