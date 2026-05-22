import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ConnectorId, NodeId, WireId } from "../core/entities";
import { NetworkSummaryCalloutsLayer } from "../app/components/network-summary/callouts/NetworkSummaryCalloutsLayer";
import type { RenderedCableCallout } from "../app/components/network-summary/callouts/calloutLayout";

describe("NetworkSummaryCalloutsLayer", () => {
  it("highlights connector drawing ways linked to the selected wire", () => {
    const renderedCallout: RenderedCableCallout = {
      callout: {
        key: "connector:C1",
        kind: "connector",
        entityId: "C1" as ConnectorId,
        nodeId: "N-C1" as NodeId,
        nodePosition: { x: 0, y: 0 },
        position: { x: 20, y: 20 },
        title: "Connector 1",
        subtitle: "C-1",
        connectorLayout: {
          version: 1,
          units: "grid",
          width: 3,
          height: 2,
          ways: [
            { cavityIndex: 1, x: 1, y: 1, shape: "round" },
            { cavityIndex: 2, x: 2, y: 1, shape: "round" }
          ]
        },
        groups: [
          {
            key: "connector:C1:C1",
            label: "C1",
            entries: [
              {
                wireId: "W1",
                name: "Wire 1",
                technicalId: "W-1",
                color: "",
                colorPrimaryHex: null,
                colorSecondaryHex: null,
                targetId: "S-1",
                targetPin: "P1",
                lengthMm: 0,
                sectionMm2: 0.5
              }
            ]
          },
          { key: "connector:C1:C2", label: "C2", entries: [] }
        ],
        isDeemphasized: false,
        isSelected: false
      },
      layout: {
        width: 120,
        drawingTopY: 2,
        drawingWidth: 40,
        drawingHeight: 24,
        titleStartY: 30,
        subtitleStartY: null,
        headerY: 38,
        rowsStartY: 44,
        rowStep: 8,
        rowHeight: 6,
        height: 56,
        columns: [],
        rows: []
      },
      lineEnd: { x: 10, y: 10 },
      calloutClassName: "network-callout-group",
      isVisibleInViewport: true
    };

    const { container } = render(
      <svg>
        <NetworkSummaryCalloutsLayer
          renderedCableCallouts={[renderedCallout]}
          inverseLabelScale={1}
          selectedWireId={"W1" as WireId}
          onHoverCallout={vi.fn()}
          onCalloutMouseDown={vi.fn()}
          onSelectConnectorFromCallout={vi.fn()}
          onSelectSpliceFromCallout={vi.fn()}
          networkOffset={{ x: 0, y: 0 }}
          networkScale={1}
        />
      </svg>
    );

    expect(container.querySelectorAll(".network-callout-connector-way.is-wire-highlighted")).toHaveLength(1);
    expect(container.querySelector(".network-callout-connector-way-group.is-wire-highlighted text")?.textContent).toBe("C1");
  });
});
