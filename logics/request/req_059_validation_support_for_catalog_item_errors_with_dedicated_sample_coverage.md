## req_059_validation_support_for_catalog_item_errors_with_dedicated_sample_coverage - Validation support for catalog item errors with dedicated sample coverage
> From version: 0.9.6
> Understanding: 96% (user-reported gap captured: validation appears not to surface catalog-item errors reliably)
> Confidence: 90% (likely follow-up/hardening around req_053 behavior + sample/test coverage)
> Complexity: Medium
> Theme: Validation hardening for Catalog items + sample/fixture coverage
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Users report that Validation appears not to handle errors on `Catalog` items (or not consistently enough in current flows).
- Validation should explicitly surface catalog-item errors in the Validation workflow, not only through form-level validation.
- Add a dedicated sample/fixture scenario to test catalog-item validation errors and prevent regressions.

# Context
`req_053` defined catalog integrity validation and catalog-targeted `Go to` behavior, including invalid catalog item records and catalog-link integrity checks.

However, the current user feedback suggests a practical gap remains:
- catalog-item validation errors are not visible (or not easy to reproduce/verify),
- existing sample/demo states may not provide a stable way to manually test catalog-item validation scenarios,
- regression coverage may not sufficiently protect catalog-item error surfacing in the Validation UI.

This request should be treated as a validation follow-up/hardening request:
- verify/complete catalog-item validation rules,
- ensure they surface in Validation UI categories/filters,
- provide a dedicated invalid sample or fixture path for testing.

# Objective
- Ensure Validation reliably detects and displays catalog-item errors (`Catalog` record integrity issues).
- Add a deterministic sample/fixture scenario for catalog-item validation testing (manual + automated).
- Preserve existing valid sample flows while introducing targeted invalid coverage.

# Functional scope
## A. Catalog-item validation audit and gap closure (high priority)
- Audit current Validation behavior against `req_053` catalog-item integrity expectations.
- Ensure Validation surfaces catalog-item record errors at minimum for:
  - empty/invalid `manufacturerReference` (after trim),
  - invalid `connectionCount` (`< 1`, non-integer, malformed persisted value),
  - invalid `URL` format when present,
  - duplicate `manufacturerReference` within the same network (if not already surfaced reliably).
- If some of these checks already exist, V1 of this request may focus on fixing surfacing/regression gaps rather than re-implementing rules.

## B. Validation UI surfacing and navigation consistency (high priority)
- Catalog-item errors must appear in the Validation UI with a clear category/group (expected: `Catalog integrity`, per `req_053` contract).
- Category/severity counts and filtering behavior must remain coherent when catalog-item issues are present.
- `Go to` behavior for catalog-item-targeted issues should remain functional and deterministic (navigate to `Catalog`, select relevant item), if already supported by the issue type.

## C. Dedicated sample / fixture for catalog-item validation errors (high priority)
- Add a deterministic sample or fixture variant that intentionally contains catalog-item validation issues.
- The sample/fixture should be suitable for:
  - automated validation regression tests,
  - manual QA of Validation UI surfacing.
- Recommended approach:
  - keep default happy-path sample(s) valid,
  - add a dedicated invalid variant or dedicated "validation issues" sample path that includes catalog-item errors.
- The invalid sample/fixture should include at least one catalog-item record error (not only broken connector/splice catalog links).

## D. Regression coverage and reproducibility (medium-high priority)
- Add/extend tests that prove catalog-item validation issues are produced and visible in Validation UI.
- Include at least one test covering the dedicated sample/fixture path to ensure future changes do not silently remove catalog-item issues from validation.
- Ensure test data is deterministic and avoids overloading unrelated shared fixtures with invalid states.

## E. Compatibility boundaries (medium priority)
- Preserve compatibility with existing persistence/import flows and `req_053` validation contracts.
- Do not regress valid sample/demo experiences used for onboarding and general modeling.
- If legacy fallback (`req_052`) or seeded catalog defaults (`req_054`) interact with catalog validation, document the intended precedence/behavior.

# Non-functional requirements
- Deterministic validation ordering and messages for catalog-item issues.
- No noticeable validation performance regression for typical catalogs.
- Clear test reproducibility for manual and automated validation checks.

# Validation and regression safety
- Add/extend tests for:
  - catalog-item validation issue generation for at least one intrinsic catalog record error
  - validation UI surfacing/filtering of catalog-item issues under the expected category
  - `Go to` behavior for catalog-item issue targets (if applicable in the covered issue types)
  - dedicated sample/fixture path reliably reproduces catalog-item validation issue(s)
  - default valid sample flows remain valid (no accidental contamination with invalid catalog records)

# Acceptance criteria
- AC1: Validation reliably surfaces catalog-item record errors (not only connector/splice catalog-link errors) in the Validation workflow.
- AC2: Catalog-item validation issues appear in the expected Validation category/grouping without regressing existing filters/counts behavior.
- AC3: A dedicated sample/fixture scenario exists to reproduce catalog-item validation errors for testing.
- AC4: Automated regression coverage verifies catalog-item validation issue surfacing and the dedicated sample/fixture path.
- AC5: Existing valid sample/demo flows remain valid and usable after adding the catalog-item error sample/fixture coverage.

# Out of scope
- New catalog business-policy validation beyond integrity/error surfacing (for example mandatory pricing completeness policies).
- Full validation UX redesign unrelated to catalog-item issue coverage.
- Automatic repair actions for catalog-item validation issues.

# Backlog
- `logics/backlog/item_339_validation_catalog_item_integrity_audit_and_issue_surfacing_gap_closure.md`
- `logics/backlog/item_340_dedicated_sample_fixture_for_catalog_item_validation_error_reproduction_and_regression_coverage.md`
- `logics/backlog/item_341_validation_ui_catalog_item_category_filters_and_go_to_regression_hardening.md`

# Orchestration task
- `logics/tasks/task_056_req_059_catalog_item_validation_hardening_and_sample_coverage_orchestration_and_delivery_control.md`

# References
- `logics/request/req_053_validation_catalog_integrity_issues_and_catalog_go_to_navigation_support.md`
- `logics/request/req_051_catalog_screen_with_catalog_item_crud_navigation_integration_and_required_manufacturer_reference_connection_count.md`
- `src/app/hooks/validation/buildValidationIssues.ts`
- `src/tests/app.ui.validation.spec.tsx`
- `src/store/sampleNetwork.ts`
- `src/tests/sample-network.fixture.spec.ts`
- `src/tests/portability.network-file.spec.ts`
