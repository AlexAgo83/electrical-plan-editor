## item_309_regression_coverage_for_network_summary_2d_view_state_reload_and_per_network_restore - Regression Coverage for Network Summary 2D View-State Reload and Per-Network Restore
> From version: 0.9.2
> Understanding: 97%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium-High
> Theme: Regression safety for viewport/toggle persistence and per-network restore behavior
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`req_050` introduces user-visible persistence behavior across canvas interactions, reloads, and network switches. Without focused regression coverage, future changes to canvas state, hydration, or network switching may silently break restore semantics.

# Scope
- In:
  - Add regression coverage for persisted viewport (`zoom + pan`) restore on reload/hydration.
  - Add regression coverage for per-network restore when switching between at least two networks.
  - Add regression coverage for `Info/Length/Callouts/Grid/Snap/Lock` toggle-state persistence/restore.
  - Cover fallback behavior when no persisted view-state exists for a network.
  - Verify `Reset`/`Fit` behavior remains compatible with persisted restore expectations.
- Out:
  - Full closure validation matrix and AC traceability (handled by closure item).
  - Non-deterministic visual/pixel-perfect assertions not needed for behavior coverage.

# Acceptance criteria
- Tests detect regressions in viewport restore after reload/hydration.
- Tests detect regressions in per-network view-state restore on network switch.
- Tests cover restore behavior for `Info/Length/Callouts/Grid/Snap/Lock`.
- Touched tests remain deterministic and CI-suitable.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_050`, item_307, item_308.
- Blocks: item_310.
- Related AC: AC1-AC4, AC7.
- References:
  - `logics/request/req_050_network_summary_2d_viewport_zoom_pan_persistence_per_network_resume_and_restore.md`
  - `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.networks.spec.tsx`

