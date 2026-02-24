## task_051_req_050_network_summary_2d_view_state_persistence_orchestration_and_delivery_control - req_050 Orchestration: Network Summary 2D View-State Persistence Delivery Control
> From version: 0.9.2
> Understanding: 97%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium-High
> Theme: Delivery orchestration for per-network 2D view-state persistence (viewport + canvas toggles)
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_050`, which formalizes per-network persistence and restore of the `Network summary` 2D view state:
- viewport (`zoom + pan`),
- canvas toggles (`Info`, `Length`, `Callouts`, `Grid`, `Snap`, `Lock`),
- backward-compatible persistence migration/defaulting,
- regression coverage for reload and network-switch restore behavior.

This wave touches persistence schema, canvas UI state wiring, hydration/restore lifecycle timing, and tests. Controlled sequencing is required to avoid regressions in existing canvas behavior and persistence loading.

# Objective
- Deliver `req_050` in controlled waves with minimal regression risk to canvas interactions and workspace persistence.
- Implement per-network 2D view-state persistence and restore semantics.
- Preserve `Reset` / `Fit` behavior and keep view-state updates out of model undo/redo history.
- Finish with regression coverage, full validation, and `logics` closure synchronization.

# Scope
- In:
  - Wave-based orchestration for `req_050` backlog items (`item_306`..`item_310`)
  - Persistence schema + migration + restore lifecycle coordination
  - Canvas interaction and UI-state persistence wiring
  - Targeted regression coverage and final validation matrix
  - Final AC traceability and `logics` synchronization
- Out:
  - Broader canvas UX redesign (zoom limits, fit heuristics, interaction model changes)
  - Cross-device/cloud synchronization of view state
  - Persistence of unrelated UI preferences outside `req_050` scope

# Backlog scope covered
- `logics/backlog/item_306_network_scoped_network_summary_2d_view_state_persistence_schema_extension_scale_offset_and_canvas_toggles.md`
- `logics/backlog/item_307_network_summary_2d_pan_zoom_and_toggle_persistence_restore_lifecycle_integration.md`
- `logics/backlog/item_308_persistence_migration_and_defaulting_for_network_summary_2d_view_state.md`
- `logics/backlog/item_309_regression_coverage_for_network_summary_2d_view_state_reload_and_per_network_restore.md`
- `logics/backlog/item_310_req_050_network_summary_2d_view_state_persistence_closure_ci_build_and_ac_traceability.md`

# Attention points (mandatory delivery discipline)
- **Do not pollute model undo/redo history:** viewport/toggle persistence is UI/session state.
- **Avoid cross-network state bleed:** a network without persisted view-state must not inherit another network's viewport/toggles.
- **Protect hydration compatibility:** older persisted workspaces must load safely after schema extension.
- **Keep canvas interactions responsive:** persistence writes must not introduce pan/zoom or toggle lag.
- **Preserve current semantics for `Reset` / `Fit`:** only persistence side-effects should be added.
- **Final docs sync required:** request/task/backlog progress and closure notes must be updated.

# Recommended execution strategy (wave order)
Rationale:
- Start with schema typing/default shape so runtime wiring has a stable contract.
- Implement runtime persistence/restore next to validate behavior early.
- Add migration/defaulting before broad regression tests to ensure backward compatibility is covered.
- Add targeted tests once runtime behavior is stable.
- Finish with full matrix validation and `logics` closure synchronization.

# Plan
- [x] Wave 0. Network-scoped 2D view-state schema extension (`scale + offset + Info/Length/Callouts/Grid/Snap/Lock`) (`item_306`)
- [x] Wave 1. Canvas pan/zoom + toggle persistence and restore lifecycle integration (`item_307`)
- [x] Wave 2. Persistence migration/defaulting for 2D view-state (`item_308`)
- [x] Wave 3. Regression coverage for reload + per-network restore (`item_309`)
- [x] Wave 4. Closure: full validation matrix, AC traceability, and `logics` synchronization (`item_310`)
- [x] FINAL. Update related `.md` files to final state (request/task/backlog progress + delivery summary)

# Validation gates
## A. Minimum wave gate (apply after Waves 0-3)
- Static checks:
  - `npm run -s lint`
  - `npm run -s typecheck`
- Tests:
  - Targeted suites for touched files/surfaces
- Persistence safety:
  - Run migration/hydration-focused tests when persistence schema or migrations are touched

## B. Final closure gate (mandatory at Wave 4)
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s quality:ui-modularization`
- `npm run -s quality:store-modularization`
- `npm run -s quality:pwa`
- `npm run -s build`
- `npm run -s test:ci`
- `npm run -s test:e2e`

## C. Targeted test guidance (recommended during Waves 1-3)
- `npm run -s test -- src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
- `npm run -s test -- src/tests/app.ui.navigation-canvas.spec.tsx`
- `npm run -s test -- src/tests/app.ui.networks.spec.tsx`
- persistence/local storage hydration tests related to touched migration modules (if split by file)

## D. Commit gate (apply after each Wave 0-4 and FINAL docs sync if separate)
- Commit only after wave validation passes.
- Commit messages should reference `req_050` wave/scope.
- Update this task with wave status, validation snapshot, commit SHA, and deviations/defers after each wave.

# Cross-feature dependency / collision watchlist
- **Canvas state vs preferences defaults precedence**:
  - Risk: per-network restore unintentionally overrides expected defaults for networks with no persisted view-state.
- **Network switch restore timing**:
  - Risk: restore executes before active network scoped data is available, causing flicker/reset loops.
- **Migration/defaulting + schema versioning**:
  - Risk: malformed or older payloads create partial view-state and inconsistent restore results.
- **Performance during pan/zoom**:
  - Risk: persistence writes on every interaction step cause UI lag or excessive storage churn.

# Mitigation strategy
- Define explicit precedence contract: network-specific persisted view-state first, otherwise existing defaults.
- Restore only when active-network identity is known and scoped state is available.
- Validate/clamp persisted view-state values and default missing fields safely.
- Use write coalescing/debounce if direct persistence writes prove noisy under interaction.

# Report
- Wave status:
  - Wave 0 (schema extension): completed
  - Wave 1 (runtime persistence/restore wiring): completed
  - Wave 2 (migration/defaulting): completed
  - Wave 3 (regression coverage): completed
  - Wave 4 (closure + AC traceability): completed
  - FINAL (`.md` synchronization): completed
- Current blockers:
  - None.
- Main risks to track:
  - Restore/persist effect ordering regressions (covered by targeted UI tests; a skip-next-persist guard was added).
  - Future drift in Home/nav UI copy causing unrelated CI regressions (several tests were realigned during closure).
- Validation snapshot:
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` ✅
  - `npm run -s lint` ✅ (1 warning: `react-hooks/exhaustive-deps` on `src/app/AppController.tsx` restore effect; intentional dependency restriction to avoid overwrite loops)
  - `npm run -s typecheck` ✅
  - `npm run -s quality:ui-modularization` ✅
  - `npm run -s quality:store-modularization` ✅
  - `npm run -s quality:pwa` ✅
  - `npm run -s build` ✅
  - `npm run -s test:ci` ✅ (35 files, 241 tests)
  - `npm run -s test:e2e` ✅ (2 tests)
  - Targeted verification for `req_050` surfaces ✅:
    - `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
    - `src/tests/persistence.localStorage.spec.ts`
    - `src/tests/app.ui.networks.spec.tsx`
    - `src/tests/store.reducer.networks.spec.ts`
- AC traceability (`req_050`) delivery mapping (actual):
  - AC1 -> `item_307`, verified by `item_309` UI reload restore test + `item_310` validation matrix
  - AC2 -> `item_307`, verified by `item_309` UI reload restore test (Info/Length/Callouts/Grid/Snap/Lock) + `item_310`
  - AC3 -> `item_307`, verified by `item_309` per-network switch restore test + `item_310`
  - AC4 -> `item_307`, covered by runtime persistence wiring and retained canvas action behavior in full regression matrix (`item_310`)
  - AC5 -> `item_308`, verified by persistence migration/defaulting tests + `item_310`
  - AC6 -> `item_307`, verified by `trackHistory: false` dispatch usage and reducer behavior review + regression suite (`item_310`)
  - AC7 -> `item_309`, verified by targeted + CI/E2E validation in `item_310`

# References
- `logics/request/req_050_network_summary_2d_viewport_zoom_pan_persistence_per_network_resume_and_restore.md`
- `logics/backlog/item_306_network_scoped_network_summary_2d_view_state_persistence_schema_extension_scale_offset_and_canvas_toggles.md`
- `logics/backlog/item_307_network_summary_2d_pan_zoom_and_toggle_persistence_restore_lifecycle_integration.md`
- `logics/backlog/item_308_persistence_migration_and_defaulting_for_network_summary_2d_view_state.md`
- `logics/backlog/item_309_regression_coverage_for_network_summary_2d_view_state_reload_and_per_network_restore.md`
- `logics/backlog/item_310_req_050_network_summary_2d_view_state_persistence_closure_ci_build_and_ac_traceability.md`
- `src/app/hooks/useCanvasState.ts`
- `src/app/hooks/useCanvasInteractionHandlers.ts`
- `src/app/hooks/useWorkspaceHandlers.ts`
- `src/app/AppController.tsx`
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/store/types.ts`
- `src/store/networking.ts`
- `src/adapters/persistence/migrations.ts`
- `src/adapters/persistence/localStorage.ts`
- `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/app.ui.networks.spec.tsx`
