## item_423_import_export_panel_regression_coverage_and_responsive_guardrails - Import/Export panel regression coverage and responsive guardrails
> From version: 0.9.18
> Status: Draft
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: UI regression protection for responsive panel compaction
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Layout-only refactors can silently break behavior ordering, selection controls, or responsive fallback.

# Scope
- In:
  - update/add UI tests for two-column rendering conditions;
  - validate right-column selected-list placement and left-column action order;
  - validate narrow-width fallback behavior without clipping/overflow regressions.
- Out:
  - full responsive redesign beyond panel scope.

# Acceptance criteria
- AC1: Tests cover two-column and single-column fallback behavior.
- AC2: Tests cover action ordering and selected-export interaction parity.
- AC3: Targeted suites for settings/import-export stay green.

# Priority
- Impact: Medium-High.
- Urgency: Medium.

# Notes
- Dependencies: `item_421`, `item_422`.
- Blocks: `item_424`, `task_073`.
- Related AC: `AC4`, `AC5`, `AC6`.
- References:
  - `logics/request/req_082_import_export_networks_panel_two_column_compaction_and_right_side_selected_export_list.md`
  - `src/tests/app.ui.import-export.spec.tsx`
  - `src/tests/app.ui.settings.spec.tsx`
