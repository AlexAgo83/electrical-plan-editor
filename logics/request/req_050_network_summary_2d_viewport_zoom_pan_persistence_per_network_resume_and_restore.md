## req_050_network_summary_2d_viewport_zoom_pan_persistence_per_network_resume_and_restore - Network Summary 2D View State Persistence (Zoom + Pan + View Toggles) for Per-Network Resume and Restore
> From version: 0.9.2
> Understanding: 100%
> Confidence: 99%
> Complexity: Medium
> Theme: UX Continuity and State Persistence for 2D Workspace View Resume
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Persist the 2D network view viewport state (`zoom` + `pan`) so users can resume where they left off.
- Persist the 2D network view toggles (`Info`, `Length`, `Callouts`, `Grid`, `Snap`, `Lock`) so the visual workspace state resumes consistently.
- Restore the viewport reliably when re-opening the app and when switching back to a previously visited network.
- Define and implement the persistence scope explicitly (per-network recommended, workspace-level behavior clarified).
- Keep persistence backward-compatible with existing saved workspace data and migrations.

# Context
The current 2D `Network summary` canvas already supports interactive zoom/pan and view toggles (`Info`, `Length`, `Callouts`, `Grid`, `Snap`, `Lock`) with explicit viewport actions (`zoom in/out`, `reset`, `fit to content`), but this view state is UI-local and not persisted.

Observed result:
- users lose their current view framing after reload,
- switching networks does not restore the last viewport used for that network,
- "resume work" flows restore model data but not the visual working context.

The codebase already persists network-scoped editing state (entities, node positions, occupancy, callout positions) and supports schema migrations for persisted workspaces. This makes viewport persistence a good fit for the existing architecture, provided the scope and migration strategy are explicit.

## Objectives
- Persist 2D viewport state (`scale`, `offset`) for the network canvas in a way that supports natural resume workflows.
- Persist per-network canvas view toggles (`Info`, `Length`, `Callouts`, `Grid`, `Snap`, `Lock`) alongside the viewport when desired by the user workflow.
- Restore persisted viewport on app reload and on network switch without breaking existing `fit/reset` actions.
- Keep viewport persistence out of undo/redo history unless explicitly justified.
- Preserve backward compatibility for previously persisted workspaces (migration-safe).

## Scope decision (proposed)
- **Primary scope: per-network viewport persistence** (recommended)
  - Each network remembers its own last `zoom + pan` and canvas view toggles (`Info`, `Length`, `Callouts`, `Grid`, `Snap`, `Lock`).
  - Returning to a network restores its last viewport.
- **Workspace-level behavior**
  - No active network => no viewport restore applies.
  - Optional future enhancement: global fallback/default viewport policy, but not required for V1.

## Functional Scope
### A. Persist viewport state for the active network (high priority)
- Add a persisted viewport payload for the network 2D view (minimum fields):
  - `scale`
  - `offset.x`
  - `offset.y`
- Extend the persisted 2D view payload to include canvas toggles (recommended V1 fields):
  - `showNetworkInfoPanels` (`Info`)
  - `showSegmentLengths` (`Length`)
  - `showCableCallouts` (`Callouts`)
  - `showNetworkGrid` (`Grid`)
  - `snapNodesToGrid` (`Snap`)
  - `lockEntityMovement` (`Lock`)
- Store viewport under network-scoped persisted data (recommended: `NetworkScopedState` extension).
- Ensure writes occur when the viewport changes through:
  - wheel zoom,
  - pan drag,
  - reset-to-configured-scale,
  - fit-to-content,
  - explicit zoom controls.
- Ensure writes also occur when any of the 2D view toggles change (`Info`, `Length`, `Callouts`, `Grid`, `Snap`, `Lock`).
- Avoid excessive persistence churn (debounce/throttle or write coalescing is acceptable if needed).

### B. Restore viewport on network selection and app reload (high priority)
- On app load, if an active network has a persisted viewport, restore it into canvas UI state.
- On network switch, restore the selected network's persisted viewport when available.
- Restore persisted 2D view toggles for the selected network when available.
- If no viewport is persisted for a network:
  - keep current default behavior (existing reset/initial positioning semantics), and
  - avoid applying stale viewport values from another network.
- If no 2D view toggles are persisted for a network, fall back to current canvas defaults/preferences behavior.
- Restoration must remain stable when the network has empty or minimal content.

### C. Compatibility with current viewport actions and defaults (high priority)
- `Reset` and `Fit` actions must continue to work as they do now and update the persisted viewport accordingly.
- Existing canvas preference defaults remain the fallback/bootstrap source for networks without persisted per-network view state.
- `canvas reset zoom target (%)` preference continues to control reset behavior; viewport persistence must not override that preference's meaning.
- Clarify precedence for V1:
  - network-specific persisted 2D view state (if present) wins on restore,
  - otherwise use existing canvas defaults/preferences.

### D. Persistence schema and migration safety (high priority)
- Extend persisted state schema without breaking existing saved workspaces.
- Add/adjust persistence migration(s) so older payloads load safely with a sensible default viewport state.
- Keep migration diagnostics/validation aligned with project persistence conventions.

### E. History / undo-redo behavior contract (medium priority)
- Define viewport + canvas toggle persistence as **UI/session state persistence**, not model-edit history.
- View restore/persist operations (`zoom`, `pan`, `Info`, `Length`, `Callouts`, `Grid`, `Snap`, `Lock`) should not pollute entity undo/redo history.
- If any store dispatch is introduced for this persistence, ensure history tracking is disabled or otherwise isolated.

### F. Testing and regression coverage (high priority)
- Add regression coverage for:
  - viewport changes persisting across reload (or equivalent state rehydrate path),
  - per-network restoration when switching between at least two networks,
  - toggle-state restore for `Info`, `Length`, `Callouts`, `Grid`, `Snap`, `Lock`,
  - fallback behavior when no persisted viewport exists,
  - reset/fit actions updating the restored viewport state as expected.
- Preserve existing canvas interaction tests and avoid brittle assertions tied to exact pixel values unless necessary.

## Non-functional requirements
- Preserve current canvas interaction smoothness (no noticeable lag during pan/zoom due to persistence writes).
- Preserve responsiveness when toggling `Info`, `Length`, `Callouts`, `Grid`, `Snap`, `Lock` (no perceptible persistence lag or flicker).
- Keep persisted viewport values bounded/validated (respect existing zoom clamps).
- Avoid coupling viewport persistence to theme or other unrelated UI preferences.
- Maintain local storage/schema compatibility and safe failure behavior if persisted viewport data is malformed.

## Validation and regression safety
- Targeted tests (minimum, depending on implementation split):
  - `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.networks.spec.tsx` (if network switch restore is covered there)
  - persistence/migration tests under `src/tests` touching local storage hydration (if present/extended)
- Recommended closure validation:
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
  - `npm run -s lint`
  - `npm run -s typecheck`
  - `npm run -s test:ci`
  - `npm run -s test:e2e`
  - `npm run -s build`
  - `npm run -s quality:pwa`

## Acceptance criteria
- AC1: After changing zoom/pan in `Network summary`, reloading the app restores the last viewport for the active network.
- AC2: After changing `Info`, `Length`, `Callouts`, `Grid`, `Snap`, and/or `Lock`, reloading the app restores the last per-network 2D view toggle state for the active network.
- AC3: Switching between networks restores each network's own last viewport + 2D view toggle state (no cross-network state bleed).
- AC4: `Reset` and `Fit to content` continue to work and update persisted viewport state for subsequent restore, without regressing toggle behavior.
- AC5: Existing persisted workspaces created before this feature still load successfully via migration/defaulting.
- AC6: View-state persistence does not pollute undo/redo history for model-edit actions.
- AC7: Targeted regression tests and persistence safety checks pass.

## Delivery status (2026-02-24)
- Implemented in application/store/persistence layers:
  - network-scoped `networkSummaryViewState` schema (`scale`, `offset`, `Info/Length/Callouts/Grid/Snap/Lock`)
  - runtime restore on active-network load/switch and runtime persist on view-state changes
  - migration/defaulting normalization for malformed or missing persisted payloads
  - no undo/redo pollution for view-state writes (`trackHistory: false`)
- Regression coverage added:
  - reload-equivalent rehydrate restores viewport + toggles
  - per-network switch restores independent viewport + toggles
  - persistence adapter test covers valid save/load + malformed payload drop
- Validation summary:
  - targeted suites ✅
  - `test:ci` ✅
  - `test:e2e` ✅
  - `build` ✅
  - `logics_lint` ✅

## Out of scope
- Cross-device/cloud sync of viewport state.
- Per-screen viewport persistence outside the 2D `Network summary` canvas (unless explicitly requested later).
- Persisting transient drag state (`isPanningNetwork`) or pointer gesture in-progress state.
- Redesign of zoom limits, fit heuristics, or canvas interaction UX beyond what is needed for persistence.

# Backlog
- `logics/backlog/item_306_network_scoped_network_summary_2d_view_state_persistence_schema_extension_scale_offset_and_canvas_toggles.md`
- `logics/backlog/item_307_network_summary_2d_pan_zoom_and_toggle_persistence_restore_lifecycle_integration.md`
- `logics/backlog/item_308_persistence_migration_and_defaulting_for_network_summary_2d_view_state.md`
- `logics/backlog/item_309_regression_coverage_for_network_summary_2d_view_state_reload_and_per_network_restore.md`
- `logics/backlog/item_310_req_050_network_summary_2d_view_state_persistence_closure_ci_build_and_ac_traceability.md`

# References
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
- `logics/request/req_033_save_data_versioning_and_backward_compatible_migrations_for_local_and_file_persistence.md`
