import { useCallback, useState } from "react";
import type { CanvasResizeBehaviorMode } from "../../types/app-controller";
import { NETWORK_VIEW_HEIGHT, NETWORK_VIEW_WIDTH } from "../../lib/app-utils-shared";

interface NetworkViewportSize {
  width: number;
  height: number;
}

interface UseAppControllerNetworkViewportStateParams {
  canvasResizeBehaviorMode: CanvasResizeBehaviorMode;
}

export function useAppControllerNetworkViewportState({
  canvasResizeBehaviorMode
}: UseAppControllerNetworkViewportStateParams) {
  const [networkViewportSize, setNetworkViewportSize] = useState<NetworkViewportSize>({
    width: NETWORK_VIEW_WIDTH,
    height: NETWORK_VIEW_HEIGHT
  });

  const effectiveNetworkViewWidth =
    canvasResizeBehaviorMode === "visibleAreaOnly" ? networkViewportSize.width : NETWORK_VIEW_WIDTH;
  const effectiveNetworkViewHeight =
    canvasResizeBehaviorMode === "visibleAreaOnly" ? networkViewportSize.height : NETWORK_VIEW_HEIGHT;

  const handleNetworkSummaryViewportSizeChange = useCallback((viewportSize: NetworkViewportSize) => {
    setNetworkViewportSize((current) => {
      if (
        Math.abs(current.width - viewportSize.width) <= 0.0001 &&
        Math.abs(current.height - viewportSize.height) <= 0.0001
      ) {
        return current;
      }
      return viewportSize;
    });
  }, []);

  return {
    effectiveNetworkViewWidth,
    effectiveNetworkViewHeight,
    handleNetworkSummaryViewportSizeChange
  };
}
