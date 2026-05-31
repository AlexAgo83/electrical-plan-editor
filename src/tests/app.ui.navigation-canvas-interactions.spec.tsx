import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { appActions, appReducer } from "../store";
import {
  asNodeId,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";
import { getNetworkSummaryViewportTransform, mockSvgRect } from "./helpers/navigation-canvas-test-utils";

describe("App integration UI - navigation canvas interactions", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("highlights the corresponding 2D connector node when selecting a connector from the canvas in modeling", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const connectorNode = networkSummaryPanel.querySelector(".network-node.connector");
    expect(connectorNode).not.toBeNull();
    expect(connectorNode).not.toHaveClass("is-selected");

    fireEvent.mouseDown(connectorNode as Element, { button: 0 });
    fireEvent.mouseUp(connectorNode as Element, { button: 0 });
    fireEvent.click(connectorNode as Element);

    expect(connectorNode).toHaveClass("is-selected");
    expect(getPanelByHeading("Connector analysis")).toBeInTheDocument();
  });


  it("dispatches connector selection once for a single 2D node click in modeling", () => {
    const { store } = renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const connectorNode = networkSummaryPanel.querySelector(".network-node.connector");
    expect(connectorNode).not.toBeNull();

    const dispatchSpy = vi.spyOn(store, "dispatch");
    fireEvent.mouseDown(connectorNode as Element, { button: 0 });
    fireEvent.mouseUp(connectorNode as Element, { button: 0 });
    fireEvent.click(connectorNode as Element);

    const selectDispatchCalls = dispatchSpy.mock.calls.filter(
      ([action]) => typeof action === "object" && action !== null && "type" in action && action.type === "ui/select"
    );
    expect(selectDispatchCalls).toHaveLength(1);
    dispatchSpy.mockRestore();
  });


  it("does not move a canvas node on a click with only pointer jitter", () => {
    const positionedState = appReducer(
      createUiIntegrationState(),
      appActions.setNodePositions({
        [asNodeId("N-C1")]: { x: 60, y: 80 },
        [asNodeId("N-MID")]: { x: 220, y: 180 },
        [asNodeId("N-S1")]: { x: 420, y: 220 }
      })
    );
    const { store } = renderAppWithState(positionedState);
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const connectorNode = networkSummaryPanel.querySelector(".network-node.connector");
    const networkSvg = within(networkSummaryPanel).getByLabelText("2D network diagram") as unknown as SVGSVGElement;
    expect(connectorNode).not.toBeNull();

    const rectSpy = mockSvgRect(networkSvg);
    fireEvent.mouseDown(connectorNode as Element, { button: 0, clientX: 180, clientY: 120 });
    fireEvent.mouseMove(networkSvg, { clientX: 182, clientY: 121 });
    fireEvent.mouseUp(networkSvg, { clientX: 182, clientY: 121 });
    rectSpy.mockRestore();

    expect(store.getState().nodePositions[asNodeId("N-C1")]).toEqual({ x: 60, y: 80 });
    expect(connectorNode).toHaveClass("is-selected");
  });


  it("supports keyboard activation for 2D connector node selection in modeling", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const connectorNode = networkSummaryPanel.querySelector(".network-node.connector");
    expect(connectorNode).not.toBeNull();
    expect(connectorNode).toHaveAttribute("role", "button");
    expect(connectorNode).toHaveAttribute("tabindex", "0");
    expect(connectorNode).not.toHaveClass("is-selected");

    fireEvent.keyDown(connectorNode as Element, { key: "Enter" });
    expect(connectorNode).toHaveClass("is-selected");
  });


  it("supports keyboard activation for 2D segment selection in analysis", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("analysis");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const segmentHitbox = within(networkSummaryPanel).getByRole("button", { name: "Select segment SEG-A" });
    expect(segmentHitbox).toHaveAttribute("tabindex", "0");

    fireEvent.keyDown(segmentHitbox, { key: "Enter" });

    const selectedSegmentStroke = networkSummaryPanel.querySelector(
      '.network-graph-layer-segments [data-segment-id="SEG-A"] .network-segment'
    );
    expect(selectedSegmentStroke).toHaveClass("is-selected");
  });


  it("switches analysis sub-view to the clicked 2D entity type", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("analysis");
    switchSubScreenDrawerAware("wire");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const connectorNode = networkSummaryPanel.querySelector(".network-node.connector");
    const spliceNode = networkSummaryPanel.querySelector(".network-node.splice");
    const intermediateNode = networkSummaryPanel.querySelector(".network-node.intermediate");
    const segmentHitbox = within(networkSummaryPanel).getByRole("button", { name: "Select segment SEG-A" });
    expect(connectorNode).not.toBeNull();
    expect(spliceNode).not.toBeNull();
    expect(intermediateNode).not.toBeNull();

    fireEvent.mouseDown(connectorNode as Element, { button: 0 });
    fireEvent.mouseUp(connectorNode as Element, { button: 0 });
    fireEvent.click(connectorNode as Element);
    expect(getPanelByHeading("Connector analysis")).toBeInTheDocument();

    fireEvent.mouseDown(spliceNode as Element, { button: 0 });
    fireEvent.mouseUp(spliceNode as Element, { button: 0 });
    fireEvent.click(spliceNode as Element);
    expect(getPanelByHeading("Splice analysis")).toBeInTheDocument();

    fireEvent.click(segmentHitbox);
    expect(getPanelByHeading("Segment analysis")).toBeInTheDocument();

    fireEvent.mouseDown(intermediateNode as Element, { button: 0 });
    fireEvent.mouseUp(intermediateNode as Element, { button: 0 });
    fireEvent.click(intermediateNode as Element);
    expect(getPanelByHeading("Node analysis")).toBeInTheDocument();
  });


  it("keeps connector and splice node clicks more specific than the node sub-view", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("analysis");
    switchSubScreenDrawerAware("node");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const connectorNode = networkSummaryPanel.querySelector(".network-node.connector");
    const spliceNode = networkSummaryPanel.querySelector(".network-node.splice");
    expect(connectorNode).not.toBeNull();
    expect(spliceNode).not.toBeNull();

    fireEvent.mouseDown(connectorNode as Element, { button: 0 });
    fireEvent.mouseUp(connectorNode as Element, { button: 0 });
    fireEvent.click(connectorNode as Element);
    expect(getPanelByHeading("Connector analysis")).toBeInTheDocument();

    switchSubScreenDrawerAware("node");
    fireEvent.mouseDown(spliceNode as Element, { button: 0 });
    fireEvent.mouseUp(spliceNode as Element, { button: 0 });
    fireEvent.click(spliceNode as Element);
    expect(getPanelByHeading("Splice analysis")).toBeInTheDocument();
  });


  it("clears selection when clicking empty 2D canvas in select mode", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const connectorNode = networkSummaryPanel.querySelector(".network-node.connector");
    const networkSvg = within(networkSummaryPanel).getByLabelText("2D network diagram");
    expect(connectorNode).not.toBeNull();

    fireEvent.mouseDown(connectorNode as Element, { button: 0 });
    fireEvent.mouseUp(connectorNode as Element, { button: 0 });
    fireEvent.click(connectorNode as Element);
    expect(connectorNode).toHaveClass("is-selected");

    fireEvent.click(networkSvg);
    expect(connectorNode).not.toHaveClass("is-selected");
  });


  it("keeps the current selection after dragging the empty 2D canvas", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const connectorNode = networkSummaryPanel.querySelector(".network-node.connector");
    const networkSvg = within(networkSummaryPanel).getByLabelText("2D network diagram") as unknown as SVGSVGElement;
    expect(connectorNode).not.toBeNull();

    fireEvent.mouseDown(connectorNode as Element, { button: 0 });
    fireEvent.mouseUp(connectorNode as Element, { button: 0 });
    fireEvent.click(connectorNode as Element);
    expect(connectorNode).toHaveClass("is-selected");

    const rectSpy = mockSvgRect(networkSvg);
    fireEvent.mouseDown(networkSvg, { button: 0, clientX: 240, clientY: 180 });
    fireEvent.mouseMove(networkSvg, { clientX: 360, clientY: 250 });
    fireEvent.mouseUp(networkSvg, { clientX: 360, clientY: 250 });
    fireEvent.click(networkSvg);
    rectSpy.mockRestore();

    expect(connectorNode).toHaveClass("is-selected");

    fireEvent.click(networkSvg);
    expect(connectorNode).not.toHaveClass("is-selected");
  });


  it("supports shift-click multi-selection on canvas nodes and clears it from the empty canvas", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const connectorNode = networkSummaryPanel.querySelector(".network-node.connector");
    const intermediateNode = networkSummaryPanel.querySelector(".network-node.intermediate");
    const networkSvg = within(networkSummaryPanel).getByLabelText("2D network diagram");

    expect(connectorNode).not.toBeNull();
    expect(intermediateNode).not.toBeNull();
    expect(within(networkSummaryPanel).queryByText("Shift-click nodes to select a group.")).not.toBeInTheDocument();

    fireEvent.mouseDown(connectorNode as Element, { button: 0, shiftKey: true });
    fireEvent.mouseUp(connectorNode as Element, { button: 0, shiftKey: true });
    fireEvent.mouseDown(intermediateNode as Element, { button: 0, shiftKey: true });
    fireEvent.mouseUp(intermediateNode as Element, { button: 0, shiftKey: true });

    expect(connectorNode).toHaveClass("is-selected");
    expect(intermediateNode).toHaveClass("is-selected");
    expect(within(networkSummaryPanel).getByText("Drag one selected node to move the full group.")).toBeInTheDocument();
    expect(within(networkSummaryPanel).getByText("2 nodes selected.")).toBeInTheDocument();
    expect(within(networkSummaryPanel).getByRole("button", { name: "Clear selection" })).toBeInTheDocument();

    fireEvent.click(networkSvg);
    expect(connectorNode).not.toHaveClass("is-selected");
    expect(intermediateNode).not.toHaveClass("is-selected");
    expect(within(networkSummaryPanel).queryByText(/nodes selected\./)).toBeNull();
  });


  it("moves every selected canvas node by the same persisted delta during grouped drag", () => {
    const positionedState = appReducer(
      createUiIntegrationState(),
      appActions.setNodePositions({
        [asNodeId("N-C1")]: { x: 60, y: 80 },
        [asNodeId("N-MID")]: { x: 220, y: 180 },
        [asNodeId("N-S1")]: { x: 420, y: 220 }
      })
    );
    const { store } = renderAppWithState(positionedState);
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const connectorNode = networkSummaryPanel.querySelector(".network-node.connector");
    const intermediateNode = networkSummaryPanel.querySelector(".network-node.intermediate");
    const connectorShape = connectorNode?.querySelector(".network-node-shape");
    const intermediateShape = intermediateNode?.querySelector(".network-node-shape");
    const networkSvg = within(networkSummaryPanel).getByLabelText("2D network diagram") as unknown as SVGSVGElement;
    expect(connectorNode).not.toBeNull();
    expect(intermediateNode).not.toBeNull();
    expect(connectorShape).not.toBeNull();
    expect(intermediateShape).not.toBeNull();
    if (connectorShape === null || intermediateShape === null) {
      throw new Error("Expected rendered node shapes.");
    }

    const connectorBefore = {
      x:
        Number((connectorShape as SVGRectElement).getAttribute("x")) +
        Number((connectorShape as SVGRectElement).getAttribute("width")) / 2,
      y:
        Number((connectorShape as SVGRectElement).getAttribute("y")) +
        Number((connectorShape as SVGRectElement).getAttribute("height")) / 2
    };
    const intermediateBefore = {
      x: Number((intermediateShape as SVGCircleElement).getAttribute("cx")),
      y: Number((intermediateShape as SVGCircleElement).getAttribute("cy"))
    };

    fireEvent.mouseDown(connectorNode as Element, { button: 0, shiftKey: true });
    fireEvent.mouseUp(connectorNode as Element, { button: 0, shiftKey: true });
    fireEvent.mouseDown(intermediateNode as Element, { button: 0, shiftKey: true });
    fireEvent.mouseUp(intermediateNode as Element, { button: 0, shiftKey: true });

    const rectSpy = mockSvgRect(networkSvg);
    fireEvent.mouseDown(connectorNode as Element, { button: 0, clientX: 180, clientY: 120 });
    fireEvent.mouseMove(networkSvg, { clientX: 420, clientY: 250 });
    fireEvent.mouseUp(networkSvg, { clientX: 420, clientY: 250 });
    rectSpy.mockRestore();

    const nextState = store.getState();
    const connectorAfter = nextState.nodePositions[asNodeId("N-C1")];
    const intermediateAfter = nextState.nodePositions[asNodeId("N-MID")];
    const spliceAfter = nextState.nodePositions[asNodeId("N-S1")];
    expect(connectorAfter).toBeDefined();
    expect(intermediateAfter).toBeDefined();
    expect(spliceAfter).toEqual({ x: 420, y: 220 });
    if (connectorAfter === undefined || intermediateAfter === undefined) {
      throw new Error("Expected moved node positions.");
    }

    const connectorDelta = {
      x: connectorAfter.x - connectorBefore.x,
      y: connectorAfter.y - connectorBefore.y
    };
    const intermediateDelta = {
      x: intermediateAfter.x - intermediateBefore.x,
      y: intermediateAfter.y - intermediateBefore.y
    };

    expect(connectorDelta.x).not.toBe(0);
    expect(connectorDelta.y).not.toBe(0);
    expect(intermediateDelta).toEqual(connectorDelta);
    expect(Object.keys(nextState.nodePositions)).toHaveLength(3);
  });


  it("ignores non-primary mouse buttons for 2D node drag selection and shift-pan starts", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const connectorNode = networkSummaryPanel.querySelector(".network-node.connector");
    const networkSvg = within(networkSummaryPanel).getByLabelText("2D network diagram");
    const canvasShell = networkSummaryPanel.querySelector(".network-canvas-shell");

    expect(connectorNode).not.toBeNull();
    expect(canvasShell).not.toBeNull();
    expect(connectorNode).not.toHaveClass("is-selected");

    fireEvent.mouseDown(connectorNode as Element, { button: 2 });
    expect(connectorNode).not.toHaveClass("is-selected");
    expect(screen.queryByRole("heading", { name: "Edit Connector" })).not.toBeInTheDocument();

    fireEvent.mouseDown(networkSvg, { button: 2, shiftKey: true });
    expect(canvasShell).not.toHaveClass("is-panning");
  });


  it("allows dragging the empty 2D view without Shift while keeping entity drag separate", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const connectorNode = networkSummaryPanel.querySelector(".network-node.connector");
    const networkSvg = within(networkSummaryPanel).getByLabelText("2D network diagram") as unknown as SVGSVGElement;
    const rectSpy = mockSvgRect(networkSvg);
    const initialTransform = getNetworkSummaryViewportTransform(networkSummaryPanel);
    expect(connectorNode).not.toBeNull();

    fireEvent.mouseDown(networkSvg, { button: 0, clientX: 240, clientY: 180 });
    fireEvent.mouseMove(networkSvg, { clientX: 360, clientY: 250 });
    fireEvent.mouseUp(networkSvg, { clientX: 360, clientY: 250 });
    const pannedTransform = getNetworkSummaryViewportTransform(networkSummaryPanel);
    expect(pannedTransform).not.toBe(initialTransform);

    fireEvent.mouseDown(connectorNode as Element, { button: 0, clientX: 180, clientY: 120 });
    fireEvent.mouseMove(networkSvg, { clientX: 420, clientY: 250 });
    fireEvent.mouseUp(networkSvg, { clientX: 420, clientY: 250 });
    expect(getNetworkSummaryViewportTransform(networkSummaryPanel)).toBe(pannedTransform);

    rectSpy.mockRestore();
  });


  it("does not change 2D zoom on mouse wheel", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("analysis");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const networkSvg = within(networkSummaryPanel).getByLabelText("2D network diagram");
    const transformBeforeWheel = getNetworkSummaryViewportTransform(networkSummaryPanel);

    fireEvent.wheel(networkSvg, { deltaY: -200 });
    expect(getNetworkSummaryViewportTransform(networkSummaryPanel)).toBe(transformBeforeWheel);
  });

});
