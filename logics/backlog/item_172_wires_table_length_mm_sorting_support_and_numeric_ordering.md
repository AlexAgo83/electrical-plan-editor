## item_172_wires_table_length_mm_sorting_support_and_numeric_ordering - Wires Table Length (mm) Sorting Support and Numeric Ordering
> From version: 0.6.3
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Add Practical Numeric Sorting by Wire Length for Analysis/Modeling Tables
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`Wires` tables expose `Length (mm)` as a key field, but users cannot sort by it. This slows comparison and review workflows in Modeling/Analysis when investigating routing or cable lengths.

# Scope
- In:
  - Add `Length (mm)` as an available sort key in `Wires` tables.
  - Use numeric ordering for sort comparisons.
  - Preserve current sorting UX conventions (active indicator, asc/desc behavior).
- Out:
  - Broader table framework redesign.
  - New derived length metrics beyond existing `Length (mm)`.

# Acceptance criteria
- `Wires` tables provide sort access for `Length (mm)`.
- Sorting uses numeric ordering and not lexical string ordering.
- Existing sort interactions remain consistent and regression-safe.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_030`.
- Blocks: item_177.
- Related AC: AC2, AC7.
- References:
  - `logics/request/req_030_network_summary_png_export_background_wires_length_sort_quick_entity_navigation_table_theming_and_2d_grid_negative_coordinates.md`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
  - `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
  - `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
