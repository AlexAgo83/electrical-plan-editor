import { describe, expect, it } from "vitest";
import type { NodeId, Segment, SegmentId } from "../core/entities";
import { buildRenderedSegments } from "../app/components/network-summary/graph/networkSummaryGraphModel";

function asNodeId(value: string): NodeId {
  return value as NodeId;
}

function asSegmentId(value: string): SegmentId {
  return value as SegmentId;
}

describe("buildRenderedSegments", () => {
  it("offsets single labels off the segment centerline and increases the offset for near-horizontal segments", () => {
    const horizontalSegment: Segment = {
      id: asSegmentId("SEG-H"),
      nodeA: asNodeId("N-A"),
      nodeB: asNodeId("N-B"),
      lengthMm: 50
    };
    const diagonalSegment: Segment = {
      id: asSegmentId("SEG-D"),
      nodeA: asNodeId("N-C"),
      nodeB: asNodeId("N-D"),
      lengthMm: 70
    };

    const rendered = buildRenderedSegments({
      segments: [horizontalSegment, diagonalSegment],
      networkNodePositions: {
        [asNodeId("N-A")]: { x: 0, y: 0 },
        [asNodeId("N-B")]: { x: 100, y: 0 },
        [asNodeId("N-C")]: { x: 0, y: 0 },
        [asNodeId("N-D")]: { x: 80, y: 60 }
      },
      segmentSubNetworkTagById: new Map(),
      isSubNetworkFilteringActive: false,
      activeSubNetworkTagSet: new Set(),
      selectedWireRouteSegmentIds: new Set(),
      selectedSegmentId: null,
      autoSegmentLabelRotation: true,
      labelRotationDegrees: 0,
      showSegmentNames: false,
      showSegmentLengths: true
    });

    const renderedHorizontal = rendered.find((entry) => entry.segment.id === horizontalSegment.id);
    const renderedDiagonal = rendered.find((entry) => entry.segment.id === diagonalSegment.id);

    expect(renderedHorizontal).toBeDefined();
    expect(renderedDiagonal).toBeDefined();
    expect(renderedHorizontal?.segmentLengthLabelY).not.toBe(0);
    expect(Math.abs(renderedHorizontal?.segmentLengthLabelY ?? 0)).toBeGreaterThan(
      Math.abs(renderedDiagonal?.segmentLengthLabelY ?? 0)
    );
  });
});
