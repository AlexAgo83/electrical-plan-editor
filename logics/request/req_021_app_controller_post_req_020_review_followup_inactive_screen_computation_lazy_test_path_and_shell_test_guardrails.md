## req_021_app_controller_post_req_020_review_followup_inactive_screen_computation_lazy_test_path_and_shell_test_guardrails - AppController Post-req_020 Review Follow-up for Inactive Screen Computation, Lazy Test Path Coverage, and Shell Test Guardrails
> From version: 0.5.6
> Understanding: 100%
> Confidence: 97%
> Complexity: Medium
> Theme: Follow-up hardening after req_020 review (compute scope, lazy coverage, test guardrails)
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Address follow-up review findings after `req_020` / `task_019`, focused on residual `AppController` screen-domain computation cost and test coverage/guardrail gaps.
- Reduce unnecessary inactive-screen content assembly work that still happens before active workspace rendering.
- Add regression coverage for the real lazy-loading path (`lazy()` + `Suspense`) that is currently bypassed in `Vitest`.
- Tighten test helper semantics and viewport cleanup consistency to avoid masking shell regressions or leaking global viewport state.

# Context
`req_020` successfully fixed shell overlay breakpoint hardening and active-screen `Suspense` scoping in `AppShellLayout`, but the follow-up review identified remaining issues:

1. `AppController` still builds domain screen content for multiple inactive screens on every render through `useAppControllerModelingAnalysisScreenDomains(...)` and `useAppControllerAuxScreenContentDomains(...)`, even though only one workspace branch is rendered under `Suspense`.
2. The `appUiModules` registry forces eager modules during `Vitest` (`!import.meta.env.VITEST`), so CI tests do not exercise the production lazy path that recently caused loading/suspense regressions.
3. UI test helpers `switchScreen(...)` / `switchSubScreen(...)` now auto-open and auto-close the navigation drawer, improving ergonomics but potentially masking drawer visibility/accessibility regressions in tests that depend on them.
4. Viewport mutation cleanup was hardened in workspace-shell regression tests, but other shell tests (notably inspector-shell) still use direct `window.innerWidth` mutation without guaranteed restoration.

These are not blockers for current functionality, but they affect performance discipline, regression confidence on the lazy path, and test reliability/readability.

Related delivered context:
- `logics/request/req_020_app_shell_desktop_overlay_hardening_alignment_and_workspace_suspense_scoping.md`
- `logics/tasks/task_019_app_shell_desktop_overlay_hardening_alignment_and_workspace_suspense_scoping_orchestration_and_delivery_control.md`

## Objectives
- Reduce or defer inactive-screen domain content assembly in `AppController` so active-screen rendering gains are not offset by upstream computation.
- Introduce explicit regression coverage for the lazy UI module path and workspace loading boundaries.
- Make navigation screen-switch test helpers more explicit so shell regressions are easier to detect.
- Generalize reliable viewport mutation cleanup patterns across shell-related tests.

## Functional Scope
### A. Active-screen-only domain content assembly / compute scoping (high priority)
- Refactor `AppController` screen-domain composition so only active screen content (or a minimal necessary subset) is assembled per render.
- Preserve current screen behavior and existing screen-content slice/component contracts unless a targeted API adjustment is required.
- Keep changes readable and traceable; avoid replacing explicit wiring with opaque mega-hooks.

### B. Lazy-path regression coverage for `appUiModules` / `Suspense` behavior (high priority)
- Add test coverage that exercises the real lazy module path (`lazy()` + `Suspense`) under a controlled test scenario.
- Ensure the coverage protects against regressions where inactive modules or workspace content loading cause blanking/incorrect fallback behavior.
- Preserve existing `Vitest` ergonomics unless a narrow opt-in lazy mode is introduced.

### C. Test helper explicitness for drawer-aware navigation switching (medium priority)
- Revisit `switchScreen(...)` / `switchSubScreen(...)` test helper behavior so automatic drawer opening/closing does not silently hide navigation regressions.
- Prefer explicit helper modes or separate helper functions (`strict` vs `drawer-aware`) with clear test intent.
- Update affected tests only as needed to preserve readability and behavior focus.

### D. Viewport cleanup guardrails generalization across shell tests (medium priority)
- Apply robust viewport mutation cleanup helper patterns consistently across shell-related tests (including inspector-shell).
- Ensure viewport state restoration is guaranteed on assertion failure.

### E. Documentation and closure traceability (closure target)
- Document implementation and rationale in Logics docs.
- Record targeted and full validation snapshots and AC traceability for `req_021`.

## Non-functional requirements
- Preserve current shell accessibility behavior and `req_020` gains.
- Avoid broad architecture rewrites unrelated to the four findings.
- Maintain passing `lint`, `typecheck`, `test:ci`, `test:e2e`, `build`, and `quality:pwa`.
- Keep the solution incremental and reviewable.

## Validation and regression safety
- Targeted tests (minimum):
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
  - `src/tests/app.ui.inspector-shell.spec.tsx`
  - A lazy-path-focused regression test/harness covering `appUiModules` + `Suspense`
- Closure validation (recommended):
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ci`
  - `npm run test:e2e`
  - `npm run build`
  - `npm run quality:pwa`
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

## Acceptance criteria
- AC1: `AppController` no longer assembles inactive screen domain content broadly on every render when only one workspace screen is active (or equivalent measurable reduction is documented and justified).
- AC2: Active-screen rendering behavior and screen content correctness are preserved after compute scoping changes.
- AC3: Automated regression coverage exists for the real lazy UI module path (`lazy()` + `Suspense`) and passes.
- AC4: Lazy-path coverage protects against workspace blanking/fallback regressions relevant to recent shell hardening work.
- AC5: Drawer-aware screen-switching test helper behavior is explicit and does not silently hide navigation/drawer regressions.
- AC6: Viewport mutation cleanup is consistently reliable across touched shell tests (guaranteed restore on failure).
- AC7: Full closure validation pipeline passes and `req_021` AC traceability is documented.

## Out of scope
- New shell features or navigation UX redesign.
- Large AppController decomposition waves unrelated to the identified findings.
- Replacing the lazy/eager registry architecture wholesale.
- Broad test framework migration.

# Backlog
- Created from this request:
  - `item_124_app_controller_active_screen_domain_content_assembly_scoping_and_inactive_compute_reduction.md`
  - `item_125_app_ui_modules_lazy_path_regression_coverage_and_suspense_harness.md`
  - `item_126_test_navigation_switch_helpers_explicit_drawer_aware_and_strict_modes.md`
  - `item_127_shell_tests_viewport_mutation_cleanup_pattern_generalization.md`
  - `item_128_req_021_followup_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# References
- `src/app/AppController.tsx`
- `src/app/components/layout/AppShellLayout.tsx`
- `src/app/components/appUiModules.tsx`
- `src/app/hooks/controller/useAppControllerModelingAnalysisScreenDomains.tsx`
- `src/app/hooks/controller/useAppControllerAuxScreenContentDomains.tsx`
- `src/tests/helpers/app-ui-test-utils.tsx`
- `src/tests/app.ui.workspace-shell-regression.spec.tsx`
- `src/tests/app.ui.inspector-shell.spec.tsx`
- `logics/request/req_020_app_shell_desktop_overlay_hardening_alignment_and_workspace_suspense_scoping.md`
- `logics/tasks/task_019_app_shell_desktop_overlay_hardening_alignment_and_workspace_suspense_scoping_orchestration_and_delivery_control.md`
