## req_047_table_readability_endpoint_column_split_analysis_wire_name_subrows_and_filtered_entry_count_footers - Table Readability, Network Scope Action Row Rework, Wire Endpoint Column Split, Connector/Splice Analysis Wire Name Subrows, and Filtered Entry Count Footers
> From version: 0.9.1
> Understanding: 98%
> Confidence: 97%
> Complexity: Medium
> Theme: Tabular Readability and Workspace Action Ergonomics Polish Across Modeling/Analysis/Network Scope Surfaces
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- In `Wires` tables, split the current `Endpoints` column into **two distinct columns** for better readability:
  - `Endpoint A`
  - `Endpoint B`
- In `Connectors` and `Splices` `Analysis` views (wire list grouped by `Way` / `Port`), display the **wire/cable name under the technical ID** for each listed wire.
- Under **each filterable table** in the app, add a **right-aligned displayed-entry count** (for example `12 entries`), and ensure it updates live when the table is filtered.
- Rework the `Network Scope` action buttons layout and actions:
  - add an `Open` button to open the focused network directly in the `Modeling` screen,
  - keep `New`, `Duplicate`, and `Delete` on a single row,
  - place `Open`, `Set active`, and `Export` on a second single row.

# Context
The app already exposes a growing number of sortable/filterable tables and analysis lists. Recent requests improved sorting, filtering, and wire metadata visibility, but a few readability gaps remain:

- the `Wires` endpoint information is dense when both endpoints are compressed into a single cell,
- connector/splice analysis lists emphasize wire IDs but make it harder to scan human-readable cable names,
- tables provide filtering but do not consistently show how many rows are currently visible after filters are applied.
- the `Network Scope` action area can be improved for faster navigation and clearer grouping of primary actions.

This request is a focused **UI ergonomics polish** pass to improve scanability and user feedback without changing core data semantics.

## Objectives
- Improve wire endpoint readability in tabular views by separating endpoint sides into independent columns.
- Improve connector/splice analysis scanability by surfacing wire names directly beneath wire IDs in grouped `Way` / `Port` listings.
- Provide consistent table feedback across the app with a right-aligned visible-row count that reflects filtering results in real time.
- Improve `Network Scope` operator flow by adding a direct `Open` action and reorganizing action buttons into clearer two-row groups.
- Reuse shared table/list infrastructure where possible to minimize duplication and regressions.

## Scope clarification (important)
- “Each table in the app” (for this request) means **workspace tabular lists that support filtering** (Modeling / Analysis / Network Scope / Validation and similar table-based panels when they are filterable).
- The requested counter should reflect the **currently displayed rows** (post-filter, post-search, post-scope filtering, and post-entity-type filtering when applicable), not the total dataset size.
- Non-tabular UI blocks (forms, cards, settings toggles, canvas overlays) are out of scope unless they render a table/list with filterable rows.
- Connector/splice analysis enhancement applies specifically to the **wire list rows under `Way` / `Port` groupings** in analysis panels, not to 2D callouts unless implementation chooses to reuse the same renderer.
- `Network Scope` button rework applies to the primary network actions area associated with the network list/focused row selection.

## Recommended UX decisions (baseline)
- `Wires` column labels:
  - rename/split `Endpoints` into `Endpoint A` and `Endpoint B`
  - preserve existing endpoint formatting per side (entity ID + way/port semantics, occupancy text, references if currently shown)
- Column ordering for `Wires` tables (recommended baseline):
  - keep `Endpoint A` / `Endpoint B` in the same general region where `Endpoints` currently appears to minimize habit breakage
- Connector/splice analysis wire row formatting:
  - first line: technical ID (existing primary identifier)
  - second line: cable/wire name (muted secondary line when present)
  - if name is empty/missing, render no extra blank line
- Table entry count footer:
  - place directly under the table container
  - align text to the right edge
  - singular/plural aware (`1 entry`, `N entries`) or equivalent localized phrasing
  - update immediately when filter text/field changes
  - show `0 entries` when filters hide all rows (even if empty-state text is displayed)
- Shared implementation preference:
  - centralize the footer rendering in shared table/panel helpers where practical, rather than duplicating per table
- `Network Scope` action row grouping (requested baseline):
  - Row 1: `New` / `Duplicate` / `Delete`
  - Row 2: `Open` / `Set active` / `Export`
  - `Open` uses the currently focused/selected network and navigates to `Modeling`

## Functional Scope
### A. `Wires` table endpoint column split (high priority)
- Replace the single `Endpoints` column with two columns:
  - `Endpoint A`
  - `Endpoint B`
- Apply consistently to all relevant `Wires` tables that currently expose the combined endpoint column (at minimum Modeling and Analysis `Wires` tables).
- Each side column must preserve existing endpoint-side semantics and formatting fidelity:
  - connector `way` references
  - splice `port` references
  - node/free endpoint representations as applicable
  - any side-specific metadata currently shown in the combined endpoint content
- Sorting behavior:
  - if the prior `Endpoints` column was sortable, define deterministic comparators for `Endpoint A` and `Endpoint B`
  - avoid regressions in table sort controls and indicators
- Layout/responsiveness:
  - ensure the split does not break table readability on common desktop widths
  - if needed, rebalance neighboring column widths or wrapping behavior without reducing scanability

### B. Connector/Splice analysis wire rows: add cable name subrow (high priority)
- In `Connectors` and `Splices` `Analysis` panels, for wire entries listed by `Way` / `Port`:
  - keep the wire technical ID visible
  - add the wire name on a second line beneath the ID
- Visual hierarchy requirements:
  - technical ID remains the primary line
  - wire name is secondary (smaller and/or muted styling is acceptable)
  - preserve existing wire color swatches and metadata where already rendered
- Missing/optional data handling:
  - if a wire has no name (or name equals ID depending on current semantics), avoid noisy duplication and blank spacing
  - preserve stable layout across mixed datasets
- The enhancement should not regress:
  - grouping by `Way` / `Port`
  - selection/focus interactions
  - sort order within grouped lists (if applicable)
  - theme readability

### C. Shared table footer with displayed-entry count (high priority)
- Add a displayed-row count footer under each in-scope **filterable** table surface.
- Footer requirements:
  - rendered below the table
  - right-aligned
  - reflects the number of rows currently shown to the user
  - updates whenever filters/search/scope selections change the visible rows
- Count semantics:
  - count visible rows after all active table-level filters are applied
  - if pagination is introduced in the future, implementation should document whether this count is page-visible or filtered-total (for current scope, no pagination semantics change is requested)
- Empty/filter states:
  - when the underlying dataset is non-empty but filters hide all rows, footer still shows `0 entries`
  - when the dataset itself is empty, footer behavior should remain consistent (recommended: still show `0 entries`)
- Integration preference:
  - reuse shared table model state (`filtered rows` or equivalent derived arrays) instead of recomputing independently in each component

### D. `Network Scope` action buttons rework (`Open` + two-row layout) (high priority)
- Add a new `Open` action button in the `Network Scope` action area.
- `Open` behavior:
  - targets the currently focused/selected network row
  - opens that network in the `Modeling` screen
  - **also performs `Set active` semantics** for that network as part of the action (the opened network becomes the active network)
  - preserves/sets the corresponding focused network context so the user lands directly on the selected network
- Reorganize action buttons into two rows:
  - first row: `New`, `Duplicate`, `Delete`
  - second row: `Open`, `Set active`, `Export`
- Layout requirements:
  - each of the two button groups must fit on one line at supported desktop widths
  - maintain responsive behavior without overlapping/truncating labels
  - preserve existing disabled/enabled states and permission/selection guards (for example no focused network)
- Interaction/regression requirements:
  - existing `New`, `Duplicate`, `Delete`, `Set active`, and `Export` behaviors remain unchanged except for layout positioning
  - keyboard accessibility and focus order remain logical after the reordering
  - button labels remain readable and theme-consistent

### E. Styling and consistency polish (medium priority)
- Ensure footer text styling is consistent across themes and tables:
  - readable contrast
  - modest emphasis (informational, not dominant)
  - spacing that does not crowd action rows or filter bars
- Ensure the new two-line wire rendering in connector/splice analysis aligns with existing table/list typography tokens and spacing rhythm.
- Avoid introducing layout jumpiness when filter results change rapidly (typing in filter input).

### F. Regression safety and validation (high priority)
- Add/update tests covering:
  - `Wires` table headers now include `Endpoint A` / `Endpoint B`
  - endpoint values render in split columns
  - connector/splice analysis wire entries show name beneath ID when available
  - table entry footer count updates when filtering narrows results
  - footer shows `0 entries` for filtered-empty state
  - `Network Scope` action area renders `Open` and preserves the requested two-row button grouping
  - `Open` triggers navigation to `Modeling` for the focused network (and focuses/opens the intended network)
- Preserve existing filtering, sorting, and row-selection behavior across touched tables.

## Non-functional requirements
- Keep implementation lightweight by reusing shared table and row-rendering helpers when available.
- Preserve current sort/filter performance characteristics (no expensive duplicate filtering just to compute counts).
- Maintain theme consistency and readable typography across light/dark/composed themes.
- Minimize churn in table interaction behavior beyond the requested visibility/readability improvements.

## Validation and regression safety
- Targeted tests (minimum):
  - `src/tests/app.ui.list-ergonomics.spec.tsx`
  - `src/tests/app.ui.home.spec.tsx` (if shared table footer surfaces appear there)
  - `src/tests/app.ui.networks.spec.tsx` (if network-scope tables receive the footer)
  - `src/tests/app.ui.network-summary-workflow-polish.spec.tsx` (only if shared navigation/open flows are asserted there)
  - `src/tests/app.ui.navigation-canvas.spec.tsx` (only if connector/splice analysis snapshots/assertions are touched)
- Recommended checks:
  - `npm run -s lint`
  - `npm run -s typecheck`
  - `npm run -s test:ci`
  - `npm run -s build`
- Optional closure validation:
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

## Acceptance criteria
- AC1: `Wires` tables no longer show a combined `Endpoints` column and instead show separate `Endpoint A` and `Endpoint B` columns.
- AC2: The split endpoint columns preserve the endpoint-side information previously visible in the combined endpoint presentation (without semantic loss).
- AC3: In `Connectors` and `Splices` analysis wire listings grouped by `Way` / `Port`, each wire entry shows the wire/cable name on a secondary line beneath the technical ID (when a name is available).
- AC4: Every in-scope filterable table renders a right-aligned displayed-entry count below the table.
- AC5: The displayed-entry count updates live when table filters/search input changes visible rows, including filtered-empty states (`0 entries`).
- AC6: `Network Scope` action area includes an `Open` button that opens the currently focused network directly in the `Modeling` screen and sets it as the active network.
- AC7: `Network Scope` action buttons are reorganized into two rows with `New` / `Duplicate` / `Delete` on the first row and `Open` / `Set active` / `Export` on the second row.
- AC8: Existing sort/filter/selection behavior and existing network action behaviors remain functional and non-regressed on touched tables, analysis panels, and the `Network Scope` action area.
- AC9: New UI elements (split columns, secondary wire-name line, entry-count footer, and `Network Scope` button layout) remain readable and theme-consistent across supported themes.

## Out of scope
- Changes to wire data model semantics or endpoint storage.
- New filtering capabilities beyond reflecting existing filtered row counts.
- Pagination or virtualization redesign.
- Reworking connector/splice analysis grouping logic beyond the requested wire-name subrow enhancement.
- Changing the semantics of `Set active` vs `Open` beyond adding the new direct navigation behavior for `Open`.
- Localization framework overhaul (only minor count label wording/pluralization as needed).

# Backlog
- `logics/backlog/item_292_wires_table_split_combined_endpoints_into_endpoint_a_and_endpoint_b_columns.md`
- `logics/backlog/item_293_connectors_splices_analysis_wire_entries_show_name_subrow_beneath_technical_id.md`
- `logics/backlog/item_294_shared_table_footer_displayed_entry_count_for_filtered_rows_across_workspace_tables.md`
- `logics/backlog/item_295_network_scope_action_area_open_button_and_two_row_grouping_rework.md`
- `logics/backlog/item_296_req_047_table_readability_network_scope_action_rework_and_filtered_entry_count_footer_closure_ci_build_and_ac_traceability.md`

# References
- `logics/request/req_044_table_sortability_completion_analysis_nodes_segments_views_and_wire_connector_splice_table_analysis_enrichment.md`
- `src/app/components/workspace/ModelingPrimaryTables.tsx`
- `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
- `src/app/components/workspace/AnalysisConnectorWorkspacePanels.tsx`
- `src/app/components/workspace/AnalysisSpliceWorkspacePanels.tsx`
- `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
- `src/app/components/workspace/TableFilterBar.tsx`
- `src/app/hooks/useEntityListModel.ts`
- `src/app/styles/tables.css`
- `src/tests/app.ui.list-ergonomics.spec.tsx`
