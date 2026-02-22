## req_020_app_shell_desktop_overlay_hardening_alignment_and_workspace_suspense_scoping - App Shell Desktop Overlay Hardening Alignment and Workspace Suspense Scoping
> From version: 0.5.5
> Understanding: 100%
> Confidence: 98%
> Complexity: Medium
> Theme: Follow-up hardening for shell accessibility consistency and lazy-loading scoping
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Address follow-up review findings after `req_019` / `task_018` closure, focusing on desktop shell accessibility consistency and lazy-loading scoping.
- Align drawer accessibility hardening behavior with actual CSS/visibility behavior across desktop and mobile breakpoints.
- Prevent inactive lazy screen modules from suspending the active workspace area under the current workspace-level `Suspense` boundary.
- Expand regression coverage for desktop breakpoint behavior and strengthen test robustness for viewport mutation in shell tests.

# Context
`task_018` improved shell accessibility and moved `Suspense` from the root app shell to the workspace area, but a follow-up review found remaining gaps:

1. The drawer overlay hardening (`aria-hidden` / `inert`) is currently gated by `viewportWidth < 960`, while CSS still keeps the drawer visually off-canvas by default at larger widths unless explicitly opened. This can leave the desktop drawer focusable/AT-visible while hidden.
2. The workspace-level `Suspense` boundary still wraps all screen containers, and inactive screens are still mounted as components. With lazy screen modules, an inactive screen can suspend and blank the active workspace area.
3. The new shell regression coverage validates hidden-overlay behavior only in a narrow viewport scenario and does not protect the desktop case where the hardening mismatch currently exists.
4. The new viewport mutation test restores `window.innerWidth` only at the end of the test, not under guaranteed cleanup (`try/finally` / `afterEach`), which can leak state if assertions fail.

These issues are smaller than the original wave-5 and `req_019` risks, but they directly affect shell accessibility correctness and lazy-loading UX robustness.

Related delivered context:
- `logics/request/req_019_app_controller_post_wave_5_hardening_accessibility_loading_and_contract_clarity.md`
- `logics/tasks/task_018_app_controller_post_wave_5_hardening_accessibility_loading_and_contract_clarity_orchestration_and_delivery_control.md`

## Objectives
- Ensure hidden navigation drawer behavior is accessibility-safe and keyboard-safe on desktop and mobile, with a clear breakpoint/visibility contract.
- Scope workspace `Suspense` behavior so inactive lazy screens do not block the active workspace area.
- Add regression coverage for desktop shell hidden-overlay behavior and breakpoint alignment.
- Improve test robustness for viewport mutation helpers in shell regression tests.

## Functional Scope
### A. Drawer hardening / breakpoint contract alignment (high priority)
- Align `AppShellLayout` drawer accessibility hardening (`aria-hidden`, `inert`, disabled backdrop semantics) with real drawer visibility behavior across breakpoints.
- Prefer a single explicit source of truth for overlay vs non-overlay drawer mode (JS + CSS contract alignment) or equivalent behavior-safe approach.
- Ensure hidden drawer content is not keyboard-focusable/AT-visible when visually hidden at any breakpoint.
- Preserve existing drawer open/close behavior, Escape handling, focus restoration, and desktop interaction semantics.

### B. Workspace `Suspense` scoping for active screen only (high priority)
- Prevent inactive lazy screen modules from suspending the active workspace area.
- Narrow `Suspense` boundaries and/or conditional mounting so only the active screen/content can trigger the workspace fallback.
- Preserve shell visibility improvements from `req_019` (no return to root-level full-shell blanking).
- Preserve lazy chunking and test-safe eager behavior via `appUiModules`.

### C. Desktop + breakpoint regression coverage for shell a11y hardening (medium priority)
- Extend shell regression tests to cover desktop viewport behavior and breakpoint transitions relevant to drawer hardening.
- Validate hidden drawer accessibility semantics in desktop mode if visually hidden there, or validate explicit alternative semantics if drawer is intentionally always interactive on desktop.
- Keep tests behavior-oriented and resistant to incidental markup changes.

### D. Test robustness for viewport mutation cleanup (medium priority)
- Harden shell test utilities/patterns that mutate `window.innerWidth` so viewport state is always restored on failure.
- Prefer local helper cleanup patterns (`try/finally` or shared helper) over ad hoc end-of-test restoration.

### E. Documentation and closure traceability (closure target)
- Document fixes and rationale in Logics artifacts.
- Record validation snapshots for shell regressions, full test suite, build/PWA checks, and `req_020` AC traceability.

## Non-functional requirements
- Preserve current functional behavior and prior hardening gains from `req_019`.
- Avoid broad shell redesign or new features.
- Maintain passing `build`, `quality:pwa`, `test:e2e`, and `test:ci`.
- Keep changes reviewable and localized to shell/layout/tests unless a dependency contract change is strictly required.

## Validation and regression safety
- Targeted tests (minimum):
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
  - `src/tests/app.ui.inspector-shell.spec.tsx` (if overlay/focus interactions are touched)
- Closure validation (recommended):
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ci`
  - `npm run test:e2e`
  - `npm run build`
  - `npm run quality:pwa`
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

## Acceptance criteria
- AC1: Hidden navigation drawer semantics are accessibility-safe and keyboard-safe on all breakpoints where the drawer is visually hidden.
- AC2: Drawer hardening behavior is aligned with an explicit breakpoint/visibility contract (no JS/CSS mismatch causing hidden-but-focusable desktop UI).
- AC3: Inactive lazy screen modules do not suspend and blank the active workspace area under workspace-level loading boundaries.
- AC4: Shell visibility resilience introduced in `req_019` is preserved (no root-level full-shell blanking regression).
- AC5: Desktop/breakpoint shell regression coverage exists for drawer hardening behavior and passes.
- AC6: Viewport mutation in shell tests is restored reliably even on test failures (robust cleanup pattern).
- AC7: Full closure validation pipeline passes.

## Out of scope
- New user-facing shell features.
- Large AppController decomposition work unrelated to these follow-up findings.
- Store/reducer architecture changes.
- Replacing the lazy/eager registry approach introduced in wave-5.

# Backlog
- Created and delivered from this request:
  - `item_119_app_shell_drawer_hardening_breakpoint_visibility_contract_alignment.md`
  - `item_120_workspace_suspense_active_screen_scoping_and_inactive_lazy_isolation.md`
  - `item_121_workspace_shell_regression_desktop_breakpoint_overlay_accessibility_coverage.md`
  - `item_122_shell_test_viewport_mutation_cleanup_guardrails.md`
  - `item_123_req_020_followup_hardening_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# Delivery summary
- Drawer hardening / breakpoint contract alignment delivered:
  - Removed viewport-gated drawer hardening and aligned hidden drawer semantics (`aria-hidden` / `inert`) with actual hidden state across breakpoints.
  - Hidden drawer is no longer left focusable/AT-visible on desktop due to JS/CSS mismatch.
  - File: `src/app/components/layout/AppShellLayout.tsx`
- Workspace `Suspense` scoping delivered:
  - Active workspace content is selected before rendering under `Suspense`, so inactive lazy screens no longer suspend the active workspace area.
  - Shell-level resilience from `req_019` is preserved (no root-level full-shell blanking).
  - Files: `src/app/components/layout/AppShellLayout.tsx`, `src/app/AppController.tsx`
- Desktop/breakpoint shell regression coverage delivered:
  - Added explicit desktop viewport drawer accessibility semantics coverage.
  - Updated hidden-nav assertions to reflect the now-intentionally hidden/inert drawer state while preserving behavior checks.
  - Files: `src/tests/app.ui.workspace-shell-regression.spec.tsx`, `src/tests/app.ui.navigation-canvas.spec.tsx`, `src/tests/app.ui.validation.spec.tsx`, `src/tests/app.ui.settings.spec.tsx`
- Viewport mutation cleanup guardrails delivered:
  - Introduced `withViewportWidth(...)` helper with `try/finally` restoration to prevent leaking `window.innerWidth` on test failures.
  - File: `src/tests/app.ui.workspace-shell-regression.spec.tsx`
- Test helper adaptation delivered:
  - `switchScreen` / `switchSubScreen` now open the navigation menu when nav buttons are inaccessible and close it afterward to preserve test ergonomics under hidden drawer semantics.
  - File: `src/tests/helpers/app-ui-test-utils.tsx`
- Validation closure delivered:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ci`
  - `npm run test:e2e`
  - `npm run build`
  - `npm run quality:pwa`
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

# AC traceability
- AC1: Satisfied by hidden drawer accessibility semantics applied whenever the drawer is visually hidden, across desktop and mobile breakpoints.
- AC2: Satisfied by removing the JS viewport gating mismatch that previously left the hidden desktop drawer focusable/AT-visible.
- AC3: Satisfied by active-screen-only workspace rendering before `Suspense`, preventing inactive lazy screens from suspending the active workspace area.
- AC4: Satisfied by retaining workspace-scoped (not root-scoped) `Suspense`, preserving visible shell chrome during lazy loading.
- AC5: Satisfied by desktop/breakpoint shell regression coverage and passing tests validating drawer hidden-state semantics.
- AC6: Satisfied by robust viewport mutation cleanup (`withViewportWidth(...)` with guaranteed restoration) in shell regression tests.
- AC7: Satisfied by full closure validation pipeline passing and documented in `task_019`.

# References
- `src/app/components/layout/AppShellLayout.tsx`
- `src/app/AppController.tsx`
- `src/app/components/appUiModules.tsx`
- `src/app/components/containers/NetworkScopeWorkspaceContainer.tsx`
- `src/app/components/containers/ModelingWorkspaceContainer.tsx`
- `src/app/components/containers/AnalysisWorkspaceContainer.tsx`
- `src/app/components/containers/ValidationWorkspaceContainer.tsx`
- `src/app/components/containers/SettingsWorkspaceContainer.tsx`
- `src/app/styles/workspace/workspace-shell-and-nav.css`
- `src/app/styles/workspace/workspace-panels-and-responsive.css`
- `src/tests/app.ui.workspace-shell-regression.spec.tsx`
- `src/tests/app.ui.inspector-shell.spec.tsx`
- `src/tests/helpers/app-ui-test-utils.tsx`
- `tests/e2e/smoke.spec.ts`
- `logics/request/req_019_app_controller_post_wave_5_hardening_accessibility_loading_and_contract_clarity.md`
- `logics/tasks/task_018_app_controller_post_wave_5_hardening_accessibility_loading_and_contract_clarity_orchestration_and_delivery_control.md`
- `logics/tasks/task_019_app_shell_desktop_overlay_hardening_alignment_and_workspace_suspense_scoping_orchestration_and_delivery_control.md`
