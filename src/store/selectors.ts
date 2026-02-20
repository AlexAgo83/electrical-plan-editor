import type {
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
