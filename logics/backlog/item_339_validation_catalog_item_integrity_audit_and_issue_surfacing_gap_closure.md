## item_339_validation_catalog_item_integrity_audit_and_issue_surfacing_gap_closure - Validation catalog item integrity audit and issue surfacing gap closure
> From version: 0.9.6
> Status: Done
> Understanding: 99%
> Confidence: 95%
> Progress: 100%
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
- Delivery notes:
  - `buildValidationIssues` surfaces intrinsic catalog-item integrity issues under `Catalog integrity` (trimmed manufacturer reference, invalid connection count, invalid URL, duplicate manufacturer reference).
  - Catalog-item issue generation remains deterministic and coexists with connector/splice catalog-link integrity checks.
- References:
  - `logics/request/req_059_validation_support_for_catalog_item_errors_with_dedicated_sample_coverage.md`
  - `logics/request/req_053_validation_catalog_integrity_issues_and_catalog_go_to_navigation_support.md`
  - `src/app/hooks/validation/buildValidationIssues.ts`
  - `src/tests/app.ui.validation.spec.tsx`

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
