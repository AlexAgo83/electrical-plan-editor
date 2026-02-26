## item_372_ui_coverage_reporting_visibility_for_src_app_non_blocking_ci_signal - UI coverage reporting visibility for `src/app/**` as non-blocking CI signal
> From version: 0.9.10
> Understanding: 95%
> Confidence: 92%
> Progress: 100%
> Complexity: Medium
> Theme: Quality signal observability for UI layer coverage
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Current coverage reporting emphasizes `core/store` and omits `src/app/**`, which can mislead quality discussions for a UI-heavy project.

# Scope
- In:
  - Add a dedicated non-blocking UI coverage reporting path (example: `coverage:ui:report`) covering `src/app/**`.
  - Keep `test:ci` unchanged as the canonical aggregate command.
  - Make output labeling clear (domain/store vs UI coverage).
  - Enable CI-visible informational reporting when feasible.
- Out:
  - Immediate hard thresholds for UI coverage
  - Replacing the existing `test:ci` command
  - Broad test refactors unrelated to coverage visibility

# Acceptance criteria
- A UI coverage report path exists and is documented.
- `test:ci` remains available and unchanged in role.
- UI coverage signal is visible and clearly labeled as informational/non-blocking (initially).

# Priority
- Impact: Medium-High.
- Urgency: Medium.

# Notes
- Dependencies: `req_068`.
- Blocks: `task_066`.
- Related AC: AC3, AC3a, AC3b, AC8.
- References:
  - `logics/request/req_068_review_followups_hardening_coverage_bundle_perf_and_test_reliability.md`
  - `vite.config.ts`
  - `package.json`
