## item_300_unified_modeling_analysis_selection_state_and_regression_hardening - Unified Modeling/Analysis Selection State and Regression Hardening
> From version: 0.9.1
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: High
> Theme: State continuity and regression hardening for unified Modeling+Analysis interactions
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Merging `Modeling` and `Analysis` changes panel composition and navigation flow, which can easily regress selection continuity, panel-local filter/sort state, form context retention, and test assumptions. A dedicated hardening item is needed before closure.

# Scope
- In:
  - Validate and harden shared selection/focus continuity when switching between modeling-focused and analysis-focused panels within `Modeling`.
  - Preserve panel-local state where supported (filter text, sort state, expanded groups, selected sub-panel memory).
  - Ensure entering analysis-focused mode does not unnecessarily destroy in-progress modeling context (unless explicitly documented limitation).
  - Validate density-management behavior (forms hidden/collapsed by default in analysis-focused mode if implemented).
  - Update/add regression tests for merged navigation/panel composition behavior and alias/redirect compatibility path.
  - Patch any discovered regressions in shell navigation, tables/forms, and analysis panel rendering caused by the merge.
- Out:
  - New analysis features beyond migration.
  - Final closure/AC traceability/reporting docs (handled in item_301).

# Acceptance criteria
- Selection/focus remains coherent across modeling and migrated analysis panels in unified `Modeling`.
- Panel-local filter/sort state is preserved/stable across panel switching where supported.
- Regression coverage is updated for alias/redirect navigation and merged panel composition behavior.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_048`, item_297, item_298, item_299.
- Blocks: item_301.
- Related AC: AC2, AC6, AC7, AC8, AC9, AC10.
- References:
  - `logics/request/req_048_merge_modeling_and_analysis_by_migrating_analysis_panels_into_modeling_workspace.md`
  - `src/app/components/layout/AppShellLayout.tsx`
  - `src/app/components/workspace/AnalysisWorkspaceContent.tsx`
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
  - `src/app/hooks/useWorkspaceNavigation.ts`
  - `src/app/hooks/useWorkspaceHandlers.ts`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
  - `src/tests/app.ui.list-ergonomics.spec.tsx`
  - `src/tests/app.ui.networks.spec.tsx`
