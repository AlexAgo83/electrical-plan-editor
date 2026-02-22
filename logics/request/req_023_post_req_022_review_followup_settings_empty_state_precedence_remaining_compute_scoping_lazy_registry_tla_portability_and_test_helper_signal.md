## req_023_post_req_022_review_followup_settings_empty_state_precedence_remaining_compute_scoping_lazy_registry_tla_portability_and_test_helper_signal - Post-req_022 Review Follow-up for Settings Empty-State Precedence, Remaining Compute Scoping, Lazy Registry TLA Portability, and Test Helper Signal
> From version: 0.5.8
> Understanding: 99%
> Confidence: 99%
> Complexity: Medium
> Theme: Follow-up hardening for settings accessibility, residual compute scope, lazy registry portability, and test signal quality
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Address post-`req_022` review findings affecting runtime behavior, performance discipline, portability risk, and test signal quality.
- Restore access to `Settings` when no active network exists (global preferences/import-export should remain reachable).
- Reduce remaining unnecessary composition work (`NetworkSummaryPanel`) outside screens that use it.
- Revisit `appUiModules` top-level-await test-only eager loading strategy to reduce tooling/compatibility risk while preserving real lazy chunking and test controls.
- Improve default test-helper signal quality where legacy aliases still silently use drawer-aware navigation behavior.

# Context
`req_022` successfully restored real lazy chunking and hardened helper contracts, but a follow-up review identified four remaining issues:

1. `AppShellLayout` checks `!hasActiveNetwork` before `isSettingsScreen`, which prevents the Settings screen from rendering without an active network even though `SettingsWorkspaceContent` supports `activeNetworkId: null`.
2. `NetworkSummaryPanel` is still assembled eagerly in `AppController` on every render, even on screens that do not use it (`networkScope`, `settings`, `validation`, empty-state path).
3. `appUiModules.tsx` now uses top-level await (`await import(...)`) in a test-only branch (`import.meta.env.VITEST`), which works today but introduces a portability/tooling risk because the module becomes async at load time.
4. Legacy test helper aliases (`switchScreen`, `switchSubScreen`) still default to drawer-aware behavior, so many tests continue to auto-repair navigation state and hide some regressions.

These are follow-up improvements rather than a broken release, but they affect core UX correctness (Settings access), performance hygiene, and long-term maintainability.

Related delivered context:
- `logics/request/req_022_post_req_021_review_followup_real_lazy_chunking_no_active_network_compute_scoping_and_test_helper_contract_hardening.md`
- `logics/tasks/task_021_post_req_021_review_followup_real_lazy_chunking_no_active_network_compute_scoping_and_test_helper_contract_hardening_orchestration_and_delivery_control.md`

## Objectives
- Ensure `Settings` remains accessible regardless of active-network state.
- Further narrow composition work so heavyweight derived UI (notably `NetworkSummaryPanel`) is only built when needed.
- Preserve real production lazy chunking while removing or mitigating top-level-await portability risk in `appUiModules`.
- Improve test-helper contract signal by making drawer-aware behavior more explicit in more tests / defaults where appropriate.

## Functional Scope
### A. Settings vs empty-state precedence fix (high priority)
- Adjust workspace content branch precedence so `Settings` can render without an active network.
- Preserve empty-state behavior for other screens when no active network exists.
- Keep inspector shell and drawer/ops behavior consistent.

### B. Remaining compute scoping for `NetworkSummaryPanel` (medium-high priority)
- Avoid assembling `NetworkSummaryPanel` outside screens/paths that need it.
- Keep current modeling/analysis behavior intact.
- Prefer explicit include flags or localized scoping rather than opaque memoization layers.

### C. `appUiModules` TLA portability risk reduction (medium priority)
- Reduce or eliminate top-level-await dependency in `appUiModules` while preserving:
  - real lazy chunking in production
  - testable eager/lazy controls
  - current lazy-path regression coverage
- Document the chosen portability/compatibility tradeoff.

### D. Test helper signal hardening follow-up (medium priority)
- Reduce reliance on legacy drawer-aware aliases in critical UI tests, or adjust helper exports/contracts to make drawer-aware usage more explicit.
- Preserve ergonomics where tests intentionally target drawer-aware navigation.

### E. Documentation and closure traceability (closure target)
- Document fixes and rationale in Logics artifacts.
- Record validation snapshots and `req_023` AC traceability.

## Non-functional requirements
- Preserve passing `lint`, `typecheck`, `test:ci`, `test:e2e`, `build`, and `quality:pwa`.
- Avoid broad AppController/shell redesign.
- Keep changes localized and reviewable.
- Preserve gains from `req_020` / `req_021` / `req_022`.

## Validation and regression safety
- Targeted tests (minimum):
  - `src/tests/app.ui.settings.spec.tsx`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
  - `src/tests/app.ui.lazy-loading-regression.spec.tsx`
  - Any tests touched by helper alias/usage changes
- Closure validation (recommended):
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ci`
  - `npm run test:e2e`
  - `npm run build`
  - `npm run quality:pwa`
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

## Acceptance criteria
- AC1: `Settings` screen is reachable and rendered even when there is no active network.
- AC2: Non-settings screens still show the empty-state path when no active network is available.
- AC3: `NetworkSummaryPanel` assembly is scoped away from screens/paths that do not render it (or equivalent measurable reduction is documented).
- AC4: `appUiModules` retains real production lazy chunking and lazy-path testability while reducing/removing top-level-await portability risk.
- AC5: Touched tests/helper contracts make drawer-aware behavior more explicit and improve regression signal quality.
- AC6: Targeted and full validation suites pass.
- AC7: `req_023` AC traceability and closure docs are completed.

## Out of scope
- New shell features or navigation redesign.
- Large AppController decomposition beyond the identified findings.
- Replacing the lazy/eager registry architecture entirely.
- Broad test framework migration.

# Backlog
- Created from this request:
  - `item_134_settings_screen_empty_state_precedence_and_no_active_network_access_fix.md`
  - `item_135_network_summary_panel_remaining_compute_scoping_and_active_screen_assembly_alignment.md`
  - `item_136_app_ui_modules_lazy_registry_test_controls_without_top_level_await_portability_risk.md`
  - `item_137_test_helper_alias_signal_hardening_and_explicit_drawer_aware_usage_followup.md`
  - `item_138_req_023_followup_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# Delivery summary
- Settings/no-active-network correctness restored:
  - `AppShellLayout` now prioritizes the Settings screen branch before the no-active-network empty-state.
  - `AppController` now includes Settings workspace content whenever `isSettingsScreen` is active (no `hasActiveNetwork` gate).
  - Added regression coverage for Settings access with `activeNetworkId = null`.
  - Files: `src/app/components/layout/AppShellLayout.tsx`, `src/app/AppController.tsx`, `src/tests/app.ui.settings.spec.tsx`
- Residual `NetworkSummaryPanel` compute scoping reduced:
  - `NetworkSummaryPanel` assembly is now conditionally performed only for active modeling/analysis paths.
  - Introduced explicit builder usage for the panel controller slice to avoid unconditional assembly on unrelated screens.
  - Files: `src/app/AppController.tsx`, `src/app/hooks/controller/useAppControllerScreenContentSlices.tsx`, `src/app/hooks/controller/useAppControllerModelingAnalysisScreenDomains.tsx`
- `appUiModules` TLA portability risk reduced while preserving lazy chunking/test controls:
  - Removed top-level await from `src/app/components/appUiModules.tsx`.
  - Added explicit eager-registry injection for tests and initialized it in `src/tests/setup.ts`.
  - Preserved `auto` / `eager` / `lazy` test control behavior and lazy-path regression coverage.
  - Files: `src/app/components/appUiModules.tsx`, `src/app/components/appUiModules.eager.ts`, `src/tests/setup.ts`, `src/tests/app.ui.lazy-loading-regression.spec.tsx`
- Test helper signal hardening follow-up delivered:
  - Touched critical suites now use explicit `DrawerAware` helpers instead of legacy aliases.
  - Shared helper comments now steer new/touched tests toward explicit `Strict` / `DrawerAware` variants.
  - Files: `src/tests/helpers/app-ui-test-utils.tsx`, `src/tests/app.ui.settings.spec.tsx`, `src/tests/app.ui.navigation-canvas.spec.tsx`, `src/tests/app.ui.validation.spec.tsx`
- Validation closure delivered:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run quality:ui-modularization`
  - `npm run quality:store-modularization`
  - `npx vitest run src/tests/app.ui.settings.spec.tsx src/tests/app.ui.validation.spec.tsx src/tests/app.ui.navigation-canvas.spec.tsx src/tests/app.ui.workspace-shell-regression.spec.tsx src/tests/app.ui.lazy-loading-regression.spec.tsx`
  - `npm run test:ci`
  - `npm run test:e2e`
  - `npm run build`
  - `npm run quality:pwa`
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

# AC traceability
- AC1: Satisfied by Settings-first branch precedence in `AppShellLayout` plus `AppController` settings-content include-flag alignment; verified by new no-active-network Settings regression coverage.
- AC2: Satisfied by preserving the no-active-network empty-state branch for non-settings screens (integration flows remain green).
- AC3: Satisfied by active-path scoping of `NetworkSummaryPanel` assembly in `AppController`.
- AC4: Satisfied by removing top-level await from `appUiModules` while preserving test controls and confirming real lazy UI chunks in production build output.
- AC5: Satisfied by explicit drawer-aware helper usage in touched critical tests and helper contract guidance updates.
- AC6: Satisfied by passing targeted and full validation suites.
- AC7: Satisfied by closure documentation updates across `req_023`, `task_022`, and backlog items `134`..`138`, with Logics lint passing.

# References
- `src/app/components/layout/AppShellLayout.tsx`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/AppController.tsx`
- `src/app/components/appUiModules.tsx`
- `src/app/components/appUiModules.eager.ts`
- `src/app/hooks/controller/useAppControllerScreenContentSlices.tsx`
- `src/tests/helpers/app-ui-test-utils.tsx`
- `src/tests/app.ui.settings.spec.tsx`
- `src/tests/app.ui.workspace-shell-regression.spec.tsx`
- `src/tests/app.ui.lazy-loading-regression.spec.tsx`
- `logics/request/req_022_post_req_021_review_followup_real_lazy_chunking_no_active_network_compute_scoping_and_test_helper_contract_hardening.md`
- `logics/tasks/task_021_post_req_021_review_followup_real_lazy_chunking_no_active_network_compute_scoping_and_test_helper_contract_hardening_orchestration_and_delivery_control.md`
