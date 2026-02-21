import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "../app/App";
import type { ConnectorId, NodeId, SegmentId, SpliceId, WireId } from "../core/entities";
import { appActions, appReducer, createAppStore, createInitialState, type AppState } from "../store";

function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

function asSpliceId(value: string): SpliceId {
  return value as SpliceId;
}

function asNodeId(value: string): NodeId {
  return value as NodeId;
}

function asSegmentId(value: string): SegmentId {
  return value as SegmentId;
}

function asWireId(value: string): WireId {
  return value as WireId;
}

function reduceAll(actions: Parameters<typeof appReducer>[1][]): AppState {
  return actions.reduce(appReducer, createInitialState());
}

function createUiIntegrationState(): AppState {
  return reduceAll([
    appActions.upsertConnector({ id: asConnectorId("C1"), name: "Connector 1", technicalId: "C-1", cavityCount: 2 }),
    appActions.upsertSplice({ id: asSpliceId("S1"), name: "Splice 1", technicalId: "S-1", portCount: 2 }),
    appActions.upsertNode({ id: asNodeId("N-C1"), kind: "connector", connectorId: asConnectorId("C1") }),
    appActions.upsertNode({ id: asNodeId("N-MID"), kind: "intermediate", label: "MID" }),
    appActions.upsertNode({ id: asNodeId("N-S1"), kind: "splice", spliceId: asSpliceId("S1") }),
    appActions.upsertSegment({
      id: asSegmentId("SEG-A"),
      nodeA: asNodeId("N-C1"),
      nodeB: asNodeId("N-MID"),
      lengthMm: 40
    }),
    appActions.upsertSegment({
      id: asSegmentId("SEG-B"),
      nodeA: asNodeId("N-MID"),
      nodeB: asNodeId("N-S1"),
      lengthMm: 60
    }),
    appActions.saveWire({
      id: asWireId("W1"),
      name: "Wire 1",
      technicalId: "W-1",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 }
    })
  ]);
}

function createConnectorSortingState(): AppState {
  return reduceAll([
    appActions.upsertConnector({ id: asConnectorId("C2"), name: "Zulu connector", technicalId: "C-200", cavityCount: 2 }),
    appActions.upsertConnector({ id: asConnectorId("C1"), name: "Alpha connector", technicalId: "C-100", cavityCount: 2 })
  ]);
}

function createValidationIssueState(): AppState {
  const base = createUiIntegrationState();
  const connectorId = asConnectorId("C1");
  const wire = base.wires.byId[asWireId("W1")];
  if (wire === undefined) {
    throw new Error("Expected wire W1 in base integration state.");
  }

  return {
    ...base,
    wires: {
      ...base.wires,
      byId: {
        ...base.wires.byId,
        [wire.id]: {
          ...wire,
          isRouteLocked: true,
          routeSegmentIds: []
        }
      }
    },
    connectorCavityOccupancy: {
      ...base.connectorCavityOccupancy,
      [connectorId]: {
        ...(base.connectorCavityOccupancy[connectorId] ?? {}),
        2: "manual-ghost"
      }
    }
  };
}

function createConnectorOccupancyFilterState(): AppState {
  return reduceAll([
    appActions.upsertConnector({ id: asConnectorId("C1"), name: "Connector used", technicalId: "C-100", cavityCount: 2 }),
    appActions.upsertConnector({ id: asConnectorId("C2"), name: "Connector free", technicalId: "C-200", cavityCount: 2 }),
    appActions.upsertSplice({ id: asSpliceId("S1"), name: "Splice 1", technicalId: "S-1", portCount: 2 }),
    appActions.upsertNode({ id: asNodeId("N-C1"), kind: "connector", connectorId: asConnectorId("C1") }),
    appActions.upsertNode({ id: asNodeId("N-S1"), kind: "splice", spliceId: asSpliceId("S1") }),
    appActions.upsertSegment({
      id: asSegmentId("SEG-1"),
      nodeA: asNodeId("N-C1"),
      nodeB: asNodeId("N-S1"),
      lengthMm: 30
    }),
    appActions.saveWire({
      id: asWireId("W1"),
      name: "Wire 1",
      technicalId: "W-1",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 }
    })
  ]);
}

function getPanelByHeading(name: string): HTMLElement {
  const heading = screen
    .getAllByRole("heading", { name })
    .find((candidate) => candidate.closest(".panel") !== null);

  if (heading === undefined) {
    throw new Error(`Unable to find panel heading '${name}'.`);
  }

  const panel = heading.closest(".panel");
  if (panel === null) {
    throw new Error(`Unable to resolve panel for heading '${name}'.`);
  }

  return panel as HTMLElement;
}

function switchScreen(target: "modeling" | "analysis" | "validation" | "settings"): void {
  const labelByScreen = {
    modeling: "Modeling",
    analysis: "Analysis",
    validation: "Validation",
    settings: "Settings"
  } as const;
  const primaryNavRow = document.querySelector(".workspace-nav-row");
  if (primaryNavRow === null) {
    throw new Error("Primary workspace navigation row was not found.");
  }

  fireEvent.click(
    within(primaryNavRow as HTMLElement).getByRole("button", {
      name: new RegExp(`^${labelByScreen[target]}$`)
    })
  );
}

function switchSubScreen(target: "connector" | "splice" | "node" | "segment" | "wire"): void {
  const labelBySubScreen = {
    connector: "Connector",
    splice: "Splice",
    node: "Node",
    segment: "Segment",
    wire: "Wire"
  } as const;
  const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
  if (secondaryNavRow === null) {
    throw new Error("Secondary workspace navigation row was not found.");
  }

  fireEvent.click(
    within(secondaryNavRow as HTMLElement).getByRole("button", {
      name: new RegExp(`^${labelBySubScreen[target]}$`)
    })
  );
}

describe("App integration UI", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("supports undo and redo for modeling actions", () => {
    const store = createAppStore(createInitialState());
    render(<App store={store} />);

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
    const store = createAppStore(createUiIntegrationState());
    render(<App store={store} />);

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "Select" }));
    switchScreen("analysis");

    const connectorCavitiesPanel = getPanelByHeading("Connector cavities");
    expect(within(connectorCavitiesPanel).getByText("wire:W1:A")).toBeInTheDocument();
  });

  it("reflects splice port occupancy in real time", () => {
    const store = createAppStore(createUiIntegrationState());
    render(<App store={store} />);

    switchSubScreen("splice");
    const splicesPanel = getPanelByHeading("Splices");
    fireEvent.click(within(splicesPanel).getByRole("button", { name: "Select" }));
    switchScreen("analysis");

    const splicePortsPanel = getPanelByHeading("Splice ports");
    expect(within(splicePortsPanel).getByText("wire:W1:B")).toBeInTheDocument();
  });

  it("highlights every segment in the selected wire route", () => {
    const store = createAppStore(createUiIntegrationState());
    render(<App store={store} />);

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
    const store = createAppStore(createUiIntegrationState());
    render(<App store={store} />);

    switchScreen("analysis");
    switchSubScreen("segment");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    expect(within(networkSummaryPanel).getByLabelText("2D network diagram")).toBeInTheDocument();
    expect(networkSummaryPanel.querySelectorAll(".network-node").length).toBe(3);
    expect(networkSummaryPanel.querySelectorAll(".network-segment").length).toBe(2);
  });

  it("sorts connector list by clicking the Name header", () => {
    const store = createAppStore(createConnectorSortingState());
    render(<App store={store} />);

    const connectorsPanel = getPanelByHeading("Connectors");
    const nameSortButton = within(connectorsPanel).getByRole("button", { name: /Name/i });
    const getFirstConnectorName = () =>
      connectorsPanel.querySelector("tbody tr td")?.textContent?.trim() ?? "";

    expect(getFirstConnectorName()).toBe("Alpha connector");
    fireEvent.click(nameSortButton);
    expect(getFirstConnectorName()).toBe("Zulu connector");
  });

  it("sorts node list by clicking the ID header", () => {
    const store = createAppStore(createUiIntegrationState());
    render(<App store={store} />);

    switchSubScreen("node");
    const nodesPanel = getPanelByHeading("Nodes");
    const idSortButton = within(nodesPanel).getByRole("button", { name: /ID/i });
    const getFirstNodeId = () => nodesPanel.querySelector("tbody tr td")?.textContent?.trim() ?? "";

    expect(getFirstNodeId()).toBe("N-C1");
    fireEvent.click(idSortButton);
    expect(getFirstNodeId()).toBe("N-S1");
  });

  it("sorts segment list by clicking the ID header", () => {
    const store = createAppStore(createUiIntegrationState());
    render(<App store={store} />);

    switchSubScreen("segment");
    const segmentsPanel = getPanelByHeading("Segments");
    const idSortButton = within(segmentsPanel).getByRole("button", { name: /ID/i });
    const getFirstSegmentId = () => segmentsPanel.querySelector("tbody tr td")?.textContent?.trim() ?? "";

    expect(getFirstSegmentId()).toBe("SEG-A");
    fireEvent.click(idSortButton);
    expect(getFirstSegmentId()).toBe("SEG-B");
  });

  it("synchronizes inspector context and allows editing selected connector", () => {
    const store = createAppStore(createUiIntegrationState());
    render(<App store={store} />);

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

  it("groups validation issues and supports category filtering", () => {
    const store = createAppStore(createValidationIssueState());
    render(<App store={store} />);

    switchScreen("validation");

    const validationPanel = getPanelByHeading("Validation center");
    expect(within(validationPanel).getByRole("heading", { name: "Occupancy conflict" })).toBeInTheDocument();
    expect(within(validationPanel).getByRole("heading", { name: "Route lock validity" })).toBeInTheDocument();

    fireEvent.click(within(validationPanel).getByRole("button", { name: "Occupancy conflict" }));
    expect(within(validationPanel).getByRole("heading", { name: "Occupancy conflict" })).toBeInTheDocument();
    expect(within(validationPanel).queryByRole("heading", { name: "Route lock validity" })).not.toBeInTheDocument();

    fireEvent.click(within(validationPanel).getByRole("button", { name: "Warnings" }));
    expect(within(validationPanel).getByRole("heading", { name: "Occupancy conflict" })).toBeInTheDocument();
    expect(within(validationPanel).queryByText("ERROR")).not.toBeInTheDocument();
  });

  it("filters validation issues by text search", () => {
    const store = createAppStore(createValidationIssueState());
    render(<App store={store} />);

    switchScreen("validation");
    const validationPanel = getPanelByHeading("Validation center");
    const searchInput = within(validationPanel).getByLabelText("Search validation issues");

    fireEvent.change(searchInput, { target: { value: "manual-ghost" } });
    expect(within(validationPanel).getByRole("heading", { name: "Occupancy conflict" })).toBeInTheDocument();
    expect(within(validationPanel).queryByRole("heading", { name: "Route lock validity" })).not.toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "route-locked" } });
    expect(within(validationPanel).getByRole("heading", { name: "Route lock validity" })).toBeInTheDocument();
    expect(within(validationPanel).queryByRole("heading", { name: "Occupancy conflict" })).not.toBeInTheDocument();
  });

  it("clears validation filters and search from toolbar", () => {
    const store = createAppStore(createValidationIssueState());
    render(<App store={store} />);

    switchScreen("validation");
    const validationPanel = getPanelByHeading("Validation center");
    const searchInput = within(validationPanel).getByLabelText("Search validation issues");
    fireEvent.click(within(validationPanel).getByRole("button", { name: "Warnings" }));
    fireEvent.change(searchInput, { target: { value: "manual-ghost" } });

    const validationSummary = getPanelByHeading("Validation summary");
    expect(within(validationSummary).getByText(/Active filters:\s*Warnings \/ All categories \/ Search:\s*"manual-ghost"/i)).toBeInTheDocument();

    fireEvent.click(within(validationPanel).getByRole("button", { name: "Clear filters" }));

    expect(searchInput).toHaveValue("");
    expect(within(validationSummary).getByText(/Active filters:\s*All severities \/ All categories \/ Search:\s*none/i)).toBeInTheDocument();
    expect(within(validationPanel).getByRole("heading", { name: "Occupancy conflict" })).toBeInTheDocument();
    expect(within(validationPanel).getByRole("heading", { name: "Route lock validity" })).toBeInTheDocument();
  });

  it("shows model health quick actions and opens validation with severity focus", () => {
    const store = createAppStore(createValidationIssueState());
    render(<App store={store} />);

    const primaryNavRow = document.querySelector(".workspace-nav-row");
    expect(primaryNavRow).not.toBeNull();
    const validationButton = within(primaryNavRow as HTMLElement).getByRole("button", { name: /^Validation$/ });
    const validationBadgeText = validationButton.querySelector(".workspace-tab-badge")?.textContent?.trim() ?? "0";
    expect(Number(validationBadgeText)).toBeGreaterThan(0);

    const modelHealth = screen.getByRole("region", { name: "Model health" });
    expect(within(modelHealth).getByText(/Total issues:/i)).toBeInTheDocument();
    expect(within(modelHealth).getByRole("button", { name: "Review errors" })).toBeEnabled();
    expect(within(modelHealth).getByRole("button", { name: "Review warnings" })).toBeEnabled();

    fireEvent.click(within(modelHealth).getByRole("button", { name: "Review errors" }));
    const validationSummary = getPanelByHeading("Validation summary");
    expect(within(validationSummary).getByText(/Active filters:\s*Errors \/ All categories/i)).toBeInTheDocument();

    const validationPanel = getPanelByHeading("Validation center");
    expect(within(validationPanel).queryByText("WARNING")).not.toBeInTheDocument();
  });

  it("navigates validation issues from model health quick navigator", () => {
    const store = createAppStore(createValidationIssueState());
    render(<App store={store} />);

    const modelHealth = screen.getByRole("region", { name: "Model health" });
    expect(within(modelHealth).getByText(/Issue navigator:/i, { selector: "p" })).toBeInTheDocument();
    expect(within(modelHealth).getByText("1/2", { selector: "strong" })).toBeInTheDocument();

    fireEvent.click(within(modelHealth).getByRole("button", { name: "Next issue" }));

    const primaryNavRow = document.querySelector(".workspace-nav-row");
    expect(primaryNavRow).not.toBeNull();
    expect(within(primaryNavRow as HTMLElement).getByRole("button", { name: /^Modeling$/ })).toHaveClass("is-active");

    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    expect(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Wire$/ })).toHaveClass("is-active");

    const inspectorPanel = getPanelByHeading("Inspector context");
    expect(within(inspectorPanel).getByText("W1")).toBeInTheDocument();
    expect(within(modelHealth).getByText(/Issue navigator:/i, { selector: "p" })).toBeInTheDocument();
    expect(within(modelHealth).getByText("1/2", { selector: "strong" })).toBeInTheDocument();
  });

  it("applies settings defaults for list sort behavior", () => {
    const store = createAppStore(createConnectorSortingState());
    render(<App store={store} />);

    switchScreen("settings");
    const settingsPanel = getPanelByHeading("Table and list preferences");
    fireEvent.change(within(settingsPanel).getByLabelText("Default sort column"), {
      target: { value: "technicalId" }
    });
    fireEvent.change(within(settingsPanel).getByLabelText("Default sort direction"), {
      target: { value: "desc" }
    });
    fireEvent.click(within(settingsPanel).getByRole("button", { name: "Apply sort defaults now" }));

    switchScreen("modeling");
    const connectorsPanel = getPanelByHeading("Connectors");
    const firstConnectorName = connectorsPanel.querySelector("tbody tr td")?.textContent?.trim() ?? "";
    expect(firstConnectorName).toBe("Zulu connector");
  });

  it("switches to compact table density from settings", () => {
    const store = createAppStore(createUiIntegrationState());
    render(<App store={store} />);

    switchScreen("settings");
    const settingsPanel = getPanelByHeading("Table and list preferences");
    fireEvent.change(within(settingsPanel).getByLabelText("Table density"), {
      target: { value: "compact" }
    });

    const appShell = document.querySelector("main.app-shell");
    expect(appShell).not.toBeNull();
    expect(appShell).toHaveClass("table-density-compact");
  });

  it("persists settings preferences across remount", () => {
    const firstStore = createAppStore(createUiIntegrationState());
    const firstRender = render(<App store={firstStore} />);

    switchScreen("settings");
    const settingsPanel = getPanelByHeading("Table and list preferences");
    fireEvent.change(within(settingsPanel).getByLabelText("Table density"), {
      target: { value: "compact" }
    });
    fireEvent.change(within(settingsPanel).getByLabelText("Default sort column"), {
      target: { value: "technicalId" }
    });
    firstRender.unmount();

    const secondStore = createAppStore(createUiIntegrationState());
    render(<App store={secondStore} />);

    const appShell = document.querySelector("main.app-shell");
    expect(appShell).not.toBeNull();
    expect(appShell).toHaveClass("table-density-compact");

    switchScreen("settings");
    const restoredSettingsPanel = getPanelByHeading("Table and list preferences");
    expect(within(restoredSettingsPanel).getByLabelText("Default sort column")).toHaveValue("technicalId");
  });

  it("filters connectors by occupancy chips", () => {
    const store = createAppStore(createConnectorOccupancyFilterState());
    render(<App store={store} />);

    const connectorsPanel = getPanelByHeading("Connectors");
    expect(within(connectorsPanel).getByText("Connector used")).toBeInTheDocument();
    expect(within(connectorsPanel).getByText("Connector free")).toBeInTheDocument();

    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "Free" }));
    expect(within(connectorsPanel).queryByText("Connector used")).not.toBeInTheDocument();
    expect(within(connectorsPanel).getByText("Connector free")).toBeInTheDocument();

    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "Occupied" }));
    expect(within(connectorsPanel).getByText("Connector used")).toBeInTheDocument();
    expect(within(connectorsPanel).queryByText("Connector free")).not.toBeInTheDocument();
  });

  it("navigates from validation issue to modeling context and returns canvas to select mode", () => {
    const store = createAppStore(createValidationIssueState());
    render(<App store={store} />);

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
    const store = createAppStore(createUiIntegrationState());
    render(<App store={store} />);

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

  it("supports alt keyboard shortcuts for sequential validation issue navigation", () => {
    const store = createAppStore(createValidationIssueState());
    render(<App store={store} />);

    fireEvent.keyDown(window, { key: "k", altKey: true });
    const primaryNavRow = document.querySelector(".workspace-nav-row");
    expect(primaryNavRow).not.toBeNull();
    expect(within(primaryNavRow as HTMLElement).getByRole("button", { name: /^Modeling$/ })).toHaveClass("is-active");

    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    expect(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Wire$/ })).toHaveClass("is-active");

    const inspectorPanel = getPanelByHeading("Inspector context");
    expect(within(inspectorPanel).getByText("W1")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "j", altKey: true });
    expect(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Connector$/ })).toHaveClass("is-active");
    expect(within(inspectorPanel).getByText("C1")).toBeInTheDocument();
  });

  it("ignores keyboard shortcuts when disabled from settings", () => {
    const store = createAppStore(createUiIntegrationState());
    render(<App store={store} />);

    switchScreen("settings");
    const settingsPanel = getPanelByHeading("Action bar and shortcuts");
    fireEvent.click(within(settingsPanel).getByLabelText("Enable keyboard shortcuts (undo/redo/navigation/modes)"));

    fireEvent.keyDown(window, { key: "2", altKey: true });
    const primaryNavRow = document.querySelector(".workspace-nav-row");
    expect(primaryNavRow).not.toBeNull();
    expect(within(primaryNavRow as HTMLElement).getByRole("button", { name: /^Settings$/ })).toHaveClass("is-active");
  });
});
