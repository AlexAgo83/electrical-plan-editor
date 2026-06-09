import { describe, expect, it } from "vitest";
import type { CatalogItemId, ConnectorId, NetworkNode, NodeId, Segment, SegmentId, SpliceId } from "../core/entities";
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

function asSpliceId(value: string): SpliceId {
  return value as SpliceId;
}

const emptySegmentRenderContext = {
  nodes: [],
  connectorMap: new Map(),
  catalogItems: [],
  connectorDrawingDisplayMode: "disabled" as const,
  normalizedNodeShapeScale: 1,
  connectorDrawingScale: 1,
  useConsistentConnectorLayoutScale: true,
  zoomInvariantNodeShapes: false,
  inverseLabelScale: 1,
  selectedBatchSegmentIds: new Set<SegmentId>()
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

  it("marks batch-selected segments as selected in the rendered graph model", () => {
    const segment: Segment = {
      id: asSegmentId("SEG-BATCH"),
      nodeA: asNodeId("N-A"),
      nodeB: asNodeId("N-B"),
      lengthMm: 50
    };

    const rendered = buildRenderedSegments({
      segments: [segment],
      networkNodePositions: {
        [asNodeId("N-A")]: { x: 0, y: 0 },
        [asNodeId("N-B")]: { x: 100, y: 0 }
      },
      segmentSubNetworkTagById: new Map(),
      isSubNetworkFilteringActive: false,
      activeSubNetworkTagSet: new Set(),
      selectedWireRouteSegmentIds: new Set(),
      selectedSegmentId: null,
      ...emptySegmentRenderContext,
      selectedBatchSegmentIds: new Set([segment.id]),
      autoSegmentLabelRotation: true,
      labelRotationDegrees: 0,
      showSegmentNames: false,
      showSegmentLengths: true
    });

    expect(rendered[0]?.segmentClassName).toContain("is-selected");
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
      useConsistentConnectorLayoutScale: false,
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
      useConsistentConnectorLayoutScale: false,
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

  it("uses the physical layout width as connector bounds when consistent layout scale is enabled", () => {
    const connectorId = asConnectorId("C-WIDE");
    const catalogItemId = asCatalogItemId("CAT-WIDE");
    const segment: Segment = {
      id: asSegmentId("SEG-WIDE"),
      nodeA: asNodeId("N-A"),
      nodeB: asNodeId("N-B"),
      lengthMm: 320
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
        [asNodeId("N-B")]: { x: 320, y: 0 }
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
            name: "Connector Wide",
            technicalId: "C-WIDE",
            cavityCount: 10,
            catalogItemId
          }
        ]
      ]),
      catalogItems: [
        {
          id: catalogItemId,
          manufacturerReference: "REF-WIDE",
          name: "Wide connector",
          connectionCount: 10,
          connectorLayout: {
            version: 1,
            units: "grid",
            width: 10,
            height: 2,
            ways: Array.from({ length: 10 }, (_, index) => ({
              cavityIndex: index + 1,
              x: index + 1,
              y: 1,
              shape: "round" as const
            }))
          }
        }
      ],
      connectorDrawingDisplayMode: "nodes",
      normalizedNodeShapeScale: 1,
      connectorDrawingScale: 2,
      useConsistentConnectorLayoutScale: true,
      zoomInvariantNodeShapes: false,
      inverseLabelScale: 1,
      autoSegmentLabelRotation: true,
      labelRotationDegrees: 0,
      showSegmentNames: false,
      showSegmentLengths: true
    });

    expect(rendered).toHaveLength(1);
    expect(rendered[0]?.labelX).toBeCloseTo(202.1);
  });

  it("merges sheath callouts across same-style segments separated only by a splice", () => {
    const spliceId = asSpliceId("SP-1");
    const segments: Segment[] = [
      {
        id: asSegmentId("SEG-1"),
        nodeA: asNodeId("N-A"),
        nodeB: asNodeId("N-S"),
        lengthMm: 20,
        sheathType: "Fixed Tube",
        insulation: "XLPE",
        lineStyle: "GAF-T2-D9",
        internalPartReference: "X723061352"
      },
      {
        id: asSegmentId("SEG-2"),
        nodeA: asNodeId("N-S"),
        nodeB: asNodeId("N-B"),
        lengthMm: 60,
        sheathType: "Fixed Tube",
        insulation: "XLPE",
        lineStyle: "GAF-T2-D9",
        internalPartReference: "X723061352"
      }
    ];
    const nodes: NetworkNode[] = [
      { id: asNodeId("N-A"), kind: "intermediate", label: "Start" },
      { id: asNodeId("N-S"), kind: "splice", spliceId },
      { id: asNodeId("N-B"), kind: "intermediate", label: "End" }
    ];

    const rendered = buildRenderedSegments({
      ...emptySegmentRenderContext,
      segments,
      nodes,
      networkNodePositions: {
        [asNodeId("N-A")]: { x: 0, y: 0 },
        [asNodeId("N-S")]: { x: 40, y: 0 },
        [asNodeId("N-B")]: { x: 100, y: 0 }
      },
      segmentSubNetworkTagById: new Map(),
      isSubNetworkFilteringActive: false,
      activeSubNetworkTagSet: new Set(),
      selectedWireRouteSegmentIds: new Set(),
      selectedSegmentId: null,
      spliceMap: new Map([[spliceId, { id: spliceId, name: "Splice", technicalId: "SP-1", portCount: 2 }]]),
      autoSegmentLabelRotation: true,
      labelRotationDegrees: 0,
      showSegmentNames: false,
      showSegmentLengths: true
    });

    expect(rendered).toHaveLength(2);
    expect(rendered[0]?.segmentCallout?.routeLabel).toBe("Route: N-A to N-B");
    expect(rendered[0]?.segmentCallout?.values[4]).toBe("80 mm");
    expect(rendered[1]?.segmentCallout).toBeNull();
  });

  it("anchors merged sheath callout leaders to the midpoint of the closest grouped segment", () => {
    const spliceId = asSpliceId("SP-1");
    const segments: Segment[] = [
      {
        id: asSegmentId("SEG-1"),
        nodeA: asNodeId("N-A"),
        nodeB: asNodeId("N-S"),
        lengthMm: 20,
        sheathType: "Fixed Tube",
        insulation: "XLPE",
        lineStyle: "GAF-T2-D9",
        internalPartReference: "X723061352"
      },
      {
        id: asSegmentId("SEG-2"),
        nodeA: asNodeId("N-S"),
        nodeB: asNodeId("N-B"),
        lengthMm: 60,
        sheathType: "Fixed Tube",
        insulation: "XLPE",
        lineStyle: "GAF-T2-D9",
        internalPartReference: "X723061352"
      }
    ];
    const nodes: NetworkNode[] = [
      { id: asNodeId("N-A"), kind: "intermediate", label: "Start" },
      { id: asNodeId("N-S"), kind: "splice", spliceId },
      { id: asNodeId("N-B"), kind: "intermediate", label: "End" }
    ];

    const rendered = buildRenderedSegments({
      ...emptySegmentRenderContext,
      segments,
      nodes,
      networkNodePositions: {
        [asNodeId("N-A")]: { x: 0, y: 0 },
        [asNodeId("N-S")]: { x: 40, y: 0 },
        [asNodeId("N-B")]: { x: 100, y: 0 }
      },
      segmentSubNetworkTagById: new Map(),
      isSubNetworkFilteringActive: false,
      activeSubNetworkTagSet: new Set(),
      selectedWireRouteSegmentIds: new Set(),
      selectedSegmentId: null,
      spliceMap: new Map([[spliceId, { id: spliceId, name: "Splice", technicalId: "SP-1", portCount: 2 }]]),
      autoSegmentLabelRotation: true,
      labelRotationDegrees: 0,
      showSegmentNames: false,
      showSegmentLengths: true,
      draftSegmentCalloutPositions: {
        [asSegmentId("SEG-1")]: { x: 10, y: -30 }
      }
    });

    expect(rendered[0]?.segmentCallout?.targetX).toBe(20);
    expect(rendered[0]?.segmentCallout?.targetY).toBe(0);
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
