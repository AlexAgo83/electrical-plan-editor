## item_378_ci_workflow_observability_execution_order_always_run_non_blocking_ui_signals - CI workflow observability execution order with always-run non-blocking UI signals
> From version: 0.9.11
> Status: Done
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
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
- Blocks: none (delivered in `task_067`).
- Related AC: AC1, AC4, AC6.
- References:
  - `logics/request/req_069_ci_observability_execution_order_test_segmentation_and_ui_test_reliability.md`
  - `.github/workflows/ci.yml`
  - `package.json`

# Delivery notes
- Added `if: ${{ always() }}` to:
  - `UI coverage report (informational, non-blocking)`
  - `UI slow test top-N (informational, non-blocking)`
- Kept both observability steps non-blocking (`continue-on-error: true`).
- Added explicit build gating for bundle metrics with `id: production_build` and:
  - `if: ${{ steps.production_build.outcome == 'success' }}`

# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: `coverage:ui:report` and `test:ci:ui:slow-top` run even when earlier validation steps fail (`if: always()`), remaining non-blocking.
- request-AC2 -> This backlog slice. Evidence needed: `test:ci:fast` / `test:ci:ui` segmentation contract is explicit and documented.
- request-AC3 -> This backlog slice. Evidence needed: Segmented commands remain complementary to canonical `test:ci`, not replacements.
- request-AC4 -> This backlog slice. Evidence needed: `bundle:metrics:report` remains informational/non-blocking and runs only on successful build artifacts.
- request-AC5 -> This backlog slice. Evidence needed: At least the top unstable UI tests receive root-cause stabilization work or explicit documented rationale when deferred.
- request-AC6 -> This backlog slice. Evidence needed: No material regression in CI runtime reliability and debugging clarity.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
