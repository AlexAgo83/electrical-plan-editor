## task_013_ui_modularization_wave_2_orchestration_and_delivery_control - UI Modularization Wave 2 Orchestration and Delivery Control
> From version: 0.5.1
> Understanding: 100%
> Confidence: 99%
> Progress: 100%
> Complexity: High
> Theme: Refactor Wave Sequencing and Delivery Safety
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for UI modularization wave 2 introduced by `req_014`. This task coordinates sequencing, dependency control, validation cadence, and regression mitigation across large controller/component splits, utility decomposition, CSS modularization, and safe code-splitting.

Backlog scope covered:
- `item_081_app_controller_orchestration_hook_extraction_wave_2.md`
- `item_082_app_utils_domain_split_and_import_cleanup.md`
- `item_083_analysis_workspace_content_split_by_subscreen.md`
- `item_084_network_summary_panel_svg_overlay_and_toolbar_modularization.md`
- `item_085_modeling_forms_column_per_entity_form_panel_extraction.md`
- `item_086_css_modularization_wave_2_base_workspace_canvas_validation_settings.md`
- `item_087_safe_code_splitting_for_heavy_workspaces_and_chunk_regression_checks.md`
- `item_088_ui_ci_regression_pass_line_budget_exception_cleanup_and_e2e_alignment.md`

# Plan
- [x] 1. Deliver Wave 0 utility foundation split: decompose `app-utils` and clean imports to reduce cross-cutting refactor friction (`item_082`)
- [x] 2. Deliver Wave 1 controller orchestration extraction: reduce `AppController` to composition-first shell (`item_081`)
- [x] 3. Deliver Wave 2 analysis workspace modularization: split connector/splice/wire analysis content by sub-screen (`item_083`)
- [x] 4. Deliver Wave 3 network summary modularization: split SVG/overlays/toolbar/floating panel concerns (`item_084`)
- [x] 5. Deliver Wave 4 modeling forms modularization: extract per-entity form panels and shared scaffolding (`item_085`)
- [x] 6. Deliver Wave 5 CSS modularization wave 2: reduce oversized style concentration and update exception documentation (`item_086`)
- [x] 7. Deliver Wave 6 runtime delivery optimization: add safe code-splitting and validate chunk/PWA/static-host compatibility (`item_087`)
- [x] 8. Deliver Wave 7 closure: full UI/CI regression pass, E2E alignment, AC traceability, and exception cleanup (`item_088`)
- [x] FINAL: Update related Logics docs

# Validation
- Documentation / Logics:
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- Static analysis / compile safety:
  - `npm run lint`
  - `npm run typecheck`
- Quality gates:
  - `npm run quality:ui-modularization`
  - `npm run quality:store-modularization`
- Automated tests (unit + integration):
  - `npm run test:ci`
  - Optional targeted runs per wave (recommended before full closure), e.g.:
    - `npx vitest run src/tests/app.ui.navigation-canvas.spec.tsx`
    - `npx vitest run src/tests/app.ui.workspace-shell-regression.spec.tsx`
    - `npx vitest run src/tests/app.ui.inspector-shell.spec.tsx`
- End-to-end tests:
  - `npm run test:e2e`
- Build / delivery checks:
  - `npm run build`
  - `npm run quality:pwa`

# Report
- Wave status:
  - Wave 0 completed: split `app-utils` into `app-utils-shared`, `app-utils-networking`, and `app-utils-layout`, migrated imports, and reduced `app-utils.ts` to a thin compatibility façade.
  - Wave 1 completed: extracted `useNetworkEntityCountsById`, `useEntityRelationshipMaps`, `useNodeDescriptions`, and `useWorkspaceShellChrome` from `AppController`, reducing the controller from ~2208 to ~1965 lines while preserving shell/navigation/PWA behavior.
  - Wave 2 completed: split analysis workspace connector/splice/wire panels into dedicated modules and reduced `AnalysisWorkspaceContent.tsx` to a lightweight composition shell.
  - Wave 3 completed: extracted network summary floating info panels, legend, and route preview subcomponents; reduced `NetworkSummaryPanel.tsx` and preserved 2D behaviors.
  - Wave 4 completed: extracted per-entity modeling form panels plus shared form scaffolding; reduced `ModelingFormsColumn.tsx` to composition routing.
  - Wave 5 completed: modularized `base/workspace/canvas/validation-settings` CSS into scoped imported partials and validated build parity after boundary-safe CSS splits.
  - Wave 6 completed: introduced lazy-loaded screen/workspace surfaces in `AppController` with test-safe eager fallback branch (`import.meta.env.VITEST`) and verified code-split chunks + PWA/static build output.
  - Wave 7 completed: aligned Playwright smoke drawer-close helper with current shell behavior, removed stale UI modularization oversize exceptions, and passed full validation pipeline.
- Current blockers:
  - None.
- Main risks to track:
  - Behavior drift during controller extraction due to hidden sequencing dependencies between effects/handlers.
  - Regression in 2D network interactions when splitting `NetworkSummaryPanel` SVG layers and overlays.
  - Import-cycle risk while splitting `app-utils` and moving helpers closer to feature modules.
  - CSS visual regressions across themes when extracting shared style blocks.
  - Lazy-loading regressions affecting navigation, focus, or PWA/static-host behavior.
- Mitigation strategy:
  - Sequence refactor waves from utility foundations to controller/components, then CSS and code-splitting.
  - Keep behavior-first tests passing after each wave (targeted integration suites), then run full regression (`test:ci` + `test:e2e`) before closure.
  - Preserve public props/interfaces when extracting modules; prefer adapter wrappers over broad call-site rewrites.
  - Re-run `build` + `quality:pwa` after code-splitting changes before final closure.
  - Update line-budget exception documentation immediately when file sizes move.
- Validation snapshot (kickoff):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` pending
  - App CI baseline should remain green before starting Wave 0
- Validation snapshot (Wave 0 partial):
  - `npm run lint` OK
  - `npm run typecheck` OK
  - `npm run test:ci -- src/tests/app.ui.list-ergonomics.spec.tsx src/tests/app.ui.networks.spec.tsx` OK
- Validation snapshot (Wave 0 final):
  - `npm run lint -- src/app/lib/app-utils.ts src/app/lib/app-utils-shared.ts src/app/lib/app-utils-networking.ts src/app/lib/app-utils-layout.ts src/app/AppController.tsx` OK
  - `npm run typecheck` OK
  - `npm run test:ci -- src/tests/app.ui.list-ergonomics.spec.tsx src/tests/app.ui.validation.spec.tsx src/tests/app.ui.navigation-canvas.spec.tsx src/tests/core.layout.spec.ts src/tests/core.pathfinding.spec.ts` OK
- Validation snapshot (Wave 1 partial):
  - `npm run lint -- src/app/AppController.tsx src/app/hooks/useNetworkEntityCountsById.ts` OK
  - `npm run typecheck` OK
- Validation snapshot (Wave 1+ shell extraction):
  - `npm run lint -- src/app/AppController.tsx src/app/hooks/useWorkspaceShellChrome.ts` OK
  - `npm run test:ci -- src/tests/app.ui.workspace-shell-regression.spec.tsx src/tests/pwa.header-actions.spec.tsx` OK
- Validation snapshot (Final closure):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` OK
  - `npm run lint` OK
  - `npm run typecheck` OK
  - `npm run quality:ui-modularization` OK (stale oversize exceptions removed)
  - `npm run quality:store-modularization` OK
  - `npm run test:ci` OK (26 files / 134 tests)
  - `npm run build` OK (lazy chunks generated for screens/workspaces)
  - `npm run test:e2e` OK (2/2)
  - `npm run quality:pwa` OK
