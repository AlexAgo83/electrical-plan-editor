import type {
  NetworkNode,
  NodeId,
  Segment,
  SegmentId,
  Splice,
  SpliceId,
  Wire
} from "../../core/entities";
import {
  computeForcedRouteWithAnchors,
  recomputeWireRouteAndDirectionalEndpoints,
  resolveWireEndpointAnchor
} from "../../store/reducer/helpers/wireTransitions";
import { createEmptyWorkspaceState, type AppState, type NetworkScopedState } from "../../store/types";

export type SpliceMigrationActionKind =
  | "fusion"
  | "intermediateNode"
  | "unplacedDraft"
  | "routeRewrite"
  | "lockedRouteIssue"
  | "sideChange"
  | "metadataDivergenceFallback";

export interface SpliceMigrationReportEntry {
  kind: SpliceMigrationActionKind;
  message: string;
}

export interface SpliceNodeMigrationResult {
  state: NetworkScopedState;
  changed: boolean;
  report: SpliceMigrationReportEntry[];
}

export const MIGRATION_NODE_LABEL_PREFIX = "MIG-SPLICE-";

function wrapScopedState(scoped: NetworkScopedState): AppState {
  return {
    ...createEmptyWorkspaceState(),
    catalogItems: scoped.catalogItems,
    connectors: scoped.connectors,
    splices: scoped.splices,
    nodes: scoped.nodes,
    segments: scoped.segments,
    wires: scoped.wires,
    nodePositions: scoped.nodePositions,
    connectorCavityOccupancy: scoped.connectorCavityOccupancy,
    splicePortOccupancy: scoped.splicePortOccupancy
  };
}

function normalizeMetadataText(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized === undefined || normalized.length === 0 ? undefined : normalized;
}

function hasSameFusionMetadata(left: Segment, right: Segment): boolean {
  return (
    normalizeMetadataText(left.subNetworkTag) === normalizeMetadataText(right.subNetworkTag) &&
    normalizeMetadataText(left.sheathType) === normalizeMetadataText(right.sheathType) &&
    normalizeMetadataText(left.insulation) === normalizeMetadataText(right.insulation) &&
    normalizeMetadataText(left.lineStyle) === normalizeMetadataText(right.lineStyle) &&
    normalizeMetadataText(left.internalPartReference) === normalizeMetadataText(right.internalPartReference)
  );
}

function getOtherNodeId(segment: Segment, nodeId: NodeId): NodeId {
  return segment.nodeA === nodeId ? segment.nodeB : segment.nodeA;
}

function dedupeConsecutive(segmentIds: SegmentId[]): SegmentId[] {
  const deduped: SegmentId[] = [];
  for (const segmentId of segmentIds) {
    if (deduped[deduped.length - 1] !== segmentId) {
      deduped.push(segmentId);
    }
  }

  return deduped;
}

interface MigrationDraft {
  splicesById: Record<SpliceId, Splice>;
  nodesById: Record<NodeId, NetworkNode>;
  nodeAllIds: NodeId[];
  segmentsById: Record<SegmentId, Segment>;
  segmentAllIds: SegmentId[];
  wiresById: Record<string, Wire>;
  nodePositions: NetworkScopedState["nodePositions"];
}

function buildUniqueMigrationLabel(draft: MigrationDraft, technicalId: string): string {
  const existingLabels = new Set<string>();
  for (const nodeId of draft.nodeAllIds) {
    const node = draft.nodesById[nodeId];
    if (node?.kind === "intermediate") {
      existingLabels.add(node.label);
    }
  }

  const baseLabel = `${MIGRATION_NODE_LABEL_PREFIX}${technicalId}`;
  if (!existingLabels.has(baseLabel)) {
    return baseLabel;
  }
  let suffix = 2;
  while (existingLabels.has(`${baseLabel}-${String(suffix)}`)) {
    suffix += 1;
  }
  return `${baseLabel}-${String(suffix)}`;
}

function listAdjacentSegments(draft: MigrationDraft, nodeId: NodeId): Segment[] {
  return draft.segmentAllIds
    .map((segmentId) => draft.segmentsById[segmentId])
    .filter((segment): segment is Segment => segment !== undefined)
    .filter((segment) => segment.nodeA === nodeId || segment.nodeB === nodeId)
    .sort((left, right) => left.id.localeCompare(right.id));
}

function convertNodeToIntermediate(
  draft: MigrationDraft,
  nodeId: NodeId,
  splice: Splice,
  adjacentSegments: Segment[],
  report: SpliceMigrationReportEntry[],
  reason: "branch" | "degreeOne" | "unsafeFusion"
): void {
  const label = buildUniqueMigrationLabel(draft, splice.technicalId);
  draft.nodesById[nodeId] = {
    id: nodeId,
    kind: "intermediate",
    label
  };

  const hostSegment = adjacentSegments.find((segment) => segment.role !== "rearBackshellLink");
  if (hostSegment === undefined) {
    report.push({
      kind: "unplacedDraft",
      message: `Splice '${splice.technicalId}' could not be placed automatically (no eligible adjacent segment); it stays unplaced and needs manual placement.`
    });
    return;
  }

  draft.splicesById[splice.id] = {
    ...splice,
    placement: {
      kind: "segmentOffset",
      segmentId: hostSegment.id,
      fromNodeId: nodeId,
      offsetMm: 0
    }
  };

  const reasonText =
    reason === "branch"
      ? "branch topology preserved with a structural intermediate node"
      : reason === "degreeOne"
        ? "single adjacent segment endpoint converted to a structural intermediate node"
        : "segments were not fused (diverging metadata or unsafe topology); junction kept as a structural intermediate node";
  report.push({
    kind: reason === "unsafeFusion" ? "metadataDivergenceFallback" : "intermediateNode",
    message: `Splice '${splice.technicalId}': node '${nodeId}' became intermediate node '${label}' (${reasonText}); splice placed at 0 mm from it on segment '${hostSegment.id}'.`
  });
}

function fuseDegreeTwoNode(
  draft: MigrationDraft,
  nodeId: NodeId,
  splice: Splice,
  segLeft: Segment,
  segRight: Segment,
  report: SpliceMigrationReportEntry[]
): void {
  const surviving = segLeft.id.localeCompare(segRight.id) <= 0 ? segLeft : segRight;
  const removed = surviving === segLeft ? segRight : segLeft;
  const farKeep = getOtherNodeId(surviving, nodeId);
  const farRemove = getOtherNodeId(removed, nodeId);
  const survivingOldLengthMm = surviving.lengthMm;

  const fusedSegment: Segment = {
    ...surviving,
    nodeA: farKeep,
    nodeB: farRemove,
    lengthMm: surviving.lengthMm + removed.lengthMm,
    sheathCalloutPosition: surviving.sheathCalloutPosition ?? removed.sheathCalloutPosition,
    mountingLabels:
      surviving.mountingLabels === undefined && removed.mountingLabels === undefined
        ? undefined
        : [...(surviving.mountingLabels ?? []), ...(removed.mountingLabels ?? [])]
  };

  draft.segmentsById[surviving.id] = fusedSegment;
  delete draft.segmentsById[removed.id];
  draft.segmentAllIds = draft.segmentAllIds.filter((segmentId) => segmentId !== removed.id);

  delete draft.nodesById[nodeId];
  draft.nodeAllIds = draft.nodeAllIds.filter((candidate) => candidate !== nodeId);
  delete draft.nodePositions[nodeId];

  draft.splicesById[splice.id] = {
    ...splice,
    placement: {
      kind: "segmentOffset",
      segmentId: surviving.id,
      fromNodeId: farKeep,
      offsetMm: survivingOldLengthMm
    }
  };

  // Re-anchor placements created by earlier fusions in the same run when they
  // referenced the junction node or the removed segment.
  for (const [spliceId, otherSplice] of Object.entries(draft.splicesById)) {
    if (spliceId === splice.id) {
      continue;
    }
    const placement = otherSplice.placement;
    if (placement === undefined) {
      continue;
    }

    if (placement.segmentId === surviving.id) {
      if (placement.fromNodeId === nodeId) {
        draft.splicesById[spliceId as SpliceId] = {
          ...otherSplice,
          placement: {
            ...placement,
            fromNodeId: farKeep,
            offsetMm: survivingOldLengthMm - placement.offsetMm
          }
        };
      }
    } else if (placement.segmentId === removed.id) {
      draft.splicesById[spliceId as SpliceId] = {
        ...otherSplice,
        placement: {
          ...placement,
          segmentId: surviving.id,
          fromNodeId: placement.fromNodeId === nodeId ? farKeep : placement.fromNodeId,
          offsetMm:
            placement.fromNodeId === nodeId
              ? survivingOldLengthMm + placement.offsetMm
              : placement.offsetMm
        }
      };
    }
  }

  let rewrittenRouteCount = 0;
  for (const [wireId, wire] of Object.entries(draft.wiresById)) {
    const referencesFusion =
      wire.routeSegmentIds.includes(removed.id) ||
      wire.routeEndpointDetailA?.segmentId === removed.id ||
      wire.routeEndpointDetailB?.segmentId === removed.id;
    if (!referencesFusion) {
      continue;
    }

    draft.wiresById[wireId] = {
      ...wire,
      routeSegmentIds: dedupeConsecutive(
        wire.routeSegmentIds.map((segmentId) => (segmentId === removed.id ? surviving.id : segmentId))
      ),
      routeEndpointDetailA:
        wire.routeEndpointDetailA?.segmentId === removed.id
          ? { ...wire.routeEndpointDetailA, segmentId: surviving.id }
          : wire.routeEndpointDetailA,
      routeEndpointDetailB:
        wire.routeEndpointDetailB?.segmentId === removed.id
          ? { ...wire.routeEndpointDetailB, segmentId: surviving.id }
          : wire.routeEndpointDetailB
    };
    rewrittenRouteCount += 1;
  }

  report.push({
    kind: "fusion",
    message: `Splice '${splice.technicalId}': segments '${surviving.id}' and '${removed.id}' fused into '${surviving.id}' (${String(fusedSegment.lengthMm)} mm); splice placed at ${String(survivingOldLengthMm)} mm from node '${farKeep}'.`
  });
  if (rewrittenRouteCount > 0) {
    report.push({
      kind: "routeRewrite",
      message: `Splice '${splice.technicalId}': ${String(rewrittenRouteCount)} wire route(s) rewritten from segment '${removed.id}' to fused segment '${surviving.id}'.`
    });
  }
}

function describeEndpointSide(wire: Wire, side: "A" | "B"): string {
  const endpoint = side === "A" ? wire.endpointA : wire.endpointB;
  if (endpoint.kind !== "splicePort") {
    return "-";
  }
  return endpoint.spliceSideOverride ?? "-";
}

export function migrateLegacySpliceNodes(scoped: NetworkScopedState, networkLabel: string): SpliceNodeMigrationResult {
  const legacySpliceNodeIds = scoped.nodes.allIds
    .filter((nodeId) => scoped.nodes.byId[nodeId]?.kind === "splice")
    .sort((left, right) => left.localeCompare(right));

  if (legacySpliceNodeIds.length === 0) {
    return { state: scoped, changed: false, report: [] };
  }

  const report: SpliceMigrationReportEntry[] = [];
  const draft: MigrationDraft = {
    splicesById: { ...scoped.splices.byId },
    nodesById: { ...scoped.nodes.byId },
    nodeAllIds: [...scoped.nodes.allIds],
    segmentsById: { ...scoped.segments.byId },
    segmentAllIds: [...scoped.segments.allIds],
    wiresById: { ...scoped.wires.byId },
    nodePositions: { ...scoped.nodePositions }
  };

  for (const nodeId of legacySpliceNodeIds) {
    const node = draft.nodesById[nodeId];
    if (node?.kind !== "splice") {
      continue;
    }

    const splice = draft.splicesById[node.spliceId];
    if (splice === undefined) {
      // Orphan splice node: drop the node, nothing to place.
      delete draft.nodesById[nodeId];
      draft.nodeAllIds = draft.nodeAllIds.filter((candidate) => candidate !== nodeId);
      delete draft.nodePositions[nodeId];
      report.push({
        kind: "unplacedDraft",
        message: `Legacy splice node '${nodeId}' referenced missing splice '${node.spliceId}' and was removed.`
      });
      continue;
    }

    const adjacentSegments = listAdjacentSegments(draft, nodeId);

    if (adjacentSegments.length === 0) {
      delete draft.nodesById[nodeId];
      draft.nodeAllIds = draft.nodeAllIds.filter((candidate) => candidate !== nodeId);
      delete draft.nodePositions[nodeId];
      report.push({
        kind: "unplacedDraft",
        message: `Splice '${splice.technicalId}': isolated legacy splice node '${nodeId}' removed; the splice stays unplaced and needs manual placement.`
      });
      continue;
    }

    if (adjacentSegments.length === 1) {
      convertNodeToIntermediate(draft, nodeId, splice, adjacentSegments, report, "degreeOne");
      continue;
    }

    if (adjacentSegments.length === 2) {
      const [segLeft, segRight] = adjacentSegments;
      if (segLeft === undefined || segRight === undefined) {
        continue;
      }
      const farLeft = getOtherNodeId(segLeft, nodeId);
      const farRight = getOtherNodeId(segRight, nodeId);
      const fusionIsSafe =
        segLeft.role !== "rearBackshellLink" &&
        segRight.role !== "rearBackshellLink" &&
        farLeft !== farRight &&
        farLeft !== nodeId &&
        farRight !== nodeId &&
        hasSameFusionMetadata(segLeft, segRight);

      if (fusionIsSafe) {
        fuseDegreeTwoNode(draft, nodeId, splice, segLeft, segRight, report);
      } else {
        convertNodeToIntermediate(draft, nodeId, splice, adjacentSegments, report, "unsafeFusion");
      }
      continue;
    }

    convertNodeToIntermediate(draft, nodeId, splice, adjacentSegments, report, "branch");
  }

  let migratedScoped: NetworkScopedState = {
    ...scoped,
    splices: { byId: draft.splicesById, allIds: scoped.splices.allIds },
    nodes: { byId: draft.nodesById, allIds: draft.nodeAllIds },
    segments: { byId: draft.segmentsById, allIds: draft.segmentAllIds },
    wires: { byId: draft.wiresById, allIds: scoped.wires.allIds },
    nodePositions: draft.nodePositions
  };

  // Canonicalize every wire against the migrated topology: unlocked wires are
  // recomputed with the runtime routing (virtual splice points, endpoint
  // details), locked wires are validated/converted with the anchor-aware
  // forced-route check and reported when no longer resolvable.
  const wrapper = wrapScopedState(migratedScoped);
  const canonicalWiresById = { ...migratedScoped.wires.byId };
  for (const wireId of migratedScoped.wires.allIds) {
    const wire = canonicalWiresById[wireId];
    if (wire === undefined) {
      continue;
    }

    const touchesSplice =
      wire.endpointA.kind === "splicePort" || wire.endpointB.kind === "splicePort";

    if (wire.isRouteLocked) {
      const anchorAResult = resolveWireEndpointAnchor(wrapper, wire.endpointA);
      const anchorBResult = resolveWireEndpointAnchor(wrapper, wire.endpointB);
      if ("error" in anchorAResult || "error" in anchorBResult) {
        report.push({
          kind: "lockedRouteIssue",
          message: `Wire '${wire.technicalId}': locked route could not be converted (endpoint not resolvable after migration).`
        });
        continue;
      }
      const forced = computeForcedRouteWithAnchors(wrapper, anchorAResult.anchor, anchorBResult.anchor, wire.routeSegmentIds);
      if (forced === null) {
        report.push({
          kind: "lockedRouteIssue",
          message: `Wire '${wire.technicalId}': locked route is no longer valid after migration and needs manual review.`
        });
        continue;
      }
      canonicalWiresById[wireId] = {
        ...wire,
        lengthMm: forced.lengthMm,
        routeEndpointDetailA: forced.detailA,
        routeEndpointDetailB: forced.detailB
      };
      continue;
    }

    if (!touchesSplice && !wire.routeSegmentIds.some((segmentId) => migratedScoped.segments.byId[segmentId] === undefined)) {
      // Pure connector-to-connector wire with an intact route: untouched.
      continue;
    }

    const recomputed = recomputeWireRouteAndDirectionalEndpoints(wrapper, wire);
    if (!("wire" in recomputed)) {
      report.push({
        kind: "lockedRouteIssue",
        message: `Wire '${wire.technicalId}': route could not be recomputed after migration (${recomputed.error}).`
      });
      continue;
    }

    const previousWire = scoped.wires.byId[wireId];
    if (previousWire !== undefined) {
      for (const side of ["A", "B"] as const) {
        const beforeSide = describeEndpointSide(previousWire, side);
        const afterSide = describeEndpointSide(recomputed.wire, side);
        if (beforeSide !== afterSide && beforeSide !== "-" && afterSide !== "-") {
          report.push({
            kind: "sideChange",
            message: `Wire '${wire.technicalId}': directional splice side ${side} re-inferred from '${beforeSide}' to '${afterSide}'.`
          });
        }
      }
    }

    canonicalWiresById[wireId] = recomputed.wire;
  }

  migratedScoped = {
    ...migratedScoped,
    wires: { byId: canonicalWiresById, allIds: migratedScoped.wires.allIds }
  };

  const prefixedReport = report.map((entry) => ({
    ...entry,
    message: `[${networkLabel}] ${entry.message}`
  }));

  return { state: migratedScoped, changed: true, report: prefixedReport };
}
