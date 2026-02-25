## req_054_default_seed_catalog_items_on_new_network_creation_for_catalog_first_bootstrap - Default Seed Catalog Items on New Network Creation for Catalog-First Bootstrap
> From version: 0.9.5
> Understanding: 100% (seed defaults clarified + backlog/task linkage added)
> Confidence: 97% (new-network seeding contract narrowed and decomposed)
> Complexity: Medium
> Theme: Reduce catalog-first onboarding friction by seeding realistic catalog items when creating a new network
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- The `catalog-first` workflow introduced by `req_051` is correct, but a newly created network currently starts with an empty `Catalog`.
- This creates initial friction before users can create `Connectors` / `Splices` (which now require a catalog item).
- Provide a small set of realistic default catalog items so users can start modeling immediately.

# Context
`req_051` introduced a network-scoped `Catalog` and required `catalogItemId` for new connector/splice creation. This makes the `Catalog` a functional prerequisite.

Seeding a minimal default catalog at network creation improves:
- first-run usability,
- onboarding continuity,
- demo/sample flow readiness,
without changing the catalog-first data model.

# Objective
- Automatically create **exactly `3`** realistic default `Catalog` items when a **new network** is created.
- Keep seeds network-scoped and editable/deletable by users.
- Avoid reseeding on existing networks, imports, loads, or migrations.

# Functional scope
## A. Default catalog seed on new network creation (high priority)
- On creation of a brand-new network (new workspace flow or adding a new network), initialize the network-scoped `Catalog` with a small default set of catalog items.
- Seed count contract (V1):
  - exactly `3` items
- Seeded items must satisfy all `req_051` catalog constraints:
  - unique `manufacturerReference` per network
  - valid `connectionCount` integer `>= 1`
  - optional fields may be omitted or provided with realistic placeholders
  - `unitPriceExclTax` should be populated in V1 (to support immediate BOM export usefulness)

## B. Seed content characteristics (high priority)
- Seed items should be realistic but generic (not tied to a customer-specific brand catalog).
- V1 default seed set (mandated, generic and deterministic):
  - `CAT-2W-STD` with `name: "2-way standard connector"` and `connectionCount: 2`
  - `CAT-6P-STD` with `name: "6-port standard splice"` and `connectionCount: 6`
  - `CAT-8W-STD` with `name: "8-way standard connector"` and `connectionCount: 8`
- V1 price seeding contract (for BOM readiness, no currency metadata):
  - each seed item includes a non-null `unitPriceExclTax` numeric value (`>= 0`)
  - exact V1 prices are mandated (deterministic and test-friendly):
    - `CAT-2W-STD` -> `5.00`
    - `CAT-6P-STD` -> `8.50`
    - `CAT-8W-STD` -> `12.00`
- `manufacturerReference` values should be human-readable and clearly editable.
- Seed data must be safe for immediate use in `Create Connector` / `Create Splice` flows.

## C. Trigger boundaries / no-reseed rules (high priority)
- Seeding must happen only for truly new network creation flows.
- Do **not** auto-seed on:
  - workspace load/hydration
  - migration of existing saves
  - import of workspaces/networks/files
  - switching between existing networks
- If a new network is created through any alternate creation entry-point, behavior should remain consistent (seed applied once at creation time).

## D. Editing and deletion behavior (medium priority)
- Seeded catalog items are normal catalog items after creation:
  - editable
  - duplicable (if feature enabled)
  - deletable (subject to existing `req_051` "cannot delete if referenced" rule)
- No special "system seed" lock/tag is required in V1.

## E. Onboarding and UX interplay (medium priority)
- Onboarding `Catalog` step (from `req_051`) should remain valid and useful with seeded data:
  - users may review/edit existing seeded items,
  - users may create additional catalog items.
- Empty-state messaging should still exist for edge cases (if seeds are removed by the user later).

## F. Samples and fixtures alignment (medium priority)
- Update sample/demo network generation and relevant fixtures only if they depend on "empty new network" assumptions.
- Keep tests deterministic:
  - explicit assertions for seeded catalog item count/content in new-network creation paths
  - no unexpected seeds in import/load paths

# Non-functional requirements
- Deterministic seed values and ordering (no random seed generation).
- No duplicate seed churn on repeated render/init cycles for the same newly created network.
- Minimal implementation complexity: reuse existing network initialization path rather than post-hoc UI effects.

# Validation and regression safety
- Add/extend tests for:
  - creating a new network seeds exactly `3` catalog items
  - seeded catalog manufacturer references match the mandated V1 defaults (`CAT-2W-STD`, `CAT-6P-STD`, `CAT-8W-STD`)
  - seeded items include mandated V1 `name` defaults and mandated deterministic `unitPriceExclTax` values (`5.00`, `8.50`, `12.00`)
  - seeded items are valid per `req_051` constraints (`manufacturerReference`, `connectionCount`)
  - import/load/migration paths do not inject default seeds into existing data
  - connector/splice creation can use seeded catalog items immediately
  - deleting all seeded items re-exposes catalog-first empty-state guidance (no hidden reseed)

# Acceptance criteria
- AC1: Creating a brand-new network initializes a default network-scoped catalog with exactly `3` valid catalog items.
- AC2: Seeded catalog items are immediately usable by connector/splice creation flows.
- AC3: Default seed items are editable/deletable like regular catalog items (subject to existing reference guards).
- AC4: Existing network load, migration, and import flows do not auto-inject default catalog seed items.
- AC5: Seed generation is deterministic and does not duplicate items for the same newly created network.
- AC6: Regression tests cover both seeded new-network behavior and no-reseed import/load behavior.
- AC7: The V1 seed set uses the mandated generic manufacturer references (`CAT-2W-STD`, `CAT-6P-STD`, `CAT-8W-STD`) and includes deterministic non-null `unitPriceExclTax` values.
- AC8: The V1 seed set includes deterministic human-readable `name` defaults (`2-way standard connector`, `6-port standard splice`, `8-way standard connector`).

# Out of scope
- Customer-specific seed catalogs or template selection UI.
- Locale/currency-specific pricing presets for seeded items.
- Dynamic seed catalogs by project type.

# Backlog
- `logics/backlog/item_324_new_network_catalog_seed_defaults_with_deterministic_names_prices_and_no_reseed_guards.md`
- `logics/backlog/item_325_regression_coverage_and_sample_alignment_for_catalog_seeded_new_network_bootstrap.md`
- `logics/backlog/item_332_req_052_to_req_056_catalog_follow_ups_bundle_closure_ci_build_and_ac_traceability.md`

# Orchestration task
- `logics/tasks/task_053_req_052_to_req_056_catalog_follow_ups_bundle_orchestration_and_delivery_control.md`

# References
- `logics/request/req_051_catalog_screen_with_catalog_item_crud_navigation_integration_and_required_manufacturer_reference_connection_count.md`
- `logics/request/req_053_validation_catalog_integrity_issues_and_catalog_go_to_navigation_support.md`
- `src/store/reducer/networkReducer.ts`
- `src/store/sampleNetwork.ts`
- `src/tests/store.reducer.networks.spec.ts`
- `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
