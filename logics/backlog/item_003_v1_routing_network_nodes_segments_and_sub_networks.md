## item_003_v1_routing_network_nodes_segments_and_sub_networks - V1 Routing Network Nodes Segments and Sub Networks
> From version: 0.1.0
> Understanding: 96%
> Confidence: 94%
> Progress: 0%
> Complexity: High
> Theme: Electrical CAD
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Shortest-path and wire length calculation cannot work without an explicit routing graph built from nodes and weighted segments.

# Scope
- In:
  - Model network nodes: connector nodes, splice nodes, intermediate nodes.
  - Create/edit/delete segments between exactly two nodes.
  - Manual segment length input (`lengthMm`).
  - Sub-network logical grouping metadata (visual only in V1).
  - Build graph index consumable by routing engine.
- Out:
  - Geometric auto-generation of segments from coordinates.
  - Physical bundle and harness constraints.

# Acceptance criteria
- Segment creation enforces exactly two endpoint nodes.
- Segment length updates are persisted in graph state.
- Graph can be queried for shortest-path computation.
- Sub-network grouping is visible and does not alter computed route cost.

# Priority
- Impact: Very high (hard dependency for AC1/AC2/AC3).
- Urgency: Immediate after core foundation.

# Notes
- Dependencies: item_000, item_001, item_002.
- Blocks: item_004, item_005.
- References:
  - `logics/architecture/target_reference_v1_frontend_local_first.md`
