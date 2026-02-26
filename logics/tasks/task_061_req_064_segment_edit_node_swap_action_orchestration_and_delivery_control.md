## task_061_req_064_segment_edit_node_swap_action_orchestration_and_delivery_control - req_064 Segment edit node swap action orchestration and delivery control
> From version: 0.9.8
> Understanding: 99% (focused segment-edit ergonomics feature with exact UI placement and draft-only swap semantics)
> Confidence: 96% (segment form scope is small and controlled; main work is regression-safe UI integration)
> Progress: 0%
> Complexity: Medium
> Theme: Orchestration for segment edit node A/B swap action delivery
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
`req_064` adds a focused usability improvement in `Segments` > `Edit Segment`:
- a swap action to invert `Node A` and `Node B`
- placed exactly between `Save` and `Cancel edit`
- using the available swap icon asset (`public/icons/ico_swap.svg`) with text label
- with locked V1 label `Swap nodes` and no confirmation dialog

The feature touches:
- segment edit form UI actions,
- draft node selection state manipulation,
- save/cancel semantics,
- regression coverage for ordering and persistence behavior.

# Objective
- Deliver a deterministic `Swap Node A/B` action in `Edit Segment` with the requested placement and no regressions to segment create/edit workflows.
- Keep swap draft-only until `Save`, and preserve non-node fields.
- Synchronize `logics` docs after delivery.

# Scope
- In:
  - Orchestrate `item_355`..`item_357`
  - Sequence draft swap logic before UI integration and regression hardening
  - Run targeted and final validation gates
  - Update request/backlog/task progress and delivery notes
- Out:
  - Swap action in create-segment mode
  - Segment geometry/metadata transforms beyond swapping node selectors

# Backlog scope covered
- `logics/backlog/item_355_segment_edit_form_node_swap_state_transform_and_draft_preservation.md`
- `logics/backlog/item_356_segment_edit_form_swap_action_ui_placement_between_save_and_cancel_and_edit_mode_visibility.md`
- `logics/backlog/item_357_regression_coverage_for_segment_edit_node_swap_action_ordering_and_save_cancel_semantics.md`

# Plan
- [ ] 1. Implement segment edit node swap draft-state transform and preserve non-node fields (`item_355`)
- [ ] 2. Add `Edit Segment` swap action with requested placement, icon, and edit-only visibility (`item_356`)
- [ ] 3. Add regression coverage for ordering, swap correctness, and save/cancel semantics (`item_357`)
- [ ] 4. Run targeted segment-form validation suites and fix regressions
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
- `npx vitest run src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
- `npx vitest run src/tests/app.ui.navigation-canvas.spec.tsx`
- `npx vitest run src/tests/app.ui.network-summary-workflow-polish.spec.tsx`

# Report
- Current blockers: none.
- Risks to track:
  - Swap implementation accidentally touches non-node fields (`Length`, `Sub-network tag`, `Segment ID`).
  - Swap button accidentally submits form or exits edit mode.
  - Action-row insertion + icon integration regresses layout/order assertions.
  - Save/cancel semantics regress after draft swap.
- Delivery notes:
  - Implement swap as a direct draft-state transform (not synthetic select change events).
  - Keep the action edit-only in V1 to avoid create-mode UX churn.
  - Reuse `public/icons/ico_swap.svg` with a visible text label for consistency with recent swap-action requests.
  - Do not auto-recompute `Length (mm)` or `Sub-network tag`; swap is limited to `Node A` / `Node B` draft values.

# References
- `logics/request/req_064_segment_edit_swap_node_a_b_action_between_save_and_cancel.md`
- `logics/backlog/item_355_segment_edit_form_node_swap_state_transform_and_draft_preservation.md`
- `logics/backlog/item_356_segment_edit_form_swap_action_ui_placement_between_save_and_cancel_and_edit_mode_visibility.md`
- `logics/backlog/item_357_regression_coverage_for_segment_edit_node_swap_action_ordering_and_save_cancel_semantics.md`
- `src/app/components/workspace/ModelingSegmentFormPanel.tsx`
- `src/app/hooks/useSegmentFormHandlers.ts`
- `src/app/hooks/useModelingFormsState.ts`
- `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
- `public/icons/ico_swap.svg`
