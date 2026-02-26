## item_364_regression_coverage_for_global_undo_redo_mutations_shortcuts_and_scope_exclusions - Regression coverage for global undo/redo mutations, shortcuts, and scope exclusions
> From version: 0.9.8
> Understanding: 95%
> Confidence: 91%
> Progress: 100%
> Complexity: High
> Theme: Regression safety for global undo/redo behavior
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Undo/redo is a cross-cutting feature with high regression risk. Without targeted coverage, subtle state corruption or shortcut conflicts may ship unnoticed.

# Scope
- In:
  - Add regression coverage for representative create/edit/delete undo/redo flows across modeling and catalog domains.
  - Add coverage for redo-stack clearing after a new mutation post-undo.
  - Add UI enabled/disabled-state checks for undo/redo actions.
  - Add keyboard shortcut coverage (`Ctrl/Cmd+Z`, `Shift+Ctrl/Cmd+Z`, optional `Ctrl+Y` if implemented).
  - Add focus-guard tests confirming shortcuts do not trigger undo/redo while typing in text inputs.
  - Add coverage confirming undo/redo does not mutate UI-only states (theme/preferences/navigation/selection/viewport).
  - Add bulk-operation atomicity regression coverage for sample recreation and/or catalog import (when import exists).
- Out:
  - Exhaustive permutation testing of every mutation path in the app.

# Acceptance criteria
- Automated tests cover representative undo/redo mutation flows, shortcut behavior, and redo-branch semantics.
- Automated tests verify input-focus shortcut guards and UI-only-state exclusion behavior.
- Existing suites remain green with the undo/redo feature enabled.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_066`, `item_361`, `item_362`, `item_363`.
- Blocks: `task_063`.
- Related AC: AC1, AC2, AC3, AC4, AC5, AC6, AC7.
- References:
  - `logics/request/req_066_global_undo_redo_history_for_modeling_and_catalog_mutations.md`
  - `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.undo-redo-global.spec.tsx`
  - `src/tests/app.ui.catalog-csv-import-export.spec.tsx`
  - `src/app/AppController.tsx`
