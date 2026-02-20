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
