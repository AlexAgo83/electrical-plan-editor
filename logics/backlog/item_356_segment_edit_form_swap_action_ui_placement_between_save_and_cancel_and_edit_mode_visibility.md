## item_356_segment_edit_form_swap_action_ui_placement_between_save_and_cancel_and_edit_mode_visibility - Segment edit form swap action UI placement between Save and Cancel and edit-mode visibility
> From version: 0.9.8
> Understanding: 99% (user-specified placement is explicit: between `Save` and `Cancel edit` in `Edit Segment`)
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Segment form UI action integration and placement ergonomics
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Without UI integration in the `Edit Segment` action row, node-swap behavior is not discoverable and does not meet the user's requested placement.

# Scope
- In:
  - Add a new segment-form action button for swapping nodes.
  - Placement contract in `Edit Segment`:
    - `Save`
    - `Swap nodes`
    - `Cancel edit`
  - Ensure the swap action is between `Save` and `Cancel edit`.
  - Show the swap action only in edit mode (hidden in create mode in V1).
  - Use `public/icons/ico_swap.svg` with a visible text label (`icon + text`).
  - Ensure the button is `type="button"` and does not submit the form.
  - Preserve existing action-row styling and responsive behavior.
- Out:
  - Core node swap transform logic (handled in `item_355`)
  - Regression coverage (handled in `item_357`)

# Acceptance criteria
- `Edit Segment` action row includes the swap action between `Save` and `Cancel edit`.
- Swap action is hidden in `Create Segment` mode.
- Swap action uses `public/icons/ico_swap.svg` with a visible text label.
- Swap action visible label is exactly `Swap nodes` (V1).
- Clicking the swap action does not submit the form or exit edit mode.
- Existing `Save` and `Cancel edit` actions remain functional and visually coherent.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_064`, `item_355`.
- Blocks: `item_357`, `task_061`.
- Related AC: AC1, AC1a, AC3, AC5.
- References:
  - `logics/request/req_064_segment_edit_swap_node_a_b_action_between_save_and_cancel.md`
  - `src/app/components/workspace/ModelingSegmentFormPanel.tsx`
  - `src/app/components/workspace/ModelingFormsColumn.types.ts`
  - `public/icons/ico_swap.svg`
