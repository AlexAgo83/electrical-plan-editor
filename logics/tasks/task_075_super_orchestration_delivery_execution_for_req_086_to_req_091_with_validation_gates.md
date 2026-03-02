## task_075_super_orchestration_delivery_execution_for_req_086_to_req_091_with_validation_gates - Super orchestration delivery execution for req_086 to req_091 with validation gates
> From version: 0.9.18
> Status: Done
> Understanding: 100% (scope covers six cross-cutting UI/export requests with 24 backlog items and explicit closure traceability requirements)
> Confidence: 95% (changes are well-bounded but span settings, rendering, export contracts, and persistence, requiring strict sequencing)
> Progress: 100%
> Complexity: High
> Theme: Cross-request delivery orchestration for wide-screen shell behavior, 2D readability controls, export quality/contracts, and CSV wire schema hardening
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.

# Context
This super-orchestration task coordinates the next delivery bundle:
- `req_086`: global `wide screen` option removing shell max-width cap;
- `req_087`: independent segment-name visibility control (separate from segment lengths);
- `req_088`: export format switch (`SVG`/`PNG`) with `SVG` default and single export action;
- `req_089`: callout tabular layout with optional wire-name visibility and mandatory length visibility;
- `req_090`: optional zoom-invariant node shapes (square/diamond/circle) with hitbox alignment;
- `req_091`: wire CSV export encoding fix + endpoint column schema split (`Begin/End ID + pin`).

The queue is cross-cutting across settings/persistence, network-summary rendering, toolbar/export behavior, and CSV data contract compatibility.

# Objective
- Deliver backlog `item_437` to `item_460` in a deterministic sequence with explicit validation gates.
- Prevent regressions in shell layout, canvas readability controls, export quality/settings, and wire CSV compatibility.
- Keep one orchestration source of truth for execution order, validation evidence, and closure synchronization.

# Scope
- In:
  - orchestration of `item_437..item_460`;
  - sequencing and validation discipline per request bundle;
  - closure synchronization across request/backlog/task docs.
- Out:
  - feature scope outside `req_086..req_091`;
  - architecture redesign unrelated to these requests.

# Request scope covered
- `logics/request/req_086_workspace_panels_wide_screen_option_to_remove_app_max_width_cap.md`
- `logics/request/req_087_canvas_tools_option_to_hide_segment_names_independently_from_segment_lengths.md`
- `logics/request/req_088_network_summary_export_quality_with_svg_default_and_png_switch_in_canvas_tools.md`
- `logics/request/req_089_network_summary_callout_tabular_layout_with_optional_wire_name_visibility_setting.md`
- `logics/request/req_090_network_summary_zoom_invariant_node_shapes_option_for_connectors_splices_and_nodes.md`
- `logics/request/req_091_wire_csv_export_encoding_hardening_and_endpoint_column_split_for_begin_end_id_pin.md`

# Backlog scope covered
- `logics/backlog/item_437_settings_workspace_panels_wide_screen_preference_control_and_state_contract.md`
- `logics/backlog/item_438_app_shell_wide_screen_mode_class_and_max_width_override_behavior.md`
- `logics/backlog/item_439_wide_screen_preference_persistence_restore_and_regression_coverage.md`
- `logics/backlog/item_440_req_086_validation_matrix_and_closure_traceability.md`
- `logics/backlog/item_441_canvas_tools_segment_name_visibility_preference_and_settings_placement.md`
- `logics/backlog/item_442_network_summary_segment_name_render_gating_independent_from_length_labels.md`
- `logics/backlog/item_443_segment_name_visibility_persistence_apply_defaults_and_regression_coverage.md`
- `logics/backlog/item_444_req_087_validation_matrix_and_closure_traceability.md`
- `logics/backlog/item_445_canvas_tools_export_format_preference_svg_png_with_svg_default.md`
- `logics/backlog/item_446_network_summary_export_action_format_switch_and_svg_download_path.md`
- `logics/backlog/item_447_export_preferences_persistence_and_png_background_option_compatibility.md`
- `logics/backlog/item_448_req_088_export_quality_validation_matrix_and_closure_traceability.md`
- `logics/backlog/item_449_callout_tabular_content_structure_for_connector_splice_wire_entries.md`
- `logics/backlog/item_450_canvas_tools_preference_toggle_for_callout_wire_name_visibility.md`
- `logics/backlog/item_451_callout_length_visibility_independence_and_render_regression_coverage.md`
- `logics/backlog/item_452_req_089_callout_tabular_readability_validation_matrix_and_closure_traceability.md`
- `logics/backlog/item_453_canvas_setting_for_zoom_invariant_node_shapes_preference_and_defaults.md`
- `logics/backlog/item_454_network_summary_node_shape_render_scaling_mode_for_connector_splice_node_geometries.md`
- `logics/backlog/item_455_zoom_invariant_node_shapes_interaction_hitbox_and_regression_coverage.md`
- `logics/backlog/item_456_req_090_validation_matrix_and_closure_traceability.md`
- `logics/backlog/item_457_wire_csv_export_utf8_accent_compatibility_hardening_and_download_contract.md`
- `logics/backlog/item_458_wire_csv_remove_endpoints_column_and_define_begin_end_id_pin_schema.md`
- `logics/backlog/item_459_modeling_analysis_wire_csv_schema_alignment_and_regression_tests.md`
- `logics/backlog/item_460_req_091_wire_csv_export_validation_matrix_and_closure_traceability.md`

# Attention points (mandatory delivery discipline)
- `req_086`: wide-screen behavior must be global to shared app shell (all top-level screens).
- `req_088`: keep a single export action in `Network summary`, format driven by setting.
- `req_089`: callout baseline columns fixed (`Technical ID`, `Length`, `Section`), with optional `Wire name` only.
- `req_090`: hit-testing must remain aligned with displayed shape size in both modes.
- `req_091`: pin schema uses `C{index}` / `P{index}` and must stay consistent across Modeling + Analysis exports.
- Preserve existing CSV formula-injection neutralization when hardening encoding.

# Locked implementation decisions
- Wave order is fixed by dependency and risk profile:
  1) req_086 (`437->438->439->440`)
  2) req_087 (`441->442->443->444`)
  3) req_088 (`445->446->447->448`)
  4) req_089 (`449->450->451->452`)
  5) req_090 (`453->454->455->456`)
  6) req_091 (`457->458->459->460`)
- Each request closure item (`440`, `444`, `448`, `452`, `456`, `460`) is mandatory before moving status to done.
- Minimum gate after each implementation item: `typecheck` + targeted tests + `logics_lint` when docs change.

# Plan
- [x] Step 1. Deliver req_086 implementation bundle (`item_437`, `item_438`, `item_439`) and close with `item_440`
- [x] Step 2. Deliver req_087 implementation bundle (`item_441`, `item_442`, `item_443`) and close with `item_444`
- [x] Step 3. Deliver req_088 implementation bundle (`item_445`, `item_446`, `item_447`) and close with `item_448`
- [x] Step 4. Deliver req_089 implementation bundle (`item_449`, `item_450`, `item_451`) and close with `item_452`
- [x] Step 5. Deliver req_090 implementation bundle (`item_453`, `item_454`, `item_455`) and close with `item_456`
- [x] Step 6. Deliver req_091 implementation bundle (`item_457`, `item_458`, `item_459`) and close with `item_460`
- [x] FINAL. Synchronize request/backlog/task statuses, evidence, and closure notes for req_086..req_091

# Validation gates
## A. Minimum wave gate (after each implementation step)
- `npm run -s typecheck`
- targeted tests for touched scope
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` (if logics docs changed)

## B. Req_086 closure gate
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test -- src/tests/app.ui.settings.spec.tsx`
- `npm run -s test -- src/tests/app.ui.workspace-shell-regression.spec.tsx`

## C. Req_087 closure gate
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test -- src/tests/app.ui.settings-canvas-render.spec.tsx`
- `npm run -s test -- src/tests/app.ui.navigation-canvas.spec.tsx`

## D. Req_088 closure gate
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test -- src/tests/app.ui.settings-canvas-render.spec.tsx`
- targeted export verification in `Network summary` for SVG/PNG mode switching

## E. Req_089 closure gate
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test -- src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
- targeted rendering checks for wire-name toggle on/off with length always visible

## F. Req_090 closure gate
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test -- src/tests/app.ui.navigation-canvas.spec.tsx`
- targeted interaction checks (select/drag/hitbox alignment) in both shape modes

## G. Req_091 closure gate
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test -- src/tests/csv.export.spec.ts`
- `npm run -s test -- src/tests/app.ui.list-ergonomics.spec.tsx`
- targeted wire CSV checks for Modeling + Analysis header/row schema alignment

## H. Final gate
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci`
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

# Report
- Current blockers: none.
- Current status: completed.
- Risks to track:
  - class/selector spillover from shell and settings changes;
  - interaction drift in node hitboxes when shape rendering mode changes;
  - export regressions between SVG/PNG mode and PNG background option;
  - CSV contract drift between Modeling and Analysis wire export builders.

# References
- `logics/request/req_086_workspace_panels_wide_screen_option_to_remove_app_max_width_cap.md`
- `logics/request/req_087_canvas_tools_option_to_hide_segment_names_independently_from_segment_lengths.md`
- `logics/request/req_088_network_summary_export_quality_with_svg_default_and_png_switch_in_canvas_tools.md`
- `logics/request/req_089_network_summary_callout_tabular_layout_with_optional_wire_name_visibility_setting.md`
- `logics/request/req_090_network_summary_zoom_invariant_node_shapes_option_for_connectors_splices_and_nodes.md`
- `logics/request/req_091_wire_csv_export_encoding_hardening_and_endpoint_column_split_for_begin_end_id_pin.md`
- `src/app/AppController.tsx`
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
- `src/app/components/workspace/ModelingSecondaryTables.tsx`
- `src/app/hooks/useUiPreferences.ts`
- `src/app/hooks/useAppControllerPreferencesState.ts`
- `src/app/lib/csv.ts`
