## item_312_catalog_persistence_migration_legacy_bootstrap_and_import_fallback_resolution - Catalog Persistence Migration, Legacy Bootstrap, and Import Fallback Resolution
> From version: 0.9.4
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: High
> Theme: Backward-compatible catalog backfill from legacy connectors/splices on load and import
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Older saved workspaces and imported networks predate `Catalog`. Without migration/defaulting and fallback bootstrap, legacy connectors/splices with manufacturer references and way/port counts cannot be resolved to the new catalog-first model.

# Scope
- In:
  - Add migration/defaulting support for network-scoped catalog data.
  - Implement legacy bootstrap from existing connectors/splices (`manufacturerReference` + `cavityCount`/`portCount` -> catalog item).
  - Resolve bootstrapped/matching catalog items to connector/splice `catalogItemId` where possible.
  - Apply fallback logic on persisted load/migration and import of older data.
  - Implement deterministic collision handling for duplicate manufacturer references with differing counts (stable suffix strategy).
  - Prevent duplicate churn across repeated load/import passes.
- Out:
  - Catalog UI CRUD and navigation.
  - Connector/splice form UX integration (except data resolution contract).

# Acceptance criteria
- Legacy saved workspaces load safely and bootstrap missing catalog items from connectors/splices.
- Imported older networks/workspaces apply the same bootstrap/resolution behavior.
- Collision handling generates deterministic unique manufacturer references (e.g. legacy suffix format).
- Legacy entities resolve to `catalogItemId` when matching/bootstrapped catalog items exist.
- Repeated loads/imports do not generate duplicate catalog churn.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_051`, item_311.
- Blocks: item_314, item_317, item_318.
- Related AC: AC8, AC8a, AC11, AC15.
- References:
  - `logics/request/req_051_catalog_screen_with_catalog_item_crud_navigation_integration_and_required_manufacturer_reference_connection_count.md`
  - `src/adapters/persistence/migrations.ts`
  - `src/adapters/persistence/localStorage.ts`
  - `src/store/reducer/networkReducer.ts`
  - `src/store/networking.ts`

