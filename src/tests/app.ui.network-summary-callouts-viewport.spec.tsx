import { fireEvent, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { appActions, appReducer } from "../store";
import {
  asConnectorId,
  asWireId,
  createUiIntegrationDenseWiresState,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";
import { openEditMenu, openViewMenu } from "./helpers/network-summary-workflow-test-utils";

describe("App integration UI - network summary callouts and viewport persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("toggles connector/splice cable callouts, selects linked entities, and persists dragged callout positions", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    openViewMenu(networkSummaryPanel);
    const networkSvg = within(networkSummaryPanel).getByLabelText("2D network diagram") as unknown as SVGSVGElement;
    const calloutsToggle = within(networkSummaryPanel).getByRole("button", { name: "Callouts" });

    expect(networkSummaryPanel.querySelectorAll(".network-callout-frame")).toHaveLength(0);

    fireEvent.click(calloutsToggle);
    const calloutFrames = networkSummaryPanel.querySelectorAll(".network-callout-frame");
    expect(calloutFrames.length).toBeGreaterThanOrEqual(2);

    const firstCalloutAnchor = networkSummaryPanel.querySelector(".network-callout-anchor");
    expect(firstCalloutAnchor).not.toBeNull();

    const transformBeforeDrag = (firstCalloutAnchor as SVGGElement).getAttribute("transform") ?? "";

    fireEvent.mouseDown(firstCalloutAnchor as Element, { button: 0, clientX: 220, clientY: 140 });
    fireEvent.mouseMove(networkSvg, { clientX: 222, clientY: 141 });
    fireEvent.mouseUp(networkSvg, { clientX: 222, clientY: 141 });
    expect(networkSummaryPanel.querySelector(".network-node.connector.is-selected")).not.toBeNull();
    expect((firstCalloutAnchor as SVGGElement).getAttribute("transform") ?? "").toBe(transformBeforeDrag);

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
        })
    );

    fireEvent.mouseDown(firstCalloutAnchor as Element, { button: 0, clientX: 220, clientY: 140 });
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

  it("switches analysis sub-view when selecting connector and splice callouts", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("analysis");
    switchSubScreenDrawerAware("wire");

    let networkSummaryPanel = getPanelByHeading("Network summary");
    openViewMenu(networkSummaryPanel);
    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "Callouts" }));

    const connectorCallout = networkSummaryPanel.querySelector('[aria-label^="Select connector"]');
    expect(connectorCallout).not.toBeNull();
    fireEvent.click(connectorCallout as Element);
    expect(getPanelByHeading("Connector analysis")).toBeInTheDocument();

    networkSummaryPanel = getPanelByHeading("Network summary");
    const spliceCallout = networkSummaryPanel.querySelector('[aria-label^="Select splice"]');
    expect(spliceCallout).not.toBeNull();
    fireEvent.click(spliceCallout as Element);
    expect(getPanelByHeading("Splice analysis")).toBeInTheDocument();
  });

  it("resets persisted callout positions when generating a new 2D layout", async () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    openViewMenu(networkSummaryPanel);
    const networkSvg = within(networkSummaryPanel).getByLabelText("2D network diagram") as unknown as SVGSVGElement;
    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "Callouts" }));

    const firstCalloutAnchor = networkSummaryPanel.querySelector(".network-callout-anchor");
    expect(firstCalloutAnchor).not.toBeNull();
    fireEvent.mouseDown(firstCalloutAnchor as Element, { button: 0, clientX: 220, clientY: 140 });

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
        })
    );
    fireEvent.mouseMove(networkSvg, { clientX: 700, clientY: 420 });
    fireEvent.mouseUp(networkSvg);
    rectSpy.mockRestore();

    const selectedCalloutAnchorBeforeGenerate = networkSummaryPanel.querySelector(
      ".network-callout-group.is-selected .network-callout-anchor"
    );
    expect(selectedCalloutAnchorBeforeGenerate).not.toBeNull();
    const draggedTransform = (selectedCalloutAnchorBeforeGenerate as SVGGElement).getAttribute("transform") ?? "";

    openEditMenu(networkSummaryPanel);
    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "Generate" }));

    await waitFor(() => {
      const selectedCalloutAnchorAfterGenerate = networkSummaryPanel.querySelector(
        ".network-callout-group.is-selected .network-callout-anchor"
      );
      expect(selectedCalloutAnchorAfterGenerate).not.toBeNull();
      expect((selectedCalloutAnchorAfterGenerate as SVGGElement).getAttribute("transform") ?? "").not.toBe(draggedTransform);
    });
  });

  it("renders dense callout examples with multiple wires per connector/splice for regression testing", () => {
    renderAppWithState(createUiIntegrationDenseWiresState());
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    openViewMenu(networkSummaryPanel);
    const calloutsToggle = within(networkSummaryPanel).getByRole("button", { name: "Callouts" });
    fireEvent.click(calloutsToggle);

    const calloutFrames = networkSummaryPanel.querySelectorAll(".network-callout-frame");
    const calloutRows = networkSummaryPanel.querySelectorAll(".network-callout-table-cell");
    expect(calloutFrames.length).toBeGreaterThanOrEqual(4);
    expect(calloutRows.length).toBeGreaterThanOrEqual(8);
    expect(networkSummaryPanel).toHaveTextContent("Length");
    expect(networkSummaryPanel).toHaveTextContent("Section");
    expect(networkSummaryPanel).toHaveTextContent("Color");
    expect(networkSummaryPanel).toHaveTextContent("End ID");
    expect(networkSummaryPanel).toHaveTextContent("PIN");
    expect(networkSummaryPanel).toHaveTextContent("W-8");
  });

  it("avoids canvas text measurement fallback in jsdom when enabling callouts", () => {
    const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, "getContext");

    try {
      renderAppWithState(createUiIntegrationDenseWiresState());
      switchScreenDrawerAware("modeling");

      const networkSummaryPanel = getPanelByHeading("Network summary");
      openViewMenu(networkSummaryPanel);
      fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "Callouts" }));

      expect(networkSummaryPanel.querySelectorAll(".network-callout-frame").length).toBeGreaterThanOrEqual(4);
      expect(getContextSpy).not.toHaveBeenCalled();
    } finally {
      getContextSpy.mockRestore();
    }
  });

  it("highlights callout rows that match the selected wire", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    openViewMenu(networkSummaryPanel);
    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "Callouts" }));

    expect(networkSummaryPanel.querySelectorAll(".network-callout-table-row.is-selected-wire")).toHaveLength(0);
    expect(networkSummaryPanel.querySelectorAll(".network-callout-table-cell.is-selected-wire")).toHaveLength(0);

    switchSubScreenDrawerAware("wire");
    const wiresPanel = getPanelByHeading("Wires");
    fireEvent.click(within(wiresPanel).getByText("Wire 1"));

    const highlightedRows = networkSummaryPanel.querySelectorAll(".network-callout-table-row.is-selected-wire");
    const highlightedCells = networkSummaryPanel.querySelectorAll(".network-callout-table-cell.is-selected-wire");
    expect(highlightedRows.length).toBeGreaterThan(0);
    expect(highlightedCells.length).toBeGreaterThan(0);
    expect(Array.from(highlightedRows).some((row) => (row.textContent ?? "").includes("W-1"))).toBe(true);
  });

  it("renders color swatches next to color codes in callout rows", () => {
    const baseState = createUiIntegrationState();
    const wire = baseState.wires.byId[asWireId("W1")];
    if (wire === undefined) {
      throw new Error("Expected wire W1 in base integration state.");
    }
    const withColoredWire = appReducer(
      baseState,
      appActions.upsertWire({
        ...wire,
        colorMode: "catalog",
        primaryColorId: "RD",
        secondaryColorId: "BU"
      })
    );

    renderAppWithState(withColoredWire);
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    openViewMenu(networkSummaryPanel);
    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "Callouts" }));

    expect(networkSummaryPanel).toHaveTextContent("RD/BU");
    expect(networkSummaryPanel.querySelectorAll(".network-callout-color-dot").length).toBeGreaterThanOrEqual(2);
  });

  it("keeps offscreen callouts out of the interactive callout layer", () => {
    const baseState = createUiIntegrationState();
    const connector = baseState.connectors.byId[asConnectorId("C1")];
    if (connector === undefined) {
      throw new Error("Expected connector C1 in base integration state.");
    }
    const withOffscreenConnectorCallout = appReducer(
      baseState,
      appActions.upsertConnector({
        ...connector,
        cableCalloutPosition: { x: 10_000, y: 10_000 }
      })
    );

    renderAppWithState(withOffscreenConnectorCallout);
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    openViewMenu(networkSummaryPanel);
    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "Callouts" }));

    const calloutAnchors = Array.from(networkSummaryPanel.querySelectorAll(".network-callout-anchor"));
    expect(calloutAnchors.length).toBeGreaterThanOrEqual(1);
    expect(calloutAnchors.some((anchor) => (anchor.getAttribute("transform") ?? "").includes("10000"))).toBe(false);

    const connectorNode = networkSummaryPanel.querySelector(".network-node.connector");
    expect(connectorNode).not.toBeNull();
    fireEvent.click(connectorNode as Element);
    expect(networkSummaryPanel.querySelector(".network-node.connector.is-selected")).not.toBeNull();
  });

  it("filters callouts to selected connector/splice only when selected-callout-only preference is enabled", () => {
    renderAppWithState(createUiIntegrationDenseWiresState());

    switchScreenDrawerAware("settings");
    const canvasSettingsPanel = getPanelByHeading("Canvas tools preferences");
    fireEvent.click(within(canvasSettingsPanel).getByLabelText("Show connector/splice cable callouts by default"));
    fireEvent.click(within(canvasSettingsPanel).getByLabelText("Show only selected connector/splice callout"));

    switchScreenDrawerAware("modeling");
    const networkSummaryPanel = getPanelByHeading("Network summary");
    openViewMenu(networkSummaryPanel);
    const calloutsToggle = within(networkSummaryPanel).getByRole("button", { name: "Callouts" });
    if (!calloutsToggle.classList.contains("is-active")) {
      fireEvent.click(calloutsToggle);
    }
    expect(calloutsToggle).toHaveClass("is-active");
    expect(networkSummaryPanel.querySelectorAll(".network-callout-frame")).toHaveLength(0);

    const segmentHitbox = networkSummaryPanel.querySelector(".network-segment-hitbox");
    expect(segmentHitbox).not.toBeNull();
    fireEvent.click(segmentHitbox as Element);
    expect(networkSummaryPanel.querySelectorAll(".network-callout-frame")).toHaveLength(0);

    const connectorNode = networkSummaryPanel.querySelector(".network-node.connector");
    expect(connectorNode).not.toBeNull();
    fireEvent.click(connectorNode as Element);
    expect(networkSummaryPanel.querySelectorAll(".network-callout-frame")).toHaveLength(1);

    switchScreenDrawerAware("settings");
    const restoredCanvasSettingsPanel = getPanelByHeading("Canvas tools preferences");
    fireEvent.click(within(restoredCanvasSettingsPanel).getByLabelText("Show only selected connector/splice callout"));

    switchScreenDrawerAware("modeling");
    expect(getPanelByHeading("Network summary").querySelectorAll(".network-callout-frame").length).toBeGreaterThanOrEqual(2);
  });

  it("drags merged segment sheath callouts and persists their position", () => {
    const baseState = createUiIntegrationState();
    const firstSegmentId = baseState.segments.allIds[0];
    const segment = firstSegmentId === undefined ? undefined : baseState.segments.byId[firstSegmentId];
    if (segment === undefined) {
      throw new Error("Expected at least one segment in base integration state.");
    }
    const stateWithSheath = appReducer(
      baseState,
      appActions.upsertSegment({
        ...segment,
        sheathType: "Fixed Tube",
        insulation: "XLPE",
        lineStyle: "GAF-T2-D9",
        internalPartReference: "X723061352"
      })
    );

    renderAppWithState(stateWithSheath);
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    openViewMenu(networkSummaryPanel);
    const networkSvg = within(networkSummaryPanel).getByLabelText("2D network diagram") as unknown as SVGSVGElement;
    const segmentCallout = networkSummaryPanel.querySelector(".network-segment-callout-anchor");
    expect(segmentCallout).not.toBeNull();

    const transformBeforeDrag = (segmentCallout as SVGGElement).getAttribute("transform") ?? "";
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
        })
    );

    fireEvent.mouseDown(segmentCallout as Element, { button: 0, clientX: 260, clientY: 150 });
    fireEvent.mouseMove(networkSvg, { clientX: 600, clientY: 300 });
    fireEvent.mouseUp(networkSvg);
    rectSpy.mockRestore();

    const movedSegmentCallout = networkSummaryPanel.querySelector(".network-segment-callout-anchor");
    expect(movedSegmentCallout).not.toBeNull();
    const transformAfterDrag = (movedSegmentCallout as SVGGElement).getAttribute("transform") ?? "";
    expect(transformAfterDrag).not.toBe(transformBeforeDrag);

    switchScreenDrawerAware("settings");
    switchScreenDrawerAware("modeling");

    const restoredSegmentCallout = getPanelByHeading("Network summary").querySelector(".network-segment-callout-anchor");
    expect(restoredSegmentCallout).not.toBeNull();
    expect((restoredSegmentCallout as SVGGElement).getAttribute("transform")).toBe(transformAfterDrag);
  });

});
