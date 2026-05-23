import { useState } from "react";
import type {
  CanvasCalloutTextSize,
  CanvasLabelRotationDegrees,
  CanvasLabelSizeMode,
  CanvasLabelStrokeMode,
  NetworkCalloutContentMode
} from "../types/app-controller";

export function useAppControllerCanvasDisplayState() {
  const [routePreviewStartNodeId, setRoutePreviewStartNodeId] = useState("");
  const [routePreviewEndNodeId, setRoutePreviewEndNodeId] = useState("");
  const [showNetworkInfoPanels, setShowNetworkInfoPanels] = useState(true);
  const [showSegmentNames, setShowSegmentNames] = useState(false);
  const [showSegmentLengths, setShowSegmentLengths] = useState(true);
  const [showCableCallouts, setShowCableCallouts] = useState(false);
  const [networkCalloutContentMode, setNetworkCalloutContentMode] = useState<NetworkCalloutContentMode>("wireDetails");
  const [showSelectedCalloutOnly, setShowSelectedCalloutOnly] = useState(false);
  const [networkLabelStrokeMode, setNetworkLabelStrokeMode] = useState<CanvasLabelStrokeMode>("light");
  const [networkLabelSizeMode, setNetworkLabelSizeMode] = useState<CanvasLabelSizeMode>("small");
  const [networkCalloutTextSize, setNetworkCalloutTextSize] = useState<CanvasCalloutTextSize>("normal");
  const [networkLabelRotationDegrees, setNetworkLabelRotationDegrees] = useState<CanvasLabelRotationDegrees>(0);
  const [networkAutoSegmentLabelRotation, setNetworkAutoSegmentLabelRotation] = useState(true);
  const [canvasResetZoomPercentInput, setCanvasResetZoomPercentInput] = useState("100");

  return {
    routePreviewStartNodeId,
    setRoutePreviewStartNodeId,
    routePreviewEndNodeId,
    setRoutePreviewEndNodeId,
    showNetworkInfoPanels,
    setShowNetworkInfoPanels,
    showSegmentNames,
    setShowSegmentNames,
    showSegmentLengths,
    setShowSegmentLengths,
    showCableCallouts,
    setShowCableCallouts,
    networkCalloutContentMode,
    setNetworkCalloutContentMode,
    showSelectedCalloutOnly,
    setShowSelectedCalloutOnly,
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
