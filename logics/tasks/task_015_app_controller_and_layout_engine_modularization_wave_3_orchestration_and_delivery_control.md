## task_015_app_controller_and_layout_engine_modularization_wave_3_orchestration_and_delivery_control - App Controller and Layout Engine Modularization Wave 3 Orchestration and Delivery Control
> From version: 0.5.1
> Understanding: 99%
> Confidence: 96%
> Progress: 0%
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
- [ ] 1. Deliver Wave 0 controller network scope form extraction: modularize Network Scope form lifecycle/orchestration from `AppController` (`item_094`)
- [ ] 2. Deliver Wave 1 controller selection/form sync and derived view-model extraction: isolate behavior-sensitive orchestration logic (`item_095`)
- [ ] 3. Deliver Wave 2 screen render composition split: reduce `AppController` JSX/prop wiring noise while preserving lazy-loading behavior (`item_096`)
- [ ] 4. Deliver Wave 3 layout engine domain split: decompose `app-utils-layout.ts` into focused modules (`item_097`)
- [ ] 5. Deliver Wave 4 layout regression/performance verification: validate behavior parity and measured responsiveness baseline (`item_098`)
- [ ] 6. Deliver Wave 5 closure: full CI/E2E/build/PWA regression pass and AC traceability (`item_099`)
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
  - Wave 0 planned: extract Network Scope form orchestration (`create/edit/cancel/submit`, auto-open, focus restore) out of `AppController`.
  - Wave 1 planned: extract selection-to-form sync policies and grouped derived view models to reduce behavior-sensitive controller coupling.
  - Wave 2 planned: split screen render composition and prop-builder groupings for modeling/analysis/network summary shells.
  - Wave 3 planned: split `app-utils-layout.ts` into layout-domain modules (geometry/grid/scoring/generation/postprocess/types) while preserving semantics.
  - Wave 4 planned: run targeted layout regression and responsiveness baseline verification, and apply only measured safe micro-optimizations if needed.
  - Wave 5 planned: final CI/E2E/build/PWA closure and AC1..AC8 traceability for `req_016`.
- Current blockers:
  - None at kickoff.
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

