import type { FormEvent } from "react";
import type { NodeId, Segment, SegmentId } from "../../core/entities";
import type { AppStore } from "../../store";
import { appActions } from "../../store";
import { toPositiveNumber } from "../lib/app-utils";

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
    setSegmentFormMode("create");
    setEditingSegmentId(null);
    setSegmentIdInput("");
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

    const normalizedSegmentId = segmentIdInput.trim();
    const segmentId = (segmentFormMode === "edit" && editingSegmentId !== null
      ? editingSegmentId
      : normalizedSegmentId) as SegmentId;

    if (segmentFormMode === "create") {
      if (normalizedSegmentId.length === 0) {
        setSegmentFormError("Segment ID is required.");
        return;
      }

      if (state.segments.byId[segmentId] !== undefined) {
        setSegmentFormError(`Segment ID '${normalizedSegmentId}' already exists.`);
        return;
      }
    }

    if (segmentNodeA.length === 0 || segmentNodeB.length === 0) {
      setSegmentFormError("Both segment endpoints are required.");
      return;
    }

    const lengthMm = toPositiveNumber(segmentLengthMm);
    if (lengthMm <= 0) {
      setSegmentFormError("Segment length must be > 0.");
      return;
    }

    setSegmentFormError(null);

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
    if (nextState.segments.byId[segmentId] !== undefined) {
      dispatchAction(appActions.select({ kind: "segment", id: segmentId }));
      resetSegmentForm();
    }
  }

  function handleSegmentDelete(segmentId: SegmentId): void {
    dispatchAction(appActions.removeSegment(segmentId));

    if (editingSegmentId === segmentId) {
      clearSegmentForm();
    }
  }

  return {
    resetSegmentForm,
    clearSegmentForm,
    cancelSegmentEdit,
    startSegmentEdit,
    handleSegmentSubmit,
    handleSegmentDelete
  };
}
