import { describe, expect, it } from "vitest";
import type { NetworkNode, NodeId, Segment, SegmentId } from "../core/entities";
import {
  countSegmentCrossings,
  createNodePositionMap,
  NETWORK_VIEW_HEIGHT,
  NETWORK_VIEW_WIDTH
} from "../app/lib/app-utils";
import type { NodePosition } from "../app/types/app-controller";

function asNodeId(value: string): NodeId {
  return value as NodeId;
}

function asSegmentId(value: string): SegmentId {
  return value as SegmentId;
}

function createBaselineCircularLayout(nodes: NetworkNode[]): Record<NodeId, NodePosition> {
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

describe("2D layout generation", () => {
  it("reduces visual segment crossings versus baseline circular layout on representative topology", () => {
    const nodes: NetworkNode[] = [
      { id: asNodeId("N-A"), kind: "intermediate", label: "A" },
      { id: asNodeId("N-B"), kind: "intermediate", label: "B" },
      { id: asNodeId("N-C"), kind: "intermediate", label: "C" },
      { id: asNodeId("N-D"), kind: "intermediate", label: "D" },
      { id: asNodeId("N-E"), kind: "intermediate", label: "E" },
      { id: asNodeId("N-F"), kind: "intermediate", label: "F" }
    ];
    const segments: Segment[] = [
      { id: asSegmentId("SEG-1"), nodeA: asNodeId("N-A"), nodeB: asNodeId("N-D"), lengthMm: 10 },
      { id: asSegmentId("SEG-2"), nodeA: asNodeId("N-B"), nodeB: asNodeId("N-E"), lengthMm: 10 },
      { id: asSegmentId("SEG-3"), nodeA: asNodeId("N-C"), nodeB: asNodeId("N-F"), lengthMm: 10 }
    ];

    const baselineCrossings = countSegmentCrossings(segments, createBaselineCircularLayout(nodes));
    const nextCrossings = countSegmentCrossings(segments, createNodePositionMap(nodes, segments));

    expect(nextCrossings).toBeLessThanOrEqual(baselineCrossings);
    expect(nextCrossings).toBe(0);
  });

  it("snaps generated node coordinates to grid when snap option is enabled", () => {
    const nodes: NetworkNode[] = [
      { id: asNodeId("N-1"), kind: "intermediate", label: "1" },
      { id: asNodeId("N-2"), kind: "intermediate", label: "2" },
      { id: asNodeId("N-3"), kind: "intermediate", label: "3" }
    ];
    const segments: Segment[] = [
      { id: asSegmentId("SEG-1"), nodeA: asNodeId("N-1"), nodeB: asNodeId("N-2"), lengthMm: 10 },
      { id: asSegmentId("SEG-2"), nodeA: asNodeId("N-2"), nodeB: asNodeId("N-3"), lengthMm: 10 }
    ];

    const positions = createNodePositionMap(nodes, segments, {
      snapToGrid: true,
      gridStep: 20
    });

    for (const node of nodes) {
      const position = positions[node.id];
      expect(position).toBeDefined();
      if (position === undefined) {
        continue;
      }

      expect(position.x % 20).toBe(0);
      expect(position.y % 20).toBe(0);
    }
  });
});
