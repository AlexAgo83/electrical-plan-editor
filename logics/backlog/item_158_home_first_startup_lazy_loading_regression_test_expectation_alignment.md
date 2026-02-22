## item_158_home_first_startup_lazy_loading_regression_test_expectation_alignment - Home-First Startup Lazy-Loading Regression Test Expectation Alignment
> From version: 0.6.1
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Re-align Regression Tests with Home-as-Initial-Screen Without Weakening Signal
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Some integration/lazy-loading tests still assume `Network Scope` is the initial screen, but the app now starts on `Home` by default. This creates stale assertions and CI instability unrelated to actual regressions.

# Scope
- In:
  - Update startup expectations in affected tests to `Home` as the initial screen.
  - Preserve lazy-loading/Suspense regression intent (shell visibility, no blanking, fallback behavior).
  - Adjust test helpers/fixtures only as needed to keep assertions precise.
- Out:
  - Changing product behavior back to `Network Scope` startup.
  - Broad rewrites of test architecture.

# Acceptance criteria
- Tests that validate startup/lazy-loading behavior expect `Home` as the initial screen.
- Original regression signal (lazy path + shell continuity) remains covered.
- `test:ci` and `test:e2e` pass with the updated expectations.

# Priority
- Impact: High (CI reliability / regression confidence).
- Urgency: High.

# Notes
- Dependencies: `req_027`.
- Blocks: item_160.
- Related AC: AC3, AC5.
- References:
  - `logics/request/req_027_home_screen_post_review_followup_empty_workspace_cta_truthfulness_shortcut_docs_alignment_lazy_startup_tests_and_logics_scope_sync.md`
  - `src/app/hooks/useWorkspaceNavigation.ts`
  - `src/tests/app.ui.lazy-loading-regression.spec.tsx`
  - `src/tests/app.ui.home.spec.tsx`
  - `tests/e2e/smoke.spec.ts`

