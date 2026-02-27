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

  it("requires confirmation for delete actions and keeps entities when canceled", async () => {
    renderAppWithState(createDeleteConfirmationState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));

    switchScreenDrawerAware("modeling");

    switchSubScreenDrawerAware("catalog");
    const catalogPanel = getPanelByHeading("Catalog");
    fireEvent.click(within(catalogPanel).getByText("CAT-DEL"));
    fireEvent.click(within(catalogPanel).getByRole("button", { name: "Delete" }));
    await cancelDeleteDialog("Delete catalog item");
    expect(within(catalogPanel).getByText("CAT-DEL")).toBeInTheDocument();

    switchSubScreenDrawerAware("connector");
    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Connector deletable"));
    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "Delete" }));
    await cancelDeleteDialog("Delete connector");
    expect(within(connectorsPanel).getByText("Connector deletable")).toBeInTheDocument();

    switchSubScreenDrawerAware("splice");
    const splicesPanel = getPanelByHeading("Splices");
    fireEvent.click(within(splicesPanel).getByText("Splice deletable"));
    fireEvent.click(within(splicesPanel).getByRole("button", { name: "Delete" }));
    await cancelDeleteDialog("Delete splice");
    expect(within(splicesPanel).getByText("Splice deletable")).toBeInTheDocument();

    switchSubScreenDrawerAware("node");
    const nodesPanel = getPanelByHeading("Nodes");
    fireEvent.click(within(nodesPanel).getByText("N-DEL"));
    fireEvent.click(within(nodesPanel).getByRole("button", { name: "Delete" }));
    await cancelDeleteDialog("Delete node");
    expect(within(nodesPanel).getByText("N-DEL")).toBeInTheDocument();

    switchSubScreenDrawerAware("segment");
    const segmentsPanel = getPanelByHeading("Segments");
    fireEvent.click(within(segmentsPanel).getByText("SEG-DEL"));
    fireEvent.click(within(segmentsPanel).getByRole("button", { name: "Delete" }));
    await cancelDeleteDialog("Delete segment");
    expect(within(segmentsPanel).getByText("SEG-DEL")).toBeInTheDocument();

    switchSubScreenDrawerAware("wire");
    const wiresPanel = getPanelByHeading("Wires");
    fireEvent.click(within(wiresPanel).getByText("Wire deletable"));
    fireEvent.click(within(wiresPanel).getByRole("button", { name: "Delete" }));
    await cancelDeleteDialog("Delete wire");
    expect(within(wiresPanel).getByText("Wire deletable")).toBeInTheDocument();
  }, 15_000);

  it("deletes entities only after explicit confirmation and preserves guarded delete semantics", async () => {
    const { store } = renderAppWithState(createDeleteConfirmationState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));

    switchScreenDrawerAware("modeling");

    switchSubScreenDrawerAware("catalog");
    const catalogPanel = getPanelByHeading("Catalog");
    fireEvent.click(within(catalogPanel).getByText("CAT-DEL"));
    fireEvent.click(within(catalogPanel).getByRole("button", { name: "Delete" }));
    await confirmDeleteDialog("Delete catalog item");
    await waitFor(() => {
      expect(store.getState().catalogItems.byId[asCatalogItemId("CAT-DEL")]).toBeUndefined();
      expect(within(getPanelByHeading("Catalog")).queryByText("CAT-DEL")).not.toBeInTheDocument();
    });

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

    switchSubScreenDrawerAware("splice");
    const splicesPanel = getPanelByHeading("Splices");
    fireEvent.click(within(splicesPanel).getByText("Splice deletable"));
    fireEvent.click(within(splicesPanel).getByRole("button", { name: "Delete" }));
    await confirmDeleteDialog("Delete splice");
    await waitFor(() => {
      expect(store.getState().splices.byId[asSpliceId("S-DEL")]).toBeUndefined();
      expect(within(getPanelByHeading("Splices")).queryByText("Splice deletable")).not.toBeInTheDocument();
    });

    switchSubScreenDrawerAware("node");
    const nodesPanel = getPanelByHeading("Nodes");
    fireEvent.click(within(nodesPanel).getByText("N-DEL"));
    fireEvent.click(within(nodesPanel).getByRole("button", { name: "Delete" }));
    await confirmDeleteDialog("Delete node");
    await waitFor(() => {
      expect(store.getState().nodes.byId[asNodeId("N-DEL")]).toBeUndefined();
      expect(within(getPanelByHeading("Nodes")).queryByText("N-DEL")).not.toBeInTheDocument();
    });

    switchSubScreenDrawerAware("segment");
    const segmentsPanel = getPanelByHeading("Segments");
    fireEvent.click(within(segmentsPanel).getByText("SEG-DEL"));
    fireEvent.click(within(segmentsPanel).getByRole("button", { name: "Delete" }));
    await confirmDeleteDialog("Delete segment");
    await waitFor(() => {
      expect(store.getState().segments.byId[asSegmentId("SEG-DEL")]).toBeUndefined();
      expect(within(getPanelByHeading("Segments")).queryByText("SEG-DEL")).not.toBeInTheDocument();
    });

    switchSubScreenDrawerAware("wire");
    const wiresPanel = getPanelByHeading("Wires");
    fireEvent.click(within(wiresPanel).getByText("Wire deletable"));
    fireEvent.click(within(wiresPanel).getByRole("button", { name: "Delete" }));
    await confirmDeleteDialog("Delete wire");
    await waitFor(() => {
      expect(store.getState().wires.byId[asWireId("W-DEL")]).toBeUndefined();
      expect(within(getPanelByHeading("Wires")).queryByText("Wire deletable")).not.toBeInTheDocument();
    });
  }, 15_000);
});
