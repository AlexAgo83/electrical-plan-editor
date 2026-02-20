import type { NodeId, SegmentId, Wire, WireEndpoint, WireId } from "../core/entities";
import { buildRoutingGraphIndex } from "../core/graph";
import { findShortestRoute } from "../core/pathfinding";
import type { AppAction } from "./actions";
import type { AppState, EntityState, SelectionState } from "./types";

function sortIds<Id extends string>(ids: Id[]): Id[] {
  return [...ids].sort((left, right) => left.localeCompare(right));
}

function upsertEntity<T extends { id: Id }, Id extends string>(
  state: EntityState<T, Id>,
  entity: T
): EntityState<T, Id> {
  const existing = state.byId[entity.id];
  const byId = {
    ...state.byId,
    [entity.id]: entity
  };

  if (existing !== undefined) {
    return {
      byId,
      allIds: state.allIds
    };
  }

  return {
    byId,
    allIds: sortIds([...state.allIds, entity.id])
  };
}

function removeEntity<T, Id extends string>(state: EntityState<T, Id>, id: Id): EntityState<T, Id> {
  if (state.byId[id] === undefined) {
    return state;
  }

  const byId = { ...state.byId };
  delete byId[id];

  return {
    byId,
    allIds: state.allIds.filter((candidate) => candidate !== id)
  };
}

function shouldClearSelection(selected: SelectionState | null, kind: SelectionState["kind"], id: string): boolean {
  return selected?.kind === kind && selected.id === id;
}

function clearLastError(state: AppState): AppState {
  if (state.ui.lastError === null) {
    return state;
  }

  return {
    ...state,
    ui: {
      ...state.ui,
      lastError: null
    }
  };
}

function withError(state: AppState, message: string): AppState {
  if (state.ui.lastError === message) {
    return state;
  }

  return bumpRevision({
    ...state,
    ui: {
      ...state.ui,
      lastError: message
    }
  });
}

function isValidSlotIndex(index: number, max: number): boolean {
  return Number.isInteger(index) && index >= 1 && index <= max;
}

function hasDuplicateConnectorTechnicalId(state: AppState, connectorId: string, technicalId: string): boolean {
  return state.connectors.allIds.some((id) => {
    if (id === connectorId) {
      return false;
    }

    const connector = state.connectors.byId[id];
    if (connector === undefined) {
      return false;
    }

    return connector.technicalId === technicalId;
  });
}

function hasDuplicateSpliceTechnicalId(state: AppState, spliceId: string, technicalId: string): boolean {
  return state.splices.allIds.some((id) => {
    if (id === spliceId) {
      return false;
    }

    const splice = state.splices.byId[id];
    if (splice === undefined) {
      return false;
    }

    return splice.technicalId === technicalId;
  });
}

function hasConnectorNodeConflict(state: AppState, nodeId: string, connectorId: string): boolean {
  return state.nodes.allIds.some((id) => {
    if (id === nodeId) {
      return false;
    }

    const node = state.nodes.byId[id];
    return node?.kind === "connector" && node.connectorId === connectorId;
  });
}

function hasSpliceNodeConflict(state: AppState, nodeId: string, spliceId: string): boolean {
  return state.nodes.allIds.some((id) => {
    if (id === nodeId) {
      return false;
    }

    const node = state.nodes.byId[id];
    return node?.kind === "splice" && node.spliceId === spliceId;
  });
}

function countSegmentsUsingNode(state: AppState, nodeId: string): number {
  return state.segments.allIds.reduce((count, segmentId) => {
    const segment = state.segments.byId[segmentId];
    if (segment === undefined) {
      return count;
    }

    return segment.nodeA === nodeId || segment.nodeB === nodeId ? count + 1 : count;
  }, 0);
}

function hasConnectorNodeReference(state: AppState, connectorId: string): boolean {
  return state.nodes.allIds.some((id) => {
    const node = state.nodes.byId[id];
    return node?.kind === "connector" && node.connectorId === connectorId;
  });
}

function hasSpliceNodeReference(state: AppState, spliceId: string): boolean {
  return state.nodes.allIds.some((id) => {
    const node = state.nodes.byId[id];
    return node?.kind === "splice" && node.spliceId === spliceId;
  });
}

function hasWireEndpointReferenceOnConnector(state: AppState, connectorId: string): boolean {
  return state.wires.allIds.some((id) => {
    const wire = state.wires.byId[id];
    if (wire === undefined) {
      return false;
    }

    return (
      (wire.endpointA.kind === "connectorCavity" && wire.endpointA.connectorId === connectorId) ||
      (wire.endpointB.kind === "connectorCavity" && wire.endpointB.connectorId === connectorId)
    );
  });
}

function hasWireEndpointReferenceOnSplice(state: AppState, spliceId: string): boolean {
  return state.wires.allIds.some((id) => {
    const wire = state.wires.byId[id];
    if (wire === undefined) {
      return false;
    }

    return (
      (wire.endpointA.kind === "splicePort" && wire.endpointA.spliceId === spliceId) ||
      (wire.endpointB.kind === "splicePort" && wire.endpointB.spliceId === spliceId)
    );
  });
}

function hasDuplicateWireTechnicalId(state: AppState, wireId: string, technicalId: string): boolean {
  return state.wires.allIds.some((id) => {
    if (id === wireId) {
      return false;
    }

    const wire = state.wires.byId[id];
    if (wire === undefined) {
      return false;
    }

    return wire.technicalId === technicalId;
  });
}

function getEndpointKey(endpoint: WireEndpoint): string {
  if (endpoint.kind === "connectorCavity") {
    return `connector:${endpoint.connectorId}:${endpoint.cavityIndex}`;
  }

  return `splice:${endpoint.spliceId}:${endpoint.portIndex}`;
}

function getWireEndpointOccupantRef(wireId: WireId, side: "A" | "B"): string {
  return `wire:${wireId}:${side}`;
}

function findNodeIdForEndpoint(state: AppState, endpoint: WireEndpoint): NodeId | undefined {
  for (const nodeId of state.nodes.allIds) {
    const node = state.nodes.byId[nodeId];
    if (node === undefined) {
      continue;
    }

    if (endpoint.kind === "connectorCavity" && node.kind === "connector" && node.connectorId === endpoint.connectorId) {
      return node.id;
    }

    if (endpoint.kind === "splicePort" && node.kind === "splice" && node.spliceId === endpoint.spliceId) {
      return node.id;
    }
  }

  return undefined;
}

function getEndpointValidationError(state: AppState, endpoint: WireEndpoint): string | null {
  if (endpoint.kind === "connectorCavity") {
    const connector = state.connectors.byId[endpoint.connectorId];
    if (connector === undefined) {
      return "Wire endpoint references an unknown connector.";
    }

    if (!isValidSlotIndex(endpoint.cavityIndex, connector.cavityCount)) {
      return "Wire connector cavity endpoint is out of range.";
    }

    return null;
  }

  const splice = state.splices.byId[endpoint.spliceId];
  if (splice === undefined) {
    return "Wire endpoint references an unknown splice.";
  }

  if (!isValidSlotIndex(endpoint.portIndex, splice.portCount)) {
    return "Wire splice port endpoint is out of range.";
  }

  return null;
}

function getEndpointOccupant(
  connectorCavityOccupancy: AppState["connectorCavityOccupancy"],
  splicePortOccupancy: AppState["splicePortOccupancy"],
  endpoint: WireEndpoint
): string | undefined {
  if (endpoint.kind === "connectorCavity") {
    return connectorCavityOccupancy[endpoint.connectorId]?.[endpoint.cavityIndex];
  }

  return splicePortOccupancy[endpoint.spliceId]?.[endpoint.portIndex];
}

function setEndpointOccupant(
  connectorCavityOccupancy: AppState["connectorCavityOccupancy"],
  splicePortOccupancy: AppState["splicePortOccupancy"],
  endpoint: WireEndpoint,
  occupantRef: string
): void {
  if (endpoint.kind === "connectorCavity") {
    const connectorOccupancy = { ...(connectorCavityOccupancy[endpoint.connectorId] ?? {}) };
    connectorOccupancy[endpoint.cavityIndex] = occupantRef;
    connectorCavityOccupancy[endpoint.connectorId] = connectorOccupancy;
    return;
  }

  const spliceOccupancy = { ...(splicePortOccupancy[endpoint.spliceId] ?? {}) };
  spliceOccupancy[endpoint.portIndex] = occupantRef;
  splicePortOccupancy[endpoint.spliceId] = spliceOccupancy;
}

function releaseEndpointOccupant(
  connectorCavityOccupancy: AppState["connectorCavityOccupancy"],
  splicePortOccupancy: AppState["splicePortOccupancy"],
  endpoint: WireEndpoint,
  expectedOccupantRef: string
): void {
  if (endpoint.kind === "connectorCavity") {
    const connectorOccupancy = connectorCavityOccupancy[endpoint.connectorId];
    if (connectorOccupancy === undefined || connectorOccupancy[endpoint.cavityIndex] !== expectedOccupantRef) {
      return;
    }

    const nextConnectorOccupancy = { ...connectorOccupancy };
    delete nextConnectorOccupancy[endpoint.cavityIndex];
    if (Object.keys(nextConnectorOccupancy).length === 0) {
      delete connectorCavityOccupancy[endpoint.connectorId];
    } else {
      connectorCavityOccupancy[endpoint.connectorId] = nextConnectorOccupancy;
    }

    return;
  }

  const spliceOccupancy = splicePortOccupancy[endpoint.spliceId];
  if (spliceOccupancy === undefined || spliceOccupancy[endpoint.portIndex] !== expectedOccupantRef) {
    return;
  }

  const nextSpliceOccupancy = { ...spliceOccupancy };
  delete nextSpliceOccupancy[endpoint.portIndex];
  if (Object.keys(nextSpliceOccupancy).length === 0) {
    delete splicePortOccupancy[endpoint.spliceId];
  } else {
    splicePortOccupancy[endpoint.spliceId] = nextSpliceOccupancy;
  }
}

function computeForcedRouteLength(
  state: AppState,
  startNodeId: NodeId,
  endNodeId: NodeId,
  segmentIds: SegmentId[]
): number | null {
  if (segmentIds.length === 0) {
    return null;
  }

  const seenSegmentIds = new Set<string>();
  let currentNodeId: NodeId = startNodeId;
  let totalLengthMm = 0;

  for (const segmentId of segmentIds) {
    if (seenSegmentIds.has(segmentId)) {
      return null;
    }
    seenSegmentIds.add(segmentId);

    const segment = state.segments.byId[segmentId];
    if (segment === undefined) {
      return null;
    }

    if (segment.nodeA === currentNodeId) {
      currentNodeId = segment.nodeB;
    } else if (segment.nodeB === currentNodeId) {
      currentNodeId = segment.nodeA;
    } else {
      return null;
    }

    totalLengthMm += segment.lengthMm;
  }

  return currentNodeId === endNodeId ? totalLengthMm : null;
}

function recomputeAllWiresForNetwork(state: AppState): { wires: EntityState<Wire, WireId> } | { error: string } {
  if (state.wires.allIds.length === 0) {
    return { wires: state.wires };
  }

  const graph = buildRoutingGraphIndex(
    state.nodes.allIds
      .map((nodeId) => state.nodes.byId[nodeId])
      .filter((node): node is NonNullable<typeof node> => node !== undefined),
    state.segments.allIds
      .map((segmentId) => state.segments.byId[segmentId])
      .filter((segment): segment is NonNullable<typeof segment> => segment !== undefined)
  );

  const nextWiresById: Record<WireId, Wire> = { ...state.wires.byId };

  for (const wireId of state.wires.allIds) {
    const wire = state.wires.byId[wireId];
    if (wire === undefined) {
      continue;
    }

    const startNodeId = findNodeIdForEndpoint(state, wire.endpointA);
    const endNodeId = findNodeIdForEndpoint(state, wire.endpointB);
    if (startNodeId === undefined || endNodeId === undefined) {
      return { error: `Wire '${wire.technicalId}' has endpoints not mapped to graph nodes.` };
    }

    if (wire.isRouteLocked) {
      const forcedLength = computeForcedRouteLength(state, startNodeId, endNodeId, wire.routeSegmentIds);
      if (forcedLength === null) {
        return { error: `Locked route for wire '${wire.technicalId}' is no longer valid.` };
      }

      nextWiresById[wireId] = {
        ...wire,
        lengthMm: forcedLength
      };
      continue;
    }

    const shortestRoute = findShortestRoute(graph, startNodeId, endNodeId);
    if (shortestRoute === null) {
      return { error: `No route found for wire '${wire.technicalId}'.` };
    }

    nextWiresById[wireId] = {
      ...wire,
      routeSegmentIds: shortestRoute.segmentIds,
      lengthMm: shortestRoute.totalLengthMm,
      isRouteLocked: false
    };
  }

  return {
    wires: {
      byId: nextWiresById,
      allIds: state.wires.allIds
    }
  };
}

function bumpRevision(state: AppState): AppState {
  return {
    ...state,
    meta: {
      revision: state.meta.revision + 1
    }
  };
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "connector/upsert": {
      const cavityCount = action.payload.cavityCount;
      if (!Number.isInteger(cavityCount) || cavityCount < 1) {
        return withError(state, "Connector cavityCount must be an integer >= 1.");
      }

      if (hasDuplicateConnectorTechnicalId(state, action.payload.id, action.payload.technicalId)) {
        return withError(state, `Connector technical ID '${action.payload.technicalId}' is already used.`);
      }

      const occupancy = state.connectorCavityOccupancy[action.payload.id];
      if (occupancy !== undefined) {
        const hasOutOfRangeOccupancy = Object.keys(occupancy)
          .map((key) => Number(key))
          .some((slot) => slot > cavityCount);

        if (hasOutOfRangeOccupancy) {
          return withError(
            state,
            "Connector cavityCount cannot be reduced below occupied cavity indexes."
          );
        }
      }

      return bumpRevision({
        ...clearLastError(state),
        connectors: upsertEntity(state.connectors, action.payload)
      });
    }

    case "connector/remove": {
      if (hasConnectorNodeReference(state, action.payload.id)) {
        return withError(state, "Cannot remove connector while a connector node references it.");
      }
      if (hasWireEndpointReferenceOnConnector(state, action.payload.id)) {
        return withError(state, "Cannot remove connector while wire endpoints reference it.");
      }

      const nextConnectorCavityOccupancy = { ...state.connectorCavityOccupancy };
      delete nextConnectorCavityOccupancy[action.payload.id];

      return bumpRevision({
        ...clearLastError(state),
        connectors: removeEntity(state.connectors, action.payload.id),
        connectorCavityOccupancy: nextConnectorCavityOccupancy,
        ui: shouldClearSelection(state.ui.selected, "connector", action.payload.id)
          ? { ...state.ui, selected: null, lastError: null }
          : { ...state.ui, lastError: null }
      });
    }

    case "connector/occupyCavity": {
      const connector = state.connectors.byId[action.payload.connectorId];
      if (connector === undefined) {
        return withError(state, "Cannot occupy cavity on unknown connector.");
      }

      if (!isValidSlotIndex(action.payload.cavityIndex, connector.cavityCount)) {
        return withError(state, "Connector cavity index is out of range.");
      }

      const occupantRef = action.payload.occupantRef.trim();
      if (occupantRef.length === 0) {
        return withError(state, "Occupant reference must be non-empty.");
      }

      const connectorOccupancy = state.connectorCavityOccupancy[action.payload.connectorId] ?? {};
      const currentOccupant = connectorOccupancy[action.payload.cavityIndex];
      if (currentOccupant !== undefined && currentOccupant !== occupantRef) {
        return withError(
          state,
          `Cavity ${action.payload.cavityIndex} is already occupied by '${currentOccupant}'.`
        );
      }

      if (currentOccupant === occupantRef && state.ui.lastError === null) {
        return state;
      }

      return bumpRevision({
        ...clearLastError(state),
        connectorCavityOccupancy: {
          ...state.connectorCavityOccupancy,
          [action.payload.connectorId]: {
            ...connectorOccupancy,
            [action.payload.cavityIndex]: occupantRef
          }
        }
      });
    }

    case "connector/releaseCavity": {
      const connector = state.connectors.byId[action.payload.connectorId];
      if (connector === undefined) {
        return withError(state, "Cannot release cavity on unknown connector.");
      }

      if (!isValidSlotIndex(action.payload.cavityIndex, connector.cavityCount)) {
        return withError(state, "Connector cavity index is out of range.");
      }

      const connectorOccupancy = state.connectorCavityOccupancy[action.payload.connectorId];
      if (connectorOccupancy === undefined || connectorOccupancy[action.payload.cavityIndex] === undefined) {
        return clearLastError(state);
      }

      const nextConnectorOccupancy = { ...connectorOccupancy };
      delete nextConnectorOccupancy[action.payload.cavityIndex];

      const nextConnectorCavityOccupancy = { ...state.connectorCavityOccupancy };
      if (Object.keys(nextConnectorOccupancy).length === 0) {
        delete nextConnectorCavityOccupancy[action.payload.connectorId];
      } else {
        nextConnectorCavityOccupancy[action.payload.connectorId] = nextConnectorOccupancy;
      }

      return bumpRevision({
        ...clearLastError(state),
        connectorCavityOccupancy: nextConnectorCavityOccupancy
      });
    }

    case "splice/upsert": {
      const portCount = action.payload.portCount;
      if (!Number.isInteger(portCount) || portCount < 1) {
        return withError(state, "Splice portCount must be an integer >= 1.");
      }

      if (hasDuplicateSpliceTechnicalId(state, action.payload.id, action.payload.technicalId)) {
        return withError(state, `Splice technical ID '${action.payload.technicalId}' is already used.`);
      }

      const occupancy = state.splicePortOccupancy[action.payload.id];
      if (occupancy !== undefined) {
        const hasOutOfRangeOccupancy = Object.keys(occupancy)
          .map((key) => Number(key))
          .some((slot) => slot > portCount);

        if (hasOutOfRangeOccupancy) {
          return withError(
            state,
            "Splice portCount cannot be reduced below occupied port indexes."
          );
        }
      }

      return bumpRevision({
        ...clearLastError(state),
        splices: upsertEntity(state.splices, action.payload)
      });
    }

    case "splice/remove": {
      if (hasSpliceNodeReference(state, action.payload.id)) {
        return withError(state, "Cannot remove splice while a splice node references it.");
      }
      if (hasWireEndpointReferenceOnSplice(state, action.payload.id)) {
        return withError(state, "Cannot remove splice while wire endpoints reference it.");
      }

      const nextSplicePortOccupancy = { ...state.splicePortOccupancy };
      delete nextSplicePortOccupancy[action.payload.id];

      return bumpRevision({
        ...clearLastError(state),
        splices: removeEntity(state.splices, action.payload.id),
        splicePortOccupancy: nextSplicePortOccupancy,
        ui: shouldClearSelection(state.ui.selected, "splice", action.payload.id)
          ? { ...state.ui, selected: null, lastError: null }
          : { ...state.ui, lastError: null }
      });
    }

    case "splice/occupyPort": {
      const splice = state.splices.byId[action.payload.spliceId];
      if (splice === undefined) {
        return withError(state, "Cannot occupy port on unknown splice.");
      }

      if (!isValidSlotIndex(action.payload.portIndex, splice.portCount)) {
        return withError(state, "Splice port index is out of range.");
      }

      const occupantRef = action.payload.occupantRef.trim();
      if (occupantRef.length === 0) {
        return withError(state, "Occupant reference must be non-empty.");
      }

      const spliceOccupancy = state.splicePortOccupancy[action.payload.spliceId] ?? {};
      const currentOccupant = spliceOccupancy[action.payload.portIndex];
      if (currentOccupant !== undefined && currentOccupant !== occupantRef) {
        return withError(
          state,
          `Port ${action.payload.portIndex} is already occupied by '${currentOccupant}'.`
        );
      }

      if (currentOccupant === occupantRef && state.ui.lastError === null) {
        return state;
      }

      return bumpRevision({
        ...clearLastError(state),
        splicePortOccupancy: {
          ...state.splicePortOccupancy,
          [action.payload.spliceId]: {
            ...spliceOccupancy,
            [action.payload.portIndex]: occupantRef
          }
        }
      });
    }

    case "splice/releasePort": {
      const splice = state.splices.byId[action.payload.spliceId];
      if (splice === undefined) {
        return withError(state, "Cannot release port on unknown splice.");
      }

      if (!isValidSlotIndex(action.payload.portIndex, splice.portCount)) {
        return withError(state, "Splice port index is out of range.");
      }

      const spliceOccupancy = state.splicePortOccupancy[action.payload.spliceId];
      if (spliceOccupancy === undefined || spliceOccupancy[action.payload.portIndex] === undefined) {
        return clearLastError(state);
      }

      const nextSpliceOccupancy = { ...spliceOccupancy };
      delete nextSpliceOccupancy[action.payload.portIndex];

      const nextSplicePortOccupancy = { ...state.splicePortOccupancy };
      if (Object.keys(nextSpliceOccupancy).length === 0) {
        delete nextSplicePortOccupancy[action.payload.spliceId];
      } else {
        nextSplicePortOccupancy[action.payload.spliceId] = nextSpliceOccupancy;
      }

      return bumpRevision({
        ...clearLastError(state),
        splicePortOccupancy: nextSplicePortOccupancy
      });
    }

    case "node/upsert": {
      if (action.payload.kind === "connector") {
        if (state.connectors.byId[action.payload.connectorId] === undefined) {
          return withError(state, "Cannot create connector node for unknown connector.");
        }

        if (hasConnectorNodeConflict(state, action.payload.id, action.payload.connectorId)) {
          return withError(state, "Only one connector node is allowed per connector.");
        }
      }

      if (action.payload.kind === "splice") {
        if (state.splices.byId[action.payload.spliceId] === undefined) {
          return withError(state, "Cannot create splice node for unknown splice.");
        }

        if (hasSpliceNodeConflict(state, action.payload.id, action.payload.spliceId)) {
          return withError(state, "Only one splice node is allowed per splice.");
        }
      }

      if (action.payload.kind === "intermediate" && action.payload.label.trim().length === 0) {
        return withError(state, "Intermediate node label must be non-empty.");
      }

      return bumpRevision({
        ...clearLastError(state),
        nodes: upsertEntity(state.nodes, action.payload)
      });
    }

    case "node/remove": {
      const linkedSegments = countSegmentsUsingNode(state, action.payload.id);
      if (linkedSegments > 0) {
        return withError(state, "Cannot remove node while segments are connected to it.");
      }

      return bumpRevision({
        ...clearLastError(state),
        nodes: removeEntity(state.nodes, action.payload.id),
        ui: shouldClearSelection(state.ui.selected, "node", action.payload.id)
          ? { ...state.ui, selected: null, lastError: null }
          : { ...state.ui, lastError: null }
      });
    }

    case "segment/upsert": {
      if (action.payload.nodeA === action.payload.nodeB) {
        return withError(state, "Segment endpoints must reference two different nodes.");
      }

      if (state.nodes.byId[action.payload.nodeA] === undefined || state.nodes.byId[action.payload.nodeB] === undefined) {
        return withError(state, "Segment endpoints must reference existing nodes.");
      }

      if (!Number.isFinite(action.payload.lengthMm) || action.payload.lengthMm <= 0) {
        return withError(state, "Segment lengthMm must be a positive number.");
      }

      const normalizedSubNetworkTag = action.payload.subNetworkTag?.trim();
      const stateWithUpdatedSegments = {
        ...clearLastError(state),
        segments: upsertEntity(state.segments, {
          ...action.payload,
          subNetworkTag: normalizedSubNetworkTag === undefined || normalizedSubNetworkTag.length === 0
            ? undefined
            : normalizedSubNetworkTag
        })
      };

      const recomputed = recomputeAllWiresForNetwork(stateWithUpdatedSegments);
      if ("error" in recomputed) {
        return withError(state, recomputed.error);
      }

      return bumpRevision({
        ...stateWithUpdatedSegments,
        wires: recomputed.wires
      });
    }

    case "segment/remove": {
      const stateWithRemovedSegment = {
        ...clearLastError(state),
        segments: removeEntity(state.segments, action.payload.id),
        ui: shouldClearSelection(state.ui.selected, "segment", action.payload.id)
          ? { ...state.ui, selected: null, lastError: null }
          : { ...state.ui, lastError: null }
      };

      const recomputed = recomputeAllWiresForNetwork(stateWithRemovedSegment);
      if ("error" in recomputed) {
        return withError(state, recomputed.error);
      }

      return bumpRevision({
        ...stateWithRemovedSegment,
        wires: recomputed.wires
      });
    }

    case "wire/save": {
      const normalizedName = action.payload.name.trim();
      const normalizedTechnicalId = action.payload.technicalId.trim();
      if (normalizedName.length === 0 || normalizedTechnicalId.length === 0) {
        return withError(state, "Wire name and technical ID are required.");
      }

      if (hasDuplicateWireTechnicalId(state, action.payload.id, normalizedTechnicalId)) {
        return withError(state, `Wire technical ID '${normalizedTechnicalId}' is already used.`);
      }

      const endpointAError = getEndpointValidationError(state, action.payload.endpointA);
      if (endpointAError !== null) {
        return withError(state, endpointAError);
      }

      const endpointBError = getEndpointValidationError(state, action.payload.endpointB);
      if (endpointBError !== null) {
        return withError(state, endpointBError);
      }

      if (getEndpointKey(action.payload.endpointA) === getEndpointKey(action.payload.endpointB)) {
        return withError(state, "Wire endpoints must be different.");
      }

      const startNodeId = findNodeIdForEndpoint(state, action.payload.endpointA);
      const endNodeId = findNodeIdForEndpoint(state, action.payload.endpointB);
      if (startNodeId === undefined || endNodeId === undefined) {
        return withError(state, "Wire endpoints must be mapped to routing graph nodes.");
      }

      const existingWire = state.wires.byId[action.payload.id];
      const graph = buildRoutingGraphIndex(
        state.nodes.allIds
          .map((nodeId) => state.nodes.byId[nodeId])
          .filter((node): node is NonNullable<typeof node> => node !== undefined),
        state.segments.allIds
          .map((segmentId) => state.segments.byId[segmentId])
          .filter((segment): segment is NonNullable<typeof segment> => segment !== undefined)
      );

      let routeSegmentIds: SegmentId[] = [];
      let lengthMm = 0;
      let isRouteLocked = false;

      const sameEndpointsAsExisting =
        existingWire !== undefined &&
        getEndpointKey(existingWire.endpointA) === getEndpointKey(action.payload.endpointA) &&
        getEndpointKey(existingWire.endpointB) === getEndpointKey(action.payload.endpointB);

      if (existingWire !== undefined && existingWire.isRouteLocked && sameEndpointsAsExisting) {
        const forcedLength = computeForcedRouteLength(state, startNodeId, endNodeId, existingWire.routeSegmentIds);
        if (forcedLength === null) {
          return withError(state, "Existing locked route is invalid for the current network.");
        }

        routeSegmentIds = existingWire.routeSegmentIds;
        lengthMm = forcedLength;
        isRouteLocked = true;
      } else {
        const shortestRoute = findShortestRoute(graph, startNodeId, endNodeId);
        if (shortestRoute === null) {
          return withError(state, "No valid route was found between selected wire endpoints.");
        }

        routeSegmentIds = shortestRoute.segmentIds;
        lengthMm = shortestRoute.totalLengthMm;
        isRouteLocked = false;
      }

      const nextConnectorCavityOccupancy = { ...state.connectorCavityOccupancy };
      const nextSplicePortOccupancy = { ...state.splicePortOccupancy };

      if (existingWire !== undefined) {
        releaseEndpointOccupant(
          nextConnectorCavityOccupancy,
          nextSplicePortOccupancy,
          existingWire.endpointA,
          getWireEndpointOccupantRef(existingWire.id, "A")
        );
        releaseEndpointOccupant(
          nextConnectorCavityOccupancy,
          nextSplicePortOccupancy,
          existingWire.endpointB,
          getWireEndpointOccupantRef(existingWire.id, "B")
        );
      }

      const endpointAOccupant = getEndpointOccupant(
        nextConnectorCavityOccupancy,
        nextSplicePortOccupancy,
        action.payload.endpointA
      );
      const endpointBOccupant = getEndpointOccupant(
        nextConnectorCavityOccupancy,
        nextSplicePortOccupancy,
        action.payload.endpointB
      );
      const endpointAOccupantRef = getWireEndpointOccupantRef(action.payload.id, "A");
      const endpointBOccupantRef = getWireEndpointOccupantRef(action.payload.id, "B");

      if (
        endpointAOccupant !== undefined &&
        endpointAOccupant !== endpointAOccupantRef &&
        endpointAOccupant !== endpointBOccupantRef
      ) {
        return withError(state, "Wire endpoint A is already occupied.");
      }

      if (
        endpointBOccupant !== undefined &&
        endpointBOccupant !== endpointAOccupantRef &&
        endpointBOccupant !== endpointBOccupantRef
      ) {
        return withError(state, "Wire endpoint B is already occupied.");
      }

      setEndpointOccupant(
        nextConnectorCavityOccupancy,
        nextSplicePortOccupancy,
        action.payload.endpointA,
        endpointAOccupantRef
      );
      setEndpointOccupant(
        nextConnectorCavityOccupancy,
        nextSplicePortOccupancy,
        action.payload.endpointB,
        endpointBOccupantRef
      );

      return bumpRevision({
        ...clearLastError(state),
        connectorCavityOccupancy: nextConnectorCavityOccupancy,
        splicePortOccupancy: nextSplicePortOccupancy,
        wires: upsertEntity(state.wires, {
          id: action.payload.id,
          name: normalizedName,
          technicalId: normalizedTechnicalId,
          endpointA: action.payload.endpointA,
          endpointB: action.payload.endpointB,
          routeSegmentIds,
          lengthMm,
          isRouteLocked
        })
      });
    }

    case "wire/lockRoute": {
      const wire = state.wires.byId[action.payload.id];
      if (wire === undefined) {
        return withError(state, "Cannot lock route for unknown wire.");
      }

      const startNodeId = findNodeIdForEndpoint(state, wire.endpointA);
      const endNodeId = findNodeIdForEndpoint(state, wire.endpointB);
      if (startNodeId === undefined || endNodeId === undefined) {
        return withError(state, "Cannot lock route: wire endpoints are not mapped to graph nodes.");
      }

      const forcedLength = computeForcedRouteLength(state, startNodeId, endNodeId, action.payload.segmentIds);
      if (forcedLength === null) {
        return withError(state, "Forced route is invalid for selected wire endpoints.");
      }

      return bumpRevision({
        ...clearLastError(state),
        wires: upsertEntity(state.wires, {
          ...wire,
          routeSegmentIds: [...action.payload.segmentIds],
          lengthMm: forcedLength,
          isRouteLocked: true
        })
      });
    }

    case "wire/resetRoute": {
      const wire = state.wires.byId[action.payload.id];
      if (wire === undefined) {
        return withError(state, "Cannot reset route for unknown wire.");
      }

      const startNodeId = findNodeIdForEndpoint(state, wire.endpointA);
      const endNodeId = findNodeIdForEndpoint(state, wire.endpointB);
      if (startNodeId === undefined || endNodeId === undefined) {
        return withError(state, "Cannot reset route: wire endpoints are not mapped to graph nodes.");
      }

      const graph = buildRoutingGraphIndex(
        state.nodes.allIds
          .map((nodeId) => state.nodes.byId[nodeId])
          .filter((node): node is NonNullable<typeof node> => node !== undefined),
        state.segments.allIds
          .map((segmentId) => state.segments.byId[segmentId])
          .filter((segment): segment is NonNullable<typeof segment> => segment !== undefined)
      );
      const shortestRoute = findShortestRoute(graph, startNodeId, endNodeId);
      if (shortestRoute === null) {
        return withError(state, "No valid shortest route was found for this wire.");
      }

      return bumpRevision({
        ...clearLastError(state),
        wires: upsertEntity(state.wires, {
          ...wire,
          routeSegmentIds: shortestRoute.segmentIds,
          lengthMm: shortestRoute.totalLengthMm,
          isRouteLocked: false
        })
      });
    }

    case "wire/upsert": {
      return bumpRevision({
        ...clearLastError(state),
        wires: upsertEntity(state.wires, action.payload)
      });
    }

    case "wire/remove": {
      const wire = state.wires.byId[action.payload.id];
      if (wire === undefined) {
        return clearLastError(state);
      }

      const nextConnectorCavityOccupancy = { ...state.connectorCavityOccupancy };
      const nextSplicePortOccupancy = { ...state.splicePortOccupancy };
      releaseEndpointOccupant(
        nextConnectorCavityOccupancy,
        nextSplicePortOccupancy,
        wire.endpointA,
        getWireEndpointOccupantRef(wire.id, "A")
      );
      releaseEndpointOccupant(
        nextConnectorCavityOccupancy,
        nextSplicePortOccupancy,
        wire.endpointB,
        getWireEndpointOccupantRef(wire.id, "B")
      );

      return bumpRevision({
        ...clearLastError(state),
        connectorCavityOccupancy: nextConnectorCavityOccupancy,
        splicePortOccupancy: nextSplicePortOccupancy,
        wires: removeEntity(state.wires, action.payload.id),
        ui: shouldClearSelection(state.ui.selected, "wire", action.payload.id)
          ? { ...state.ui, selected: null, lastError: null }
          : { ...state.ui, lastError: null }
      });
    }

    case "ui/select": {
      return bumpRevision({
        ...clearLastError(state),
        ui: {
          ...state.ui,
          selected: action.payload,
          lastError: null
        }
      });
    }

    case "ui/clearSelection": {
      if (state.ui.selected === null) {
        return clearLastError(state);
      }

      return bumpRevision({
        ...clearLastError(state),
        ui: {
          ...state.ui,
          selected: null,
          lastError: null
        }
      });
    }

    case "ui/clearError": {
      return clearLastError(state);
    }

    default: {
      const unhandled: never = action;
      return unhandled;
    }
  }
}
