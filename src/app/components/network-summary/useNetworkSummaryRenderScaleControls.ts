import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { NodePosition } from "../../types/app-controller";

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

interface UseNetworkSummaryRenderScaleControlsParams {
  effectiveScale: number;
  globalRenderScalePercent: number;
  networkViewWidth: number;
  networkViewHeight: number;
  setGlobalRenderScalePercent: (value: number) => void;
  setNetworkOffset: Dispatch<SetStateAction<NodePosition>>;
}

export function useNetworkSummaryRenderScaleControls({
  effectiveScale,
  globalRenderScalePercent,
  networkViewWidth,
  networkViewHeight,
  setGlobalRenderScalePercent,
  setNetworkOffset
}: UseNetworkSummaryRenderScaleControlsParams) {
  return useCallback(
    (value: number) => {
      const nextPercent = clampNumber(Math.round(value), 0, 300);
      const currentPercent = clampNumber(globalRenderScalePercent, 0, 300);
      if (nextPercent === currentPercent) {
        return;
      }

      const viewCenterX = networkViewWidth / 2;
      const viewCenterY = networkViewHeight / 2;
      const currentEffectiveRenderScale = effectiveScale * (1 + currentPercent / 100);
      const nextEffectiveRenderScale = effectiveScale * (1 + nextPercent / 100);

      setNetworkOffset((currentOffset) => {
        const centerModelX = (viewCenterX - currentOffset.x) / currentEffectiveRenderScale;
        const centerModelY = (viewCenterY - currentOffset.y) / currentEffectiveRenderScale;
        return {
          x: viewCenterX - centerModelX * nextEffectiveRenderScale,
          y: viewCenterY - centerModelY * nextEffectiveRenderScale
        };
      });
      setGlobalRenderScalePercent(nextPercent);
    },
    [effectiveScale, globalRenderScalePercent, networkViewHeight, networkViewWidth, setGlobalRenderScalePercent, setNetworkOffset]
  );
}
