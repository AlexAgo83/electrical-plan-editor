## item_378_ci_workflow_observability_execution_order_always_run_non_blocking_ui_signals - CI workflow observability execution order with always-run non-blocking UI signals
> From version: 0.9.11
> Understanding: 96%
> Confidence: 93%
> Progress: 0%
> Complexity: Medium
> Theme: CI diagnostic signal availability under failure conditions
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Informational CI signals (`coverage:ui:report`, `test:ci:ui:slow-top`) are currently skipped when an earlier blocking step fails, reducing triage quality exactly when failures happen.

# Scope
- In:
  - Make `coverage:ui:report` and `test:ci:ui:slow-top` run with `if: always()` while remaining non-blocking.
  - Keep logs explicit that these steps are informational.
  - Keep `bundle:metrics:report` informational/non-blocking but tied to successful build output.
- Out:
  - Turning informational steps into hard release gates
  - Reordering canonical required validation gates (`lint`, `typecheck`, `test:ci`, `test:e2e`)

# Acceptance criteria
- `coverage:ui:report` and `test:ci:ui:slow-top` execute even when prior steps fail.
- Informational steps remain non-blocking.
- `bundle:metrics:report` behavior remains non-blocking and build-artifact-aware.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_069`.
- Blocks: `item_382`, `task_067`.
- Related AC: AC1, AC4, AC6.
- References:
  - `logics/request/req_069_ci_observability_execution_order_test_segmentation_and_ui_test_reliability.md`
  - `.github/workflows/ci.yml`
  - `package.json`

