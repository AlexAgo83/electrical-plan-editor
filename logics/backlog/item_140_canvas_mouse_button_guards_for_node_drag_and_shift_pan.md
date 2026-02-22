## item_140_canvas_mouse_button_guards_for_node_drag_and_shift_pan - Canvas Mouse Button Guards for Node Drag and Shift-Pan
> From version: 0.5.9
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Low
> Theme: Restrict Canvas Drag/Pan Start to Intended Mouse Buttons
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Canvas node drag start and shift-pan start handlers do not check `event.button`, so non-primary mouse buttons can trigger unintended selection/drag/pan behavior.

# Scope
- In:
  - Add explicit mouse-button guardrails for node drag start and shift-pan start handlers.
  - Preserve current primary-button workflows and keyboard modifiers.
- Out:
  - Touch/pointer-event migration.
  - Context menu feature work.

# Acceptance criteria
- Non-primary mouse buttons do not trigger unintended drag/pan starts.
- Primary-button drag/pan behavior remains working.
- Touched tests pass.

# Priority
- Impact: Medium (desktop interaction ergonomics).
- Urgency: Medium.

# Notes
- Dependencies: item_139 adjacent but not strictly blocking.
- Blocks: item_144.
- Related AC: AC2, AC6, AC7.
- References:
  - `src/app/hooks/useCanvasInteractionHandlers.ts`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `logics/request/req_024_post_req_023_review_followup_canvas_node_click_event_dedup_mouse_button_guards_empty_state_coverage_and_test_isolation_guardrails.md`
