## task_060_req_063_wire_edit_endpoint_swap_action_orchestration_and_delivery_control - req_063 Wire edit endpoint swap action orchestration and delivery control
> From version: 0.9.8
> Understanding: 100% (feature scope is locked, including swap icon asset usage `ico_swap.svg` with text label in Edit Wire action row)
> Confidence: 96% (icon asset is available and wire form is controlled, leaving mostly implementation and regression execution)
> Progress: 0%
> Complexity: Medium
> Theme: Orchestration for wire edit endpoint A/B swap action delivery
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
`req_063` adds a focused usability improvement in `Wires` > `Edit Wire`:
- a swap action to invert `Endpoint A` and `Endpoint B`
- placed exactly between `Save` and `Cancel edit`

The feature touches:
- wire edit form UI actions,
- wire endpoint draft state manipulation,
- derived endpoint hints,
- save/cancel semantics and regression coverage.

Locked V1 UI decision:
- swap action uses `public/icons/ico_swap.svg` with a visible text label (not icon-only)

# Objective
- Deliver a deterministic `Swap Endpoint A/B` action in `Edit Wire` with the requested placement and no regressions to existing wire create/edit workflows.
- Preserve endpoint metadata and draft-only behavior until `Save`.
- Synchronize `logics` docs after delivery.

# Scope
- In:
  - Orchestrate `item_352`..`item_354`
  - Sequence draft swap logic before UI integration and regression hardening
  - Run targeted and final validation gates
  - Update request/backlog/task progress and delivery notes
- Out:
  - Swap action in create-wire mode
  - Automatic route reversal/recompute logic beyond current submit behavior

# Backlog scope covered
- `logics/backlog/item_352_wire_edit_form_endpoint_swap_state_transform_and_draft_preservation.md`
- `logics/backlog/item_353_wire_edit_form_swap_action_ui_placement_between_save_and_cancel_and_edit_mode_visibility.md`
- `logics/backlog/item_354_regression_coverage_for_wire_edit_endpoint_swap_action_ordering_and_save_cancel_semantics.md`

# Plan
- [ ] 1. Implement wire edit endpoint swap draft-state transform and preserve non-endpoint fields (`item_352`)
- [ ] 2. Add `Edit Wire` swap action with requested placement and edit-only visibility (`item_353`)
- [ ] 3. Add regression coverage for ordering, swap correctness, and save/cancel semantics (`item_354`)
- [ ] 4. Run targeted wire-form validation suites and fix regressions
- [ ] 5. Run final validation matrix
- [ ] FINAL: Update related `logics` docs (request/backlog/task progress + delivery summary)

# Validation
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s quality:ui-modularization`
- `npm run -s quality:store-modularization`
- `npm run -s quality:pwa`
- `npm run -s build`
- `npm run -s test:ci`
- `npm run -s test:e2e`

# Targeted validation guidance (recommended during implementation)
- `npx vitest run src/tests/app.ui.creation-flow-wire-endpoint-refs.spec.tsx`
- `npx vitest run src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
- `npx vitest run src/tests/app.ui.navigation-canvas.spec.tsx`
- `npx vitest run src/tests/app.ui.wire-free-color-mode.spec.tsx`

# Report
- Current blockers: none.
- Risks to track:
  - Swap implementation forgets endpoint-side metadata fields (`connection reference` / `seal reference`).
  - Swap button accidentally submits form (`type="submit"` regression) or exits edit mode.
  - Derived slot hints/conditional endpoint controls desynchronize after swap.
  - Action-row insertion + icon integration regresses layout or ordering assertions in wire-form tests.
- Delivery notes:
  - Implement swap as an explicit draft-state transform (not via synthetic field events).
  - Keep the action edit-only in V1 to limit scope and avoid create-mode UX churn.
  - Use the provided `ico_swap.svg` asset with text label for discoverability and parity with existing icon+label form actions.
  - Prefer a dedicated regression test for endpoint swap correctness if existing wire specs approach line-limit gates.

# References
- `logics/request/req_063_wire_edit_swap_endpoint_a_b_action_between_save_and_cancel.md`
- `logics/backlog/item_352_wire_edit_form_endpoint_swap_state_transform_and_draft_preservation.md`
- `logics/backlog/item_353_wire_edit_form_swap_action_ui_placement_between_save_and_cancel_and_edit_mode_visibility.md`
- `logics/backlog/item_354_regression_coverage_for_wire_edit_endpoint_swap_action_ordering_and_save_cancel_semantics.md`
- `src/app/components/workspace/ModelingWireFormPanel.tsx`
- `src/app/hooks/useModelingFormsState.ts`
- `src/app/hooks/useWireFormHandlers.ts`
- `src/tests/app.ui.creation-flow-wire-endpoint-refs.spec.tsx`
- `public/icons/ico_swap.svg`
