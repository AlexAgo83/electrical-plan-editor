import { describe, expect, it } from "vitest";
import type { CatalogItemId, ConnectorId, NetworkNode, NodeId, Segment, SegmentId } from "../core/entities";
import { buildRenderedNodes, buildRenderedSegments } from "../app/components/network-summary/graph/networkSummaryGraphModel";

function asNodeId(value: string): NodeId {
  return value as NodeId;
}

function asSegmentId(value: string): SegmentId {
  return value as SegmentId;
}

function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

function asCatalogItemId(value: string): CatalogItemId {
  return value as CatalogItemId;
}

const emptySegmentRenderContext = {
  nodes: [],
  connectorMap: new Map(),
  catalogItems: [],
  connectorDrawingDisplayMode: "disabled" as const,
  normalizedNodeShapeScale: 1,
  connectorDrawingScale: 1,
  zoomInvariantNodeShapes: false,
  inverseLabelScale: 1
};

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
      ...emptySegmentRenderContext,
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

  it("centers labels in the visible gap between node shapes", () => {
    const connectorId = asConnectorId("C-A");
    const catalogItemId = asCatalogItemId("CAT-A");
    const segment: Segment = {
      id: asSegmentId("SEG-A"),
      nodeA: asNodeId("N-A"),
      nodeB: asNodeId("N-B"),
      lengthMm: 120
    };

    const rendered = buildRenderedSegments({
      segments: [segment],
      nodes: [
        {
          id: asNodeId("N-A"),
          kind: "connector",
          connectorId
        },
        {
          id: asNodeId("N-B"),
          kind: "intermediate",
          label: "Hub"
        }
      ],
      networkNodePositions: {
        [asNodeId("N-A")]: { x: 0, y: 0 },
        [asNodeId("N-B")]: { x: 120, y: 0 }
      },
      segmentSubNetworkTagById: new Map(),
      isSubNetworkFilteringActive: false,
      activeSubNetworkTagSet: new Set(),
      selectedWireRouteSegmentIds: new Set(),
      selectedSegmentId: null,
      connectorMap: new Map([
        [
          connectorId,
          {
            id: connectorId,
            name: "Connector A",
            technicalId: "C-A",
            cavityCount: 2,
            catalogItemId
          }
        ]
      ]),
      catalogItems: [
        {
          id: catalogItemId,
          manufacturerReference: "REF-A",
          name: "Two way",
          connectionCount: 2,
          connectorLayout: {
            version: 1,
            units: "grid",
            width: 4,
            height: 2,
            ways: [
              { cavityIndex: 1, x: 1, y: 1, shape: "round" },
              { cavityIndex: 2, x: 3, y: 1, shape: "round" }
            ]
          }
        }
      ],
      connectorDrawingDisplayMode: "nodes",
      normalizedNodeShapeScale: 1,
      connectorDrawingScale: 2,
      zoomInvariantNodeShapes: false,
      inverseLabelScale: 1,
      autoSegmentLabelRotation: true,
      labelRotationDegrees: 0,
      showSegmentNames: false,
      showSegmentLengths: true
    });

    expect(rendered).toHaveLength(1);
    expect(rendered[0]?.labelX).toBeCloseTo(74.5);
    expect(rendered[0]?.labelY).toBe(0);
  });

  it("keeps labels in the visible gap when node shapes are close but not touching", () => {
    const connectorId = asConnectorId("C-A");
    const catalogItemId = asCatalogItemId("CAT-A");
    const segment: Segment = {
      id: asSegmentId("SEG-A"),
      nodeA: asNodeId("N-A"),
      nodeB: asNodeId("N-B"),
      lengthMm: 66
    };

    const rendered = buildRenderedSegments({
      segments: [segment],
      nodes: [
        {
          id: asNodeId("N-A"),
          kind: "connector",
          connectorId
        },
        {
          id: asNodeId("N-B"),
          kind: "intermediate",
          label: "Hub"
        }
      ],
      networkNodePositions: {
        [asNodeId("N-A")]: { x: 0, y: 0 },
        [asNodeId("N-B")]: { x: 66, y: 0 }
      },
      segmentSubNetworkTagById: new Map(),
      isSubNetworkFilteringActive: false,
      activeSubNetworkTagSet: new Set(),
      selectedWireRouteSegmentIds: new Set(),
      selectedSegmentId: null,
      connectorMap: new Map([
        [
          connectorId,
          {
            id: connectorId,
            name: "Connector A",
            technicalId: "C-A",
            cavityCount: 2,
            catalogItemId
          }
        ]
      ]),
      catalogItems: [
        {
          id: catalogItemId,
          manufacturerReference: "REF-A",
          name: "Two way",
          connectionCount: 2,
          connectorLayout: {
            version: 1,
            units: "grid",
            width: 4,
            height: 2,
            ways: [
              { cavityIndex: 1, x: 1, y: 1, shape: "round" },
              { cavityIndex: 2, x: 3, y: 1, shape: "round" }
            ]
          }
        }
      ],
      connectorDrawingDisplayMode: "nodes",
      normalizedNodeShapeScale: 1,
      connectorDrawingScale: 2,
      zoomInvariantNodeShapes: false,
      inverseLabelScale: 1,
      autoSegmentLabelRotation: true,
      labelRotationDegrees: 0,
      showSegmentNames: false,
      showSegmentLengths: true
    });

    expect(rendered).toHaveLength(1);
    expect(rendered[0]?.labelX).toBeGreaterThan(33);
    expect(rendered[0]?.labelX).toBeCloseTo(47.5);
  });
});

describe("buildRenderedNodes", () => {
  it("keeps connector IDs close to the node drawing when a physical layout is rendered", () => {
    const connectorId = asConnectorId("C-1");
    const node: NetworkNode = {
      id: asNodeId("N-C-1"),
      kind: "connector",
      connectorId
    };
    const catalogItemId = asCatalogItemId("CAT-1");

    const rendered = buildRenderedNodes({
      nodes: [node],
      networkNodePositions: {
        [node.id]: { x: 120, y: 80 }
      },
      isSubNetworkFilteringActive: false,
      nodeHasActiveSubNetworkConnection: new Map(),
      selectedCanvasNodeIds: new Set(),
      selectedNodeId: null,
      selectedConnectorId: null,
      selectedSpliceId: null,
      connectorMap: new Map([
        [
          connectorId,
          {
            id: connectorId,
            name: "Connector 1",
            technicalId: "C-1",
            cavityCount: 2,
            catalogItemId
          }
        ]
      ]),
      catalogItems: [
        {
          id: catalogItemId,
          manufacturerReference: "REF-1",
          name: "Two way",
          connectionCount: 2,
          connectorLayout: {
            version: 1,
            units: "grid",
            width: 4,
            height: 2,
            ways: [
              { cavityIndex: 1, x: 1, y: 1, shape: "round" },
              { cavityIndex: 2, x: 3, y: 1, shape: "round" }
            ]
          }
        }
      ],
      connectorDrawingDisplayMode: "nodes",
      connectorCalloutGroupsById: new Map(),
      selectedWireId: null,
      spliceMap: new Map()
    });

    expect(rendered).toHaveLength(1);
    expect(rendered[0]?.labelOffsetY).toBe(0);
  });
});
