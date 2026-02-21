## item_059_workspace_shell_regression_accessibility_and_scroll_behavior - Workspace Shell Regression Accessibility and Scroll Behavior
> From version: 0.3.0
> Understanding: 99%
> Confidence: 97%
> Progress: 0% (regression matrix refined for inspector visibility states)
> Complexity: High
> Theme: Shell Reliability and QA Coverage
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`req_010` introduces multiple shell-level changes (header, drawer, floating panels, settings entrypoint, defaults), creating high regression risk in accessibility and scrolling behavior.

# Scope
- In:
  - Add regression coverage for sticky header, drawer overlay, and floating panel interactions.
  - Validate keyboard and focus behavior (open/close triggers, escape, focus return).
  - Validate content scroll behavior under sticky header and overlay layering.
  - Validate inspector `open` / `collapsed` / `hidden` transitions across screen/context matrix.
  - Verify no regressions in existing routing, validation, and network isolation flows.
  - Run required quality gates for modularization and test stability.
- Out:
  - Snapshot-heavy visual baseline infrastructure.
  - New cross-browser automation matrix.

# Acceptance criteria
- Automated and/or scripted checks provide traceability for AC1..AC13 from `req_010`.
- Accessibility behavior for drawer and floating panels is verified and stable.
- Scroll and overlay layering is validated without content clipping/overlap regressions.
- Inspector visibility matrix (relevant screen, selection, modal focus, narrow viewport) is validated and stable.
- Existing workflows (import/export, validation, routing, network switching) stay functionally stable.

# Priority
- Impact: Very high (release confidence for a shell-wide change set).
- Urgency: High before closing implementation tasks.

# Notes
- Dependencies: item_055, item_056, item_057, item_058, item_060, item_061, item_062, item_063.
- Related AC: AC1, AC2, AC3, AC4, AC5, AC6, AC7, AC8, AC9, AC10, AC11, AC12, AC13.
- References:
  - `logics/request/req_010_network_scope_workspace_shell_and_global_defaults.md`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.settings.spec.tsx`
  - `src/tests/app.ui.validation.spec.tsx`
  - `src/tests/app.ui.networks.spec.tsx`
  - `src/tests/app.ui.theme.spec.tsx`
  - `tests/e2e/smoke.spec.ts`
