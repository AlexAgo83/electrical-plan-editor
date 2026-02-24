## item_278_table_header_theming_completion_including_sort_chevrons_across_all_themes - Table Header Theming Completion Including Sort Chevrons Across All Themes
> From version: 0.8.1
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium-High
> Theme: Theme-consistent sortable table headers across legacy and standalone themes
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Sortable table headers and chevrons can fall back to default colors, creating contrast and consistency issues across legacy and standalone themes.

# Scope
- In:
  - Apply theme styling to table header labels and sort chevrons/icons across in-scope tables.
  - Cover active and inactive sort states.
  - Validate compatibility across legacy themes and standalone dark/light themes.
  - Avoid fallback/default browser/icon colors in sorted headers.
- Out:
  - Global theme redesign or palette changes.
  - Non-table icon theming unrelated to headers.
  - Theme regression-test hardening itself (item_280).

# Acceptance criteria
- Header labels and sort chevrons are theme-consistent across theme families.
- Active/inactive sort states remain readable with sufficient contrast.
- No fallback icon colors remain on sortable headers in covered tables.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_044`.
- Blocks: item_281.
- Related AC: AC10, AC17.
- References:
  - `logics/request/req_044_table_sortability_completion_analysis_nodes_segments_views_and_wire_connector_splice_table_analysis_enrichment.md`
  - `src/app/styles/tables.css`
  - `src/app/styles/base/base-theme-overrides.css`
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
