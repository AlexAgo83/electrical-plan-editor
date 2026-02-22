## item_141_no_active_network_empty_state_non_settings_regression_coverage - No-Active-Network Empty-State Non-Settings Regression Coverage
> From version: 0.5.9
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Low
> Theme: Protect Branch Precedence for Empty-State vs Settings Paths
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`req_023` added coverage for Settings access without an active network, but non-settings empty-state behavior (modeling/analysis/validation) still lacks focused regression coverage and could regress during future branch-priority refactors.

# Scope
- In:
  - Add explicit regression coverage for non-settings no-active-network empty-state behavior.
  - Preserve Settings accessibility coverage/path.
- Out:
  - Empty-state UI redesign.
  - Navigation redesign.

# Acceptance criteria
- Non-settings no-active-network empty-state path is explicitly tested.
- Settings no-active-network accessible path remains covered.
- Touched tests remain readable and pass.

# Priority
- Impact: Low-medium (regression prevention).
- Urgency: Medium.

# Notes
- Dependencies: `req_023` branch precedence fix baseline.
- Blocks: item_144.
- Related AC: AC3, AC6, AC7.
- References:
  - `src/app/components/layout/AppShellLayout.tsx`
  - `src/tests/app.ui.settings.spec.tsx`
  - `src/tests/app.ui.networks.spec.tsx`
  - `logics/request/req_024_post_req_023_review_followup_canvas_node_click_event_dedup_mouse_button_guards_empty_state_coverage_and_test_isolation_guardrails.md`
