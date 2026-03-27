import type {
  CatalogItemId,
  ConnectorId,
  NetworkNode,
  NodeId,
  SegmentId,
  SpliceId,
  Wire,
  WireId
} from "../core/entities";
import { recomputeAllWiresForNetwork } from "./reducer/helpers/wireTransitions";
import { clearLastError, removeEntity, shouldClearSelection } from "./reducer/shared";
import type { AppState } from "./types";

export interface DeleteDependencySummaryCategory {
  key: string;
  label: string;
  count: number;
  references: string[];
}

interface DeleteImpactDetails {
  message: string;
  categories: DeleteDependencySummaryCategory[];
  note?: string;
}

export type ConnectorDeleteImpact =
  | { kind: "direct" }
  | ({ kind: "blocked" } & DeleteImpactDetails)
  | ({ kind: "cascade"; linkedNodeIds: NodeId[] } & DeleteImpactDetails);

export type SpliceDeleteImpact =
  | { kind: "direct" }
  | ({ kind: "blocked" } & DeleteImpactDetails)
  | ({ kind: "cascade"; linkedNodeIds: NodeId[] } & DeleteImpactDetails);

export type NodeDeleteImpact = { kind: "direct" } | ({ kind: "blocked" } & DeleteImpactDetails);
export type CatalogDeleteImpact = { kind: "direct" } | ({ kind: "blocked" } & DeleteImpactDetails);
export type SegmentDeleteImpact = { kind: "direct" } | ({ kind: "blocked" } & DeleteImpactDetails);

const REPRESENTATIVE_REFERENCE_LIMIT = 3;

function normalizeLabel(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function firstLabel(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    const normalized = normalizeLabel(value);
    if (normalized !== null) {
      return normalized;
    }
  }
  return null;
}

function formatConnectorRef(state: AppState, connectorId: ConnectorId): string {
  const connector = state.connectors.byId[connectorId];
  return firstLabel(connector?.technicalId, connector?.name, connectorId) ?? connectorId;
}

function formatSpliceRef(state: AppState, spliceId: SpliceId): string {
  const splice = state.splices.byId[spliceId];
  return firstLabel(splice?.technicalId, splice?.name, spliceId) ?? spliceId;
}

function formatWireRef(state: AppState, wireId: WireId): string {
  const wire = state.wires.byId[wireId];
  return firstLabel(wire?.technicalId, wire?.name, wireId) ?? wireId;
}

function formatCatalogRef(state: AppState, catalogItemId: CatalogItemId): string {
  const item = state.catalogItems.byId[catalogItemId];
  return firstLabel(item?.manufacturerReference, item?.name, catalogItemId) ?? catalogItemId;
}

function formatNodeRef(node: NetworkNode): string {
  if (node.kind === "intermediate") {
    return firstLabel(node.id, node.label) ?? node.id;
  }
  return node.id;
}

function formatSegmentRef(state: AppState, segmentId: SegmentId): string {
  const segment = state.segments.byId[segmentId];
  if (segment === undefined) {
    return segmentId;
  }
  return firstLabel(segment.id, `${segment.nodeA} -> ${segment.nodeB}`) ?? segmentId;
}

function buildCategory(key: string, label: string, refs: string[]): DeleteDependencySummaryCategory | null {
  if (refs.length === 0) {
    return null;
  }
  const normalizedRefs = [...new Set(refs)].sort((left, right) => left.localeCompare(right, undefined, { sensitivity: "base" }));
  return {
    key,
    label,
    count: normalizedRefs.length,
    references: normalizedRefs.slice(0, REPRESENTATIVE_REFERENCE_LIMIT)
  };
}

function buildReferencesNote(categories: DeleteDependencySummaryCategory[], baseNote?: string): string | undefined {
  const hasTruncatedCategory = categories.some((category) => category.count > category.references.length);
  if (!hasTruncatedCategory) {
    return baseNote;
  }
  const truncationNote = `Showing up to ${REPRESENTATIVE_REFERENCE_LIMIT} representative references per category.`;
  return baseNote === undefined ? truncationNote : `${baseNote} ${truncationNote}`;
}

function getConnectorLinkedNodes(state: AppState, connectorId: ConnectorId): NetworkNode[] {
  return state.nodes.allIds
    .map((nodeId) => state.nodes.byId[nodeId])
    .filter((node): node is NetworkNode => node?.kind === "connector" && node.connectorId === connectorId);
}

function getSpliceLinkedNodes(state: AppState, spliceId: SpliceId): NetworkNode[] {
  return state.nodes.allIds
    .map((nodeId) => state.nodes.byId[nodeId])
    .filter((node): node is NetworkNode => node?.kind === "splice" && node.spliceId === spliceId);
}

function getConnectedSegmentIds(state: AppState, nodeIds: readonly NodeId[]): SegmentId[] {
  const nodeIdSet = new Set(nodeIds);
  return state.segments.allIds.filter((segmentId) => {
    const segment = state.segments.byId[segmentId];
    return segment !== undefined && (nodeIdSet.has(segment.nodeA) || nodeIdSet.has(segment.nodeB));
  });
}

function getConnectorWireIds(state: AppState, connectorId: ConnectorId): WireId[] {
  return state.wires.allIds.filter((wireId) => {
    const wire = state.wires.byId[wireId];
    return (
      wire !== undefined &&
      ((wire.endpointA.kind === "connectorCavity" && wire.endpointA.connectorId === connectorId) ||
        (wire.endpointB.kind === "connectorCavity" && wire.endpointB.connectorId === connectorId))
    );
  });
}

function getSpliceWireIds(state: AppState, spliceId: SpliceId): WireId[] {
  return state.wires.allIds.filter((wireId) => {
    const wire = state.wires.byId[wireId];
    return (
      wire !== undefined &&
      ((wire.endpointA.kind === "splicePort" && wire.endpointA.spliceId === spliceId) ||
        (wire.endpointB.kind === "splicePort" && wire.endpointB.spliceId === spliceId))
    );
  });
}

function getSegmentImpactedWires(state: AppState, segmentId: SegmentId): Wire[] {
  return state.wires.allIds
    .map((wireId) => state.wires.byId[wireId])
    .filter((wire): wire is Wire => wire !== undefined && wire.routeSegmentIds.includes(segmentId));
}

export function analyzeConnectorDeleteImpact(state: AppState, connectorId: ConnectorId): ConnectorDeleteImpact {
  const linkedNodes = getConnectorLinkedNodes(state, connectorId);
  const linkedNodeIds = linkedNodes.map((node) => node.id);
  const connectedSegmentIds = getConnectedSegmentIds(state, linkedNodeIds);
  const wireIds = getConnectorWireIds(state, connectorId);

  if (linkedNodes.length === 0 && connectedSegmentIds.length === 0 && wireIds.length === 0) {
    return { kind: "direct" };
  }

  const categories = [
    buildCategory("connectorNodes", "Connector nodes", linkedNodes.map(formatNodeRef)),
    buildCategory("connectedSegments", "Connected segments", connectedSegmentIds.map((segmentId) => formatSegmentRef(state, segmentId))),
    buildCategory("wireEndpoints", "Wire endpoints", wireIds.map((wireId) => formatWireRef(state, wireId)))
  ].filter((category): category is DeleteDependencySummaryCategory => category !== null);

  if (linkedNodes.length > 0 && connectedSegmentIds.length === 0 && wireIds.length === 0) {
    return {
      kind: "cascade",
      linkedNodeIds,
      message: `Connector '${formatConnectorRef(state, connectorId)}' is still referenced by local connector nodes.`,
      categories,
      note: buildReferencesNote(
        categories,
        "You can delete this connector together with its linked connector node because no wires or segments depend on it."
      )
    };
  }

  const blockedReason =
    wireIds.length > 0
      ? "Cascade delete is unavailable because wire endpoints still reference this connector."
      : "Cascade delete is unavailable because connected segments still depend on its linked node.";

  return {
    kind: "blocked",
    message: `Connector '${formatConnectorRef(state, connectorId)}' cannot be deleted until the listed dependencies are removed.`,
    categories,
    note: buildReferencesNote(categories, blockedReason)
  };
}

export function analyzeSpliceDeleteImpact(state: AppState, spliceId: SpliceId): SpliceDeleteImpact {
  const linkedNodes = getSpliceLinkedNodes(state, spliceId);
  const linkedNodeIds = linkedNodes.map((node) => node.id);
  const connectedSegmentIds = getConnectedSegmentIds(state, linkedNodeIds);
  const wireIds = getSpliceWireIds(state, spliceId);

  if (linkedNodes.length === 0 && connectedSegmentIds.length === 0 && wireIds.length === 0) {
    return { kind: "direct" };
  }

  const categories = [
    buildCategory("spliceNodes", "Splice nodes", linkedNodes.map(formatNodeRef)),
    buildCategory("connectedSegments", "Connected segments", connectedSegmentIds.map((segmentId) => formatSegmentRef(state, segmentId))),
    buildCategory("wireEndpoints", "Wire endpoints", wireIds.map((wireId) => formatWireRef(state, wireId)))
  ].filter((category): category is DeleteDependencySummaryCategory => category !== null);

  if (linkedNodes.length > 0 && connectedSegmentIds.length === 0 && wireIds.length === 0) {
    return {
      kind: "cascade",
      linkedNodeIds,
      message: `Splice '${formatSpliceRef(state, spliceId)}' is still referenced by local splice nodes.`,
      categories,
      note: buildReferencesNote(
        categories,
        "You can delete this splice together with its linked splice node because no wires or segments depend on it."
      )
    };
  }

  const blockedReason =
    wireIds.length > 0
      ? "Cascade delete is unavailable because wire endpoints still reference this splice."
      : "Cascade delete is unavailable because connected segments still depend on its linked node.";

  return {
    kind: "blocked",
    message: `Splice '${formatSpliceRef(state, spliceId)}' cannot be deleted until the listed dependencies are removed.`,
    categories,
    note: buildReferencesNote(categories, blockedReason)
  };
}

export function analyzeNodeDeleteImpact(state: AppState, nodeId: NodeId): NodeDeleteImpact {
  const connectedSegmentIds = getConnectedSegmentIds(state, [nodeId]);
  if (connectedSegmentIds.length === 0) {
    return { kind: "direct" };
  }

  const categories = [
    buildCategory("connectedSegments", "Connected segments", connectedSegmentIds.map((segmentId) => formatSegmentRef(state, segmentId)))
  ].filter((category): category is DeleteDependencySummaryCategory => category !== null);

  return {
    kind: "blocked",
    message: `Node '${nodeId}' cannot be deleted while segments are connected to it.`,
    categories,
    note: buildReferencesNote(categories)
  };
}

export function analyzeCatalogDeleteImpact(state: AppState, catalogItemId: CatalogItemId): CatalogDeleteImpact {
  const connectorRefs = state.connectors.allIds
    .filter((connectorId) => state.connectors.byId[connectorId]?.catalogItemId === catalogItemId)
    .map((connectorId) => formatConnectorRef(state, connectorId));
  const spliceRefs = state.splices.allIds
    .filter((spliceId) => state.splices.byId[spliceId]?.catalogItemId === catalogItemId)
    .map((spliceId) => formatSpliceRef(state, spliceId));
  const wireRefs = state.wires.allIds
    .filter((wireId) => state.wires.byId[wireId]?.protection?.kind === "fuse" && state.wires.byId[wireId]?.protection?.catalogItemId === catalogItemId)
    .map((wireId) => formatWireRef(state, wireId));

  if (connectorRefs.length === 0 && spliceRefs.length === 0 && wireRefs.length === 0) {
    return { kind: "direct" };
  }

  const categories = [
    buildCategory("connectors", "Connectors", connectorRefs),
    buildCategory("splices", "Splices", spliceRefs),
    buildCategory("fuseWires", "Fuse wires", wireRefs)
  ].filter((category): category is DeleteDependencySummaryCategory => category !== null);

  return {
    kind: "blocked",
    message: `Catalog item '${formatCatalogRef(state, catalogItemId)}' cannot be deleted while other entities still reference it.`,
    categories,
    note: buildReferencesNote(categories)
  };
}

export function analyzeSegmentDeleteImpact(state: AppState, segmentId: SegmentId): SegmentDeleteImpact {
  const impactedWires = getSegmentImpactedWires(state, segmentId);
  if (impactedWires.length === 0) {
    return { kind: "direct" };
  }

  const stateWithRemovedSegment = {
    ...clearLastError(state),
    segments: removeEntity(state.segments, segmentId),
    ui: shouldClearSelection(state.ui.selected, "segment", segmentId)
      ? { ...state.ui, selected: null, lastError: null }
      : { ...state.ui, lastError: null }
  };

  const recomputed = recomputeAllWiresForNetwork(stateWithRemovedSegment);
  if (!("error" in recomputed)) {
    return { kind: "direct" };
  }

  const categories = [
    buildCategory("routedWires", "Routed wires", impactedWires.map((wire) => formatWireRef(state, wire.id)))
  ].filter((category): category is DeleteDependencySummaryCategory => category !== null);

  return {
    kind: "blocked",
    message: `Segment '${formatSegmentRef(state, segmentId)}' cannot be deleted because some wire routes would become invalid.`,
    categories,
    note: buildReferencesNote(categories, recomputed.error)
  };
}
