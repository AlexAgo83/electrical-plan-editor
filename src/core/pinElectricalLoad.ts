import type {
  CatalogItem,
  CatalogItemId,
  Connector,
  ConnectorId,
  FuseBoxPair,
  NetworkId,
  PinElectricalRole,
  PinElectricalRoleKind,
  Splice,
  SpliceId,
  Wire,
  WireId
} from "./entities";
import { resolvePinElectricalRoleDescriptor } from "./pinElectricalRole";

export interface ConnectorPinRef {
  connectorId: ConnectorId;
  cavityIndex: number;
}

export interface ResolvedPinLoad {
  connectorId: ConnectorId;
  cavityIndex: number;
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
  connectorId: ConnectorId;
  totalSourceA: number;
  totalConsumerA: number;
  supplyPins: number[];
  sourcePins: number[];
}

export interface FuseProtectedLoadEntry {
  key: string;
  kind: "wireFuse" | "fuseBoxPair";
  continuousA: number;
}

export type EngineWarningCode = "loop" | "kirchhoff";

export interface EngineWarning {
  code: EngineWarningCode;
  message: string;
  participants?: ConnectorPinRef[];
}

export interface PinElectricalLoadResult {
  pinLoadByConnectorPin: Map<string, ResolvedPinLoad>;
  branchLoadByWire: Map<WireId, BranchLoad>;
  deviceBalance: Map<ConnectorId, DeviceBalance>;
  fuseProtectedLoad: Map<string, FuseProtectedLoadEntry>;
  warnings: EngineWarning[];
}

export type PinElectricalLoadScope =
  | { kind: "currentNetwork" }
  | { kind: "assembly"; networkIds: NetworkId[] };

export interface PinElectricalLoadInput {
  networkId?: NetworkId;
  connectors: readonly Connector[];
  splices: readonly Splice[];
  wires: readonly Wire[];
  catalogItemsById: ReadonlyMap<CatalogItemId, CatalogItem>;
}

export class NotImplementedScopeError extends Error {
  constructor(kind: string) {
    super(`pinElectricalLoad scope '${kind}' is not implemented yet`);
    this.name = "NotImplementedScopeError";
  }
}

function pinKey(connectorId: ConnectorId, cavityIndex: number): string {
  return `${connectorId}:${cavityIndex}`;
}

function fuseBoxPairKey(connectorId: ConnectorId, pairIndex: number): string {
  return `fuseBoxPair:${connectorId}:${pairIndex}`;
}

interface AdjacencyEntry {
  wireId?: WireId;
  to: WireEndpointKey;
}

type WireEndpointKey =
  | { kind: "connectorCavity"; connectorId: ConnectorId; cavityIndex: number }
  | { kind: "splicePort"; spliceId: SpliceId; portIndex: number };

function keyOf(endpoint: WireEndpointKey): string {
  if (endpoint.kind === "connectorCavity") {
    return `c:${endpoint.connectorId}:${endpoint.cavityIndex}`;
  }
  return `s:${endpoint.spliceId}:${endpoint.portIndex}`;
}

function wireEndpointToKey(endpoint: Wire["endpointA"]): WireEndpointKey {
  if (endpoint.kind === "connectorCavity") {
    return {
      kind: "connectorCavity",
      connectorId: endpoint.connectorId,
      cavityIndex: endpoint.cavityIndex
    };
  }
  return { kind: "splicePort", spliceId: endpoint.spliceId, portIndex: endpoint.portIndex };
}

function buildAdjacency(input: PinElectricalLoadInput): {
  adjacency: Map<string, AdjacencyEntry[]>;
  endpointByKey: Map<string, WireEndpointKey>;
  fuseBoxPairsByConnector: Map<ConnectorId, FuseBoxPair[]>;
} {
  const adjacency = new Map<string, AdjacencyEntry[]>();
  const endpointByKey = new Map<string, WireEndpointKey>();

  function pushEdge(from: WireEndpointKey, to: WireEndpointKey, wireId?: WireId): void {
    const fromKey = keyOf(from);
    const toKey = keyOf(to);
    endpointByKey.set(fromKey, from);
    endpointByKey.set(toKey, to);
    if (!adjacency.has(fromKey)) {
      adjacency.set(fromKey, []);
    }
    adjacency.get(fromKey)!.push({ wireId, to });
  }

  // Wires: connect both endpoints
  for (const wire of input.wires) {
    const a = wireEndpointToKey(wire.endpointA);
    const b = wireEndpointToKey(wire.endpointB);
    pushEdge(a, b, wire.id);
    pushEdge(b, a, wire.id);
  }

  // Splices: each splice port is a separate endpoint key; bind them as a star around the splice
  // (every port talks to every other port through Kirchhoff).
  const portCountBySplice = new Map<SpliceId, number>();
  for (const splice of input.splices) {
    portCountBySplice.set(splice.id, splice.portCount);
  }
  // Determine which ports are actually used by inspecting wire endpoints
  const splicePortsInUse = new Map<SpliceId, Set<number>>();
  for (const wire of input.wires) {
    for (const ep of [wire.endpointA, wire.endpointB]) {
      if (ep.kind === "splicePort") {
        if (!splicePortsInUse.has(ep.spliceId)) {
          splicePortsInUse.set(ep.spliceId, new Set());
        }
        splicePortsInUse.get(ep.spliceId)!.add(ep.portIndex);
      }
    }
  }
  for (const [spliceId, ports] of splicePortsInUse) {
    const arr = [...ports];
    for (let i = 0; i < arr.length; i += 1) {
      for (let j = 0; j < arr.length; j += 1) {
        if (i === j) {
          continue;
        }
        pushEdge(
          { kind: "splicePort", spliceId, portIndex: arr[i]! },
          { kind: "splicePort", spliceId, portIndex: arr[j]! }
        );
      }
    }
  }

  // Fuse-box pairs: bridge cavity A and cavity B of each pair on the connector
  const fuseBoxPairsByConnector = new Map<ConnectorId, FuseBoxPair[]>();
  for (const connector of input.connectors) {
    if (!connector.catalogItemId) {
      continue;
    }
    const catalogItem = input.catalogItemsById.get(connector.catalogItemId);
    const fusePairs =
      connector.fusePairOverrides ?? catalogItem?.fuseBoxConfig?.pairs ?? undefined;
    if (!fusePairs || fusePairs.length === 0) {
      continue;
    }
    fuseBoxPairsByConnector.set(connector.id, fusePairs);
    for (const pair of fusePairs) {
      pushEdge(
        { kind: "connectorCavity", connectorId: connector.id, cavityIndex: pair.pinA },
        { kind: "connectorCavity", connectorId: connector.id, cavityIndex: pair.pinB }
      );
      pushEdge(
        { kind: "connectorCavity", connectorId: connector.id, cavityIndex: pair.pinB },
        { kind: "connectorCavity", connectorId: connector.id, cavityIndex: pair.pinA }
      );
    }
  }

  return { adjacency, endpointByKey, fuseBoxPairsByConnector };
}

function isPassThroughEndpoint(endpoint: WireEndpointKey): boolean {
  return endpoint.kind === "splicePort";
}

interface PropagationResult {
  reachedConsumers: Array<{ ref: ConnectorPinRef; currentA: number }>;
  traversedWireIds: Set<WireId>;
  fuseBoxPairsTraversed: Array<{ connectorId: ConnectorId; pairIndex: number }>;
  loops: ConnectorPinRef[][];
}

function propagateFromSource(
  startEndpoint: WireEndpointKey,
  adjacency: Map<string, AdjacencyEntry[]>,
  pinLoadByKey: Map<string, ResolvedPinLoad>,
  fuseBoxPairsByConnector: Map<ConnectorId, FuseBoxPair[]>
): PropagationResult {
  const result: PropagationResult = {
    reachedConsumers: [],
    traversedWireIds: new Set(),
    fuseBoxPairsTraversed: [],
    loops: []
  };
  const visited = new Set<string>([keyOf(startEndpoint)]);
  const queue: WireEndpointKey[] = [startEndpoint];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentKey = keyOf(current);
    const neighbors = adjacency.get(currentKey) ?? [];
    for (const neighbor of neighbors) {
      const toKey = keyOf(neighbor.to);
      if (visited.has(toKey)) {
        if (neighbor.wireId === undefined && current.kind === "connectorCavity" && neighbor.to.kind === "connectorCavity") {
          // Loop within a fuse-box pair on the same connector — note once
        }
        continue;
      }
      visited.add(toKey);
      if (neighbor.wireId !== undefined) {
        result.traversedWireIds.add(neighbor.wireId);
      }
      const neighborTo = neighbor.to;
      // Track fuse-box bridge traversals
      if (
        neighbor.wireId === undefined &&
        current.kind === "connectorCavity" &&
        neighborTo.kind === "connectorCavity" &&
        current.connectorId === neighborTo.connectorId
      ) {
        const pairs = fuseBoxPairsByConnector.get(current.connectorId) ?? [];
        const currentCavity = current.cavityIndex;
        const neighborCavity = neighborTo.cavityIndex;
        const pair = pairs.find(
          (p) =>
            (p.pinA === currentCavity && p.pinB === neighborCavity) ||
            (p.pinB === currentCavity && p.pinA === neighborCavity)
        );
        if (pair) {
          result.fuseBoxPairsTraversed.push({ connectorId: current.connectorId, pairIndex: pair.pairIndex });
        }
      }
      if (neighborTo.kind === "connectorCavity") {
        const targetConnectorId = neighborTo.connectorId;
        const load = pinLoadByKey.get(pinKey(targetConnectorId, neighborTo.cavityIndex));
        if (load && load.role === "consumer" && typeof load.currentA === "number") {
          result.reachedConsumers.push({
            ref: { connectorId: load.connectorId, cavityIndex: load.cavityIndex },
            currentA: load.currentA
          });
          // Consumers are leaves — do not propagate further through them
          continue;
        }
        if (load && load.role === "source") {
          // Reaching another source on the same branch — do not propagate through it
          continue;
        }
        // Passive / bidirectional connector pin: continue (treat as pass-through if it's
        // really a connector pin that bridges via fuse-box, otherwise stop at the leaf).
        if (!isPassThroughEndpoint(neighborTo)) {
          // If this connector pin has no fuse-box pair bridge edge and no additional
          // physical continuation, it is a leaf and propagation stops.
          const nextEdges = adjacency.get(toKey) ?? [];
          const hasBridge = nextEdges.some(
            (n) =>
              n.wireId === undefined &&
              n.to.kind === "connectorCavity" &&
              n.to.connectorId === targetConnectorId
          );
          const hasPhysicalContinuation = nextEdges.length > 1;
          if (!hasBridge && !hasPhysicalContinuation) {
            continue;
          }
        }
      }
      queue.push(neighbor.to);
    }
  }
  return result;
}

function computeCurrentNetwork(input: PinElectricalLoadInput): PinElectricalLoadResult {
  const result: PinElectricalLoadResult = {
    pinLoadByConnectorPin: new Map(),
    branchLoadByWire: new Map(),
    deviceBalance: new Map(),
    fuseProtectedLoad: new Map(),
    warnings: []
  };

  const sortedConnectors = [...input.connectors].sort((a, b) =>
    a.id < b.id ? -1 : a.id > b.id ? 1 : 0
  );

  // Resolve pin roles for every connector cavity that has a declared role
  for (const connector of sortedConnectors) {
    const catalogItem = connector.catalogItemId
      ? input.catalogItemsById.get(connector.catalogItemId)
      : undefined;
    for (let cavityIndex = 1; cavityIndex <= connector.cavityCount; cavityIndex += 1) {
      const descriptor = resolvePinElectricalRoleDescriptor(connector, catalogItem, cavityIndex);
      if (descriptor.source === "default") {
        continue;
      }
      const role: PinElectricalRole = descriptor.role;
      result.pinLoadByConnectorPin.set(pinKey(connector.id, cavityIndex), {
        connectorId: connector.id,
        cavityIndex,
        role: role.role,
        currentA: role.currentA
      });
    }
  }

  // Initialize device balance for every connector that has at least one declared pin
  for (const [, load] of result.pinLoadByConnectorPin) {
    if (!result.deviceBalance.has(load.connectorId)) {
      result.deviceBalance.set(load.connectorId, {
        connectorId: load.connectorId,
        totalSourceA: 0,
        totalConsumerA: 0,
        supplyPins: [],
        sourcePins: []
      });
    }
    const balance = result.deviceBalance.get(load.connectorId)!;
    if (load.role === "source") {
      balance.sourcePins.push(load.cavityIndex);
      if (typeof load.currentA === "number") {
        balance.totalSourceA += load.currentA;
      }
    } else if (load.role === "consumer") {
      balance.supplyPins.push(load.cavityIndex);
      if (typeof load.currentA === "number") {
        balance.totalConsumerA += load.currentA;
      }
    } else if (load.role === "bidirectional") {
      balance.sourcePins.push(load.cavityIndex);
      balance.supplyPins.push(load.cavityIndex);
      if (typeof load.currentA === "number") {
        balance.totalSourceA += load.currentA;
        balance.totalConsumerA += load.currentA;
      }
    }
  }

  const { adjacency, fuseBoxPairsByConnector } = buildAdjacency(input);

  // Propagate from each source pin (deterministic order)
  const sourceLoads = [...result.pinLoadByConnectorPin.values()]
    .filter((l) => (l.role === "source" || l.role === "bidirectional") && typeof l.currentA === "number")
    .sort((a, b) => {
      if (a.connectorId !== b.connectorId) {
        return a.connectorId < b.connectorId ? -1 : 1;
      }
      return a.cavityIndex - b.cavityIndex;
    });

  const wireToFuseLoad = new Map<WireId, number>();

  for (const source of sourceLoads) {
    const start: WireEndpointKey = {
      kind: "connectorCavity",
      connectorId: source.connectorId,
      cavityIndex: source.cavityIndex
    };
    const propagation = propagateFromSource(
      start,
      adjacency,
      result.pinLoadByConnectorPin,
      fuseBoxPairsByConnector
    );

    const sourceRef: ConnectorPinRef = {
      connectorId: source.connectorId,
      cavityIndex: source.cavityIndex
    };

    for (const wireId of propagation.traversedWireIds) {
      const existing = result.branchLoadByWire.get(wireId);
      if (existing) {
        existing.continuousA += source.currentA ?? 0;
        existing.sourceRefs.push(sourceRef);
        for (const c of propagation.reachedConsumers) {
          if (!existing.consumerRefs.some((r) => r.connectorId === c.ref.connectorId && r.cavityIndex === c.ref.cavityIndex)) {
            existing.consumerRefs.push(c.ref);
          }
        }
      } else {
        result.branchLoadByWire.set(wireId, {
          wireId,
          continuousA: source.currentA ?? 0,
          sourceRefs: [sourceRef],
          consumerRefs: propagation.reachedConsumers.map((c) => c.ref)
        });
      }
      wireToFuseLoad.set(wireId, (wireToFuseLoad.get(wireId) ?? 0) + (source.currentA ?? 0));
    }

    // Fuse-box protected loads — for each pair traversed, accumulate the source current as
    // the load on that pair (downstream sum).
    for (const traversed of propagation.fuseBoxPairsTraversed) {
      const key = fuseBoxPairKey(traversed.connectorId, traversed.pairIndex);
      const existing = result.fuseProtectedLoad.get(key);
      if (existing) {
        existing.continuousA += source.currentA ?? 0;
      } else {
        result.fuseProtectedLoad.set(key, {
          key,
          kind: "fuseBoxPair",
          continuousA: source.currentA ?? 0
        });
      }
    }
  }

  // Fuse-wire protected loads (where Wire.protection.kind === "fuse"). The downstream load
  // equals the current carried by that wire.
  for (const wire of input.wires) {
    if (!wire.protection || wire.protection.kind !== "fuse") {
      continue;
    }
    const carried = result.branchLoadByWire.get(wire.id)?.continuousA ?? 0;
    result.fuseProtectedLoad.set(`wireFuse:${wire.id}`, {
      key: `wireFuse:${wire.id}`,
      kind: "wireFuse",
      continuousA: carried
    });
  }

  return result;
}

export function computePinElectricalLoad(
  input: PinElectricalLoadInput,
  scope: PinElectricalLoadScope = { kind: "currentNetwork" }
): PinElectricalLoadResult {
  if (scope.kind === "currentNetwork") {
    return computeCurrentNetwork(input);
  }
  throw new NotImplementedScopeError(scope.kind);
}
