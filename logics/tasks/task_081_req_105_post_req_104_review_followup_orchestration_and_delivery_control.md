## task_081_req_105_post_req_104_review_followup_orchestration_and_delivery_control - Req 105 post-req_104 review follow-up orchestration and delivery control
> From version: 1.3.3
> Status: Draft
> Understanding: 98% (scope and hardening sequence are explicit)
> Confidence: 95%
> Progress: 0%
> Complexity: High
> Theme: Reliability / Quality gates / Orchestration
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.

# Context
- Orchestration task to deliver:
  - `req_105_post_req_104_review_followup_ci_budget_guard_csv_import_atomicity_i18n_runtime_completeness_onboarding_focus_cancellation_and_targeted_regression_coverage`
- Backlog execution scope:
  - `item_514_ci_quality_gate_extension_for_app_controller_and_network_summary_line_budget_enforcement`
  - `item_515_catalog_csv_import_post_confirmation_state_rebase_and_atomic_apply_hardening`
  - `item_516_runtime_i18n_coverage_completion_for_controller_onboarding_and_catalog_import_export_status_strings`
  - `item_517_onboarding_target_focus_retry_cancellation_and_lifecycle_safety`
  - `item_518_req_105_targeted_regression_matrix_and_traceability_closure`
- Hard constraints carried from request:
  - line-budget checks are machine-enforced for:
    - `src/app/AppController.tsx <= 1100`,
    - `src/app/components/NetworkSummaryPanel.tsx <= 1000`;
  - catalog CSV import apply path must use fresh post-confirmation state (no stale snapshot clobbering);
  - impacted runtime user-facing strings are translatable in EN/FR paths;
  - onboarding target-focus retries are cancel-safe on close/unmount;
  - each hardening point includes explicit regression coverage.

# Plan
- [ ] 1. Deliver CI budget guardrail (`item_514`)
  - extend quality script and `ci:local` enforcement;
  - ensure deterministic failure diagnostics.
- [ ] 2. Deliver import atomicity hardening (`item_515`)
  - rebase apply logic on fresh state after confirmation;
  - preserve existing counters/summaries and add race test coverage.
- [ ] 3. Deliver runtime i18n completeness (`item_516`)
  - migrate impacted runtime copy to i18n keys;
  - complete EN/FR dictionary coverage and add FR regression checks.
- [ ] 4. Deliver onboarding focus cancellation safety (`item_517`)
  - implement retry cancellation token/ref and cleanup on close/unmount;
  - cover close-during-retry no-late-focus behavior.
- [ ] 5. Validate and close (`item_518`)
  - execute validation matrix and capture evidence;
  - update request/backlog/task statuses and closure notes.
- [ ] FINAL: Update related Logics docs and release-facing docs where needed.

# AC Traceability
- AC1 (`item_514`) -> CI/local line-budget enforcement is deterministic.
- AC2 (`item_515`) -> CSV import apply path is atomic post-confirmation.
- AC3 (`item_516`) -> Runtime i18n coverage is complete on impacted flows.
- AC4 (`item_517`) -> Onboarding retries are cancel-safe and lifecycle-clean.
- AC5 (`item_514`, `item_515`, `item_516`, `item_517`) -> Targeted regression coverage exists for each safeguard.
- AC6 (`item_518`) -> Validation matrix and documentation traceability are complete.

# Validation
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci:ui`
- `npm run -s test:e2e`
- `npm run -s ci:local`

# Definition of Done (DoD)
- [ ] Scope implemented and acceptance criteria covered.
- [ ] Validation commands executed and results captured.
- [ ] Linked request/backlog/task docs updated.
- [ ] Status is `Done` and progress is `100%`.

# Report
- 2026-03-04: Task created from req_105 with execution scope (`item_514` -> `item_518`) and hard constraints locked for delivery.
