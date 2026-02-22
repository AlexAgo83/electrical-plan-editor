## item_142_app_ui_modules_test_global_control_cleanup_centralization - appUiModules Test Global Control Cleanup Centralization
> From version: 0.5.9
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Low
> Theme: Reduce Cross-Test Leakage from Mutable Lazy/Eager Test Controls
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`appUiModules` exposes mutable test controls (mode/delay/eager registry) as module globals. Some suites reset them manually, but cleanup is not centrally enforced in shared test setup, which risks cross-test leakage.

# Scope
- In:
  - Centralize or strengthen cleanup/reset behavior for `appUiModules` test controls.
  - Preserve existing lazy-loading regression test semantics and per-suite overrides.
- Out:
  - Replacing the registry architecture.
  - Broad test harness redesign.

# Acceptance criteria
- `appUiModules` mutable test controls have reliable cleanup/isolation guardrails across suites.
- Lazy-loading regression tests remain meaningful and pass.
- Changes stay localized and explicit.

# Priority
- Impact: Low-medium (test reliability).
- Urgency: Medium.

# Notes
- Dependencies: `req_022`/`req_023` lazy registry test harness baseline.
- Blocks: item_144.
- Related AC: AC4, AC6, AC7.
- References:
  - `src/app/components/appUiModules.tsx`
  - `src/tests/setup.ts`
  - `src/tests/app.ui.lazy-loading-regression.spec.tsx`
  - `logics/request/req_024_post_req_023_review_followup_canvas_node_click_event_dedup_mouse_button_guards_empty_state_coverage_and_test_isolation_guardrails.md`
