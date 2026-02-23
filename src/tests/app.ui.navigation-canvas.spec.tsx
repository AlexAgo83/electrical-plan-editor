import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  asNodeId,
  asSegmentId,
  createUiIntegrationState,
  createValidationIssueState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";
import { appActions, appReducer, createInitialState } from "../store";

describe("App integration UI - navigation and canvas", () => {
  function openOperationsHealthPanel(): void {
    fireEvent.click(screen.getByRole("button", { name: "Ops & Health" }));
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it("exposes Network Scope as a primary workspace entry", () => {
    renderAppWithState(createUiIntegrationState());

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const primaryNavRow = document.querySelector(".workspace-nav-row");
    expect(primaryNavRow).not.toBeNull();
    const networkScopeButton = within(primaryNavRow as HTMLElement).getByRole("button", { name: /^Network Scope$/ });
    fireEvent.click(networkScopeButton);
    expect(networkScopeButton).toHaveClass("is-active");
    expect(document.querySelector(".workspace-nav-row.secondary")).toBeNull();
    expect(getPanelByHeading("Network Scope")).toBeInTheDocument();
  });

  it("toggles the navigation drawer from the header and closes on backdrop click", () => {
    renderAppWithState(createUiIntegrationState());

    const toggleButton = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(toggleButton);
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close navigation menu" }));
    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
  });

  it("supports undo and redo for modeling actions", () => {
    renderAppWithState(createInitialState());
    switchScreenDrawerAware("modeling");

    const idleConnectorFormPanel = getPanelByHeading("Connector form");
    fireEvent.click(within(idleConnectorFormPanel).getByRole("button", { name: "Create" }));
    const connectorFormPanel = getPanelByHeading("Create Connector");
    fireEvent.change(within(connectorFormPanel).getByLabelText("Functional name"), {
      target: { value: "Undo test connector" }
    });
    fireEvent.change(within(connectorFormPanel).getByLabelText("Technical ID"), {
      target: { value: "C-UNDO-1" }
    });
    fireEvent.change(within(connectorFormPanel).getByLabelText("Way count"), {
      target: { value: "2" }
    });
    fireEvent.click(within(connectorFormPanel).getByRole("button", { name: "Create" }));

    const connectorsPanel = getPanelByHeading("Connectors");
    expect(within(connectorsPanel).getByText("Undo test connector")).toBeInTheDocument();

    openOperationsHealthPanel();
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(within(connectorsPanel).queryByText("Undo test connector")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    expect(within(connectorsPanel).getByText("Undo test connector")).toBeInTheDocument();
  });

  it("focuses the created connector row and switches the form to edit mode after creation", async () => {
    renderAppWithState(createInitialState());
    switchScreenDrawerAware("modeling");

    const idleConnectorFormPanel = getPanelByHeading("Connector form");
    fireEvent.click(within(idleConnectorFormPanel).getByRole("button", { name: "Create" }));
    const connectorFormPanel = getPanelByHeading("Create Connector");
    fireEvent.change(within(connectorFormPanel).getByLabelText("Functional name"), {
      target: { value: "Focused connector" }
    });
    fireEvent.change(within(connectorFormPanel).getByLabelText("Technical ID"), {
      target: { value: "C-FOCUS-1" }
    });
    fireEvent.change(within(connectorFormPanel).getByLabelText("Way count"), {
      target: { value: "3" }
    });
    fireEvent.click(within(connectorFormPanel).getByRole("button", { name: "Create" }));

    const connectorsPanel = getPanelByHeading("Connectors");
    const createdRow = within(connectorsPanel).getByText("Focused connector").closest("tr");
    expect(createdRow).not.toBeNull();
    expect(getPanelByHeading("Edit Connector")).toBeInTheDocument();

    await waitFor(() => {
      expect(createdRow).toHaveClass("is-selected");
      expect(document.activeElement).toBe(createdRow);
    });
  });

  it("reflects connector cavity occupancy in real time", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Connector 1"));
    switchScreenDrawerAware("analysis");

    const connectorAnalysisPanel = getPanelByHeading("Connector analysis");
    expect(within(connectorAnalysisPanel).getByText("wire:W1:A")).toBeInTheDocument();
  });

  it("reflects splice port occupancy in real time", () => {
    renderAppWithState(createUiIntegrationState());

    switchSubScreenDrawerAware("splice");
    const splicesPanel = getPanelByHeading("Splices");
    fireEvent.click(within(splicesPanel).getByText("Splice 1"));
    switchScreenDrawerAware("analysis");

    const spliceAnalysisPanel = getPanelByHeading("Splice analysis");
    expect(within(spliceAnalysisPanel).getByText("wire:W1:B")).toBeInTheDocument();
  });

  it("highlights every segment in the selected wire route", () => {
    renderAppWithState(createUiIntegrationState());

    switchSubScreenDrawerAware("segment");
    const segmentsPanel = getPanelByHeading("Segments");
    expect(within(segmentsPanel).getByText("SEG-A").closest("tr")).not.toHaveClass("is-wire-highlighted");
    expect(within(segmentsPanel).getByText("SEG-B").closest("tr")).not.toHaveClass("is-wire-highlighted");

    switchSubScreenDrawerAware("wire");
    const wiresPanel = getPanelByHeading("Wires");
    fireEvent.click(within(wiresPanel).getByText("Wire 1"));

    switchSubScreenDrawerAware("segment");
    expect(within(segmentsPanel).getByText("SEG-A").closest("tr")).toHaveClass("is-wire-highlighted");
    expect(within(segmentsPanel).getByText("SEG-B").closest("tr")).toHaveClass("is-wire-highlighted");
  });

  it("renders the 2D network diagram in analysis", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("analysis");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    expect(within(networkSummaryPanel).getByLabelText("2D network diagram")).toBeInTheDocument();
    expect(networkSummaryPanel.querySelectorAll(".network-node").length).toBe(3);
    expect(networkSummaryPanel.querySelectorAll(".network-segment").length).toBe(2);
  });

  it("renders sub-network filter toggles with DEFAULT formatting and supports enable-all restore", () => {
    const stateWithTags = appReducer(
      appReducer(
        createUiIntegrationState(),
        appActions.upsertSegment({
          id: asSegmentId("SEG-A"),
          nodeA: asNodeId("N-C1"),
          nodeB: asNodeId("N-MID"),
          lengthMm: 40,
          subNetworkTag: "ACT_A"
        })
      ),
      appActions.upsertSegment({
        id: asSegmentId("SEG-B"),
        nodeA: asNodeId("N-MID"),
        nodeB: asNodeId("N-S1"),
        lengthMm: 60
      })
    );

    renderAppWithState(stateWithTags);
    switchScreenDrawerAware("analysis");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const defaultButton = within(networkSummaryPanel).getByRole("button", { name: "DEFAULT" });
    const actAButton = within(networkSummaryPanel).getByRole("button", { name: "ACT_A" });
    const enableAllButton = within(networkSummaryPanel).getByRole("button", { name: "Enable all" });

    expect(defaultButton).toHaveAttribute("aria-pressed", "true");
    expect(defaultButton.querySelector("em")?.textContent).toBe("DEFAULT");
    expect(actAButton).toHaveAttribute("aria-pressed", "true");
    expect(enableAllButton).toBeDisabled();

    fireEvent.click(actAButton);
    expect(actAButton).toHaveAttribute("aria-pressed", "false");
    expect(enableAllButton).toBeEnabled();

    fireEvent.click(enableAllButton);
    expect(actAButton).toHaveAttribute("aria-pressed", "true");
    expect(enableAllButton).toBeDisabled();
  });

  it("deemphasizes 2d segments and nodes not connected to active subnetworks", () => {
    const stateWithTags = appReducer(
      appReducer(
        createUiIntegrationState(),
        appActions.upsertSegment({
          id: asSegmentId("SEG-A"),
          nodeA: asNodeId("N-C1"),
          nodeB: asNodeId("N-MID"),
          lengthMm: 40,
          subNetworkTag: "POWER_MAIN"
        })
      ),
      appActions.upsertSegment({
        id: asSegmentId("SEG-B"),
        nodeA: asNodeId("N-MID"),
        nodeB: asNodeId("N-S1"),
        lengthMm: 60,
        subNetworkTag: "BRANCH"
      })
    );

    renderAppWithState(stateWithTags);
    switchScreenDrawerAware("analysis");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "BRANCH" }));

    const segmentLabelA = Array.from(networkSummaryPanel.querySelectorAll(".network-segment-label")).find(
      (label) => label.textContent === "SEG-A"
    );
    const segmentLabelB = Array.from(networkSummaryPanel.querySelectorAll(".network-segment-label")).find(
      (label) => label.textContent === "SEG-B"
    );
    expect(segmentLabelA).not.toBeUndefined();
    expect(segmentLabelB).not.toBeUndefined();

    const segmentGroupA = segmentLabelA?.closest("g.network-entity-group");
    const segmentGroupB = segmentLabelB?.closest("g.network-entity-group");
    expect(segmentGroupA).not.toBeNull();
    expect(segmentGroupB).not.toBeNull();
    expect(segmentGroupA).not.toHaveClass("is-deemphasized");
    expect(segmentGroupB).toHaveClass("is-deemphasized");

    const connectorNode = networkSummaryPanel.querySelector(".network-node.connector");
    const spliceNode = networkSummaryPanel.querySelector(".network-node.splice");
    const intermediateNode = networkSummaryPanel.querySelector(".network-node.intermediate");
    expect(connectorNode).not.toBeNull();
    expect(spliceNode).not.toBeNull();
    expect(intermediateNode).not.toBeNull();

    expect(connectorNode).not.toHaveClass("is-deemphasized");
    expect(spliceNode).toHaveClass("is-deemphasized");
    // MID stays fully visible because it remains connected to the active segment.
    expect(intermediateNode).not.toHaveClass("is-deemphasized");
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

  it("does not change 2D zoom on mouse wheel", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("analysis");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const currentZoomLine = () => within(networkSummaryPanel).getByText(/View: \d+% zoom\./).textContent ?? "";
    const zoomBeforeWheel = currentZoomLine();
    const networkSvg = within(networkSummaryPanel).getByLabelText("2D network diagram");

    fireEvent.wheel(networkSvg, { deltaY: -200 });
    expect(currentZoomLine()).toBe(zoomBeforeWheel);
  });

  it("keeps 2D labels zoom-invariant using inverse-scale label anchors", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("analysis");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const anchorBefore = networkSummaryPanel.querySelector(".network-segment-label-anchor");
    expect(anchorBefore).not.toBeNull();
    const transformBefore = anchorBefore?.getAttribute("transform") ?? "";
    expect(transformBefore).toContain("scale(1)");

    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "Zoom +" }));

    const anchorAfter = networkSummaryPanel.querySelector(".network-segment-label-anchor");
    expect(anchorAfter).not.toBeNull();
    const transformAfter = anchorAfter?.getAttribute("transform") ?? "";
    expect(transformAfter).not.toBe(transformBefore);
    expect(transformAfter).not.toContain("scale(1)");
  });

  it("synchronizes inspector context and allows editing selected connector", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Connector 1"));
    const inspectorPanel = getPanelByHeading("Inspector context");
    expect(within(inspectorPanel).getByText(/Focused entity:/)).toBeInTheDocument();
    expect(within(inspectorPanel).getByText("C1")).toBeInTheDocument();
    fireEvent.click(within(inspectorPanel).getByRole("button", { name: "Edit" }));

    const editPanel = getPanelByHeading("Edit Connector");
    expect(within(editPanel).getByDisplayValue("Connector 1")).toBeInTheDocument();
    expect(within(editPanel).getByDisplayValue("C-1")).toBeInTheDocument();
  });

  it("keeps connector selection context when switching from modeling to analysis", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");

    const modelingConnectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(modelingConnectorsPanel).getByText("Connector 1"));

    const primaryNavRow = document.querySelector(".workspace-nav-row");
    expect(primaryNavRow).not.toBeNull();
    fireEvent.click(within(primaryNavRow as HTMLElement).getByRole("button", { name: /^Analysis$/, hidden: true }));

    const analysisConnectorsPanel = getPanelByHeading("Connectors");
    const selectedRow = within(analysisConnectorsPanel).getByText("Connector 1").closest("tr");
    expect(selectedRow).toHaveClass("is-selected");
    expect(getPanelByHeading("Connector analysis")).toBeInTheDocument();
  });

  it("keeps analysis selection context when switching back to modeling", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("analysis");

    const analysisConnectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(analysisConnectorsPanel).getByText("Connector 1"));

    const primaryNavRow = document.querySelector(".workspace-nav-row");
    expect(primaryNavRow).not.toBeNull();
    fireEvent.click(within(primaryNavRow as HTMLElement).getByRole("button", { name: /^Modeling$/, hidden: true }));

    const modelingConnectorsPanel = getPanelByHeading("Connectors");
    const selectedRow = within(modelingConnectorsPanel).getByText("Connector 1").closest("tr");
    expect(selectedRow).toHaveClass("is-selected");
    const editPanel = getPanelByHeading("Edit Connector");
    expect(within(editPanel).getByDisplayValue("Connector 1")).toBeInTheDocument();
  });

  it("navigates from validation issue to modeling context", () => {
    renderAppWithState(createValidationIssueState());
    switchScreenDrawerAware("analysis");

    switchScreenDrawerAware("validation");
    const validationPanel = getPanelByHeading("Validation center");
    const connectorIssue = within(validationPanel).getByText(/Connector 'C1' way C2/i);
    const issueRow = connectorIssue.closest("tr");
    expect(issueRow).not.toBeNull();
    fireEvent.click(within(issueRow as HTMLElement).getByRole("button", { name: "Go to" }));

    const primaryNavRow = document.querySelector(".workspace-nav-row");
    expect(primaryNavRow).not.toBeNull();
    expect(within(primaryNavRow as HTMLElement).getByRole("button", { name: /^Modeling$/, hidden: true })).toHaveClass(
      "is-active"
    );

    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    expect(
      within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Connector$/, hidden: true })
    ).toHaveClass("is-active");

    const updatedNetworkPanel = getPanelByHeading("Network summary");
    expect(within(updatedNetworkPanel).queryByText("Interaction mode")).not.toBeInTheDocument();

    openOperationsHealthPanel();
    const modelHealth = screen.getByRole("region", { name: "Model health" });
    expect(within(modelHealth).getByText("2/2", { selector: "strong" })).toBeInTheDocument();
    expect(within(modelHealth).getByText(/\[WARNING\] Occupancy conflict/i)).toBeInTheDocument();
  });

  it("supports alt keyboard shortcuts for workspace navigation", () => {
    renderAppWithState(createUiIntegrationState());

    fireEvent.keyDown(window, { key: "4", altKey: true });
    const primaryNavRow = document.querySelector(".workspace-nav-row");
    expect(primaryNavRow).not.toBeNull();
    expect(within(primaryNavRow as HTMLElement).getByRole("button", { name: /^Analysis$/, hidden: true })).toHaveClass(
      "is-active"
    );

    fireEvent.keyDown(window, { key: "4", altKey: true, shiftKey: true });
    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    expect(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Segment$/, hidden: true })).toHaveClass(
      "is-active"
    );

    const networkPanel = getPanelByHeading("Network summary");
    const currentZoomLine = () => within(networkPanel).getByText(/View: \d+% zoom\./).textContent ?? "";
    expect(currentZoomLine()).toContain("View: 100% zoom.");
    fireEvent.keyDown(window, { key: "f", altKey: true });
    expect(currentZoomLine()).not.toContain("View: 100% zoom.");
  });

  it("cancels edit mode when selection focus changes to another entity kind", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("node");

    const nodesPanel = getPanelByHeading("Nodes");
    fireEvent.click(within(nodesPanel).getByText("N-C1"));
    expect(getPanelByHeading("Edit Node")).toBeInTheDocument();

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const segmentHitbox = networkSummaryPanel.querySelector(".network-segment-hitbox");
    expect(segmentHitbox).not.toBeNull();
    fireEvent.click(segmentHitbox as Element);

    expect(screen.queryByRole("heading", { name: "Edit Node" })).not.toBeInTheDocument();
    expect(getPanelByHeading("Node form")).toBeInTheDocument();
  });

  it("asks confirmation before regenerating layout when manual positions exist", () => {
    const state = appReducer(
      createUiIntegrationState(),
      appActions.setNodePosition(asNodeId("N-C1"), { x: 64, y: 80 })
    );
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

    renderAppWithState(state);
    switchScreenDrawerAware("analysis");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "Generate" }));

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    confirmSpy.mockRestore();
  });
});
