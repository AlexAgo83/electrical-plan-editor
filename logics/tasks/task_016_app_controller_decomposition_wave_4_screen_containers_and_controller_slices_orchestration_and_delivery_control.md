## task_016_app_controller_decomposition_wave_4_screen_containers_and_controller_slices_orchestration_and_delivery_control - AppController Decomposition Wave 4 (Screen Containers and Controller Slices) Orchestration and Delivery Control
> From version: 0.5.2
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: High
> Theme: AppController Composition Root Reduction Sequencing
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for wave-4 `AppController` decomposition introduced by `req_017`. This task coordinates sequencing, validation cadence, and regression mitigation for screen-container extraction, controller-slice boundaries, state-pack consolidation, derived-state extraction, and final closure/AC traceability.

Backlog scope covered:
- `item_100_app_controller_modeling_screen_container_and_prop_wiring_extraction.md`
- `item_101_app_controller_analysis_validation_settings_networkscope_screen_containers_extraction.md`
- `item_102_app_controller_screen_domain_controller_slices_extraction.md`
- `item_103_app_controller_local_ui_state_pack_extraction.md`
- `item_104_app_controller_derived_state_and_selector_bundle_extraction.md`
- `item_105_app_controller_hook_dependency_config_builder_simplification.md`
- `item_106_app_controller_wave_4_closure_regression_and_ac_traceability.md`

# Plan
- [ ] 1. Deliver Wave 0 modeling screen container extraction: move modeling JSX/prop wiring out of `AppController` (`item_100`)
- [ ] 2. Deliver Wave 1 remaining screen containers extraction: analysis/validation/settings/network-scope containers (`item_101`)
- [ ] 3. Deliver Wave 2 controller slice extraction: introduce explicit screen/domain slices with narrow contracts (`item_102`)
- [ ] 4. Deliver Wave 3 local UI state pack extraction: reduce `useState` noise via cohesive state packs (`item_103`)
- [ ] 5. Deliver Wave 4 derived-state/selector bundle extraction: separate read-only models from orchestration (`item_104`)
- [ ] 6. Deliver Wave 5 hook dependency config simplification: reduce inline dependency assembly noise (`item_105`)
- [ ] 7. Deliver Wave 6 closure: full regression/build/PWA pass and AC traceability for `req_017` (`item_106`)
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
    - `npx vitest run src/tests/app.ui.validation.spec.tsx`
    - `npx vitest run src/tests/app.ui.settings.spec.tsx`
- End-to-end tests:
  - `npm run test:e2e`
- Build / delivery checks:
  - `npm run build`
  - `npm run quality:pwa`

# Report
- Wave status:
  - Wave 0 planned: extract modeling screen container and remove the largest modeling JSX/prop wiring block from `AppController`.
  - Wave 1 planned: extract remaining screen containers (analysis/validation/settings/network-scope) and simplify `AppController` render branches.
  - Wave 2 planned: introduce screen/domain controller slices with explicit inputs/outputs, avoiding a mega-hook anti-pattern.
  - Wave 3 planned: consolidate cohesive local UI state into state-pack hooks aligned with slice/container boundaries.
  - Wave 4 planned: extract derived read-only state/selector bundles to separate computed models from event orchestration.
  - Wave 5 planned: simplify inline hook dependency config assembly using explicit builders/intermediate hooks without hidden coupling.
  - Wave 6 planned: run full closure validation and document `req_017` AC1..AC8 traceability.
- Current blockers:
  - None at kickoff.
- Main risks to track:
  - Behavior drift during container extraction due to accidental prop omissions or conditional render-order changes.
  - Hidden coupling introduced while creating controller slices or state packs.
  - Lazy-loading/chunking regressions if screen-container boundaries alter import placement.
  - Refactor churn that moves complexity into a mega-hook instead of reducing it.
  - Test fragility if refactor changes implementation structure without preserving behavior-first assertions.
- Mitigation strategy:
  - Extract one screen/container pattern first (modeling) and validate before repeating across remaining screens.
  - Keep slice/state-pack contracts explicit and narrow; prefer composition of small hooks over monolithic abstractions.
  - Preserve child component public props and behavior during each wave.
  - Run targeted UI integration suites after each extraction wave, then full closure pipeline.
  - Re-run `build` + `quality:pwa` before closure to verify lazy-loading and static-host/PWA integrity.
- Validation snapshot (kickoff):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` pending
  - Baseline `req_016` closure pipeline should remain green before Wave 0 starts

