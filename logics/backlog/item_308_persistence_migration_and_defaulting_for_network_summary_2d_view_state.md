## item_308_persistence_migration_and_defaulting_for_network_summary_2d_view_state - Persistence Migration and Defaulting for Network Summary 2D View-State
> From version: 0.9.2
> Understanding: 96%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: Backward-compatible persistence evolution for per-network 2D view resume state
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Adding persisted 2D view-state fields to network-scoped data changes the saved-workspace schema contract. Without migration/defaulting, older persisted workspaces may load inconsistently or fail validation.

# Scope
- In:
  - Add persistence migration/defaulting for the new network-scoped 2D view-state fields.
  - Ensure older payloads load with sensible defaults/fallback behavior.
  - Validate malformed/partial view-state data safely (clamp/ignore/default as appropriate).
  - Keep migration diagnostics and schema-version handling aligned with current persistence conventions.
- Out:
  - Runtime interaction wiring (handled elsewhere).
  - Broad persistence redesign beyond the new 2D view-state fields.

# Acceptance criteria
- Workspaces persisted before `req_050` continue to load safely after migration/defaulting.
- Missing or partial 2D view-state fields are defaulted without runtime breakage.
- Malformed persisted 2D view-state values do not crash hydration and fall back safely.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_050`, item_306.
- Blocks: item_309, item_310.
- Related AC: AC5, AC7.
- References:
  - `logics/request/req_050_network_summary_2d_viewport_zoom_pan_persistence_per_network_resume_and_restore.md`
  - `src/adapters/persistence/migrations.ts`
  - `src/adapters/persistence/localStorage.ts`
  - `src/store/types.ts`

