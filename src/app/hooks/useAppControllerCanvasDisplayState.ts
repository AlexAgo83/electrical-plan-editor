import { useState } from "react";
import type {
  CanvasCalloutTextSize,
  CanvasLabelRotationDegrees,
  CanvasLabelSizeMode,
  CanvasLabelStrokeMode
} from "../types/app-controller";

export function useAppControllerCanvasDisplayState() {
  const [routePreviewStartNodeId, setRoutePreviewStartNodeId] = useState("");
  const [routePreviewEndNodeId, setRoutePreviewEndNodeId] = useState("");
  const [showNetworkInfoPanels, setShowNetworkInfoPanels] = useState(true);
  const [showSegmentLengths, setShowSegmentLengths] = useState(false);
  const [showCableCallouts, setShowCableCallouts] = useState(false);
  const [networkLabelStrokeMode, setNetworkLabelStrokeMode] = useState<CanvasLabelStrokeMode>("normal");
  const [networkLabelSizeMode, setNetworkLabelSizeMode] = useState<CanvasLabelSizeMode>("normal");
  const [networkCalloutTextSize, setNetworkCalloutTextSize] = useState<CanvasCalloutTextSize>("normal");
  const [networkLabelRotationDegrees, setNetworkLabelRotationDegrees] = useState<CanvasLabelRotationDegrees>(0);
  const [networkAutoSegmentLabelRotation, setNetworkAutoSegmentLabelRotation] = useState(false);
  const [canvasResetZoomPercentInput, setCanvasResetZoomPercentInput] = useState("60");

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
    networkCalloutTextSize,
    setNetworkCalloutTextSize,
    networkLabelRotationDegrees,
    setNetworkLabelRotationDegrees,
    networkAutoSegmentLabelRotation,
    setNetworkAutoSegmentLabelRotation,
    canvasResetZoomPercentInput,
    setCanvasResetZoomPercentInput
  };
}

export type AppControllerCanvasDisplayStateModel = ReturnType<typeof useAppControllerCanvasDisplayState>;
