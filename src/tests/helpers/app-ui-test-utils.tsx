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

export function createUiIntegrationDenseWiresState(): AppState {
  return reduceAll([
    appActions.upsertConnector({ id: asConnectorId("C1"), name: "Connector 1", technicalId: "C-1", cavityCount: 6 }),
    appActions.upsertConnector({ id: asConnectorId("C2"), name: "Connector 2", technicalId: "C-2", cavityCount: 4 }),
    appActions.upsertSplice({ id: asSpliceId("S1"), name: "Splice 1", technicalId: "S-1", portCount: 6 }),
    appActions.upsertSplice({ id: asSpliceId("S2"), name: "Splice 2", technicalId: "S-2", portCount: 4 }),
    appActions.upsertNode({ id: asNodeId("N-C1"), kind: "connector", connectorId: asConnectorId("C1") }),
    appActions.upsertNode({ id: asNodeId("N-C2"), kind: "connector", connectorId: asConnectorId("C2") }),
    appActions.upsertNode({ id: asNodeId("N-MID"), kind: "intermediate", label: "MID" }),
    appActions.upsertNode({ id: asNodeId("N-S1"), kind: "splice", spliceId: asSpliceId("S1") }),
    appActions.upsertNode({ id: asNodeId("N-S2"), kind: "splice", spliceId: asSpliceId("S2") }),
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
    appActions.upsertSegment({
      id: asSegmentId("SEG-C"),
      nodeA: asNodeId("N-MID"),
      nodeB: asNodeId("N-C2"),
      lengthMm: 35
    }),
    appActions.upsertSegment({
      id: asSegmentId("SEG-D"),
      nodeA: asNodeId("N-MID"),
      nodeB: asNodeId("N-S2"),
      lengthMm: 45
    }),
    appActions.saveWire({
      id: asWireId("W1"),
      name: "Wire 1",
      technicalId: "W-1",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 }
    }),
    appActions.saveWire({
      id: asWireId("W2"),
      name: "Wire 2",
      technicalId: "W-2",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 2 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 2 }
    }),
    appActions.saveWire({
      id: asWireId("W3"),
      name: "Wire 3",
      technicalId: "W-3",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 3 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S2"), portIndex: 1 }
    }),
    appActions.saveWire({
      id: asWireId("W4"),
      name: "Wire 4",
      technicalId: "W-4",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 4 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S2"), portIndex: 2 }
    }),
    appActions.saveWire({
      id: asWireId("W5"),
      name: "Wire 5",
      technicalId: "W-5",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C2"), cavityIndex: 1 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 3 }
    }),
    appActions.saveWire({
      id: asWireId("W6"),
      name: "Wire 6",
      technicalId: "W-6",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C2"), cavityIndex: 2 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 4 }
    }),
    appActions.saveWire({
      id: asWireId("W7"),
      name: "Wire 7",
      technicalId: "W-7",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C2"), cavityIndex: 3 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S2"), portIndex: 3 }
    }),
    appActions.saveWire({
      id: asWireId("W8"),
      name: "Wire 8",
      technicalId: "W-8",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C2"), cavityIndex: 4 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S2"), portIndex: 4 }
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

export function withViewportWidth<T>(width: number, run: () => Promise<T>): Promise<T>;
export function withViewportWidth<T>(width: number, run: () => T): T;
export function withViewportWidth<T>(width: number, run: () => T | Promise<T>): T | Promise<T> {
  const originalInnerWidth = window.innerWidth;
  Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: width });
  fireEvent(window, new Event("resize"));

  const restoreViewport = () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: originalInnerWidth });
    fireEvent(window, new Event("resize"));
  };

  try {
    const result = run();
    if (result instanceof Promise) {
      return result.finally(restoreViewport);
    }
    restoreViewport();
    return result;
  } catch (error) {
    restoreViewport();
    throw error;
  }
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

type ScreenSwitchTarget = "home" | "networkScope" | "modeling" | "analysis" | "validation" | "settings";
type SubScreenSwitchTarget = "connector" | "splice" | "node" | "segment" | "wire";

function switchScreenWithMode(target: ScreenSwitchTarget, mode: "strict" | "drawerAware"): void {
  if (target === "settings") {
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    return;
  }

  if (target === "analysis") {
    switchScreenWithMode("modeling", mode);
    const quickSwitchButton =
      screen.queryByRole("button", { name: "Switch to analysis view" }) ??
      screen.queryByRole("button", { name: "Switch to analysis" });
    if (quickSwitchButton === null) {
      throw new Error("Analysis view switch button was not found from Modeling workspace.");
    }
    fireEvent.click(quickSwitchButton);
    return;
  }

  const labelByScreen = {
    home: "Home",
    networkScope: "Network Scope",
    modeling: "Modeling",
    validation: "Validation"
  } as const;
  const primaryNavRow = document.querySelector(".workspace-nav-row");
  if (primaryNavRow === null) {
    throw new Error("Primary workspace navigation row was not found.");
  }
  const targetLabel = new RegExp(`^${labelByScreen[target]}$`);
  if (mode === "strict") {
    fireEvent.click(within(primaryNavRow as HTMLElement).getByRole("button", { name: targetLabel }));
    return;
  }

  let openedNavigationDrawer = false;
  let button = within(primaryNavRow as HTMLElement).queryByRole("button", { name: targetLabel });

  if (button === null) {
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    openedNavigationDrawer = true;
    const refreshedPrimaryNavRow = document.querySelector(".workspace-nav-row");
    if (refreshedPrimaryNavRow === null) {
      throw new Error("Primary workspace navigation row was not found after opening navigation menu.");
    }

    button = within(refreshedPrimaryNavRow as HTMLElement).getByRole("button", { name: targetLabel });
  }

  fireEvent.click(button);

  if (openedNavigationDrawer) {
    const closeMenuButton = screen.queryByRole("button", { name: "Close menu" });
    if (closeMenuButton !== null) {
      fireEvent.click(closeMenuButton);
    }
  }
}

function switchSubScreenWithMode(target: SubScreenSwitchTarget, mode: "strict" | "drawerAware"): void {
  const labelBySubScreen = {
    connector: "Connector",
    splice: "Splice",
    node: "Node",
    segment: "Segment",
    wire: "Wire"
  } as const;
  let secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
  if (secondaryNavRow === null) {
    if (mode === "strict") {
      throw new Error("Secondary workspace navigation row was not found.");
    }
    switchScreenDrawerAware("modeling");
    secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
  }
  if (secondaryNavRow === null) {
    throw new Error("Secondary workspace navigation row was not found.");
  }
  const targetLabel = new RegExp(`^${labelBySubScreen[target]}$`);
  if (mode === "strict") {
    fireEvent.click(within(secondaryNavRow as HTMLElement).getByRole("button", { name: targetLabel }));
    return;
  }

  let openedNavigationDrawer = false;
  let button = within(secondaryNavRow as HTMLElement).queryByRole("button", { name: targetLabel });

  if (button === null) {
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    openedNavigationDrawer = true;
    const refreshedSecondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    if (refreshedSecondaryNavRow === null) {
      throw new Error("Secondary workspace navigation row was not found after opening navigation menu.");
    }

    button = within(refreshedSecondaryNavRow as HTMLElement).getByRole("button", { name: targetLabel });
  }

  fireEvent.click(button);

  if (openedNavigationDrawer) {
    const closeMenuButton = screen.queryByRole("button", { name: "Close menu" });
    if (closeMenuButton !== null) {
      fireEvent.click(closeMenuButton);
    }
  }
}

export function switchScreenStrict(target: ScreenSwitchTarget): void {
  switchScreenWithMode(target, "strict");
}

export function switchScreenDrawerAware(target: ScreenSwitchTarget): void {
  switchScreenWithMode(target, "drawerAware");
}

export function switchSubScreenStrict(target: SubScreenSwitchTarget): void {
  switchSubScreenWithMode(target, "strict");
}

export function switchSubScreenDrawerAware(target: SubScreenSwitchTarget): void {
  switchSubScreenWithMode(target, "drawerAware");
}

// Backward-compatible aliases retained for existing tests.
// Prefer explicit `Strict` / `DrawerAware` variants in new or touched tests to preserve regression signal.
export const switchScreen = switchScreenDrawerAware;
export const switchSubScreen = switchSubScreenDrawerAware;
