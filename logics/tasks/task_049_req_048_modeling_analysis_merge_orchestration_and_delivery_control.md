## task_049_req_048_modeling_analysis_merge_orchestration_and_delivery_control - req_048 Orchestration: Modeling+Analysis Workspace Merge Delivery Control
> From version: 0.9.1
> Understanding: 99%
> Confidence: 96%
> Progress: 100%
> Complexity: High
> Theme: Delivery orchestration for unified Modeling workspace, migrated Analysis panels, and compatibility navigation alias in req_048
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_048`, which merges `Modeling` and `Analysis` into a unified workspace experience by migrating `Analysis` panels into `Modeling` and using a phased compatibility strategy for navigation.

Key req_048 baselines to preserve:
- `Modeling` becomes the primary workspace for both editing and analysis tasks.
- `Analysis` remains temporarily as a **compatibility alias/redirect** in Phase 1.
- Activating `Analysis` routes into `Modeling` in an **analysis-focused mode**.
- The alias restores the last selected analysis sub-panel when available, otherwise defaults to `Wires`.
- Unified panel access should rely on sub-navigation (one panel family/focus at a time) to avoid overload.
- Panel-local filter/sort state should be preserved where architecture allows.

This task defines sequencing, validation gates, and closure traceability so the merge can ship progressively with low regression risk and a documented compatibility path.

# Objective
- Deliver `req_048` in controlled waves with a low-risk Phase 1 integration (reuse + composition).
- Preserve modeling functionality while integrating analysis panel access into the same workspace.
- Keep navigation coherent via a compatibility `Analysis` alias/redirect into `Modeling` (analysis-focused mode).
- Harden selection/panel-state continuity and update regression coverage before closure.
- Finish with final validation gates and synchronized `logics` documentation updates.

# Scope
- In:
  - Wave-based orchestration for `req_048` backlog items (`item_297`..`item_301`)
  - Validation/commit discipline between waves
  - Cross-surface sequencing/collision tracking (workspace composition, panel migration, navigation alias, shared state continuity)
  - Final AC traceability and `logics` synchronization
- Out:
  - Features beyond `req_048`
  - Analysis algorithm/data-model changes
  - Final cleanup removal of compatibility alias if deferred beyond Phase 1
  - Git history rewrite/squashing strategy (unless explicitly requested)

# Backlog scope covered
- `logics/backlog/item_297_modeling_workspace_composition_adds_access_to_analysis_panels.md`
- `logics/backlog/item_298_migrate_analysis_panel_components_into_unified_modeling_workspace_flow.md`
- `logics/backlog/item_299_workspace_navigation_and_analysis_screen_alias_redirect_for_modeling_analysis_merge.md`
- `logics/backlog/item_300_unified_modeling_analysis_selection_state_and_regression_hardening.md`
- `logics/backlog/item_301_req_048_modeling_analysis_merge_closure_ci_build_and_ac_traceability.md`

# Attention points (mandatory delivery discipline)
- **Phase 1 compatibility contract is required:** `Analysis` must behave as an alias/redirect into unified `Modeling`, not a divergent standalone state.
- **Alias landing behavior is strict:** restore last analysis sub-panel when available; fallback to `Wires`.
- **Low-risk integration first:** prefer reusing existing `Analysis*WorkspacePanels` and composition paths before cleanup/refactor.
- **Unified workspace density must remain manageable:** use sub-navigation/one-panel-family focus rather than rendering all panel families simultaneously.
- **State continuity matters:** avoid breaking selection, filter/sort memory, and in-progress modeling context.
- **Wave-based delivery + checkpoints required:** commit after each wave when targeted validations pass.
- **Final docs sync required:** update request/task/backlog statuses and closure notes.

# Recommended execution strategy (wave order)
Rationale:
- Start with unified `Modeling` composition scaffolding so there is a stable host for migrated analysis panels.
- Migrate analysis panel components into that host next, reusing existing implementations.
- Then switch/alias top-level `Analysis` navigation into the unified `Modeling` flow with restore/fallback behavior.
- Finish with state continuity hardening and regression updates once the merged flow is functionally complete.

# Plan
- [x] Wave 0. Unified `Modeling` workspace composition scaffolding for analysis panel access (`item_297`)
- [x] Wave 1. Migrate analysis panel components into unified `Modeling` flow (`item_298`)
- [x] Wave 2. `Analysis` nav entry alias/redirect to `Modeling` analysis-focused mode with last-panel restore / `Wires` fallback (`item_299`)
- [x] Wave 3. Unified selection/panel-state continuity and regression hardening (`item_300`)
- [x] Wave 4. Closure: final validation, AC traceability, and `logics` synchronization (`item_301`)
- [x] FINAL. Update related `.md` files to final state (request/task/backlog progress + delivery summary + defer notes)

# Validation gates
## A. Minimum wave gate (apply after Waves 0-3)
- Documentation / Logics (when `.md` changed):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- Static checks:
  - `npm run -s lint`
  - `npm run -s typecheck`
  - `npm run -s quality:ui-modularization`
- Tests/build:
  - Targeted tests for touched surfaces (recommended first)
  - `npm run -s build`

## B. Final closure gate (mandatory at Wave 4)
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s quality:ui-modularization`
- `npm run -s quality:store-modularization`
- `npm run -s test:ci`
- `npm run -s build`

## C. Targeted test guidance (recommended during Waves 0-3)
- `src/tests/app.ui.workspace-shell-regression.spec.tsx`
- `src/tests/app.ui.list-ergonomics.spec.tsx`
- `src/tests/app.ui.networks.spec.tsx`
- `src/tests/app.ui.navigation-canvas.spec.tsx` (if shared selection/navigation interactions are touched)
- `src/tests/app.ui.home.spec.tsx` (only if top-level routing/empty-state behavior is affected)

## D. Commit gate (apply after each Wave 0-4 and FINAL docs sync if separate)
- Commit only after the wave validation gate passes (green checkpoint preferred).
- Commit messages should reference `req_048` wave/scope.
- Update this task after each wave with wave status, validation snapshot, commit SHA, and blockers/deviations/defers.

# Cross-feature dependency / collision watchlist
- **Workspace composition + migrated panel rendering**:
  - Risk: duplicated panel mounts, layout overflow, or hidden panel interactions when combining modeling and analysis surfaces
- **Navigation alias/redirect** overlaps screen state and route/subscreen memory:
  - Risk: `Analysis` alias opens wrong panel, loses last-panel memory, or creates divergent active-screen state
- **Selection and local panel state continuity**:
  - Risk: switching panel families resets filters/sorts or destroys editing context unexpectedly
- **Lazy loading / module registry wiring**:
  - Risk: merged composition breaks lazy imports or loads analysis-heavy UI eagerly
- **Regression tests and snapshots**:
  - Risk: screen-level assumptions about a standalone `Analysis` screen become stale and need coordinated updates

# Mitigation strategy
- Build a unified `Modeling` host mode first, then progressively wire in existing analysis components.
- Reuse `AnalysisWorkspaceContent` / `Analysis*WorkspacePanels` composition where possible before refactoring internals.
- Implement `Analysis` alias as a thin redirect/wrapper to unified `Modeling` mode to avoid duplicated state machines.
- Persist/reuse last-analysis-subpanel memory in one navigation state path with explicit `Wires` fallback.
- Add targeted tests for alias landing and panel switching before broad closure validation.

# Report
- Wave status:
  - Wave 0 (unified Modeling composition scaffolding): completed
  - Wave 1 (analysis panel component migration): completed
  - Wave 2 (Analysis alias/redirect + restore/fallback): completed
  - Wave 3 (state continuity + regression hardening): completed
  - Wave 4 (closure + AC traceability): completed
  - FINAL (`.md` synchronization): completed
- Current blockers:
  - None.
- Main risks to track:
  - Phase 2 cleanup (full legacy `Analysis` wrapper/path removal) is intentionally deferred; compatibility alias remains by design.
  - Future panel taxonomy changes should keep `lastAnalysisSubScreen` restore keys synchronized to avoid stale panel fallback churn.
- Validation snapshot:
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` ✅
  - `npm run -s typecheck` ✅
  - `npm run -s lint` ✅
  - `npm run -s quality:ui-modularization` ✅
  - `npm run -s quality:store-modularization` ✅
  - `npm run -s build` ✅
  - `npm run -s test:ci` ✅ (`34` files / `232` tests)
  - Targeted UI suites run during delivery/hardening (`workspace-shell-regression`, `networks`, `list-ergonomics`, `theme`, `network-summary-workflow-polish`, `navigation-canvas`) ✅
- Delivery snapshot:
  - `ed81e64` `ui: improve table readability and unify analysis into modeling` (Phase 1 composition + panel integration + alias baseline)
  - `819d511` `ui: preserve analysis panel state across modeling alias toggles` (state continuity hardening + duplicate network summary removal)
  - `1086f80` `test: align workspace specs with modeling-analysis alias behavior` (regression suite alignment for alias fallback and active-tab expectations)
- AC traceability (`req_048`) target mapping (planned):
  - AC1 -> `item_297`, `item_298`, `item_301`
  - AC2 -> `item_298`, `item_300`, `item_301`
  - AC3 -> `item_297`, `item_299`, `item_301`
  - AC4, AC5 -> `item_299`, `item_301`
  - AC6, AC7 -> `item_300`, `item_301`
  - AC8 -> `item_297`, `item_298`, `item_300`, `item_301`
  - AC9 -> `item_297`, `item_298`, `item_300`, `item_301`
  - AC10 -> `item_299`, `item_300`, `item_301`

# References
- `logics/request/req_048_merge_modeling_and_analysis_by_migrating_analysis_panels_into_modeling_workspace.md`
- `logics/backlog/item_297_modeling_workspace_composition_adds_access_to_analysis_panels.md`
- `logics/backlog/item_298_migrate_analysis_panel_components_into_unified_modeling_workspace_flow.md`
- `logics/backlog/item_299_workspace_navigation_and_analysis_screen_alias_redirect_for_modeling_analysis_merge.md`
- `logics/backlog/item_300_unified_modeling_analysis_selection_state_and_regression_hardening.md`
- `logics/backlog/item_301_req_048_modeling_analysis_merge_closure_ci_build_and_ac_traceability.md`
- `src/app/components/layout/AppShellLayout.tsx`
- `src/app/components/WorkspaceNavigation.tsx`
- `src/app/components/screens/ModelingScreen.tsx`
- `src/app/components/screens/AnalysisScreen.tsx`
- `src/app/components/containers/ModelingWorkspaceContainer.tsx`
- `src/app/components/containers/AnalysisWorkspaceContainer.tsx`
- `src/app/components/workspace/AnalysisWorkspaceContent.tsx`
- `src/app/components/workspace/AnalysisConnectorWorkspacePanels.tsx`
- `src/app/components/workspace/AnalysisSpliceWorkspacePanels.tsx`
- `src/app/components/workspace/AnalysisNodeSegmentWorkspacePanels.tsx`
- `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
- `src/app/components/workspace/ModelingPrimaryTables.tsx`
- `src/app/components/workspace/ModelingSecondaryTables.tsx`
- `src/app/components/appUiModules.tsx`
- `src/app/hooks/useWorkspaceNavigation.ts`
- `src/app/hooks/useWorkspaceHandlers.ts`
- `src/tests/app.ui.workspace-shell-regression.spec.tsx`
- `src/tests/app.ui.list-ergonomics.spec.tsx`
- `package.json`
