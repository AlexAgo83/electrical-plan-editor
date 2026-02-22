import type { FormEvent } from "react";
import type { Connector, ConnectorId } from "../../core/entities";
import type { AppStore } from "../../store";
import { appActions } from "../../store";
import { createEntityId, toPositiveInteger } from "../lib/app-utils-shared";

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
  cavityCount: string;
  setCavityCount: (value: string) => void;
  setConnectorFormError: (value: string | null) => void;
  selectedConnectorId: ConnectorId | null;
  cavityIndexInput: string;
  connectorOccupantRefInput: string;
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
  cavityCount,
  setCavityCount,
  setConnectorFormError,
  selectedConnectorId,
  cavityIndexInput,
  connectorOccupantRefInput
}: UseConnectorHandlersParams) {
  function resetConnectorForm(): void {
    setConnectorFormMode("create");
    setEditingConnectorId(null);
    setConnectorName("");
    setConnectorTechnicalId("");
    setCavityCount("4");
    setConnectorFormError(null);
  }

  function clearConnectorForm(): void {
    setConnectorFormMode("idle");
    setEditingConnectorId(null);
    setConnectorName("");
    setConnectorTechnicalId("");
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
    setCavityCount(String(connector.cavityCount));
    dispatchAction(appActions.select({ kind: "connector", id: connector.id }));
  }

  function handleConnectorSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const trimmedName = connectorName.trim();
    const trimmedTechnicalId = connectorTechnicalId.trim();
    const normalizedCavityCount = toPositiveInteger(cavityCount);

    if (trimmedName.length === 0 || trimmedTechnicalId.length === 0 || normalizedCavityCount < 1) {
      setConnectorFormError("All fields are required and cavity count must be >= 1.");
      return;
    }
    setConnectorFormError(null);

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
        cavityCount: normalizedCavityCount
      })
    );

    const nextState = store.getState();
    if (nextState.connectors.byId[connectorId] !== undefined) {
      dispatchAction(appActions.select({ kind: "connector", id: connectorId }));
      resetConnectorForm();
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

    const cavityIndex = toPositiveInteger(cavityIndexInput);
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
    handleReleaseCavity
  };
}
