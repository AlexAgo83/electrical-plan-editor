## item_374_bundle_size_measurement_reporting_and_non_blocking_budget_baseline - Bundle size measurement, reporting, and non-blocking budget baseline
> From version: 0.9.10
> Understanding: 94%
> Confidence: 90%
> Progress: 0%
> Complexity: Medium
> Theme: Measured bundle performance observability before strict thresholds
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Build output warns about oversized chunks, but there is no stable project-level bundle metric reporting/baseline to track regressions over time.

# Scope
- In:
  - Add bundle size reporting/checking that captures at least `main JS chunk` and `total JS gzip` metrics.
  - Introduce non-blocking warning thresholds/baselines before any hard fail thresholds.
  - Keep reporting output clear and actionable for CI and local use.
- Out:
  - Large code-splitting refactors (handled in `item_375`)
  - Hard blocking budgets in V1 unless low-risk and explicitly approved

# Acceptance criteria
- Bundle metrics (`main JS chunk`, `total JS gzip`) are reported consistently.
- Initial budget/baseline behavior is non-blocking and visible.
- Reporting integrates without regressing build/PWA quality gates.

# Priority
- Impact: Medium.
- Urgency: Medium.

# Notes
- Dependencies: `req_068`.
- Blocks: `item_375`, `task_066`.
- Related AC: AC4.
- References:
  - `logics/request/req_068_review_followups_hardening_coverage_bundle_perf_and_test_reliability.md`
  - `vite.config.ts`
  - `scripts/quality/check-pwa-build-artifacts.mjs`
  - `package.json`
