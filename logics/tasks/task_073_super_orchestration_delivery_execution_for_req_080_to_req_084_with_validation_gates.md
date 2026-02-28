## task_073_super_orchestration_delivery_execution_for_req_080_to_req_084_with_validation_gates - Super orchestration delivery execution for req_080 to req_084 with validation gates
> From version: 0.9.18
> Status: Draft
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: High
> Theme: Cross-request delivery orchestration for 2D layout quality, callout focus mode, responsive compaction/mobile mode, and recent-changes persistence
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.

# Context
This super-orchestration task coordinates the next delivery bundle:
- `req_080`: stronger crossing reduction in 2D generate pipeline;
- `req_081`: selected-callout-only preference override in canvas tools;
- `req_082`: two-column compact import/export panel layout;
- `req_083`: app-wide mobile mode and removal of global minimum width lock;
- `req_084`: persistence of Network Scope recent changes across relaunch.

The queue is cross-cutting across layout algorithms, settings/persistence contracts, responsive shell behavior, and history metadata hydration.

# Objective
- Deliver backlog `item_413` to `item_432` in a deterministic sequence with quality gates.
- Prevent regressions in layout determinism, settings behavior, responsive usability, and persistence reliability.
- Keep one orchestration source of truth for execution order, validation, and closure traceability.

# Scope
- In:
  - orchestration of `item_413..item_432`;
  - sequencing and validation discipline per request bundle;
  - closure synchronization across request/backlog/task docs.
- Out:
  - feature scope outside `req_080..req_084`;
  - CI architecture redesign unrelated to these requests.

# Request scope covered
- `logics/request/req_080_2d_generate_layout_crossing_reduction_reprioritized_scoring_and_aggressive_untangle_pass.md`
- `logics/request/req_081_canvas_tools_preference_selected_callout_only_visibility_override.md`
- `logics/request/req_082_import_export_networks_panel_two_column_compaction_and_right_side_selected_export_list.md`
- `logics/request/req_083_app_wide_mobile_mode_enablement_and_removal_of_global_700px_min_width_constraint.md`
- `logics/request/req_084_network_scope_recent_changes_persistence_across_app_relaunch.md`

# Backlog scope covered
- `logics/backlog/item_413_generate_layout_postprocess_radius_and_iteration_budget_increase.md`
- `logics/backlog/item_414_generate_layout_crossing_first_scoring_reprioritization.md`
- `logics/backlog/item_415_generate_layout_aggressive_second_untangle_pass.md`
- `logics/backlog/item_416_req_080_validation_matrix_and_closure_traceability.md`
- `logics/backlog/item_417_canvas_tools_selected_callout_only_preference_state_and_persistence.md`
- `logics/backlog/item_418_network_summary_callout_render_filter_bound_to_selection.md`
- `logics/backlog/item_419_selected_callout_only_ui_integration_regression_coverage.md`
- `logics/backlog/item_420_req_081_validation_matrix_and_closure_traceability.md`
- `logics/backlog/item_421_import_export_panel_two_column_layout_scaffold.md`
- `logics/backlog/item_422_import_export_panel_action_flow_reorder_with_import_under_export_all.md`
- `logics/backlog/item_423_import_export_panel_regression_coverage_and_responsive_guardrails.md`
- `logics/backlog/item_424_req_082_validation_matrix_and_closure_traceability.md`
- `logics/backlog/item_425_remove_global_min_width_lock_and_define_mobile_shell_baseline.md`
- `logics/backlog/item_426_mobile_responsive_pass_for_settings_validation_and_import_export_surfaces.md`
- `logics/backlog/item_427_mobile_responsive_pass_for_workspace_navigation_and_network_summary_controls.md`
- `logics/backlog/item_428_req_083_mobile_mode_validation_matrix_and_closure_traceability.md`
- `logics/backlog/item_429_recent_changes_metadata_persistence_schema_and_migration_contract.md`
- `logics/backlog/item_430_store_history_hydration_and_persisted_recent_changes_sync.md`
- `logics/backlog/item_431_recent_changes_reload_and_network_scope_regression_test_coverage.md`
- `logics/backlog/item_432_req_084_validation_matrix_and_closure_traceability.md`

# Attention points (mandatory delivery discipline)
- Preserve deterministic layout generation behavior while improving crossing outcomes.
- Keep selected-callout-only default OFF and fully compatible with existing callout toggle semantics.
- Ensure responsive/mobile changes do not degrade desktop ergonomics.
- Keep recent-changes persistence bounded and network-scoped without restoring full undo stacks.

# Locked implementation decisions
- Req_080: crossing count becomes first comparator; second untangle pass only when beneficial/deterministic; benchmark on fixed 3-fixture set (sample, dense synthetic, user-like problematic) with target `>= 2/3` strict crossing reduction and no regression on remaining fixture.
- Req_081: selected-callout-only lives in canvas preferences, default OFF, overrides full-callout mode when ON; selection source is active store selection only (hover/focus excluded).
- Req_082/083: two-column patterns persist when readable and collapse to one-column only when required; shared mobile contract baseline is `<= 900px`.
- Req_083: mobile validation baseline must include both viewport profiles `360x800` and `390x844`.
- Req_084: persist metadata entries only (not undo snapshots), maintain bounded retention and migration safety; metadata stays local-only and is excluded from network import/export file payloads.

# Plan
- [ ] Step 1. Deliver req_080 implementation bundle (`item_413`, `item_414`, `item_415`) and close with `item_416`
- [ ] Step 2. Deliver req_081 implementation bundle (`item_417`, `item_418`, `item_419`) and close with `item_420`
- [ ] Step 3. Deliver req_082 implementation bundle (`item_421`, `item_422`, `item_423`) and close with `item_424`
- [ ] Step 4. Deliver req_083 implementation bundle (`item_425`, `item_426`, `item_427`) and close with `item_428`
- [ ] Step 5. Deliver req_084 implementation bundle (`item_429`, `item_430`, `item_431`) and close with `item_432`
- [ ] FINAL. Synchronize request/backlog/task statuses, evidence, and closure notes for req_080..req_084

# Validation gates
## A. Minimum wave gate (after each implementation step)
- `npm run -s typecheck`
- targeted tests for touched scope
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` (if logics docs changed)

## B. Req_080 closure gate
- `npm run -s lint`
- `npm run -s typecheck`
- targeted layout tests around generation/postprocess/scoring on the fixed 3-fixture benchmark set
- `npm run -s test:ci`

## C. Req_081 closure gate
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test -- src/tests/app.ui.settings-canvas-render.spec.tsx`
- `npm run -s test -- src/tests/app.ui.network-summary-workflow-polish.spec.tsx`

## D. Req_082 + Req_083 closure gate
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test -- src/tests/app.ui.import-export.spec.tsx`
- `npm run -s test -- src/tests/app.ui.settings.spec.tsx`
- targeted narrow-viewport checks for workspace/network-summary flows at `360x800` and `390x844`

## E. Req_084 closure gate
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test -- src/tests/app.ui.networks.spec.tsx`
- `npm run -s test -- src/tests/app.ui.undo-redo-global.spec.tsx`
- `npm run -s test -- src/tests/persistence.localStorage.spec.ts`
- `npm run -s test -- src/tests/network-import-export.spec.ts`

# Report
- Current blockers: none.
- Current status: backlog and orchestration scaffolding created; implementation not started.
- Next execution checkpoint: start Step 1 (`req_080`) with deterministic baseline measurements before changes.

# References
- `logics/request/req_080_2d_generate_layout_crossing_reduction_reprioritized_scoring_and_aggressive_untangle_pass.md`
- `logics/request/req_081_canvas_tools_preference_selected_callout_only_visibility_override.md`
- `logics/request/req_082_import_export_networks_panel_two_column_compaction_and_right_side_selected_export_list.md`
- `logics/request/req_083_app_wide_mobile_mode_enablement_and_removal_of_global_700px_min_width_constraint.md`
- `logics/request/req_084_network_scope_recent_changes_persistence_across_app_relaunch.md`
