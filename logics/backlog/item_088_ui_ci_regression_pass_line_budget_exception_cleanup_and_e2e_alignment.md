## item_088_ui_ci_regression_pass_line_budget_exception_cleanup_and_e2e_alignment - UI/CI Regression Pass, Line-Budget Exception Cleanup, and E2E Alignment
> From version: 0.5.0
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Refactor Closure and Delivery Confidence
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Wave-2 modularization spans multiple high-risk surfaces; without a dedicated closure pass, regressions, stale tests, or outdated line-budget exceptions can remain hidden and block reliable delivery.

# Scope
- In:
  - Run and stabilize full CI-quality pipeline after wave-2 refactors.
  - Align integration/E2E tests with refactored internal structure while preserving behavior assertions.
  - Revisit `quality:ui-modularization` exceptions and remove/reduce stale entries when possible.
  - Validate AC traceability for `req_014` (AC1..AC9).
- Out:
  - Additional feature work not required to close `req_014`.
  - Broader performance benchmarking beyond regression validation.

# Acceptance criteria
- CI pipeline passes (`lint`, `typecheck`, quality gates, `test:ci`, `test:e2e`) after wave-2 refactor changes.
- Test suites accurately reflect current UX behavior and no stale selectors/headings remain.
- `quality:ui-modularization` exception list is updated to match real file state (reduced when possible).
- AC1..AC9 for `req_014` are traceably satisfied and documented.

# Priority
- Impact: Very high (delivery confidence and request closure).
- Urgency: High (final gate before closing `req_014`).

# Notes
- Dependencies: item_081, item_082, item_083, item_084, item_085, item_086, item_087.
- Related AC: AC1, AC2, AC3, AC4, AC5, AC6, AC7, AC8, AC9.
- References:
  - `logics/request/req_014_ui_modularization_wave_2_controller_analysis_canvas_and_bundle_optimization.md`
  - `scripts/quality/check-ui-modularization.mjs`
  - `.github/workflows/ci.yml`
  - `package.json`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
  - `src/tests/app.ui.inspector-shell.spec.tsx`
  - `tests/e2e/smoke.spec.ts`
