import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { NetworkId } from "../core/entities";
import { appActions, appReducer } from "../store";
import {
  asCatalogItemId,
  asConnectorId,
  asNodeId,
  asSegmentId,
  asSpliceId,
  asWireId,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";

function createDeleteConfirmationState() {
  const base = createUiIntegrationState();
  const activeNetworkId = base.activeNetworkId;
  let nextState = base;
  nextState = appReducer(
    nextState,
    appActions.createNetwork({
      id: "net-del" as NetworkId,
      name: "Network deletable",
      technicalId: "NET-DEL",
      createdAt: "2026-02-27T11:00:00.000Z",
      updatedAt: "2026-02-27T11:00:00.000Z"
    })
  );
  if (activeNetworkId !== null) {
    nextState = appReducer(nextState, appActions.selectNetwork(activeNetworkId));
  }

  return [
    appActions.upsertCatalogItem({ id: asCatalogItemId("CAT-DEL"), manufacturerReference: "CAT-DEL", connectionCount: 2 }),
    appActions.upsertConnector({
      id: asConnectorId("C-DEL"),
      name: "Connector deletable",
      technicalId: "C-DEL",
      cavityCount: 2
    }),
    appActions.upsertSplice({
      id: asSpliceId("S-DEL"),
      name: "Splice deletable",
      technicalId: "S-DEL",
      portCount: 2
    }),
    appActions.upsertNode({ id: asNodeId("N-DEL"), kind: "intermediate", label: "Node deletable" }),
    appActions.upsertNode({ id: asNodeId("N-DEL-A"), kind: "intermediate", label: "Delete A" }),
    appActions.upsertNode({ id: asNodeId("N-DEL-B"), kind: "intermediate", label: "Delete B" }),
    appActions.upsertSegment({
      id: asSegmentId("SEG-DEL"),
      nodeA: asNodeId("N-DEL-A"),
      nodeB: asNodeId("N-DEL-B"),
      lengthMm: 25
    }),
    appActions.saveWire({
      id: asWireId("W-DEL"),
      name: "Wire deletable",
      technicalId: "W-DEL",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 2 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 2 }
    })
  ].reduce(appReducer, nextState);
}

function createBlockedCatalogDeleteState() {
  return [
    appActions.upsertCatalogItem({
      id: asCatalogItemId("CAT-USED"),
      manufacturerReference: "CAT-USED",
      connectionCount: 2
    }),
    appActions.upsertConnector({
      id: asConnectorId("C-CAT"),
      name: "Catalog linked connector",
      technicalId: "C-CAT",
      cavityCount: 2,
      catalogItemId: asCatalogItemId("CAT-USED")
    })
  ].reduce(appReducer, createUiIntegrationState());
}

function createSafeConnectorCascadeState() {
  return [
    appActions.upsertConnector({
      id: asConnectorId("C-CASCADE"),
      name: "Cascade connector",
      technicalId: "C-CASCADE",
      cavityCount: 2
    }),
    appActions.upsertNode({ id: asNodeId("N-C-CASCADE"), kind: "connector", connectorId: asConnectorId("C-CASCADE") })
  ].reduce(appReducer, createDeleteConfirmationState());
}

function createSafeSpliceCascadeState() {
  return [
    appActions.upsertSplice({
      id: asSpliceId("S-CASCADE"),
      name: "Cascade splice",
      technicalId: "S-CASCADE",
      portCount: 2
    }),
    appActions.upsertNode({ id: asNodeId("N-S-CASCADE"), kind: "splice", spliceId: asSpliceId("S-CASCADE") })
  ].reduce(appReducer, createDeleteConfirmationState());
}

async function cancelDeleteDialog(title: string): Promise<void> {
  const confirmDialog = await screen.findByRole("dialog", { name: title });
  fireEvent.click(within(confirmDialog).getByRole("button", { name: "Cancel" }));
}

async function confirmDeleteDialog(title: string, confirmLabel = "Delete"): Promise<void> {
  const confirmDialog = await screen.findByRole("dialog", { name: title });
  fireEvent.click(within(confirmDialog).getByRole("button", { name: confirmLabel }));
}

async function closeBlockedDialog(title: string): Promise<void> {
  const confirmDialog = await screen.findByRole("dialog", { name: title });
  fireEvent.click(within(confirmDialog).getByRole("button", { name: "Close" }));
}

function openOpsPanel(): void {
  fireEvent.click(screen.getByRole("button", { name: "Ops & Health" }));
}

type DeleteEntityCase = {
  entity: string;
  subScreen: "catalog" | "connector" | "splice" | "node" | "segment" | "wire";
  panelHeading: "Catalog" | "Connectors" | "Splices" | "Nodes" | "Segments" | "Wires";
  rowText: string;
  dialogTitle: string;
};

function openModelingDeleteScenario(state = createDeleteConfirmationState()) {
  const renderResult = renderAppWithState(state);
  fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
  switchScreenDrawerAware("modeling");
  return renderResult;
}

function triggerEntityDelete(caseData: DeleteEntityCase): void {
  switchSubScreenDrawerAware(caseData.subScreen);
  const panel = getPanelByHeading(caseData.panelHeading);
  fireEvent.click(within(panel).getByText(caseData.rowText));
  fireEvent.click(within(panel).getByRole("button", { name: "Delete" }));
}

const cancelDeleteCases: DeleteEntityCase[] = [
  {
    entity: "catalog item",
    subScreen: "catalog",
    panelHeading: "Catalog",
    rowText: "CAT-DEL",
    dialogTitle: "Delete catalog item"
  },
  {
    entity: "connector",
    subScreen: "connector",
    panelHeading: "Connectors",
    rowText: "Connector deletable",
    dialogTitle: "Delete connector"
  },
  {
    entity: "splice",
    subScreen: "splice",
    panelHeading: "Splices",
    rowText: "Splice deletable",
    dialogTitle: "Delete splice"
  },
  {
    entity: "node",
    subScreen: "node",
    panelHeading: "Nodes",
    rowText: "N-DEL",
    dialogTitle: "Delete node"
  },
  {
    entity: "segment",
    subScreen: "segment",
    panelHeading: "Segments",
    rowText: "SEG-DEL",
    dialogTitle: "Delete segment"
  },
  {
    entity: "wire",
    subScreen: "wire",
    panelHeading: "Wires",
    rowText: "Wire deletable",
    dialogTitle: "Delete wire"
  }
];

describe("App integration UI - delete confirmations", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("requires confirmation before deleting a network from network scope edit mode", async () => {
    renderAppWithState(createDeleteConfirmationState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("networkScope");

    const networkScopePanel = getPanelByHeading("Network Scope");
    fireEvent.click(within(networkScopePanel).getByText("Network deletable").closest("tr") as HTMLElement);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Edit network" })).toBeInTheDocument();
    });

    const editNetworkPanel = getPanelByHeading("Edit network");
    fireEvent.click(within(editNetworkPanel).getByRole("button", { name: "Delete" }));
    await cancelDeleteDialog("Delete network");
    expect(within(networkScopePanel).getByText("Network deletable")).toBeInTheDocument();

    fireEvent.click(within(getPanelByHeading("Edit network")).getByRole("button", { name: "Delete" }));
    await confirmDeleteDialog("Delete network");
    await waitFor(() => {
      expect(within(getPanelByHeading("Network Scope")).queryByText("Network deletable")).not.toBeInTheDocument();
    });
  });

  it.each(cancelDeleteCases)("requires confirmation for deletable $entity and keeps it when canceled", async (caseData) => {
    openModelingDeleteScenario();
    triggerEntityDelete(caseData);
    await cancelDeleteDialog(caseData.dialogTitle);
    expect(within(getPanelByHeading(caseData.panelHeading)).getByText(caseData.rowText)).toBeInTheDocument();
  });

  it.each(cancelDeleteCases)("deletes deletable $entity only after explicit confirmation", async (caseData) => {
    const { store } = openModelingDeleteScenario();
    triggerEntityDelete(caseData);
    await confirmDeleteDialog(caseData.dialogTitle);
    await waitFor(() => {
      expect(within(getPanelByHeading(caseData.panelHeading)).queryByText(caseData.rowText)).not.toBeInTheDocument();
      switch (caseData.subScreen) {
        case "catalog":
          expect(store.getState().catalogItems.byId[asCatalogItemId("CAT-DEL")]).toBeUndefined();
          break;
        case "connector":
          expect(store.getState().connectors.byId[asConnectorId("C-DEL")]).toBeUndefined();
          break;
        case "splice":
          expect(store.getState().splices.byId[asSpliceId("S-DEL")]).toBeUndefined();
          break;
        case "node":
          expect(store.getState().nodes.byId[asNodeId("N-DEL")]).toBeUndefined();
          break;
        case "segment":
          expect(store.getState().segments.byId[asSegmentId("SEG-DEL")]).toBeUndefined();
          break;
        case "wire":
          expect(store.getState().wires.byId[asWireId("W-DEL")]).toBeUndefined();
          break;
      }
    });
  });

  it("shows an explicit blocked-delete modal for connectors with linked nodes, segments, and wire endpoints", async () => {
    const { store } = openModelingDeleteScenario();

    switchSubScreenDrawerAware("connector");
    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Connector 1"));
    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "Delete" }));

    const dialog = await screen.findByRole("dialog", { name: "Connector delete blocked" });
    expect(within(dialog).getByText("Connector nodes (1)")).toBeInTheDocument();
    expect(within(dialog).getByText("Connected segments (1)")).toBeInTheDocument();
    expect(within(dialog).getByText("Wire endpoints (2)")).toBeInTheDocument();
    expect(dialog).toHaveTextContent("C-1");
    expect(dialog).toHaveTextContent("Cascade delete is unavailable because wire endpoints still reference this connector.");

    await closeBlockedDialog("Connector delete blocked");
    expect(store.getState().connectors.byId[asConnectorId("C1")]).toBeDefined();
  });

  it("shows an explicit blocked-delete modal for splices with linked nodes, segments, and wire endpoints", async () => {
    const { store } = openModelingDeleteScenario();

    switchSubScreenDrawerAware("splice");
    const splicesPanel = getPanelByHeading("Splices");
    fireEvent.click(within(splicesPanel).getByText("Splice 1"));
    fireEvent.click(within(splicesPanel).getByRole("button", { name: "Delete" }));

    const dialog = await screen.findByRole("dialog", { name: "Splice delete blocked" });
    expect(within(dialog).getByText("Splice nodes (1)")).toBeInTheDocument();
    expect(within(dialog).getByText("Connected segments (1)")).toBeInTheDocument();
    expect(within(dialog).getByText("Wire endpoints (2)")).toBeInTheDocument();
    expect(dialog).toHaveTextContent("S-1");

    await closeBlockedDialog("Splice delete blocked");
    expect(store.getState().splices.byId[asSpliceId("S1")]).toBeDefined();
  });

  it("shows an explicit blocked-delete modal for nodes with connected segments", async () => {
    const { store } = openModelingDeleteScenario();

    switchSubScreenDrawerAware("node");
    const nodesPanel = getPanelByHeading("Nodes");
    fireEvent.click(within(nodesPanel).getByText("N-C1"));
    fireEvent.click(within(nodesPanel).getByRole("button", { name: "Delete" }));

    const dialog = await screen.findByRole("dialog", { name: "Node delete blocked" });
    expect(within(dialog).getByText("Connected segments (1)")).toBeInTheDocument();
    expect(dialog).toHaveTextContent("N-C1");

    await closeBlockedDialog("Node delete blocked");
    expect(store.getState().nodes.byId[asNodeId("N-C1")]).toBeDefined();
  });

  it("shows an explicit blocked-delete modal for segments that would invalidate wire routing", async () => {
    const { store } = openModelingDeleteScenario();

    switchSubScreenDrawerAware("segment");
    const segmentsPanel = getPanelByHeading("Segments");
    fireEvent.click(within(segmentsPanel).getByText("SEG-A"));
    fireEvent.click(within(segmentsPanel).getByRole("button", { name: "Delete" }));

    const dialog = await screen.findByRole("dialog", { name: "Segment delete blocked" });
    expect(within(dialog).getByText("Routed wires (2)")).toBeInTheDocument();
    expect(dialog).toHaveTextContent("No route found for wire");

    await closeBlockedDialog("Segment delete blocked");
    expect(store.getState().segments.byId[asSegmentId("SEG-A")]).toBeDefined();
  });

  it("shows an explicit blocked-delete modal for catalog items with live references", async () => {
    const { store } = openModelingDeleteScenario(createBlockedCatalogDeleteState());

    switchSubScreenDrawerAware("catalog");
    const catalogPanel = getPanelByHeading("Catalog");
    fireEvent.click(within(catalogPanel).getByText("CAT-USED"));
    fireEvent.click(within(catalogPanel).getByRole("button", { name: "Delete" }));

    const dialog = await screen.findByRole("dialog", { name: "Catalog item delete blocked" });
    expect(within(dialog).getByText("Connectors (1)")).toBeInTheDocument();
    expect(dialog).toHaveTextContent("C-CAT");

    await closeBlockedDialog("Catalog item delete blocked");
    expect(store.getState().catalogItems.byId[asCatalogItemId("CAT-USED")]).toBeDefined();
  });

  it("offers safe connector cascade delete and records it as one undoable operation", async () => {
    const { store } = openModelingDeleteScenario(createSafeConnectorCascadeState());

    switchSubScreenDrawerAware("connector");
    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Cascade connector"));
    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "Delete" }));

    const dialog = await screen.findByRole("dialog", { name: "Cascade delete connector" });
    expect(within(dialog).getByText("Connector nodes (1)")).toBeInTheDocument();
    expect(dialog).toHaveTextContent("Delete all");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete all" }));

    await waitFor(() => {
      expect(store.getState().connectors.byId[asConnectorId("C-CASCADE")]).toBeUndefined();
      expect(store.getState().nodes.byId[asNodeId("N-C-CASCADE")]).toBeUndefined();
    });

    openOpsPanel();
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(store.getState().connectors.byId[asConnectorId("C-CASCADE")]).toBeDefined();
    expect(store.getState().nodes.byId[asNodeId("N-C-CASCADE")]).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    expect(store.getState().connectors.byId[asConnectorId("C-CASCADE")]).toBeUndefined();
    expect(store.getState().nodes.byId[asNodeId("N-C-CASCADE")]).toBeUndefined();
  });

  it("offers safe splice cascade delete when only the linked splice node is impacted", async () => {
    const { store } = openModelingDeleteScenario(createSafeSpliceCascadeState());

    switchSubScreenDrawerAware("splice");
    const splicesPanel = getPanelByHeading("Splices");
    fireEvent.click(within(splicesPanel).getByText("Cascade splice"));
    fireEvent.click(within(splicesPanel).getByRole("button", { name: "Delete" }));

    const dialog = await screen.findByRole("dialog", { name: "Cascade delete splice" });
    expect(within(dialog).getByText("Splice nodes (1)")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete all" }));

    await waitFor(() => {
      expect(store.getState().splices.byId[asSpliceId("S-CASCADE")]).toBeUndefined();
      expect(store.getState().nodes.byId[asNodeId("N-S-CASCADE")]).toBeUndefined();
    });
  });
});
