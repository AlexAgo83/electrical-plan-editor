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

describe("App integration UI", () => {
  it("reflects connector cavity occupancy in real time", () => {
    const store = createAppStore(createUiIntegrationState());
    render(<App store={store} />);

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "Select" }));

    const connectorCavitiesPanel = getPanelByHeading("Connector cavities");
    expect(within(connectorCavitiesPanel).getByText("wire:W1:A")).toBeInTheDocument();
  });

  it("reflects splice port occupancy in real time", () => {
    const store = createAppStore(createUiIntegrationState());
    render(<App store={store} />);

    const splicesPanel = getPanelByHeading("Splices");
    fireEvent.click(within(splicesPanel).getByRole("button", { name: "Select" }));

    const splicePortsPanel = getPanelByHeading("Splice ports");
    expect(within(splicePortsPanel).getByText("wire:W1:B")).toBeInTheDocument();
  });

  it("highlights every segment in the selected wire route", () => {
    const store = createAppStore(createUiIntegrationState());
    render(<App store={store} />);

    const segmentsPanel = getPanelByHeading("Segments");
    expect(within(segmentsPanel).getByText("SEG-A").closest("tr")).not.toHaveClass("is-wire-highlighted");
    expect(within(segmentsPanel).getByText("SEG-B").closest("tr")).not.toHaveClass("is-wire-highlighted");

    const wiresPanel = getPanelByHeading("Wires");
    fireEvent.click(within(wiresPanel).getByRole("button", { name: "Select" }));

    expect(within(segmentsPanel).getByText("SEG-A").closest("tr")).toHaveClass("is-wire-highlighted");
    expect(within(segmentsPanel).getByText("SEG-B").closest("tr")).toHaveClass("is-wire-highlighted");
  });
});
