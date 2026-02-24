## item_307_network_summary_2d_pan_zoom_and_toggle_persistence_restore_lifecycle_integration - Network Summary 2D Pan/Zoom and View-Toggle Persistence & Restore Lifecycle Integration
> From version: 0.9.2
> Understanding: 97%
> Confidence: 95%
> Progress: 100%
> Complexity: High
> Theme: Canvas interaction and restore lifecycle wiring for per-network 2D view resume
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even with a persistence schema available, the 2D canvas currently keeps `zoom`, `pan`, and the six view toggles as UI-local state. Without runtime wiring, the app cannot save or restore the per-network view state during normal usage.

# Scope
- In:
  - Persist `networkScale` and `networkOffset` changes to the active network view-state.
  - Persist `Info/Length/Callouts/Grid/Snap/Lock` toggle changes to the active network view-state.
  - Restore persisted per-network view-state on app load / active-network hydration and on network switch.
  - Prevent cross-network state bleed when a selected network lacks persisted view-state.
  - Preserve current `Reset` / `Fit to content` behavior while ensuring resulting viewport state is persisted.
  - Keep this UI/session state out of model undo/redo history.
- Out:
  - Persistence schema migration/defaulting logic.
  - Full regression test matrix (handled by dedicated items).

# Acceptance criteria
- Changing zoom/pan updates the active network's persisted 2D view-state.
- Changing any of `Info/Length/Callouts/Grid/Snap/Lock` updates the active network's persisted 2D view-state.
- Switching back to a previously edited network restores its last persisted 2D view-state.
- `Reset` and `Fit to content` remain functional and persist the resulting viewport.
- View-state persistence does not pollute entity edit undo/redo history.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_050`, item_306.
- Blocks: item_309, item_310.
- Related AC: AC1-AC4, AC6.
- References:
  - `logics/request/req_050_network_summary_2d_viewport_zoom_pan_persistence_per_network_resume_and_restore.md`
  - `src/app/hooks/useCanvasState.ts`
  - `src/app/hooks/useCanvasInteractionHandlers.ts`
  - `src/app/hooks/useWorkspaceHandlers.ts`
  - `src/app/AppController.tsx`
  - `src/app/components/NetworkSummaryPanel.tsx`

