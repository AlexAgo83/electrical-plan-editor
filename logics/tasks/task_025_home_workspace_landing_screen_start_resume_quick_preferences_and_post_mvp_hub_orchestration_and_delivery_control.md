## task_025_home_workspace_landing_screen_start_resume_quick_preferences_and_post_mvp_hub_orchestration_and_delivery_control - Home Workspace Landing Screen Orchestration and Delivery Control (Start/Resume MVP, Post-MVP Hub Hooks)
> From version: 0.5.11
> Understanding: 99%
> Confidence: 99%
> Progress: 100%
> Complexity: Medium
> Theme: Delivery Orchestration for Home Workspace Entry Experience
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_026`. This task coordinates delivery of a new home workspace landing screen focused on action-first startup/resume flows and extension-ready structure for post-MVP modules. The previously planned `Quick shortcuts` / `Quick preferences` Home modules were removed from MVP scope and are tracked as a documented de-scope decision.

Backlog scope covered:
- `item_150_home_workspace_screen_shell_navigation_integration_and_menu_return_entry.md`
- `item_151_home_workspace_mvp_start_and_resume_action_modules.md`
- `item_152_home_workspace_quick_shortcuts_and_quick_preferences_modules.md`
- `item_153_home_workspace_responsive_layout_theme_coverage_and_navigation_regression_tests.md`
- `item_154_home_workspace_post_mvp_extension_hooks_and_data_contracts.md`
- `item_155_req_026_home_screen_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# Plan
- [x] 1. Deliver Wave 0 home screen shell + top-level navigation integration + explicit menu return entry (`item_150`)
- [x] 2. Deliver Wave 1 home MVP Start/Resume action modules and state-aware summaries (`item_151`)
- [x] 3. Record de-scope of Home Quick shortcuts + Quick preferences MVP modules and preserve post-MVP intent (`item_152`)
- [x] 4. Deliver Wave 3 responsive layout/theme coverage and navigation regression tests (`item_153`)
- [x] 5. Deliver Wave 4 post-MVP extension hooks / data-contract scaffolding for future home modules (`item_154`)
- [x] 6. Deliver Wave 5 closure: CI/E2E/build/PWA pass and `req_026` AC traceability (`item_155`)
- [x] FINAL: Update related Logics docs (request/task/backlog statuses + delivery summary)

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
  - Wave 0 completed: `Home` integrated as top-level screen with explicit menu/navigation return entry and Home-first startup behavior.
  - Wave 1 completed: Home MVP `Start` and `Resume` modules delivered with workflow CTAs and state-aware summaries (empty/non-empty workspace handling).
  - Wave 2 completed: Home `Quick shortcuts` / `Quick preferences` panels de-scoped from MVP and documented while preserving post-MVP intent.
  - Wave 3 completed: responsive layout, theme coverage, and Home navigation regression coverage delivered (including Home startup/lazy-path expectation alignment in follow-up).
  - Wave 4 completed: extension-ready Home composition boundaries delivered for post-MVP modules (scaffolded insertion points / optional module contracts).
  - Wave 5 completed: closure validation suite passed and AC traceability documented.
- Current blockers:
  - None.
- Main risks to track:
  - Home screen navigation integration regresses existing top-level screen switching or shell shortcuts.
  - Home CTAs duplicate logic and drift from existing handlers (create/import/open screens).
  - Scope drift between `req_026` planning docs and the implemented Home MVP (quick panels removed) creates ambiguous AC closure.
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
  - Core delivery:
    - `src/app/components/workspace/HomeWorkspaceContent.tsx`
    - `src/app/components/screens/HomeScreen.tsx`
    - `src/app/components/containers/HomeWorkspaceContainer.tsx`
    - `src/app/components/layout/AppShellLayout.tsx`
    - `src/app/components/WorkspaceNavigation.tsx`
    - `src/app/components/appUiModules.tsx`
    - `src/app/components/appUiModules.eager.ts`
    - `src/app/hooks/useWorkspaceNavigation.ts`
    - `src/app/hooks/useWorkspaceShellChrome.ts`
    - `src/app/hooks/useKeyboardShortcuts.ts`
    - `src/app/styles/home.css`
    - `src/tests/app.ui.home.spec.tsx`
  - Follow-up sync tied to Home closure expectations:
    - `src/tests/app.ui.lazy-loading-regression.spec.tsx`
    - `logics/request/req_026_home_workspace_landing_screen_start_resume_quick_preferences_and_post_mvp_hub.md`
    - `logics/backlog/item_152_home_workspace_quick_shortcuts_and_quick_preferences_modules.md`
    - `logics/backlog/item_155_req_026_home_screen_closure_ci_e2e_build_pwa_and_ac_traceability.md`
- Validation results (finalized):
  - `npm run lint` OK
  - `npm run typecheck` OK
  - `npm run quality:ui-modularization` OK
  - `npm run quality:store-modularization` OK
  - `npm run test:ci` OK (`28` files / `155` tests)
  - `npm run test:e2e` OK (`2/2`)
  - `npm run build` OK
  - `npm run quality:pwa` OK
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` OK
- AC traceability (`req_026`) target mapping:
  - AC1 / AC1b satisfied: Wave 0 (`item_150`) + Wave 3 (`item_153`) + Wave 5 (`item_155`)
  - AC2 / AC3 satisfied: Waves 1-2 (`item_151`, `item_152` de-scope decision) + Wave 5 (`item_155`)
  - AC4 satisfied: Wave 3 (`item_153`) + Wave 5 (`item_155`)
  - AC5 satisfied: Wave 4 (`item_154`) + Wave 5 (`item_155`)
  - AC6 satisfied: Wave 5 (`item_155`) + FINAL docs update

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
- `src/app/components/workspace/HomeWorkspaceContent.tsx`
- `src/app/components/WorkspaceNavigation.tsx`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/hooks/useWorkspaceNavigation.ts`
- `src/app/hooks/useWorkspaceShellChrome.ts`
- `src/app/hooks/useKeyboardShortcuts.ts`
- `src/tests/app.ui.home.spec.tsx`
- `src/tests/app.ui.lazy-loading-regression.spec.tsx`
