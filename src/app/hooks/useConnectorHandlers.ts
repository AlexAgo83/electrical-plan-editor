import type { FormEvent } from "react";
import type { CatalogItemId, Connector, ConnectorId } from "../../core/entities";
import type { AppStore } from "../../store";
import { appActions } from "../../store";
import { createEntityId, focusSelectedTableRowInPanel } from "../lib/app-utils-shared";
import { suggestAutoConnectorNodeId, suggestNextConnectorTechnicalId } from "../lib/technical-id-suggestions";

type DispatchAction = (
  action: Parameters<AppStore["dispatch"]>[0],
  options?: {
    trackHistory?: boolean;
  }
) => void;

interface UseConnectorHandlersParams {
  store: AppStore;
  dispatchAction: DispatchAction;
  connectorFormMode: "idle" | "create" | "edit";
  setConnectorFormMode: (mode: "idle" | "create" | "edit") => void;
  editingConnectorId: ConnectorId | null;
  setEditingConnectorId: (id: ConnectorId | null) => void;
  connectorName: string;
  setConnectorName: (value: string) => void;
  connectorTechnicalId: string;
  setConnectorTechnicalId: (value: string) => void;
  connectorCatalogItemId: string;
  setConnectorCatalogItemId: (value: string) => void;
  connectorManufacturerReference: string;
  setConnectorManufacturerReference: (value: string) => void;
  connectorAutoCreateLinkedNode: boolean;
  setConnectorAutoCreateLinkedNode: (value: boolean) => void;
  defaultAutoCreateLinkedNodes: boolean;
  cavityCount: string;
  setCavityCount: (value: string) => void;
  setConnectorFormError: (value: string | null) => void;
  selectedConnectorId: ConnectorId | null;
  cavityIndexInput: string;
  connectorOccupantRefInput: string;
}

function toCatalogItemId(raw: string): CatalogItemId | null {
  return raw.trim().length === 0 ? null : (raw as CatalogItemId);
}

export function useConnectorHandlers({
  store,
  dispatchAction,
  connectorFormMode,
  setConnectorFormMode,
  editingConnectorId,
  setEditingConnectorId,
  connectorName,
  setConnectorName,
  connectorTechnicalId,
  setConnectorTechnicalId,
  connectorCatalogItemId,
  setConnectorCatalogItemId,
  connectorManufacturerReference: _connectorManufacturerReference,
  setConnectorManufacturerReference,
  connectorAutoCreateLinkedNode,
  setConnectorAutoCreateLinkedNode,
  defaultAutoCreateLinkedNodes,
  cavityCount: _cavityCount,
  setCavityCount,
  setConnectorFormError,
  selectedConnectorId,
  cavityIndexInput,
  connectorOccupantRefInput
}: UseConnectorHandlersParams) {
  void _connectorManufacturerReference;
  void _cavityCount;

  function syncDerivedConnectorCatalogFields(nextCatalogItemId: string): void {
    setConnectorCatalogItemId(nextCatalogItemId);
    const catalogItem = store.getState().catalogItems.byId[nextCatalogItemId as CatalogItemId];
    if (catalogItem === undefined) {
      setConnectorManufacturerReference("");
      return;
    }
    setConnectorManufacturerReference(catalogItem.manufacturerReference);
    setCavityCount(String(catalogItem.connectionCount));
  }

  function resetConnectorForm(): void {
    const state = store.getState();
    const firstCatalogItem = state.catalogItems.allIds
      .map((catalogItemId) => state.catalogItems.byId[catalogItemId])
      .find((item): item is NonNullable<typeof item> => item !== undefined);
    if (firstCatalogItem === undefined) {
      setConnectorFormMode("create");
      setEditingConnectorId(null);
      setConnectorName("");
      setConnectorTechnicalId(
        suggestNextConnectorTechnicalId(Object.values(state.connectors.byId).map((connector) => connector.technicalId))
      );
      setConnectorCatalogItemId("");
      setConnectorManufacturerReference("");
      setConnectorAutoCreateLinkedNode(defaultAutoCreateLinkedNodes);
      setCavityCount("4");
      setConnectorFormError("Create a catalog item first to define manufacturer reference and connection count.");
      return;
    }

    setConnectorFormMode("create");
    setEditingConnectorId(null);
    setConnectorName("");
    setConnectorTechnicalId(
      suggestNextConnectorTechnicalId(Object.values(state.connectors.byId).map((connector) => connector.technicalId))
    );
    syncDerivedConnectorCatalogFields(firstCatalogItem.id);
    setConnectorAutoCreateLinkedNode(defaultAutoCreateLinkedNodes);
    setConnectorFormError(null);
  }

  function clearConnectorForm(): void {
    setConnectorFormMode("idle");
    setEditingConnectorId(null);
    setConnectorName("");
    setConnectorTechnicalId("");
    setConnectorCatalogItemId("");
    setConnectorManufacturerReference("");
    setConnectorAutoCreateLinkedNode(defaultAutoCreateLinkedNodes);
    setCavityCount("4");
    setConnectorFormError(null);
  }

  function cancelConnectorEdit(): void {
    clearConnectorForm();
    dispatchAction(appActions.clearSelection(), { trackHistory: false });
  }

  function startConnectorEdit(connector: Connector): void {
    setConnectorFormMode("edit");
    setEditingConnectorId(connector.id);
    setConnectorName(connector.name);
    setConnectorTechnicalId(connector.technicalId);
    if (connector.catalogItemId !== undefined && store.getState().catalogItems.byId[connector.catalogItemId] !== undefined) {
      syncDerivedConnectorCatalogFields(connector.catalogItemId);
    } else {
      setConnectorCatalogItemId("");
      setConnectorManufacturerReference(connector.manufacturerReference ?? "");
      setCavityCount(String(connector.cavityCount));
    }
    setConnectorAutoCreateLinkedNode(defaultAutoCreateLinkedNodes);
    setConnectorFormError(null);
    dispatchAction(appActions.select({ kind: "connector", id: connector.id }));
  }

  function handleConnectorSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const trimmedName = connectorName.trim();
    const trimmedTechnicalId = connectorTechnicalId.trim();
    const selectedCatalogItemId = toCatalogItemId(connectorCatalogItemId);
    const selectedCatalogItem =
      selectedCatalogItemId === null ? undefined : store.getState().catalogItems.byId[selectedCatalogItemId];

    if (selectedCatalogItem === undefined) {
      setConnectorFormError("Select a catalog item first.");
      return;
    }

    const normalizedCavityCount = selectedCatalogItem.connectionCount;
    if (trimmedName.length === 0 || trimmedTechnicalId.length === 0 || normalizedCavityCount < 1) {
      setConnectorFormError("All fields are required and way count must be >= 1.");
      return;
    }
    setConnectorFormError(null);

    const wasCreateMode = connectorFormMode === "create";
    const connectorId =
      connectorFormMode === "edit" && editingConnectorId !== null
        ? editingConnectorId
        : (createEntityId("conn") as ConnectorId);
    const existingConnector =
      connectorFormMode === "edit" && editingConnectorId !== null ? store.getState().connectors.byId[editingConnectorId] : undefined;

    dispatchAction(
      appActions.upsertConnector({
        ...(existingConnector ?? {}),
        id: connectorId,
        name: trimmedName,
        technicalId: trimmedTechnicalId,
        catalogItemId: selectedCatalogItem.id,
        manufacturerReference: selectedCatalogItem.manufacturerReference,
        cavityCount: normalizedCavityCount
      })
    );

    const nextState = store.getState();
    const savedConnector = nextState.connectors.byId[connectorId];
    if (savedConnector !== undefined) {
      if (wasCreateMode) {
        const existingNodeForConnector = nextState.nodes.allIds.some((nodeId) => {
          const node = nextState.nodes.byId[nodeId];
          return node?.kind === "connector" && node.connectorId === connectorId;
        });

        if (connectorAutoCreateLinkedNode && !existingNodeForConnector) {
          const autoNodeId = suggestAutoConnectorNodeId(savedConnector.technicalId, nextState.nodes.allIds);
          dispatchAction(
            appActions.upsertNode({
              id: autoNodeId,
              kind: "connector",
              connectorId
            }),
            { trackHistory: false }
          );

          const stateAfterNodeCreate = store.getState();
          const linkedNodeExists = stateAfterNodeCreate.nodes.allIds.some((nodeId) => {
            const node = stateAfterNodeCreate.nodes.byId[nodeId];
            return node?.kind === "connector" && node.connectorId === connectorId;
          });
          if (!linkedNodeExists) {
            setConnectorFormError(
              "Connector created, but the linked connector node could not be created automatically. Create it manually in Nodes."
            );
          }
        }

        startConnectorEdit(savedConnector);
        return;
      }
      startConnectorEdit(savedConnector);
      focusSelectedTableRowInPanel('[data-onboarding-panel="modeling-connectors"]');
    }
  }

  function handleConnectorDelete(connectorId: ConnectorId): void {
    dispatchAction(appActions.removeConnector(connectorId));

    if (editingConnectorId === connectorId) {
      clearConnectorForm();
    }
  }

  function handleReserveCavity(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (selectedConnectorId === null) {
      return;
    }

    const cavityIndex = Math.max(0, Math.trunc(Number(cavityIndexInput)));
    dispatchAction(appActions.occupyConnectorCavity(selectedConnectorId, cavityIndex, connectorOccupantRefInput));
  }

  function handleReleaseCavity(cavityIndex: number): void {
    if (selectedConnectorId === null) {
      return;
    }

    dispatchAction(appActions.releaseConnectorCavity(selectedConnectorId, cavityIndex));
  }

  return {
    resetConnectorForm,
    clearConnectorForm,
    cancelConnectorEdit,
    startConnectorEdit,
    handleConnectorSubmit,
    handleConnectorDelete,
    handleReserveCavity,
    handleReleaseCavity,
    syncDerivedConnectorCatalogFields
  };
}
