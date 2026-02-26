## req_064_segment_edit_swap_node_a_b_action_between_save_and_cancel - Segment edit node A/B swap action between Save and Cancel edit
> From version: 0.9.8
> Understanding: 99% (user asks for a new button in `Segments > Edit Segment`, placed between `Save` and `Cancel edit`, to swap `Node A` and `Node B`)
> Confidence: 96% (segment form is a small controlled form, so swap behavior and regression coverage are straightforward)
> Complexity: Medium
> Theme: Segment editing ergonomics / node-order inversion / modeling UX
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- In `Segments` > `Edit Segment`, users need a quick way to invert `Node A` and `Node B` without manually reselecting both nodes.
- The user explicitly wants a new button:
  - in `Edit Segment`
  - **between `Save` and `Cancel edit`**
  - action: swap `Node A` and `Node B`

# Context
The segment form currently exposes:
- `Segment ID`
- `Node A`
- `Node B`
- `Length (mm)`
- `Sub-network tag (optional)`

`Node A` and `Node B` are separate controlled selects. Reversing a segment direction/order currently requires manual reselection and is slow/error-prone.

# Objective
- Add a dedicated `Swap Node A/B` action in `Edit Segment` to invert the selected nodes in one click.
- Keep the action draft-only until `Save`.
- Preserve all non-node segment form fields and existing save/cancel semantics.

# Functional scope
## A. UI action placement and visibility (high priority)
- Add a new button in the `Edit Segment` form action row.
- Placement contract:
  - action row order in `Edit Segment` becomes:
    - `Save`
    - `Swap nodes` (or equivalent label)
    - `Cancel edit`
  - the new button must be **between `Save` and `Cancel edit`**
- V1 visibility contract:
  - show the swap action only when `segmentFormMode === "edit"`
  - do not show it in `Create Segment` mode unless requested later
- The action should use existing form action styling and keyboard-accessible semantics.

## B. Swap behavior contract (high priority)
- Clicking the swap action swaps the draft values of:
  - `Node A`
  - `Node B`
- Swap is draft-only:
  - no store mutation
  - no implicit submit/save
  - no exit from edit mode
- V1 confirmation policy (locked):
  - no confirmation dialog before swap
  - action is reversible in draft before `Save`
- Swap should be reversible by clicking the action again before `Save`.

## C. Non-node field preservation (high priority)
- Swap must not modify:
  - `Segment ID`
  - `Length (mm)`
  - `Sub-network tag (optional)`
  - existing segment form error state behavior (unless revalidation naturally updates on field changes)
- No auto-recomputation policy (V1, locked):
  - no automatic recomputation/normalization of `Length (mm)` or `Sub-network tag` as a side effect of swap
- Existing atomic rename note/behavior for `Segment ID` in edit mode must remain unchanged.

## D. Validation and form semantics interplay (medium-high priority)
- Swap should preserve existing segment-form validation semantics:
  - required `Node A` / `Node B`
  - required `Length (mm)`
  - submit behavior and error surfacing
- If form logic enforces node-order constraints (current/future), swap must trigger the same normal draft-state validation/update path as manual edits.

## E. UX and icon semantics (medium priority)
- Label contract (V1, locked):
  - visible label: `Swap nodes`
- Icon contract (V1, recommended and available):
  - use `public/icons/ico_swap.svg` with a visible text label (`icon + text`)
  - do not use icon-only button in V1
- No confirmation prompt in V1 (swap is draft-only and reversible).
- The button must be `type="button"` (not submit).

## F. Regression coverage (medium priority)
- Add regression coverage for:
  - button presence only in `Edit Segment`
  - action row placement between `Save` and `Cancel edit`
  - `Node A` / `Node B` swap correctness
  - no auto-submit/no edit-mode exit on swap
  - save-after-swap persists swapped nodes correctly
  - cancel-after-swap discards swapped draft as normal edit cancellation behavior
  - create-segment non-regression (swap action absent in create mode)

# Non-functional requirements
- Swap action should be instantaneous and local form-state manipulation only.
- No regressions to segment create/edit workflows, save/cancel behavior, or focus behavior around the action row.

# Validation and regression safety
- Add/extend tests for:
  - `Edit Segment` action row contains `Save`, `Swap`, `Cancel edit` in the correct order
  - swap click does not open a confirmation dialog
  - swap updates `Node A` and `Node B` select values correctly
  - save after swap persists swapped nodes
  - cancel after swap preserves normal discard semantics
  - create mode does not show the swap action
- Run full validation pipeline after implementation (`lint`, `typecheck`, `quality:*`, `build`, `test:ci`, `test:e2e`, `logics_lint`)

# Acceptance criteria
- AC1: `Edit Segment` exposes a swap action between `Save` and `Cancel edit`.
- AC1a: The swap action uses `public/icons/ico_swap.svg` with a visible text label.
- AC1b: The visible swap action label is `Swap nodes`.
- AC2: Clicking the swap action swaps the draft values of `Node A` and `Node B`.
- AC3: Swap is draft-only (no auto-save, no edit-mode exit) and preserves non-node segment fields.
- AC4: Saving after swap persists the swapped nodes correctly; cancel semantics remain functional.
- AC5: Create-segment flow and existing segment form behaviors remain non-regressed.

# Out of scope
- Auto-inverting segment geometry metadata beyond `Node A` / `Node B` field values.
- Automatic recomputation of `Length (mm)` or `Sub-network tag` when swapping nodes.
- Swap action in `Create Segment` mode (unless later requested).
- Batch swapping nodes for multiple segments at once.

# Backlog
- `logics/backlog/item_355_segment_edit_form_node_swap_state_transform_and_draft_preservation.md`
- `logics/backlog/item_356_segment_edit_form_swap_action_ui_placement_between_save_and_cancel_and_edit_mode_visibility.md`
- `logics/backlog/item_357_regression_coverage_for_segment_edit_node_swap_action_ordering_and_save_cancel_semantics.md`

# Orchestration task
- `logics/tasks/task_061_req_064_segment_edit_node_swap_action_orchestration_and_delivery_control.md`

# References
- `src/app/components/workspace/ModelingSegmentFormPanel.tsx`
- `src/app/components/workspace/ModelingFormsColumn.types.ts`
- `src/app/hooks/useSegmentFormHandlers.ts`
- `src/app/hooks/useModelingFormsState.ts`
- `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `public/icons/ico_swap.svg`
