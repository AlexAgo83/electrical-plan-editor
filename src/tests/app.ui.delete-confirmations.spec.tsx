import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { NetworkId } from "../core/entities";
import {
  asCatalogItemId,
  asConnectorId,
  asNodeId,
  asSegmentId,
  asSpliceId,
  asWireId,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";
import {
  cancelDeleteCases,
  cancelDeleteDialog,
  closeBlockedDialog,
  confirmDeleteDialog,
  createBlockedCatalogDeleteState,
  createDeleteConfirmationState,
  createSafeConnectorCascadeState,
  createSafeSpliceCascadeState,
  openModelingDeleteScenario,
  openOpsPanel,
  triggerEntityDelete
} from "./helpers/delete-confirmation-test-utils";

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

  it("shows an in-app notification after deleting an entity", async () => {
    openModelingDeleteScenario();
    triggerEntityDelete({
      entity: "connector",
      subScreen: "connector",
      panelHeading: "Connectors",
      rowText: "Connector deletable",
      dialogTitle: "Delete connector"
    });
    await confirmDeleteDialog("Delete connector");

    const toastTitle = await screen.findByText("Connector deleted");
    const toast = toastTitle.closest(".toast-notification");
    expect(toast).not.toBeNull();
    expect(toast).toHaveTextContent("Connector deleted");
    expect(toast).toHaveTextContent("Connector deletable (C-DEL)");
  });

  it("keeps Cancel focused in direct delete dialogs, supports Escape cancel, and confirms on Enter", async () => {
    const { store } = renderAppWithState(createDeleteConfirmationState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("networkScope");

    const networkScopePanel = getPanelByHeading("Network Scope");
    fireEvent.click(within(networkScopePanel).getByText("Network deletable").closest("tr") as HTMLElement);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Edit network" })).toBeInTheDocument();
    });

    fireEvent.click(within(getPanelByHeading("Edit network")).getByRole("button", { name: "Delete" }));
    const escapeDialog = await screen.findByRole("dialog", { name: "Delete network" });
    const escapeCancelButton = within(escapeDialog).getByRole("button", { name: "Cancel" });
    expect(escapeCancelButton).toHaveFocus();
    fireEvent.keyDown(escapeDialog, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Delete network" })).not.toBeInTheDocument();
    });
    expect(store.getState().networks.byId["net-del" as NetworkId]).toBeDefined();

    fireEvent.click(within(getPanelByHeading("Edit network")).getByRole("button", { name: "Delete" }));
    const enterDialog = await screen.findByRole("dialog", { name: "Delete network" });
    const enterCancelButton = within(enterDialog).getByRole("button", { name: "Cancel" });
    expect(enterCancelButton).toHaveFocus();
    fireEvent.keyDown(enterDialog, { key: "Enter" });
    await waitFor(() => {
      expect(store.getState().networks.byId["net-del" as NetworkId]).toBeUndefined();
    });
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

  it("keeps Cancel focused in cascade delete dialogs and confirms on Enter", async () => {
    const { store } = openModelingDeleteScenario(createSafeConnectorCascadeState());

    switchSubScreenDrawerAware("connector");
    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Cascade connector"));
    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "Delete" }));

    const dialog = await screen.findByRole("dialog", { name: "Cascade delete connector" });
    const cancelButton = within(dialog).getByRole("button", { name: "Cancel" });
    expect(cancelButton).toHaveFocus();
    fireEvent.keyDown(dialog, { key: "Enter" });

    await waitFor(() => {
      expect(store.getState().connectors.byId[asConnectorId("C-CASCADE")]).toBeUndefined();
      expect(store.getState().nodes.byId[asNodeId("N-C-CASCADE")]).toBeUndefined();
    });
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

  it("replaces the modeling edit panel with a batch context panel while multi-selection is active", () => {
    openModelingDeleteScenario(createSafeConnectorCascadeState());

    switchSubScreenDrawerAware("connector");
    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Cascade connector"));
    expect(getPanelByHeading("Edit Connector")).toBeInTheDocument();

    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "Select multiple" }));

    expect(screen.queryByRole("heading", { name: "Edit Connector" })).not.toBeInTheDocument();
    const batchPanel = screen.getByTestId("modeling-batch-context-panel");
    expect(within(batchPanel).getByRole("heading", { name: "Batch selection" })).toBeInTheDocument();
    expect(batchPanel).toHaveTextContent("0 connectors selected");
  });

  it("refuses partial connector batch delete when the selection mixes cascade-safe and blocked entries", async () => {
    const { store } = openModelingDeleteScenario(createSafeConnectorCascadeState());

    switchSubScreenDrawerAware("connector");
    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "Select multiple" }));
    fireEvent.click(within(connectorsPanel).getByText("Cascade connector"));
    fireEvent.click(within(connectorsPanel).getByText("Connector 1"));

    const batchPanel = screen.getByTestId("modeling-batch-context-panel");
    expect(batchPanel).toHaveTextContent("2 connectors selected");
    expect(batchPanel).toHaveTextContent("Cascade delete");
    expect(batchPanel).toHaveTextContent("Blocked");

    fireEvent.click(within(batchPanel).getByRole("button", { name: "Delete selected (2)" }));

    const dialog = await screen.findByRole("dialog", { name: "Batch delete blocked" });
    expect(dialog).toHaveTextContent("Batch delete will not remove a partial selection");
    fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));

    expect(store.getState().connectors.byId[asConnectorId("C1")]).toBeDefined();
    expect(store.getState().connectors.byId[asConnectorId("C-CASCADE")]).toBeDefined();
  });

  it("deletes multiple wires as one undoable batch operation", async () => {
    const { store } = openModelingDeleteScenario();

    switchSubScreenDrawerAware("wire");
    const wiresPanel = getPanelByHeading("Wires");
    fireEvent.click(within(wiresPanel).getByRole("button", { name: "Select multiple" }));
    fireEvent.click(within(wiresPanel).getByText("Wire 1"));
    fireEvent.click(within(wiresPanel).getByText("Wire deletable"));

    const batchPanel = screen.getByTestId("modeling-batch-context-panel");
    fireEvent.click(within(batchPanel).getByRole("button", { name: "Delete selected (2)" }));

    const dialog = await screen.findByRole("dialog", { name: "Delete selected wires" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete selected" }));

    await waitFor(() => {
      expect(store.getState().wires.byId[asWireId("W1")]).toBeUndefined();
      expect(store.getState().wires.byId[asWireId("W-DEL")]).toBeUndefined();
    });

    openOpsPanel();
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));

    expect(store.getState().wires.byId[asWireId("W1")]).toBeDefined();
    expect(store.getState().wires.byId[asWireId("W-DEL")]).toBeDefined();
  });
});
