## req_105_post_req_104_review_followup_ci_budget_guard_csv_import_atomicity_i18n_runtime_completeness_onboarding_focus_cancellation_and_targeted_regression_coverage - Post req_104 review follow-up for CI size-budget guardrails, catalog CSV import atomicity, runtime i18n completeness, onboarding focus cancellation, and regression coverage
> From version: 1.3.2
> Status: Draft
> Understanding: 98% (review findings are concrete and reproducible)
> Confidence: 95%
> Complexity: Medium-High
> Theme: Reliability / Quality gates / UX consistency
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- Add hard CI protection so `AppController.tsx` and `NetworkSummaryPanel.tsx` cannot silently grow again past req_104 budgets.
- Remove stale-snapshot risk in catalog CSV import flow after async confirmation.
- Complete runtime i18n coverage for newly introduced user-facing strings in controller/hooks.
- Prevent late focus jumps from onboarding target RAF retries when modal closes quickly.
- Add regression tests for the above paths.

# Context
- req_104 delivered the major decomposition and passed validation.
- A post-delivery review identified follow-up risks:
  - UI modularization quality gate does not enforce line budgets for `src/app/AppController.tsx` and `src/app/components/NetworkSummaryPanel.tsx`.
  - `src/app/hooks/useCatalogCsvImportExport.ts` captures state before async confirmation and may apply updates on stale state.
  - Several runtime messages are authored in English in hooks/flows and are not fully guaranteed by static dictionary entries.
  - Onboarding target focus uses RAF retries without explicit cancellation token on close.
  - Existing tests mostly cover happy paths; race and parity paths need explicit guards.

# Objective
- Convert review findings into deterministic, test-backed guarantees.
- Preserve current user behavior and req_104 architecture, while hardening safety rails and runtime consistency.

# Scope
- In:
  - CI/local quality gate extension for explicit line-budget checks:
    - `src/app/AppController.tsx <= 1100`,
    - `src/app/components/NetworkSummaryPanel.tsx <= 1000`;
  - catalog CSV import flow hardening to avoid state overwrite from pre-confirm snapshot;
  - i18n coverage completion for runtime strings introduced by controller/hooks/onboarding/import-export status;
  - onboarding focus retry cancellation contract;
  - targeted regression tests and documentation updates.
- Out:
  - new product features;
  - redesign of onboarding modal or import/export UX;
  - broad i18n rewrite beyond impacted strings.

# Locked execution decisions
- Decision 1: line-budget guard must be machine-enforced in quality scripts (not doc-only).
- Decision 2: CSV import apply step must rebase on the latest state after confirmation, or abort safely on conflict.
- Decision 3: runtime user-facing strings touched by this request must be translatable in both EN/FR paths.
- Decision 4: onboarding target-focus retries must be cancel-safe on close/unmount.
- Decision 5: each hardening point must have at least one explicit regression test.

# Recommended implementation by review point
## Point 1 - CI line-budget guardrail
- Extend `scripts/quality/check-ui-modularization.mjs` (or dedicated script) with strict checks for:
  - `src/app/AppController.tsx` max `1100`;
  - `src/app/components/NetworkSummaryPanel.tsx` max `1000`.
- Ensure `npm run -s ci:local` fails if either file exceeds budget.

## Point 2 - Catalog CSV import atomicity
- In `src/app/hooks/useCatalogCsvImportExport.ts`:
  - avoid final apply from stale `currentState` captured before `await requestConfirmation`;
  - re-read fresh state after confirmation and before final reducer sequence;
  - preserve current semantics (`created/updated`, summary, status messaging).

## Point 3 - Runtime i18n completeness
- Audit user-visible strings authored in:
  - `src/app/hooks/controller/useAppControllerHomeWorkspaceContent.tsx`,
  - `src/app/hooks/useCatalogCsvImportExport.ts`,
  - `src/app/hooks/controller/useOnboardingController.ts`,
  - related onboarding modal labels where applicable.
- Add missing dictionary keys and/or dynamic translation patterns in `src/app/lib/i18n.ts`.

## Point 4 - Onboarding focus cancellation safety
- In `src/app/hooks/controller/useOnboardingController.ts`:
  - add cancellation token/ref for RAF-based target focus retries;
  - cancel pending retries on modal close/unmount and before opening a new target action.

## Point 5 - Regression coverage
- Add targeted tests for:
  - quality-gate line-budget enforcement path;
  - CSV import after delayed confirmation with intermediate state mutation;
  - FR runtime translation visibility for affected status/dialog strings;
  - no late focus jump after onboarding close.

# Functional behavior contract
## A. CI guard contract
- Builds and `ci:local` fail deterministically when either main file exceeds locked line budget.

## B. CSV import contract
- Import operation applies on a fresh state basis after confirmation and does not clobber unrelated concurrent updates.

## C. i18n contract
- Affected runtime UI strings are translated consistently under FR locale.

## D. Focus safety contract
- Closing onboarding prevents delayed target-focus side effects.

# Acceptance criteria
- AC1: Quality gate enforces `AppController.tsx <= 1100` and `NetworkSummaryPanel.tsx <= 1000` in CI/local pipeline.
- AC2: Catalog CSV import no longer applies updates from stale pre-confirm snapshot.
- AC3: Affected runtime strings are covered by EN/FR translation path and verified in UI tests.
- AC4: Onboarding focus retries are cancel-safe and do not trigger post-close focus jumps.
- AC5: Regression tests exist for AC1..AC4 and pass in `test:ci:ui` (plus any relevant non-UI tests).
- AC6: `logics_lint`, `lint`, `typecheck`, `test:ci:ui`, `test:e2e`, and `ci:local` pass.

# Validation and regression safety
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci:ui`
- `npm run -s test:e2e`
- `npm run -s ci:local`

# Risks
- Overly strict i18n key checks can create noisy failures if dynamic copy patterns are not normalized.
- CSV import rebase logic can alter edge-case counts if merge semantics are not preserved exactly.
- Focus-cancellation changes can affect onboarding CTA responsiveness if cancellation scope is too broad.

# Backlog
- To create from this request:
  - `item_514_ci_quality_gate_extension_for_app_controller_and_network_summary_line_budget_enforcement.md`
  - `item_515_catalog_csv_import_post_confirmation_state_rebase_and_atomic_apply_hardening.md`
  - `item_516_runtime_i18n_coverage_completion_for_controller_onboarding_and_catalog_import_export_status_strings.md`
  - `item_517_onboarding_target_focus_retry_cancellation_and_lifecycle_safety.md`
  - `item_518_req_105_targeted_regression_matrix_and_traceability_closure.md`

# Orchestration task
- `logics/tasks/task_081_req_105_post_req_104_review_followup_orchestration_and_delivery_control.md`

# References
- `scripts/quality/check-ui-modularization.mjs`
- `src/app/AppController.tsx`
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/hooks/useCatalogCsvImportExport.ts`
- `src/app/hooks/controller/useOnboardingController.ts`
- `src/app/hooks/controller/useAppControllerHomeWorkspaceContent.tsx`
- `src/app/components/onboarding/OnboardingModal.tsx`
- `src/app/lib/i18n.ts`
- `src/tests/app.ui.catalog-csv-import-export.spec.tsx`
- `src/tests/app.ui.home.spec.tsx`
- `src/tests/app.ui.onboarding.spec.tsx`
