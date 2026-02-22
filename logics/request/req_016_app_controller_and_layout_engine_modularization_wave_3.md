## req_016_app_controller_and_layout_engine_modularization_wave_3 - App Controller and Layout Engine Modularization (Wave 3)
> From version: 0.5.1
> Understanding: 98%
> Confidence: 95%
> Complexity: High
> Theme: Orchestration Simplification and Layout Engine Decomposition
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Continue reducing maintenance risk in `src/app/AppController.tsx` after wave 2 modularization work.
- Decompose `src/app/lib/app-utils-layout.ts` (currently ~900+ lines) into clearer layout-domain modules.
- Improve reviewability/testability of orchestration and 2D layout logic without changing current UX behavior.
- Prepare the codebase for safer future layout algorithm work (crossing minimization / layout generation evolutions).
- Preserve current CI and runtime behavior (including static hosting + PWA compatibility).

# Context
Wave-2 modularization (`req_014`) significantly improved component and CSS structure, but two large files remain key maintainability hotspots:

- `src/app/AppController.tsx` (~1965 lines)
- `src/app/lib/app-utils-layout.ts` (~915 lines)

`AppController.tsx` still concentrates substantial orchestration logic (screen composition, form sync behavior, network scope form lifecycle, derived view models, large JSX composition).
`app-utils-layout.ts` now owns a broad set of layout concerns (geometry/grid helpers, layout generation orchestration, scoring/conflict logic, and normalization/post-processing), which slows targeted changes and increases regression risk.

This request focuses on a third modularization wave centered on those two files, prioritizing structural decomposition and behavior parity before any performance tuning.

Architecture references to preserve:
- `logics/architecture/target_reference_v1_frontend_local_first.md`
- `logics/request/req_009_2d_layout_persistence_and_crossing_minimization.md`
- `logics/request/req_014_ui_modularization_wave_2_controller_analysis_canvas_and_bundle_optimization.md`
- `logics/request/req_015_runtime_robustness_persistence_empty_workspace_semantics_and_ci_release_safety.md`

## Objectives
- Reduce `AppController.tsx` responsibility concentration further (target: composition-first shell with smaller orchestration clusters).
- Extract high-risk behavior clusters from `AppController.tsx` into explicit hooks/modules with clear interfaces.
- Split `app-utils-layout.ts` into focused modules by layout responsibility without changing layout semantics.
- Improve testability of layout helpers and layout-generation orchestration through smaller pure modules.
- Keep any performance optimization work evidence-based (only after structural split and validation).

## Functional Scope
### A. AppController wave-3 decomposition (high priority)
- Continue refactoring `src/app/AppController.tsx` into dedicated orchestration hooks/modules.
- Prioritized extraction candidates:
  - Network Scope form orchestration:
    - open/create/edit/cancel/submit lifecycle
    - network form error handling
    - focus request after create/save
    - auto-open edit form for active network on network-scope entry
  - Selection-to-form synchronization policy:
    - cancel edit on focus-kind changes
    - clear form states when no focused row / clear selection
    - synchronize 2D selection with list/form edit focus rules
  - Derived view-model builders (`useMemo` / `useCallback` clusters):
    - route preview derived model
    - endpoint descriptions / labels
    - panel-specific display models / chip states
  - Prop composition helpers for large child components:
    - modeling tables/forms props
    - analysis workspace props
    - network summary props
  - Render decomposition:
    - screen-specific render blocks (`network-scope`, `modeling`, `analysis`, `validation`, `settings`)
- Keep `AppController.tsx` as top-level composition entrypoint and event wiring shell.

### B. Layout utility decomposition (`app-utils-layout.ts`) (high priority)
- Split `src/app/lib/app-utils-layout.ts` into focused layout modules with explicit ownership.
- Candidate decomposition (exact names can vary if equivalent and clearer):
  - `layout.types.ts` (layout-specific shared types/interfaces)
  - `layout-geometry.ts` (distance/intersection/projection helpers)
  - `layout-grid.ts` (clamp/snap/grid-spacing helpers)
  - `layout-scoring.ts` (crossing/conflict/cost scoring)
  - `layout-generation.ts` (main generation orchestration / heuristics)
  - `layout-postprocess.ts` (normalization, fit/offset, final adjustments)
- Keep exports discoverable and avoid circular imports.
- Preserve behavior/signatures where possible to reduce migration risk.

### C. Layout performance optimization (measured-only, optional in this wave)
- Performance work is allowed only if structural decomposition is complete and validated first.
- Allowed optimization candidates (if justified by measured cost):
  - caching/reuse of derived adjacency/index structures during generation
  - avoiding repeated crossing/conflict recomputations
  - short-circuit logic for small graphs where heuristics are unnecessary
- Out of scope for this wave unless minimal/proven:
  - Web Worker migration for layout generation (can be a separate request)
  - large algorithmic redesign

### D. Validation and regression safety
- Preserve current behavior across:
  - network scope form flows
  - modeling/edit/create/cancel behaviors
  - 2D selection + inspector synchronization
  - layout generation outputs and responsiveness expectations
- Keep CI and local quality gates green after each refactor wave.
- Prefer targeted tests during intermediate waves and full regression at closure.

## Acceptance criteria
- AC1: `AppController.tsx` is further reduced and responsibilities are more clearly partitioned into dedicated orchestration hooks/modules.
- AC2: Network Scope form orchestration and selection/form synchronization logic are extracted (or equivalently modularized) with preserved UX behavior.
- AC3: `app-utils-layout.ts` is decomposed into smaller layout-domain modules with equivalent behavior.
- AC4: No circular import issues are introduced by layout-module split or controller hook extraction.
- AC5: `core.layout` and related app integration flows remain behaviorally stable after the split.
- AC6: If performance changes are included, they are limited, measured, and do not change user-visible layout semantics unexpectedly.
- AC7: `npm run lint`, `npm run typecheck`, `npm run quality:ui-modularization`, `npm run quality:store-modularization`, `npm run test:ci`, `npm run test:e2e`, `npm run build`, and `npm run quality:pwa` pass after refactor.
- AC8: Static hosting / PWA compatibility remains intact (no broken chunking/build artifacts).

## Non-functional requirements
- Favor incremental, reviewable refactors (waves) over a single large rewrite.
- Preserve deterministic local-first behavior and persistence compatibility.
- Keep orchestration flow readability explicit; avoid “magic” abstraction layers.
- Minimize blast radius by preserving public props/interfaces where possible.
- Maintain accessibility behavior in shell/screens/forms during controller extraction.

## Out of scope
- New end-user features unrelated to modularization/layout maintainability.
- Layout algorithm redesign or heuristic changes with functional behavior impact.
- Web Worker-based layout execution (unless split-only groundwork and no runtime migration).
- Store architecture changes or domain model changes in `core/`.

# Backlog
- To create from this request:
  - `item_094_app_controller_network_scope_form_orchestration_extraction_wave_3.md`
  - `item_095_app_controller_selection_form_sync_and_derived_view_models_extraction.md`
  - `item_096_app_controller_screen_render_composition_and_prop_builder_split.md`
  - `item_097_layout_utils_domain_split_geometry_grid_scoring_generation_postprocess.md`
  - `item_098_layout_split_regression_and_performance_baseline_verification.md`
  - `item_099_wave_3_refactor_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# References
- `src/app/AppController.tsx`
- `src/app/lib/app-utils-layout.ts`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/app.ui.workspace-shell-regression.spec.tsx`
- `src/tests/core.layout.spec.ts`
- `src/tests/core.pathfinding.spec.ts`
- `tests/e2e/smoke.spec.ts`
- `scripts/quality/check-ui-modularization.mjs`
- `package.json`
- `.github/workflows/ci.yml`
