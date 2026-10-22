import type {
  Connector,
  ConnectorId,
  Network,
  NetworkId,
  NetworkNode,
  NodeId,
  Segment,
  SegmentId,
  Splice,
  SpliceId,
  Wire,
  WireEndpoint,
  WireId
} from "../../core/entities";
import { recomputeAllWiresForNetwork } from "../../store/reducer/helpers/wireTransitions";
import { createInitialState, type AppState, type EntityState, type LayoutNodePosition } from "../../store";

export interface SyntheticRoutingNetworkOptions {
  gridSize: number;
  connectorCount: number;
  spliceCount: number;
  wireCount: number;
  seed?: number;
}

function entityState<T extends { id: string }, Id extends string>(items: T[]): EntityState<T, Id> {
  const byId = {} as Record<Id, T>;
  const allIds: Id[] = [];
  for (const item of items) {
    byId[item.id as Id] = item;
    allIds.push(item.id as Id);
  }
  return { byId, allIds };
}

function createRandom(seed: number): () => number {
  let current = seed >>> 0;
  return () => {
    current = (current * 1664525 + 1013904223) >>> 0;
    return current / 4294967296;
  };
}

/**
 * Builds a deterministic grid-shaped network (intermediate grid nodes, connector and
 * directional splice leaves) whose stored wire routes already match a full recompute.
 */
export function buildSyntheticRoutingNetworkState(options: SyntheticRoutingNetworkOptions): AppState {
  const random = createRandom(options.seed ?? 7);
  const { gridSize } = options;
  const nodes: NetworkNode[] = [];
  const segments: Segment[] = [];
  const connectors: Connector[] = [];
  const splices: Splice[] = [];
  const nodePositions: Record<NodeId, LayoutNodePosition> = {};
  const gridNodeId = (x: number, y: number) => `N-${x}-${y}` as NodeId;

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const id = gridNodeId(x, y);
      nodes.push({ id, kind: "intermediate", label: id });
      nodePositions[id] = { x: x * 100, y: y * 100 };
      if (x > 0) {
        segments.push({ id: `S-H-${x}-${y}` as SegmentId, nodeA: gridNodeId(x - 1, y), nodeB: id, lengthMm: 80 + Math.round(random() * 60) });
      }
      if (y > 0) {
        segments.push({ id: `S-V-${x}-${y}` as SegmentId, nodeA: gridNodeId(x, y - 1), nodeB: id, lengthMm: 80 + Math.round(random() * 60) });
      }
    }
  }

  const attachLeaf = (leafNodeId: NodeId, index: number) => {
    const x = Math.floor(random() * gridSize);
    const y = Math.floor(random() * gridSize);
    nodePositions[leafNodeId] = { x: x * 100 + 30, y: y * 100 + 30 };
    segments.push({ id: `S-LEAF-${index}` as SegmentId, nodeA: gridNodeId(x, y), nodeB: leafNodeId, lengthMm: 40 });
  };

  for (let index = 0; index < options.connectorCount; index += 1) {
    const connectorId = `C-${index}` as ConnectorId;
    const nodeId = `N-C-${index}` as NodeId;
    connectors.push({ id: connectorId, name: `Connector ${index}`, technicalId: `C-${index}`, cavityCount: 200 });
    nodes.push({ id: nodeId, kind: "connector", connectorId });
    attachLeaf(nodeId, index);
  }
  for (let index = 0; index < options.spliceCount; index += 1) {
    const spliceId = `SP-${index}` as SpliceId;
    const nodeId = `N-SP-${index}` as NodeId;
    splices.push({ id: spliceId, name: `Splice ${index}`, technicalId: `SP-${index}`, portCount: 2, portMode: "directional" });
    nodes.push({ id: nodeId, kind: "splice", spliceId });
    attachLeaf(nodeId, options.connectorCount + index);
  }

  const cavityCursor = new Map<string, number>();
  const nextConnectorEndpoint = (): WireEndpoint => {
    const connectorId = `C-${Math.floor(random() * options.connectorCount)}` as ConnectorId;
    const cavityIndex = (cavityCursor.get(connectorId) ?? 0) + 1;
    cavityCursor.set(connectorId, cavityIndex);
    return { kind: "connectorCavity", connectorId, cavityIndex };
  };
  const wires: Wire[] = [];
  for (let index = 0; index < options.wireCount; index += 1) {
    const useSplice = options.spliceCount > 0 && index % 10 === 0;
    const endpointB: WireEndpoint = useSplice
      ? { kind: "splicePort", spliceId: `SP-${index % options.spliceCount}` as SpliceId, portIndex: 1 }
      : nextConnectorEndpoint();
    wires.push({
      id: `W-${index}` as WireId,
      name: `Wire ${index}`,
      technicalId: `W-${index}`,
      sectionMm2: 0.5,
      primaryColorId: null,
      secondaryColorId: null,
      endpointA: nextConnectorEndpoint(),
      endpointB,
      routeSegmentIds: [],
      lengthMm: 0,
      isRouteLocked: false
    });
  }

  const networkId = "net-synthetic" as NetworkId;
  const network: Network = {
    id: networkId,
    name: "Synthetic routing network",
    technicalId: "NET-SYNTH",
    createdAt: "2026-10-22T00:00:00.000Z",
    updatedAt: "2026-10-22T00:00:00.000Z"
  };
  const base = createInitialState();
  const draft: AppState = {
    ...base,
    networks: entityState<Network, NetworkId>([network]),
    activeNetworkId: networkId,
    connectors: entityState(connectors),
    splices: entityState(splices),
    nodes: entityState(nodes),
    segments: entityState(segments),
    wires: entityState(wires),
    nodePositions
  };
  const recomputed = recomputeAllWiresForNetwork(draft);
  if (!("wires" in recomputed)) {
    throw new Error(`Synthetic fixture failed to route: ${recomputed.error}`);
  }
  const routed: AppState = { ...draft, wires: recomputed.wires };
  return {
    ...routed,
    networkStates: {
      [networkId]: {
        catalogItems: routed.catalogItems,
        connectors: routed.connectors,
        splices: routed.splices,
        nodes: routed.nodes,
        segments: routed.segments,
        wires: routed.wires,
        nodePositions: routed.nodePositions,
        connectorCavityOccupancy: routed.connectorCavityOccupancy,
        splicePortOccupancy: routed.splicePortOccupancy
      }
    }
  };
}
