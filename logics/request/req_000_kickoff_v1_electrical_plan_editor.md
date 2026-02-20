## req_000_kickoff_v1_electrical_plan_editor - Kickoff V1 Electrical Plan Editor
> From version: 0.1.0
> Understanding: 95%
> Confidence: 93%
> Complexity: High
> Theme: Electrical CAD
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Build a V1 electrical plan editor to model connectors, routing segments, and splices as a graph-based network.
- Create wires on top of that network and compute their length automatically from segment lengths.
- Support automatic shortest-path routing and user-defined forced routes (locked until reset).
- Treat splices as first-class electrical nodes where wires can start/end and branch.
- Provide operational synthesis views (global network, per connector, per splice).

# Context
This request defines a logic-first V1 (no geometric/3D computation yet). Segment lengths are entered manually and used to compute wire lengths dynamically.

## Objectives
- Model connectors and their cavities/ways.
- Model splices and their indexed ports.
- Build a routing network from nodes and segments.
- Create wires between connector cavities and/or splice ports.
- Recompute wire lengths automatically when segment lengths change.
- Provide synthesis views usable for design and review.

## Functional Scope
### Connectors
- A connector has a functional name, a unique technical ID, and an indexed number of cavities.
- Cavity-level occupancy is visible.
- Visual representation is a simplified cavity grid/table.

### Splices
- A splice is an electrical junction node.
- A splice has a name, a unique technical ID, and indexed ports (for example `S1-P1`, `S1-P2`).
- A splice can have more than two connections.
- A wire can start or end on a splice port.
- Visual representation must be distinct from connectors and show branch count.

### Routing network
- Nodes are connectors, splices, and intermediate logical nodes.
- A segment connects exactly two nodes.
- Each segment has a manually entered length (for example 120 mm).
- The network graph must remain connected enough for route computation.
- V1 sub-networks are visual/logical grouping only (no impact on path calculation).

### Wires
- A wire has a functional name, a unique technical ID, endpoint A, endpoint B.
- Each endpoint can be either connector+cavity or splice+port.
- Connector cavities are single-occupancy in V1 (unless future rule overrides it).
- Splice ports are single-occupancy in V1.
- Default routing uses shortest path.
- User can define and lock an alternative path.
- Deterministic tie-break: if equal distance, prefer the route with fewer segments.
- Wire length equals the sum of traversed segment lengths (no slack, no connector margin, no rounding in V1).

### Synthesis views
- Global network view with nodes, segments, and sub-networks.
- Connector view with connected wires, destination, source/destination cavities, computed length.
- Splice view with connected wires, used port, destination, computed length.
- Selecting a wire highlights the full routed path.

## Acceptance criteria
- AC1: Changing a segment length updates all impacted wire lengths automatically.
- AC2: Creating a wire proposes the shortest path automatically.
- AC3: A user can force and lock an alternative route.
- AC4: Connector view reflects cavity occupancy in real time.
- AC5: Splice view reflects port occupancy in real time.
- AC6: Selecting a wire highlights its complete path.

## Out of scope (V1)
- Automatic geometric routing from 2D/3D coordinates.
- Bend radius constraints.
- Bundle diameter/sheath handling.
- Slack/connectors margin rules.
- Advanced industrial export (detailed BOM, manufacturer standard outputs).