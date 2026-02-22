## item_139_canvas_2d_node_click_event_dedup_and_single_dispatch_behavior - Canvas 2D Node Click Event Dedup and Single-Dispatch Behavior
> From version: 0.5.9
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Prevent Duplicate Selection/Edit Side Effects on 2D Node Click
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
A normal click on a 2D network node can execute node-click logic twice because handlers trigger on both `mousedown` and `click`, causing duplicate selection/edit side effects.

# Scope
- In:
  - Ensure one logical selection/edit action per normal 2D node click.
  - Preserve drag behavior and existing modeling/analysis semantics.
  - Add/update regression coverage if needed.
- Out:
  - Canvas interaction mode redesign.
  - New gesture semantics.

# Acceptance criteria
- A normal node click triggers one logical selection/edit action.
- Drag initiation still works as intended.
- Touched tests pass and cover the deduped behavior.

# Priority
- Impact: Medium (interaction correctness / duplicate side effects).
- Urgency: Medium-high (core canvas behavior).

# Notes
- Dependencies: `req_023` canvas selection highlight fixes.
- Blocks: item_144.
- Related AC: AC1, AC6, AC7.
- References:
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/app/hooks/useCanvasInteractionHandlers.ts`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `logics/request/req_024_post_req_023_review_followup_canvas_node_click_event_dedup_mouse_button_guards_empty_state_coverage_and_test_isolation_guardrails.md`
