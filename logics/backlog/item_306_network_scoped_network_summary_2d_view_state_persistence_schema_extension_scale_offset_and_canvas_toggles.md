## item_306_network_scoped_network_summary_2d_view_state_persistence_schema_extension_scale_offset_and_canvas_toggles - Network-Scoped Network Summary 2D View-State Persistence Schema Extension (Scale, Offset, and Canvas Toggles)
> From version: 0.9.2
> Understanding: 97%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: Persistence model extension for per-network 2D view resume state
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`req_050` requires per-network persistence of 2D view state (`zoom + pan` and `Info/Length/Callouts/Grid/Snap/Lock` toggles), but the current persisted `NetworkScopedState` does not include a dedicated field for canvas view-state persistence.

# Scope
- In:
  - Define a persisted network-scoped 2D view-state shape for `Network summary`.
  - Include viewport fields (`scale`, `offset`) and the six canvas toggles.
  - Add defaults/typing in store state definitions (`NetworkScopedState`) aligned with existing persistence conventions.
  - Keep the shape ready for migration/defaulting and restore wiring in subsequent items.
- Out:
  - Runtime restore behavior or event wiring.
  - Migration implementation details (handled by a dedicated item).

# Acceptance criteria
- A typed network-scoped 2D view-state payload exists in the store/persistence model.
- The payload includes `scale`, `offset`, and `Info/Length/Callouts/Grid/Snap/Lock` toggle values.
- Default creation paths produce valid view-state data (or a clearly defined optional/missing-state contract) without breaking existing state initialization.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_050`.
- Blocks: item_307, item_308, item_309, item_310.
- Related AC: AC1-AC5.
- References:
  - `logics/request/req_050_network_summary_2d_viewport_zoom_pan_persistence_per_network_resume_and_restore.md`
  - `src/store/types.ts`
  - `src/store/networking.ts`
  - `src/store/reducer/networkReducer.ts`

