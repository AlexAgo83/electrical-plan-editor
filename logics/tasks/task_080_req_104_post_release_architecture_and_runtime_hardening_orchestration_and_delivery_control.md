## task_080_req_104_post_release_architecture_and_runtime_hardening_orchestration_and_delivery_control - Req 104 post-release architecture and runtime hardening orchestration and delivery control
> From version: 1.3.1
> Status: In Progress
> Understanding: 99% (scope, sequence, and size-budget constraints are explicit)
> Confidence: 96%
> Progress: 68%
> Complexity: High
> Theme: Reliability / Architecture / Delivery control
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.

# Context
- Orchestration task to deliver:
  - `req_104_post_release_architecture_and_runtime_hardening_for_preferences_measurement_and_controller_split`
- Backlog execution scope:
  - `item_505_ui_preferences_schema_versioning_and_forward_migration_matrix`
  - `item_506_ui_preferences_partial_corruption_normalization_without_global_reset`
  - `item_507_callout_text_measurement_dom_lifecycle_cleanup_and_regression_coverage`
  - `item_508_network_summary_panel_export_pipeline_extraction_and_layer_split_phase_1`
  - `item_509_network_summary_panel_callout_model_layout_render_extraction_and_parity_tests`
  - `item_510_app_controller_network_summary_view_state_sync_hook_extraction_and_exhaustive_deps_removal`
  - `item_511_app_controller_onboarding_controller_extraction_and_callbacks_stabilization`
  - `item_512_app_controller_screen_domain_and_settings_binding_assembly_extraction`
  - `item_513_req_104_validation_matrix_traceability_and_line_budget_closure`
- Hard constraints carried from request:
  - UI preferences persistence uses explicit schema version and deterministic forward migrations;
  - partial corruption handling preserves valid keys and avoids broad resets;
  - callout text measurement nodes are lifecycle-managed and fully cleaned on teardown;
  - `AppController.tsx` contains no `eslint-disable-next-line react-hooks/exhaustive-deps` for network summary view sync;
  - decomposition remains behavior-preserving and incremental;
  - line-budget targets must be met:
    - `NetworkSummaryPanel.tsx <= 1000` lines,
    - `AppController.tsx <= 1100` lines.

# Plan
- [x] 1. Deliver preferences schema hardening (`item_505`, `item_506`)
  - add `uiPreferences` versioning and migration pipeline;
  - add key-level corruption normalization and regression tests.
- [x] 2. Deliver callout measurement lifecycle cleanup (`item_507`)
  - encapsulate measure-node init/dispose lifecycle;
  - validate no hidden-node accumulation across mount/unmount cycles.
- [ ] 3. Deliver `NetworkSummaryPanel` size reduction phase-1 (`item_508`, `item_509`) (In Progress)
  - extract export helpers and rendering layers;
  - extract callout model/layout/render modules with parity tests.
- [ ] 4. Deliver `AppController` size reduction phase-1 (`item_510`, `item_511`, `item_512`) (In Progress)
  - extract network summary view sync hook and remove lint suppression;
  - extract onboarding orchestration;
  - extract screen-domain + settings-binding assembly.
- [ ] 5. Validate and close (`item_513`)
  - execute validation matrix and capture evidence;
  - verify line budgets and update traceability/request closure.
- [ ] FINAL: Update related Logics docs and release-facing docs where needed.

# AC Traceability
- AC1 (`item_505`) -> Preferences schema versioning and migration matrix are explicit.
- AC2 (`item_506`) -> Partial corruption normalization preserves unaffected keys.
- AC3 (`item_507`) -> Measurement lifecycle cleanup eliminates hidden-node accumulation.
- AC4 (`item_510`) -> Exhaustive-deps suppression removed via dedicated sync hook.
- AC5 (`item_508`, `item_509`, `item_512`) -> Strong size reduction and modularization are delivered.
- AC6 (`item_511`) -> Onboarding controller decomposition preserves behavior.
- AC7 (`item_513`) -> Validation/traceability closure and line-budget evidence are complete.

# Validation
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci:ui`
- `npm run -s test:e2e`
- `wc -l src/app/components/NetworkSummaryPanel.tsx src/app/AppController.tsx`

# Definition of Done (DoD)
- [ ] Scope implemented and acceptance criteria covered.
- [ ] Validation commands executed and results captured.
- [ ] Linked request/backlog/task docs updated.
- [ ] Line-budget targets validated and recorded.
- [ ] Status is `Done` and progress is `100%`.

# Report
- 2026-03-04: Delivered `item_505` + `item_506`:
  - `src/app/hooks/useUiPreferences.ts` now migrates persisted preferences (`v1 -> v2`) instead of hard-reset on schema mismatch.
  - workspace migration fallback for `showSegmentNames` aligned to `false` (`src/adapters/persistence/migrations.ts`).
- 2026-03-04: Delivered `item_507`:
  - callout measurement hidden SVG root is lifecycle-cleaned on unmount;
  - regression coverage added in `src/tests/app.ui.settings-canvas-callouts.spec.tsx`.
- 2026-03-04: Partial `item_508`:
  - export pipeline extracted to `src/app/components/network-summary/export/networkSummaryExport.ts`;
  - `NetworkSummaryPanel.tsx` reduced to `2343` lines (from `2811`).
- 2026-03-04: Partial `item_509`:
  - callout model/layout and measurement lifecycle extracted to `src/app/components/network-summary/callouts/calloutLayout.ts`;
  - `NetworkSummaryPanel.tsx` reduced further to `1875` lines with behavior parity maintained in callout-centric UI suites.
- 2026-03-04: Delivered `item_510`:
  - `useNetworkSummaryViewStateSync` hook extracted;
  - `AppController.tsx` exhaustive-deps suppression removed and behavior parity validated.
- Validation executed in this increment:
  - `npm run -s lint` ✅
  - `npm run -s typecheck` ✅
  - `npx vitest run src/tests/persistence.localStorage.spec.ts src/tests/app.ui.settings-pricing.spec.tsx` ✅
  - `npx vitest run src/tests/app.ui.network-summary-bom-export.spec.tsx src/tests/app.ui.settings-canvas-callouts.spec.tsx src/tests/app.ui.network-summary-workflow-polish.spec.tsx src/tests/app.ui.settings-canvas-render.spec.tsx` ✅
