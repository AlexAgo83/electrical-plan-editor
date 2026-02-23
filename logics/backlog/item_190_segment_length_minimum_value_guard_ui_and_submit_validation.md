## item_190_segment_length_minimum_value_guard_ui_and_submit_validation - Segment Length Minimum Value Guard (UI and Submit Validation)
> From version: 0.7.2
> Understanding: 99%
> Confidence: 98%
> Progress: 100%
> Complexity: Medium
> Theme: Prevent Invalid Zero/Negative Segment Lengths in Modeling Flows
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Segment length input can be set below `1`, which is invalid for routing/length computations and can propagate bad data into wire length recomputation.

# Scope
- In:
  - Enforce minimum `1` on segment length input (`mm`) at the UI level.
  - Add submit/update validation to block/clamp values `< 1` from persistence.
  - Preserve normal segment edit flow and existing validation style.
  - Add/adjust regression coverage for invalid segment length handling.
- Out:
  - Segment unit changes or advanced geometry validation.
  - Route/pathfinding algorithm changes unrelated to invalid-length prevention.

# Acceptance criteria
- Segment length cannot be persisted below `1` mm.
- UI prevents or clearly rejects values `< 1`.
- Downstream routing/length recomputation paths do not receive invalid lengths from interactive edits.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_032`.
- Blocks: item_194.
- Related AC: AC4, AC8.
- References:
  - `logics/request/req_032_user_feedback_followup_network_scope_focus_minimum_numeric_constraints_empty_callout_suppression_settings_persistence_and_cavity_to_way_terminology.md`
  - `src/app/components/workspace/ModelingSegmentFormPanel.tsx`
  - `src/app/hooks/useSegmentHandlers.ts`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`

