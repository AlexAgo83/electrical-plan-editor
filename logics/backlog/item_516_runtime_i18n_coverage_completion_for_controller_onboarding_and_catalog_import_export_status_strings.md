## item_516_runtime_i18n_coverage_completion_for_controller_onboarding_and_catalog_import_export_status_strings - Runtime i18n coverage completion for controller, onboarding, and catalog import/export status strings
> From version: 1.3.3
> Status: Done
> Understanding: 100%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: i18n / Runtime consistency
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Some runtime user-facing messages in hooks/controllers are authored directly in English and are not guaranteed through complete EN/FR dictionary coverage.

# Scope
- In:
  - audit impacted runtime message surfaces in:
    - `useAppControllerHomeWorkspaceContent`,
    - `useCatalogCsvImportExport`,
    - `useOnboardingController`,
    - related onboarding modal labels/messages;
  - move affected runtime copy to deterministic i18n translation path (dictionary entries and runtime patterns);
  - add missing EN/FR dictionary entries and key-level consistency checks where needed;
  - add targeted regression tests validating FR-visible strings for impacted paths.
- Out:
  - full-product i18n rewrite outside req_105 impacted surfaces.

# Acceptance criteria
- AC1: Impacted runtime copy is emitted through deterministic i18n translation path (dictionary keys or explicit runtime patterns).
- AC2: EN/FR dictionaries contain all new keys for impacted runtime paths.
- AC3: FR locale renders translated copy for import/export statuses and onboarding/controller messages.
- AC4: Regression tests protect against fallback to hardcoded English in impacted paths.

# AC Traceability
- AC1 -> Runtime copy governance is explicit.
- AC2 -> Locale completeness is deterministic.
- AC3 -> User-visible parity is verified.
- AC4 -> Regressions are detected early.

# Priority
- Impact: Medium-High.
- Urgency: Medium-High.

# Notes
- Derived from `logics/request/req_105_post_req_104_review_followup_ci_budget_guard_csv_import_atomicity_i18n_runtime_completeness_onboarding_focus_cancellation_and_targeted_regression_coverage.md`.
- Orchestrated by `logics/tasks/task_081_req_105_post_req_104_review_followup_orchestration_and_delivery_control.md`.
- Closure summary:
  - extended FR runtime translation coverage in `src/app/lib/i18n.ts` for impacted catalog CSV status lines and controller/home confirmation copy;
  - added deterministic runtime pattern coverage for dynamic catalog import/export messages;
  - validated FR-rendered runtime copy in UI regression suites.
- Validation evidence:
  - `npx vitest run src/tests/app.ui.settings-locale.spec.tsx src/tests/app.ui.catalog-csv-import-export.spec.tsx` ✅
  - `npm run -s test:ci:ui` ✅
  - `npm run -s ci:local` ✅
- AC closure:
  - AC1 satisfied: impacted runtime copy uses deterministic translation path (direct dictionary or runtime pattern).
  - AC2 satisfied: EN/FR coverage added for impacted runtime surfaces.
  - AC3 satisfied: FR locale renders translated statuses/messages in validated paths.
  - AC4 satisfied: regression tests detect fallback-to-English regressions on impacted scenarios.
