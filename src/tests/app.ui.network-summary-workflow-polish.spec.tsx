import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { appActions, appReducer } from "../store";
import {
  asConnectorId,
  asSpliceId,
  asWireId,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("App integration UI - network summary workflow polish", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders a compact quick entity navigation strip after route preview and switches sub-screens", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");

    const routePreviewPanel = getPanelByHeading("Route preview");
    const quickNavPanel = screen.getByRole("region", { name: "Quick entity navigation" });
    const connectorsButton = within(quickNavPanel).getByRole("button", { name: /Connectors/i });
    const segmentsButton = within(quickNavPanel).getByRole("button", { name: /Segments/i });
    const wiresButton = within(quickNavPanel).getByRole("button", { name: /Wires/i });

    expect(routePreviewPanel.nextElementSibling).toBe(quickNavPanel);
    expect(within(quickNavPanel).getByRole("button", { name: /Nodes/i })).toBeInTheDocument();
    expect(connectorsButton).toHaveAttribute("aria-pressed", "true");
    expect(segmentsButton).toHaveAttribute("aria-pressed", "false");
    expect(wiresButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(segmentsButton);
    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    expect(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Segment$/, hidden: true })).toHaveClass(
      "is-active"
    );

    switchScreenDrawerAware("analysis");
    const analysisQuickNavPanel = screen.getByRole("region", { name: "Quick entity navigation" });
    expect(within(analysisQuickNavPanel).queryByRole("button", { name: /Nodes/i })).not.toBeInTheDocument();
    expect(within(analysisQuickNavPanel).queryByRole("button", { name: /Segments/i })).not.toBeInTheDocument();
    expect(within(analysisQuickNavPanel).getByRole("button", { name: /Wires/i })).toBeInTheDocument();
  });

  it("sorts wires by numeric length in modeling wire table", () => {
    const withSecondWire = appReducer(
      createUiIntegrationState(),
      appActions.saveWire({
        id: asWireId("W2"),
        name: "Wire 2",
        technicalId: "W-2",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 2 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 2 }
      })
    );
    const wire1 = withSecondWire.wires.byId[asWireId("W1")];
    const wire2 = withSecondWire.wires.byId[asWireId("W2")];
    const state =
      wire1 && wire2
        ? {
            ...withSecondWire,
            wires: {
              ...withSecondWire.wires,
              byId: {
                ...withSecondWire.wires.byId,
                [wire1.id]: { ...wire1, lengthMm: 120 },
                [wire2.id]: { ...wire2, lengthMm: 25 }
              }
            }
          }
        : withSecondWire;

    renderAppWithState(state);
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    const wiresPanel = getPanelByHeading("Wires");
    fireEvent.click(within(wiresPanel).getByRole("button", { name: /Length \(mm\)/i }));

    const rows = Array.from(wiresPanel.querySelectorAll("tbody tr"));
    expect(rows).toHaveLength(2);
    expect(rows[0]?.querySelector("td")?.textContent).toContain("Wire 2");
    expect(rows[0]?.children[3]?.textContent?.trim()).toBe("25");
    expect(rows[1]?.querySelector("td")?.textContent).toContain("Wire 1");
    expect(rows[1]?.children[3]?.textContent?.trim()).toBe("120");
  });

  it("supports deeper zoom-out floor and allows dragging nodes to negative coordinates", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const networkSvg = within(networkSummaryPanel).getByLabelText("2D network diagram") as unknown as SVGSVGElement;
    const zoomOutButton = within(networkSummaryPanel).getByRole("button", { name: "Zoom -" });

    for (let index = 0; index < 12; index += 1) {
      fireEvent.click(zoomOutButton);
    }
    expect(within(networkSummaryPanel).getByText(/View: 30% zoom\./)).toBeInTheDocument();

    const rectSpy = vi.spyOn(networkSvg, "getBoundingClientRect").mockImplementation(
      () =>
        ({
          x: 0,
          y: 0,
          top: 0,
          left: 0,
          width: 800,
          height: 520,
          right: 800,
          bottom: 520,
          toJSON: () => ({})
        }) as DOMRect
    );

    const intermediateNode = networkSummaryPanel.querySelector(".network-node.intermediate");
    const intermediateShape = intermediateNode?.querySelector(".network-node-shape");
    expect(intermediateNode).not.toBeNull();
    expect(intermediateShape).not.toBeNull();

    fireEvent.mouseDown(intermediateNode as Element, { button: 0, clientX: 300, clientY: 220 });
    fireEvent.mouseMove(networkSvg, { clientX: -120, clientY: -90 });
    fireEvent.mouseUp(networkSvg);

    const cx = Number((intermediateShape as SVGCircleElement).getAttribute("cx"));
    const cy = Number((intermediateShape as SVGCircleElement).getAttribute("cy"));
    expect(cx).toBeLessThan(0);
    expect(cy).toBeLessThan(0);

    rectSpy.mockRestore();
  });

  it("toggles connector/splice cable callouts, selects linked entities, and persists dragged callout positions", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const networkSvg = within(networkSummaryPanel).getByLabelText("2D network diagram") as unknown as SVGSVGElement;
    const calloutsToggle = within(networkSummaryPanel).getByRole("button", { name: "Callouts" });

    expect(networkSummaryPanel.querySelectorAll(".network-callout-frame")).toHaveLength(0);

    fireEvent.click(calloutsToggle);
    const calloutFrames = networkSummaryPanel.querySelectorAll(".network-callout-frame");
    expect(calloutFrames.length).toBeGreaterThanOrEqual(2);

    const firstCalloutAnchor = networkSummaryPanel.querySelector(".network-callout-anchor");
    expect(firstCalloutAnchor).not.toBeNull();

    fireEvent.mouseDown(firstCalloutAnchor as Element, { button: 0, clientX: 220, clientY: 140 });
    expect(networkSummaryPanel.querySelector(".network-node.connector.is-selected")).not.toBeNull();

    const transformBeforeDrag = (firstCalloutAnchor as SVGGElement).getAttribute("transform") ?? "";

    const rectSpy = vi.spyOn(networkSvg, "getBoundingClientRect").mockImplementation(
      () =>
        ({
          x: 0,
          y: 0,
          top: 0,
          left: 0,
          width: 800,
          height: 520,
          right: 800,
          bottom: 520,
          toJSON: () => ({})
        }) as DOMRect
    );

    fireEvent.mouseMove(networkSvg, { clientX: 620, clientY: 320 });
    fireEvent.mouseUp(networkSvg);
    rectSpy.mockRestore();

    const movedCalloutAnchor = networkSummaryPanel.querySelector(".network-callout-anchor");
    expect(movedCalloutAnchor).not.toBeNull();
    const transformAfterDrag = (movedCalloutAnchor as SVGGElement).getAttribute("transform") ?? "";
    expect(transformAfterDrag).not.toBe(transformBeforeDrag);

    fireEvent.click(calloutsToggle);
    expect(networkSummaryPanel.querySelectorAll(".network-callout-frame")).toHaveLength(0);
    fireEvent.click(calloutsToggle);

    const restoredCalloutAnchor = networkSummaryPanel.querySelector(".network-callout-anchor");
    expect(restoredCalloutAnchor).not.toBeNull();
    expect((restoredCalloutAnchor as SVGGElement).getAttribute("transform") ?? "").toBe(transformAfterDrag);
  });
});
