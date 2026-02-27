## task_067_req_069_ci_observability_execution_order_test_segmentation_and_ui_test_reliability_orchestration_and_delivery_control - req_069 CI observability execution order, test segmentation, and UI test reliability orchestration and delivery control
> From version: 0.9.11
> Understanding: 99% (delivery completed with CI semantics, explicit segmented-lane contract, targeted UI fixture stabilization, and full validation matrix green)
> Confidence: 96% (scope landed with low ambiguity and reproducible validation evidence)
> Progress: 100%
> Complexity: High
> Theme: CI/test reliability orchestration after req_068 quality follow-ups
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
`req_069` is a focused follow-up to `req_068` and tightens three connected areas:
- informational CI signal availability under failure conditions
- deterministic segmented test command contracts
- targeted stabilization of slow/fragile UI integration specs

Default policy is intentionally conservative:
- `test:ci` remains canonical
- observability steps remain non-blocking
- no hard runtime threshold in V1

# Objective
- Deliver `req_069` in bounded phases without weakening release gates.
- Improve CI triage value when failures occur.
- Reduce segmentation drift and UI flakiness risk.
- Keep documentation, scripts, and regression coverage aligned.

# Scope
- In:
  - Orchestrate `item_378`..`item_382`
  - Sequence delivery by risk (workflow semantics first, then segmentation, then stabilization)
  - Enforce validation gates after each phase and full gate before closure
  - Keep canonical `test:ci` role intact throughout
- Out:
  - Test tooling replacement
  - Broad architecture rewrites
  - Introducing blocking observability thresholds in this wave

# Backlog scope covered
- `logics/backlog/item_378_ci_workflow_observability_execution_order_always_run_non_blocking_ui_signals.md`
- `logics/backlog/item_379_test_ci_segmentation_contract_explicit_globs_and_pwa_fast_lane_assignment.md`
- `logics/backlog/item_380_ui_test_reliability_stabilization_wave_1_for_top_slow_specs.md`
- `logics/backlog/item_381_coverage_ui_report_v1_separate_execution_and_cost_baseline_tracking.md`
- `logics/backlog/item_382_regression_coverage_for_req_069_ci_observability_segmentation_and_ui_reliability.md`

# Phase plan
- [x] Phase 1 (CI workflow semantics): delivered `item_378` and validated always-run/non-blocking behavior.
- [x] Phase 2 (segmentation contract): delivered `item_379` with explicit contract script and docs updates.
- [x] Phase 3 (UI reliability wave 1): delivered `item_380` with targeted fixture-shaping stabilization.
- [x] Phase 4 (coverage-run cost clarity): delivered `item_381` and documented separate-run rationale.
- [x] Final regression sweep and close `item_382`.
- [x] FINAL: synced request/backlog/task docs and captured validation report.

# Validation gates
## Minimum gate (after each phase)
- `npm run -s lint`
- `npm run -s typecheck`
- targeted tests for touched scope

## Full gate (before task closure)
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s quality:ui-modularization`
- `npm run -s quality:store-modularization`
- `npm run -s quality:pwa`
- `npm run -s build`
- `npm run -s test:ci`
- `npm run -s test:e2e`

# Delivery notes guardrails
- Preserve required release gates (`test:ci`, `test:e2e`) as blocking.
- Keep informational CI steps visibly informational and non-blocking.
- Avoid segmentation by fragile naming conventions only; prefer explicit ownership/glob contracts.
- Prefer root-cause UI stabilization over timeout inflation; any new timeout increase must be justified.

# Report
- Current blockers: none.
- Delivery status:
  - Complete.
  - `item_378`: CI observability now uses explicit `if: always()` for UI coverage + UI slow-top, non-blocking preserved.
  - `item_379`: segmented commands now use explicit allowlist contract via `scripts/quality/run-vitest-segmented.mjs`; `pwa.*` kept in fast lane; CI includes `test:ci:segmentation:check`.
  - `item_380`: top slow UI tests stabilized via targeted fixture shaping without timeout inflation.
  - `item_381`: `coverage:ui:report` remains separate and informational with clear CI labeling/cost visibility.
  - `item_382`: regression guardrails and full validation matrix executed successfully.
- Validation gate status:
  - Passed: `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
  - Passed: `npm run -s lint`
  - Passed: `npm run -s typecheck`
  - Passed: `npm run -s quality:ui-modularization`
  - Passed: `npm run -s quality:store-modularization`
  - Passed: `npm run -s quality:pwa`
  - Passed: `npm run -s build`
  - Passed: `npm run -s test:ci`
  - Passed: `npm run -s test:e2e`
- Residual risk notes:
  - UI suites remain the dominant runtime cost; additional wave(s) can further split heavy specs while keeping assertion intent stable.

# References
- `logics/request/req_069_ci_observability_execution_order_test_segmentation_and_ui_test_reliability.md`
- `.github/workflows/ci.yml`
- `package.json`
- `README.md`
- `scripts/quality/run-vitest-segmented.mjs`
- `scripts/quality/report-ui-coverage.mjs`
- `scripts/quality/report-slowest-tests.mjs`
- `scripts/quality/report-bundle-metrics.mjs`
