import { useState } from "react";
import type { CanvasLabelStrokeMode } from "../types/app-controller";

export function useAppControllerCanvasDisplayState() {
  const [routePreviewStartNodeId, setRoutePreviewStartNodeId] = useState("");
  const [routePreviewEndNodeId, setRoutePreviewEndNodeId] = useState("");
  const [showNetworkInfoPanels, setShowNetworkInfoPanels] = useState(true);
  const [showSegmentLengths, setShowSegmentLengths] = useState(false);
  const [networkLabelStrokeMode, setNetworkLabelStrokeMode] = useState<CanvasLabelStrokeMode>("normal");
  const [canvasResetZoomPercentInput, setCanvasResetZoomPercentInput] = useState("100");

  return {
    routePreviewStartNodeId,
    setRoutePreviewStartNodeId,
    routePreviewEndNodeId,
    setRoutePreviewEndNodeId,
    showNetworkInfoPanels,
    setShowNetworkInfoPanels,
    showSegmentLengths,
    setShowSegmentLengths,
    networkLabelStrokeMode,
    setNetworkLabelStrokeMode,
    canvasResetZoomPercentInput,
    setCanvasResetZoomPercentInput
  };
}

