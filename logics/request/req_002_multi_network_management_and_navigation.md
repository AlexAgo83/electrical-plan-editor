## req_002_multi_network_management_and_navigation - Multi-Network Management and Navigation
> From version: 0.1.0
> Understanding: 98%
> Confidence: 96%
> Complexity: High
> Theme: Multi-Network Architecture
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Move from a single implicit network model to explicit multi-network management.
- Allow users to create multiple electrical networks, switch between them quickly, and keep each network isolated.
- Preserve existing behavior (routing, occupancy, validation, persistence) inside each selected network.

# Context
Current behavior assumes all entities belong to one shared network. This limits real usage where multiple vehicle/program variants, zones, or project alternatives must be modeled in parallel.

This request introduces a first-class `Network` aggregate and active-network navigation, while preserving local-first behavior and deterministic routing.

Architecture reference to preserve:
- `logics/architecture/target_reference_v1_frontend_local_first.md`

## Objectives
- Add network lifecycle management (`create`, `rename`, `delete`, `duplicate`).
- Introduce an explicit active network context for all modeling and analysis views.
- Guarantee strict data isolation between networks for entities and validations.
- Keep usability high with fast navigation and clear active scope.

## Functional Scope
### Network aggregate
- Add a `Network` entity with at least:
  - `name`
  - `technicalId` (unique)
  - `description` (optional)
  - timestamps (`createdAt`, `updatedAt`)
- A network contains its own connectors, splices, nodes, segments, wires, and view/layout state.
- `technicalId` must be immutable after creation in this scope (rename applies to `name` only).

### Network lifecycle
- Users can create a network from scratch.
- Users can duplicate an existing network (deep copy with new network identity).
- Users can rename a network.
- Users can delete a network with confirmation.
- Deleting the active network must switch to a deterministic fallback (first by creation date, then lexical `technicalId` tie-break).
- The app must always keep exactly one active network when at least one network exists.

### Active network navigation
- Add a persistent network selector visible in the main workspace.
- Switching active network updates all lists, inspector content, canvas, and validation views to that network scope.
- URL/state can encode the active network so refresh preserves context.
- If no network exists, show an explicit empty state with `Create network` primary action.

### Isolation and domain rules
- Connectors, splices, nodes, segments, and wires are owned by exactly one network.
- Cross-network references are forbidden.
- Routing and occupancy are computed only within the active network graph.
- Validation must report issues per network; no cross-network contamination.

### Persistence and schema evolution
- Persist a collection of networks plus `activeNetworkId`.
- Existing single-network saved data must migrate automatically into a default network during load.
- Migration must preserve all prior entities and route locks.

### UX behavior
- Network selector shows `name` and `technicalId`.
- Provide quick actions near selector: `New`, `Duplicate`, `Rename`, `Delete`.
- Show active network badge in key headers (lists, canvas, validation panel) to avoid context confusion.

## Acceptance criteria
- AC1: Users can create at least two networks and switch between them without data leakage.
- AC2: Editing entities in network A never changes entities in network B.
- AC3: Routing and occupancy calculations are scoped to the active network only.
- AC4: Deleting the active network automatically switches to a deterministic fallback active network.
- AC5: Existing single-network persisted data is migrated and loaded into a valid network without loss.
- AC6: Refresh/reload restores the same active network when it still exists.
- AC7: Validation view can target issues by active network and does not display unrelated issues.

## Non-functional requirements
- No regression on deterministic route computation and tie-break logic.
- Keep local-first behavior and persistence reliability.
- Maintain desktop/laptop usability with quick network switching.
- Preserve existing test categories (`lint`, `typecheck`, `unit`, `integration`, `e2e`).

## Out of scope
- Multi-user collaboration on shared networks.
- Network version history/time-travel beyond current undo/redo.
- Cross-network route optimization or inter-network connectors.
- Cloud sync and remote storage.

# Backlog
- To create from this request:
  - `item_014_network_aggregate_and_store_partitioning.md`
  - `item_015_network_selector_and_active_scope_navigation.md`
  - `item_016_entity_ownership_guards_and_cross_network_validation.md`
  - `item_017_persistence_migration_single_to_multi_network.md`
  - `item_018_network_lifecycle_actions_duplicate_delete_fallback.md`
  - `item_019_multi_network_test_matrix_and_regression_coverage.md`

# References
- `logics/request/req_000_kickoff_v1_electrical_plan_editor.md`
- `logics/request/req_001_v1_ux_ui_operator_workspace.md`
- `logics/tasks/task_002_multi_network_orchestration_and_delivery_control.md`
- `README.md`
