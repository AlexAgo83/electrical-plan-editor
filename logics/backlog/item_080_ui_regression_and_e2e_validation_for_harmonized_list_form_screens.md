## item_080_ui_regression_and_e2e_validation_for_harmonized_list_form_screens - UI Regression and E2E Validation for Harmonized List/Form Screens
> From version: 0.4.0
> Understanding: 99%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Delivery Closure and Confidence
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The list/form harmonization affects multiple entity workflows and requires consolidated validation before request closure.

# Scope
- In:
  - Run and stabilize full regression set for migrated list/form surfaces.
  - Add/refresh E2E coverage for key entity flows using focused-row action model.
  - Validate AC traceability for `req_013` from AC1 to AC8.
  - Validate no regression on domain behavior, persistence, and workspace navigation.
  - Confirm quality gates remain green after migration.
- Out:
  - New feature expansion beyond req_013.
  - Non-target performance optimization efforts.

# Acceptance criteria
- Automated tests cover migrated list/form interactions across entities.
- E2E scenarios confirm end-user flow consistency with under-list action model.
- AC1..AC8 for `req_013` are traceably satisfied.
- Quality gates pass: `lint`, `typecheck`, `test:ci`, `test:e2e`, `quality:ui-modularization`, `quality:store-modularization`.

# Priority
- Impact: Very high (release confidence).
- Urgency: High (final gate before closing req_013).

# Notes
- Dependencies: item_078, item_079.
- Related AC: AC1, AC2, AC3, AC4, AC5, AC6, AC7, AC8.
- References:
  - `logics/request/req_013_list_form_workspace_harmonization_based_on_network_scope.md`
  - `src/tests/app.ui.networks.spec.tsx`
  - `src/tests/app.ui.list-ergonomics.spec.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `tests/e2e/smoke.spec.ts`
  - `package.json`
