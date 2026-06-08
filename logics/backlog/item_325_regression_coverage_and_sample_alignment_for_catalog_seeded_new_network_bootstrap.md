## item_325_regression_coverage_and_sample_alignment_for_catalog_seeded_new_network_bootstrap - Regression Coverage and Sample Alignment for Catalog-Seeded New-Network Bootstrap
> From version: 0.9.5
> Status: Done
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


# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: Creating a brand-new network initializes a default network-scoped catalog with exactly `3` valid catalog items.
- request-AC2 -> This backlog slice. Evidence needed: Seeded catalog items are immediately usable by connector/splice creation flows.
- request-AC3 -> This backlog slice. Evidence needed: Default seed items are editable/deletable like regular catalog items (subject to existing reference guards).
- request-AC4 -> This backlog slice. Evidence needed: Existing network load, migration, and import flows do not auto-inject default catalog seed items.
- request-AC5 -> This backlog slice. Evidence needed: Seed generation is deterministic and does not duplicate items for the same newly created network.
- request-AC6 -> This backlog slice. Evidence needed: Regression tests cover both seeded new-network behavior and no-reseed import/load behavior.
- request-AC7 -> This backlog slice. Evidence needed: The V1 seed set uses the mandated generic manufacturer references (`CAT-2W-STD`, `CAT-6P-STD`, `CAT-8W-STD`) and includes deterministic non-null `unitPriceExclTax` values.
- request-AC8 -> This backlog slice. Evidence needed: The V1 seed set includes deterministic human-readable `name` defaults (`2-way standard connector`, `6-port standard splice`, `8-way standard connector`).
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC8 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
