import { useState } from "react";
import type { AppStore } from "../../store";
import type { SpliceId } from "../../core/entities";
import { appActions } from "../../store";
import { scrollNetworkPlanIntoView } from "../lib/networkPlanScroll";
import type { DispatchAction, NotifyToast } from "./spliceHandlerTypes";
import { buildSplicePlacementSuggestion, type PendingSpliceLengthSuggestion } from "./splicePlacementSuggestion";

export interface UseSpliceOptimizedPlacementSuggestionParams {
  store: AppStore;
  dispatchAction: DispatchAction;
  notifyToast: NotifyToast;
  spliceFormMode: "idle" | "create" | "edit";
  editingSpliceId: SpliceId | null;
  setSpliceFormError: (value: string | null) => void;
  setSpliceFormInfo: (value: string | null) => void;
}

export interface SpliceOptimizedPlacementSuggestion {
  optimizedLengthSuggestion: PendingSpliceLengthSuggestion | null;
  handleSuggestOptimizedSplicePlacement: () => void;
  handleSuggestOptimizedSplicePlacementForSplice: (spliceId: SpliceId) => void;
  applyOptimizedSpliceLengthSuggestion: () => void;
  cancelOptimizedSpliceLengthSuggestion: () => void;
  clearOptimizedLengthSuggestion: () => void;
}

/**
 * Owns the optimized splice length/placement suggestion sub-feature: it tracks
 * the pending suggestion, requests one for the edited or an arbitrary splice,
 * applies it as an optimized canvas layout, and exposes a clear entry point so
 * the splice form lifecycle (reset/clear/reroute) can dismiss a stale suggestion.
 */
export function useSpliceOptimizedPlacementSuggestion({
  store,
  dispatchAction,
  notifyToast,
  spliceFormMode,
  editingSpliceId,
  setSpliceFormError,
  setSpliceFormInfo
}: UseSpliceOptimizedPlacementSuggestionParams): SpliceOptimizedPlacementSuggestion {
  const [optimizedLengthSuggestion, setOptimizedLengthSuggestion] = useState<PendingSpliceLengthSuggestion | null>(null);

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

  function clearOptimizedLengthSuggestion(): void {
    setOptimizedLengthSuggestion(null);
  }

  return {
    optimizedLengthSuggestion,
    handleSuggestOptimizedSplicePlacement,
    handleSuggestOptimizedSplicePlacementForSplice,
    applyOptimizedSpliceLengthSuggestion,
    cancelOptimizedSpliceLengthSuggestion,
    clearOptimizedLengthSuggestion
  };
}
