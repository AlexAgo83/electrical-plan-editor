## item_355_segment_edit_form_node_swap_state_transform_and_draft_preservation - Segment edit form node swap state transform and draft preservation
> From version: 0.9.8
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: Low-Medium
> Theme: Segment edit form draft-state manipulation for node A/B inversion
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The segment edit form has no one-click draft-state transform to invert `Node A` and `Node B`, forcing users to manually reselect both nodes.

# Scope
- In:
  - Implement a draft-only node swap state transform for segment edit mode.
  - Swap the draft values of `Node A` and `Node B`.
  - Preserve non-node segment fields (`Segment ID`, `Length (mm)`, `Sub-network tag`) unchanged.
  - Keep normal form validation/update behavior coherent after the swap.
- Out:
  - UI button placement/wiring (handled in `item_356`)
  - Regression coverage (handled in `item_357`)

# Acceptance criteria
- Swap transform correctly exchanges `Node A` and `Node B` draft values.
- Swap does not submit the form or mutate persisted segment data until `Save`.
- Non-node segment fields remain unchanged by the swap.
- Form behavior remains coherent after swap (required fields, errors, save path).

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_064`.
- Blocks: `item_356`, `item_357`, `task_061`.
- Related AC: AC2, AC3.
- References:
  - `logics/request/req_064_segment_edit_swap_node_a_b_action_between_save_and_cancel.md`
  - `src/app/hooks/useModelingFormsState.ts`
  - `src/app/hooks/useSegmentFormHandlers.ts`
  - `src/app/components/workspace/ModelingSegmentFormPanel.tsx`
