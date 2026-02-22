## req_027_home_screen_post_review_followup_empty_workspace_cta_truthfulness_shortcut_docs_alignment_lazy_startup_tests_and_logics_scope_sync - Home Screen Post-Review Follow-up for Empty-Workspace CTA Truthfulness, Shortcut Docs Alignment, Lazy Startup Test Expectations, and Logics Scope Sync
> From version: 0.6.1
> Understanding: 100%
> Confidence: 99%
> Complexity: Medium
> Theme: Post-implementation Hardening and Scope Alignment for Home Screen Delivery
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Address post-implementation review findings introduced/clarified after the home screen (`req_026`) delivery work started.
- Restore behavioral truthfulness for the Home CTA labeled `Create empty workspace`.
- Re-align shortcut documentation with actual keyboard behavior.
- Update regression tests that still assume the app starts on `Network Scope` instead of `Home`.
- Reconcile Logics docs (`req_026`/`task_025`/backlog) with the current Home MVP scope after removing `Quick shortcuts` and `Quick preferences` panels.

# Context
A global review of the recent Home screen implementation identified several gaps:

1. **Home CTA mismatch**: `Create empty workspace` currently calls `replaceStateWithHistory(createInitialState())`, which recreates the default sample network and resets UI state (theme included), instead of creating a new empty workspace.
2. **Shortcut docs drift**: Settings still advertises `Alt + V/N/G/C/R` interaction-mode shortcuts, but these bindings are not implemented in `useKeyboardShortcuts` anymore.
3. **Startup expectation drift in tests**: some integration/lazy-loading tests still expect `Network Scope` as the initial screen, while the app now opens on `Home` by default.
4. **Logics scope drift**: `req_026` + `task_025` + backlog still describe `Quick shortcuts` / `Quick preferences` as Home MVP modules even though they were removed from the Home screen.

This follow-up request formalizes those corrections so the Home-screen rollout remains coherent and reviewable.

## Objectives
- Make the Home `Create empty workspace` action create a genuinely new empty workspace (no reset-to-default/sample semantics).
- Ensure shortcut documentation in `Settings` reflects only currently implemented shortcuts.
- Stabilize tests around the new startup behavior (`Home` as initial screen).
- Synchronize Logics planning/acceptance docs with the actual Home MVP scope now retained.

## Functional Scope
### A. Home empty-workspace CTA truthfulness (high priority)
- Fix the `Create empty workspace` Home action so it creates a new empty workspace (not a reset-to-default/sample action).
- Treat this action as a workspace-creation flow (new empty workspace), not a reset flow, and preserve existing UI preferences unless explicitly changed elsewhere.
- Preserve undo/redo history integration and expected confirmation behavior when replacing an existing workspace.
- Avoid unintended resets of unrelated UI preferences unless explicitly intended and documented.
- Keep the CTA semantics explicitly creation-oriented (new empty workspace), not “reset” semantics.

### B. Shortcut documentation alignment (medium priority)
- Remove or correct obsolete shortcut hints from `Settings` (e.g. `Alt + V/N/G/C/R`) when no longer implemented.
- Keep the listed shortcuts synchronized with actual `useKeyboardShortcuts` behavior (including `Alt + 1..6` top-level navigation).

### C. Startup-screen regression test alignment (high priority)
- Update integration/lazy-loading tests that assume initial `Network Scope` to match the new initial `Home` screen behavior.
- Preserve the original regression intent (shell visible during lazy load, no blanking, fallback behavior) while adapting expectations.
- Ensure touched test helpers and e2e assumptions remain stable.

### D. Logics scope/AC synchronization for req_026 (medium priority)
- Update `req_026`, `task_025`, and relevant backlog items to reflect the current Home MVP scope after removing `Quick shortcuts` and `Quick preferences`.
- Adjust acceptance criteria wording and implementation plan references accordingly.
- Preserve post-MVP intent where relevant (e.g. future extensibility remains valid).

### E. Documentation and closure traceability (closure target)
- Document the corrections and final scope decisions in Logics artifacts.
- Record validation snapshots and AC traceability for this follow-up request.

## Non-functional requirements
- Preserve current Home-screen navigation integration and shell behavior.
- Keep changes localized and reviewable (no broad redesign of Home layout unless necessary for the CTA correction).
- Preserve passing `lint`, `typecheck`, `test:ci`, `test:e2e`, `build`, and `quality:pwa`.
- Keep test updates focused on expectation alignment, not broad weakening of regression coverage.

## Validation and regression safety
- Targeted tests (minimum):
  - `src/tests/app.ui.home.spec.tsx`
  - `src/tests/app.ui.lazy-loading-regression.spec.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx` (if keyboard shortcut expectations touched)
  - `src/tests/app.ui.settings.spec.tsx` (if shortcut list assertions exist/are added)
- Closure validation (recommended):
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ci`
  - `npm run test:e2e`
  - `npm run build`
  - `npm run quality:pwa`
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

## Acceptance criteria
- AC1: The Home `Create empty workspace` CTA creates a new empty workspace (not a reset/sample reload), preserves unrelated UI preferences, and no misleading reset semantics remain.
- AC2: `Settings` shortcut documentation is aligned with actual implemented keyboard shortcuts.
- AC3: Integration/lazy-loading regression tests are updated to the Home-first startup behavior and preserve their original regression signal.
- AC4: `req_026`/`task_025`/relevant backlog docs are synchronized with the current Home MVP scope (without stale `Quick shortcuts` / `Quick preferences` requirements unless reinstated).
- AC5: Validation suites and Logics lint pass.

## Out of scope
- Reintroducing removed Home panels (`Quick shortcuts`, `Quick preferences`) as part of this follow-up unless explicitly requested.
- Broad redesign of the Home information architecture.
- Keyboard shortcut feature expansion beyond documentation alignment.

# Backlog
- To be created from this request (proposed):
  - Home CTA new-empty-workspace behavior correction (no reset semantics)
  - Settings shortcut documentation cleanup and keyboard-map sync
  - Home-first startup regression-test expectation alignment
  - Logics scope/AC synchronization for `req_026` artifacts
  - Closure validation + AC traceability

# References
- `src/app/AppController.tsx`
- `src/store/types.ts`
- `src/app/components/workspace/HomeWorkspaceContent.tsx`
- `src/app/hooks/useKeyboardShortcuts.ts`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/tests/app.ui.home.spec.tsx`
- `src/tests/app.ui.lazy-loading-regression.spec.tsx`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `logics/request/req_026_home_workspace_landing_screen_start_resume_quick_preferences_and_post_mvp_hub.md`
- `logics/tasks/task_025_home_workspace_landing_screen_start_resume_quick_preferences_and_post_mvp_hub_orchestration_and_delivery_control.md`
- `logics/backlog/item_150_home_workspace_screen_shell_navigation_integration_and_menu_return_entry.md`
- `logics/backlog/item_151_home_workspace_mvp_start_and_resume_action_modules.md`
- `logics/backlog/item_152_home_workspace_quick_shortcuts_and_quick_preferences_modules.md`
- `logics/backlog/item_153_home_workspace_responsive_layout_theme_coverage_and_navigation_regression_tests.md`
- `logics/backlog/item_154_home_workspace_post_mvp_extension_hooks_and_data_contracts.md`
- `logics/backlog/item_155_req_026_home_screen_closure_ci_e2e_build_pwa_and_ac_traceability.md`
