import type {
  ConnectorId,
  NetworkNode,
  NodeId,
  Segment,
  SegmentId,
  SpliceId,
  WireEndpoint,
  WireId
} from "../../core/entities";
import type { NodePosition, SortDirection, SortField, SortState } from "../types/app-controller";

export const NETWORK_VIEW_WIDTH = 760;
export const NETWORK_VIEW_HEIGHT = 420;
export const HISTORY_LIMIT = 60;
export const NETWORK_GRID_STEP = 20;
export const NETWORK_MIN_SCALE = 0.6;
export const NETWORK_MAX_SCALE = 2.2;

export function createEntityId(prefix: string): string {
  const randomPart = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  return `${prefix}-${randomPart}`;
}

export function toPositiveInteger(raw: string): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, Math.trunc(parsed));
}

export function toPositiveNumber(raw: string): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return parsed;
}

export function normalizeSearch(raw: string): string {
  return raw.trim().toLocaleLowerCase();
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function snapToGrid(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function sortByNameAndTechnicalId<T>(
  items: T[],
  sortState: SortState,
  getName: (item: T) => string,
  getTechnicalId: (item: T) => string
): T[] {
  return [...items].sort((left, right) => {
    const leftPrimary = sortState.field === "name" ? getName(left) : getTechnicalId(left);
    const rightPrimary = sortState.field === "name" ? getName(right) : getTechnicalId(right);
    const primaryComparison = leftPrimary.localeCompare(rightPrimary, undefined, { sensitivity: "base" });
    if (primaryComparison !== 0) {
      return sortState.direction === "asc" ? primaryComparison : -primaryComparison;
    }

    const leftSecondary = sortState.field === "name" ? getTechnicalId(left) : getName(left);
    const rightSecondary = sortState.field === "name" ? getTechnicalId(right) : getName(right);
    return leftSecondary.localeCompare(rightSecondary, undefined, { sensitivity: "base" });
  });
}

export function sortById<T>(items: T[], direction: SortDirection, getId: (item: T) => string): T[] {
  return [...items].sort((left, right) => {
    const comparison = getId(left).localeCompare(getId(right), undefined, { sensitivity: "base" });
    return direction === "asc" ? comparison : -comparison;
  });
}

export function nextSortState(current: SortState, field: SortField): SortState {
  if (current.field !== field) {
    return { field, direction: "asc" };
  }

  return {
    field,
    direction: current.direction === "asc" ? "desc" : "asc"
  };
}

export function buildUniqueNetworkTechnicalId(baseTechnicalId: string, existingTechnicalIds: Set<string>): string {
  if (!existingTechnicalIds.has(baseTechnicalId)) {
    return baseTechnicalId;
  }

  let index = 1;
  let candidate = `${baseTechnicalId}-COPY`;
  while (existingTechnicalIds.has(candidate)) {
    index += 1;
    candidate = `${baseTechnicalId}-COPY-${index}`;
  }

  return candidate;
}

export function createNodePositionMap(nodes: NetworkNode[]): Record<NodeId, NodePosition> {
  const positions = {} as Record<NodeId, NodePosition>;
  if (nodes.length === 0) {
    return positions;
  }

  const centerX = NETWORK_VIEW_WIDTH / 2;
  const centerY = NETWORK_VIEW_HEIGHT / 2;
  if (nodes.length === 1) {
    const singleNode = nodes[0];
    if (singleNode !== undefined) {
      positions[singleNode.id] = { x: centerX, y: centerY };
    }
    return positions;
  }

  const radius = Math.min(NETWORK_VIEW_WIDTH, NETWORK_VIEW_HEIGHT) * 0.36;
  const orderedNodes = [...nodes].sort((left, right) => left.id.localeCompare(right.id));
  orderedNodes.forEach((node, index) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / orderedNodes.length;
    positions[node.id] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });

  return positions;
}

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
