## req_009_2d_layout_persistence_and_crossing_minimization - 2D Layout Persistence and Crossing Minimization
> From version: 0.2.0
> Understanding: 99%
> Confidence: 96%
> Complexity: High
> Theme: 2D Representation Reliability
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Persist user-adjusted positions of entities in the 2D representation.
- Improve first-time generated layout to reduce visible segment crossings as much as possible.
- Provide an explicit UI action to (re)generate the layout when needed.

# Context
The current 2D representation supports interactive positioning, but layout persistence and deterministic regeneration behavior are not yet explicit enough for production-grade workflows. This creates friction when users reopen projects and when auto-generated views contain avoidable visual crossings.

This request introduces a layout lifecycle with three guarantees:
- persisted coordinates for stable day-to-day usage,
- smarter initial auto-layout focused on crossing reduction,
- user-controlled regeneration for recovery and optimization.

Architecture references to preserve:
- `logics/architecture/target_reference_v1_frontend_local_first.md`
- `logics/request/req_002_multi_network_management_and_navigation.md`
- `logics/request/req_004_network_import_export_file_workflow.md`

## Objectives
- Persist 2D node/entity positions per network and restore them deterministically across app reloads.
- Reduce segment crossings during the first auto-layout generation using deterministic heuristics.
- Add a clear `(Re)generate layout` action in the workspace UI.
- Keep compatibility with multi-network isolation, local persistence, and import/export contracts.

## Functional Scope
### Layout persistence
- Extend network view/layout state to include explicit 2D coordinates for rendered entities.
- Persist coordinates in local storage with schema versioning and migration rules.
- Preserve manual user adjustments across reload, network switch, and normal app restart.
- Keep fallback behavior for entities without stored coordinates (for example after data migration or partial import).

### First-time auto-layout crossing minimization
- Upgrade layout generation heuristic to minimize visible segment crossings in typical topologies.
- Keep generation deterministic for identical inputs (stable IDs + same graph should produce same layout).
- Preserve readability constraints:
  - minimum spacing between nodes,
  - bounded viewport fit behavior,
  - avoidance of excessive overlap.
- Keep generation time acceptable for typical project-sized networks.

### Layout regeneration action
- Add a visible user control in the 2D workspace toolbar to regenerate layout.
- Regeneration recomputes coordinates from topology and replaces current placement for the active network.
- Regenerated coordinates are persisted immediately.
- Add clear UX feedback/confirmation semantics to avoid accidental destructive overwrite of manual arrangement.

### Integrity and compatibility
- Layout state must remain isolated per network (no cross-network bleed).
- Import/export must carry layout coordinates consistently when available.
- Existing editing and interaction workflows (select, drag, zoom, pan, focus) must keep current behavior.

## Acceptance criteria
- AC1: Manually adjusted 2D positions are restored after app reload.
- AC2: Layout state remains independent per network when switching active network.
- AC3: First-time generated layout reduces visible segment crossings compared to current baseline behavior on representative fixtures.
- AC4: A workspace control allows users to regenerate layout for the active network.
- AC5: Regenerating layout updates the rendered graph and persists new coordinates.
- AC6: Import/export roundtrip preserves layout coordinates without schema corruption.
- AC7: Automated tests cover persistence, multi-network isolation, regeneration action, and crossing-focused layout behavior.

## Non-functional requirements
- Preserve deterministic local-first behavior and data integrity.
- Keep UI responsiveness acceptable during layout generation and regeneration.
- Maintain compatibility with existing quality gates (`lint`, `typecheck`, `test:ci`, `test:e2e`).

## Out of scope
- Manual orthogonal routing editor for per-segment bend points.
- Full graph-drawing optimal solver guarantees.
- Real-time collaborative layout synchronization.

# Backlog
- To create from this request:
  - `item_050_layout_state_schema_and_persistence_migration.md`
  - `item_051_crossing_minimized_initial_layout_heuristics.md`
  - `item_052_layout_regeneration_control_and_user_safeguards.md`
  - `item_053_layout_import_export_and_multi_network_compatibility.md`
  - `item_054_layout_regression_matrix_and_performance_validation.md`

# References
- `logics/request/req_002_multi_network_management_and_navigation.md`
- `logics/request/req_004_network_import_export_file_workflow.md`
- `src/app/lib/app-utils.ts`
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/tests/persistence.localStorage.spec.ts`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
