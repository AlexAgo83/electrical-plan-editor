## req_022_post_req_021_review_followup_real_lazy_chunking_no_active_network_compute_scoping_and_test_helper_contract_hardening - Post-req_021 Review Follow-up for Real Lazy Chunking, No-Active-Network Compute Scoping, and Test Helper Contract Hardening
> From version: 0.5.7
> Understanding: 99%
> Confidence: 99%
> Complexity: Medium
> Theme: Follow-up hardening for production lazy-loading realism, compute scoping completeness, and test helper contract clarity
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Address follow-up review findings after `req_021` / `task_020`, focusing on residual gaps in lazy-loading production behavior, compute scoping completeness, and test helper contract safety.
- Restore/confirm real production code-splitting behavior for UI modules while preserving the new lazy-path test harness.
- Complete inactive-screen compute scoping for the `no active network` path.
- Harden test utility contracts (`withViewportWidth`, strict navigation helpers) to avoid subtle flakiness or masked regressions.

# Context
`req_021` improved `AppController` domain content assembly scoping and added explicit lazy-path regression coverage, but a follow-up review identified four remaining issues:

1. `appUiModules` now statically imports the same modules it also dynamically imports via `lazy()`, which can prevent actual chunk splitting in production builds (Vite warning: “dynamic import will not move module into another chunk”).
2. `AppController` compute scoping uses screen-activity flags, but still assembles some screen content when `AppShellLayout` later short-circuits to the “No active network” empty state (`!hasActiveNetwork`).
3. `withViewportWidth(...)` in test helpers is synchronous (`run: () => void`) and restores viewport immediately, so future async callbacks could restore too early and introduce hidden test bugs.
4. `switchSubScreen(..., "strict")` still auto-switches to the modeling screen when the secondary navigation row is absent, partially undermining the strict-mode contract intended to reveal regressions.

These are follow-up correctness/robustness issues rather than immediate functional breakages, but they affect production loading behavior, performance discipline, and long-term test signal quality.

Related delivered context:
- `logics/request/req_021_app_controller_post_req_020_review_followup_inactive_screen_computation_lazy_test_path_and_shell_test_guardrails.md`
- `logics/tasks/task_020_app_controller_post_req_020_review_followup_inactive_screen_computation_lazy_test_path_and_shell_test_guardrails_orchestration_and_delivery_control.md`

## Objectives
- Re-establish real lazy chunking behavior in production builds while preserving testability of lazy-path regressions.
- Ensure inactive screen/domain content assembly is skipped on the `no active network` branch as well as inactive-screen branches.
- Make viewport helper cleanup safe for async test callbacks.
- Make strict navigation helpers truly strict (no hidden auto-repair behavior) while preserving explicit drawer-aware alternatives.

## Functional Scope
### A. Real lazy chunking contract restoration for `appUiModules` (high priority)
- Eliminate the production build pattern where statically imported UI modules prevent dynamic imports from creating separate chunks.
- Preserve opt-in test control for eager/lazy behavior introduced in `req_021`.
- Keep lazy-path regression tests meaningful and maintainable.

### B. No-active-network-aware compute scoping completion (high priority)
- Align `AppController` domain content assembly include flags with `AppShellLayout` short-circuit behavior for `!hasActiveNetwork`.
- Avoid building modeling/analysis/validation/settings content that will not be rendered because the workspace empty state takes precedence.
- Preserve current empty-state and screen behavior.

### C. Async-safe viewport mutation helper contract (medium priority)
- Upgrade `withViewportWidth(...)` (or equivalent shared helper) to support async callbacks with guaranteed restoration after awaited work.
- Preserve current synchronous usage ergonomics.
- Update touched tests/utilities to the hardened contract.

### D. Strict navigation helper contract hardening (medium priority)
- Ensure strict screen/sub-screen navigation helper variants do not auto-switch context or auto-open drawers.
- Keep drawer-aware variants available for ergonomics.
- Update tests where explicit intent should be reflected.

### E. Documentation and closure traceability (closure target)
- Document fixes and rationale in Logics artifacts.
- Record validation snapshots and `req_022` AC traceability.

## Non-functional requirements
- Preserve current shell accessibility and lazy-path regression coverage gains from `req_020` / `req_021`.
- Avoid broad AppController rewrites or test framework changes.
- Maintain passing `lint`, `typecheck`, `test:ci`, `test:e2e`, `build`, and `quality:pwa`.
- Keep changes reviewable and localized.

## Validation and regression safety
- Targeted tests (minimum):
  - `src/tests/app.ui.lazy-loading-regression.spec.tsx`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
  - `src/tests/app.ui.inspector-shell.spec.tsx`
  - Any tests touched by strict helper contract updates
- Closure validation (recommended):
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ci`
  - `npm run test:e2e`
  - `npm run build`
  - `npm run quality:pwa`
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

## Acceptance criteria
- AC1: Production build no longer reports dynamic-import chunking warnings caused by static+dynamic imports of the same `appUiModules` targets (or an equivalent documented solution preserves real lazy chunking).
- AC2: Lazy-path regression coverage remains present and passes after lazy chunking contract changes.
- AC3: `AppController` no longer assembles screen/domain content on the `no active network` path when the empty-state branch is rendered.
- AC4: `withViewportWidth(...)` (or replacement) safely supports async callbacks with guaranteed restoration after awaited work, without regressing synchronous callers.
- AC5: Strict navigation helper variants no longer silently auto-repair context/drawer state; drawer-aware behavior remains explicit and available.
- AC6: Touched UI/shell tests remain readable and pass.
- AC7: Full closure validation pipeline passes and `req_022` AC traceability is documented.

## Out of scope
- New shell features.
- Large-scale AppController decomposition beyond these follow-up findings.
- Replacing the lazy/eager registry architecture entirely.
- Broad test framework migration.

# Backlog
- Created from this request:
  - `item_129_app_ui_modules_real_lazy_chunking_contract_restoration_with_testable_modes.md`
  - `item_130_app_controller_no_active_network_compute_scoping_alignment.md`
  - `item_131_async_safe_viewport_mutation_test_helper_contract_hardening.md`
  - `item_132_strict_navigation_test_helper_contract_hardening_without_auto_repair.md`
  - `item_133_req_022_followup_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# Delivery summary
- Real lazy chunking contract restored in production:
  - Split eager UI module registry into a dedicated test-only module (`appUiModules.eager.ts`) and loaded it only in Vitest via top-level await.
  - Production `appUiModules` no longer statically imports the same modules it lazily imports, restoring actual chunk splitting.
  - Files: `src/app/components/appUiModules.tsx`, `src/app/components/appUiModules.eager.ts`
- Lazy-path regression coverage preserved:
  - Existing lazy-path integration regression tests continue to run against the opt-in lazy mode controls and pass after the registry refactor.
  - File: `src/tests/app.ui.lazy-loading-regression.spec.tsx`
- No-active-network compute scoping alignment delivered:
  - `AppController` now gates modeling/analysis/validation/settings content assembly includes by `hasActiveNetwork`, aligning with `AppShellLayout` empty-state precedence.
  - File: `src/app/AppController.tsx`
- Async-safe viewport helper contract delivered:
  - `withViewportWidth(...)` now supports sync and async callbacks with guaranteed cleanup on success and synchronous throw paths.
  - Files: `src/tests/helpers/app-ui-test-utils.tsx`, `src/tests/app.ui.workspace-shell-regression.spec.tsx`
- Strict helper contract hardening delivered:
  - `switchSubScreenStrict(...)` no longer auto-switches to modeling when secondary nav is absent; regression coverage added.
  - Files: `src/tests/helpers/app-ui-test-utils.tsx`, `src/tests/app.ui.workspace-shell-regression.spec.tsx`
- Validation closure delivered:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run quality:ui-modularization`
  - `npm run quality:store-modularization`
  - `npx vitest run src/tests/app.ui.lazy-loading-regression.spec.tsx src/tests/app.ui.workspace-shell-regression.spec.tsx src/tests/app.ui.inspector-shell.spec.tsx`
  - `npm run test:ci`
  - `npm run test:e2e`
  - `npm run build`
  - `npm run quality:pwa`
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

# AC traceability
- AC1: Satisfied by the eager-registry split and Vitest-only eager loading path, removing production static imports for lazy targets and restoring real chunking.
- AC2: Satisfied by passing lazy-path regression tests after the `appUiModules` refactor.
- AC3: Satisfied by `hasActiveNetwork` gating on non-network-scope content assembly include flags in `AppController`.
- AC4: Satisfied by overloaded async-safe `withViewportWidth(...)` helper behavior with guaranteed restoration.
- AC5: Satisfied by strict helper contract hardening (no silent auto-repair) while keeping drawer-aware variants explicit.
- AC6: Satisfied by passing touched shell/lazy tests and readable helper/test updates.
- AC7: Satisfied by full closure validation pipeline and Logics lint passing.

# References
- `src/app/components/appUiModules.tsx`
- `src/app/components/appUiModules.eager.ts`
- `src/app/AppController.tsx`
- `src/app/components/layout/AppShellLayout.tsx`
- `src/app/hooks/controller/useAppControllerModelingAnalysisScreenDomains.tsx`
- `src/app/hooks/controller/useAppControllerAuxScreenContentDomains.tsx`
- `src/tests/helpers/app-ui-test-utils.tsx`
- `src/tests/app.ui.lazy-loading-regression.spec.tsx`
- `src/tests/app.ui.workspace-shell-regression.spec.tsx`
- `src/tests/app.ui.inspector-shell.spec.tsx`
- `logics/tasks/task_021_post_req_021_review_followup_real_lazy_chunking_no_active_network_compute_scoping_and_test_helper_contract_hardening_orchestration_and_delivery_control.md`
- `logics/request/req_021_app_controller_post_req_020_review_followup_inactive_screen_computation_lazy_test_path_and_shell_test_guardrails.md`
- `logics/tasks/task_020_app_controller_post_req_020_review_followup_inactive_screen_computation_lazy_test_path_and_shell_test_guardrails_orchestration_and_delivery_control.md`
