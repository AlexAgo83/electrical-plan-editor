import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  asNodeId,
  createUiIntegrationState,
  createValidationIssueState,
  getPanelByHeading,
  renderAppWithState,
  switchScreen,
  switchSubScreen
} from "./helpers/app-ui-test-utils";
import { appActions, appReducer, createInitialState } from "../store";

describe("App integration UI - navigation and canvas", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("supports undo and redo for modeling actions", () => {
    renderAppWithState(createInitialState());

    const connectorFormPanel = getPanelByHeading("Create Connector");
    fireEvent.change(within(connectorFormPanel).getByLabelText("Functional name"), {
      target: { value: "Undo test connector" }
    });
    fireEvent.change(within(connectorFormPanel).getByLabelText("Technical ID"), {
      target: { value: "C-UNDO-1" }
    });
    fireEvent.change(within(connectorFormPanel).getByLabelText("Cavity count"), {
      target: { value: "2" }
    });
    fireEvent.click(within(connectorFormPanel).getByRole("button", { name: "Create" }));

    const connectorsPanel = getPanelByHeading("Connectors");
    expect(within(connectorsPanel).getByText("Undo test connector")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(within(connectorsPanel).queryByText("Undo test connector")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    expect(within(connectorsPanel).getByText("Undo test connector")).toBeInTheDocument();
  });

  it("reflects connector cavity occupancy in real time", () => {
    renderAppWithState(createUiIntegrationState());

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "Select" }));
    switchScreen("analysis");

    const connectorCavitiesPanel = getPanelByHeading("Connector cavities");
    expect(within(connectorCavitiesPanel).getByText("wire:W1:A")).toBeInTheDocument();
  });

  it("reflects splice port occupancy in real time", () => {
    renderAppWithState(createUiIntegrationState());

    switchSubScreen("splice");
    const splicesPanel = getPanelByHeading("Splices");
    fireEvent.click(within(splicesPanel).getByRole("button", { name: "Select" }));
    switchScreen("analysis");

    const splicePortsPanel = getPanelByHeading("Splice ports");
    expect(within(splicePortsPanel).getByText("wire:W1:B")).toBeInTheDocument();
  });

  it("highlights every segment in the selected wire route", () => {
    renderAppWithState(createUiIntegrationState());

    switchSubScreen("segment");
    const segmentsPanel = getPanelByHeading("Segments");
    expect(within(segmentsPanel).getByText("SEG-A").closest("tr")).not.toHaveClass("is-wire-highlighted");
    expect(within(segmentsPanel).getByText("SEG-B").closest("tr")).not.toHaveClass("is-wire-highlighted");

    switchSubScreen("wire");
    const wiresPanel = getPanelByHeading("Wires");
    fireEvent.click(within(wiresPanel).getByRole("button", { name: "Select" }));

    switchSubScreen("segment");
    expect(within(segmentsPanel).getByText("SEG-A").closest("tr")).toHaveClass("is-wire-highlighted");
    expect(within(segmentsPanel).getByText("SEG-B").closest("tr")).toHaveClass("is-wire-highlighted");
  });

  it("renders the 2D network diagram in analysis", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreen("analysis");
    switchSubScreen("segment");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    expect(within(networkSummaryPanel).getByLabelText("2D network diagram")).toBeInTheDocument();
    expect(networkSummaryPanel.querySelectorAll(".network-node").length).toBe(3);
    expect(networkSummaryPanel.querySelectorAll(".network-segment").length).toBe(2);
  });

  it("does not change 2D zoom on mouse wheel", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreen("analysis");
    switchSubScreen("segment");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const currentZoomLine = () => within(networkSummaryPanel).getByText(/View: \d+% zoom\./).textContent ?? "";
    const zoomBeforeWheel = currentZoomLine();
    const networkSvg = within(networkSummaryPanel).getByLabelText("2D network diagram");

    fireEvent.wheel(networkSvg, { deltaY: -200 });
    expect(currentZoomLine()).toBe(zoomBeforeWheel);
  });

  it("synchronizes inspector context and allows editing selected connector", () => {
    renderAppWithState(createUiIntegrationState());

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "Select" }));
    const inspectorPanel = getPanelByHeading("Inspector context");
    expect(within(inspectorPanel).getByText(/Focused entity:/)).toBeInTheDocument();
    expect(within(inspectorPanel).getByText("C1")).toBeInTheDocument();
    fireEvent.click(within(inspectorPanel).getByRole("button", { name: "Edit selected" }));

    const editPanel = getPanelByHeading("Edit Connector");
    expect(within(editPanel).getByDisplayValue("Connector 1")).toBeInTheDocument();
    expect(within(editPanel).getByDisplayValue("C-1")).toBeInTheDocument();
  });

  it("navigates from validation issue to modeling context and returns canvas to select mode", () => {
    renderAppWithState(createValidationIssueState());

    const networkPanel = getPanelByHeading("Network summary");
    fireEvent.click(within(networkPanel).getByRole("button", { name: /^Route$/ }));
    expect(within(networkPanel).getByRole("button", { name: /^Route$/ })).toHaveClass("is-active");

    switchScreen("validation");
    const validationPanel = getPanelByHeading("Validation center");
    const connectorIssue = within(validationPanel).getByText(/Connector 'C1' cavity C2/i);
    const issueRow = connectorIssue.closest("tr");
    expect(issueRow).not.toBeNull();
    fireEvent.click(within(issueRow as HTMLElement).getByRole("button", { name: "Go to" }));

    const primaryNavRow = document.querySelector(".workspace-nav-row");
    expect(primaryNavRow).not.toBeNull();
    expect(within(primaryNavRow as HTMLElement).getByRole("button", { name: /^Modeling$/ })).toHaveClass("is-active");

    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    expect(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Connector$/ })).toHaveClass("is-active");

    const updatedNetworkPanel = getPanelByHeading("Network summary");
    expect(within(updatedNetworkPanel).getByRole("button", { name: /^Select$/ })).toHaveClass("is-active");

    const modelHealth = screen.getByRole("region", { name: "Model health" });
    expect(within(modelHealth).getByText("2/2", { selector: "strong" })).toBeInTheDocument();
    expect(within(modelHealth).getByText(/\[WARNING\] Occupancy conflict/i)).toBeInTheDocument();
  });

  it("supports alt keyboard shortcuts for workspace navigation and interaction modes", () => {
    renderAppWithState(createUiIntegrationState());

    fireEvent.keyDown(window, { key: "2", altKey: true });
    const primaryNavRow = document.querySelector(".workspace-nav-row");
    expect(primaryNavRow).not.toBeNull();
    expect(within(primaryNavRow as HTMLElement).getByRole("button", { name: /^Analysis$/ })).toHaveClass("is-active");

    fireEvent.keyDown(window, { key: "4", altKey: true, shiftKey: true });
    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    expect(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Segment$/ })).toHaveClass("is-active");

    const networkPanel = getPanelByHeading("Network summary");
    const currentZoomLine = () => within(networkPanel).getByText(/View: \d+% zoom\./).textContent ?? "";
    expect(currentZoomLine()).toContain("View: 100% zoom.");
    fireEvent.keyDown(window, { key: "f", altKey: true });
    expect(currentZoomLine()).not.toContain("View: 100% zoom.");

    fireEvent.keyDown(window, { key: "r", altKey: true });
    expect(within(networkPanel).getByRole("button", { name: /^Route$/ })).toHaveClass("is-active");
    fireEvent.keyDown(window, { key: "v", altKey: true });
    expect(within(networkPanel).getByRole("button", { name: /^Select$/ })).toHaveClass("is-active");
  });

  it("asks confirmation before regenerating layout when manual positions exist", () => {
    const state = appReducer(
      createUiIntegrationState(),
      appActions.setNodePosition(asNodeId("N-C1"), { x: 64, y: 80 })
    );
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

    renderAppWithState(state);
    switchScreen("analysis");
    switchSubScreen("segment");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    fireEvent.click(within(networkSummaryPanel).getByRole("button", { name: "(Re)generate layout" }));

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    confirmSpy.mockRestore();
  });
});
