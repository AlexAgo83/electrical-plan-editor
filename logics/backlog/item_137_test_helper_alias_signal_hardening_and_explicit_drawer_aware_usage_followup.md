## item_137_test_helper_alias_signal_hardening_and_explicit_drawer_aware_usage_followup - Test Helper Alias Signal Hardening and Explicit Drawer-Aware Usage Follow-up
> From version: 0.5.8
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Low
> Theme: Improve Regression Signal by Reducing Hidden Drawer-Aware Defaults
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Although strict and drawer-aware helper variants exist, legacy aliases still default to drawer-aware behavior. Many tests continue to use those aliases, which can hide navigation/drawer regressions by silently repairing UI state.

# Scope
- In:
  - Reduce reliance on legacy aliases in critical tests, or adjust helper export contracts/documentation to make drawer-aware behavior more explicit.
  - Preserve drawer-aware ergonomics where explicitly intended.
  - Keep test readability high.
- Out:
  - Broad rewrite of the entire test helper layer.
  - Production code changes unrelated to test signal.

# Acceptance criteria
- Drawer-aware helper usage is more explicit in touched tests/contracts.
- Regression signal quality improves (less silent auto-repair in critical test paths).
- Touched tests remain readable and pass.

# Priority
- Impact: Medium (test signal quality).
- Urgency: Medium (incremental hardening follow-up).

# Notes
- Dependencies: `req_021` / `req_022` helper contract baseline.
- Blocks: item_138.
- Related AC: AC5, AC6, AC7.
- References:
  - `logics/request/req_023_post_req_022_review_followup_settings_empty_state_precedence_remaining_compute_scoping_lazy_registry_tla_portability_and_test_helper_signal.md`
  - `src/tests/helpers/app-ui-test-utils.tsx`
  - `src/tests/app.ui.settings.spec.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.validation.spec.tsx`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
