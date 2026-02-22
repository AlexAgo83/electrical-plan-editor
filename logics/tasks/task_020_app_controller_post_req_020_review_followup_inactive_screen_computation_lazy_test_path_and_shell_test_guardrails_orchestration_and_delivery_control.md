## task_020_app_controller_post_req_020_review_followup_inactive_screen_computation_lazy_test_path_and_shell_test_guardrails_orchestration_and_delivery_control - AppController Post-req_020 Review Follow-up Orchestration and Delivery Control (Inactive Screen Computation, Lazy Test Path, Shell Test Guardrails)
> From version: 0.5.6
> Understanding: 100%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Post-req_020 Follow-up Delivery for Compute Scoping and Regression Confidence
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_021`. This task coordinates follow-up work on inactive-screen domain content assembly reduction in `AppController`, lazy-path regression coverage for `appUiModules`/`Suspense`, navigation test helper explicitness, viewport cleanup guardrails across shell tests, and final closure/AC traceability.

Backlog scope covered:
- `item_124_app_controller_active_screen_domain_content_assembly_scoping_and_inactive_compute_reduction.md`
- `item_125_app_ui_modules_lazy_path_regression_coverage_and_suspense_harness.md`
- `item_126_test_navigation_switch_helpers_explicit_drawer_aware_and_strict_modes.md`
- `item_127_shell_tests_viewport_mutation_cleanup_pattern_generalization.md`
- `item_128_req_021_followup_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# Plan
- [x] 1. Deliver Wave 0 active-screen domain content assembly scoping / inactive compute reduction in `AppController` (`item_124`)
- [x] 2. Deliver Wave 1 lazy-path regression coverage for `appUiModules` + `Suspense` behavior (`item_125`)
- [x] 3. Deliver Wave 2 explicit drawer-aware vs strict navigation test helper semantics (`item_126`)
- [x] 4. Deliver Wave 3 viewport cleanup guardrails generalization across shell tests (`item_127`)
- [x] 5. Deliver Wave 4 closure: validation/build/PWA pass and `req_021` AC traceability (`item_128`)
- [x] FINAL: Update related Logics docs

# Validation
- Documentation / Logics:
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- Static analysis / compile safety:
  - `npm run lint`
  - `npm run typecheck`
- Automated tests (unit + integration):
  - `npm run test:ci`
  - Targeted runs during implementation (recommended):
    - `npx vitest run src/tests/app.ui.workspace-shell-regression.spec.tsx src/tests/app.ui.inspector-shell.spec.tsx`
    - Lazy-path-specific test target(s) added in `item_125`
- End-to-end tests:
  - `npm run test:e2e`
- Build / delivery checks:
  - `npm run build`
  - `npm run quality:pwa`

# Report
- Wave status:
  - Wave 0 completed: `AppController` now passes active-screen include flags into domain screen-content assembly hooks so inactive screen builders are not invoked in the common path.
  - Wave 1 completed: added opt-in lazy/eager test loading mode and import delay controls in `appUiModules` plus lazy-path regression coverage validating workspace fallback behavior and visible shell chrome.
  - Wave 2 completed: test helpers now expose explicit `strict` and `drawerAware` screen/sub-screen switching variants; shell tests use explicit drawer-aware helper where intended.
  - Wave 3 completed: shared `withViewportWidth(...)` helper introduced and inspector-shell viewport mutations are now restored via guaranteed cleanup (`afterEach` + helper for temporary viewport changes).
  - Wave 4 completed: full closure validation/build/PWA pass executed and `req_021` AC1..AC7 traceability documented.
- Current blockers:
  - None.
- Main risks to track:
  - Compute scoping changes accidentally alter screen content mounting or state behavior.
  - Lazy-path tests become brittle or too tied to implementation details.
  - Helper API changes cause noisy test churn with low signal.
  - Viewport cleanup refactors spread inconsistently across shell tests.
- Mitigation strategy:
  - Preserve behavior contracts first; refactor assembly incrementally and validate targeted screens.
  - Prefer narrow, explicit lazy-path harnesses over broad environment toggles.
  - Provide explicit helper variants (`strict` and drawer-aware) with small migration surface.
  - Reuse one viewport helper pattern across touched tests.
- Validation snapshot (kickoff):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` OK (planning docs)
  - `req_020` closure pipeline was green before this follow-up planning task
- Validation snapshot (targeted implementation verification):
  - `npm run typecheck` OK
  - `npm run lint` OK
  - `npx vitest run src/tests/app.ui.workspace-shell-regression.spec.tsx src/tests/app.ui.inspector-shell.spec.tsx src/tests/app.ui.lazy-loading-regression.spec.tsx` OK (15 tests)
- Validation snapshot (final closure):
  - `npm run typecheck` OK
  - `npm run lint` OK
  - `npm run quality:ui-modularization` OK
  - `npm run quality:store-modularization` OK
  - `npm run test:ci` OK (27 files / 138 tests)
  - `npm run test:e2e` OK (2/2)
  - `npm run build` OK
  - `npm run quality:pwa` OK
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` OK
- Delivery snapshot:
  - Active-screen domain content assembly scoping:
    - `src/app/AppController.tsx`
    - `src/app/hooks/controller/useAppControllerModelingAnalysisScreenDomains.tsx`
    - `src/app/hooks/controller/useAppControllerAuxScreenContentDomains.tsx`
    - `src/app/hooks/controller/useAppControllerScreenContentSlices.tsx`
  - Lazy-path regression coverage harness + test hooks:
    - `src/app/components/appUiModules.tsx`
    - `src/tests/app.ui.lazy-loading-regression.spec.tsx`
  - Explicit navigation test helper semantics + viewport cleanup guardrails:
    - `src/tests/helpers/app-ui-test-utils.tsx`
    - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
    - `src/tests/app.ui.inspector-shell.spec.tsx`
- AC traceability (`req_021`):
  - AC1: Satisfied by active-screen include flags that skip inactive domain content builder invocation in `useAppControllerModelingAnalysisScreenDomains` and `useAppControllerAuxScreenContentDomains`.
  - AC2: Satisfied by passing targeted shell/lazy regressions and full `test:ci` / `test:e2e` / build pipeline after compute-scoping changes.
  - AC3: Satisfied by opt-in lazy mode controls in `appUiModules` and new automated lazy-loading regression tests exercising real `lazy()` + `Suspense`.
  - AC4: Satisfied by new regression assertions that verify shell chrome remains visible while workspace fallback is shown during lazy loading.
  - AC5: Satisfied by explicit `switchScreenStrict` / `switchScreenDrawerAware` and `switchSubScreenStrict` / `switchSubScreenDrawerAware` helper variants, with shell tests updated to explicit drawer-aware usage.
  - AC6: Satisfied by shared `withViewportWidth(...)` helper and guaranteed viewport restoration in touched shell tests (`workspace-shell` and `inspector-shell`).
  - AC7: Satisfied by full closure pipeline and Logics lint passing.
