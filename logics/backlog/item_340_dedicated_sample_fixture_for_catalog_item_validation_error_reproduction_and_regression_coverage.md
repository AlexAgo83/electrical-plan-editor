## item_340_dedicated_sample_fixture_for_catalog_item_validation_error_reproduction_and_regression_coverage - Dedicated sample fixture for catalog item validation error reproduction and regression coverage
> From version: 0.9.6
> Understanding: 99%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Deterministic sample/fixture coverage for catalog-item validation error reproduction
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
There is no clearly identified dedicated sample/fixture path to reproduce catalog-item validation errors. This makes manual QA difficult and weakens regression coverage for catalog-item validation surfacing.

# Scope
- In:
  - Add a deterministic sample or fixture variant containing at least one intrinsic catalog-item record error.
  - Keep default happy-path sample(s) valid and unchanged for normal usage/onboarding.
  - Make the invalid sample/fixture easy to use in automated validation tests and manual QA.
  - Cover at least one catalog-item error type (not only broken connector/splice `catalogItemId` links).
- Out:
  - Core validation rule implementation/gap closure (handled in `item_339`).
  - Validation UI filter/go-to regression behavior changes (handled in `item_341`).

# Acceptance criteria
- A dedicated deterministic sample/fixture scenario exists and reproduces catalog-item validation issue(s).
- Default valid sample/demo flows remain valid and usable (no accidental invalid catalog contamination).
- Automated tests can reuse the sample/fixture path to assert catalog-item validation surfacing.

# Priority
- Impact: Medium-High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_059`, `item_339` (recommended sequencing), existing sample/fixture patterns.
- Blocks: `item_341`, `task_056`.
- Related AC: req_059 AC3, AC4, AC5.
- Delivery notes:
  - Dedicated sample/fixture coverage was added without contaminating default happy-path demos.
  - Regression coverage confirms catalog assignments across built-in demos and portability normalization paths remain stable while invalid catalog scenarios are reproducible for validation-focused tests.
- References:
  - `logics/request/req_059_validation_support_for_catalog_item_errors_with_dedicated_sample_coverage.md`
  - `src/store/sampleNetwork.ts`
  - `src/store/sampleNetworkAdditionalDemos.ts`
  - `src/tests/sample-network.fixture.spec.ts`
  - `src/tests/portability.network-file.spec.ts`
