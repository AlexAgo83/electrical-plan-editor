import type {
  NodeId,
  Segment,
  SegmentId,
  Splice,
  SpliceId,
  SplicePlacement,
  Wire,
  WireRouteEndpointDetail
} from "./entities";

export type SplicePlacementInvalidReason =
  | "missingPlacement"
  | "invalidOffsetValue"
  | "missingSegment"
  | "invalidFromNode"
  | "offsetOutOfRange"
  | "rearBackshellLinkSegment";

export interface ResolvedSplicePlacement {
  status: "placed";
  spliceId: SpliceId;
  segmentId: SegmentId;
  fromNodeId: NodeId;
  toNodeId: NodeId;
  offsetMm: number;
  segmentLengthMm: number;
  remainderMm: number;
  ratio: number;
}

export interface UnresolvedSplicePlacement {
  status: "unplaced" | "invalid";
  spliceId: SpliceId;
  reason: SplicePlacementInvalidReason;
}

export type SplicePlacementResolution = ResolvedSplicePlacement | UnresolvedSplicePlacement;

export function isPlacedSplice(resolution: SplicePlacementResolution): resolution is ResolvedSplicePlacement {
  return resolution.status === "placed";
}

export function resolveSplicePlacementFromEntities(
  splice: Splice,
  getSegmentById: (segmentId: SegmentId) => Segment | undefined
): SplicePlacementResolution {
  const placement = splice.placement;
  if (placement === undefined) {
    return { status: "unplaced", spliceId: splice.id, reason: "missingPlacement" };
  }

  if (!Number.isFinite(placement.offsetMm) || placement.offsetMm < 0) {
    return { status: "invalid", spliceId: splice.id, reason: "invalidOffsetValue" };
  }

  const segment = getSegmentById(placement.segmentId);
  if (segment === undefined) {
    return { status: "invalid", spliceId: splice.id, reason: "missingSegment" };
  }

  if (segment.role === "rearBackshellLink") {
    return { status: "invalid", spliceId: splice.id, reason: "rearBackshellLinkSegment" };
  }

  if (placement.fromNodeId !== segment.nodeA && placement.fromNodeId !== segment.nodeB) {
    return { status: "invalid", spliceId: splice.id, reason: "invalidFromNode" };
  }

  if (placement.offsetMm > segment.lengthMm) {
    return { status: "invalid", spliceId: splice.id, reason: "offsetOutOfRange" };
  }

  const toNodeId = placement.fromNodeId === segment.nodeA ? segment.nodeB : segment.nodeA;

  return {
    status: "placed",
    spliceId: splice.id,
    segmentId: segment.id,
    fromNodeId: placement.fromNodeId,
    toNodeId,
    offsetMm: placement.offsetMm,
    segmentLengthMm: segment.lengthMm,
    remainderMm: segment.lengthMm - placement.offsetMm,
    ratio: segment.lengthMm > 0 ? placement.offsetMm / segment.lengthMm : 0
  };
}

export function normalizeSplicePlacement(value: unknown): SplicePlacement | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  if (record.kind !== "segmentOffset") {
    return undefined;
  }
  if (typeof record.segmentId !== "string" || record.segmentId.length === 0) {
    return undefined;
  }
  if (typeof record.fromNodeId !== "string" || record.fromNodeId.length === 0) {
    return undefined;
  }
  if (typeof record.offsetMm !== "number" || !Number.isFinite(record.offsetMm) || record.offsetMm < 0) {
    return undefined;
  }

  return {
    kind: "segmentOffset",
    segmentId: record.segmentId as SegmentId,
    fromNodeId: record.fromNodeId as NodeId,
    offsetMm: record.offsetMm
  };
}

export function isSameSplicePlacement(
  left: SplicePlacement | undefined,
  right: SplicePlacement | undefined
): boolean {
  if (left === undefined || right === undefined) {
    return left === right;
  }

  return (
    left.segmentId === right.segmentId &&
    left.fromNodeId === right.fromNodeId &&
    left.offsetMm === right.offsetMm
  );
}

export function clampSplicePlacementOffset(placement: SplicePlacement, segmentLengthMm: number): SplicePlacement {
  if (placement.offsetMm <= segmentLengthMm) {
    return placement;
  }

  return {
    ...placement,
    offsetMm: segmentLengthMm
  };
}

/**
 * Wire length contract: middle segments count at full length while the first and
 * last segments are replaced by their covered portions when endpoint detail
 * exists. A single-segment route with detail on both endpoints counts the
 * covered portion once (both details describe the same traversal).
 */
export function computeRouteLengthWithEndpointDetails(
  routeSegmentIds: SegmentId[],
  getSegmentLengthMm: (segmentId: SegmentId) => number | undefined,
  detailA: WireRouteEndpointDetail | undefined,
  detailB: WireRouteEndpointDetail | undefined
): number | null {
  if (routeSegmentIds.length === 0) {
    return detailA === undefined && detailB === undefined ? 0 : null;
  }

  const firstSegmentId = routeSegmentIds[0];
  const lastSegmentId = routeSegmentIds[routeSegmentIds.length - 1];
  if (detailA !== undefined && detailA.segmentId !== firstSegmentId) {
    return null;
  }
  if (detailB !== undefined && detailB.segmentId !== lastSegmentId) {
    return null;
  }

  if (routeSegmentIds.length === 1) {
    const segmentLengthMm = firstSegmentId === undefined ? undefined : getSegmentLengthMm(firstSegmentId);
    if (segmentLengthMm === undefined) {
      return null;
    }
    if (detailA !== undefined) {
      return detailA.coveredLengthMm;
    }
    if (detailB !== undefined) {
      return detailB.coveredLengthMm;
    }
    return segmentLengthMm;
  }

  let totalLengthMm = 0;
  for (let index = 0; index < routeSegmentIds.length; index += 1) {
    const segmentId = routeSegmentIds[index];
    if (segmentId === undefined) {
      return null;
    }

    if (index === 0 && detailA !== undefined) {
      totalLengthMm += detailA.coveredLengthMm;
      continue;
    }
    if (index === routeSegmentIds.length - 1 && detailB !== undefined) {
      totalLengthMm += detailB.coveredLengthMm;
      continue;
    }

    const segmentLengthMm = getSegmentLengthMm(segmentId);
    if (segmentLengthMm === undefined) {
      return null;
    }
    totalLengthMm += segmentLengthMm;
  }

  return totalLengthMm;
}

export function getWireRouteEndpointDetail(wire: Wire, side: "A" | "B"): WireRouteEndpointDetail | undefined {
  return side === "A" ? wire.routeEndpointDetailA : wire.routeEndpointDetailB;
}

export function normalizeWireRouteEndpointDetail(value: unknown): WireRouteEndpointDetail | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  if (typeof record.segmentId !== "string" || record.segmentId.length === 0) {
    return undefined;
  }
  if (
    typeof record.coveredLengthMm !== "number" ||
    !Number.isFinite(record.coveredLengthMm) ||
    record.coveredLengthMm < 0
  ) {
    return undefined;
  }

  return {
    segmentId: record.segmentId as SegmentId,
    coveredLengthMm: record.coveredLengthMm
  };
}
