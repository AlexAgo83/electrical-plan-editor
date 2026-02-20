import { describe, expect, it } from "vitest";
import type { NodeId, SegmentId } from "../core/entities";
import { buildRoutingGraphIndex } from "../core/graph";

function asNodeId(value: string): NodeId {
  return value as NodeId;
}

function asSegmentId(value: string): SegmentId {
  return value as SegmentId;
}

describe("buildRoutingGraphIndex", () => {
  it("builds a bidirectional index from nodes and segments", () => {
    const index = buildRoutingGraphIndex(
      [
        { id: asNodeId("N1"), kind: "intermediate", label: "Node 1" },
        { id: asNodeId("N2"), kind: "intermediate", label: "Node 2" },
        { id: asNodeId("N3"), kind: "intermediate", label: "Node 3" }
      ],
      [
        {
          id: asSegmentId("SEG1"),
          nodeA: asNodeId("N1"),
          nodeB: asNodeId("N2"),
          lengthMm: 120,
          subNetworkTag: "power"
        },
        {
          id: asSegmentId("SEG2"),
          nodeA: asNodeId("N2"),
          nodeB: asNodeId("N3"),
          lengthMm: 80
        }
      ]
    );

    expect(index.nodeIds).toEqual([asNodeId("N1"), asNodeId("N2"), asNodeId("N3")]);
    expect(index.segmentIds).toEqual([asSegmentId("SEG1"), asSegmentId("SEG2")]);
    expect(index.edgesByNodeId[asNodeId("N1")]).toHaveLength(1);
    expect(index.edgesByNodeId[asNodeId("N2")]).toHaveLength(2);
    expect(index.edgesByNodeId[asNodeId("N3")]).toHaveLength(1);

    const firstEdge = index.edgesByNodeId[asNodeId("N1")]?.[0];
    expect(firstEdge).toBeDefined();
    expect(firstEdge?.toNodeId).toBe(asNodeId("N2"));
    expect(firstEdge?.subNetworkTag).toBe("power");

    const secondEdge = index.edgesByNodeId[asNodeId("N3")]?.[0];
    expect(secondEdge).toBeDefined();
    expect(secondEdge?.subNetworkTag).toBeNull();
  });

  it("ignores invalid segments", () => {
    const index = buildRoutingGraphIndex(
      [
        { id: asNodeId("N1"), kind: "intermediate", label: "Node 1" },
        { id: asNodeId("N2"), kind: "intermediate", label: "Node 2" }
      ],
      [
        {
          id: asSegmentId("SEG1"),
          nodeA: asNodeId("N1"),
          nodeB: asNodeId("N1"),
          lengthMm: 100
        },
        {
          id: asSegmentId("SEG2"),
          nodeA: asNodeId("N1"),
          nodeB: asNodeId("N-MISSING"),
          lengthMm: 100
        },
        {
          id: asSegmentId("SEG3"),
          nodeA: asNodeId("N1"),
          nodeB: asNodeId("N2"),
          lengthMm: -5
        }
      ]
    );

    expect(index.segmentIds).toEqual([]);
    expect(index.edgesByNodeId[asNodeId("N1")]).toEqual([]);
    expect(index.edgesByNodeId[asNodeId("N2")]).toEqual([]);
  });
});
