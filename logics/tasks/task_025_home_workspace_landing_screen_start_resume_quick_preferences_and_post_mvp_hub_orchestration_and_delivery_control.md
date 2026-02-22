## task_025_home_workspace_landing_screen_start_resume_quick_preferences_and_post_mvp_hub_orchestration_and_delivery_control - Home Workspace Landing Screen Orchestration and Delivery Control (Start/Resume, Quick Preferences, Post-MVP Hub Hooks)
> From version: 0.5.11
> Understanding: 100%
> Confidence: 98%
> Progress: 0%
> Complexity: Medium
> Theme: Delivery Orchestration for Home Workspace Entry Experience
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_026`. This task coordinates delivery of a new home workspace landing screen focused on action-first startup/resume flows, quick shortcuts/preferences, and extension-ready structure for post-MVP modules.

Backlog scope covered:
- `item_150_home_workspace_screen_shell_navigation_integration_and_menu_return_entry.md`
- `item_151_home_workspace_mvp_start_and_resume_action_modules.md`
- `item_152_home_workspace_quick_shortcuts_and_quick_preferences_modules.md`
- `item_153_home_workspace_responsive_layout_theme_coverage_and_navigation_regression_tests.md`
- `item_154_home_workspace_post_mvp_extension_hooks_and_data_contracts.md`
- `item_155_req_026_home_screen_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# Plan
- [ ] 1. Deliver Wave 0 home screen shell + top-level navigation integration + explicit menu return entry (`item_150`)
- [ ] 2. Deliver Wave 1 home MVP Start/Resume action modules and state-aware summaries (`item_151`)
- [ ] 3. Deliver Wave 2 home Quick shortcuts + Quick preferences modules using existing handlers/preferences (`item_152`)
- [ ] 4. Deliver Wave 3 responsive layout/theme coverage and navigation regression tests (`item_153`)
- [ ] 5. Deliver Wave 4 post-MVP extension hooks / data-contract scaffolding for future home modules (`item_154`)
- [ ] 6. Deliver Wave 5 closure: CI/E2E/build/PWA pass and `req_026` AC traceability (`item_155`)
- [ ] FINAL: Update related Logics docs (request/task/backlog statuses + delivery summary)

# Validation
- Documentation / Logics:
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- Static analysis / compile safety:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run quality:ui-modularization`
  - `npm run quality:store-modularization`
- Automated tests (unit + integration):
  - `npm run test:ci`
  - Targeted runs during implementation (recommended):
    - home navigation/shell regression suite(s)
    - `src/tests/app.ui.theme.spec.tsx`
    - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
    - any new home-screen tests
- End-to-end tests:
  - `npm run test:e2e`
- Build / delivery checks:
  - `npm run build`
  - `npm run quality:pwa`

# Report
- Wave status:
  - Wave 0 pending: home screen shell + menu return entry to be integrated as top-level navigation target.
  - Wave 1 pending: action-first Start/Resume modules to be implemented with empty/non-empty workspace behavior.
  - Wave 2 pending: quick shortcuts/preferences module wiring to existing handlers/preferences.
  - Wave 3 pending: responsive + theme coverage and navigation regressions for the new screen.
  - Wave 4 pending: extension hooks/contracts for post-MVP modules (history/session/health/what's-new).
  - Wave 5 pending: closure validation and AC traceability.
- Current blockers:
  - None (planning stage).
- Main risks to track:
  - Home screen navigation integration regresses existing top-level screen switching or shell shortcuts.
  - Home CTAs duplicate logic and drift from existing handlers (create/import/open screens).
  - Quick preferences duplicate Settings state/behavior instead of reusing persisted preference flows.
  - Theme coverage gaps appear due to introducing a new panel family/surface.
  - Home MVP grows into a dashboard and loses action-first utility.
- Mitigation strategy:
  - Reuse existing handlers/preferences and route actions through the same code paths where possible.
  - Keep Home UI in the existing panel design language and existing CSS architecture.
  - Add targeted navigation + theme regression tests before full CI/E2E runs.
  - Treat post-MVP modules as contracts/placeholders unless explicitly promoted into MVP scope.
- Validation snapshot (kickoff):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` OK (request + backlog + task planning docs)
- Delivery snapshot:
  - Pending implementation.
- AC traceability (`req_026`) target mapping:
  - AC1 / AC1b: Wave 0 (`item_150`) + Wave 3 (`item_153`) + Wave 5 (`item_155`)
  - AC2 / AC3: Waves 1-2 (`item_151`, `item_152`) + Wave 5 (`item_155`)
  - AC4: Wave 3 (`item_153`) + Wave 5 (`item_155`)
  - AC5: Wave 4 (`item_154`) + Wave 5 (`item_155`)
  - AC6: Wave 5 (`item_155`) + FINAL docs update

# References
- `logics/request/req_026_home_workspace_landing_screen_start_resume_quick_preferences_and_post_mvp_hub.md`
- `logics/backlog/item_150_home_workspace_screen_shell_navigation_integration_and_menu_return_entry.md`
- `logics/backlog/item_151_home_workspace_mvp_start_and_resume_action_modules.md`
- `logics/backlog/item_152_home_workspace_quick_shortcuts_and_quick_preferences_modules.md`
- `logics/backlog/item_153_home_workspace_responsive_layout_theme_coverage_and_navigation_regression_tests.md`
- `logics/backlog/item_154_home_workspace_post_mvp_extension_hooks_and_data_contracts.md`
- `logics/backlog/item_155_req_026_home_screen_closure_ci_e2e_build_pwa_and_ac_traceability.md`
- `src/app/AppController.tsx`
- `src/app/components/layout/AppShellLayout.tsx`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/components/workspace/ValidationWorkspaceContent.tsx`
- `src/app/components/workspace/OperationsHealthPanel.tsx`
