## task_026_home_screen_post_review_followup_empty_workspace_cta_truthfulness_shortcut_docs_alignment_lazy_startup_tests_and_logics_scope_sync_orchestration_and_delivery_control - Home Screen Post-Review Follow-up Orchestration and Delivery Control (CTA Truthfulness, Shortcut Docs, Startup Tests, Logics Sync)
> From version: 0.6.1
> Understanding: 100%
> Confidence: 98%
> Progress: 0%
> Complexity: Medium
> Theme: Delivery Orchestration for Home Post-Review Corrections and Scope Synchronization
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_027`. This task coordinates post-review follow-up work for the Home screen delivery, including correcting the misleading `Create empty workspace` CTA behavior, aligning Settings shortcut documentation, updating startup/lazy-loading regression expectations for Home-first launch, and synchronizing `req_026` Logics artifacts with the current Home MVP scope.

Backlog scope covered:
- `item_156_home_create_empty_workspace_cta_new_workspace_behavior_and_preference_preservation.md`
- `item_157_settings_shortcut_documentation_alignment_with_current_keyboard_bindings.md`
- `item_158_home_first_startup_lazy_loading_regression_test_expectation_alignment.md`
- `item_159_req_026_home_mvp_scope_docs_sync_after_quick_panels_removal.md`
- `item_160_req_027_followup_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# Plan
- [ ] 1. Deliver Wave 0 Home CTA truthfulness fix: create a genuine new empty workspace and preserve unrelated preferences (`item_156`)
- [ ] 2. Deliver Wave 1 Settings shortcut documentation cleanup aligned to implemented keyboard bindings (`item_157`)
- [ ] 3. Deliver Wave 2 Home-first startup/lazy-loading regression expectation alignment (`item_158`)
- [ ] 4. Deliver Wave 3 Logics scope/AC synchronization for `req_026` artifacts after quick-panel removal (`item_159`)
- [ ] 5. Deliver Wave 4 closure: CI/E2E/build/PWA pass and `req_027` AC traceability (`item_160`)
- [ ] FINAL: Update related Logics docs (request/task/backlog statuses + delivery summary)

# Validation
- Documentation / Logics:
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- Static analysis / compile safety:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run quality:ui-modularization`
  - `npm run quality:store-modularization`
- Automated tests:
  - Targeted runs during implementation (recommended):
    - `src/tests/app.ui.home.spec.tsx`
    - `src/tests/app.ui.lazy-loading-regression.spec.tsx`
    - `src/tests/app.ui.settings.spec.tsx`
  - `npm run test:ci`
- End-to-end tests:
  - `npm run test:e2e`
- Build / delivery checks:
  - `npm run build`
  - `npm run quality:pwa`

# Report
- Wave status:
  - Wave 0 pending: Home CTA must create a real empty workspace without reset/sample semantics.
  - Wave 1 pending: obsolete Settings shortcut hints must be removed/updated to match code.
  - Wave 2 pending: startup/lazy-loading regression tests must be aligned to Home-first launch behavior.
  - Wave 3 pending: `req_026` planning docs must be synchronized with current Home MVP scope after quick-panel removal.
  - Wave 4 pending: closure validation and AC traceability.
- Current blockers:
  - None (planning stage).
- Main risks to track:
  - "Empty workspace" fix accidentally reuses reset/sample paths and keeps misleading semantics.
  - CTA fix unintentionally resets UI preferences or breaks undo/redo history expectations.
  - Test updates weaken lazy-loading regression assertions instead of only updating startup expectations.
  - Logics doc sync misses stale references in task/backlog artifacts, leaving AC drift.
- Mitigation strategy:
  - Define and test explicit empty-workspace state creation contract before wiring the CTA.
  - Add/adjust targeted Home and lazy-loading tests before full CI/E2E runs.
  - Diff `req_026` + `task_025` + backlog references systematically when updating docs.
  - Record final scope decisions and AC traceability in closure notes.
- Validation snapshot (kickoff):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` OK (request + follow-up planning docs)
- Delivery snapshot:
  - Pending implementation.
- AC traceability (`req_027`) target mapping:
  - AC1: Wave 0 (`item_156`) + Wave 4 (`item_160`)
  - AC2: Wave 1 (`item_157`) + Wave 4 (`item_160`)
  - AC3: Wave 2 (`item_158`) + Wave 4 (`item_160`)
  - AC4: Wave 3 (`item_159`) + Wave 4 (`item_160`)
  - AC5: Wave 4 (`item_160`) + FINAL docs update

# References
- `logics/request/req_027_home_screen_post_review_followup_empty_workspace_cta_truthfulness_shortcut_docs_alignment_lazy_startup_tests_and_logics_scope_sync.md`
- `logics/backlog/item_156_home_create_empty_workspace_cta_new_workspace_behavior_and_preference_preservation.md`
- `logics/backlog/item_157_settings_shortcut_documentation_alignment_with_current_keyboard_bindings.md`
- `logics/backlog/item_158_home_first_startup_lazy_loading_regression_test_expectation_alignment.md`
- `logics/backlog/item_159_req_026_home_mvp_scope_docs_sync_after_quick_panels_removal.md`
- `logics/backlog/item_160_req_027_followup_closure_ci_e2e_build_pwa_and_ac_traceability.md`
- `logics/request/req_026_home_workspace_landing_screen_start_resume_quick_preferences_and_post_mvp_hub.md`
- `logics/tasks/task_025_home_workspace_landing_screen_start_resume_quick_preferences_and_post_mvp_hub_orchestration_and_delivery_control.md`
- `src/app/AppController.tsx`
- `src/app/components/workspace/HomeWorkspaceContent.tsx`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/hooks/useKeyboardShortcuts.ts`
- `src/tests/app.ui.home.spec.tsx`
- `src/tests/app.ui.lazy-loading-regression.spec.tsx`

