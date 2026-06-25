import { type FormEvent } from "react";
import type { CatalogItemId, Splice, SpliceId, SplicePlacement } from "../../core/entities";
import {
  DEFAULT_NEW_SPLICE_PORT_MODE,
  normalizeSplicePortMode,
  normalizeUnboundedPortCountFallback,
  resolveSplicePortMode,
  type SplicePortMode
} from "../../core/splicePortMode";
import { appActions, selectActiveNetwork } from "../../store";
import { analyzeSpliceDeleteImpact } from "../../store/deleteImpact";
import { createEntityId, focusSelectedTableRowInPanel } from "../lib/app-utils-shared";
import { suggestNextSpliceTechnicalId } from "../lib/technical-id-suggestions";
import { hasSpliceOccupancyIndexAboveLimit, hasSpliceWireEndpointIndexAboveLimit } from "./spliceCapacityGuards";
import { toCatalogItemId, toNodeId, toSegmentId, type UseSpliceHandlersParams } from "./spliceHandlerTypes";
import { useSpliceOptimizedPlacementSuggestion } from "./useSpliceOptimizedPlacementSuggestion";
import { useSplicePortReservation } from "./useSplicePortReservation";

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
  setSpliceAutoCreateLinkedNode,
  splicePlacementSegmentId,
  setSplicePlacementSegmentId,
  splicePlacementFromNodeId,
  setSplicePlacementFromNodeId,
  splicePlacementOffsetMm,
  setSplicePlacementOffsetMm,
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
  const {
    optimizedLengthSuggestion,
    handleSuggestOptimizedSplicePlacement,
    handleSuggestOptimizedSplicePlacementForSplice,
    applyOptimizedSpliceLengthSuggestion,
    cancelOptimizedSpliceLengthSuggestion,
    clearOptimizedLengthSuggestion
  } = useSpliceOptimizedPlacementSuggestion({ store, dispatchAction, notifyToast, spliceFormMode, editingSpliceId, setSpliceFormError, setSpliceFormInfo });
  const { handleReservePort, handleReleasePort } = useSplicePortReservation({ dispatchAction, selectedSpliceId, portIndexInput, spliceOccupantRefInput });

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
    setSpliceTechnicalId(
      suggestNextSpliceTechnicalId(
        Object.values(state.splices.byId).map((splice) => splice.technicalId),
        selectActiveNetwork(state)?.entityPrefix
      )
    );
    setSpliceCatalogItemId("");
    setSplicePortMode(DEFAULT_NEW_SPLICE_PORT_MODE);
    setSpliceSideInverted(false);
    setSpliceManufacturerReference("");
    setSpliceAutoCreateLinkedNode(defaultAutoCreateLinkedNodes);
    setSplicePlacementSegmentId("");
    setSplicePlacementFromNodeId("");
    setSplicePlacementOffsetMm("0");
    setPortCount("4");
    setSpliceFormError(null);
    setSpliceFormInfo(null);
    clearOptimizedLengthSuggestion();
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
    setSplicePlacementSegmentId("");
    setSplicePlacementFromNodeId("");
    setSplicePlacementOffsetMm("0");
    setPortCount("4");
    setSpliceFormError(null);
    setSpliceFormInfo(null);
    clearOptimizedLengthSuggestion();
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
    setSplicePlacementSegmentId(splice.placement?.segmentId ?? "");
    setSplicePlacementFromNodeId(splice.placement?.fromNodeId ?? "");
    setSplicePlacementOffsetMm(
      splice.placement === undefined ? "0" : String(splice.placement.offsetMm)
    );
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
    const selectedPlacementSegmentId = toSegmentId(splicePlacementSegmentId);
    const selectedPlacementFromNodeId = toNodeId(splicePlacementFromNodeId);
    let nextPlacement: SplicePlacement | undefined;
    if (selectedPlacementSegmentId !== null) {
      const hostSegment = store.getState().segments.byId[selectedPlacementSegmentId];
      if (hostSegment === undefined) {
        setSpliceFormError("Selected splice host segment is invalid.");
        return;
      }
      if (selectedPlacementFromNodeId === null) {
        setSpliceFormError("Select a reference node for the splice placement.");
        return;
      }
      if (
        selectedPlacementFromNodeId !== hostSegment.nodeA &&
        selectedPlacementFromNodeId !== hostSegment.nodeB
      ) {
        setSpliceFormError("Splice reference node must be one endpoint of the host segment.");
        return;
      }
      const offsetMm = Number(splicePlacementOffsetMm);
      if (!Number.isFinite(offsetMm) || offsetMm < 0) {
        setSpliceFormError("Splice placement offset must be a finite value >= 0 mm.");
        return;
      }
      nextPlacement = {
        kind: "segmentOffset",
        segmentId: selectedPlacementSegmentId,
        fromNodeId: selectedPlacementFromNodeId,
        offsetMm
      };
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
        placement: nextPlacement,
        manufacturerReference:
          selectedCatalogItem?.manufacturerReference ??
          (spliceManufacturerReference.trim().length === 0 ? undefined : spliceManufacturerReference.trim()),
        portCount: normalizedPortCount
      })
    );

    const nextState = store.getState();
    const nextError = nextState.ui.lastError?.message ?? null;
    if (nextError !== null) {
      setSpliceFormError(nextError);
      return;
    }
    const savedSplice = nextState.splices.byId[spliceId];
    if (savedSplice !== undefined) {
      if (wasCreateMode) {
        // Floating splices are placed via segment-offset placement (ADR-012) and must never
        // create a structural splice node: a node-less placement is the canonical model, and a
        // persisted splice node would hide the splice in Network Summary (the floating-splice
        // overlay filters out any splice that owns a splice node).
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
    clearOptimizedLengthSuggestion();
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
