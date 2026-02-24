## item_297_modeling_workspace_composition_adds_access_to_analysis_panels - Modeling Workspace Composition Adds Access to Analysis Panels
> From version: 0.9.1
> Understanding: 97%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium-High
> Theme: Unified workspace composition so Modeling can host analysis-oriented panel access
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`Modeling` and `Analysis` are currently separated at the workspace composition level, which forces screen switching even when users simply need to inspect analysis information adjacent to modeling work. `req_048` requires `Modeling` to become the primary unified workspace.

# Scope
- In:
  - Recompose the `Modeling` workspace so it can host/access the panel families currently associated with `Analysis`.
  - Introduce/extend a unified workspace panel mode or equivalent composition state to distinguish modeling-focused vs analysis-focused presentation within `Modeling`.
  - Preserve existing `Modeling` tables/forms/action flows while enabling integrated access to analysis panel areas.
  - Keep composition compatible with existing shell layout and responsive behavior.
  - Prefer reuse of existing workspace composition modules/helpers rather than duplicating screen content trees.
- Out:
  - Full migration of all analysis panel components/logic (handled in item_298).
  - Navigation alias/redirect behavior for top-level `Analysis` entry (handled in item_299).
  - Selection/filter/sort state hardening and regression coverage pass (handled in item_300).

# Acceptance criteria
- `Modeling` workspace composition provides access points for analysis-oriented panel families without requiring a separate `Analysis` screen implementation path.
- Existing modeling forms/tables remain functional after the composition changes.
- Unified composition remains responsive and theme-consistent at the baseline layout level.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_048`.
- Blocks: item_298, item_299, item_300, item_301.
- Related AC: AC1, AC3, AC8, AC9.
- References:
  - `logics/request/req_048_merge_modeling_and_analysis_by_migrating_analysis_panels_into_modeling_workspace.md`
  - `src/app/components/layout/AppShellLayout.tsx`
  - `src/app/components/containers/ModelingWorkspaceContainer.tsx`
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
  - `src/app/components/workspace/AnalysisWorkspaceContent.tsx`
  - `src/app/components/appUiModules.tsx`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
