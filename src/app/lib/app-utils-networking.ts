import type {
  ConnectorId,
  NodeId,
  Segment,
  SegmentId,
  SpliceId,
  WireEndpoint,
  WireId
} from "../../core/entities";

export function toConnectorOccupancyKey(connectorId: ConnectorId, cavityIndex: number): string {
  return `${connectorId}:${cavityIndex}`;
}

export function toSpliceOccupancyKey(spliceId: SpliceId, portIndex: number): string {
  return `${spliceId}:${portIndex}`;
}

export function parseWireOccupantRef(raw: string): { wireId: WireId; side: "A" | "B" } | null {
  const trimmed = raw.trim();
  const match = /^wire:([^:]+):(A|B)$/.exec(trimmed);
  if (match === null) {
    return null;
  }

  const wireIdCandidate = match[1];
  const sideCandidate = match[2];
  if (wireIdCandidate === undefined || sideCandidate === undefined) {
    return null;
  }

  return {
    wireId: wireIdCandidate as WireId,
    side: sideCandidate as "A" | "B"
  };
}

export function resolveEndpointNodeId(
  endpoint: WireEndpoint,
  connectorNodeByConnectorId: Map<ConnectorId, NodeId>,
  spliceNodeBySpliceId: Map<SpliceId, NodeId>
): NodeId | null {
  if (endpoint.kind === "connectorCavity") {
    return connectorNodeByConnectorId.get(endpoint.connectorId) ?? null;
  }

  return spliceNodeBySpliceId.get(endpoint.spliceId) ?? null;
}

export function isOrderedRouteValid(
  routeSegmentIds: SegmentId[],
  startNodeId: NodeId,
  endNodeId: NodeId,
  segmentMap: Map<SegmentId, Segment>
): boolean {
  let currentNodeId = startNodeId;
  for (const segmentId of routeSegmentIds) {
    const segment = segmentMap.get(segmentId);
    if (segment === undefined) {
      return false;
    }

    if (segment.nodeA === currentNodeId) {
      currentNodeId = segment.nodeB;
      continue;
    }

    if (segment.nodeB === currentNodeId) {
      currentNodeId = segment.nodeA;
      continue;
    }

    return false;
  }

  return currentNodeId === endNodeId;
}
