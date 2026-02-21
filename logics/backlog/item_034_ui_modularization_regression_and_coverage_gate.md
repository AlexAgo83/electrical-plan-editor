## item_034_ui_modularization_regression_and_coverage_gate - UI Modularization Regression and Coverage Gate
> From version: 0.1.0
> Understanding: 99%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: Quality Assurance
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Large UI refactors can introduce silent behavior drift. Without explicit regression gates, modularization changes may pass locally while degrading workflow reliability.

# Scope
- In:
  - Define regression checklist for UI modularization acceptance.
  - Ensure coverage continuity across split components/hooks/styles/tests.
  - Add traceability from req_005 ACs to automated tests.
  - Validate file-size target in scoped UI files (>500 lines policy).
- Out:
  - Performance benchmarking framework.
  - Visual snapshot infrastructure rollout.

# Acceptance criteria
- Regression suite validates no functional drift on major UI workflows.
- AC traceability for req_005 is explicit and reviewable.
- Scoped UI file-size objective is met or documented with justified exceptions.
- CI quality gates pass consistently after modularization.

# Priority
- Impact: Very high (release confidence).
- Urgency: High before closing UI modularization orchestration.

# Notes
- Dependencies: item_031, item_032, item_033.
- Related AC: AC1, AC2, AC3, AC4, AC5, AC6.
- References:
  - `logics/request/req_005_large_ui_files_split_and_hook_extraction.md`
  - `logics/specs/req_005_ui_modularization_traceability.md`
  - `.github/workflows/ci.yml`
  - `scripts/quality/check-ui-modularization.mjs`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.validation.spec.tsx`
  - `src/tests/app.ui.settings.spec.tsx`
  - `src/tests/app.ui.list-ergonomics.spec.tsx`
  - `tests/e2e/smoke.spec.ts`
