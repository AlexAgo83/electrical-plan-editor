# Core Domain Contracts (V1 Foundation)

This folder defines the logic-level entity contracts used by the V1 store.

## Entities

- `Connector`: functional endpoint with indexed cavities.
- `Splice`: electrical junction with indexed ports.
- `NetworkNode`: graph node (`connector`, `splice`, `intermediate`).
- `Segment`: weighted edge (`lengthMm`) connecting two nodes.
- `Wire`: electrical link between two endpoints with computed route metadata.

## IDs

Each entity uses a branded string ID type (`ConnectorId`, `SpliceId`, `NodeId`, `SegmentId`, `WireId`) to keep reducer and selector contracts explicit.

## Schema

`schema.ts` defines `APP_SCHEMA_VERSION` for persistence compatibility.

## Graph Index

`graph.ts` provides `buildRoutingGraphIndex(...)` to construct a bidirectional adjacency index from nodes and segments.
This index is used by selectors and is the baseline for shortest-path routing in upcoming items.

## Shortest Path

`pathfinding.ts` provides `findShortestRoute(...)` with V1 deterministic rules:
- shortest total length first,
- then fewer segments on equal length,
- then stable segment ID ordering as fallback tie-break.
