## item_358_segment_analysis_traversing_wires_table_split_endpoints_into_endpoint_a_and_endpoint_b_columns - Segment analysis traversing-wires table split Endpoints into Endpoint A and Endpoint B columns
> From version: 0.9.8
> Status: Done
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

# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: In `Segments` > `Segment analysis`, the traversing-wires table replaces `Endpoints` with `Endpoint A` and `Endpoint B`.
- request-AC2 -> This backlog slice. Evidence needed: The split columns preserve the endpoint-side information previously shown in the combined `Endpoints` cell.
- request-AC3 -> This backlog slice. Evidence needed: Sorting and `aria-sort` semantics work for the new endpoint columns.
- request-AC4 -> This backlog slice. Evidence needed: Existing `Segment analysis` table behavior and readability remain non-regressed.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC1A -> This backlog slice. Proof: Historical delivery or planned chain is recorded in the linked Logics report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
