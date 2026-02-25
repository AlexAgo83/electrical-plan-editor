## item_344_sortable_table_aria_sort_validation_row_keyboard_selection_and_issue_counter_accessible_names - Sortable table aria-sort, Validation row keyboard selection, and issue counter accessible names
> From version: 0.9.6
> Understanding: 97%
> Confidence: 91%
> Progress: 0%
> Complexity: Medium-High
> Theme: Cross-screen accessibility semantics consistency for tables, Validation, and shell/navigation counters
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Several app surfaces rely on visual state only or click-only interaction patterns: sortable tables lack `aria-sort`, Validation row selection is not keyboard-accessible, and issue counters in primary navigation/header are visually visible but hidden from assistive technologies.

# Scope
- In:
  - Add `aria-sort` semantics to representative/all sortable tables covered by `req_060` (Modeling, Analysis, Validation and related sortable data tables).
  - Ensure `aria-sort` updates with current sort state without regressing existing visual sort indicators.
  - Make Validation row selection/cursor update keyboard accessible and consistent with the app’s focusable-row pattern.
  - Preserve row-level `Go to` behavior and avoid ambiguous double-activation between row selection and the `Go to` button.
  - Expose issue counts and error-state context for primary navigation/header controls (Validation tab, `Ops & Health`, or equivalent) through accessible names/text.
  - Add/extend regression coverage for the above semantics and keyboard behavior.
- Out:
  - A broader table UX redesign unrelated to sort/selection semantics.
  - Global contrast/theme audits.

# Acceptance criteria
- Sortable tables expose current sort state through `aria-sort` on relevant headers.
- Validation row selection can be performed with keyboard navigation/activation and remains compatible with `Go to`.
- Primary navigation/header issue counters are available to assistive technologies through accessible names/text or equivalent non-hidden semantics.
- Existing visual indicators/badges and interactions remain functional.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_060`.
- Blocks: `task_057` closure.
- Related AC: req_060 AC4, AC5, AC6.
- References:
  - `logics/request/req_060_accessibility_hardening_for_interactive_network_summary_modal_focus_sortable_tables_and_validation_navigation.md`
  - `src/app/components/workspace/ValidationWorkspaceContent.tsx`
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`
  - `src/app/components/workspace/AnalysisNodeSegmentWorkspacePanels.tsx`
  - `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
  - `src/app/components/WorkspaceNavigation.tsx`
  - `src/app/components/workspace/AppHeaderAndStats.tsx`
  - `src/tests/app.ui.validation.spec.tsx`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`

