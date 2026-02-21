## item_024_theme_toggle_and_persistence_test_coverage - Theme Toggle and Persistence Test Coverage
> From version: 0.1.0
> Understanding: 99%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Quality Assurance
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Theme mode introduces UI state, persistence, and cross-screen rendering risks. Without dedicated regression tests, updates can break toggle behavior or restore logic silently.

# Scope
- In:
  - Add unit/integration tests for theme state transitions and persistence restore.
  - Add UI tests for theme switch visibility and behavior across top-level sections.
  - Add E2E coverage for toggle + reload persistence scenarios.
  - Trace test coverage against AC1..AC6 from request `req_003`.
- Out:
  - Visual snapshot baselines for every component permutation.
  - Performance benchmarks specific to CSS repaint/reflow.

# Acceptance criteria
- Tests verify deterministic `normal` <-> `dark` switching in store and UI.
- Reload/persistence tests verify last selected mode restoration.
- Regression tests verify no domain model mutation when theme toggles.
- CI passes with added coverage and no regressions on existing workflows.

# Priority
- Impact: Very high (release confidence and regression prevention).
- Urgency: High before closing orchestration task.

# Notes
- Dependencies: item_020, item_021, item_022, item_023.
- Related AC: AC1, AC2, AC3, AC4, AC5, AC6.
- References:
  - `logics/request/req_003_theme_mode_switch_normal_dark.md`
  - `.github/workflows/ci.yml`
  - `src/tests/store.reducer.spec.ts`
  - `src/tests/persistence.localStorage.spec.ts`
  - `src/tests/app.ui.spec.tsx`
  - `tests/e2e/smoke.spec.ts`

