## item_250_wire_panels_filter_row_layout_full_width_input_without_panel_growth - Wire Panels Filter Row Layout: Full-Width Input Without Panel Growth
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Responsive Wire Filter Row Layout Upgrade Without Panel Width Regression
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The current `Wires` filter row layout does not support a field selector and full-width text input cleanly. The requested UX requires better horizontal space usage without increasing panel width in Modeling/Analysis wire panels.

# Scope
- In:
  - Update filter row layout in wire panels (`Modeling` + `Analysis`) to support:
    - `Filter` label
    - field selector
    - text input
  - Ensure input consumes remaining horizontal space within current panel width.
  - Preserve panel dimensions (no width growth).
  - Ensure responsive behavior is usable at constrained widths.
  - Keep layout/styling reusable for adoption by other table panels.
- Out:
  - Field-specific filtering logic/state changes (handled in item_251).
  - `Network Scope` adoption behavior (handled in item_252).
  - Regression tests (handled in item_253).

# Acceptance criteria
- In Modeling and Analysis wire panels, the filter row supports label + selector + input.
- The text input expands within available space and does not cause panel width growth.
- Layout remains usable and visually stable on smaller widths.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_042`.
- Blocks: item_251, item_252, item_253, item_254.
- Related AC: AC1, AC2, AC3, AC8.
- References:
  - `logics/request/req_042_wire_list_filter_bar_field_selector_and_full_width_input_without_panel_growth.md`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
  - `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`

