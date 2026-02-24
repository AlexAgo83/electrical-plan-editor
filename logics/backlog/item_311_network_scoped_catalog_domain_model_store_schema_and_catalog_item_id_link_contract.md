## item_311_network_scoped_catalog_domain_model_store_schema_and_catalog_item_id_link_contract - Network-Scoped Catalog Domain Model, Store Schema, and catalogItemId Link Contract
> From version: 0.9.4
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: High
> Theme: Introduce network-scoped catalog entities and ID-based linking contract for connector/splice integration
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`req_051` requires a new `Catalog` concept scoped to each network, with connectors/splices linking by `catalogItemId` instead of persisting a free-text manufacturer reference. The store schema and domain contracts do not currently support this.

# Scope
- In:
  - Add a network-scoped catalog entity collection (e.g. `catalogItems`) to persisted state.
  - Define catalog item shape (`manufacturerReference`, `connectionCount`, optional metadata).
  - Enforce explicit data constraints in schema/domain logic (unique manufacturer reference per network, integer connection count >= 1).
  - Extend connector/splice models or network-scoped representations to support `catalogItemId` links for new flows.
  - Define the contract for ID-based linking (catalog item reference, no free-text manufacturer reference for new entities).
- Out:
  - Legacy fallback migration/bootstrap behavior (handled in dedicated item).
  - UI screens/forms and navigation wiring.

# Acceptance criteria
- A network-scoped catalog entity collection exists in the store/persistence model.
- Catalog item schema supports required and optional fields from `req_051`.
- Explicit data constraints are represented in implementation contracts.
- Connector/splice persistence contracts support `catalogItemId` linkage for new flows.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_051`.
- Blocks: item_312, item_313, item_314, item_315, item_316, item_317, item_318.
- Related AC: AC5-AC7, AC9-AC11.
- References:
  - `logics/request/req_051_catalog_screen_with_catalog_item_crud_navigation_integration_and_required_manufacturer_reference_connection_count.md`
  - `src/store/types.ts`
  - `src/store/actions.ts`
  - `src/store/reducer/networkReducer.ts`
  - `src/store/networking.ts`

