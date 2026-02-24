## item_251_wire_filter_field_selector_state_and_field_specific_filtering_logic - Wire Filter Field Selector State and Field-Specific Filtering Logic
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium-High
> Theme: Wire Filter UX Clarification via Field Selector and Deterministic Field-Scoped Matching
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The wire panels currently expose an endpoint-specific filter input, while list state also includes a broader wire search query. A field selector requires aligning state and implementing deterministic filtering for multiple fields without regressing current endpoint filtering behavior.

# Scope
- In:
  - Add wire filter field selector state (e.g. `Endpoints`, `Wire name`, `Technical ID`, optional `Any`).
  - Replace endpoint-only wording with generic `Filter`.
  - Preserve `Endpoints` as default mode for backward compatibility.
  - Implement field-specific filtering behavior based on selector value.
  - Reuse/align existing wire list model search/filter state where practical to avoid duplicated query states.
  - Update placeholders to match selected filter field (dynamic placeholder recommended).
  - Keep route-mode filters, sorting, and list interactions functional.
- Out:
  - Wire filter row responsive layout/CSS mechanics (handled in item_250).
  - `Network Scope` panel adoption (handled in item_252).
  - Regression test suite additions (handled in item_253).

# Acceptance criteria
- Wire panels show `Filter` label and field selector with at least `Endpoints`, `Wire name`, and `Technical ID`.
- Default selector value preserves current endpoint-filter behavior.
- Switching selector changes filtering behavior deterministically.
- Existing wire route-mode filters and sorting continue to work.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_042`, item_250.
- Blocks: item_252, item_253, item_254.
- Related AC: AC1, AC2, AC4, AC5, AC6, AC8.
- References:
  - `logics/request/req_042_wire_list_filter_bar_field_selector_and_full_width_input_without_panel_growth.md`
  - `src/app/hooks/useEntityListModel.ts`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
  - `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
  - `src/app/hooks/controller/useAppControllerModelingAnalysisScreenDomains.tsx`

