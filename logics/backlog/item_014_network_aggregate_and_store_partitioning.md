## item_014_network_aggregate_and_store_partitioning - Network Aggregate and Store Partitioning
> From version: 0.1.0
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: High
> Theme: Multi-Network Domain Model
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The current state model is single-network by construction, so all entities share one implicit global scope. This blocks real multi-program workflows and causes cross-context ambiguity.

# Scope
- In:
  - Introduce a first-class `Network` aggregate in domain entities and store contracts.
  - Partition all model entities by `networkId` ownership (`Connector`, `Splice`, `Node`, `Segment`, `Wire`).
  - Add `activeNetworkId` to state and selectors as the primary read/write context.
  - Update reducers/actions to enforce active-scope writes and deterministic selection fallback.
- Out:
  - UI polish for network management actions.
  - Persistence migration implementation details (handled in dedicated item).

# Acceptance criteria
- `Network` entity and IDs are defined in strict TypeScript and integrated in store types.
- All entity collections are resolved through active network scope with no implicit global fallback.
- Reducer actions cannot create/update/delete entities without an explicit network ownership path.
- Selectors expose active-network scoped lists and summaries used by app views.

# Priority
- Impact: Very high (foundational for all multi-network behavior).
- Urgency: Immediate (must be delivered first).

# Notes
- Dependencies: item_000, item_007.
- Blocks: item_015, item_016, item_017, item_018.
- Related AC: AC1, AC2, AC3, AC6.
- References:
  - `logics/request/req_002_multi_network_management_and_navigation.md`
  - `logics/architecture/target_reference_v1_frontend_local_first.md`
  - `src/core/entities.ts`
  - `src/store/types.ts`
  - `src/store/actions.ts`
  - `src/store/reducer.ts`
  - `src/store/selectors.ts`

