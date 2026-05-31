import { fireEvent, screen, within } from "@testing-library/react";
import type { NetworkId } from "../../core/entities";
import { appActions, appReducer } from "../../store";
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
} from "./app-ui-test-utils";

export function createDeleteConfirmationState() {
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

export function createBlockedCatalogDeleteState() {
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

export function createSafeConnectorCascadeState() {
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

export function createSafeSpliceCascadeState() {
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

export async function cancelDeleteDialog(title: string): Promise<void> {
  const confirmDialog = await screen.findByRole("dialog", { name: title });
  fireEvent.click(within(confirmDialog).getByRole("button", { name: "Cancel" }));
}

export async function confirmDeleteDialog(title: string, confirmLabel = "Delete"): Promise<void> {
  const confirmDialog = await screen.findByRole("dialog", { name: title });
  fireEvent.click(within(confirmDialog).getByRole("button", { name: confirmLabel }));
}

export async function closeBlockedDialog(title: string): Promise<void> {
  const confirmDialog = await screen.findByRole("dialog", { name: title });
  fireEvent.click(within(confirmDialog).getByRole("button", { name: "Close" }));
}

export function openOpsPanel(): void {
  fireEvent.click(screen.getByRole("button", { name: "Ops" }));
}

export type DeleteEntityCase = {
  entity: string;
  subScreen: "catalog" | "connector" | "splice" | "node" | "segment" | "wire";
  panelHeading: "Catalog" | "Connectors" | "Splices" | "Nodes" | "Segments" | "Wires";
  rowText: string;
  dialogTitle: string;
};

export function openModelingDeleteScenario(state = createDeleteConfirmationState()) {
  const renderResult = renderAppWithState(state);
  fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
  switchScreenDrawerAware("modeling");
  return renderResult;
}

export function triggerEntityDelete(caseData: DeleteEntityCase): void {
  switchSubScreenDrawerAware(caseData.subScreen);
  const panel = getPanelByHeading(caseData.panelHeading);
  fireEvent.click(within(panel).getByText(caseData.rowText));
  fireEvent.click(within(panel).getByRole("button", { name: "Delete" }));
}

export const cancelDeleteCases: DeleteEntityCase[] = [
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
