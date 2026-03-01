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
