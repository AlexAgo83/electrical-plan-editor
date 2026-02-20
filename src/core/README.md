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
