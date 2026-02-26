## req_063_wire_edit_swap_endpoint_a_b_action_between_save_and_cancel - Wire edit endpoint A/B swap action between Save and Cancel edit
> From version: 0.9.8
> Understanding: 100% (placement, icon usage, label `Swap endpoints`, and no-confirm V1 behavior are now explicit)
> Confidence: 97% (V1 UX semantics are now locked, reducing ambiguity before implementation)
> Complexity: Medium
> Theme: Wire editing ergonomics / endpoint form operations / modeling UX
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- In `Wires` > `Edit Wire`, users need a quick way to invert wire endpoints without manually re-entering both sides.
- The user explicitly wants a new button:
  - in `Edit Wire`
  - **between `Save` and `Cancel edit`**
  - action: swap `Endpoint A` and `Endpoint B`

# Context
The wire form already exposes two controlled endpoint fieldsets:
- `Endpoint A`
- `Endpoint B`

Each endpoint carries multiple pieces of editable state:
- endpoint kind (`connectorCavity` / `splicePort`)
- selected connector/splice id
- cavity/port index
- side-specific metadata (`Connection reference`, `Seal reference`)

Today, reversing endpoints requires manual edits across both fieldsets and is error-prone.

# Objective
- Add a dedicated `Swap Endpoint A/B` action in `Edit Wire` to invert the current endpoint form state in one click.
- Preserve all endpoint-side data during the swap (including side metadata).
- Keep the action local to the edit form (no immediate persistence until `Save`).

# Functional scope
## A. UI action placement and visibility (high priority)
- Add a new button in the `Edit Wire` form action row.
- Placement contract:
  - action row order in `Edit Wire` becomes:
    - `Save`
    - `Swap Endpoint A/B` (or equivalent short label)
    - `Cancel edit`
  - the new button must be **between `Save` and `Cancel edit`**
- V1 visibility contract:
  - show the swap action only when `wireFormMode === "edit"`
  - do not show it in `Create Wire` mode unless explicitly expanded in a follow-up request
- The action should follow existing form action styling and keyboard accessibility patterns.

## B. Swap behavior contract (high priority)
- Clicking the swap action swaps the full editable endpoint state between sides A and B.
- V1 swap must include (at minimum):
  - endpoint kind (`Type`)
  - connector/splice selection
  - cavity/port index
  - `Connection reference`
  - `Seal reference`
- Swap must be in-memory form-state only:
  - no store mutation
  - no implicit submit/save
  - no auto-close of edit mode
- V1 confirmation policy (locked):
  - no confirmation dialog before swap
  - action is directly reversible in draft before `Save`

## C. Derived hints and validation interaction (high priority)
- After swap, all endpoint-dependent derived hints must refresh consistently:
  - occupancy/slot hints (`wireEndpointASlotHint`, `wireEndpointBSlotHint`)
  - endpoint type-specific field visibility (`Connector/Way index` vs `Splice/Port index`)
- Existing wire-form validation behavior must remain intact after swap:
  - invalid technical ID state, endpoint selection requirements, and submit rules remain unchanged.

## D. Data preservation and normalization expectations (medium-high priority)
- Swap should preserve user-entered values exactly as currently held in the edit form state (before final submit normalization), including:
  - whitespace in metadata inputs (until normal form submit logic trims/normalizes if applicable)
  - currently selected endpoint kind and side-specific values
- Swap should not alter non-endpoint wire fields:
  - wire name
  - technical ID
  - section
  - color fields/mode
  - route fields (if any route state is edited elsewhere)

## E. UX and semantics (medium priority)
- Label contract (V1, locked):
  - visible label: `Swap endpoints`
- V1 UX policy:
  - use the provided swap icon asset with text (`icon + text`) for discoverability
  - no confirmation prompt (swap is draft-only and reversible before save)
- Icon contract (V1, locked):
  - use `public/icons/ico_swap.svg` for the swap action icon
  - preserve text label alongside the icon (do not use icon-only button in V1)
- The button should be a normal button (`type="button"`) and not submit the form.

## F. Regression coverage (medium priority)
- Add regression coverage for:
  - button presence only in `Edit Wire`
  - action row placement between `Save` and `Cancel edit`
  - endpoint kind/id/index/metadata swap correctness
  - no auto-submit/no edit-mode exit on swap
  - successful save after swap persists swapped endpoints correctly
  - cancel-after-swap discards swapped draft as normal edit cancellation behavior

# Non-functional requirements
- Swap action should be instantaneous and purely local state manipulation.
- No regressions to create-wire flow, endpoint reference/seal reference behavior, or wire edit submit/cancel workflows.

# Validation and regression safety
- Add/extend tests for:
  - `Edit Wire` action row contains `Save`, `Swap`, `Cancel edit` in the correct order
  - swap click does not open a confirmation dialog
  - swapping connector/splice endpoint combinations preserves metadata references per side
  - swap updates endpoint fieldset values and derived slot hints
  - submit after swap persists the swapped endpoints
  - cancel after swap restores original persisted wire state (normal cancel semantics)
- Run full validation pipeline after implementation (`lint`, `typecheck`, `quality:*`, `build`, `test:ci`, `test:e2e`, `logics_lint`)

# Acceptance criteria
- AC1: `Edit Wire` exposes a swap action between `Save` and `Cancel edit`.
- AC1a: The swap action uses the provided swap icon asset (`public/icons/ico_swap.svg`) with a visible text label.
- AC1b: The visible swap action label is `Swap endpoints`.
- AC2: Clicking the swap action swaps the full endpoint form state between `Endpoint A` and `Endpoint B` (kind, target ids, indexes, connection/seal references).
- AC3: Swap is draft-only (no auto-save, no edit-mode exit) and preserves non-endpoint wire fields.
- AC4: Derived endpoint hints/conditional fields remain coherent after swap.
- AC5: Saving after swap persists the swapped endpoints correctly; existing cancel semantics remain functional.
- AC6: Create-wire flow and existing wire form behaviors remain non-regressed.

# Out of scope
- Automatic route reversal/recomputation semantics tied to endpoint swap (beyond existing submit behavior).
- Swap action in `Create Wire` mode (unless later requested).
- Batch swapping endpoints for multiple wires at once.

# Backlog
- `logics/backlog/item_352_wire_edit_form_endpoint_swap_state_transform_and_draft_preservation.md`
- `logics/backlog/item_353_wire_edit_form_swap_action_ui_placement_between_save_and_cancel_and_edit_mode_visibility.md`
- `logics/backlog/item_354_regression_coverage_for_wire_edit_endpoint_swap_action_ordering_and_save_cancel_semantics.md`

# Orchestration task
- `logics/tasks/task_060_req_063_wire_edit_endpoint_swap_action_orchestration_and_delivery_control.md`

# References
- `src/app/components/workspace/ModelingWireFormPanel.tsx`
- `src/app/components/workspace/ModelingFormsColumn.types.ts`
- `src/app/hooks/useWireFormHandlers.ts`
- `src/app/hooks/useModelingFormsState.ts`
- `src/tests/app.ui.creation-flow-wire-endpoint-refs.spec.tsx`
- `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
- `public/icons/ico_swap.svg`
