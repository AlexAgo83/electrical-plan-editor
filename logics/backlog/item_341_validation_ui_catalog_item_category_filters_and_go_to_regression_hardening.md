## item_341_validation_ui_catalog_item_category_filters_and_go_to_regression_hardening - Validation UI catalog item category filters and go-to regression hardening
> From version: 0.9.6
> Status: Done
> Understanding: 98%
> Confidence: 94%
> Progress: 100%
> Complexity: Medium
> Theme: Validation UI surfacing/filter/go-to hardening for catalog item issues
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even when validation rules exist, catalog-item issues can still feel unsupported if Validation UI category counts, filtering behavior, or `Go to` navigation are inconsistent or untested in realistic scenarios.

# Scope
- In:
  - Harden Validation UI surfacing for catalog-item issues (category counts/filter states/severity interactions).
  - Verify and harden `Go to` behavior for catalog-item-targeted issues in current navigation patterns.
  - Add UI regression coverage using the dedicated invalid sample/fixture path where appropriate.
  - Ensure catalog-item issues are visible and actionable in the Validation center workflow.
- Out:
  - Base rule generation logic for catalog-item validation issues (handled in `item_339`).
  - Creation of the invalid sample/fixture itself (handled in `item_340`).

# Acceptance criteria
- Validation UI category/filter behavior remains coherent when catalog-item issues are present.
- Catalog-item issues are visible/actionable in Validation UI and do not regress existing validation workflows.
- `Go to` for catalog-item-targeted issues works deterministically (when applicable to the issue type under test).
- Regression coverage protects catalog-item validation UI surfacing and navigation behavior.

# Priority
- Impact: Medium-High.
- Urgency: Medium.

# Notes
- Dependencies: `req_059`, `item_339`, `item_340`, `req_053`.
- Blocks: `task_056` closure.
- Related AC: req_059 AC2, AC4.
- Delivery notes:
  - Validation UI regression coverage includes `Catalog integrity` category surfacing/filtering and `Go to` navigation to catalog item editing for catalog-targeted issues.
  - Keyboard row selection and category count/filter interactions remain compatible with catalog-item issue scenarios.
- References:
  - `logics/request/req_059_validation_support_for_catalog_item_errors_with_dedicated_sample_coverage.md`
  - `logics/request/req_053_validation_catalog_integrity_issues_and_catalog_go_to_navigation_support.md`
  - `src/tests/app.ui.validation.spec.tsx`
  - `src/app/hooks/useValidationHandlers.ts`

# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: Validation pipeline inspects `catalogItems` and emits catalog integrity issues for invalid catalog records.
- request-AC2 -> This backlog slice. Evidence needed: Validation pipeline emits connector/splice catalog-link integrity issues (missing/broken/mismatched links).
- request-AC3 -> This backlog slice. Evidence needed: Validation UI exposes catalog-related issues in a clear category/filterable group without regressing existing validation groups.
- request-AC4 -> This backlog slice. Evidence needed: Validation `Go to` supports catalog-targeted issues by navigating to the `Catalog` screen and selecting the catalog item.
- request-AC5 -> This backlog slice. Evidence needed: Existing connector/splice/node/segment/wire validation behavior and navigation remain functional.
- request-AC6 -> This backlog slice. Evidence needed: Validation remains compatible with legacy/imported datasets that may include unresolved catalog links.
- request-AC7 -> This backlog slice. Evidence needed: Sample/demo datasets and test fixtures used by validation/import regression suites are updated (or extended with variants) to cover catalog-related validation without regressing the default valid sample flows.
- request-AC8 -> This backlog slice. Evidence needed: Duplicate catalog `manufacturerReference` validation emits one issue per offending catalog item (deterministic ordering), each with a usable `Go to` target.
- request-AC1 -> This backlog slice. Evidence needed: Validation reliably surfaces catalog-item record errors (not only connector/splice catalog-link errors) in the Validation workflow.
- request-AC2 -> This backlog slice. Evidence needed: Catalog-item validation issues appear in the expected Validation category/grouping without regressing existing filters/counts behavior.
- request-AC3 -> This backlog slice. Evidence needed: A dedicated sample/fixture scenario exists to reproduce catalog-item validation errors for testing.
- request-AC4 -> This backlog slice. Evidence needed: Automated regression coverage verifies catalog-item validation issue surfacing and the dedicated sample/fixture path.
- request-AC5 -> This backlog slice. Evidence needed: Existing valid sample/demo flows remain valid and usable after adding the catalog-item error sample/fixture coverage.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC8 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
