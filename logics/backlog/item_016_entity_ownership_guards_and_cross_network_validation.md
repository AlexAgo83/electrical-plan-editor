## item_016_entity_ownership_guards_and_cross_network_validation - Entity Ownership Guards and Cross-Network Validation
> From version: 0.1.0
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: High
> Theme: Multi-Network Integrity Rules
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Adding multiple networks without strict ownership guards would allow invalid cross-network references, causing corrupted routing paths, false occupancy conflicts, and unreliable validation.

# Scope
- In:
  - Enforce network ownership checks on entity references and route computations.
  - Prevent creation/update flows that link endpoints across different networks.
  - Scope occupancy and routing validation strictly to active network data.
  - Add validation issue signals for invalid ownership/reference states.
- Out:
  - New routing algorithms.
  - Cross-network interoperability features.

# Acceptance criteria
- Cross-network entity links are rejected deterministically in reducer/action flows.
- Wire routing only uses segments and nodes owned by the same network as the wire.
- Occupancy reports only include entities from active network scope.
- Validation view never mixes issues from unrelated networks.

# Priority
- Impact: Very high (data correctness and safety).
- Urgency: High in same wave as partitioned model rollout.

# Notes
- Dependencies: item_004, item_005, item_008, item_014.
- Blocks: item_019.
- Related AC: AC2, AC3, AC7.
- References:
  - `logics/request/req_002_multi_network_management_and_navigation.md`
  - `src/store/reducer.ts`
  - `src/store/selectors.ts`
  - `src/core/routing.ts`
  - `src/tests/store.reducer.spec.ts`

