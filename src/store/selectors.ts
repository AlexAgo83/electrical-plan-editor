import type {
  Network,
  NetworkId,
  Connector,
  ConnectorId,
  NetworkNode,
  NodeId,
  Segment,
  SegmentId,
  Splice,
  SpliceId,
  Wire,
  WireId
} from "../core/entities";
import { buildRoutingGraphIndex, type RoutingGraphIndex } from "../core/graph";
import { findShortestRoute, type ShortestRouteResult } from "../core/pathfinding";
import type { AppState, SelectionState } from "./types";

function selectCollection<T, Id extends string>(
  byId: Record<Id, T>,
  allIds: Id[]
): T[] {
  return allIds.map((id) => byId[id]);
}

export function selectConnectors(state: AppState): Connector[] {
  return selectCollection(state.connectors.byId, state.connectors.allIds);
}

export function selectNetworks(state: AppState): Network[] {
  return selectCollection(state.networks.byId, state.networks.allIds);
}

export function selectNetworkById(state: AppState, id: NetworkId): Network | undefined {
  return state.networks.byId[id];
}

export function selectActiveNetworkId(state: AppState): NetworkId | null {
  return state.activeNetworkId;
}

export function selectActiveNetwork(state: AppState): Network | null {
  if (state.activeNetworkId === null) {
    return null;
  }

  return state.networks.byId[state.activeNetworkId] ?? null;
}

export function selectSplices(state: AppState): Splice[] {
  return selectCollection(state.splices.byId, state.splices.allIds);
}

export function selectNodes(state: AppState): NetworkNode[] {
  return selectCollection(state.nodes.byId, state.nodes.allIds);
}

export function selectSegments(state: AppState): Segment[] {
  return selectCollection(state.segments.byId, state.segments.allIds);
}

export function selectWires(state: AppState): Wire[] {
  return selectCollection(state.wires.byId, state.wires.allIds);
}

export function selectNodePositions(state: AppState): AppState["nodePositions"] {
  return state.nodePositions;
}

export function selectConnectorById(state: AppState, id: ConnectorId): Connector | undefined {
  return state.connectors.byId[id];
}

export function selectSpliceById(state: AppState, id: SpliceId): Splice | undefined {
  return state.splices.byId[id];
}

export function selectNodeById(state: AppState, id: NodeId): NetworkNode | undefined {
  return state.nodes.byId[id];
}

export function selectSegmentById(state: AppState, id: SegmentId): Segment | undefined {
  return state.segments.byId[id];
}

export function selectWireById(state: AppState, id: WireId): Wire | undefined {
  return state.wires.byId[id];
}

export function selectSelection(state: AppState): SelectionState | null {
  return state.ui.selected;
}

export function selectLastError(state: AppState): string | null {
  return state.ui.lastError;
}

export function selectThemeMode(state: AppState): "normal" | "dark" {
  return state.ui.themeMode;
}

export function selectNetworkTechnicalIdTaken(
  state: AppState,
  technicalId: string,
  excludedNetworkId?: NetworkId
): boolean {
  return state.networks.allIds.some((id) => {
    if (excludedNetworkId !== undefined && id === excludedNetworkId) {
      return false;
    }

    const network = state.networks.byId[id];
    if (network === undefined) {
      return false;
    }

    return network.technicalId === technicalId;
  });
}

export function selectConnectorTechnicalIdTaken(
  state: AppState,
  technicalId: string,
  excludedConnectorId?: ConnectorId
): boolean {
  return state.connectors.allIds.some((id) => {
    if (excludedConnectorId !== undefined && id === excludedConnectorId) {
      return false;
    }

    const connector = state.connectors.byId[id];
    if (connector === undefined) {
      return false;
    }

    return connector.technicalId === technicalId;
  });
}

export function selectSpliceTechnicalIdTaken(
  state: AppState,
  technicalId: string,
  excludedSpliceId?: SpliceId
): boolean {
  return state.splices.allIds.some((id) => {
    if (excludedSpliceId !== undefined && id === excludedSpliceId) {
      return false;
    }

    const splice = state.splices.byId[id];
    if (splice === undefined) {
      return false;
    }

    return splice.technicalId === technicalId;
  });
}

export function selectWireTechnicalIdTaken(
  state: AppState,
  technicalId: string,
  excludedWireId?: WireId
): boolean {
  return state.wires.allIds.some((id) => {
    if (excludedWireId !== undefined && id === excludedWireId) {
      return false;
    }

    const wire = state.wires.byId[id];
    if (wire === undefined) {
      return false;
    }

    return wire.technicalId === technicalId;
  });
}

export interface ConnectorCavityStatus {
  cavityIndex: number;
  occupantRef: string | null;
  isOccupied: boolean;
}

export function selectConnectorCavityStatuses(
  state: AppState,
  connectorId: ConnectorId
): ConnectorCavityStatus[] {
  const connector = state.connectors.byId[connectorId];
  if (connector === undefined) {
    return [];
  }

  const occupancy = state.connectorCavityOccupancy[connectorId] ?? {};

  return Array.from({ length: connector.cavityCount }, (_, index) => {
    const cavityIndex = index + 1;
    const occupantRef = occupancy[cavityIndex] ?? null;
    return {
      cavityIndex,
      occupantRef,
      isOccupied: occupantRef !== null
    };
  });
}

export interface SplicePortStatus {
  portIndex: number;
  occupantRef: string | null;
  isOccupied: boolean;
}

export function selectSplicePortStatuses(
  state: AppState,
  spliceId: SpliceId
): SplicePortStatus[] {
  const splice = state.splices.byId[spliceId];
  if (splice === undefined) {
    return [];
  }

  const occupancy = state.splicePortOccupancy[spliceId] ?? {};

  return Array.from({ length: splice.portCount }, (_, index) => {
    const portIndex = index + 1;
    const occupantRef = occupancy[portIndex] ?? null;
    return {
      portIndex,
      occupantRef,
      isOccupied: occupantRef !== null
    };
  });
}

export interface SubNetworkSummary {
  tag: string;
  segmentCount: number;
  totalLengthMm: number;
}

export function selectSubNetworkSummaries(state: AppState): SubNetworkSummary[] {
  const byTag = new Map<string, SubNetworkSummary>();

  for (const segmentId of state.segments.allIds) {
    const segment = state.segments.byId[segmentId];
    if (segment === undefined) {
      continue;
    }

    const normalizedTag = segment.subNetworkTag?.trim();
    const tag = normalizedTag === undefined || normalizedTag.length === 0 ? "(default)" : normalizedTag;
    const previous = byTag.get(tag);
    if (previous === undefined) {
      byTag.set(tag, {
        tag,
        segmentCount: 1,
        totalLengthMm: segment.lengthMm
      });
      continue;
    }

    byTag.set(tag, {
      tag,
      segmentCount: previous.segmentCount + 1,
      totalLengthMm: previous.totalLengthMm + segment.lengthMm
    });
  }

  return [...byTag.values()].sort((left, right) => left.tag.localeCompare(right.tag));
}

export function selectRoutingGraphIndex(state: AppState): RoutingGraphIndex {
  return buildRoutingGraphIndex(selectNodes(state), selectSegments(state));
}

export function selectShortestRouteBetweenNodes(
  state: AppState,
  fromNodeId: NodeId,
  toNodeId: NodeId
): ShortestRouteResult | null {
  return findShortestRoute(selectRoutingGraphIndex(state), fromNodeId, toNodeId);
}
