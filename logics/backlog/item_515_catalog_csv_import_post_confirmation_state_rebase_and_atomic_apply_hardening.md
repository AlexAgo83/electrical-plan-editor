## item_515_catalog_csv_import_post_confirmation_state_rebase_and_atomic_apply_hardening - Catalog CSV import post-confirmation state rebase and atomic apply hardening
> From version: 1.3.3
> Status: Done
> Understanding: 100%
> Confidence: 98%
> Progress: 100%
> Complexity: Medium-High
> Theme: Data integrity / Import flow
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
`useCatalogCsvImportExport` currently captures part of state before asynchronous confirmation; if state changes during confirmation, import apply can overwrite newer data.

# Scope
- In:
  - rebase import apply logic on fresh state after confirmation acceptance;
  - prevent stale snapshot clobbering when concurrent edits happen during confirmation wait;
  - preserve current import semantics for counts/messages (`created`, `updated`, errors, summaries);
  - add targeted regression tests for delayed-confirmation race conditions.
- Out:
  - redesign of CSV schema;
  - changes to import/export UX copy outside req_105 i18n hardening.

# Acceptance criteria
- AC1: Import apply step no longer uses stale pre-confirmation snapshot for final merge/write.
- AC2: Concurrent changes made while confirmation is open are preserved after import completion.
- AC3: Existing success/error summary semantics remain behavior-compatible.
- AC4: Regression test reproduces delayed-confirmation mutation scenario and passes deterministically.

# AC Traceability
- AC1 -> Atomicity is restored at commit point.
- AC2 -> User edits are not silently lost.
- AC3 -> Functional behavior remains stable.
- AC4 -> Race condition stays protected.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Derived from `logics/request/req_105_post_req_104_review_followup_ci_budget_guard_csv_import_atomicity_i18n_runtime_completeness_onboarding_focus_cancellation_and_targeted_regression_coverage.md`.
- Orchestrated by `logics/tasks/task_081_req_105_post_req_104_review_followup_orchestration_and_delivery_control.md`.
- Closure summary:
  - import apply path now rebases on a fresh post-confirmation store snapshot in `src/app/hooks/useCatalogCsvImportExport.ts`;
  - concurrent catalog mutations done while confirmation is open are preserved after import;
  - success/error summary semantics (`created`, `updated`, warnings/errors recap) remain unchanged.
- Validation evidence:
  - `npx vitest run src/tests/app.ui.catalog-csv-import-export.spec.tsx` ✅
  - `npm run -s test:ci:ui` ✅
  - `npm run -s ci:local` ✅
- AC closure:
  - AC1 satisfied: final apply no longer depends on stale pre-confirm snapshot.
  - AC2 satisfied: concurrent updates are preserved.
  - AC3 satisfied: import summary and status semantics are behavior-compatible.
  - AC4 satisfied: delayed-confirmation mutation regression is covered and passing.
