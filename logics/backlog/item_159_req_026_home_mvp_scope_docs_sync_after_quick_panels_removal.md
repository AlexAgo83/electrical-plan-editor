## item_159_req_026_home_mvp_scope_docs_sync_after_quick_panels_removal - req_026 Home MVP Scope Docs Sync After Quick Panels Removal
> From version: 0.6.1
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Low
> Theme: Synchronize Home MVP Planning Docs with Implemented Scope After Quick-Panel Removal
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`req_026`, `task_025`, and related backlog items still describe `Quick shortcuts` / `Quick preferences` as Home MVP modules even though those panels were removed. This creates scope drift and ambiguous acceptance criteria for future closure.

# Scope
- In:
  - Update `req_026`, `task_025`, and relevant backlog items to match the current Home MVP scope.
  - Remove stale references to removed quick panels from MVP acceptance/plan text.
  - Preserve post-MVP extensibility intent where still valid.
- Out:
  - Reintroducing the removed panels.
  - Changing already-delivered Home behavior beyond documentation alignment.

# Acceptance criteria
- `req_026`, `task_025`, and impacted backlog docs no longer require removed `Quick shortcuts` / `Quick preferences` MVP panels.
- AC/plan wording remains internally consistent and traceable.
- Logics linter passes after doc synchronization.

# Priority
- Impact: Medium (planning/traceability correctness).
- Urgency: Medium.

# Notes
- Dependencies: `req_027`.
- Blocks: item_160.
- Related AC: AC4, AC5.
- References:
  - `logics/request/req_027_home_screen_post_review_followup_empty_workspace_cta_truthfulness_shortcut_docs_alignment_lazy_startup_tests_and_logics_scope_sync.md`
  - `logics/request/req_026_home_workspace_landing_screen_start_resume_quick_preferences_and_post_mvp_hub.md`
  - `logics/tasks/task_025_home_workspace_landing_screen_start_resume_quick_preferences_and_post_mvp_hub_orchestration_and_delivery_control.md`
  - `logics/backlog/item_150_home_workspace_screen_shell_navigation_integration_and_menu_return_entry.md`
  - `logics/backlog/item_151_home_workspace_mvp_start_and_resume_action_modules.md`
  - `logics/backlog/item_152_home_workspace_quick_shortcuts_and_quick_preferences_modules.md`
  - `logics/backlog/item_153_home_workspace_responsive_layout_theme_coverage_and_navigation_regression_tests.md`
  - `logics/backlog/item_154_home_workspace_post_mvp_extension_hooks_and_data_contracts.md`
  - `logics/backlog/item_155_req_026_home_screen_closure_ci_e2e_build_pwa_and_ac_traceability.md`

