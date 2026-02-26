## item_360_regression_coverage_for_segment_analysis_endpoint_column_split_and_sort_semantics - Regression coverage for segment analysis endpoint column split and sort semantics
> From version: 0.9.8
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Regression safety for segment analysis traversing-wires endpoint column split
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The segment-analysis endpoint-column split changes table headers, rendering, and sort wiring. Without targeted regression coverage, header semantics or endpoint placement could regress silently.

# Scope
- In:
  - Add regression tests for segment-analysis traversing-wires headers showing `Endpoint A` / `Endpoint B`.
  - Add assertions that the combined `Endpoints` header/cell representation is no longer used in the target table.
  - Add endpoint-column rendering checks for representative wires.
  - Add sort/`aria-sort` regression coverage for the new endpoint columns.
  - Add assertions that `Endpoint A` appears before `Endpoint B` in the target table header row.
  - Preserve non-regression checks for other segment-analysis table columns/flows.
- Out:
  - Visual snapshot testing of all segment-analysis layouts/themes.

# Acceptance criteria
- Automated tests cover header split, endpoint-column rendering, and split sort semantics.
- Automated tests confirm header order (`Endpoint A` before `Endpoint B`) and absence of legacy `Endpoints` in the target table.
- Automated tests confirm `aria-sort` behavior remains correct for the new headers.
- Existing segment-analysis flows remain green after the table change.

# Priority
- Impact: Medium-High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_065`, `item_358`, `item_359`.
- Blocks: `task_062`.
- Related AC: AC1, AC2, AC3, AC4.
- References:
  - `logics/request/req_065_segment_analysis_split_endpoints_column_into_endpoint_a_and_endpoint_b.md`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.list-ergonomics.spec.tsx`
  - `src/app/components/workspace/AnalysisNodeSegmentWorkspacePanels.tsx`
