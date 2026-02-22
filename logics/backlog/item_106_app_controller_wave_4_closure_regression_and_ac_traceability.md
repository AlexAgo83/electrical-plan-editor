## item_106_app_controller_wave_4_closure_regression_and_ac_traceability - AppController Wave 4 Closure (Regression / Build / PWA / AC Traceability)
> From version: 0.5.2
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Decomposition Delivery Confidence and Request Closure
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Wave-4 `AppController` decomposition will touch high-risk composition and orchestration boundaries; without a closure pass, regressions, stale docs, or unmet reduction goals may remain hidden.

# Scope
- In:
  - Run and stabilize full validation suite after wave-4 controller decomposition.
  - Verify lazy-loading/chunking and PWA artifact health remain intact.
  - Confirm behavior parity across modeling/canvas/inspector/validation/navigation flows.
  - Document AC traceability and final closure status for `req_017`.
- Out:
  - New features unrelated to controller decomposition.
  - Large benchmark/measurement program beyond pragmatic regression validation.

# Acceptance criteria
- Full validation suite passes (`lint`, `typecheck`, UI/store gates, `test:ci`, `test:e2e`, `build`, `quality:pwa`, Logics lint).
- `req_017` AC1..AC8 are traceably satisfied and documented.
- Task/backlog/request docs are updated to final statuses.
- Any test updates remain behavior-oriented and do not weaken coverage intent.

# Priority
- Impact: Very high (final delivery gate).
- Urgency: High (required for clean closure of `req_017`).

# Notes
- Dependencies: item_100, item_101, item_102, item_103, item_104, item_105.
- Related AC: AC1, AC2, AC3, AC4, AC5, AC6, AC7, AC8.
- References:
  - `logics/request/req_017_app_controller_decomposition_wave_4_screen_containers_and_controller_slices.md`
  - `package.json`
  - `.github/workflows/ci.yml`
  - `scripts/quality/check-ui-modularization.mjs`
  - `src/app/AppController.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
  - `src/tests/app.ui.inspector-shell.spec.tsx`
  - `tests/e2e/smoke.spec.ts`

