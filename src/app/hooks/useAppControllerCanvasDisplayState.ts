import { useState } from "react";
import type { CanvasLabelRotationDegrees, CanvasLabelSizeMode, CanvasLabelStrokeMode } from "../types/app-controller";

export function useAppControllerCanvasDisplayState() {
  const [routePreviewStartNodeId, setRoutePreviewStartNodeId] = useState("");
  const [routePreviewEndNodeId, setRoutePreviewEndNodeId] = useState("");
  const [showNetworkInfoPanels, setShowNetworkInfoPanels] = useState(true);
  const [showSegmentLengths, setShowSegmentLengths] = useState(false);
  const [showCableCallouts, setShowCableCallouts] = useState(false);
  const [networkLabelStrokeMode, setNetworkLabelStrokeMode] = useState<CanvasLabelStrokeMode>("normal");
  const [networkLabelSizeMode, setNetworkLabelSizeMode] = useState<CanvasLabelSizeMode>("normal");
  const [networkLabelRotationDegrees, setNetworkLabelRotationDegrees] = useState<CanvasLabelRotationDegrees>(0);
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
    showCableCallouts,
    setShowCableCallouts,
    networkLabelStrokeMode,
    setNetworkLabelStrokeMode,
    networkLabelSizeMode,
    setNetworkLabelSizeMode,
    networkLabelRotationDegrees,
    setNetworkLabelRotationDegrees,
    canvasResetZoomPercentInput,
    setCanvasResetZoomPercentInput
  };
}

export type AppControllerCanvasDisplayStateModel = ReturnType<typeof useAppControllerCanvasDisplayState>;
