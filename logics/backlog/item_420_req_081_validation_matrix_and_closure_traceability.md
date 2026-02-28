## item_420_req_081_validation_matrix_and_closure_traceability - Req 081 validation matrix and closure traceability
> From version: 0.9.18
> Status: Draft
> Understanding: 96%
> Confidence: 94%
> Progress: 0%
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
