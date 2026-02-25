## req_054_default_seed_catalog_items_on_new_network_creation_for_catalog_first_bootstrap - Default Seed Catalog Items on New Network Creation for Catalog-First Bootstrap
> From version: 0.9.5
> Understanding: 96%
> Confidence: 95%
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
- Automatically create `2-3` realistic default `Catalog` items when a **new network** is created.
- Keep seeds network-scoped and editable/deletable by users.
- Avoid reseeding on existing networks, imports, loads, or migrations.

# Functional scope
## A. Default catalog seed on new network creation (high priority)
- On creation of a brand-new network (new workspace flow or adding a new network), initialize the network-scoped `Catalog` with a small default set of catalog items.
- Seed count target:
  - minimum `2`
  - recommended `3`
- Seeded items must satisfy all `req_051` catalog constraints:
  - unique `manufacturerReference` per network
  - valid `connectionCount` integer `>= 1`
  - optional fields may be omitted or provided with realistic placeholders

## B. Seed content characteristics (high priority)
- Seed items should be realistic but generic (not tied to a customer-specific brand catalog).
- Recommended V1 mix:
  - at least one low connection-count item (e.g. `2`)
  - at least one medium connection-count item (e.g. `6` or `8`)
  - optionally one alternate shape for splice-like usage (still generic catalog item)
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
  - creating a new network seeds `2-3` catalog items
  - seeded items are valid per `req_051` constraints (`manufacturerReference`, `connectionCount`)
  - import/load/migration paths do not inject default seeds into existing data
  - connector/splice creation can use seeded catalog items immediately
  - deleting all seeded items re-exposes catalog-first empty-state guidance (no hidden reseed)

# Acceptance criteria
- AC1: Creating a brand-new network initializes a default network-scoped catalog with `2-3` valid catalog items.
- AC2: Seeded catalog items are immediately usable by connector/splice creation flows.
- AC3: Default seed items are editable/deletable like regular catalog items (subject to existing reference guards).
- AC4: Existing network load, migration, and import flows do not auto-inject default catalog seed items.
- AC5: Seed generation is deterministic and does not duplicate items for the same newly created network.
- AC6: Regression tests cover both seeded new-network behavior and no-reseed import/load behavior.

# Out of scope
- Customer-specific seed catalogs or template selection UI.
- Locale/currency-specific pricing presets for seeded items.
- Dynamic seed catalogs by project type.

# References
- `logics/request/req_051_catalog_screen_with_catalog_item_crud_navigation_integration_and_required_manufacturer_reference_connection_count.md`
- `logics/request/req_053_validation_catalog_integrity_issues_and_catalog_go_to_navigation_support.md`
- `src/store/reducer/networkReducer.ts`
- `src/store/sampleNetwork.ts`
- `src/tests/store.reducer.networks.spec.ts`
- `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
