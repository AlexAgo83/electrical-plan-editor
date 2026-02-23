## item_218_onboarding_flow_regression_tests_for_auto_open_opt_out_contextual_steps_and_navigation_cta - Onboarding Flow Regression Tests for Auto-Open, Opt-Out, Contextual Steps, and Navigation CTA
> From version: 0.7.3
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Regression Coverage for Guided/Contextual Onboarding Behavior and Persistence
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Onboarding spans modal state, persistence, Home entry points, contextual help triggers, and navigation/scroll behavior. Without focused tests, regressions will be likely and hard to detect.

# Scope
- In:
  - Add/adjust regression tests for onboarding auto-open on app load.
  - Test persisted opt-out behavior across reloads.
  - Test Home Help relaunch behavior.
  - Test contextual single-step help modal triggers.
  - Test onboarding step CTA navigation to target screen/panel (including scroll behavior as feasible).
  - Cover at least one modal content rendering assertion (title/progress/actions).
- Out:
  - Full CI closure reporting (handled separately).
  - Exhaustive visual snapshot coverage unless already part of project strategy.

# Acceptance criteria
- Automated tests cover key onboarding behaviors: auto-open, opt-out persistence, relaunch, contextual step open, and navigation CTA.
- Tests validate regressions on at least Home + one modeling panel context.

# Priority
- Impact: Very High.
- Urgency: High.

# Notes
- Dependencies: `req_035`, item_213, item_214, item_215, item_216, item_217.
- Blocks: item_219.
- Related AC: AC3, AC4, AC5, AC6, AC7, AC8.
- References:
  - `logics/request/req_035_step_by_step_onboarding_modal_flow_for_first_network_creation_and_contextual_help.md`
  - `src/tests/app.ui.home.spec.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/persistence.localStorage.spec.ts`

