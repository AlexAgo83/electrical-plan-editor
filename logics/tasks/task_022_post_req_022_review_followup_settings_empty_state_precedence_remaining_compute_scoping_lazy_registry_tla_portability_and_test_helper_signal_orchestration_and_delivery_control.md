## task_022_post_req_022_review_followup_settings_empty_state_precedence_remaining_compute_scoping_lazy_registry_tla_portability_and_test_helper_signal_orchestration_and_delivery_control - Post-req_022 Review Follow-up Orchestration and Delivery Control (Settings Empty-State Precedence, Remaining Compute Scoping, Lazy Registry TLA Portability, Test Helper Signal)
> From version: 0.5.8
> Understanding: 100%
> Confidence: 98%
> Progress: 0%
> Complexity: Medium
> Theme: Follow-up Delivery for UX Correctness, Residual Compute Scoping, and Lazy Registry/Test Helper Robustness
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_023`. This task coordinates follow-up work on Settings accessibility without active networks, remaining `NetworkSummaryPanel` compute scoping, `appUiModules` top-level-await portability risk reduction, test-helper signal hardening, and final closure/AC traceability.

Backlog scope covered:
- `item_134_settings_screen_empty_state_precedence_and_no_active_network_access_fix.md`
- `item_135_network_summary_panel_remaining_compute_scoping_and_active_screen_assembly_alignment.md`
- `item_136_app_ui_modules_lazy_registry_test_controls_without_top_level_await_portability_risk.md`
- `item_137_test_helper_alias_signal_hardening_and_explicit_drawer_aware_usage_followup.md`
- `item_138_req_023_followup_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# Plan
- [ ] 1. Deliver Wave 0 Settings/empty-state precedence fix for no-active-network access (`item_134`)
- [ ] 2. Deliver Wave 1 remaining `NetworkSummaryPanel` compute scoping alignment (`item_135`)
- [ ] 3. Deliver Wave 2 `appUiModules` lazy registry portability hardening without losing real lazy chunking/test controls (`item_136`)
- [ ] 4. Deliver Wave 3 test-helper alias signal hardening / explicit drawer-aware usage follow-up (`item_137`)
- [ ] 5. Deliver Wave 4 closure: validation/build/PWA pass and `req_023` AC traceability (`item_138`)
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
    - `npx vitest run src/tests/app.ui.settings.spec.tsx src/tests/app.ui.workspace-shell-regression.spec.tsx src/tests/app.ui.lazy-loading-regression.spec.tsx`
- End-to-end tests:
  - `npm run test:e2e`
- Build / delivery checks:
  - `npm run build`
  - `npm run quality:pwa`

# Report
- Wave status:
  - Wave 0 pending: fix Settings vs empty-state precedence when no active network exists.
  - Wave 1 pending: reduce remaining unconditional `NetworkSummaryPanel` assembly work.
  - Wave 2 pending: reduce/remove `appUiModules` top-level-await portability risk while preserving lazy chunking and test controls.
  - Wave 3 pending: improve helper alias/test usage signal for drawer-aware navigation behavior.
  - Wave 4 pending: full closure validation and `req_023` AC1..AC7 traceability.
- Current blockers:
  - None at kickoff.
- Main risks to track:
  - Settings precedence fix unintentionally changes empty-state behavior for non-settings screens.
  - NetworkSummaryPanel scoping refactor breaks modeling/analysis content assumptions.
  - Lazy registry portability changes regress production chunking or lazy-path tests.
  - Helper alias changes cause broad, noisy test churn.
- Mitigation strategy:
  - Add targeted settings/no-active-network coverage before broad test runs.
  - Scope `NetworkSummaryPanel` assembly incrementally with explicit include flags.
  - Verify build output chunking and lazy-path regression tests immediately after registry changes.
  - Prefer explicit test usage migration in touched files over sweeping alias behavior flips.
- Validation snapshot (kickoff):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` pending for this new task/doc set
  - `req_022` closure pipeline was green before this follow-up planning task
