## item_294_shared_table_footer_displayed_entry_count_for_filtered_rows_across_workspace_tables - Shared Table Footer Displayed Entry Count for Filtered Rows Across Workspace Filterable Tables
> From version: 0.9.1
> Understanding: 99%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium-High
> Theme: Consistent filter feedback across workspace tables via visible-row count footers
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Filterable tables across workspace screens do not consistently indicate how many rows are currently displayed after filtering. Users can type filters and reduce visible rows without a clear count feedback signal, especially in dense datasets or filtered-empty states.

# Scope
- In:
  - Add a right-aligned displayed-entry count footer under each in-scope **filterable** workspace table.
  - Count semantics:
    - reflect currently visible rows after active filters/search/scope constraints
    - update live when filter inputs/field selectors change
    - show `0 entries` for filtered-empty results and empty datasets
  - Prefer shared implementation using existing filtered-row derived state (`useEntityListModel` / equivalent table models) to avoid duplicate filtering work.
  - Keep footer styling theme-consistent and low-visual-noise.
  - Preserve existing table empty-state/action-row/layout behavior.
- Out:
  - Non-filterable tables/lists/cards.
  - New filtering capabilities or filter semantics changes.
  - Pagination/virtualization redesign (future concern if introduced).
  - `Network Scope` action-button rework (handled in item_295).

# Acceptance criteria
- Every in-scope filterable workspace table shows a right-aligned displayed-entry count footer.
- The count updates live when filtering changes visible rows.
- Filtered-empty states still show `0 entries` and do not regress table empty-state behavior.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_047`, `req_042` (shared filter-bar/table filtering patterns).
- Blocks: item_296.
- Related AC: AC4, AC5, AC8, AC9.
- References:
  - `logics/request/req_047_table_readability_endpoint_column_split_analysis_wire_name_subrows_and_filtered_entry_count_footers.md`
  - `logics/request/req_042_wire_list_filter_bar_field_selector_and_full_width_input_without_panel_growth.md`
  - `src/app/hooks/useEntityListModel.ts`
  - `src/app/components/workspace/TableFilterBar.tsx`
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
  - `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
  - `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
  - `src/app/styles/tables.css`
  - `src/tests/app.ui.list-ergonomics.spec.tsx`
  - `src/tests/app.ui.networks.spec.tsx`
