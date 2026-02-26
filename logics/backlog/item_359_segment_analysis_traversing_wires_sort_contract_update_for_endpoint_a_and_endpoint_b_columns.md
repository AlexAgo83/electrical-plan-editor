## item_359_segment_analysis_traversing_wires_sort_contract_update_for_endpoint_a_and_endpoint_b_columns - Segment analysis traversing-wires sort contract update for Endpoint A and Endpoint B columns
> From version: 0.9.8
> Understanding: 98%
> Confidence: 96%
> Progress: 100%
> Complexity: Low-Medium
> Theme: Segment analysis sortable-table contract update for split endpoint columns
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The segment-analysis traversing-wires table currently exposes a single sortable `endpoints` field. Splitting the UI into `Endpoint A` / `Endpoint B` requires corresponding sort-field and `aria-sort` updates to avoid regressions.

# Scope
- In:
  - Replace the `endpoints` sort field with deterministic `endpointA` and `endpointB` sort fields (or equivalent explicit split fields).
  - Update sort comparators and header click wiring for the split columns.
  - Use lexicographic ordering based on endpoint-side display text (`describeWireEndpoint(...)`) or semantically equivalent normalized values.
  - Update `aria-sort` semantics for the new sortable headers.
  - Preserve all non-endpoint sort fields and behaviors unchanged.
- Out:
  - Core UI column rendering split (handled in `item_358`)
  - Regression test additions (handled in `item_360`)

# Acceptance criteria
- Segment-analysis traversing-wires table supports sorting by `Endpoint A` and `Endpoint B`.
- Sorting for `Endpoint A` and `Endpoint B` is deterministic and lexicographic on the endpoint-side rendered text (or semantically equivalent normalized values).
- `aria-sort` reflects the active sort state on the new endpoint headers.
- Existing sorts (`name`, `technicalId`, `color`, `sectionMm2`, `lengthMm`, `routeMode`) remain non-regressed.

# Priority
- Impact: Medium-High.
- Urgency: Medium.

# Notes
- Dependencies: `req_065`, `item_358`.
- Blocks: `item_360`, `task_062`.
- Related AC: AC3, AC4.
- References:
  - `logics/request/req_065_segment_analysis_split_endpoints_column_into_endpoint_a_and_endpoint_b.md`
  - `src/app/components/workspace/AnalysisNodeSegmentWorkspacePanels.tsx`
  - `src/app/lib/tableSort.ts`
