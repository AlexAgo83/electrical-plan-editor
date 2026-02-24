## item_299_workspace_navigation_and_analysis_screen_alias_redirect_for_modeling_analysis_merge - Workspace Navigation and `Analysis` Screen Alias/Redirect for Modeling+Analysis Merge
> From version: 0.9.1
> Understanding: 99%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium-High
> Theme: Low-risk navigation migration using `Analysis` alias/redirect into unified Modeling
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`req_048` adopts a phased migration: `Modeling` becomes the unified workspace while `Analysis` remains temporarily as a compatibility nav entry. Without an explicit alias/redirect implementation, users can end up with divergent states or inconsistent navigation behavior.

# Scope
- In:
  - Implement Phase 1 top-level navigation behavior where `Analysis` acts as a compatibility alias/redirect into `Modeling`.
  - Ensure the alias opens `Modeling` in an analysis-focused mode/state.
  - Restore the last selected analysis sub-panel when available; otherwise fallback to `Wires`.
  - Update workspace navigation/sub-navigation state handling so no divergent `Modeling` vs `Analysis` screen state persists.
  - Keep standard navigation actions (`Open`, etc.) targeting `Modeling`.
  - Preserve keyboard focus/accessibility behavior for nav controls.
- Out:
  - Final removal of the `Analysis` nav entry (follow-up cleanup phase).
  - Deep refactor of all navigation architecture beyond what is needed for alias/redirect compatibility.
  - Full selection/filter/sort continuity hardening across unified panels (handled in item_300).

# Acceptance criteria
- Clicking/activating the `Analysis` navigation entry routes into `Modeling` rather than a divergent standalone analysis workspace.
- Alias landing enters an analysis-focused state and restores the last selected analysis sub-panel when available, with `Wires` as fallback.
- Navigation state remains coherent (no duplicate divergent `Modeling`/`Analysis` active states).

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_048`, item_297, item_298.
- Blocks: item_300, item_301.
- Related AC: AC3, AC4, AC5, AC10.
- References:
  - `logics/request/req_048_merge_modeling_and_analysis_by_migrating_analysis_panels_into_modeling_workspace.md`
  - `src/app/components/WorkspaceNavigation.tsx`
  - `src/app/components/layout/AppShellLayout.tsx`
  - `src/app/components/screens/ModelingScreen.tsx`
  - `src/app/components/screens/AnalysisScreen.tsx`
  - `src/app/hooks/useWorkspaceNavigation.ts`
  - `src/app/hooks/useWorkspaceHandlers.ts`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
