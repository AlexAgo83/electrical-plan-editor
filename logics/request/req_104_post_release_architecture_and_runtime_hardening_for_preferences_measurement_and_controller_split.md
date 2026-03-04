## req_104_post_release_architecture_and_runtime_hardening_for_preferences_measurement_and_controller_split - Post-release architecture and runtime hardening for preferences, measurement lifecycle, and controller split
> From version: 1.3.1
> Status: Done
> Understanding: 100% (delivered and validated end-to-end)
> Confidence: 99%
> Complexity: High
> Theme: Reliability / Maintainability / Runtime safety
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- Close remaining review findings not covered by req_103.
- Prevent silent UI preference resets when persisted schema evolves.
- Remove long-lived hidden DOM measurement artifacts used by callout text metrics.
- Eliminate unstable `react-hooks/exhaustive-deps` suppression in `AppController`.
- Reduce regression risk from very large orchestration/render files.
- Reduce file size very strongly for:
  - `src/app/components/NetworkSummaryPanel.tsx` (`2811` lines baseline),
  - `src/app/AppController.tsx` (`2828` lines baseline).

# Context
- The 1.3.1 release line stabilized export/cartouche/callout behavior and passed CI.
- A focused post-release review identified non-blocking but structural risks:
  - UI preferences currently rely on permissive fallback normalization and can silently diverge on schema evolution.
  - Callout text measurement uses hidden SVG nodes attached to `document.body` without deterministic lifecycle cleanup.
  - `AppController.tsx` still carries an `eslint-disable-next-line react-hooks/exhaustive-deps` guard.
  - `AppController.tsx` and `NetworkSummaryPanel.tsx` remain large mixed-concern files, increasing change-coupling and review cost.
- Current baseline size confirms the risk:
  - `AppController.tsx`: `2828` lines,
  - `NetworkSummaryPanel.tsx`: `2811` lines.

# Objective
- Make runtime behavior deterministic under preference/schema evolution.
- Remove avoidable DOM lifecycle leaks in measurement infrastructure.
- Restore hook dependency correctness without lint suppression.
- Improve codebase modularity with behavior-preserving decomposition.
- Reach strong size reduction goals while keeping behavior parity:
  - `NetworkSummaryPanel.tsx` target: `<= 1000` lines (phase-1),
  - `AppController.tsx` target: `<= 1100` lines (phase-1).

# Scope
- In:
  - introduce explicit `uiPreferences` schema versioning + deterministic migration path;
  - add cleanup-safe lifecycle for callout text measurement nodes (create/use/dispose contract);
  - remove `exhaustive-deps` suppression in `AppController` through stable dependency decomposition;
  - perform phase-1 decomposition of `AppController` and `NetworkSummaryPanel` into focused modules/hooks with explicit line-budget targets;
  - extend regression coverage for migration, measurement lifecycle, and controller effect stability.
- Out:
  - visual redesign of settings/panels/canvas;
  - feature-level behavior changes unrelated to architecture hardening;
  - full rewrite of store architecture.

# Locked execution decisions
- Decision 1: `uiPreferences` persistence gains explicit schema versioning with forward-only deterministic migration.
- Decision 2: Unknown/extra persisted keys are preserved when safe; invalid keys are normalized without full preference reset.
- Decision 3: Callout text measurement infrastructure must not leave orphan hidden DOM nodes after panel unmount or test cleanup.
- Decision 4: `AppController` must pass hook dependency linting without `eslint-disable` for `exhaustive-deps`.
- Decision 5: Decomposition is incremental (phase-1), behavior-preserving, and backed by parity tests.
- Decision 6: Public user workflows and stored network data contracts remain unchanged in this request.
- Decision 7: `NetworkSummaryPanel.tsx` and `AppController.tsx` must each lose at least ~60% of inline responsibility via extraction, not cosmetic reformatting.
- Decision 8: Extraction order is mandatory to reduce risk:
  - `NetworkSummaryPanel` pure helpers first,
  - `NetworkSummaryPanel` callout model/layout second,
  - `AppController` view-sync effects third,
  - `AppController` screen-domain builders fourth.

# Recommended implementation by review point
## Point 1 - UI preferences migration hardening
- Add `version` field to persisted UI preferences payload.
- Implement migration table (`vN -> vN+1`) with deterministic defaults for newly introduced keys.
- Replace broad fallback resets with key-level normalization and migration logging hooks for diagnostics.

## Point 2 - Callout measurement lifecycle
- Encapsulate text measurement in a dedicated utility/hook with explicit `init` and `dispose` semantics.
- Reuse singleton measurement nodes during active lifecycle only.
- Dispose hidden SVG nodes on teardown (`cleanup`, `beforeunload`/`pagehide` safe-path) and ensure test environment isolation.

## Point 3 - AppController exhaustive-deps compliance
- Refactor effect inputs into stable memoized selectors/callback bundles.
- Split side effects by responsibility (state sync vs viewport sync vs persistence sync) to reduce dependency ambiguity.
- Remove lint suppression and assert no behavior regression in network-switch and settings-sync flows.

## Point 4 - Large-file decomposition
- Extract `NetworkSummaryPanel` into dedicated modules:
  - `src/app/components/network-summary/export/networkSummaryExport.ts` (SVG/PNG export orchestration),
  - `src/app/components/network-summary/callouts/calloutModel.ts` (rows/groups/view-model),
  - `src/app/components/network-summary/callouts/calloutLayout.ts` (metrics/cache/measure),
  - `src/app/components/network-summary/callouts/CalloutsLayer.tsx` (callout SVG rendering),
  - `src/app/components/network-summary/layers/SegmentsLayer.tsx` and `NodesLayer.tsx` (render layers).
- Continue `AppController` extraction to domain hooks/modules:
  - `src/app/hooks/controller/useNetworkSummaryViewStateSync.ts` (restore/persist view effects),
  - `src/app/hooks/controller/useOnboardingController.ts` (open/next/target orchestration),
  - `src/app/hooks/controller/useAppControllerScreenDomains.tsx` (home/modeling/analysis/aux content composition),
  - `src/app/hooks/controller/appControllerSettingsBindings.ts` (settings/canvas mapping bundles).
- Keep API boundaries stable and update imports/tests with minimal surface change.

# Decomposition blueprint and target file map
## A. `NetworkSummaryPanel` extraction map
- Keep in panel file:
  - top-level props contract,
  - high-level orchestration (`useMemo`/`useCallback` glue),
  - final JSX composition.
- Move out of panel file:
  - export utilities and cartouche/frame builders,
  - callout text measurement/cache + table/layout calculations,
  - callout drawing layer and node/segment rendering helpers.
- Target size after phase-1: `<= 1000` lines.

## B. `AppController` extraction map
- Keep in controller file:
  - root composition role,
  - store snapshot selection,
  - final `AppShellLayout` wiring.
- Move out of controller file:
  - per-network summary view state restore/persist effects,
  - onboarding orchestration callbacks and side effects,
  - workspace/screen content assembly and settings binding bundles.
- Target size after phase-1: `<= 1100` lines.

## C. Delivery sequence
- Step 1: extract `NetworkSummaryPanel` pure export helpers.
- Step 2: extract callout model + layout + rendering layer.
- Step 3: extract `AppController` network summary view sync effect pair and remove lint suppression.
- Step 4: extract onboarding controller and screen-domain builders.
- Step 5: parity pass + lint/type/tests + final line-budget verification.

# Functional behavior contract
## A. Preferences persistence behavior
- Loading persisted preferences must follow schema-version migration, not ad-hoc fallback.
- Missing keys receive deterministic defaults.
- Corrupted/incompatible keys are normalized locally without wiping unrelated valid preferences.

## B. Measurement lifecycle safety
- Callout text measurement must provide stable metrics while mounted.
- No orphan hidden SVG measurement node remains after cleanup/unmount.
- Repeated mount/unmount cycles do not accumulate measurement DOM artifacts.

## C. Hook dependency correctness
- `AppController` has no `exhaustive-deps` suppression.
- Effects run only when true dependencies change.
- Network summary preferences sync behavior remains equivalent to current UX.

## D. Maintainability and modularity
- `AppController` and `NetworkSummaryPanel` phase-1 extraction reduces mixed responsibilities.
- Extracted modules are unit-testable and ownership boundaries are explicit.
- Existing user-facing behavior remains unchanged.

# Acceptance criteria
- AC1: Persisted `uiPreferences` include explicit schema version and migrate deterministically across known versions.
- AC2: Preferences with partial corruption no longer trigger broad resets; unaffected keys are preserved.
- AC3: Callout text measurement cleanup removes hidden SVG measurement node(s) on teardown.
- AC4: Repeated mount/unmount regression test confirms no DOM measurement-node accumulation.
- AC5: `AppController.tsx` no longer contains `eslint-disable-next-line react-hooks/exhaustive-deps`.
- AC6: Hook linting/dependency checks pass with unchanged user-observable behavior.
- AC7: `NetworkSummaryPanel.tsx` extraction map is implemented and file size reaches `<= 1000` lines.
- AC8: `AppController.tsx` extraction map is implemented and file size reaches `<= 1100` lines.
- AC9: Phase-1 extraction parity coverage is completed for both files.
- AC10: `logics_lint`, `lint`, `typecheck`, `test:ci:ui`, and `test:e2e` pass.

# Validation and regression safety
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci:ui`
- `npm run -s test:e2e`
- targeted checks around:
  - UI preferences migration matrix (legacy payloads, partial corruption, unknown keys);
  - measurement-node lifecycle across mount/unmount cycles;
  - AppController effect stability across network switch + settings updates;
  - no behavior drift in export/callout rendering after decomposition;
  - final line-count budget validation for both target files.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and actionable.
- [x] Scope boundaries are explicit.
- [x] Acceptance criteria are testable.
- [x] Risks and fallback behavior are identified.

# Risks
- Migration logic complexity can introduce subtle preference regressions if legacy payload matrix is incomplete.
- Measurement cleanup too aggressive could break text-width accuracy if lifecycle timing is incorrect.
- Incremental decomposition can create transient import cycles if boundaries are not curated.

# Backlog
- To create from this request:
  - `item_505_ui_preferences_schema_versioning_and_forward_migration_matrix.md`
  - `item_506_ui_preferences_partial_corruption_normalization_without_global_reset.md`
  - `item_507_callout_text_measurement_dom_lifecycle_cleanup_and_regression_coverage.md`
  - `item_508_network_summary_panel_export_pipeline_extraction_and_layer_split_phase_1.md`
  - `item_509_network_summary_panel_callout_model_layout_render_extraction_and_parity_tests.md`
  - `item_510_app_controller_network_summary_view_state_sync_hook_extraction_and_exhaustive_deps_removal.md`
  - `item_511_app_controller_onboarding_controller_extraction_and_callbacks_stabilization.md`
  - `item_512_app_controller_screen_domain_and_settings_binding_assembly_extraction.md`
  - `item_513_req_104_validation_matrix_traceability_and_line_budget_closure.md`

# Orchestration task
- `logics/tasks/task_080_req_104_post_release_architecture_and_runtime_hardening_orchestration_and_delivery_control.md`

# References
- `src/app/AppController.tsx`
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/components/network-summary/`
- `src/app/hooks/useUiPreferences.ts`
- `src/adapters/persistence/migrations.ts`
- `src/app/hooks/controller/useAppControllerHeavyHookAssemblers.ts`
- `src/app/hooks/controller/useAppControllerScreenContentSlices.tsx`
- `src/tests/persistence.localStorage.spec.ts`
- `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
- `src/tests/app.ui.settings-canvas-render.spec.tsx`

# Closure
- Delivered through:
  - `logics/tasks/task_080_req_104_post_release_architecture_and_runtime_hardening_orchestration_and_delivery_control.md`
  - backlog `item_505` to `item_513`.
- Final validation matrix completed on 2026-03-04:
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` ✅
  - `npm run -s lint` ✅
  - `npm run -s typecheck` ✅
  - `npm run -s test:ci:ui` ✅
  - `npm run -s test:e2e` ✅
- Final size targets achieved:
  - `src/app/components/NetworkSummaryPanel.tsx`: `975` lines (`<= 1000`) ✅
  - `src/app/AppController.tsx`: `1100` lines (`<= 1100`) ✅
