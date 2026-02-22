## item_175_table_header_theme_coverage_with_icons_and_highlight_row_cell_visual_refinement - Table Header Theme Coverage (with Icons) and Highlight Row/Cell Visual Refinement
> From version: 0.6.3
> Understanding: 99%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Theme Completeness and Lower-Noise Highlight Styling for Tables
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Some table headers (including header icons) do not fully adopt the active theme palette, and highlighted row/cell backgrounds are visually too strong. This creates inconsistency and noise in dense table workflows.

# Scope
- In:
  - Apply active theme colors to table headers and header icons across supported themes.
  - Rework highlighted row/cell styling to use significantly more transparent background fills.
  - Bold names and IDs in highlighted rows/cells to retain salience.
  - Preserve visual distinction among selected/focused/hover/highlight states.
- Out:
  - Full redesign of table layouts/components.
  - Changes to table sorting/filtering behavior beyond styling.

# Acceptance criteria
- Table headers and header icons reflect the active theme palette across representative themes.
- Highlight backgrounds are more discreet.
- Names and IDs are bold in highlighted states.
- Selected/focused/hover states remain distinguishable after styling changes.

# Priority
- Impact: Medium-high.
- Urgency: Medium-high.

# Notes
- Dependencies: `req_030`.
- Blocks: item_177.
- Related AC: AC4, AC5, AC7.
- References:
  - `logics/request/req_030_network_summary_png_export_background_wires_length_sort_quick_entity_navigation_table_theming_and_2d_grid_negative_coordinates.md`
  - `src/app/styles/tables.css`
  - `src/app/styles/base/base-theme-overrides.css`
  - `src/app/styles/workspace/workspace-panels-and-responsive.css`
  - table-related UI tests in `src/tests/`

