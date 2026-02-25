## task_056_req_059_catalog_item_validation_hardening_and_sample_coverage_orchestration_and_delivery_control - req_059 catalog item validation hardening and sample coverage orchestration and delivery control
> From version: 0.9.6
> Understanding: 97% (scope is a req_053 follow-up: rule/surfacing audit + dedicated sample + UI regression hardening)
> Confidence: 91% (can be delivered in three focused waves with clear validation checkpoints)
> Progress: 0%
> Complexity: Medium
> Theme: Orchestration for req_059 validation hardening on catalog-item issues and sample coverage
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
`req_059` is a validation hardening follow-up driven by user feedback that catalog-item errors appear unsupported in the Validation workflow.

`req_053` already defined catalog integrity validation contracts, but this request focuses on practical reliability:
- verify/close gaps in catalog-item error detection/surfacing,
- add a dedicated invalid sample/fixture for reproducibility,
- harden Validation UI surfacing/filter/go-to behavior with regression coverage.

These changes touch the validation pipeline, sample/fixture builders, and Validation UI tests, so sequencing matters to avoid noisy failures and unclear responsibilities.

# Objective
- Deliver `req_059` as a focused follow-up to `req_053` with reproducible catalog-item validation error coverage.
- Preserve valid sample/demo flows while adding targeted invalid sample/fixture coverage.
- Finish with synchronized `logics` docs and a clean validation pass.

# Scope
- In:
  - Orchestrate `item_339`, `item_340`, `item_341`
  - Sequence validation-rule audit before fixture/UI hardening
  - Run targeted and final validation gates
  - Update request/backlog/task progress and closure notes
- Out:
  - New validation domains beyond catalog-item integrity follow-up
  - Catalog business-rule expansion unrelated to integrity/error surfacing

# Backlog scope covered
- `logics/backlog/item_339_validation_catalog_item_integrity_audit_and_issue_surfacing_gap_closure.md`
- `logics/backlog/item_340_dedicated_sample_fixture_for_catalog_item_validation_error_reproduction_and_regression_coverage.md`
- `logics/backlog/item_341_validation_ui_catalog_item_category_filters_and_go_to_regression_hardening.md`

# Plan
- [ ] 1. Audit and close validation rule/surfacing gaps for intrinsic catalog-item errors (`item_339`)
- [ ] 2. Add deterministic invalid sample/fixture coverage for catalog-item validation error reproduction (`item_340`)
- [ ] 3. Harden Validation UI category/filter/go-to behavior and regression tests using the new coverage (`item_341`)
- [ ] 4. Run targeted validation suites and fix regressions
- [ ] 5. Run final validation matrix
- [ ] FINAL: Update related Logics docs

# Validation
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci`
- `npm run -s test:e2e`

# Targeted validation guidance (recommended during implementation)
- `npx vitest run src/tests/app.ui.validation.spec.tsx`
- `npx vitest run src/tests/persistence.localStorage.spec.ts`
- `npx vitest run src/tests/portability.network-file.spec.ts`
- `npx vitest run src/tests/sample-network.fixture.spec.ts`

# Report
- Current blockers: none.
- Risks to track:
  - Overloading shared sample fixtures with invalid catalog states could regress happy-path tests.
  - Validation UI assertions may become brittle if tied to exact wording instead of stable category/behavior contracts.
  - Rule duplication risk with `req_053` if gap closure reimplements already-delivered logic without auditing first.
- Delivery notes:
  - Prefer explicit invalid fixture variants over mutating the default sample.
  - If user feedback reveals a specific catalog error not currently covered, record it as a concrete regression test case under `item_341`.

# References
- `logics/request/req_059_validation_support_for_catalog_item_errors_with_dedicated_sample_coverage.md`
- `logics/request/req_053_validation_catalog_integrity_issues_and_catalog_go_to_navigation_support.md`
- `logics/backlog/item_339_validation_catalog_item_integrity_audit_and_issue_surfacing_gap_closure.md`
- `logics/backlog/item_340_dedicated_sample_fixture_for_catalog_item_validation_error_reproduction_and_regression_coverage.md`
- `logics/backlog/item_341_validation_ui_catalog_item_category_filters_and_go_to_regression_hardening.md`
- `src/app/hooks/validation/buildValidationIssues.ts`
- `src/tests/app.ui.validation.spec.tsx`
