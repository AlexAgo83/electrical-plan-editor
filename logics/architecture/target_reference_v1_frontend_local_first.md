# Target Reference Architecture - V1 (Frontend local-first)

## Purpose
This document defines the target technical baseline used to kick off V1 of the electrical plan editor.
It is a reference architecture for implementation decisions and backlog/task generation.

## Scope and constraints
- Scope: frontend application for logical electrical network modeling and wire routing.
- Persistence: local-only storage for V1.
- Excluded for V1: backend API, cloud sync, multi-user auth, server database.

## Target stack (reference)
- Runtime: Node.js 20+
- Language: TypeScript (strict)
- App/UI: React 19
- Build/dev server: Vite
- Styling: custom CSS
- Graph rendering: SVG/Canvas in React layer (no 3D engine in V1)
- State management: local app store with pure domain reducers/selectors
- Persistence: browser localStorage with versioned save schema
- Testing: Vitest + Testing Library (unit/integration), Playwright (E2E smoke)
- Quality gates: ESLint + TypeScript typecheck + coverage in CI

## Architecture principles
- Local-first: all user data is editable and persisted locally without network dependency.
- Domain-first: routing and electrical rules live in pure TypeScript modules (no DOM coupling).
- Deterministic behavior: identical input state always produces identical route/length results.
- Explicit versioning: saved state is schema-versioned with migration path.
- Incremental delivery: feature slices must map to request/backlog/task docs.

## Layered architecture
- `src/core`
Pure domain logic:
network graph model, wire model, pathfinding, route locking, length computation, validation rules.
- `src/store`
State container:
actions, reducer orchestration, selectors, persistence bridge, subscriptions.
- `src/app`
React UI:
network view, connector view, splice view, forms/edition workflows, selection/highlight behavior.
- `src/adapters/persistence`
Local storage adapter:
serialize/deserialize/migrate app state and enforce schema version checks.
- `src/tests` and `tests/e2e`
Validation at domain, integration, and E2E levels.

## Core domain model (V1)
- `Connector`
`id`, `name`, `cavityCount`, indexed cavities, single occupancy rule per cavity.
- `Splice`
`id`, `name`, indexed ports, single occupancy rule per port.
- `NetworkNode`
union of connector node, splice node, intermediate node.
- `Segment`
`id`, `nodeA`, `nodeB`, `lengthMm` (manual input), optional subgroup tag for visual grouping.
- `WireEndpoint`
connector+cavity or splice+port.
- `Wire`
`id`, `name`, endpoint A/B, computed route, computed length, optional forced route lock.

## Routing and length strategy
- Pathfinding algorithm: Dijkstra on weighted graph (`lengthMm` as weight).
- Default route: shortest path between endpoint nodes.
- Tie-break rule: on equal total length, choose route with fewer segments.
- Determinism rule: if still tied, choose stable order by sorted segment IDs.
- Forced route:
user can lock a valid alternative route; lock remains until explicit reset.
- Length rule:
wire length = sum of traversed segment lengths only.

## State and persistence strategy
- Single app state tree with normalized entities (`connectors`, `splices`, `nodes`, `segments`, `wires`).
- Persisted format includes:
`schemaVersion`, timestamps, entities, UI selection snapshot (optional).
- Migration policy:
each schema bump must provide a migration function from previous version.
- Recompute policy:
segment update triggers recalculation of impacted wires before state commit.

## UI architecture baseline (V1)
- Global network view:
nodes + segments + sub-network grouping, selectable entities, wire highlight.
- Connector view:
cavity occupancy + connected wire table + destination + length.
- Splice view:
port occupancy + connected wire table + destination + length.
- Interaction rules:
wire selection highlights complete routed path; occupied ports/cavities are visibly flagged.

## Validation baseline
- Unit tests:
pathfinding, tie-break, forced-route validation, occupancy constraints.
- Integration tests:
segment length update propagates to affected wire lengths (AC1).
- UI tests:
connector/splice occupancy visibility and wire route highlighting (AC4/AC5/AC6).
- E2E smoke:
create network, create wire, auto-route, force-route, verify displayed length.

## Non-goals for V1
- 2D/3D geometric autorouting from coordinates.
- Bend radius and harness physical constraints.
- Bundle diameter/sheath management.
- Slack/connectors margin/rounding policies.
- Backend, auth, cloud persistence, advanced industrial exports.

## Kickoff checklist
- Confirm folder/module skeleton (`core`, `store`, `app`, `adapters/persistence`).
- Freeze V1 entity and save schemas.
- Implement first deterministic pathfinding slice.
- Implement local persistence adapter with schema version field.
- Link kickoff request to first backlog item and execution task.
