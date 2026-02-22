## item_126_test_navigation_switch_helpers_explicit_drawer_aware_and_strict_modes - Test Navigation Switch Helpers: Explicit Drawer-Aware and Strict Modes
> From version: 0.5.6
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Low
> Theme: Avoid Masking Drawer/Nav Regressions with Over-Automatic Test Helpers
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`switchScreen(...)` and `switchSubScreen(...)` in test helpers automatically open and close the navigation drawer when target buttons are not directly available. This improves test ergonomics after hidden/inert drawer hardening, but it can also hide regressions in drawer visibility/accessibility behavior by silently repairing navigation state.

# Scope
- In:
  - Clarify helper semantics with explicit modes or separate helpers (e.g. strict vs drawer-aware).
  - Preserve readable test intent while making drawer assumptions explicit.
  - Update affected tests selectively to use the appropriate helper variant.
- Out:
  - Rewriting the full UI test helper layer.
  - Broad test naming/style changes unrelated to navigation helper semantics.

# Acceptance criteria
- Test helper behavior for screen switching is explicit (drawer-aware behavior is opt-in or clearly named).
- Tests that should detect nav/drawer regressions are not silently repaired by helper automation.
- Existing tests remain readable and pass after minimal migration.

# Priority
- Impact: Medium (test signal quality).
- Urgency: Medium (follow-up guardrail after task_019 helper adaptation).

# Notes
- Dependencies: none strict.
- Blocks: item_128.
- Related AC: AC5, AC7.
- References:
  - `logics/request/req_021_app_controller_post_req_020_review_followup_inactive_screen_computation_lazy_test_path_and_shell_test_guardrails.md`
  - `src/tests/helpers/app-ui-test-utils.tsx`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.settings.spec.tsx`
  - `src/tests/app.ui.validation.spec.tsx`
