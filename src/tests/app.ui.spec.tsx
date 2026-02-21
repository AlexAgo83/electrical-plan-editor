import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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

function switchScreen(target: "modeling" | "analysis"): void {
  const primaryNavRow = document.querySelector(".workspace-nav-row");
  if (primaryNavRow === null) {
    throw new Error("Primary workspace navigation row was not found.");
  }

  fireEvent.click(
    within(primaryNavRow as HTMLElement).getByRole("button", {
      name: target === "modeling" ? /^Modeling$/ : /^Analysis$/
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
});
