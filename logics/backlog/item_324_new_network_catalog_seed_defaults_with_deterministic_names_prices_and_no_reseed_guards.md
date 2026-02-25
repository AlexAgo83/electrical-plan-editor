## item_324_new_network_catalog_seed_defaults_with_deterministic_names_prices_and_no_reseed_guards - New-Network Catalog Seed Defaults with Deterministic Names/Prices and No-Reseed Guards
> From version: 0.9.5
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Seed exactly three default catalog items on new network creation with deterministic names and prices
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Catalog-first creation adds friction on brand-new networks because the catalog starts empty. Users cannot immediately create connectors/splices without first creating catalog items.

# Scope
- In:
  - Seed exactly three default catalog items on brand-new network creation only.
  - Enforce mandated V1 seed refs/names/counts:
    - `CAT-2W-STD` / `2-way standard connector` / `2`
    - `CAT-6P-STD` / `6-port standard splice` / `6`
    - `CAT-8W-STD` / `8-way standard connector` / `8`
  - Seed mandated deterministic prices:
    - `5.00`, `8.50`, `12.00`
  - Ensure seeds are regular catalog items (editable/deletable subject to existing guards).
  - Add no-reseed guards for load/migration/import/switch paths.
- Out:
  - Dynamic/customer-specific seed catalogs.
  - Template selection UI.

# Acceptance criteria
- New network creation seeds exactly three deterministic catalog items with mandated refs, names, counts, and prices.
- Seeds are immediately usable for connector/splice creation.
- Existing load/migration/import flows do not inject seeds.
- Seeding is deterministic and non-duplicating for the same newly created network.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_054`, `req_051`.
- Blocks: item_325, item_332.
- Related AC: AC1-AC5, AC7, AC8.
- References:
  - `logics/request/req_054_default_seed_catalog_items_on_new_network_creation_for_catalog_first_bootstrap.md`
  - `src/store/reducer/networkReducer.ts`
  - `src/store/networking.ts`

