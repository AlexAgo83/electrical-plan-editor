import { useState, type FormEvent } from "react";
import type { CatalogItemId, Splice, SpliceId } from "../../core/entities";
import {
  DEFAULT_NEW_SPLICE_PORT_MODE,
  normalizeSplicePortMode,
  normalizeUnboundedPortCountFallback,
  resolveSplicePortMode,
  type SplicePortMode
} from "../../core/splicePortMode";
import { appActions } from "../../store";
import { analyzeSpliceDeleteImpact } from "../../store/deleteImpact";
import { createEntityId, focusSelectedTableRowInPanel } from "../lib/app-utils-shared";
import { scrollNetworkPlanIntoView } from "../lib/networkPlanScroll";
import { suggestAutoSpliceNodeId, suggestNextSpliceTechnicalId } from "../lib/technical-id-suggestions";
import { hasSpliceOccupancyIndexAboveLimit, hasSpliceWireEndpointIndexAboveLimit } from "./spliceCapacityGuards";
import { toCatalogItemId, type UseSpliceHandlersParams } from "./spliceHandlerTypes";
import { buildSplicePlacementSuggestion, type PendingSpliceLengthSuggestion } from "./splicePlacementSuggestion";

export type { PendingSpliceLengthSuggestion } from "./splicePlacementSuggestion";


export function useSpliceHandlers({
  store,
  dispatchAction,
  confirmAction,
  notifyToast,
  spliceFormMode,
  setSpliceFormMode,
  spliceEditAfterCreate: _spliceEditAfterCreate,
  setSpliceEditAfterCreate,
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
  spliceSideInverted,
  setSpliceSideInverted,
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
  void _spliceEditAfterCreate;
  const [optimizedLengthSuggestion, setOptimizedLengthSuggestion] = useState<PendingSpliceLengthSuggestion | null>(null);

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
    const nextPortMode = splicePortMode === "directional" ? "directional" : "bounded";
    setSpliceCatalogItemId(nextCatalogItemId);
    setSpliceManufacturerReference(catalogItem.manufacturerReference);
    setPortCount(nextPortMode === "directional" ? "2" : String(catalogItem.connectionCount));
    setSplicePortMode(nextPortMode);
    setSpliceFormError(null);
    setSpliceFormInfo(switchedFromUnbounded ? "Catalog selection switched capacity mode to bounded." : null);
  }

  function resetSpliceForm(): void {
    const state = store.getState();
    setSpliceFormMode("create");
    setSpliceEditAfterCreate(false);
    setEditingSpliceId(null);
    setSpliceName("");
    setSpliceTechnicalId(suggestNextSpliceTechnicalId(Object.values(state.splices.byId).map((splice) => splice.technicalId)));
    setSpliceCatalogItemId("");
    setSplicePortMode(DEFAULT_NEW_SPLICE_PORT_MODE);
    setSpliceSideInverted(false);
    setSpliceManufacturerReference("");
    setSpliceAutoCreateLinkedNode(defaultAutoCreateLinkedNodes);
    setPortCount("4");
    setSpliceFormError(null);
    setSpliceFormInfo(null);
    setOptimizedLengthSuggestion(null);
  }

  function clearSpliceForm(): void {
    setSpliceFormMode("idle");
    setSpliceEditAfterCreate(false);
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
    setOptimizedLengthSuggestion(null);
  }

  function cancelSpliceEdit(): void {
    clearSpliceForm();
    dispatchAction(appActions.clearSelection(), { trackHistory: false });
  }

  function startSpliceEdit(splice: Splice, fromCreate = false): void {
    const resolvedPortMode = resolveSplicePortMode(splice);
    const linkedCatalogItem =
      splice.catalogItemId === undefined ? undefined : store.getState().catalogItems.byId[splice.catalogItemId];

    setSpliceFormMode("edit");
    setSpliceEditAfterCreate(fromCreate);
    setEditingSpliceId(splice.id);
    setSpliceName(splice.name);
    setSpliceTechnicalId(splice.technicalId);
    if (splice.catalogItemId !== undefined && linkedCatalogItem !== undefined) {
      setSpliceCatalogItemId(splice.catalogItemId);
      setSplicePortMode(resolvedPortMode);
      setSpliceManufacturerReference(linkedCatalogItem.manufacturerReference);
      setPortCount(resolvedPortMode === "directional" ? "2" : String(linkedCatalogItem.connectionCount));
    } else {
      setSpliceCatalogItemId("");
      setSplicePortMode(resolvedPortMode);
      setSpliceManufacturerReference(splice.manufacturerReference ?? "");
      setPortCount(String(splice.portCount));
    }
    setSpliceSideInverted(splice.sideInverted === true);
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

    const normalizedPortMode =
      selectedCatalogItem === undefined || splicePortMode === "directional"
        ? normalizeSplicePortMode(splicePortMode)
        : "bounded";
    const normalizedPortCountRaw =
      normalizedPortMode === "directional"
        ? 2
        : selectedCatalogItem !== undefined
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
        sideInverted: spliceSideInverted,
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

        startSpliceEdit(savedSplice, true);
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
      const impact = analyzeSpliceDeleteImpact(store.getState(), spliceId);

      if (impact.kind === "direct") {
        const shouldDelete = await confirmAction({
          title: "Delete splice",
          message: `Delete splice '${splice.name}' (${splice.technicalId})?`,
          confirmLabel: "Delete",
          cancelLabel: "Cancel",
          intent: "danger",
          confirmOnEnter: true
        });
        if (!shouldDelete) {
          return;
        }

        dispatchAction(appActions.removeSplice(spliceId));
        if (editingSpliceId === spliceId) {
          clearSpliceForm();
        }
        return;
      }

      if (impact.kind === "cascade") {
        const shouldCascadeDelete = await confirmAction({
          title: "Cascade delete splice",
          message: impact.message,
          confirmLabel: "Delete all",
          cancelLabel: "Cancel",
          intent: "danger",
          confirmOnEnter: true,
          variant: "deleteCascade",
          summaryCategories: impact.categories,
          summaryNote: impact.note
        });
        if (!shouldCascadeDelete) {
          return;
        }

        dispatchAction(appActions.removeSpliceCascade(spliceId));
        if (editingSpliceId === spliceId) {
          clearSpliceForm();
        }
        return;
      }

      await confirmAction({
        title: "Splice delete blocked",
        message: impact.message,
        confirmLabel: "Close",
        cancelLabel: "Cancel",
        intent: "warning",
        variant: "deleteBlocked",
        summaryCategories: impact.categories,
        summaryNote: impact.note
      });
    })();
  }

  function handleConvertSpliceToDirectional(): void {
    if (spliceFormMode !== "edit" || editingSpliceId === null) {
      return;
    }

    const splice = store.getState().splices.byId[editingSpliceId];
    if (splice === undefined) {
      setSpliceFormError("Cannot convert an unknown splice.");
      return;
    }
    if (resolveSplicePortMode(splice) === "directional") {
      setSpliceFormError(null);
      setSpliceFormInfo("Splice is already directional.");
      return;
    }

    void (async () => {
      const shouldConvert = await confirmAction({
        title: "Convert splice to directional",
        message: `Convert splice '${splice.name}' (${splice.technicalId}) from numeric ports to automatic L/R sides? Existing wire endpoints will be reassigned from routing where possible and old manual port occupancy will be cleared.`,
        confirmLabel: "Convert",
        cancelLabel: "Cancel",
        intent: "warning",
        confirmOnEnter: true
      });
      if (!shouldConvert) {
        return;
      }

      dispatchAction(appActions.convertSpliceToDirectional(splice.id));
      const convertedSplice = store.getState().splices.byId[splice.id];
      if (convertedSplice !== undefined) {
        startSpliceEdit(convertedSplice);
      }
    })();
  }

  function handleRerouteSpliceConnectedWires(): void {
    if (spliceFormMode !== "edit" || editingSpliceId === null) {
      return;
    }

    const splice = store.getState().splices.byId[editingSpliceId];
    if (splice === undefined) {
      setSpliceFormError("Cannot reroute an unknown splice.");
      return;
    }

    dispatchAction(appActions.rerouteSpliceConnectedWires(splice.id));
    const nextError = store.getState().ui.lastError?.message ?? null;
    if (nextError !== null) {
      notifyToast("Reroute failed", { message: nextError, variant: "error" });
    }
    setSpliceFormError(null);
    setSpliceFormInfo(null);
    setOptimizedLengthSuggestion(null);
  }

  function suggestOptimizedSplicePlacement(spliceId: SpliceId): void {
    const result = buildSplicePlacementSuggestion(store, spliceId);
    if (result.kind === "empty") {
      setSpliceFormError(null);
      setSpliceFormInfo(null);
      notifyToast("No optimized lengths", { message: result.reason, variant: "info" });
      return;
    }

    setOptimizedLengthSuggestion(result.suggestion);
    scrollNetworkPlanIntoView();
  }

  function handleSuggestOptimizedSplicePlacement(): void {
    if (spliceFormMode !== "edit" || editingSpliceId === null) {
      return;
    }

    suggestOptimizedSplicePlacement(editingSpliceId);
  }

  function handleSuggestOptimizedSplicePlacementForSplice(spliceId: SpliceId): void {
    suggestOptimizedSplicePlacement(spliceId);
  }

  function applyOptimizedSpliceLengthSuggestion(): void {
    if (optimizedLengthSuggestion === null) {
      return;
    }

    dispatchAction(
      appActions.applyOptimizedSpliceCanvasLayout(
        optimizedLengthSuggestion.spliceId,
        optimizedLengthSuggestion.spliceNodeId,
        optimizedLengthSuggestion.segmentLengths,
        optimizedLengthSuggestion.segments,
        optimizedLengthSuggestion.removedSegmentIds,
        optimizedLengthSuggestion.spliceNodePosition
      )
    );
    const nextError = store.getState().ui.lastError?.message ?? null;
    if (nextError !== null) {
      notifyToast("Optimized lengths failed", { message: nextError, variant: "error" });
      return;
    }
    setOptimizedLengthSuggestion(null);
    setSpliceFormError(null);
    setSpliceFormInfo(null);
  }

  function cancelOptimizedSpliceLengthSuggestion(): void {
    setOptimizedLengthSuggestion(null);
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
    handleConvertSpliceToDirectional,
    handleRerouteSpliceConnectedWires,
    handleSuggestOptimizedSplicePlacement,
    handleSuggestOptimizedSplicePlacementForSplice,
    optimizedLengthSuggestion,
    applyOptimizedSpliceLengthSuggestion,
    cancelOptimizedSpliceLengthSuggestion,
    handleReservePort,
    handleReleasePort,
    syncDerivedSpliceCatalogFields,
    setSpliceCapacityMode
  };
}
