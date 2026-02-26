## item_357_regression_coverage_for_segment_edit_node_swap_action_ordering_and_save_cancel_semantics - Regression coverage for segment edit node swap action ordering and save/cancel semantics
> From version: 0.9.8
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Regression safety for segment edit node swap feature
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The segment node-swap feature affects edit-form state and action-row ordering. Without targeted regression coverage, the button could regress submit/cancel behavior or silently fail to persist swapped node selections.

# Scope
- In:
  - Add UI regression tests for `Edit Segment` action row ordering (`Save`, `Swap`, `Cancel edit`) and icon+label presence.
  - Add a regression assertion that no confirmation dialog is opened on swap click.
  - Add node swap correctness tests (`Node A` / `Node B` select values).
  - Add tests confirming swap is draft-only (no auto-save, no edit-mode exit).
  - Add save-after-swap persistence tests.
  - Add cancel-after-swap discard tests.
  - Add create-segment non-regression coverage (swap action absent in create mode).
- Out:
  - Exhaustive permutations of all segment form validation scenarios beyond representative coverage.

# Acceptance criteria
- Automated tests verify action placement and edit-only visibility of the swap button.
- Automated tests verify node swap correctness and icon contract.
- Automated tests verify the visible label is `Swap nodes` and swap click does not prompt confirmation.
- Automated tests verify save/cancel semantics remain correct after swap usage.
- Existing segment create/edit regression suites remain green.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_064`, `item_355`, `item_356`.
- Blocks: `task_061`.
- Related AC: AC1, AC1a, AC2, AC3, AC4, AC5.
- References:
  - `logics/request/req_064_segment_edit_swap_node_a_b_action_between_save_and_cancel.md`
  - `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/app/components/workspace/ModelingSegmentFormPanel.tsx`
  - `public/icons/ico_swap.svg`
