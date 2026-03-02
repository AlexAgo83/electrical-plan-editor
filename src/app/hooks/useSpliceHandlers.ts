import type { FormEvent } from "react";
import type { CatalogItemId, Splice, SpliceId } from "../../core/entities";
import {
  normalizeSplicePortMode,
  normalizeUnboundedPortCountFallback,
  resolveSplicePortMode,
  type SplicePortMode
} from "../../core/splicePortMode";
import type { AppStore } from "../../store";
import { appActions } from "../../store";
import { createEntityId, focusSelectedTableRowInPanel } from "../lib/app-utils-shared";
import { suggestAutoSpliceNodeId, suggestNextSpliceTechnicalId } from "../lib/technical-id-suggestions";
import type { ConfirmDialogRequest } from "../types/confirm-dialog";

type DispatchAction = (
  action: Parameters<AppStore["dispatch"]>[0],
  options?: {
    trackHistory?: boolean;
  }
) => void;

interface UseSpliceHandlersParams {
  store: AppStore;
  dispatchAction: DispatchAction;
  confirmAction: (request: ConfirmDialogRequest) => Promise<boolean>;
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
  splicePortMode: SplicePortMode;
  setSplicePortMode: (value: SplicePortMode) => void;
  spliceManufacturerReference: string;
  setSpliceManufacturerReference: (value: string) => void;
  spliceAutoCreateLinkedNode: boolean;
  setSpliceAutoCreateLinkedNode: (value: boolean) => void;
  defaultAutoCreateLinkedNodes: boolean;
  portCount: string;
  setPortCount: (value: string) => void;
  setSpliceFormInfo: (value: string | null) => void;
  setSpliceFormError: (value: string | null) => void;
  selectedSpliceId: SpliceId | null;
  portIndexInput: string;
  spliceOccupantRefInput: string;
}

function toCatalogItemId(raw: string): CatalogItemId | null {
  return raw.trim().length === 0 ? null : (raw as CatalogItemId);
}

function hasSpliceOccupancyIndexAboveLimit(store: AppStore, spliceId: SpliceId, maxPortCount: number): boolean {
  const occupancy = store.getState().splicePortOccupancy[spliceId];
  if (occupancy === undefined) {
    return false;
  }
  return Object.keys(occupancy)
    .map((key) => Number(key))
    .some((index) => Number.isFinite(index) && index > maxPortCount);
}

function hasSpliceWireEndpointIndexAboveLimit(store: AppStore, spliceId: SpliceId, maxPortCount: number): boolean {
  const state = store.getState();
  return state.wires.allIds.some((wireId) => {
    const wire = state.wires.byId[wireId];
    if (wire === undefined) {
      return false;
    }
    return (
      (wire.endpointA.kind === "splicePort" && wire.endpointA.spliceId === spliceId && wire.endpointA.portIndex > maxPortCount) ||
      (wire.endpointB.kind === "splicePort" && wire.endpointB.spliceId === spliceId && wire.endpointB.portIndex > maxPortCount)
    );
  });
}

export function useSpliceHandlers({
  store,
  dispatchAction,
  confirmAction,
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
  splicePortMode,
  setSplicePortMode,
  spliceManufacturerReference: _spliceManufacturerReference,
  setSpliceManufacturerReference,
  spliceAutoCreateLinkedNode,
  setSpliceAutoCreateLinkedNode,
  defaultAutoCreateLinkedNodes,
  portCount: _portCount,
  setPortCount,
  setSpliceFormInfo,
  setSpliceFormError,
  selectedSpliceId,
  portIndexInput,
  spliceOccupantRefInput
}: UseSpliceHandlersParams) {
  const spliceManufacturerReference = _spliceManufacturerReference;
  const portCount = _portCount;

  function setSpliceCapacityMode(nextMode: SplicePortMode): void {
    if (nextMode === "unbounded" && spliceCatalogItemId.trim().length > 0) {
      setSpliceFormError("Clear catalog selection before switching splice capacity to unbounded.");
      return;
    }

    setSplicePortMode(nextMode);
    setSpliceFormError(null);
    setSpliceFormInfo(
      nextMode === "unbounded"
        ? "Unbounded mode allows any positive port index (∞)."
        : null
    );
  }

  function syncDerivedSpliceCatalogFields(nextCatalogItemId: string): void {
    if (nextCatalogItemId.trim().length === 0) {
      setSpliceCatalogItemId("");
      if (splicePortMode === "bounded" && portCount.trim().length === 0) {
        setPortCount("4");
      }
      setSpliceManufacturerReference("");
      setSpliceFormError(null);
      setSpliceFormInfo(null);
      return;
    }

    const catalogItem = store.getState().catalogItems.byId[nextCatalogItemId as CatalogItemId];
    if (catalogItem === undefined) {
      setSpliceCatalogItemId(nextCatalogItemId);
      setSpliceManufacturerReference("");
      setSpliceFormError("Selected catalog item is invalid.");
      setSpliceFormInfo(null);
      return;
    }

    if (spliceFormMode === "edit" && editingSpliceId !== null) {
      if (hasSpliceOccupancyIndexAboveLimit(store, editingSpliceId, catalogItem.connectionCount)) {
        setSpliceFormError("Selected catalog item is incompatible: occupied port indexes exceed the catalog connection count.");
        return;
      }
      if (hasSpliceWireEndpointIndexAboveLimit(store, editingSpliceId, catalogItem.connectionCount)) {
        setSpliceFormError("Selected catalog item is incompatible: wire endpoint port indexes exceed the catalog connection count.");
        return;
      }
    }

    const switchedFromUnbounded = splicePortMode === "unbounded";
    setSpliceCatalogItemId(nextCatalogItemId);
    setSpliceManufacturerReference(catalogItem.manufacturerReference);
    setPortCount(String(catalogItem.connectionCount));
    setSplicePortMode("bounded");
    setSpliceFormError(null);
    setSpliceFormInfo(switchedFromUnbounded ? "Catalog selection switched capacity mode to bounded." : null);
  }

  function resetSpliceForm(): void {
    const state = store.getState();
    setSpliceFormMode("create");
    setEditingSpliceId(null);
    setSpliceName("");
    setSpliceTechnicalId(suggestNextSpliceTechnicalId(Object.values(state.splices.byId).map((splice) => splice.technicalId)));
    setSpliceCatalogItemId("");
    setSplicePortMode("bounded");
    setSpliceManufacturerReference("");
    setSpliceAutoCreateLinkedNode(defaultAutoCreateLinkedNodes);
    setPortCount("4");
    setSpliceFormError(null);
    setSpliceFormInfo(null);
  }

  function clearSpliceForm(): void {
    setSpliceFormMode("idle");
    setEditingSpliceId(null);
    setSpliceName("");
    setSpliceTechnicalId("");
    setSpliceCatalogItemId("");
    setSplicePortMode("bounded");
    setSpliceManufacturerReference("");
    setSpliceAutoCreateLinkedNode(defaultAutoCreateLinkedNodes);
    setPortCount("4");
    setSpliceFormError(null);
    setSpliceFormInfo(null);
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
      setSplicePortMode("bounded");
      syncDerivedSpliceCatalogFields(splice.catalogItemId);
    } else {
      setSpliceCatalogItemId("");
      setSplicePortMode(resolveSplicePortMode(splice));
      setSpliceManufacturerReference(splice.manufacturerReference ?? "");
      setPortCount(String(splice.portCount));
    }
    setSpliceAutoCreateLinkedNode(defaultAutoCreateLinkedNodes);
    setSpliceFormError(null);
    setSpliceFormInfo(null);
    dispatchAction(appActions.select({ kind: "splice", id: splice.id }));
  }

  function handleSpliceSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const trimmedName = spliceName.trim();
    const trimmedTechnicalId = spliceTechnicalId.trim();
    const selectedCatalogItemId = toCatalogItemId(spliceCatalogItemId);
    const selectedCatalogItem = selectedCatalogItemId === null ? undefined : store.getState().catalogItems.byId[selectedCatalogItemId];
    if (selectedCatalogItemId !== null && selectedCatalogItem === undefined) {
      setSpliceFormError("Selected catalog item is invalid.");
      return;
    }

    const normalizedPortMode = selectedCatalogItem === undefined ? normalizeSplicePortMode(splicePortMode) : "bounded";
    const normalizedPortCountRaw =
      selectedCatalogItem !== undefined
        ? selectedCatalogItem.connectionCount
        : Math.max(0, Math.trunc(Number(portCount)));
    if (trimmedName.length === 0 || trimmedTechnicalId.length === 0) {
      setSpliceFormError("Splice name and technical ID are required.");
      return;
    }
    if (normalizedPortMode === "bounded" && (!Number.isInteger(normalizedPortCountRaw) || normalizedPortCountRaw < 1)) {
      setSpliceFormError("Bounded splice port count must be an integer >= 1.");
      return;
    }
    setSpliceFormError(null);
    setSpliceFormInfo(null);

    const wasCreateMode = spliceFormMode === "create";
    const spliceId =
      spliceFormMode === "edit" && editingSpliceId !== null ? editingSpliceId : (createEntityId("splice") as SpliceId);
    const existingSplice =
      spliceFormMode === "edit" && editingSpliceId !== null ? store.getState().splices.byId[editingSpliceId] : undefined;

    const normalizedPortCount =
      normalizedPortMode === "bounded"
        ? normalizedPortCountRaw
        : normalizeUnboundedPortCountFallback(existingSplice?.portCount ?? normalizedPortCountRaw);

    dispatchAction(
      appActions.upsertSplice({
        ...(existingSplice ?? {}),
        id: spliceId,
        name: trimmedName,
        technicalId: trimmedTechnicalId,
        catalogItemId: selectedCatalogItem?.id,
        portMode: normalizedPortMode,
        manufacturerReference:
          selectedCatalogItem?.manufacturerReference ??
          (spliceManufacturerReference.trim().length === 0 ? undefined : spliceManufacturerReference.trim()),
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
    const splice = store.getState().splices.byId[spliceId];
    if (splice === undefined) {
      return;
    }

    void (async () => {
      const shouldDelete = await confirmAction({
        title: "Delete splice",
        message: `Delete splice '${splice.name}' (${splice.technicalId})?`,
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
        intent: "danger"
      });
      if (!shouldDelete) {
        return;
      }

      dispatchAction(appActions.removeSplice(spliceId));
      if (editingSpliceId === spliceId) {
        clearSpliceForm();
      }
    })();
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
    syncDerivedSpliceCatalogFields,
    setSpliceCapacityMode
  };
}
