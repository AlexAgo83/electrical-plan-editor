## item_292_wires_table_split_combined_endpoints_into_endpoint_a_and_endpoint_b_columns - Wires Table Split Combined Endpoints into `Endpoint A` and `Endpoint B` Columns
> From version: 0.9.1
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Wire table readability improvement through explicit endpoint-side column separation
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`Wires` tables currently compress both wire endpoints into a single `Endpoints` column, which reduces readability and makes side-by-side scanning difficult when endpoint values are long (connector way / splice port / node/free endpoint formats, optional side metadata).

# Scope
- In:
  - Replace the combined `Endpoints` column with two explicit columns:
    - `Endpoint A`
    - `Endpoint B`
  - Apply the change to all relevant `Wires` tables that currently render the combined endpoint column (minimum: Modeling and Analysis wire tables).
  - Preserve endpoint-side formatting semantics for connector/splice/node/free endpoint representations.
  - Preserve sorting behavior with deterministic comparators for `Endpoint A` and `Endpoint B` if the prior combined endpoint column was sortable.
  - Adjust column widths/wrapping as needed to maintain readability on supported desktop widths.
- Out:
  - Changes to wire endpoint data model/storage semantics.
  - New endpoint metadata not already surfaced in the existing endpoint presentation.
  - Connector/splice analysis row formatting changes (handled in item_293).
  - Shared table entry-count footer rollout (handled in item_294).

# Acceptance criteria
- `Wires` tables no longer expose a combined `Endpoints` column and instead show `Endpoint A` and `Endpoint B`.
- Endpoint-side information previously shown in the combined cell remains visible without semantic loss.
- Table sorting/selection/filter behavior remains functional and non-regressed on touched wire tables.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_047`.
- Blocks: item_296.
- Related AC: AC1, AC2, AC8, AC9.
- References:
  - `logics/request/req_047_table_readability_endpoint_column_split_analysis_wire_name_subrows_and_filtered_entry_count_footers.md`
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`
  - `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
  - `src/app/hooks/useEntityListModel.ts`
  - `src/app/styles/tables.css`
  - `src/tests/app.ui.list-ergonomics.spec.tsx`
