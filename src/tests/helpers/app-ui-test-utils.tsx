import { fireEvent, render, screen, within } from "@testing-library/react";
import { App } from "../../app/App";
import type { ConnectorId, NodeId, SegmentId, SpliceId, WireId } from "../../core/entities";
import {
  appActions,
  appReducer,
  createAppStore,
  createInitialState,
  type AppState
} from "../../store";

export function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

export function asSpliceId(value: string): SpliceId {
  return value as SpliceId;
}

export function asNodeId(value: string): NodeId {
  return value as NodeId;
}

export function asSegmentId(value: string): SegmentId {
  return value as SegmentId;
}

export function asWireId(value: string): WireId {
  return value as WireId;
}

export function reduceAll(actions: Parameters<typeof appReducer>[1][]): AppState {
  return actions.reduce(appReducer, createInitialState());
}

export function createUiIntegrationState(): AppState {
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

export function createConnectorSortingState(): AppState {
  return reduceAll([
    appActions.upsertConnector({ id: asConnectorId("C2"), name: "Zulu connector", technicalId: "C-200", cavityCount: 2 }),
    appActions.upsertConnector({ id: asConnectorId("C1"), name: "Alpha connector", technicalId: "C-100", cavityCount: 2 })
  ]);
}

export function createValidationIssueState(): AppState {
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

export function createConnectorOccupancyFilterState(): AppState {
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

export function renderAppWithState(state: AppState) {
  const store = createAppStore(state);
  return { store, ...render(<App store={store} />) };
}

export function getPanelByHeading(name: string): HTMLElement {
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

export function switchScreen(target: "networkScope" | "modeling" | "analysis" | "validation" | "settings"): void {
  if (target === "settings") {
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    return;
  }

  const labelByScreen = {
    networkScope: "Network Scope",
    modeling: "Modeling",
    analysis: "Analysis",
    validation: "Validation"
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

export function switchSubScreen(target: "connector" | "splice" | "node" | "segment" | "wire"): void {
  const labelBySubScreen = {
    connector: "Connector",
    splice: "Splice",
    node: "Node",
    segment: "Segment",
    wire: "Wire"
  } as const;
  let secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
  if (secondaryNavRow === null) {
    switchScreen("modeling");
    secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
  }
  if (secondaryNavRow === null) {
    throw new Error("Secondary workspace navigation row was not found.");
  }

  fireEvent.click(
    within(secondaryNavRow as HTMLElement).getByRole("button", {
      name: new RegExp(`^${labelBySubScreen[target]}$`)
    })
  );
}
