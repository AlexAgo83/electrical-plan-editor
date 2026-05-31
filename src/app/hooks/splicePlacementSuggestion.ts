import type { NodeId, Segment, SegmentId, SpliceId } from "../../core/entities";
import type { AppStore } from "../../store";
import { findSplicePlacementSuggestion } from "../../store/splicePlacementOptimizer";
import type { SpliceLengthSuggestionPanelModel } from "../components/SpliceLengthSuggestionPanel";

export type PendingSpliceLengthSuggestion = SpliceLengthSuggestionPanelModel & {
  spliceId: SpliceId;
  spliceNodeId: NodeId;
  segmentLengths: Record<SegmentId, number>;
  segments: Record<SegmentId, Segment>;
  removedSegmentIds: SegmentId[];
  spliceNodePosition: { x: number; y: number } | null;
};

export type SplicePlacementSuggestionResult =
  | {
      kind: "suggestion";
      suggestion: PendingSpliceLengthSuggestion;
    }
  | {
      kind: "empty";
      reason: string;
    };

function formatVolume(value: number): string {
  return `${Math.round(value).toLocaleString("en-US")} mm3`;
}

function formatPercent(value: number | null): string {
  return value === null ? "n/a" : `${Math.round(value)}%`;
}

function formatBalance(left: number, right: number, ratio: number | null): string {
  return `L ${left.toFixed(2)} mm2 / R ${right.toFixed(2)} mm2 (${formatPercent(ratio)})`;
}

export function buildSplicePlacementSuggestion(store: AppStore, spliceId: SpliceId): SplicePlacementSuggestionResult {
  const result = findSplicePlacementSuggestion(store.getState(), spliceId);
  if (!("suggestion" in result)) {
    return {
      kind: "empty",
      reason: result.reason
    };
  }

  const { suggestion } = result;
  const suggestedSplice = store.getState().splices.byId[suggestion.spliceId];
  const spliceSummary =
    suggestedSplice === undefined
      ? String(suggestion.spliceId)
      : `${suggestedSplice.technicalId} - ${suggestedSplice.name}`;
  const comparisonDetails = [
    "Copper volume",
    `Current:   ${formatVolume(suggestion.current.copperVolumeMm3)}`,
    `Suggested: ${formatVolume(suggestion.suggested.copperVolumeMm3)}`,
    `Change:    ${suggestion.copperVolumeDeltaPercent.toFixed(1)}%`,
    "",
    "Section balance",
    `Current:   ${formatBalance(
      suggestion.current.leftSectionMm2,
      suggestion.current.rightSectionMm2,
      suggestion.current.balanceRatioPercent
    )}`,
    `Suggested: ${formatBalance(
      suggestion.suggested.leftSectionMm2,
      suggestion.suggested.rightSectionMm2,
      suggestion.suggested.balanceRatioPercent
    )}`,
    `Limit:     ${Math.round(suggestion.balanceLimitPercent)}%`
  ].join("\n");

  return {
    kind: "suggestion",
    suggestion: {
      spliceId: suggestion.spliceId,
      spliceNodeId: suggestion.spliceNodeId,
      segmentLengths: suggestion.segmentLengths,
      segments: suggestion.segments,
      removedSegmentIds: suggestion.removedSegmentIds,
      spliceNodePosition: suggestion.spliceNodePosition,
      spliceSummary,
      message:
        suggestion.warning ??
        `Review the optimized splice placement on segment ${suggestion.targetSegmentId} before applying it.`,
      comparisonDetails,
      hasWarning: suggestion.warning !== null
    }
  };
}
