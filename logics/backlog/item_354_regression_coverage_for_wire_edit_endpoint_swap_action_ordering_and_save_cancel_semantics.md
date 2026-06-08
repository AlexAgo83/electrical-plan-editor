## item_354_regression_coverage_for_wire_edit_endpoint_swap_action_ordering_and_save_cancel_semantics - Regression coverage for wire edit endpoint swap action ordering and save/cancel semantics
> From version: 0.9.8
> Status: Done
> Understanding: 99%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium-High
> Theme: Regression safety for wire edit endpoint swap feature
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The endpoint swap feature affects wire edit state, action ordering, and save/cancel semantics. Without targeted regression coverage, the action could regress form submission behavior or silently corrupt endpoint-side metadata.

# Scope
- In:
  - Add UI regression tests for `Edit Wire` action row ordering (`Save`, `Swap`, `Cancel edit`) and icon+label presence for the swap action.
  - Add a regression assertion that no confirmation dialog is opened on swap click.
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
- Automated tests verify the visible label is `Swap endpoints` and swap click does not prompt confirmation.
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

# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: `Edit Wire` exposes a swap action between `Save` and `Cancel edit`.
- request-AC2 -> This backlog slice. Evidence needed: Clicking the swap action swaps the full endpoint form state between `Endpoint A` and `Endpoint B` (kind, target ids, indexes, connection/seal references).
- request-AC3 -> This backlog slice. Evidence needed: Swap is draft-only (no auto-save, no edit-mode exit) and preserves non-endpoint wire fields.
- request-AC4 -> This backlog slice. Evidence needed: Derived endpoint hints/conditional fields remain coherent after swap.
- request-AC5 -> This backlog slice. Evidence needed: Saving after swap persists the swapped endpoints correctly; existing cancel semantics remain functional.
- request-AC6 -> This backlog slice. Evidence needed: Create-wire flow and existing wire form behaviors remain non-regressed.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
