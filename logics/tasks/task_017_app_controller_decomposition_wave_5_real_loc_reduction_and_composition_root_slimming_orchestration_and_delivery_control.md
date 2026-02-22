## task_017_app_controller_decomposition_wave_5_real_loc_reduction_and_composition_root_slimming_orchestration_and_delivery_control - AppController Decomposition Wave 5 (Real LOC Reduction and Composition Root Slimming) Orchestration and Delivery Control
> From version: 0.5.3
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: High
> Theme: Measurable AppController LOC Reduction Sequencing
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for wave-5 `AppController` decomposition introduced by `req_018`. This task coordinates sequencing, validation cadence, and regression mitigation for real LOC reduction work across screen-slice call-site compaction, namespaced state contracts, shell layout extraction, modeling orchestration compaction, lazy/eager wiring compaction, and final closure/AC traceability.

Backlog scope covered:
- `item_107_app_controller_screen_slice_callsite_compaction_and_domain_hooks.md`
- `item_108_app_controller_namespaced_state_contracts_and_destructuring_reduction.md`
- `item_109_app_controller_shell_layout_extraction_and_markup_compaction.md`
- `item_110_app_controller_modeling_domain_orchestrator_compaction.md`
- `item_111_app_controller_lazy_import_registry_and_component_wiring_compaction.md`
- `item_112_app_controller_wave_5_loc_reduction_measurement_and_regression_tracking.md`
- `item_113_app_controller_wave_5_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# Plan
- [x] 1. Deliver Wave 0 screen-slice call-site compaction: reduce large `use*ScreenContentSlice(...)` assembly blocks via domain hooks/contracts (`item_107`)
- [x] 2. Deliver Wave 1 namespaced state contract extraction: reduce flat destructuring noise from local state hooks (`item_108`)
- [x] 3. Deliver Wave 2 shell layout extraction/compaction: move long shell JSX markup out of `AppController` while preserving behavior (`item_109`)
- [x] 4. Deliver Wave 3 modeling-domain orchestrator compaction: simplify connector/splice/node/segment/wire handler plumbing in `AppController` (`item_110`)
- [x] 5. Deliver Wave 4 lazy/eager wiring compaction: reduce import and component registry noise while preserving chunk boundaries (`item_111`)
- [x] 6. Deliver Wave 5 LOC reduction measurement + regression tracking: document baseline and post-wave deltas with targeted validations (`item_112`)
- [x] 7. Deliver Wave 6 closure: full regression/build/PWA pass and AC traceability for `req_018` (`item_113`)
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
  - Wave 0 completed: extracted screen-domain content call-site assembly into dedicated hooks (`useAppControllerModelingAnalysisScreenDomains`, `useAppControllerAuxScreenContentDomains`) reducing large `use*ScreenContentSlice(...)` blocks in `AppController`.
  - Wave 1 completed: replaced the massive `useEntityFormsState` flat destructuring with grouped `formsState` + namespaced mapper (`buildAppControllerNamespacedFormsState`) and introduced namespaced canvas mapper (`buildAppControllerNamespacedCanvasState`) to reduce local state noise and clarify state clusters.
  - Wave 2 completed: extracted shell markup composition into `src/app/components/layout/AppShellLayout.tsx`, preserving drawer/ops/inspector/footer behavior and screen mount order.
  - Wave 3 completed: extracted connector/splice/node/segment/wire handler wiring into `useAppControllerModelingHandlersOrchestrator`, removing repeated modeling plumbing from `AppController`.
  - Wave 4 completed: moved lazy/eager UI module registry wiring into `src/app/components/appUiModules.tsx`, preserving test-safe eager behavior and production chunking.
  - Wave 5 completed: tracked measurable LOC reduction and targeted regression snapshots during implementation (`AppController`: `1818` -> `1361` lines, phase-1 target achieved).
  - Wave 6 completed: full closure validation/build/PWA pass executed and `req_018` AC traceability documented.
- Current blockers:
  - None.
- Main risks to track:
  - LOC-focused refactor introduces opaque abstraction and reduces traceability instead of improving it.
  - Shell extraction breaks overlay/focus/keyboard behavior or changes markup semantics used by tests.
  - Namespaced state contract refactor weakens typing or setter intent.
  - Modeling orchestrator compaction creates hidden coupling across handler hooks.
  - Lazy/eager import compaction alters chunk boundaries or test-safe eager behavior.
- Mitigation strategy:
  - Sequence by highest line-volume wins while preserving explicit contracts.
  - Validate shell/canvas/inspector behavior after each major compaction wave with targeted integration tests.
  - Track LOC snapshots and compare against wave baseline (~1818 lines) to ensure real reduction.
  - Prefer small, auditable orchestrator layers over monolithic controller hooks.
  - Re-run `build` + `quality:pwa` after lazy/eager wiring compaction.
- Validation snapshot (kickoff):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` pending
  - Baseline `req_017` closure pipeline should remain green before Wave 0 starts
- Validation snapshot (Wave 0-4 targeted refactor verification):
  - `npm run typecheck` OK
  - `npm run lint` OK
  - `npx vitest run src/tests/app.ui.workspace-shell-regression.spec.tsx src/tests/app.ui.inspector-shell.spec.tsx src/tests/app.ui.navigation-canvas.spec.tsx` OK (24 tests)
- Validation snapshot (Wave 5 measurement):
  - `src/app/AppController.tsx` baseline (wave-4 closure): `1818` lines
  - `src/app/AppController.tsx` after wave-5 refactor: `1361` lines
  - Delta: `-457` lines (~25.1% reduction)
  - Target status: Phase 1 target (`~1400-1550`) achieved; Phase 2 target guidance (`~1050-1300`) partially approached but not reached.
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
  - New shell/layout + lazy/eager compaction modules:
    - `src/app/components/layout/AppShellLayout.tsx`
    - `src/app/components/appUiModules.tsx`
  - New screen-domain content compaction hooks:
    - `src/app/hooks/controller/useAppControllerModelingAnalysisScreenDomains.tsx`
    - `src/app/hooks/controller/useAppControllerAuxScreenContentDomains.tsx`
  - New modeling orchestrator:
    - `src/app/hooks/controller/useAppControllerModelingHandlersOrchestrator.ts`
  - Namespaced state contract helpers:
    - `src/app/hooks/useAppControllerNamespacedFormsState.ts`
    - `src/app/hooks/useAppControllerNamespacedCanvasState.ts`
- AC traceability (`req_018`):
  - AC1: Satisfied by measurable `AppController` LOC reduction (`1818` -> `1361`) while preserving composition-root responsibilities.
  - AC2: Satisfied by screen-domain hooks that compact `use*ScreenContentSlice(...)` call-site assembly without introducing a mega `useAppControllerLogic()` hook.
  - AC3: Satisfied by replacing large flat form-state destructuring with `formsState` + namespaced mapping (`forms.*`) and introducing namespaced canvas mapping (`canvas.*`) while preserving setters/behavior.
  - AC4: Satisfied by `AppShellLayout` extraction with preserved shell markup behavior (drawers, operations panel, inspector, footer, workspace content mounting).
  - AC5: Satisfied by `useAppControllerModelingHandlersOrchestrator` reducing modeling handler plumbing while keeping explicit connector/splice/node/segment/wire subcontracts.
  - AC6: Satisfied by preserved lazy/eager behavior through `appUiModules`, successful `build`, and passing `quality:pwa`.
  - AC7: Satisfied by targeted UI integration regressions (`navigation-canvas`, `workspace-shell`, `inspector`) plus `test:e2e` smoke coverage remaining green.
  - AC8: Satisfied by full closure pipeline passing (`lint`, `typecheck`, UI/store quality gates, `test:ci`, `test:e2e`, `build`, `quality:pwa`, Logics lint).
