import { describe, expect, it } from "vitest";
import type { NodeId, SegmentId } from "../core/entities";
import { buildRoutingGraphIndex } from "../core/graph";
import { findShortestRoute } from "../core/pathfinding";

function asNodeId(value: string): NodeId {
  return value as NodeId;
}

function asSegmentId(value: string): SegmentId {
  return value as SegmentId;
}

describe("findShortestRoute", () => {
  it("returns an empty route when start and end are the same node", () => {
    const graph = buildRoutingGraphIndex(
      [{ id: asNodeId("N1"), kind: "intermediate", label: "N1" }],
      []
    );

    const route = findShortestRoute(graph, asNodeId("N1"), asNodeId("N1"));
    expect(route).not.toBeNull();
    expect(route?.totalLengthMm).toBe(0);
    expect(route?.segmentIds).toEqual([]);
    expect(route?.nodeIds).toEqual([asNodeId("N1")]);
  });

  it("returns null when nodes are unreachable", () => {
    const graph = buildRoutingGraphIndex(
      [
        { id: asNodeId("N1"), kind: "intermediate", label: "N1" },
        { id: asNodeId("N2"), kind: "intermediate", label: "N2" }
      ],
      []
    );

    const route = findShortestRoute(graph, asNodeId("N1"), asNodeId("N2"));
    expect(route).toBeNull();
  });

  it("returns the minimum total length route", () => {
    const graph = buildRoutingGraphIndex(
      [
        { id: asNodeId("A"), kind: "intermediate", label: "A" },
        { id: asNodeId("B"), kind: "intermediate", label: "B" },
        { id: asNodeId("C"), kind: "intermediate", label: "C" }
      ],
      [
        { id: asSegmentId("S1"), nodeA: asNodeId("A"), nodeB: asNodeId("B"), lengthMm: 4 },
        { id: asSegmentId("S2"), nodeA: asNodeId("B"), nodeB: asNodeId("C"), lengthMm: 4 },
        { id: asSegmentId("S3"), nodeA: asNodeId("A"), nodeB: asNodeId("C"), lengthMm: 15 }
      ]
    );

    const route = findShortestRoute(graph, asNodeId("A"), asNodeId("C"));
    expect(route).not.toBeNull();
    expect(route?.totalLengthMm).toBe(8);
    expect(route?.segmentIds).toEqual([asSegmentId("S1"), asSegmentId("S2")]);
  });

  it("uses fewer segments as tie-break when total length is equal", () => {
    const graph = buildRoutingGraphIndex(
      [
        { id: asNodeId("A"), kind: "intermediate", label: "A" },
        { id: asNodeId("B"), kind: "intermediate", label: "B" },
        { id: asNodeId("C"), kind: "intermediate", label: "C" }
      ],
      [
        { id: asSegmentId("S1"), nodeA: asNodeId("A"), nodeB: asNodeId("B"), lengthMm: 5 },
        { id: asSegmentId("S2"), nodeA: asNodeId("B"), nodeB: asNodeId("C"), lengthMm: 5 },
        { id: asSegmentId("S3"), nodeA: asNodeId("A"), nodeB: asNodeId("C"), lengthMm: 10 }
      ]
    );

    const route = findShortestRoute(graph, asNodeId("A"), asNodeId("C"));
    expect(route).not.toBeNull();
    expect(route?.totalLengthMm).toBe(10);
    expect(route?.segmentIds).toEqual([asSegmentId("S3")]);
  });

  it("uses stable segment-id ordering as deterministic fallback tie-break", () => {
    const graph = buildRoutingGraphIndex(
      [
        { id: asNodeId("A"), kind: "intermediate", label: "A" },
        { id: asNodeId("B"), kind: "intermediate", label: "B" },
        { id: asNodeId("C"), kind: "intermediate", label: "C" },
        { id: asNodeId("D"), kind: "intermediate", label: "D" }
      ],
      [
        { id: asSegmentId("S9"), nodeA: asNodeId("A"), nodeB: asNodeId("B"), lengthMm: 3 },
        { id: asSegmentId("S2"), nodeA: asNodeId("B"), nodeB: asNodeId("D"), lengthMm: 3 },
        { id: asSegmentId("S8"), nodeA: asNodeId("A"), nodeB: asNodeId("C"), lengthMm: 3 },
        { id: asSegmentId("S3"), nodeA: asNodeId("C"), nodeB: asNodeId("D"), lengthMm: 3 }
      ]
    );

    const expectedSegments = [asSegmentId("S8"), asSegmentId("S3")];

    for (let iteration = 0; iteration < 8; iteration += 1) {
      const route = findShortestRoute(graph, asNodeId("A"), asNodeId("D"));
      expect(route).not.toBeNull();
      expect(route?.totalLengthMm).toBe(6);
      expect(route?.segmentIds).toEqual(expectedSegments);
    }
  });
});
