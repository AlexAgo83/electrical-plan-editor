## item_358_segment_analysis_traversing_wires_table_split_endpoints_into_endpoint_a_and_endpoint_b_columns - Segment analysis traversing-wires table split Endpoints into Endpoint A and Endpoint B columns
> From version: 0.9.8
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Low-Medium
> Theme: Segment analysis table readability and endpoint column split
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The `Segment analysis` traversing-wires table compresses both wire endpoints into one `Endpoints` cell, reducing scanability when comparing multiple rows.

# Scope
- In:
  - Replace the combined `Endpoints` column with `Endpoint A` and `Endpoint B` in the segment-analysis traversing-wires table.
  - Enforce V1 column order `Endpoint A` then `Endpoint B`.
  - Preserve endpoint-side rendering semantics (`describeWireEndpoint(...)`) in each new column.
  - Remove arrow-combined endpoint display and legacy `Endpoints` header from this table in V1.
  - Keep all other columns and row content behavior unchanged.
- Out:
  - Sorting contract changes for endpoint columns (handled in `item_359`)
  - Regression test additions (handled in `item_360`)

# Acceptance criteria
- Segment-analysis traversing-wires table shows `Endpoint A` then `Endpoint B` instead of `Endpoints`.
- Endpoint-side values remain semantically equivalent to the prior combined display.
- Other table columns and row rendering remain functional and readable.

# Priority
- Impact: Medium-High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_065`.
- Blocks: `item_359`, `item_360`, `task_062`.
- Related AC: AC1, AC2, AC4.
- References:
  - `logics/request/req_065_segment_analysis_split_endpoints_column_into_endpoint_a_and_endpoint_b.md`
  - `src/app/components/workspace/AnalysisNodeSegmentWorkspacePanels.tsx`
