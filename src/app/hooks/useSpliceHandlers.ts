import type { FormEvent } from "react";
import type { CatalogItemId, Splice, SpliceId } from "../../core/entities";
import type { AppStore } from "../../store";
import { appActions } from "../../store";
import { createEntityId, focusSelectedTableRowInPanel } from "../lib/app-utils-shared";
import { suggestAutoSpliceNodeId, suggestNextSpliceTechnicalId } from "../lib/technical-id-suggestions";

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
  spliceCatalogItemId: string;
  setSpliceCatalogItemId: (value: string) => void;
  spliceManufacturerReference: string;
  setSpliceManufacturerReference: (value: string) => void;
  spliceAutoCreateLinkedNode: boolean;
  setSpliceAutoCreateLinkedNode: (value: boolean) => void;
  defaultAutoCreateLinkedNodes: boolean;
  portCount: string;
  setPortCount: (value: string) => void;
  setSpliceFormError: (value: string | null) => void;
  selectedSpliceId: SpliceId | null;
  portIndexInput: string;
  spliceOccupantRefInput: string;
}

function toCatalogItemId(raw: string): CatalogItemId | null {
  return raw.trim().length === 0 ? null : (raw as CatalogItemId);
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
  spliceCatalogItemId,
  setSpliceCatalogItemId,
  spliceManufacturerReference: _spliceManufacturerReference,
  setSpliceManufacturerReference,
  spliceAutoCreateLinkedNode,
  setSpliceAutoCreateLinkedNode,
  defaultAutoCreateLinkedNodes,
  portCount: _portCount,
  setPortCount,
  setSpliceFormError,
  selectedSpliceId,
  portIndexInput,
  spliceOccupantRefInput
}: UseSpliceHandlersParams) {
  void _spliceManufacturerReference;
  void _portCount;

  function syncDerivedSpliceCatalogFields(nextCatalogItemId: string): void {
    setSpliceCatalogItemId(nextCatalogItemId);
    const catalogItem = store.getState().catalogItems.byId[nextCatalogItemId as CatalogItemId];
    if (catalogItem === undefined) {
      setSpliceManufacturerReference("");
      return;
    }
    setSpliceManufacturerReference(catalogItem.manufacturerReference);
    setPortCount(String(catalogItem.connectionCount));
  }

  function resetSpliceForm(): void {
    const state = store.getState();
    const firstCatalogItem = state.catalogItems.allIds
      .map((catalogItemId) => state.catalogItems.byId[catalogItemId])
      .find((item): item is NonNullable<typeof item> => item !== undefined);
    if (firstCatalogItem === undefined) {
      setSpliceFormMode("create");
      setEditingSpliceId(null);
      setSpliceName("");
      setSpliceTechnicalId(suggestNextSpliceTechnicalId(Object.values(state.splices.byId).map((splice) => splice.technicalId)));
      setSpliceCatalogItemId("");
      setSpliceManufacturerReference("");
      setSpliceAutoCreateLinkedNode(defaultAutoCreateLinkedNodes);
      setPortCount("4");
      setSpliceFormError("Create a catalog item first to define manufacturer reference and connection count.");
      return;
    }

    setSpliceFormMode("create");
    setEditingSpliceId(null);
    setSpliceName("");
    setSpliceTechnicalId(suggestNextSpliceTechnicalId(Object.values(state.splices.byId).map((splice) => splice.technicalId)));
    syncDerivedSpliceCatalogFields(firstCatalogItem.id);
    setSpliceAutoCreateLinkedNode(defaultAutoCreateLinkedNodes);
    setSpliceFormError(null);
  }

  function clearSpliceForm(): void {
    setSpliceFormMode("idle");
    setEditingSpliceId(null);
    setSpliceName("");
    setSpliceTechnicalId("");
    setSpliceCatalogItemId("");
    setSpliceManufacturerReference("");
    setSpliceAutoCreateLinkedNode(defaultAutoCreateLinkedNodes);
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
    if (splice.catalogItemId !== undefined && store.getState().catalogItems.byId[splice.catalogItemId] !== undefined) {
      syncDerivedSpliceCatalogFields(splice.catalogItemId);
    } else {
      setSpliceCatalogItemId("");
      setSpliceManufacturerReference(splice.manufacturerReference ?? "");
      setPortCount(String(splice.portCount));
    }
    setSpliceAutoCreateLinkedNode(defaultAutoCreateLinkedNodes);
    setSpliceFormError(null);
    dispatchAction(appActions.select({ kind: "splice", id: splice.id }));
  }

  function handleSpliceSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const trimmedName = spliceName.trim();
    const trimmedTechnicalId = spliceTechnicalId.trim();
    const selectedCatalogItemId = toCatalogItemId(spliceCatalogItemId);
    const selectedCatalogItem = selectedCatalogItemId === null ? undefined : store.getState().catalogItems.byId[selectedCatalogItemId];
    if (selectedCatalogItem === undefined) {
      setSpliceFormError("Select a catalog item first.");
      return;
    }

    const normalizedPortCount = selectedCatalogItem.connectionCount;
    if (trimmedName.length === 0 || trimmedTechnicalId.length === 0 || normalizedPortCount < 1) {
      setSpliceFormError("All fields are required and port count must be >= 1.");
      return;
    }
    setSpliceFormError(null);

    const wasCreateMode = spliceFormMode === "create";
    const spliceId =
      spliceFormMode === "edit" && editingSpliceId !== null ? editingSpliceId : (createEntityId("splice") as SpliceId);
    const existingSplice =
      spliceFormMode === "edit" && editingSpliceId !== null ? store.getState().splices.byId[editingSpliceId] : undefined;

    dispatchAction(
      appActions.upsertSplice({
        ...(existingSplice ?? {}),
        id: spliceId,
        name: trimmedName,
        technicalId: trimmedTechnicalId,
        catalogItemId: selectedCatalogItem.id,
        manufacturerReference: selectedCatalogItem.manufacturerReference,
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

        if (spliceAutoCreateLinkedNode && !existingNodeForSplice) {
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
      startSpliceEdit(savedSplice);
      focusSelectedTableRowInPanel('[data-onboarding-panel="modeling-splices"]');
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

    const portIndex = Math.max(0, Math.trunc(Number(portIndexInput)));
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
    handleReleasePort,
    syncDerivedSpliceCatalogFields
  };
}
