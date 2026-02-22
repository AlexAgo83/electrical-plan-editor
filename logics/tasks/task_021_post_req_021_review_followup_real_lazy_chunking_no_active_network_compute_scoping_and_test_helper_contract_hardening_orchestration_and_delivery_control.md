## task_021_post_req_021_review_followup_real_lazy_chunking_no_active_network_compute_scoping_and_test_helper_contract_hardening_orchestration_and_delivery_control - Post-req_021 Review Follow-up Orchestration and Delivery Control (Real Lazy Chunking, No-Active-Network Compute Scoping, Test Helper Contract Hardening)
> From version: 0.5.7
> Understanding: 100%
> Confidence: 98%
> Progress: 0%
> Complexity: Medium
> Theme: Follow-up Delivery for Lazy Chunking Realism and Test Helper Contract Safety
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_022`. This task coordinates follow-up work on real lazy chunking behavior in `appUiModules`, no-active-network compute scoping completion in `AppController`, async-safe viewport helper contracts, strict navigation helper contract hardening, and final closure/AC traceability.

Backlog scope covered:
- `item_129_app_ui_modules_real_lazy_chunking_contract_restoration_with_testable_modes.md`
- `item_130_app_controller_no_active_network_compute_scoping_alignment.md`
- `item_131_async_safe_viewport_mutation_test_helper_contract_hardening.md`
- `item_132_strict_navigation_test_helper_contract_hardening_without_auto_repair.md`
- `item_133_req_022_followup_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# Plan
- [ ] 1. Deliver Wave 0 real lazy chunking contract restoration while preserving testable lazy/eager modes (`item_129`)
- [ ] 2. Deliver Wave 1 no-active-network compute scoping alignment in `AppController` (`item_130`)
- [ ] 3. Deliver Wave 2 async-safe viewport helper contract hardening and touched test updates (`item_131`)
- [ ] 4. Deliver Wave 3 strict navigation helper contract hardening without hidden auto-repair (`item_132`)
- [ ] 5. Deliver Wave 4 closure: validation/build/PWA pass and `req_022` AC traceability (`item_133`)
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
    - `npx vitest run src/tests/app.ui.lazy-loading-regression.spec.tsx src/tests/app.ui.workspace-shell-regression.spec.tsx src/tests/app.ui.inspector-shell.spec.tsx`
    - Any tests touched by strict helper contract changes
- End-to-end tests:
  - `npm run test:e2e`
- Build / delivery checks:
  - `npm run build`
  - `npm run quality:pwa`

# Report
- Wave status:
  - Wave 0 pending: restore real lazy chunking behavior while preserving `appUiModules` test controls.
  - Wave 1 pending: align compute scoping with `no active network` empty-state short-circuit.
  - Wave 2 pending: harden viewport helper for async-safe cleanup.
  - Wave 3 pending: harden strict navigation helper contracts (no hidden auto-repair).
  - Wave 4 pending: full closure validation and `req_022` AC1..AC7 traceability.
- Current blockers:
  - None at kickoff.
- Main risks to track:
  - Lazy chunking fix regresses test lazy-path controls or makes tests flaky.
  - Compute scoping alignment changes behavior on empty-state transitions.
  - Async helper contract changes ripple through many tests.
  - Strict helper hardening causes noisy test failures due to implicit assumptions.
- Mitigation strategy:
  - Separate production lazy registry changes from test harness controls explicitly.
  - Add targeted no-active-network coverage if needed before broad test runs.
  - Make viewport helper backward-compatible for sync callers while supporting async.
  - Migrate only touched tests to explicit helper variants and preserve drawer-aware alternatives.
- Validation snapshot (kickoff):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` pending for this new task/doc set
  - `req_021` closure pipeline was green before this follow-up planning task
