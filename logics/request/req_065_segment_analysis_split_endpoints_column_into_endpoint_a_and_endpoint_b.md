## req_065_segment_analysis_split_endpoints_column_into_endpoint_a_and_endpoint_b - Segment analysis: split Endpoints column into Endpoint A and Endpoint B
> From version: 0.9.8
> Understanding: 99% (user asks to split the `Endpoints` column in `Segments > Segment analysis` into two columns)
> Confidence: 97% (the target table is localized in `AnalysisNodeSegmentWorkspacePanels` and follows existing sortable-table patterns)
> Complexity: Low-Medium
> Theme: Segment analysis table readability / endpoint column split
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- In `Segments` > `Segment analysis`, the current traversing-wires table uses a single `Endpoints` column that compresses both wire ends.
- The user wants this column split into **two distinct columns**:
  - `Endpoint A`
  - `Endpoint B`

# Context
The `Segment analysis` panel (for a selected segment) renders a sortable table of wires traversing the segment, including:
- `Name`
- `Technical ID`
- `Color`
- `Endpoints` (combined A -> B)
- `Section (mm²)`
- `Length (mm)`
- `Route mode`

The combined `Endpoints` cell is less scannable when comparing multiple wires because both sides are merged into one column.

# Objective
- Improve readability in `Segment analysis` by splitting the combined `Endpoints` column into `Endpoint A` and `Endpoint B`.
- Preserve endpoint-side formatting semantics already used in the combined cell.
- Keep sorting behavior, table semantics, and layout non-regressed.

# Functional scope
## A. Segment analysis traversing-wires table column split (high priority)
- Replace the single `Endpoints` column in `Segments` > `Segment analysis` with:
  - `Endpoint A`
  - `Endpoint B`
- Column order contract (V1, locked):
  - `Endpoint A` appears before `Endpoint B`
- The split applies specifically to the traversing-wires table rendered when a segment is selected.
- Preserve the existing endpoint rendering format per side (same `describeWireEndpoint(...)` semantics).
- Remove the arrow-combined representation from the table cell content in V1 (A/B now live in separate columns).
- Legacy header policy (V1, locked):
  - remove the `Endpoints` header from the target table entirely (no fallback header in V1)

## B. Sorting behavior update (high priority)
- Current table sort contract includes a single `endpoints` field.
- V1 split should define deterministic sorting for:
  - `endpointA`
  - `endpointB`
- Sorting policy (V1, locked):
  - both endpoint columns remain individually sortable
  - sort is lexicographic on the endpoint-side text produced by `describeWireEndpoint(...)` (or semantically equivalent normalized string)
- Update sortable headers and `aria-sort` semantics accordingly.
- Preserve all other sort fields and sort interactions unchanged.

## C. Layout/readability and responsiveness (medium priority)
- Ensure the extra column does not break common desktop table readability in the `Segment analysis` panel.
- If needed, rebalance wrapping/width behavior while preserving scanability of:
  - `Technical ID`
  - `Color`
  - `Endpoint A`
  - `Endpoint B`
- Keep visual/theming consistency with existing data tables.

## D. Regression safety (medium priority)
- Add/extend tests for:
  - headers include `Endpoint A` and `Endpoint B` (and no combined `Endpoints` header)
  - endpoint values render in the correct split columns
  - sorting works for the new endpoint columns
  - existing `Segment analysis` table behavior remains functional (selection context, other columns, route mode, etc.)

# Non-functional requirements
- No change to wire data model or endpoint storage semantics.
- No change to segment-selection behavior or segment-analysis panel activation flow.
- Minimal churn outside the targeted segment-analysis table.

# Validation and regression safety
- Add/extend tests in relevant UI integration suites touching `Segment analysis`.
- Run full validation pipeline after implementation (`lint`, `typecheck`, `quality:*`, `build`, `test:ci`, `test:e2e`, `logics_lint`)

# Acceptance criteria
- AC1: In `Segments` > `Segment analysis`, the traversing-wires table replaces `Endpoints` with `Endpoint A` and `Endpoint B`.
- AC1a: Column order is `Endpoint A` then `Endpoint B`.
- AC2: The split columns preserve the endpoint-side information previously shown in the combined `Endpoints` cell.
- AC3: Sorting and `aria-sort` semantics work for the new endpoint columns.
- AC4: Existing `Segment analysis` table behavior and readability remain non-regressed.

# Out of scope
- Changes to other tables that already use endpoint columns.
- Changes to wire endpoint formatting semantics beyond column split.
- Additional segment-analysis columns or row-grouping redesign.

# Backlog
- `logics/backlog/item_358_segment_analysis_traversing_wires_table_split_endpoints_into_endpoint_a_and_endpoint_b_columns.md`
- `logics/backlog/item_359_segment_analysis_traversing_wires_sort_contract_update_for_endpoint_a_and_endpoint_b_columns.md`
- `logics/backlog/item_360_regression_coverage_for_segment_analysis_endpoint_column_split_and_sort_semantics.md`

# Orchestration task
- `logics/tasks/task_062_req_065_segment_analysis_endpoint_column_split_orchestration_and_delivery_control.md`

# References
- `src/app/components/workspace/AnalysisNodeSegmentWorkspacePanels.tsx`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/app.ui.list-ergonomics.spec.tsx`
- `logics/request/req_047_table_readability_endpoint_column_split_analysis_wire_name_subrows_and_filtered_entry_count_footers.md`
