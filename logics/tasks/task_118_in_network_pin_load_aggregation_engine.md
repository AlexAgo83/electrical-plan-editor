## task_118_in_network_pin_load_aggregation_engine - In-network pin load aggregation engine

> From version: 1.13.1
> Schema version: 1.0
> Status: Ready
> Understanding: 75%
> Confidence: 70%
> Progress: 0%
> Complexity: Large
> Theme: Electrical analysis / Diagnostics
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Definition of Done (DoD)
- [ ] New pure module `src/core/pinElectricalLoad.ts` exporting `computePinElectricalLoad(input, scope, options?)`.
- [ ] `PinElectricalLoadScope` discriminated union with `currentNetwork` arm implemented and `assembly` arm declared but throwing `NotImplemented` (delivered by `item_614`).
- [ ] Outputs: `pinLoadByConnectorPin`, `branchLoadByWire`, `deviceBalance`, `fuseProtectedLoad`, `warnings` (loops).
- [ ] Splice and fuse-box pair propagation respects Kirchhoff conservation.
- [ ] Bidirectional pins contribute to both source and consumer aggregates and are excluded from no-source detection.
- [ ] Cycle-safe traversal keyed by `(connectorId, cavityIndex)`; one warning per loop, no throw.
- [ ] Engine is referentially transparent: stable outputs across identical inputs.
- [ ] Unit tests for empty / passive-only network, linear chain, splice fan-out, fuse-box pair, ECU asymmetric device, loop, bidirectional pin, regression on `sampleNetwork.ts`.

# Backlog
- `item_610_in_network_pin_load_aggregation_engine`

# Acceptance criteria
See `item_610_in_network_pin_load_aggregation_engine` AC1–AC10. The task mirrors them 1:1.

# Implementation Plan

## Step 1 — Module skeleton + types
- New file: `src/core/pinElectricalLoad.ts`.
- Public types:
  ```ts
  export type PinElectricalLoadScope =
    | { kind: "currentNetwork" }
    | { kind: "assembly"; networkIds: NetworkId[] };

  export interface ResolvedPinLoad {
    role: PinElectricalRoleKind;
    currentA?: number;
  }

  export interface BranchLoad {
    wireId: WireId;
    continuousA: number;
    sourceRefs: ConnectorPinRef[];
    consumerRefs: ConnectorPinRef[];
  }

  export interface DeviceBalance {
    totalSourceA: number;
    totalConsumerA: number;
    supplyPins: number[];
    sourcePins: number[];
  }

  export interface PinElectricalLoadResult {
    pinLoadByConnectorPin: Map<string, ResolvedPinLoad>;
    branchLoadByWire: Map<WireId, BranchLoad>;
    deviceBalance: Map<ConnectorId, DeviceBalance>;
    fuseProtectedLoad: Map<string, number>;
    warnings: EngineWarning[];
  }
  ```

## Step 2 — Scope dispatch
- `computePinElectricalLoad` routes to `computeCurrentNetwork` or throws `NotImplemented` for `assembly`.

## Step 3 — currentNetwork implementation
- Build adjacency: for each wire, two endpoints with their `(connectorId, cavityIndex)` or `(spliceId, portIndex)`.
- Resolve each pin role via `resolvePinElectricalRole` (from `item_608`).
- Traverse from each declared source/consumer pin BFS through splices and fuse-box pairs, summing `currentA` along the way.
- Accumulate per-wire continuous current as the directed sum of source contributions reaching that wire (with consumer contributions on the other side cross-checked for Kirchhoff).
- Track visited scoped pins; on revisit, emit a loop warning and abort that branch.
- Compute `deviceBalance` per connector by summing declared source vs. consumer currents across its declared pins.
- Compute `fuseProtectedLoad` for each wire with `protection.kind = "fuse"` (sum on the downstream side) and each fuse-box pair on the protected side.

## Step 4 — Tests
- `src/tests/core.pin-electrical-load.spec.ts`:
  - empty network → empty outputs;
  - passive-only network → empty outputs;
  - linear chain [source 10 A] -- wire -- [consumer 10 A] → 10 A on wire, balanced device sides;
  - splice fan-out → 10 A in, 4/6 A out;
  - fuse-box pair → protected sum on protected side;
  - ECU asymmetric → device balance per spec;
  - loop → single warning, no throw;
  - bidirectional pin → counts on both sides, excluded from no-source detection;
  - regression: shipped sample networks produce empty diagnostic outputs.

## Step 5 — Determinism
- Sort iteration over connectors / splices / wires / pairs by stable IDs.
- Deeply equal output on repeated calls.

# Validation
- `python3 -m logics_manager lint --require-status`
- `npm run -s lint && npm run -s typecheck`
- `npx vitest run src/tests/core.pin-electrical-load.spec.ts`
- Then `npm run ci:blocking`.

# Report
- TBD on completion.

# AI Context
- Summary: Pure aggregation engine producing per-wire / per-fuse / per-device loads from declared pin roles. currentNetwork scope only in this task; assembly arm delivered in `item_614`.
- Keywords: aggregation, pin load, branch load, fuse protected load, splice pass-through, fuse-box pass-through, cycle-safe, scope, currentNetwork

# Links
- Request: `req_133_pin_level_source_consumer_currents_and_harness_dimensioning_diagnostics`
- Product brief(s): `docs/pin-level-source-consumer-currents-product-brief.md`
- Architecture decision(s): `adr_010_inter_network_current_bridge_semantics`
