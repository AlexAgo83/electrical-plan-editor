import type { FormEvent } from "react";
import type { NodeId, Segment, SegmentId } from "../../core/entities";
import type { AppStore } from "../../store";
import { appActions } from "../../store";
import { focusSelectedTableRowInPanel, toPositiveNumber } from "../lib/app-utils-shared";
import { suggestNextSegmentId } from "../lib/technical-id-suggestions";
import type { ConfirmDialogRequest } from "../types/confirm-dialog";

type DispatchAction = (
  action: Parameters<AppStore["dispatch"]>[0],
  options?: {
    trackHistory?: boolean;
  }
) => void;

interface UseSegmentHandlersParams {
  store: AppStore;
  state: ReturnType<AppStore["getState"]>;
  dispatchAction: DispatchAction;
  confirmAction: (request: ConfirmDialogRequest) => Promise<boolean>;
  segmentFormMode: "idle" | "create" | "edit";
  setSegmentFormMode: (mode: "idle" | "create" | "edit") => void;
  editingSegmentId: SegmentId | null;
  setEditingSegmentId: (id: SegmentId | null) => void;
  segmentIdInput: string;
  setSegmentIdInput: (value: string) => void;
  segmentNodeA: string;
  setSegmentNodeA: (value: string) => void;
  segmentNodeB: string;
  setSegmentNodeB: (value: string) => void;
  segmentLengthMm: string;
  setSegmentLengthMm: (value: string) => void;
  segmentSubNetworkTag: string;
  setSegmentSubNetworkTag: (value: string) => void;
  setSegmentFormError: (value: string | null) => void;
}

export function useSegmentHandlers({
  store,
  state,
  dispatchAction,
  confirmAction,
  segmentFormMode,
  setSegmentFormMode,
  editingSegmentId,
  setEditingSegmentId,
  segmentIdInput,
  setSegmentIdInput,
  segmentNodeA,
  setSegmentNodeA,
  segmentNodeB,
  setSegmentNodeB,
  segmentLengthMm,
  setSegmentLengthMm,
  segmentSubNetworkTag,
  setSegmentSubNetworkTag,
  setSegmentFormError
}: UseSegmentHandlersParams) {
  function resetSegmentForm(): void {
    const nextState = store.getState();
    setSegmentFormMode("create");
    setEditingSegmentId(null);
    setSegmentIdInput(suggestNextSegmentId(nextState.segments.allIds));
    setSegmentNodeA("");
    setSegmentNodeB("");
    setSegmentLengthMm("120");
    setSegmentSubNetworkTag("");
    setSegmentFormError(null);
  }

  function clearSegmentForm(): void {
    setSegmentFormMode("idle");
    setEditingSegmentId(null);
    setSegmentIdInput("");
    setSegmentNodeA("");
    setSegmentNodeB("");
    setSegmentLengthMm("120");
    setSegmentSubNetworkTag("");
    setSegmentFormError(null);
  }

  function cancelSegmentEdit(): void {
    clearSegmentForm();
    dispatchAction(appActions.clearSelection(), { trackHistory: false });
  }

  function handleSwapSegmentNodes(): void {
    if (segmentFormMode !== "edit") {
      return;
    }

    const nextNodeA = segmentNodeB;
    const nextNodeB = segmentNodeA;
    setSegmentNodeA(nextNodeA);
    setSegmentNodeB(nextNodeB);
    setSegmentFormError(null);
  }

  function startSegmentEdit(segment: Segment): void {
    setSegmentFormMode("edit");
    setEditingSegmentId(segment.id);
    setSegmentIdInput(segment.id);
    setSegmentNodeA(segment.nodeA);
    setSegmentNodeB(segment.nodeB);
    setSegmentLengthMm(String(segment.lengthMm));
    setSegmentSubNetworkTag(segment.subNetworkTag ?? "");
    dispatchAction(appActions.select({ kind: "segment", id: segment.id }));
  }

  function handleSegmentSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const wasCreateMode = segmentFormMode === "create";
    const normalizedSegmentId = segmentIdInput.trim();
    let segmentId = (segmentFormMode === "edit" && editingSegmentId !== null
      ? editingSegmentId
      : normalizedSegmentId) as SegmentId;

    if (normalizedSegmentId.length === 0) {
      setSegmentFormError("Segment ID is required.");
      return;
    }

    if (segmentFormMode === "create") {
      if (state.segments.byId[segmentId] !== undefined) {
        setSegmentFormError(`Segment ID '${normalizedSegmentId}' already exists.`);
        return;
      }
    }

    if (segmentFormMode === "edit" && editingSegmentId !== null && normalizedSegmentId !== editingSegmentId) {
      if (state.segments.byId[normalizedSegmentId as SegmentId] !== undefined) {
        setSegmentFormError(`Segment ID '${normalizedSegmentId}' already exists.`);
        return;
      }
    }

    if (segmentNodeA.length === 0 || segmentNodeB.length === 0) {
      setSegmentFormError("Both segment endpoints are required.");
      return;
    }

    const lengthMm = toPositiveNumber(segmentLengthMm);
    if (lengthMm < 1) {
      setSegmentFormError("Segment length must be >= 1 mm.");
      return;
    }

    setSegmentFormError(null);

    if (segmentFormMode === "edit" && editingSegmentId !== null && normalizedSegmentId !== editingSegmentId) {
      dispatchAction(appActions.renameSegment(editingSegmentId, normalizedSegmentId as SegmentId));
      const stateAfterRename = store.getState();
      if (stateAfterRename.ui.lastError !== null) {
        setSegmentFormError(stateAfterRename.ui.lastError);
        return;
      }
      segmentId = normalizedSegmentId as SegmentId;
      setEditingSegmentId(segmentId);
    }

    dispatchAction(
      appActions.upsertSegment({
        id: segmentId,
        nodeA: segmentNodeA as NodeId,
        nodeB: segmentNodeB as NodeId,
        lengthMm,
        subNetworkTag: segmentSubNetworkTag
      })
    );

    const nextState = store.getState();
    const savedSegment = nextState.segments.byId[segmentId];
    if (savedSegment !== undefined) {
      if (wasCreateMode) {
        startSegmentEdit(savedSegment);
        return;
      }
      startSegmentEdit(savedSegment);
      focusSelectedTableRowInPanel('[data-onboarding-panel="modeling-segments"]');
    }
  }

  function handleSegmentDelete(segmentId: SegmentId): void {
    const segment = store.getState().segments.byId[segmentId];
    if (segment === undefined) {
      return;
    }

    void (async () => {
      const shouldDelete = await confirmAction({
        title: "Delete segment",
        message: `Delete segment '${segment.id}' (${segment.nodeA} -> ${segment.nodeB})?`,
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
        intent: "danger"
      });
      if (!shouldDelete) {
        return;
      }

      dispatchAction(appActions.removeSegment(segmentId));
      if (editingSegmentId === segmentId) {
        clearSegmentForm();
      }
    })();
  }

  return {
    resetSegmentForm,
    clearSegmentForm,
    cancelSegmentEdit,
    handleSwapSegmentNodes,
    startSegmentEdit,
    handleSegmentSubmit,
    handleSegmentDelete
  };
}
