import type { FormEvent } from "react";
import type { AppStore } from "../../store";
import type { Splice, SpliceId } from "../../core/entities";
import { appActions } from "../../store";
import { createEntityId, toPositiveInteger } from "../lib/app-utils-shared";
import {
  suggestAutoSpliceNodeId,
  suggestNextSpliceTechnicalId
} from "../lib/technical-id-suggestions";

type DispatchAction = (
  action: Parameters<AppStore["dispatch"]>[0],
  options?: {
    trackHistory?: boolean;
  }
) => void;

interface UseSpliceHandlersParams {
  store: AppStore;
  dispatchAction: DispatchAction;
  spliceFormMode: "idle" | "create" | "edit";
  setSpliceFormMode: (mode: "idle" | "create" | "edit") => void;
  editingSpliceId: SpliceId | null;
  setEditingSpliceId: (id: SpliceId | null) => void;
  spliceName: string;
  setSpliceName: (value: string) => void;
  spliceTechnicalId: string;
  setSpliceTechnicalId: (value: string) => void;
  spliceManufacturerReference: string;
  setSpliceManufacturerReference: (value: string) => void;
  portCount: string;
  setPortCount: (value: string) => void;
  setSpliceFormError: (value: string | null) => void;
  selectedSpliceId: SpliceId | null;
  portIndexInput: string;
  spliceOccupantRefInput: string;
}

export function useSpliceHandlers({
  store,
  dispatchAction,
  spliceFormMode,
  setSpliceFormMode,
  editingSpliceId,
  setEditingSpliceId,
  spliceName,
  setSpliceName,
  spliceTechnicalId,
  setSpliceTechnicalId,
  spliceManufacturerReference,
  setSpliceManufacturerReference,
  portCount,
  setPortCount,
  setSpliceFormError,
  selectedSpliceId,
  portIndexInput,
  spliceOccupantRefInput
}: UseSpliceHandlersParams) {
  function resetSpliceForm(): void {
    const state = store.getState();
    setSpliceFormMode("create");
    setEditingSpliceId(null);
    setSpliceName("");
    setSpliceTechnicalId(suggestNextSpliceTechnicalId(Object.values(state.splices.byId).map((splice) => splice.technicalId)));
    setSpliceManufacturerReference("");
    setPortCount("4");
    setSpliceFormError(null);
  }

  function clearSpliceForm(): void {
    setSpliceFormMode("idle");
    setEditingSpliceId(null);
    setSpliceName("");
    setSpliceTechnicalId("");
    setSpliceManufacturerReference("");
    setPortCount("4");
    setSpliceFormError(null);
  }

  function cancelSpliceEdit(): void {
    clearSpliceForm();
    dispatchAction(appActions.clearSelection(), { trackHistory: false });
  }

  function startSpliceEdit(splice: Splice): void {
    setSpliceFormMode("edit");
    setEditingSpliceId(splice.id);
    setSpliceName(splice.name);
    setSpliceTechnicalId(splice.technicalId);
    setSpliceManufacturerReference(splice.manufacturerReference ?? "");
    setPortCount(String(splice.portCount));
    dispatchAction(appActions.select({ kind: "splice", id: splice.id }));
  }

  function handleSpliceSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const trimmedName = spliceName.trim();
    const trimmedTechnicalId = spliceTechnicalId.trim();
    const normalizedManufacturerReferenceRaw = spliceManufacturerReference.trim();
    if (normalizedManufacturerReferenceRaw.length > 120) {
      setSpliceFormError("Manufacturer reference must be 120 characters or fewer.");
      return;
    }
    const normalizedPortCount = toPositiveInteger(portCount);

    if (trimmedName.length === 0 || trimmedTechnicalId.length === 0 || normalizedPortCount < 1) {
      setSpliceFormError("All fields are required and port count must be >= 1.");
      return;
    }
    setSpliceFormError(null);

    const wasCreateMode = spliceFormMode === "create";
    const spliceId =
      spliceFormMode === "edit" && editingSpliceId !== null
        ? editingSpliceId
        : (createEntityId("splice") as SpliceId);
    const existingSplice =
      spliceFormMode === "edit" && editingSpliceId !== null ? store.getState().splices.byId[editingSpliceId] : undefined;

    dispatchAction(
      appActions.upsertSplice({
        ...(existingSplice ?? {}),
        id: spliceId,
        name: trimmedName,
        technicalId: trimmedTechnicalId,
        manufacturerReference:
          normalizedManufacturerReferenceRaw.length === 0 ? undefined : normalizedManufacturerReferenceRaw,
        portCount: normalizedPortCount
      })
    );

    const nextState = store.getState();
    const savedSplice = nextState.splices.byId[spliceId];
    if (savedSplice !== undefined) {
      if (wasCreateMode) {
        const existingNodeForSplice = nextState.nodes.allIds.some((nodeId) => {
          const node = nextState.nodes.byId[nodeId];
          return node?.kind === "splice" && node.spliceId === spliceId;
        });

        if (!existingNodeForSplice) {
          const autoNodeId = suggestAutoSpliceNodeId(savedSplice.technicalId, nextState.nodes.allIds);
          dispatchAction(
            appActions.upsertNode({
              id: autoNodeId,
              kind: "splice",
              spliceId
            }),
            { trackHistory: false }
          );

          const stateAfterNodeCreate = store.getState();
          const linkedNodeExists = stateAfterNodeCreate.nodes.allIds.some((nodeId) => {
            const node = stateAfterNodeCreate.nodes.byId[nodeId];
            return node?.kind === "splice" && node.spliceId === spliceId;
          });
          if (!linkedNodeExists) {
            setSpliceFormError(
              "Splice created, but the linked splice node could not be created automatically. Create it manually in Nodes."
            );
          }
        }

        startSpliceEdit(savedSplice);
        return;
      }
      dispatchAction(appActions.select({ kind: "splice", id: spliceId }));
      resetSpliceForm();
    }
  }

  function handleSpliceDelete(spliceId: SpliceId): void {
    dispatchAction(appActions.removeSplice(spliceId));

    if (editingSpliceId === spliceId) {
      clearSpliceForm();
    }
  }

  function handleReservePort(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (selectedSpliceId === null) {
      return;
    }

    const portIndex = toPositiveInteger(portIndexInput);
    dispatchAction(appActions.occupySplicePort(selectedSpliceId, portIndex, spliceOccupantRefInput));
  }

  function handleReleasePort(portIndex: number): void {
    if (selectedSpliceId === null) {
      return;
    }

    dispatchAction(appActions.releaseSplicePort(selectedSpliceId, portIndex));
  }

  return {
    resetSpliceForm,
    clearSpliceForm,
    cancelSpliceEdit,
    startSpliceEdit,
    handleSpliceSubmit,
    handleSpliceDelete,
    handleReservePort,
    handleReleasePort
  };
}
