## item_353_wire_edit_form_swap_action_ui_placement_between_save_and_cancel_and_edit_mode_visibility - Wire edit form swap action UI placement between Save and Cancel and edit-mode visibility
> From version: 0.9.8
> Status: Done
> Understanding: 100% (placement, icon usage, and exact V1 label `Swap endpoints` are explicit for `Edit Wire`)
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Wire form UI action integration and placement ergonomics
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even if endpoint swap logic exists, users cannot use it effectively unless the action is integrated in the `Edit Wire` action row with the exact placement requested by the user.

# Scope
- In:
  - Add a new wire-form action button for endpoint swap.
  - Placement contract in `Edit Wire`:
    - `Save`
    - `Swap endpoints`
    - `Cancel edit`
  - Show the swap action only in `Edit Wire` mode.
  - Use the provided swap icon asset `public/icons/ico_swap.svg` with a visible text label.
  - Ensure the swap action is `type="button"` and does not submit the form.
  - Preserve existing action styling, responsive behavior, and keyboard accessibility.
- Out:
  - Core endpoint swap state transform (handled in `item_352`)
  - Regression coverage (handled in `item_354`)

# Acceptance criteria
- `Edit Wire` action row includes the new swap action between `Save` and `Cancel edit`.
- Swap action is hidden in `Create Wire` mode (V1).
- Swap action uses `public/icons/ico_swap.svg` and keeps a visible text label (not icon-only).
- Swap action visible label is exactly `Swap endpoints` (V1).
- Clicking the swap action does not submit the form or exit edit mode.
- Existing `Save` and `Cancel edit` actions remain functional and visually coherent.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_063`, `item_352`.
- Blocks: `item_354`, `task_060`.
- Related AC: AC1, AC3, AC6.
- Related AC (extended): AC1a.
- References:
  - `logics/request/req_063_wire_edit_swap_endpoint_a_b_action_between_save_and_cancel.md`
  - `src/app/components/workspace/ModelingWireFormPanel.tsx`
  - `src/app/components/workspace/ModelingFormsColumn.types.ts`
  - `src/tests/app.ui.creation-flow-wire-endpoint-refs.spec.tsx`
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
