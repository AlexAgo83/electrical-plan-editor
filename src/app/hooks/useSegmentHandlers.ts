import { translateCurrent as t } from "../lib/i18n";
import type { FormEvent } from "react";
import type { MountingLabel, NodeId, Segment, SegmentId } from "../../core/entities";
import type { AppStore } from "../../store";
import { appActions, getAppErrorMessage, selectActiveNetwork } from "../../store";
import { analyzeSegmentDeleteImpact } from "../../store/deleteImpact";
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
  segmentEditAfterCreate: boolean;
  setSegmentEditAfterCreate: (value: boolean) => void;
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
  segmentSheathType: string;
  setSegmentSheathType: (value: string) => void;
  segmentInsulation: string;
  setSegmentInsulation: (value: string) => void;
  segmentLineStyle: string;
  setSegmentLineStyle: (value: string) => void;
  segmentInternalPartReference: string;
  setSegmentInternalPartReference: (value: string) => void;
  segmentMountingLabelsText: string;
  setSegmentMountingLabelsText: (value: string) => void;
  setSegmentFormError: (value: string | null) => void;
}

function formatMountingLabelsText(segment: Segment): string {
  return (segment.mountingLabels ?? [])
    .map((label) => [label.id, label.text, label.positionRatio, label.offsetX, label.offsetY].join(","))
    .join("\n");
}

function parseMountingLabelsText(value: string): Segment["mountingLabels"] | { error: string } | undefined {
  const lines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length === 0) {
    return undefined;
  }
  const labels: MountingLabel[] = [];
  for (const line of lines) {
    const [id = "", text = "", positionRatioRaw = "0.5", offsetXRaw = "0", offsetYRaw = "0"] = line.split(",").map((part) => part.trim());
    const positionRatio = Number(positionRatioRaw.replace(",", "."));
    const offsetX = Number(offsetXRaw.replace(",", "."));
    const offsetY = Number(offsetYRaw.replace(",", "."));
    if (
      id.length === 0 ||
      text.length === 0 ||
      !Number.isFinite(positionRatio) ||
      !Number.isFinite(offsetX) ||
      !Number.isFinite(offsetY)
    ) {
      return { error: "Mounting labels must use one line per label: id,text,positionRatio,offsetX,offsetY." };
    }
    labels.push({
      id: id as MountingLabel["id"],
      text,
      positionRatio,
      offsetX,
      offsetY
    });
  }
  return labels;
}

export function useSegmentHandlers({
  store,
  state,
  dispatchAction,
  confirmAction,
  segmentFormMode,
  setSegmentFormMode,
  segmentEditAfterCreate: _segmentEditAfterCreate,
  setSegmentEditAfterCreate,
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
  segmentSheathType,
  setSegmentSheathType,
  segmentInsulation,
  setSegmentInsulation,
  segmentLineStyle,
  setSegmentLineStyle,
  segmentInternalPartReference,
  setSegmentInternalPartReference,
  segmentMountingLabelsText,
  setSegmentMountingLabelsText,
  setSegmentFormError
}: UseSegmentHandlersParams) {
  void _segmentEditAfterCreate;

  function resetSegmentForm(): void {
    const nextState = store.getState();
    setSegmentFormMode("create");
    setSegmentEditAfterCreate(false);
    setEditingSegmentId(null);
    setSegmentIdInput(suggestNextSegmentId(nextState.segments.allIds, selectActiveNetwork(nextState)?.entityPrefix));
    setSegmentNodeA("");
    setSegmentNodeB("");
    setSegmentLengthMm("120");
    setSegmentSubNetworkTag("");
    setSegmentSheathType("");
    setSegmentInsulation("");
    setSegmentLineStyle("");
    setSegmentInternalPartReference("");
    setSegmentMountingLabelsText("");
    setSegmentFormError(null);
  }

  function clearSegmentForm(): void {
    setSegmentFormMode("idle");
    setSegmentEditAfterCreate(false);
    setEditingSegmentId(null);
    setSegmentIdInput("");
    setSegmentNodeA("");
    setSegmentNodeB("");
    setSegmentLengthMm("120");
    setSegmentSubNetworkTag("");
    setSegmentSheathType("");
    setSegmentInsulation("");
    setSegmentLineStyle("");
    setSegmentInternalPartReference("");
    setSegmentMountingLabelsText("");
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

  function startSegmentEdit(segment: Segment, fromCreate = false): void {
    setSegmentFormMode("edit");
    setSegmentEditAfterCreate(fromCreate);
    setEditingSegmentId(segment.id);
    setSegmentIdInput(segment.id);
    setSegmentNodeA(segment.nodeA);
    setSegmentNodeB(segment.nodeB);
    setSegmentLengthMm(String(segment.lengthMm));
    setSegmentSubNetworkTag(segment.subNetworkTag ?? "");
    setSegmentSheathType(segment.sheathType ?? "");
    setSegmentInsulation(segment.insulation ?? "");
    setSegmentLineStyle(segment.lineStyle ?? "");
    setSegmentInternalPartReference(segment.internalPartReference ?? "");
    setSegmentMountingLabelsText(formatMountingLabelsText(segment));
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
      setSegmentFormError(t("ui.segmentIDIsRequired"));
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
      setSegmentFormError(t("ui.bothSegmentEndpointsAreRequired"));
      return;
    }

    const lengthMm = toPositiveNumber(segmentLengthMm);
    if (lengthMm < 1) {
      setSegmentFormError(t("ui.segmentLengthMustBe1Mm"));
      return;
    }
    const mountingLabels = parseMountingLabelsText(segmentMountingLabelsText);
    if (mountingLabels !== undefined && "error" in mountingLabels) {
      setSegmentFormError(mountingLabels.error);
      return;
    }

    setSegmentFormError(null);

    if (segmentFormMode === "edit" && editingSegmentId !== null && normalizedSegmentId !== editingSegmentId) {
      dispatchAction(appActions.renameSegment(editingSegmentId, normalizedSegmentId as SegmentId));
      const stateAfterRename = store.getState();
      if (stateAfterRename.ui.lastError !== null) {
        setSegmentFormError(getAppErrorMessage(stateAfterRename.ui.lastError));
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
        subNetworkTag: segmentSubNetworkTag,
        sheathType: segmentSheathType,
        insulation: segmentInsulation,
        lineStyle: segmentLineStyle,
        internalPartReference: segmentInternalPartReference,
        mountingLabels
      })
    );

    const nextState = store.getState();
    const savedSegment = nextState.segments.byId[segmentId];
    if (savedSegment !== undefined) {
      if (wasCreateMode) {
        startSegmentEdit(savedSegment, true);
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
      const impact = analyzeSegmentDeleteImpact(store.getState(), segmentId);

      if (impact.kind === "direct") {
        const shouldDelete = await confirmAction({
          title: t("ui.deleteSegment"),
          message: `Delete segment '${segment.id}' (${segment.nodeA} -> ${segment.nodeB})?`,
          confirmLabel: t("ui.delete"),
          cancelLabel: t("ui.cancel"),
          intent: "danger",
          confirmOnEnter: true
        });
        if (!shouldDelete) {
          return;
        }

        dispatchAction(appActions.removeSegment(segmentId));
        if (editingSegmentId === segmentId) {
          clearSegmentForm();
        }
        return;
      }

      await confirmAction({
        title: "Segment delete blocked",
        message: impact.message,
        confirmLabel: t("ui.close"),
        cancelLabel: t("ui.cancel"),
        intent: "warning",
        variant: "deleteBlocked",
        summaryCategories: impact.categories,
        summaryNote: impact.note
      });
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
