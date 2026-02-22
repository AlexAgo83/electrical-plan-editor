## item_125_app_ui_modules_lazy_path_regression_coverage_and_suspense_harness - appUiModules Lazy-Path Regression Coverage and Suspense Harness
> From version: 0.5.6
> Understanding: 99%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: Test the Real Lazy UI Module Path Instead of Only Eager Vitest Mode
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`appUiModules` switches to eager components when running under `Vitest` (`!import.meta.env.VITEST`), so the automated test suite does not exercise the real `lazy()` + `Suspense` behavior used in production. This leaves a gap around loading regressions recently fixed in shell hardening work.

# Scope
- In:
  - Add explicit automated coverage for the lazy UI module path and workspace `Suspense` behavior.
  - Introduce a controlled test harness/opt-in mode if needed, without degrading standard test ergonomics.
  - Cover regressions relevant to blanking/fallback behavior in the workspace area.
- Out:
  - Replacing the lazy/eager registry pattern wholesale.
  - Heavy end-to-end performance benchmarking.

# Acceptance criteria
- Automated tests exercise the real lazy `appUiModules` path (`lazy()` + `Suspense`) in at least one targeted regression scenario.
- Coverage protects against regressions in workspace fallback/blanking behavior relevant to recent fixes.
- Existing test:CI ergonomics remain acceptable (no broad slowdown or brittle global setup).
- Lazy/eager production/test contract remains explicit and documented in code/tests.

# Priority
- Impact: High (regression confidence on production loading path).
- Urgency: High (recent source of subtle UI regressions).

# Notes
- Dependencies: item_124 recommended (not strict) if active-screen assembly changes affect coverage strategy.
- Blocks: item_128.
- Related AC: AC3, AC4, AC7.
- References:
  - `logics/request/req_021_app_controller_post_req_020_review_followup_inactive_screen_computation_lazy_test_path_and_shell_test_guardrails.md`
  - `src/app/components/appUiModules.tsx`
  - `src/app/components/layout/AppShellLayout.tsx`
  - `src/app/AppController.tsx`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
  - `tests/e2e/smoke.spec.ts`
  - `package.json`
