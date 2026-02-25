## item_339_validation_catalog_item_integrity_audit_and_issue_surfacing_gap_closure - Validation catalog item integrity audit and issue surfacing gap closure
> From version: 0.9.6
> Understanding: 97%
> Confidence: 91%
> Progress: 0%
> Complexity: Medium
> Theme: Validation rule/surfacing hardening for catalog item integrity issues
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Users report that Validation appears not to surface catalog item errors reliably. Even if parts of `req_053` exist, a practical gap remains in detection and/or surfacing of intrinsic `Catalog` item integrity errors in the Validation workflow.

# Scope
- In:
  - Audit current validation pipeline behavior for catalog-item integrity checks against `req_053`.
  - Close gaps in issue generation and/or issue surfacing for intrinsic catalog item record errors.
  - Confirm deterministic issue messages/ordering for catalog-item integrity cases.
  - Preserve validation category semantics (`Catalog integrity`) and compatibility with connector/splice catalog-link issues.
- Out:
  - Dedicated invalid sample/fixture creation (handled in `item_340`).
  - Validation UI filter/go-to regression hardening and workflow assertions (handled in `item_341`).

# Acceptance criteria
- Validation reliably emits catalog-item record integrity issues (not only connector/splice link issues) for supported error cases.
- Catalog-item issues surface under the expected validation category/grouping (`Catalog integrity`) without regressions to existing categories.
- Behavior is deterministic for repeated runs on unchanged invalid data.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_059`, `req_053`.
- Blocks: `item_340`, `item_341`, `task_056`.
- Related AC: req_059 AC1, AC2.
- References:
  - `logics/request/req_059_validation_support_for_catalog_item_errors_with_dedicated_sample_coverage.md`
  - `logics/request/req_053_validation_catalog_integrity_issues_and_catalog_go_to_navigation_support.md`
  - `src/app/hooks/validation/buildValidationIssues.ts`
  - `src/tests/app.ui.validation.spec.tsx`
