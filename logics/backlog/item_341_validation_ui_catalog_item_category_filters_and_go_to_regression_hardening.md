## item_341_validation_ui_catalog_item_category_filters_and_go_to_regression_hardening - Validation UI catalog item category filters and go-to regression hardening
> From version: 0.9.6
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
