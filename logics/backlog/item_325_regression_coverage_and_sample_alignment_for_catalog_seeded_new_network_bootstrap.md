## item_325_regression_coverage_and_sample_alignment_for_catalog_seeded_new_network_bootstrap - Regression Coverage and Sample Alignment for Catalog-Seeded New-Network Bootstrap
> From version: 0.9.5
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Protect seeded catalog defaults and no-reseed behavior across UI, reducer, and import/load paths
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Default seeding touches network initialization and can easily leak into load/import flows or break tests that assume an empty new catalog.

# Scope
- In:
  - Add reducer/store tests for seeded new-network initialization and no-reseed behavior.
  - Add UI/create-flow tests ensuring seeded items are immediately usable.
  - Adjust sample/demo assumptions only where necessary.
  - Verify removing seeded items does not trigger hidden reseed behavior.
- Out:
  - BOM CSV export logic (covered by req_056 items).

# Acceptance criteria
- Regression tests verify exact seeded defaults and no-reseed boundaries.
- UI tests confirm seeded items support immediate connector/splice creation.
- Deleting seeded items does not trigger automatic reseed later.
- Existing import/load sample paths remain stable.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_054`, item_324.
- Blocks: item_332.
- Related AC: AC2, AC4, AC5, AC6.
- References:
  - `logics/request/req_054_default_seed_catalog_items_on_new_network_creation_for_catalog_first_bootstrap.md`
  - `src/tests/store.reducer.networks.spec.ts`
  - `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
  - `src/store/sampleNetwork.ts`

