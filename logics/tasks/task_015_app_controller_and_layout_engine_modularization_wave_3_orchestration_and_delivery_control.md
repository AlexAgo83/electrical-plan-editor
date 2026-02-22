## task_015_app_controller_and_layout_engine_modularization_wave_3_orchestration_and_delivery_control - App Controller and Layout Engine Modularization Wave 3 Orchestration and Delivery Control
> From version: 0.5.1
> Understanding: 100%
> Confidence: 99%
> Progress: 100%
> Complexity: High
> Theme: Controller and Layout Refactor Wave Sequencing
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for wave-3 modularization introduced by `req_016`. This task coordinates sequencing, validation cadence, and regression mitigation for continued `AppController` decomposition and `app-utils-layout` domain split, with final closure and AC traceability.

Backlog scope covered:
- `item_094_app_controller_network_scope_form_orchestration_extraction_wave_3.md`
- `item_095_app_controller_selection_form_sync_and_derived_view_models_extraction.md`
- `item_096_app_controller_screen_render_composition_and_prop_builder_split.md`
- `item_097_layout_utils_domain_split_geometry_grid_scoring_generation_postprocess.md`
- `item_098_layout_split_regression_and_performance_baseline_verification.md`
- `item_099_wave_3_refactor_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# Plan
- [x] 1. Deliver Wave 0 controller network scope form extraction: modularize Network Scope form lifecycle/orchestration from `AppController` (`item_094`)
- [x] 2. Deliver Wave 1 controller selection/form sync and derived view-model extraction: isolate behavior-sensitive orchestration logic (`item_095`)
- [x] 3. Deliver Wave 2 screen render composition split: reduce `AppController` JSX/prop wiring noise while preserving lazy-loading behavior (`item_096`)
- [x] 4. Deliver Wave 3 layout engine domain split: decompose `app-utils-layout.ts` into focused modules (`item_097`)
- [x] 5. Deliver Wave 4 layout regression/performance verification: validate behavior parity and measured responsiveness baseline (`item_098`)
- [x] 6. Deliver Wave 5 closure: full CI/E2E/build/PWA regression pass and AC traceability (`item_099`)
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
    - `npx vitest run src/tests/app.ui.networks.spec.tsx`
    - `npx vitest run src/tests/app.ui.navigation-canvas.spec.tsx`
    - `npx vitest run src/tests/app.ui.inspector-shell.spec.tsx`
    - `npx vitest run src/tests/core.layout.spec.ts`
    - `npx vitest run src/tests/core.pathfinding.spec.ts`
- End-to-end tests:
  - `npm run test:e2e`
- Build / delivery checks:
  - `npm run build`
  - `npm run quality:pwa`

# Report
- Wave status:
  - Wave 0 completed: extracted Network Scope form state/orchestration into dedicated hooks (`useNetworkScopeFormState`, `useNetworkScopeFormOrchestration`) preserving create/edit/cancel/submit, focus restore, and auto-open edit behavior.
  - Wave 1 completed: extracted selection/form synchronization and grouped derived UI models (`useModelingFormSelectionSync`, `useWireEndpointDescriptions`, `useIssueNavigatorModel`, `useInspectorPanelVisibility`) to reduce behavior-sensitive coupling in `AppController`.
  - Wave 2 completed: reduced `AppController` prop wiring noise with grouped prop-builder objects for Network Scope, Inspector, and Network Summary panel composition while preserving lazy-loaded screen boundaries and render order.
  - Wave 3 completed: decomposed `app-utils-layout.ts` into focused layout modules (`layout/types`, `geometry`, `grid`, `scoring`, `postprocess`, `generation`) and reduced `app-utils-layout.ts` to a thin compatibility façade.
  - Wave 4 completed: validated layout behavior and responsiveness baseline with targeted layout/canvas integration tests; no additional performance optimization was required.
  - Wave 5 completed: passed full closure pipeline (`lint`, `typecheck`, quality gates, `test:ci`, `test:e2e`, `build`, `quality:pwa`, Logics lint) and documented AC1..AC8 traceability for `req_016`.
- Current blockers:
  - None.
- Main risks to track:
  - Behavior drift in Network Scope form lifecycle during controller extraction (auto-open/edit/focus restore).
  - Regressions in selection/edit synchronization across modeling + inspector + 2D selection flows.
  - Circular imports or unclear dependency direction during `app-utils-layout` split.
  - Hidden layout behavior drift caused by moving scoring/postprocess helpers across modules.
  - Test fragility if internal structure changes without preserving behavior-first assertions.
- Mitigation strategy:
  - Sequence controller extraction by behavior cluster (Network Scope form -> selection/form sync -> render/prop composition).
  - Keep signatures explicit for extracted hooks and avoid introducing opaque abstraction layers.
  - Split layout utilities structurally before any performance tuning.
  - Run targeted tests after each wave, then full regression at closure.
  - Re-run `build` + `quality:pwa` after refactor waves that affect lazy-loaded composition or chunk boundaries.
- Validation snapshot (kickoff):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` pending
  - App baseline should be green before Wave 0 starts
- Validation snapshot (Wave 0-4 targeted refactor verification):
  - `npm run typecheck` OK
  - `npm run lint` OK
  - `npx vitest run src/tests/core.layout.spec.ts src/tests/app.ui.networks.spec.tsx src/tests/app.ui.navigation-canvas.spec.tsx` OK (21 tests)
  - `npx vitest run src/tests/app.ui.inspector-shell.spec.tsx` OK (6 tests)
- Validation snapshot (Final closure):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` OK
  - `npm run lint` OK
  - `npm run typecheck` OK
  - `npm run quality:ui-modularization` OK
  - `npm run quality:store-modularization` OK
  - `npm run test:ci` OK (26 files / 134 tests)
  - `npm run test:e2e` OK (2/2)
  - `npm run build` OK (lazy chunks + PWA assets generated)
  - `npm run quality:pwa` OK
- AC traceability (`req_016`):
  - AC1/AC2: `AppController` wave-3 orchestration extraction delivered via dedicated hooks and grouped view-model logic with preserved network-scope + selection/form behavior.
  - AC3/AC4: `app-utils-layout.ts` replaced by thin façade over `src/app/lib/layout/*` modules with no circular import issues observed (`lint`/`typecheck` green).
  - AC5/AC6: Layout behavior/responsiveness verified by targeted `core.layout` + navigation/canvas integration tests and E2E smoke; no performance changes added beyond structural split.
  - AC7/AC8: Full validation/build/PWA quality gates passed, including static build chunking and generated service worker/manifest artifacts.
