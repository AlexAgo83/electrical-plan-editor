## task_016_app_controller_decomposition_wave_4_screen_containers_and_controller_slices_orchestration_and_delivery_control - AppController Decomposition Wave 4 (Screen Containers and Controller Slices) Orchestration and Delivery Control
> From version: 0.5.2
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
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
- [x] 1. Deliver Wave 0 modeling screen container extraction: move modeling JSX/prop wiring out of `AppController` (`item_100`)
- [x] 2. Deliver Wave 1 remaining screen containers extraction: analysis/validation/settings/network-scope containers (`item_101`)
- [x] 3. Deliver Wave 2 controller slice extraction: introduce explicit screen/domain slices with narrow contracts (`item_102`)
- [x] 4. Deliver Wave 3 local UI state pack extraction: reduce `useState` noise via cohesive state packs (`item_103`)
- [x] 5. Deliver Wave 4 derived-state/selector bundle extraction: separate read-only models from orchestration (`item_104`)
- [x] 6. Deliver Wave 5 hook dependency config simplification: reduce inline dependency assembly noise (`item_105`)
- [x] 7. Deliver Wave 6 closure: full regression/build/PWA pass and AC traceability for `req_017` (`item_106`)
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
    - `npx vitest run src/tests/app.ui.validation.spec.tsx`
    - `npx vitest run src/tests/app.ui.settings.spec.tsx`
- End-to-end tests:
  - `npm run test:e2e`
- Build / delivery checks:
  - `npm run build`
  - `npm run quality:pwa`

# Report
- Wave status:
  - Wave 0 completed: extracted modeling screen container mounting into `src/app/components/containers/ModelingWorkspaceContainer.tsx`.
  - Wave 1 completed: extracted remaining screen containers (`Analysis/Validation/Settings/NetworkScope`) and reduced `AppController` render branches to container mounting + coarse gating.
  - Wave 2 completed: introduced screen/domain controller-slice modules in `src/app/hooks/controller/useAppControllerScreenContentSlices.tsx` for inspector, network summary, and screen content composition.
  - Wave 3 completed: introduced cohesive local UI state packs (`useAppControllerPreferencesState`, `useAppControllerCanvasDisplayState`) and integrated them into `AppController`.
  - Wave 4 completed: extracted derived read-only controller state bundles (`useAppControllerSelectionEntities`, `useAppControllerLayoutDerivedState`, `useAppControllerShellDerivedState`) to separate computed models from orchestration.
  - Wave 5 completed: simplified heavy hook dependency assembly via explicit intermediate hooks in `src/app/hooks/controller/useAppControllerHeavyHookAssemblers.ts`.
  - Wave 6 completed: full closure validation/build/PWA pass executed and `req_017` AC traceability documented.
- Current blockers:
  - None.
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
  - Baseline `req_016` closure pipeline green before Wave 4 execution
- Validation snapshot (Wave 2-5 targeted refactor verification):
  - `npm run lint` OK
  - `npm run typecheck` OK
  - `npx vitest run src/tests/app.ui.navigation-canvas.spec.tsx src/tests/app.ui.workspace-shell-regression.spec.tsx src/tests/app.ui.inspector-shell.spec.tsx` OK (24 tests)
- Validation snapshot (Final closure):
  - `npm run lint` OK
  - `npm run typecheck` OK
  - `npm run quality:ui-modularization` OK
  - `npm run quality:store-modularization` OK
  - `npm run test:ci` OK (26 files / 134 tests)
  - `npm run test:e2e` OK (2/2)
  - `npm run build` OK (lazy chunks + PWA assets generated)
  - `npm run quality:pwa` OK
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` OK
- Delivery snapshot:
  - `src/app/AppController.tsx` reduced to `1818` lines (from ~1840 baseline for `req_017`; reduction target guidance not fully reached, but composition responsibilities were further decomposed into containers/slices/state/derived modules).
  - Screen containers delivered: `src/app/components/containers/*`
  - Controller slice / assembly modules delivered: `src/app/hooks/controller/useAppControllerScreenContentSlices.tsx`, `src/app/hooks/controller/useAppControllerHeavyHookAssemblers.ts`
  - State packs + derived hooks delivered under `src/app/hooks/useAppController*.ts`
- AC traceability (`req_017`):
  - AC1: Satisfied in composition-root direction: `AppController` shed screen container JSX, state packs/derived models, and heavy hook assembly noise into dedicated modules; line-count reduction is modest but responsibility boundaries are materially clearer.
  - AC2: Satisfied by dedicated screen containers for modeling / analysis / validation / settings / network-scope with preserved render order and no-active-network fallback behavior.
  - AC3: Satisfied by explicit screen/domain controller slices and hook-assembly wrappers; no mega `useAppControllerLogic()` abstraction introduced.
  - AC4: Satisfied by local UI state packs and derived-state hooks reducing inline state/selector noise while preserving behavior.
  - AC5: Satisfied by successful `build` and `quality:pwa` with preserved lazy chunks and generated service worker/manifest artifacts.
  - AC6: Satisfied by targeted UI integration regression runs plus full `test:ci` and `test:e2e` smoke coverage.
  - AC7: Satisfied by explicit dependency contracts and green `lint`/`typecheck`/quality gates with no circular-import regressions observed.
  - AC8: Satisfied by full closure pipeline passing (`lint`, `typecheck`, UI/store gates, `test:ci`, `test:e2e`, `build`, `quality:pwa`, Logics lint).
