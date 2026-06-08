import {
  buildRearBackshellHelperNodeId,
  buildRearBackshellLinkSegmentId,
  findConnectorNodeId,
  findRearBackshellHelperNodeId,
  getEffectiveRearBackshellConfig,
  isRearBackshellLinkSegment
} from "../../../core/rearBackshell";
import type { CatalogItem, Connector, NodeId, Segment } from "../../../core/entities";
import type { AppState } from "../../types";
import { removeEntity, upsertEntity } from "../shared";

function buildDefaultHelperPosition(
  connectorPosition: { x: number; y: number } | undefined,
  lengthMm: number
): { x: number; y: number } {
  if (connectorPosition === undefined) {
    return { x: 120, y: 0 };
  }
  return {
    x: connectorPosition.x - Math.max(36, lengthMm),
    y: connectorPosition.y
  };
}

function rerouteSegmentEndpoint(segment: Segment, fromNodeId: NodeId, toNodeId: NodeId): Segment {
  return {
    ...segment,
    nodeA: segment.nodeA === fromNodeId ? toNodeId : segment.nodeA,
    nodeB: segment.nodeB === fromNodeId ? toNodeId : segment.nodeB
  };
}

export function applyRearBackshellTopologyToConnector(
  state: AppState,
  connector: Connector,
  catalogItem: CatalogItem | undefined
): AppState {
  const effective = getEffectiveRearBackshellConfig(connector, catalogItem);
  const connectorNodeId = findConnectorNodeId(state.nodes.byId, connector.id);
  const helperNodeId = findRearBackshellHelperNodeId(state.nodes.byId, connector.id);

  if (connectorNodeId === undefined) {
    return state;
  }

  if (effective === undefined) {
    if (helperNodeId === undefined) {
      return state;
    }

    let nextSegments = state.segments;
    for (const segmentId of state.segments.allIds) {
      const segment = state.segments.byId[segmentId];
      if (segment === undefined) {
        continue;
      }
      if (isRearBackshellLinkSegment(segment, connectorNodeId, helperNodeId)) {
        nextSegments = removeEntity(nextSegments, segmentId);
        continue;
      }
      if (segment.nodeA === helperNodeId || segment.nodeB === helperNodeId) {
        nextSegments = upsertEntity(nextSegments, rerouteSegmentEndpoint(segment, helperNodeId, connectorNodeId));
      }
    }

    const nextNodes = removeEntity(state.nodes, helperNodeId);
    const nextNodePositions = { ...state.nodePositions };
    delete nextNodePositions[helperNodeId];

    return {
      ...state,
      nodes: nextNodes,
      segments: nextSegments,
      nodePositions: nextNodePositions
    };
  }

  const resolvedHelperNodeId = helperNodeId ?? buildRearBackshellHelperNodeId(connector.id);
  const helperNode = state.nodes.byId[resolvedHelperNodeId];
  const nextNodes =
    helperNode === undefined
      ? upsertEntity(state.nodes, {
          id: resolvedHelperNodeId,
          kind: "connectorBackshellHelper",
          connectorId: connector.id
        })
      : state.nodes;

  const nextNodePositions = { ...state.nodePositions };
  if (nextNodePositions[resolvedHelperNodeId] === undefined) {
    nextNodePositions[resolvedHelperNodeId] = buildDefaultHelperPosition(
      state.nodePositions[connectorNodeId],
      effective.lengthMm
    );
  }

  const linkSegmentId = buildRearBackshellLinkSegmentId(connector.id);
  let nextSegments = upsertEntity(state.segments, {
    id: linkSegmentId,
    nodeA: connectorNodeId,
    nodeB: resolvedHelperNodeId,
    lengthMm: effective.lengthMm,
    role: "rearBackshellLink"
  });

  for (const segmentId of nextSegments.allIds) {
    const segment = nextSegments.byId[segmentId];
    if (segment === undefined || segment.id === linkSegmentId) {
      continue;
    }
    if ((segment.nodeA === connectorNodeId || segment.nodeB === connectorNodeId) &&
      !isRearBackshellLinkSegment(segment, connectorNodeId, resolvedHelperNodeId)) {
      nextSegments = upsertEntity(nextSegments, rerouteSegmentEndpoint(segment, connectorNodeId, resolvedHelperNodeId));
    }
  }

  return {
    ...state,
    nodes: nextNodes,
    segments: nextSegments,
    nodePositions: nextNodePositions
  };
}

export function resolveSegmentEndpointForRearBackshell(
  state: AppState,
  nodeId: NodeId,
  counterpartNodeId: NodeId,
  role: Segment["role"] | undefined
): NodeId {
  const node = state.nodes.byId[nodeId];
  if (node?.kind !== "connector") {
    return nodeId;
  }

  const connector = state.connectors.byId[node.connectorId];
  if (connector === undefined) {
    return nodeId;
  }
  const catalogItem =
    connector.catalogItemId === undefined ? undefined : state.catalogItems.byId[connector.catalogItemId];
  const effective = getEffectiveRearBackshellConfig(connector, catalogItem);
  if (effective === undefined) {
    return nodeId;
  }

  const helperNodeId = findRearBackshellHelperNodeId(state.nodes.byId, connector.id);
  if (helperNodeId === undefined) {
    return nodeId;
  }

  if (role === "rearBackshellLink" && counterpartNodeId === helperNodeId) {
    return nodeId;
  }

  return helperNodeId;
}
