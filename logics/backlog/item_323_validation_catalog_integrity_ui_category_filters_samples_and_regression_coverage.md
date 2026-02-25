## item_323_validation_catalog_integrity_ui_category_filters_samples_and_regression_coverage - Validation Catalog Integrity UI Category Filters, Samples, and Regression Coverage
> From version: 0.9.5
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium-High
> Theme: Validation UI surfacing and regression coverage for catalog integrity issues with sample/fixture adaptations
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even with validation rules in place, catalog issues need clear UI grouping/filtering and regression coverage across sample/fixture/import paths to avoid silent UX regressions.

# Scope
- In:
  - Add dedicated Validation category/filter group `Catalog integrity`.
  - Ensure catalog issues render with stable grouping and `Go to` actions.
  - Adapt sample/demo data and test fixtures (or targeted variants) for catalog validation scenarios while preserving a valid happy-path sample.
  - Add regression tests for catalog validation display/filtering/navigation and sample/import fixture compatibility.
- Out:
  - New reducer/store mutation rules for catalog integrity.

# Acceptance criteria
- Validation UI exposes a dedicated `Catalog integrity` category/filter.
- Catalog issues are filterable and navigable via `Go to`.
- Sample/demo and portability fixtures cover catalog validation scenarios without breaking default valid sample flows.
- Regression tests cover catalog validation UI and fixture-based paths.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_053`, item_321, item_322.
- Blocks: item_332.
- Related AC: AC3, AC3a, AC4, AC7, AC8.
- References:
  - `logics/request/req_053_validation_catalog_integrity_issues_and_catalog_go_to_navigation_support.md`
  - `src/tests/app.ui.validation.spec.tsx`
  - `src/tests/sample-network.fixture.spec.ts`
  - `src/tests/portability.network-file.spec.ts`
  - `src/store/sampleNetwork.ts`
  - `src/store/sampleNetworkAdditionalDemos.ts`

