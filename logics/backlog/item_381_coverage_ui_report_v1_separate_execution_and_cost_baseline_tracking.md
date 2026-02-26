## item_381_coverage_ui_report_v1_separate_execution_and_cost_baseline_tracking - `coverage:ui:report` V1 separate execution and CI cost baseline tracking
> From version: 0.9.11
> Understanding: 94%
> Confidence: 90%
> Progress: 0%
> Complexity: Medium
> Theme: Coverage observability clarity with explicit duplication/cost trade-off management
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Keeping `coverage:ui:report` as a separate CI run improves clarity but introduces duplicate execution cost that should remain visible and intentionally managed.

# Scope
- In:
  - Keep `coverage:ui:report` separate in V1 and non-blocking.
  - Ensure CI output clearly labels this step as informational observability.
  - Track baseline cost signals (at minimum command/runtime visibility in CI logs) to support a later merge-vs-separate decision.
  - Document revisit conditions for future optimization if duplicated runtime cost becomes material.
- Out:
  - Merging UI coverage into canonical `test:ci` in this request
  - Introducing hard runtime thresholds in V1

# Acceptance criteria
- `coverage:ui:report` remains a separate non-blocking observability step in CI.
- Cost/duplication visibility is explicit enough to support later optimization decisions.
- Revisit policy is documented (what should trigger reassessment of separate execution).

# Priority
- Impact: Medium.
- Urgency: Medium.

# Notes
- Dependencies: `req_069`, `item_378`.
- Blocks: `item_382`, `task_067`.
- Related AC: AC1, AC6.
- References:
  - `logics/request/req_069_ci_observability_execution_order_test_segmentation_and_ui_test_reliability.md`
  - `.github/workflows/ci.yml`
  - `scripts/quality/report-ui-coverage.mjs`
  - `package.json`
  - `README.md`
