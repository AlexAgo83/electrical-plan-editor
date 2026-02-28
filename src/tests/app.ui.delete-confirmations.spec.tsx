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

async function cancelDeleteDialog(title: string): Promise<void> {
  const confirmDialog = await screen.findByRole("dialog", { name: title });
  fireEvent.click(within(confirmDialog).getByRole("button", { name: "Cancel" }));
}

async function confirmDeleteDialog(title: string): Promise<void> {
  const confirmDialog = await screen.findByRole("dialog", { name: title });
  fireEvent.click(within(confirmDialog).getByRole("button", { name: "Delete" }));
}

type DeleteEntityCase = {
  entity: string;
  subScreen: "catalog" | "connector" | "splice" | "node" | "segment" | "wire";
  panelHeading: "Catalog" | "Connectors" | "Splices" | "Nodes" | "Segments" | "Wires";
  rowText: string;
  dialogTitle: string;
};

function openModelingDeleteScenario() {
  const renderResult = renderAppWithState(createDeleteConfirmationState());
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

const confirmDeleteCases: DeleteEntityCase[] = cancelDeleteCases.filter(({ subScreen }) => subScreen !== "connector");

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

  it.each(cancelDeleteCases)("requires confirmation for delete actions and keeps $entity when canceled", async (caseData) => {
    openModelingDeleteScenario();
    triggerEntityDelete(caseData);
    await cancelDeleteDialog(caseData.dialogTitle);
    expect(within(getPanelByHeading(caseData.panelHeading)).getByText(caseData.rowText)).toBeInTheDocument();
  });

  it.each(confirmDeleteCases)("deletes $entity only after explicit confirmation", async (caseData) => {
    const { store } = openModelingDeleteScenario();
    triggerEntityDelete(caseData);
    await confirmDeleteDialog(caseData.dialogTitle);
    await waitFor(() => {
      expect(within(getPanelByHeading(caseData.panelHeading)).queryByText(caseData.rowText)).not.toBeInTheDocument();
      switch (caseData.subScreen) {
        case "catalog":
          expect(store.getState().catalogItems.byId[asCatalogItemId("CAT-DEL")]).toBeUndefined();
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
        default:
          throw new Error(`Unhandled delete case: ${caseData.subScreen}`);
      }
    });
  });

  it("preserves guarded connector delete semantics and deletes deletable connector after confirmation", async () => {
    const { store } = openModelingDeleteScenario();

    switchSubScreenDrawerAware("connector");
    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Connector 1"));
    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "Delete" }));
    await confirmDeleteDialog("Delete connector");
    expect(store.getState().connectors.byId[asConnectorId("C1")]).toBeDefined();
    expect(store.getState().ui.lastError).toBe("Cannot remove connector while a connector node references it.");

    fireEvent.click(within(connectorsPanel).getByText("Connector deletable"));
    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "Delete" }));
    await confirmDeleteDialog("Delete connector");
    await waitFor(() => {
      expect(store.getState().connectors.byId[asConnectorId("C-DEL")]).toBeUndefined();
      expect(within(getPanelByHeading("Connectors")).queryByText("Connector deletable")).not.toBeInTheDocument();
    });
  });
});
