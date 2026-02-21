## item_049_screen_component_split_and_app_line_budget_enforcement - Screen Component Split and App Line Budget Enforcement
> From version: 0.2.0
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: High
> Theme: Orchestration Shell Finalization
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even after hook extractions, the oversized JSX screen composition in `App.tsx` prevents final closure of the line-budget target and keeps the quality gate exception alive.

# Scope
- In:
  - Split large JSX sections into dedicated screen components (Modeling, Analysis, Validation, Settings).
  - Keep `App.tsx` as thin orchestration/composition shell.
  - Remove `App.tsx` oversize allowance from UI quality script.
  - Validate final line-budget compliance and parity of behavior.
- Out:
  - New feature development unrelated to modularization completion.
  - Styling redesign beyond what is needed for safe extraction.

# Acceptance criteria
- `src/app/App.tsx` is below 500 lines and remains an orchestration shell.
- Screen-level rendering is owned by dedicated components with explicit props/contracts.
- `npm run quality:ui-modularization` passes without a documented exception for `App.tsx`.
- Typecheck and regression suites pass with no functional drift.

# Priority
- Impact: Very high (request closure criterion).
- Urgency: High once extraction waves are merged.

# Notes
- Dependencies: item_045, item_046, item_047, item_048.
- Related AC: AC1, AC2, AC4, AC5, AC6.
- References:
  - `logics/request/req_008_app_orchestration_shell_completion_and_final_line_budget.md`
  - `scripts/quality/check-ui-modularization.mjs`
  - `src/app/App.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.validation.spec.tsx`
  - `src/tests/app.ui.settings.spec.tsx`
