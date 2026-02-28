import { describe, expect, it } from "vitest";
import type { NetworkNode, NodeId, Segment, SegmentId } from "../core/entities";
import {
  countSegmentNodeOverlaps,
  countSegmentNodeClearanceViolations,
  countSegmentCrossings,
  createNodePositionMap,
  NETWORK_VIEW_HEIGHT,
  NETWORK_VIEW_WIDTH
} from "../app/lib/app-utils";
import type { NodePosition } from "../app/types/app-controller";
import { isVisualConflictRankBetter } from "../app/lib/layout/scoring";
import { createSampleNetworkState } from "../store";

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

function createSyntheticTopology(nodeCount: number): { nodes: NetworkNode[]; segments: Segment[] } {
  const nodes: NetworkNode[] = [];
  const segments: Segment[] = [];
  for (let index = 0; index < nodeCount; index += 1) {
    nodes.push({
      id: asNodeId(`N-${index + 1}`),
      kind: "intermediate",
      label: `Node ${index + 1}`
    });
  }

  let segmentIndex = 1;
  const addSegment = (from: number, to: number): void => {
    if (from === to) {
      return;
    }
    const fromNode = nodes[from];
    const toNode = nodes[to];
    if (fromNode === undefined || toNode === undefined) {
      return;
    }
    segments.push({
      id: asSegmentId(`SEG-PERF-${String(segmentIndex).padStart(4, "0")}`),
      nodeA: fromNode.id,
      nodeB: toNode.id,
      lengthMm: 10
    });
    segmentIndex += 1;
  };

  for (let index = 0; index < nodeCount; index += 1) {
    addSegment(index, (index + 1) % nodeCount);
  }
  for (let index = 0; index < nodeCount; index += 1) {
    addSegment(index, (index + 9) % nodeCount);
  }
  for (let index = 0; index < nodeCount; index += 4) {
    addSegment(index, (index + 23) % nodeCount);
  }

  return { nodes, segments };
}

function createUserLikeProblematicTopology(): { nodes: NetworkNode[]; segments: Segment[] } {
  const nodes: NetworkNode[] = [
    { id: asNodeId("N-U1"), kind: "intermediate", label: "U1" },
    { id: asNodeId("N-U2"), kind: "intermediate", label: "U2" },
    { id: asNodeId("N-U3"), kind: "intermediate", label: "U3" },
    { id: asNodeId("N-U4"), kind: "intermediate", label: "U4" },
    { id: asNodeId("N-U5"), kind: "intermediate", label: "U5" },
    { id: asNodeId("N-U6"), kind: "intermediate", label: "U6" },
    { id: asNodeId("N-U7"), kind: "intermediate", label: "U7" },
    { id: asNodeId("N-U8"), kind: "intermediate", label: "U8" }
  ];
  const segments: Segment[] = [
    { id: asSegmentId("SEG-U01"), nodeA: asNodeId("N-U1"), nodeB: asNodeId("N-U5"), lengthMm: 120 },
    { id: asSegmentId("SEG-U02"), nodeA: asNodeId("N-U2"), nodeB: asNodeId("N-U6"), lengthMm: 120 },
    { id: asSegmentId("SEG-U03"), nodeA: asNodeId("N-U3"), nodeB: asNodeId("N-U7"), lengthMm: 120 },
    { id: asSegmentId("SEG-U04"), nodeA: asNodeId("N-U4"), nodeB: asNodeId("N-U8"), lengthMm: 120 },
    { id: asSegmentId("SEG-U05"), nodeA: asNodeId("N-U1"), nodeB: asNodeId("N-U6"), lengthMm: 80 },
    { id: asSegmentId("SEG-U06"), nodeA: asNodeId("N-U2"), nodeB: asNodeId("N-U7"), lengthMm: 80 },
    { id: asSegmentId("SEG-U07"), nodeA: asNodeId("N-U3"), nodeB: asNodeId("N-U8"), lengthMm: 80 },
    { id: asSegmentId("SEG-U08"), nodeA: asNodeId("N-U4"), nodeB: asNodeId("N-U5"), lengthMm: 80 },
    { id: asSegmentId("SEG-U09"), nodeA: asNodeId("N-U1"), nodeB: asNodeId("N-U2"), lengthMm: 40 },
    { id: asSegmentId("SEG-U10"), nodeA: asNodeId("N-U7"), nodeB: asNodeId("N-U8"), lengthMm: 40 }
  ];
  return { nodes, segments };
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

  it("avoids placing non-endpoint nodes on top of generated segments for sample topology", () => {
    const sample = createSampleNetworkState();
    const nodes = sample.nodes.allIds.map((nodeId) => sample.nodes.byId[nodeId]).filter((node): node is NetworkNode => node !== undefined);
    const segments = sample.segments.allIds
      .map((segmentId) => sample.segments.byId[segmentId])
      .filter((segment): segment is Segment => segment !== undefined);

    const generated = createNodePositionMap(nodes, segments, {
      snapToGrid: true,
      gridStep: 20
    });
    const overlaps: Array<{ segmentId: string; nodeId: string }> = [];
    const isPointOnSegment = (ax: number, ay: number, bx: number, by: number, px: number, py: number): boolean => {
      const cross = Math.abs((bx - ax) * (py - ay) - (by - ay) * (px - ax));
      if (cross > 0.01) {
        return false;
      }
      const minX = Math.min(ax, bx) - 0.01;
      const maxX = Math.max(ax, bx) + 0.01;
      const minY = Math.min(ay, by) - 0.01;
      const maxY = Math.max(ay, by) + 0.01;
      return px >= minX && px <= maxX && py >= minY && py <= maxY;
    };
    for (const segment of segments) {
      const start = generated[segment.nodeA];
      const end = generated[segment.nodeB];
      if (start === undefined || end === undefined) {
        continue;
      }

      for (const node of nodes) {
        if (node.id === segment.nodeA || node.id === segment.nodeB) {
          continue;
        }

        const point = generated[node.id];
        if (point === undefined) {
          continue;
        }

        if (isPointOnSegment(start.x, start.y, end.x, end.y, point.x, point.y)) {
          overlaps.push({ segmentId: segment.id, nodeId: node.id });
        }
      }
    }

    expect(overlaps).toEqual([]);
    expect(countSegmentNodeOverlaps(segments, generated)).toBe(0);
    expect(countSegmentNodeClearanceViolations(segments, generated)).toBe(0);
  });

  it("keeps sample topology crossings bounded after generation", () => {
    const sample = createSampleNetworkState();
    const nodes = sample.nodes.allIds.map((nodeId) => sample.nodes.byId[nodeId]).filter((node): node is NetworkNode => node !== undefined);
    const segments = sample.segments.allIds
      .map((segmentId) => sample.segments.byId[segmentId])
      .filter((segment): segment is Segment => segment !== undefined);

    const generated = createNodePositionMap(nodes, segments, {
      snapToGrid: true,
      gridStep: 20
    });

    expect(countSegmentCrossings(segments, generated)).toBeLessThanOrEqual(1);
  });

  it("uses crossing count as the first layout rank comparator", () => {
    expect(isVisualConflictRankBetter([1, 4, 8, 999], [2, 0, 0, 100])).toBe(true);
    expect(isVisualConflictRankBetter([2, 0, 0, 100], [1, 4, 8, 999])).toBe(false);
  });

  it("improves fixed 3-fixture crossing benchmark with no fixture regression", () => {
    const sample = createSampleNetworkState();
    const sampleNodes = sample.nodes.allIds
      .map((nodeId) => sample.nodes.byId[nodeId])
      .filter((node): node is NetworkNode => node !== undefined);
    const sampleSegments = sample.segments.allIds
      .map((segmentId) => sample.segments.byId[segmentId])
      .filter((segment): segment is Segment => segment !== undefined);
    const denseSynthetic = createSyntheticTopology(32);
    const userLikeProblematic = createUserLikeProblematicTopology();

    const fixtures = [
      {
        name: "sample",
        nodes: sampleNodes,
        segments: sampleSegments
      },
      {
        name: "dense-synthetic",
        nodes: denseSynthetic.nodes,
        segments: denseSynthetic.segments
      },
      {
        name: "user-like-problematic",
        nodes: userLikeProblematic.nodes,
        segments: userLikeProblematic.segments
      }
    ] as const;

    const benchmark = fixtures.map((fixture) => {
      const baselineCrossings = countSegmentCrossings(
        fixture.segments,
        createBaselineCircularLayout(fixture.nodes)
      );
      const generatedCrossings = countSegmentCrossings(
        fixture.segments,
        createNodePositionMap(fixture.nodes, fixture.segments, {
          snapToGrid: true,
          gridStep: 20
        })
      );
      return {
        name: fixture.name,
        baselineCrossings,
        generatedCrossings
      };
    });

    const strictReductionCount = benchmark.filter(
      (fixture) => fixture.generatedCrossings < fixture.baselineCrossings
    ).length;
    const regressionCount = benchmark.filter(
      (fixture) => fixture.generatedCrossings > fixture.baselineCrossings
    ).length;

    expect(strictReductionCount).toBeGreaterThanOrEqual(2);
    expect(regressionCount).toBe(0);
  });

  it("keeps layout generation responsive on representative medium topology", () => {
    const { nodes, segments } = createSyntheticTopology(40);
    let generated = {} as Record<NodeId, NodePosition>;
    const start = performance.now();
    generated = createNodePositionMap(nodes, segments, {
      snapToGrid: true,
      gridStep: 20
    });
    const elapsedMs = performance.now() - start;
    const configuredBudgetOverride = Number(process.env.LAYOUT_RESPONSIVENESS_BUDGET_MS ?? "");
    // This remains a wall-clock guardrail by design: it is intentionally coarse and CI-load-sensitive.
    // Keep the default budget pragmatic (with headroom for coverage + larger UI suites), and allow
    // an env override when calibrating slower runners.
    const performanceBudgetMs =
      Number.isFinite(configuredBudgetOverride) && configuredBudgetOverride > 0 ? configuredBudgetOverride : 14_000;

    expect(Object.keys(generated)).toHaveLength(nodes.length);
    expect(elapsedMs).toBeLessThan(performanceBudgetMs);
  }, 12_000);
});
