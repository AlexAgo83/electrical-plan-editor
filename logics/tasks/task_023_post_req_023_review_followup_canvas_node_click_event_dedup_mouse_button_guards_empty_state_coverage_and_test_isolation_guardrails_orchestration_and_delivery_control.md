## task_023_post_req_023_review_followup_canvas_node_click_event_dedup_mouse_button_guards_empty_state_coverage_and_test_isolation_guardrails_orchestration_and_delivery_control - Post-req_023 Review Follow-up Orchestration and Delivery Control (Canvas Event Dedup, Mouse Button Guards, Empty-State Coverage, Test Isolation Guardrails)
> From version: 0.5.9
> Understanding: 100%
> Confidence: 98%
> Progress: 0%
> Complexity: Medium
> Theme: Follow-up Delivery for Canvas Interaction Correctness and Test Reliability
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_024`. This task coordinates follow-up hardening on 2D canvas node click deduplication, mouse-button guards for drag/pan interactions, explicit non-settings no-active-network empty-state regression coverage, `appUiModules` test-global cleanup isolation, and responsiveness test reliability follow-up.

Backlog scope covered:
- `item_139_canvas_2d_node_click_event_dedup_and_single_dispatch_behavior.md`
- `item_140_canvas_mouse_button_guards_for_node_drag_and_shift_pan.md`
- `item_141_no_active_network_empty_state_non_settings_regression_coverage.md`
- `item_142_app_ui_modules_test_global_control_cleanup_centralization.md`
- `item_143_layout_responsiveness_test_guardrail_reliability_followup.md`
- `item_144_req_024_followup_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# Plan
- [ ] 1. Deliver Wave 0 canvas node click event deduplication and single-side-effect behavior (`item_139`)
- [ ] 2. Deliver Wave 1 mouse-button guards for node drag and shift-pan canvas interactions (`item_140`)
- [ ] 3. Deliver Wave 2 no-active-network empty-state regression coverage for non-settings screens (`item_141`)
- [ ] 4. Deliver Wave 3 `appUiModules` test-global cleanup/isolation centralization (`item_142`)
- [ ] 5. Deliver Wave 4 layout responsiveness test guardrail reliability follow-up (`item_143`)
- [ ] 6. Deliver Wave 5 closure: validation/build/PWA pass and `req_024` AC traceability (`item_144`)
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
    - `npx vitest run src/tests/app.ui.navigation-canvas.spec.tsx src/tests/app.ui.networks.spec.tsx src/tests/app.ui.lazy-loading-regression.spec.tsx src/tests/core.layout.spec.ts`
- End-to-end tests:
  - `npm run test:e2e`
- Build / delivery checks:
  - `npm run build`
  - `npm run quality:pwa`

# Report
- Wave status:
  - Wave 0 pending: remove duplicate side effects from a single 2D node click.
  - Wave 1 pending: add explicit mouse-button guards for node drag and shift-pan starts.
  - Wave 2 pending: add explicit non-settings no-active-network empty-state regression coverage.
  - Wave 3 pending: centralize/strengthen cleanup for `appUiModules` mutable test controls.
  - Wave 4 pending: harden/document layout responsiveness test reliability guardrail.
  - Wave 5 pending: full closure validation and `req_024` AC1..AC7 traceability.
- Current blockers:
  - None at kickoff.
- Main risks to track:
  - Event dedup changes accidentally break drag initiation or selection timing.
  - Mouse-button guardrails break current modifier-based workflows.
  - Additional no-active-network tests overfit DOM structure instead of behavior.
  - Centralized test cleanup alters lazy-loading regression expectations.
  - Perf test hardening removes useful regression signal.
- Mitigation strategy:
  - Add targeted canvas interaction regression tests before broader changes.
  - Keep button policy explicit (primary-only) and aligned with current UX expectations.
  - Test visible user outcomes for empty-state routing/branching rather than internal implementation details.
  - Reset mutable `appUiModules` knobs in shared setup while preserving per-suite overrides.
  - Document the perf-guardrail intent and preserve a meaningful threshold/strategy.
- Validation snapshot (kickoff):
  - `req_023` closure pipeline was green before this follow-up planning task
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` pending for this new task/doc set
