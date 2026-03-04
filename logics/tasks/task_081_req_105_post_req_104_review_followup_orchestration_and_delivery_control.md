## task_081_req_105_post_req_104_review_followup_orchestration_and_delivery_control - Req 105 post-req_104 review follow-up orchestration and delivery control
> From version: 1.3.3
> Status: Done
> Understanding: 100% (scope delivered with validation evidence captured)
> Confidence: 99%
> Progress: 100%
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
- [x] 1. Deliver CI budget guardrail (`item_514`)
  - extend quality script and `ci:local` enforcement;
  - ensure deterministic failure diagnostics.
- [x] 2. Deliver import atomicity hardening (`item_515`)
  - rebase apply logic on fresh state after confirmation;
  - preserve existing counters/summaries and add race test coverage.
- [x] 3. Deliver runtime i18n completeness (`item_516`)
  - route impacted runtime copy through deterministic i18n translation path (dictionary + runtime patterns);
  - complete EN/FR dictionary coverage and add FR regression checks.
- [x] 4. Deliver onboarding focus cancellation safety (`item_517`)
  - implement retry cancellation token/ref and cleanup on close/unmount;
  - cover close-during-retry no-late-focus behavior.
- [x] 5. Validate and close (`item_518`)
  - execute validation matrix and capture evidence;
  - update request/backlog/task statuses and closure notes.
- [x] FINAL: Update related Logics docs and release-facing docs where needed.

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
- [x] Scope implemented and acceptance criteria covered.
- [x] Validation commands executed and results captured.
- [x] Linked request/backlog/task docs updated.
- [x] Status is `Done` and progress is `100%`.

# Report
- 2026-03-04: Task created from req_105 with execution scope (`item_514` -> `item_518`) and hard constraints locked for delivery.
- 2026-03-04: Delivered `item_514`:
  - extracted locked-budget config to `scripts/quality/ui-modularization-gate-core.mjs`;
  - enforced strict limits in `check-ui-modularization.mjs`:
    - `src/app/AppController.tsx <= 1100`,
    - `src/app/components/NetworkSummaryPanel.tsx <= 1000`;
  - added regression tests in `src/tests/quality.ui-modularization.spec.ts` for pass/fail guard behavior.
- 2026-03-04: Delivered `item_515`:
  - `useCatalogCsvImportExport` now re-reads fresh store state after confirmation before apply;
  - import flow preserves concurrent catalog edits made while confirmation dialog is open;
  - race coverage added in `src/tests/app.ui.catalog-csv-import-export.spec.tsx`.
- 2026-03-04: Delivered `item_516`:
  - completed EN/FR runtime coverage for impacted catalog CSV status and controller/home confirmation copy in `src/app/lib/i18n.ts`;
  - added FR runtime regression checks in:
    - `src/tests/app.ui.catalog-csv-import-export.spec.tsx`,
    - `src/tests/app.ui.settings-locale.spec.tsx`.
- 2026-03-04: Delivered `item_517`:
  - onboarding target-focus retry now uses cancel-safe request ownership in `useOnboardingController`;
  - retries are canceled on close, unmount, and superseded focus requests;
  - close-during-retry regression validated in `src/tests/app.ui.onboarding.spec.tsx`.
- 2026-03-04: Delivered `item_518` and closed req_105:
  - validation matrix executed and traceability synchronized across request/backlog/task docs;
  - full validation pass:
    - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` ✅
    - `npm run -s lint` ✅
    - `npm run -s typecheck` ✅
    - `npm run -s test:ci:ui` ✅ (`33` files, `229` tests)
    - `npm run -s test:e2e` ✅ (`2` tests)
    - `npm run -s ci:local` ✅
- 2026-03-04: README release-facing notes updated with req_105 hardening summary.

# Notes

# Request AC Proof Coverage
- AC1 Proof: see validation evidence and linked implementation notes in this document.
- AC2 Proof: see validation evidence and linked implementation notes in this document.
- AC3 Proof: see validation evidence and linked implementation notes in this document.
- AC4 Proof: see validation evidence and linked implementation notes in this document.
- AC5 Proof: see validation evidence and linked implementation notes in this document.
- AC6 Proof: see validation evidence and linked implementation notes in this document.
