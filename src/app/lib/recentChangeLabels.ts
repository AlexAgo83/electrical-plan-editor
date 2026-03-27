import type {
  CatalogItemId,
  ConnectorId,
  NetworkId,
  NetworkNode,
  NodeId,
  Segment,
  SegmentId,
  SpliceId,
  WireEndpoint,
  WireId
} from "../../core/entities";
import type { AppAction } from "../../store/actions";
import type { AppState } from "../../store/types";
import type { UndoHistoryEntry, UndoHistoryTargetKind } from "../types/app-controller";

function targetKindLabel(kind: UndoHistoryTargetKind): string {
  switch (kind) {
    case "network":
      return "Network";
    case "catalog":
      return "Catalog item";
    case "connector":
      return "Connector";
    case "splice":
      return "Splice";
    case "node":
      return "Node";
    case "segment":
      return "Segment";
    case "wire":
      return "Wire";
    case "layout":
      return "Layout";
    case "workspace":
      return "Workspace";
  }
}

function normalizeDisplayText(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function preferDisplayText(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    const normalized = normalizeDisplayText(value);
    if (normalized !== null) {
      return normalized;
    }
  }

  return null;
}

function isLikelyOpaqueSystemId(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 16) {
    return false;
  }

  const hexish = /^[0-9a-f-]+$/i.test(trimmed);
  const hyphenCount = trimmed.split("-").length - 1;
  return hexish && hyphenCount >= 2;
}

function toTargetKind(actionType: AppAction["type"] | "history/replaceState"): UndoHistoryTargetKind {
  const prefix = actionType.split("/")[0];
  switch (prefix) {
    case "network":
    case "catalog":
    case "connector":
    case "splice":
    case "node":
    case "segment":
    case "wire":
    case "layout":
      return prefix;
    default:
      return "workspace";
  }
}

function resolveNetworkDisplayRef(state: AppState, networkId: NetworkId | null): string | null {
  if (networkId === null) {
    return null;
  }

  const network = state.networks.byId[networkId];
  return preferDisplayText(network?.technicalId, network?.name);
}

function resolveCatalogDisplayRef(state: AppState, catalogItemId: CatalogItemId | null): string | null {
  if (catalogItemId === null) {
    return null;
  }

  const item = state.catalogItems.byId[catalogItemId];
  return preferDisplayText(item?.manufacturerReference, item?.name);
}

function resolveConnectorDisplayRef(state: AppState, connectorId: ConnectorId | null): string | null {
  if (connectorId === null) {
    return null;
  }

  const connector = state.connectors.byId[connectorId];
  return preferDisplayText(connector?.technicalId, connector?.name);
}

function resolveSpliceDisplayRef(state: AppState, spliceId: SpliceId | null): string | null {
  if (spliceId === null) {
    return null;
  }

  const splice = state.splices.byId[spliceId];
  return preferDisplayText(splice?.technicalId, splice?.name);
}

function resolveWireDisplayRef(state: AppState, wireId: WireId | null): string | null {
  if (wireId === null) {
    return null;
  }

  const wire = state.wires.byId[wireId];
  return preferDisplayText(wire?.technicalId, wire?.name);
}

function resolveNodeDisplayRefFromNode(state: AppState, node: NetworkNode | undefined): string | null {
  if (node === undefined) {
    return null;
  }

  switch (node.kind) {
    case "connector":
      return resolveConnectorDisplayRef(state, node.connectorId);
    case "splice":
      return resolveSpliceDisplayRef(state, node.spliceId);
    case "intermediate":
      return normalizeDisplayText(node.label);
  }
}

function resolveNodeDisplayRef(state: AppState, nodeId: NodeId | null): string | null {
  if (nodeId === null) {
    return null;
  }

  return resolveNodeDisplayRefFromNode(state, state.nodes.byId[nodeId]);
}

function resolveEndpointDisplayRef(state: AppState, endpoint: WireEndpoint): string | null {
  switch (endpoint.kind) {
    case "connectorCavity": {
      const connectorRef = resolveConnectorDisplayRef(state, endpoint.connectorId);
      return connectorRef === null ? null : `${connectorRef}:${endpoint.cavityIndex + 1}`;
    }
    case "splicePort": {
      const spliceRef = resolveSpliceDisplayRef(state, endpoint.spliceId);
      return spliceRef === null ? null : `${spliceRef}:${endpoint.portIndex + 1}`;
    }
  }
}

function resolveSegmentDisplayRefFromSegment(state: AppState, segment: Segment | undefined): string | null {
  if (segment === undefined) {
    return null;
  }

  const explicitId = normalizeDisplayText(segment.id);
  if (explicitId !== null && !isLikelyOpaqueSystemId(explicitId)) {
    return explicitId;
  }

  const endpointA = resolveNodeDisplayRef(state, segment.nodeA);
  const endpointB = resolveNodeDisplayRef(state, segment.nodeB);
  if (endpointA !== null && endpointB !== null) {
    return `${endpointA} -> ${endpointB}`;
  }

  return preferDisplayText(endpointA, endpointB);
}

function resolveSegmentDisplayRef(state: AppState, segmentId: SegmentId | null): string | null {
  if (segmentId === null) {
    return null;
  }

  return resolveSegmentDisplayRefFromSegment(state, state.segments.byId[segmentId]);
}

function actionVerb(action: AppAction, previousState: AppState): string {
  switch (action.type) {
    case "network/create":
      return "created";
    case "network/select":
      return "activated";
    case "network/setSummaryViewState":
      return "view updated";
    case "network/rename":
      return "renamed";
    case "network/update":
      return "updated";
    case "network/duplicate":
      return "duplicated";
    case "network/delete":
      return "deleted";
    case "network/importMany":
      return "imported";
    case "catalog/upsert":
      return previousState.catalogItems.byId[action.payload.id] === undefined ? "created" : "updated";
    case "catalog/remove":
      return "deleted";
    case "connector/upsert":
      return previousState.connectors.byId[action.payload.id] === undefined ? "created" : "updated";
    case "connector/remove":
      return "deleted";
    case "connector/occupyCavity":
      return "cavity occupied";
    case "connector/releaseCavity":
      return "cavity released";
    case "splice/upsert":
      return previousState.splices.byId[action.payload.id] === undefined ? "created" : "updated";
    case "splice/remove":
      return "deleted";
    case "splice/occupyPort":
      return "port occupied";
    case "splice/releasePort":
      return "port released";
    case "node/upsert":
      return previousState.nodes.byId[action.payload.id] === undefined ? "created" : "updated";
    case "node/rename":
      return "renamed";
    case "node/remove":
      return "deleted";
    case "segment/upsert":
      return previousState.segments.byId[action.payload.id] === undefined ? "created" : "updated";
    case "segment/rename":
      return "renamed";
    case "segment/remove":
      return "deleted";
    case "wire/save":
      return previousState.wires.byId[action.payload.id] === undefined ? "created" : "updated";
    case "wire/lockRoute":
      return "route locked";
    case "wire/resetRoute":
      return "route reset";
    case "wire/upsert":
      return previousState.wires.byId[action.payload.id] === undefined ? "created" : "updated";
    case "wire/remove":
      return "deleted";
    case "layout/setNodePosition":
    case "layout/setNodePositions":
      return "updated";
    case "ui/select":
    case "ui/setError":
    case "ui/setThemeMode":
    case "ui/clearSelection":
    case "ui/clearError":
      return "updated";
  }
}

function resolveEntryNetworkId(action: AppAction, previousState: AppState, nextState: AppState) {
  switch (action.type) {
    case "network/create":
      return action.payload.network.id;
    case "network/select":
    case "network/setSummaryViewState":
    case "network/rename":
    case "network/update":
    case "network/delete":
      return action.payload.id;
    case "network/duplicate":
      return action.payload.network.id;
    case "network/importMany":
      return nextState.activeNetworkId ?? previousState.activeNetworkId;
    default:
      return previousState.activeNetworkId;
  }
}

function resolveDisplayRef(action: AppAction, previousState: AppState, nextState: AppState): string | null {
  switch (action.type) {
    case "network/create":
      return preferDisplayText(action.payload.network.technicalId, action.payload.network.name);
    case "network/select":
    case "network/setSummaryViewState":
    case "network/rename":
    case "network/update":
    case "network/delete":
      return preferDisplayText(
        resolveNetworkDisplayRef(nextState, action.payload.id),
        resolveNetworkDisplayRef(previousState, action.payload.id)
      );
    case "network/duplicate":
      return preferDisplayText(action.payload.network.technicalId, action.payload.network.name);
    case "network/importMany":
      return `${action.payload.networks.length} network(s)`;
    case "catalog/upsert":
      return preferDisplayText(
        resolveCatalogDisplayRef(nextState, action.payload.id),
        action.payload.manufacturerReference,
        action.payload.name,
        resolveCatalogDisplayRef(previousState, action.payload.id)
      );
    case "catalog/remove":
      return resolveCatalogDisplayRef(previousState, action.payload.id);
    case "connector/upsert":
      return preferDisplayText(
        resolveConnectorDisplayRef(nextState, action.payload.id),
        action.payload.technicalId,
        action.payload.name,
        resolveConnectorDisplayRef(previousState, action.payload.id)
      );
    case "connector/remove":
      return resolveConnectorDisplayRef(previousState, action.payload.id);
    case "connector/occupyCavity":
    case "connector/releaseCavity": {
      const connectorRef = preferDisplayText(
        resolveConnectorDisplayRef(nextState, action.payload.connectorId),
        resolveConnectorDisplayRef(previousState, action.payload.connectorId)
      );
      return connectorRef === null ? null : `${connectorRef}:${action.payload.cavityIndex + 1}`;
    }
    case "splice/upsert":
      return preferDisplayText(
        resolveSpliceDisplayRef(nextState, action.payload.id),
        action.payload.technicalId,
        action.payload.name,
        resolveSpliceDisplayRef(previousState, action.payload.id)
      );
    case "splice/remove":
      return resolveSpliceDisplayRef(previousState, action.payload.id);
    case "splice/occupyPort":
    case "splice/releasePort": {
      const spliceRef = preferDisplayText(
        resolveSpliceDisplayRef(nextState, action.payload.spliceId),
        resolveSpliceDisplayRef(previousState, action.payload.spliceId)
      );
      return spliceRef === null ? null : `${spliceRef}:${action.payload.portIndex + 1}`;
    }
    case "node/upsert":
      return preferDisplayText(
        resolveNodeDisplayRef(nextState, action.payload.id),
        resolveNodeDisplayRef(previousState, action.payload.id)
      );
    case "node/rename":
      return preferDisplayText(
        resolveNodeDisplayRef(nextState, action.payload.toId),
        resolveNodeDisplayRef(previousState, action.payload.fromId)
      );
    case "node/remove":
      return resolveNodeDisplayRef(previousState, action.payload.id);
    case "segment/upsert":
      return preferDisplayText(
        resolveSegmentDisplayRef(nextState, action.payload.id),
        resolveSegmentDisplayRef(previousState, action.payload.id)
      );
    case "segment/rename":
      return preferDisplayText(
        resolveSegmentDisplayRef(nextState, action.payload.toId),
        resolveSegmentDisplayRef(previousState, action.payload.fromId)
      );
    case "segment/remove":
      return resolveSegmentDisplayRef(previousState, action.payload.id);
    case "wire/save":
      return preferDisplayText(
        resolveWireDisplayRef(nextState, action.payload.id),
        action.payload.technicalId,
        action.payload.name,
        resolveWireDisplayRef(previousState, action.payload.id)
      );
    case "wire/lockRoute":
    case "wire/resetRoute":
      return preferDisplayText(
        resolveWireDisplayRef(nextState, action.payload.id),
        resolveWireDisplayRef(previousState, action.payload.id)
      );
    case "wire/upsert":
      return preferDisplayText(
        resolveWireDisplayRef(nextState, action.payload.id),
        action.payload.technicalId,
        action.payload.name,
        resolveWireDisplayRef(previousState, action.payload.id)
      );
    case "wire/remove":
      return resolveWireDisplayRef(previousState, action.payload.id);
    case "layout/setNodePosition":
      return preferDisplayText(
        resolveNodeDisplayRef(nextState, action.payload.nodeId),
        resolveNodeDisplayRef(previousState, action.payload.nodeId)
      );
    case "layout/setNodePositions":
      return `${Object.keys(action.payload.positions).length} node(s)`;
    case "ui/select":
    case "ui/setError":
    case "ui/setThemeMode":
    case "ui/clearSelection":
    case "ui/clearError":
      return null;
  }
}

function buildLabelRoot(targetKind: UndoHistoryTargetKind, displayRef: string | null): string {
  if (displayRef === null) {
    return targetKindLabel(targetKind);
  }

  return `${targetKindLabel(targetKind)} '${displayRef}'`;
}

export function buildUndoHistoryEntry(
  action: AppAction,
  previousState: AppState,
  nextState: AppState,
  sequence: number,
  nowIso: string
): UndoHistoryEntry {
  const targetKind = toTargetKind(action.type);
  const displayRef = resolveDisplayRef(action, previousState, nextState);
  return {
    sequence,
    actionType: action.type,
    targetKind,
    targetId: displayRef,
    networkId: resolveEntryNetworkId(action, previousState, nextState),
    label: `${buildLabelRoot(targetKind, displayRef)} ${actionVerb(action, previousState)}`,
    timestampIso: nowIso
  };
}

export function buildReplaceStateHistoryEntry(
  sequence: number,
  previousState: AppState,
  nextState: AppState,
  nowIso: string
): UndoHistoryEntry {
  const activeNetworkId = nextState.activeNetworkId ?? previousState.activeNetworkId;
  const displayRef = preferDisplayText(
    resolveNetworkDisplayRef(nextState, activeNetworkId),
    resolveNetworkDisplayRef(previousState, activeNetworkId)
  );

  return {
    sequence,
    actionType: "history/replaceState",
    targetKind: "workspace",
    targetId: displayRef,
    networkId: activeNetworkId,
    label: "Workspace state replaced",
    timestampIso: nowIso
  };
}

export function resolveSegmentDisplayRefForTest(state: AppState, segmentId: SegmentId): string | null {
  return resolveSegmentDisplayRef(state, segmentId);
}

export function resolveNodeDisplayRefForTest(state: AppState, nodeId: NodeId): string | null {
  return resolveNodeDisplayRef(state, nodeId);
}

export function resolveEndpointDisplayRefForTest(state: AppState, endpoint: WireEndpoint): string | null {
  return resolveEndpointDisplayRef(state, endpoint);
}
