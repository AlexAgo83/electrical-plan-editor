## item_354_regression_coverage_for_wire_edit_endpoint_swap_action_ordering_and_save_cancel_semantics - Regression coverage for wire edit endpoint swap action ordering and save/cancel semantics
> From version: 0.9.8
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium-High
> Theme: Regression safety for wire edit endpoint swap feature
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The endpoint swap feature affects wire edit state, action ordering, and save/cancel semantics. Without targeted regression coverage, the action could regress form submission behavior or silently corrupt endpoint-side metadata.

# Scope
- In:
  - Add UI regression tests for `Edit Wire` action row ordering (`Save`, `Swap`, `Cancel edit`) and icon+label presence for the swap action.
  - Add endpoint swap correctness tests (kind/id/index + connection/seal refs).
  - Add tests confirming swap is draft-only (no auto-save, no edit-mode exit).
  - Add save-after-swap persistence tests.
  - Add cancel-after-swap discard tests (normal cancel semantics preserved).
  - Add create-wire non-regression coverage (swap action absent in create mode).
- Out:
  - Exhaustive permutations of every endpoint/value combination beyond representative coverage.

# Acceptance criteria
- Automated tests verify action placement and edit-only visibility of the swap button.
- Automated tests verify swap action icon contract (`ico_swap.svg` usage) and visible label (not icon-only).
- Automated tests verify endpoint swap correctness including metadata fields.
- Automated tests verify save/cancel semantics remain correct after swap usage.
- Existing wire form/create/edit regression suites remain green.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_063`, `item_352`, `item_353`.
- Blocks: `task_060`.
- Related AC: AC1, AC2, AC3, AC5, AC6.
- References:
  - `logics/request/req_063_wire_edit_swap_endpoint_a_b_action_between_save_and_cancel.md`
  - `src/tests/app.ui.creation-flow-wire-endpoint-refs.spec.tsx`
  - `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
  - `src/app/components/workspace/ModelingWireFormPanel.tsx`
  - `public/icons/ico_swap.svg`
