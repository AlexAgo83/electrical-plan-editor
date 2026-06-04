import { describe, expect, it } from "vitest";
import type { NetworkNode, NodeId, Segment, SegmentId } from "../core/entities";
import { buildMissingNodePositionMap } from "../app/hooks/useAppControllerLayoutDerivedState";

function asNodeId(value: string): NodeId {
  return value as NodeId;
}

function asSegmentId(value: string): SegmentId {
  return value as SegmentId;
}

describe("layout derived state", () => {
  it("places only missing nodes from neighboring persisted positions", () => {
    const nodes: NetworkNode[] = [
      { id: asNodeId("N-A"), kind: "intermediate", label: "A" },
      { id: asNodeId("N-B"), kind: "intermediate", label: "B" },
      { id: asNodeId("N-C"), kind: "intermediate", label: "C" }
    ];
    const segments: Segment[] = [
      { id: asSegmentId("S-A"), nodeA: asNodeId("N-A"), nodeB: asNodeId("N-B"), lengthMm: 100 },
      { id: asSegmentId("S-B"), nodeA: asNodeId("N-B"), nodeB: asNodeId("N-C"), lengthMm: 100 }
    ];

    const generated = buildMissingNodePositionMap(
      nodes,
      segments,
      {
        [asNodeId("N-A")]: { x: 100, y: 100 },
        [asNodeId("N-C")]: { x: 300, y: 100 }
      },
      true
    );

    expect(Object.keys(generated)).toEqual(["N-B"]);
    expect(generated[asNodeId("N-B")]).toEqual({ x: 220, y: 120 });
  });
});
