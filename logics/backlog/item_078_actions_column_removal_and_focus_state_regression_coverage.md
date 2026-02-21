## item_078_actions_column_removal_and_focus_state_regression_coverage - Actions Column Removal and Focus-State Regression Coverage
> From version: 0.4.0
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Behavioral Regression Protection
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Removing inline action columns and moving actions under lists introduces selection/focus coupling risks that can regress silently without dedicated tests.

# Scope
- In:
  - Add or update UI integration tests for focused-row-driven actions across migrated entities.
  - Cover create-mode disabled-state rules for under-list actions.
  - Cover no-focus empty/disabled action behavior.
  - Cover row activation behavior (click + keyboard).
  - Validate sorting/filtering does not break focused action targeting.
- Out:
  - End-to-end browser matrix and release closure (covered by item_080).
  - Non-list domains unrelated to req_013 scope.

# Acceptance criteria
- Regression tests verify action targeting through focused rows for all migrated entities.
- Tests verify no `Actions` columns remain in migrated tables.
- Tests verify create/edit mode transitions and disabled states remain deterministic.
- Existing entity lifecycle tests remain green.

# Priority
- Impact: Very high (prevents UX/behavior regressions during refactor).
- Urgency: High (must accompany migration waves).

# Notes
- Dependencies: item_075, item_076, item_077.
- Blocks: item_080.
- Related AC: AC1, AC2, AC3, AC4, AC5, AC7, AC8.
- References:
  - `logics/request/req_013_list_form_workspace_harmonization_based_on_network_scope.md`
  - `src/tests/app.ui.networks.spec.tsx`
  - `src/tests/app.ui.list-ergonomics.spec.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/store.reducer.entities.spec.ts`
