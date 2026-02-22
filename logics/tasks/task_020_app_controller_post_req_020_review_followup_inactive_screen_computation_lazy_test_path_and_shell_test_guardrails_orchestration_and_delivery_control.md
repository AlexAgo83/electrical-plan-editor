## task_020_app_controller_post_req_020_review_followup_inactive_screen_computation_lazy_test_path_and_shell_test_guardrails_orchestration_and_delivery_control - AppController Post-req_020 Review Follow-up Orchestration and Delivery Control (Inactive Screen Computation, Lazy Test Path, Shell Test Guardrails)
> From version: 0.5.6
> Understanding: 100%
> Confidence: 97%
> Progress: 0%
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
- [ ] 1. Deliver Wave 0 active-screen domain content assembly scoping / inactive compute reduction in `AppController` (`item_124`)
- [ ] 2. Deliver Wave 1 lazy-path regression coverage for `appUiModules` + `Suspense` behavior (`item_125`)
- [ ] 3. Deliver Wave 2 explicit drawer-aware vs strict navigation test helper semantics (`item_126`)
- [ ] 4. Deliver Wave 3 viewport cleanup guardrails generalization across shell tests (`item_127`)
- [ ] 5. Deliver Wave 4 closure: validation/build/PWA pass and `req_021` AC traceability (`item_128`)
- [ ] FINAL: Update related Logics docs

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
  - Wave 0 pending: scope `AppController` domain content assembly to reduce inactive-screen computation.
  - Wave 1 pending: add lazy-path regression coverage for `appUiModules`/`Suspense`.
  - Wave 2 pending: clarify screen-switch helper semantics to avoid masking drawer regressions.
  - Wave 3 pending: generalize viewport mutation cleanup guardrails across shell tests.
  - Wave 4 pending: full closure validation and `req_021` AC1..AC7 traceability.
- Current blockers:
  - None at kickoff.
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
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` pending for this new task/doc set
  - `req_020` closure pipeline was green before this follow-up planning task
