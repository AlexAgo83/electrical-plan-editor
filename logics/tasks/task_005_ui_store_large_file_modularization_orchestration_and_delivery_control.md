## task_005_ui_store_large_file_modularization_orchestration_and_delivery_control - UI and Store Large File Modularization Orchestration and Delivery Control
> From version: 0.1.0
> Understanding: 99%
> Confidence: 97%
> Progress: 55%
> Complexity: High
> Theme: Modularization Delivery
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for large-file modularization across req_005 (UI) and req_006 (store). This task coordinates sequencing, dependency control, validation cadence, and risk tracking for splitting oversized files while preserving behavior.

Backlog scope covered:
- `item_030_app_component_composition_split.md`
- `item_031_canvas_preferences_and_navigation_hook_extraction.md`
- `item_032_ui_stylesheet_modularization.md`
- `item_033_app_ui_test_suite_split_and_shared_helpers.md`
- `item_034_ui_modularization_regression_and_coverage_gate.md`
- `item_035_reducer_module_boundary_definition_and_composed_entrypoint.md`
- `item_036_occupancy_and_wire_transition_helper_extraction.md`
- `item_037_connector_splice_node_segment_handler_split.md`
- `item_038_store_reducer_test_suite_modularization.md`
- `item_039_store_modularization_regression_and_quality_gate.md`

# Plan
- [ ] 1. Freeze module boundary strategy for UI and store split (`item_030`, `item_035`)
- [ ] 2. Deliver Wave 1 UI decomposition (`item_031`, `item_032`) and validate no behavior drift
- [x] 3. Deliver Wave 2 store decomposition (`item_036`, `item_037`) and validate deterministic transitions
- [x] 4. Deliver Wave 3 test modularization (`item_033`, `item_038`) and stabilize split-aligned coverage
- [ ] 5. Deliver Wave 4 quality gates (`item_034`, `item_039`) with AC traceability and file-size policy checks
- [ ] FINAL: Update related Logics docs

# Validation
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run lint`
- `npm run typecheck`
- `npm run test:ci`
- `npm run test:e2e`

# Report
- Wave status:
  - Wave 1 in progress: UI component/hook/style modularization baseline (`item_031`, `item_032` pending).
  - Wave 2 completed: reducer boundaries + helper extraction + domain handler split (`item_035`, `item_036`, `item_037`).
  - Wave 3 completed: test modularization for UI/store (`item_033`, `item_038`).
  - Wave 4 in progress: store quality gate delivered (`item_039`), UI quality gate pending (`item_034`).
- Current blockers: none.
- Main risks to track:
  - Functional drift caused by module extraction order.
  - Import cycles introduced by aggressive splitting.
  - Coverage gaps during test file transitions.
- Mitigation strategy:
  - Stage refactor by bounded concerns and keep behavior-preserving checkpoints.
  - Enforce one-way dependency rules between modules.
  - Maintain continuous regression runs across lint/typecheck/unit/e2e at each wave.
  - Enforce store file-size and modularity policy with `npm run quality:store-modularization`.
