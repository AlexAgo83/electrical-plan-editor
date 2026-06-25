import { describe, expect, it } from "vitest";
import type { CatalogItemId, ConnectorId, NetworkNode, NodeId, Segment, SegmentId, SpliceId } from "../core/entities";
import {
  biasFloatingSpliceVisualRatio,
  buildRenderedFloatingSplices,
  buildRenderedNodes,
  buildRenderedSegments,
  COLOCATED_SPLICE_OFFSET_STEP,
  computeColocatedSpliceOffsetUnits,
  FLOATING_SPLICE_VISUAL_MAX_RATIO,
  FLOATING_SPLICE_VISUAL_MIN_RATIO
} from "../app/components/network-summary/graph/networkSummaryGraphModel";

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

  it("splits the length label into node↔splice sub-distances when splices sit on the segment", () => {
    const segmentId = asSegmentId("SEG-SUB");
    const segment: Segment = {
      id: segmentId,
      nodeA: asNodeId("N-A"),
      nodeB: asNodeId("N-B"),
      lengthMm: 400
    };
    const spliceOneId = asSpliceId("SP-1");
    const spliceTwoId = asSpliceId("SP-2");

    const rendered = buildRenderedSegments({
      segments: [segment],
      networkNodePositions: {
        [asNodeId("N-A")]: { x: 0, y: 0 },
        [asNodeId("N-B")]: { x: 400, y: 0 }
      },
      segmentSubNetworkTagById: new Map(),
      isSubNetworkFilteringActive: false,
      activeSubNetworkTagSet: new Set(),
      selectedWireRouteSegmentIds: new Set(),
      selectedSegmentId: null,
      ...emptySegmentRenderContext,
      spliceMap: new Map([
        [
          spliceOneId,
          {
            id: spliceOneId,
            name: "Splice 1",
            technicalId: "SP-1",
            portCount: 2,
            placement: { kind: "segmentOffset", segmentId, fromNodeId: asNodeId("N-A"), offsetMm: 120 }
          }
        ],
        [
          spliceTwoId,
          {
            id: spliceTwoId,
            name: "Splice 2",
            technicalId: "SP-2",
            portCount: 2,
            placement: { kind: "segmentOffset", segmentId, fromNodeId: asNodeId("N-A"), offsetMm: 200 }
          }
        ]
      ]),
      autoSegmentLabelRotation: true,
      labelRotationDegrees: 0,
      showSegmentNames: false,
      showSegmentLengths: true
    });

    const subLabels = rendered[0]?.segmentLengthSubLabels ?? [];
    // Displayed lengths stay physical: 0→120, 120→200, 200→400 along nodeA→nodeB.
    expect(subLabels.map((label) => label.lengthMm)).toEqual([120, 80, 200]);
    // Labels sit in the VISUAL gaps between the evenly-spread markers (boundaries
    // 0, 1/3, 2/3, 1 on the 400px segment) → midpoints at 1/6, 1/2, 5/6.
    expect(subLabels.map((label) => Math.round(label.anchorX))).toEqual([67, 200, 333]);
  });

  it("highlights only the covered portion when a selected wire ends on a floating splice", () => {
    const segmentId = asSegmentId("SEG-PARTIAL");
    const segment: Segment = {
      id: segmentId,
      nodeA: asNodeId("N-A"),
      nodeB: asNodeId("N-B"),
      lengthMm: 400
    };
    const spliceId = asSpliceId("SP-END");

    const rendered = buildRenderedSegments({
      segments: [segment],
      networkNodePositions: {
        [asNodeId("N-A")]: { x: 0, y: 0 },
        [asNodeId("N-B")]: { x: 400, y: 0 }
      },
      segmentSubNetworkTagById: new Map(),
      isSubNetworkFilteringActive: false,
      activeSubNetworkTagSet: new Set(),
      selectedWireRouteSegmentIds: new Set([segmentId]),
      selectedWirePartialCoverage: [{ segmentId, spliceId, coveredLengthMm: 280 }],
      selectedSegmentId: null,
      ...emptySegmentRenderContext,
      spliceMap: new Map([
        [
          spliceId,
          {
            id: spliceId,
            name: "Splice End",
            technicalId: "SP-END",
            portCount: 2,
            // Splice at 120mm from nodeA; wire covers 280mm → runs to nodeB.
            placement: { kind: "segmentOffset", segmentId, fromNodeId: asNodeId("N-A"), offsetMm: 120 }
          }
        ]
      ]),
      autoSegmentLabelRotation: true,
      labelRotationDegrees: 0,
      showSegmentNames: false,
      showSegmentLengths: true
    });

    const entry = rendered[0];
    // Partial highlights are overlaid, so the base line is not given the full-highlight class.
    expect(entry?.segmentClassName).not.toContain("is-wire-highlighted");
    expect(entry?.wireHighlightPortion).not.toBeNull();
    // Covered portion spans the splice (x=120) to nodeB (x=400).
    expect(Math.round(entry?.wireHighlightPortion?.x1 ?? -1)).toBe(120);
    expect(Math.round(entry?.wireHighlightPortion?.x2 ?? -1)).toBe(400);
    // A marker is placed at the splice anchor.
    expect(entry?.wireHighlightPortion?.markers).toHaveLength(1);
    expect(Math.round(entry?.wireHighlightPortion?.markers[0]?.x ?? -1)).toBe(120);
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

  it("prefers backshell helper node labels over synthetic connector suffixes", () => {
    const connectorId = asConnectorId("C-BS");
    const node: NetworkNode = {
      id: asNodeId("AR-N21"),
      kind: "connectorBackshellHelper",
      connectorId,
      label: "AR-N21"
    };

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
            name: "Connector rear",
            technicalId: "AR-CT2G",
            cavityCount: 2
          }
        ]
      ]),
      catalogItems: [],
      connectorDrawingDisplayMode: "disabled",
      connectorCalloutGroupsById: new Map(),
      selectedWireId: null,
      spliceMap: new Map()
    });

    expect(rendered[0]?.nodeLabel).toBe("AR-N21");
  });

  it("falls back to the backshell helper node id before using a synthetic connector suffix", () => {
    const connectorId = asConnectorId("C-BS");
    const node: NetworkNode = {
      id: asNodeId("LAT-N10.1"),
      kind: "connectorBackshellHelper",
      connectorId
    };

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
            name: "Connector rear",
            technicalId: "AR-CT2G",
            cavityCount: 2
          }
        ]
      ]),
      catalogItems: [],
      connectorDrawingDisplayMode: "disabled",
      connectorCalloutGroupsById: new Map(),
      selectedWireId: null,
      spliceMap: new Map()
    });

    expect(rendered[0]?.nodeLabel).toBe("LAT-N10.1");
  });
});

describe("buildRenderedFloatingSplices", () => {
  it("renders a placed splice without requiring a splice node", () => {
    const segment: Segment = {
      id: asSegmentId("SEG-1"),
      nodeA: asNodeId("N-A"),
      nodeB: asNodeId("N-B"),
      lengthMm: 100,
    };

    const rendered = buildRenderedFloatingSplices({
      splices: [
        {
          id: asSpliceId("S-1"),
          name: "Splice 1",
          technicalId: "SP-1",
          portCount: 2,
          placement: {
            kind: "segmentOffset",
            segmentId: segment.id,
            fromNodeId: segment.nodeA,
            offsetMm: 25,
          },
        },
      ],
      nodes: [],
      segments: [segment],
      networkNodePositions: {
        [segment.nodeA]: { x: 0, y: 0 },
        [segment.nodeB]: { x: 100, y: 0 },
      },
      segmentSubNetworkTagById: new Map([[segment.id, "(default)"]]),
      isSubNetworkFilteringActive: false,
      activeSubNetworkTagSet: new Set(["(default)"]),
      selectedSpliceId: asSpliceId("S-1"),
    });

    expect(rendered).toHaveLength(1);
    // Physical ratio 0.25 → biased visual anchor 0.5 + (0.25 - 0.5) * 0.35 = 0.4125.
    expect(rendered[0]?.anchorPosition.x).toBeCloseTo(41.25);
    expect(rendered[0]?.anchorPosition.y).toBeCloseTo(0);
    // Render-only: persisted physical offset is untouched (AC3).
    expect(rendered[0]?.splice.placement).toMatchObject({ offsetMm: 25 });
    expect(rendered[0]?.nodeClassName).toContain("is-selected");
  });

  it("biases a zero-offset splice toward the center so it stays clear of the endpoint node", () => {
    const segment: Segment = {
      id: asSegmentId("SEG-1"),
      nodeA: asNodeId("N-A"),
      nodeB: asNodeId("N-B"),
      lengthMm: 100,
    };

    const rendered = buildRenderedFloatingSplices({
      splices: [
        {
          id: asSpliceId("S-1"),
          name: "Splice 1",
          technicalId: "SP-1",
          portCount: 2,
          placement: {
            kind: "segmentOffset",
            segmentId: segment.id,
            fromNodeId: segment.nodeA,
            offsetMm: 0,
          },
        },
      ],
      nodes: [
        {
          id: segment.nodeA,
          kind: "intermediate",
          label: "A",
        },
        {
          id: segment.nodeB,
          kind: "intermediate",
          label: "B",
        },
      ],
      segments: [segment],
      networkNodePositions: {
        [segment.nodeA]: { x: 0, y: 0 },
        [segment.nodeB]: { x: 100, y: 0 },
      },
      segmentSubNetworkTagById: new Map([[segment.id, "(default)"]]),
      isSubNetworkFilteringActive: false,
      activeSubNetworkTagSet: new Set(["(default)"]),
      selectedSpliceId: null,
    });

    expect(rendered).toHaveLength(1);
    // Physical ratio 0 → biased visual anchor 0.5 + (0 - 0.5) * 0.35 = 0.325.
    expect(rendered[0]?.anchorPosition.x).toBeCloseTo(32.5);
    expect(rendered[0]?.anchorPosition.y).toBeCloseTo(0);
    // The visual marker sits well inside the segment, away from the endpoint node at x=0.
    expect(rendered[0]?.position.x).toBeGreaterThanOrEqual(FLOATING_SPLICE_VISUAL_MIN_RATIO * 100);
    // Persisted physical placement still records the real zero offset (AC3).
    expect(rendered[0]?.splice.placement).toMatchObject({ offsetMm: 0 });
  });

  function renderSplicesOnSegment(offsets: number[], selectedSpliceId: SpliceId | null = null) {
    const segment: Segment = {
      id: asSegmentId("SEG-1"),
      nodeA: asNodeId("N-A"),
      nodeB: asNodeId("N-B"),
      lengthMm: 100,
    };
    return buildRenderedFloatingSplices({
      splices: offsets.map((offsetMm, index) => ({
        id: asSpliceId(`S-${index}`),
        name: `Splice ${index}`,
        technicalId: `SP-${index}`,
        portCount: 2,
        placement: {
          kind: "segmentOffset",
          segmentId: segment.id,
          fromNodeId: segment.nodeA,
          offsetMm,
        },
      })),
      nodes: [],
      segments: [segment],
      networkNodePositions: {
        [segment.nodeA]: { x: 0, y: 0 },
        [segment.nodeB]: { x: 100, y: 0 },
      },
      segmentSubNetworkTagById: new Map([[segment.id, "(default)"]]),
      isSubNetworkFilteringActive: false,
      activeSubNetworkTagSet: new Set(["(default)"]),
      selectedSpliceId,
    });
  }

  it("spreads two splices on one segment to 1/3 and 2/3 in physical order", () => {
    const rendered = renderSplicesOnSegment([10, 80]);
    expect(rendered).toHaveLength(2);
    const byTechnicalId = new Map(rendered.map((model) => [model.splice.technicalId, model]));
    // SP-0 (offset 10) is physically closer to nodeA -> 1/3; SP-1 (offset 80) -> 2/3.
    expect(byTechnicalId.get("SP-0")?.anchorPosition.x).toBeCloseTo(100 / 3);
    expect(byTechnicalId.get("SP-1")?.anchorPosition.x).toBeCloseTo(200 / 3);
  });

  it("spreads three splices on one segment to 1/4, 2/4 and 3/4 in physical order", () => {
    const rendered = renderSplicesOnSegment([5, 50, 95]);
    expect(rendered).toHaveLength(3);
    const byTechnicalId = new Map(rendered.map((model) => [model.splice.technicalId, model]));
    expect(byTechnicalId.get("SP-0")?.anchorPosition.x).toBeCloseTo(25);
    expect(byTechnicalId.get("SP-1")?.anchorPosition.x).toBeCloseTo(50);
    expect(byTechnicalId.get("SP-2")?.anchorPosition.x).toBeCloseTo(75);
    // Markers are distinct and ordered, so inter-splice distances stay visible.
    const positionKeys = rendered.map((model) => `${model.position.x.toFixed(2)}:${model.position.y.toFixed(2)}`);
    expect(new Set(positionKeys).size).toBe(rendered.length);
  });

  it("orders the even spread by physical offset even when splices are declared out of order", () => {
    const rendered = renderSplicesOnSegment([90, 10]);
    const byTechnicalId = new Map(rendered.map((model) => [model.splice.technicalId, model]));
    // SP-1 (offset 10) is closer to nodeA -> 1/3; SP-0 (offset 90) -> 2/3.
    expect(byTechnicalId.get("SP-1")?.anchorPosition.x).toBeCloseTo(100 / 3);
    expect(byTechnicalId.get("SP-0")?.anchorPosition.x).toBeCloseTo(200 / 3);
  });
});

describe("computeColocatedSpliceOffsetUnits", () => {
  it("centers a pair on either side of the true point", () => {
    expect(computeColocatedSpliceOffsetUnits(2)).toEqual([-0.5, 0.5]);
  });

  it("uses a deterministic symmetric spread for larger groups", () => {
    expect(computeColocatedSpliceOffsetUnits(3)).toEqual([-1, 0, 1]);
    expect(computeColocatedSpliceOffsetUnits(4)).toEqual([-1.5, -0.5, 0.5, 1.5]);
  });
});

describe("buildRenderedFloatingSplices colocated layout", () => {
  const segment: Segment = {
    id: asSegmentId("SEG-1"),
    nodeA: asNodeId("N-A"),
    nodeB: asNodeId("N-B"),
    lengthMm: 100,
  };

  function renderColocated(
    placements: Array<{ id: string; fromNodeId: NodeId; offsetMm: number }>,
  ) {
    return buildRenderedFloatingSplices({
      splices: placements.map((placement) => ({
        id: asSpliceId(placement.id),
        name: placement.id,
        technicalId: placement.id,
        portCount: 2,
        placement: {
          kind: "segmentOffset" as const,
          segmentId: segment.id,
          fromNodeId: placement.fromNodeId,
          offsetMm: placement.offsetMm,
        },
      })),
      nodes: [],
      segments: [segment],
      networkNodePositions: {
        [segment.nodeA]: { x: 0, y: 0 },
        [segment.nodeB]: { x: 100, y: 0 },
      },
      segmentSubNetworkTagById: new Map([[segment.id, "(default)"]]),
      isSubNetworkFilteringActive: false,
      activeSubNetworkTagSet: new Set(["(default)"]),
      selectedSpliceId: null,
    });
  }

  it("offsets two colocated splices symmetrically across the segment (AC1-AC3)", () => {
    const rendered = renderColocated([
      { id: "SP-A", fromNodeId: segment.nodeA, offsetMm: 40 },
      { id: "SP-B", fromNodeId: segment.nodeA, offsetMm: 40 },
    ]);
    expect(rendered).toHaveLength(2);
    const byId = new Map(rendered.map((model) => [model.splice.technicalId, model]));
    const a = byId.get("SP-A")!;
    const b = byId.get("SP-B")!;
    // Both share the same along-segment anchor (the true placement point).
    expect(a.anchorPosition).toEqual(b.anchorPosition);
    expect(a.isColocated).toBe(true);
    expect(b.isColocated).toBe(true);
    // Separation is orthogonal to the horizontal segment (i.e. purely vertical).
    expect(a.position.x).toBeCloseTo(a.anchorPosition.x);
    expect(b.position.x).toBeCloseTo(b.anchorPosition.x);
    expect(a.position.y).toBeCloseTo(-b.position.y);
    expect(a.position.y).not.toBeCloseTo(b.position.y);
    // Spacing derived from the symbol size keeps the symbols clear (AC14).
    expect(Math.abs(a.position.y - b.position.y)).toBeCloseTo(COLOCATED_SPLICE_OFFSET_STEP);
    // Persisted placement is unchanged (AC5).
    expect(a.splice.placement).toMatchObject({ offsetMm: 40 });
  });

  it("treats opposite from-node placements at the same point as colocated (AC6)", () => {
    const rendered = renderColocated([
      { id: "SP-A", fromNodeId: segment.nodeA, offsetMm: 30 },
      { id: "SP-B", fromNodeId: segment.nodeB, offsetMm: 70 },
    ]);
    expect(rendered).toHaveLength(2);
    expect(rendered.every((model) => model.isColocated)).toBe(true);
    const [a, b] = rendered;
    expect(a!.anchorPosition).toEqual(b!.anchorPosition);
    expect(a!.position.y).toBeCloseTo(-b!.position.y);
  });

  it("keeps a lone splice un-colocated and on its anchor", () => {
    const rendered = renderColocated([{ id: "SP-A", fromNodeId: segment.nodeA, offsetMm: 40 }]);
    expect(rendered).toHaveLength(1);
    expect(rendered[0]!.isColocated).toBe(false);
    expect(rendered[0]!.position.y).toBeCloseTo(0);
  });

  it("spreads three colocated splices symmetrically without overlap (AC3)", () => {
    const rendered = renderColocated([
      { id: "SP-A", fromNodeId: segment.nodeA, offsetMm: 50 },
      { id: "SP-B", fromNodeId: segment.nodeA, offsetMm: 50 },
      { id: "SP-C", fromNodeId: segment.nodeA, offsetMm: 50 },
    ]);
    expect(rendered).toHaveLength(3);
    const ys = rendered.map((model) => model.position.y).sort((left, right) => left - right);
    expect(ys[1]).toBeCloseTo(0);
    expect(ys[0]).toBeCloseTo(-COLOCATED_SPLICE_OFFSET_STEP);
    expect(ys[2]).toBeCloseTo(COLOCATED_SPLICE_OFFSET_STEP);
    const positionKeys = new Set(rendered.map((model) => `${model.position.x.toFixed(2)}:${model.position.y.toFixed(2)}`));
    expect(positionKeys.size).toBe(3);
  });
});

describe("biasFloatingSpliceVisualRatio", () => {
  it("keeps the center at the center", () => {
    expect(biasFloatingSpliceVisualRatio(0.5)).toBeCloseTo(0.5);
  });

  it("biases only mildly toward the physically closer endpoint", () => {
    // Near-start offset stays left of center but well inside the segment.
    expect(biasFloatingSpliceVisualRatio(0)).toBeCloseTo(0.325);
    // Near-end offset is the symmetric mirror about the center.
    expect(biasFloatingSpliceVisualRatio(1)).toBeCloseTo(0.675);
    expect(biasFloatingSpliceVisualRatio(0.25) - 0.5).toBeCloseTo(-(biasFloatingSpliceVisualRatio(0.75) - 0.5));
  });

  it("never leaves the bounded visual band even for out-of-range input", () => {
    for (const ratio of [-5, -0.0001, 0, 0.5, 1, 1.0001, 5, Number.NaN]) {
      const result = biasFloatingSpliceVisualRatio(ratio);
      expect(result).toBeGreaterThanOrEqual(FLOATING_SPLICE_VISUAL_MIN_RATIO);
      expect(result).toBeLessThanOrEqual(FLOATING_SPLICE_VISUAL_MAX_RATIO);
    }
  });

  it("is deterministic for repeated calls", () => {
    expect(biasFloatingSpliceVisualRatio(0.13)).toBe(biasFloatingSpliceVisualRatio(0.13));
  });
});
