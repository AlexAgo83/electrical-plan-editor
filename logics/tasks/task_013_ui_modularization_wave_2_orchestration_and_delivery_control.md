## task_013_ui_modularization_wave_2_orchestration_and_delivery_control - UI Modularization Wave 2 Orchestration and Delivery Control
> From version: 0.5.1
> Understanding: 99%
> Confidence: 96%
> Progress: 10%
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
- [ ] 1. Deliver Wave 0 utility foundation split: decompose `app-utils` and clean imports to reduce cross-cutting refactor friction (`item_082`)
- [ ] 2. Deliver Wave 1 controller orchestration extraction: reduce `AppController` to composition-first shell (`item_081`)
- [ ] 3. Deliver Wave 2 analysis workspace modularization: split connector/splice/wire analysis content by sub-screen (`item_083`)
- [ ] 4. Deliver Wave 3 network summary modularization: split SVG/overlays/toolbar/floating panel concerns (`item_084`)
- [ ] 5. Deliver Wave 4 modeling forms modularization: extract per-entity form panels and shared scaffolding (`item_085`)
- [ ] 6. Deliver Wave 5 CSS modularization wave 2: reduce oversized style concentration and update exception documentation (`item_086`)
- [ ] 7. Deliver Wave 6 runtime delivery optimization: add safe code-splitting and validate chunk/PWA/static-host compatibility (`item_087`)
- [ ] 8. Deliver Wave 7 closure: full UI/CI regression pass, E2E alignment, AC traceability, and exception cleanup (`item_088`)
- [ ] FINAL: Update related Logics docs

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
  - Wave 0 in progress: extracted generic constants/sort/parsing helpers into `src/app/lib/app-utils-shared.ts` and re-exported from `app-utils.ts` to preserve compatibility while reducing `app-utils.ts` size before import migration cleanup.
  - Wave 1 planned: extract orchestration hooks/modules from `AppController` while preserving event ordering and behavior parity.
  - Wave 2 planned: separate analysis connector/splice/wire UI modules and keep list-first + network-summary layout stable.
  - Wave 3 planned: decompose `NetworkSummaryPanel` into render layers/overlays/toolbar units without changing 2D interaction behavior.
  - Wave 4 planned: extract per-entity modeling form panels and shared `idle/create/edit` scaffolding.
  - Wave 5 planned: reduce CSS line concentration and progressively retire or re-document oversize exceptions.
  - Wave 6 planned: introduce safe lazy-loading on heavyweight surfaces with static/PWA compatibility checks.
  - Wave 7 planned: run full regression/CI closure, align tests, and validate AC1..AC9 for `req_014`.
- Current blockers:
  - None at orchestration kickoff.
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
