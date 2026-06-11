import type { Connector, ConnectorId, NetworkNode, NodeId, Segment, Splice, SpliceId } from "../../core/entities";
import { NETWORK_MAX_SCALE, NETWORK_MIN_SCALE } from "./app-utils-shared";
import { computeNetworkFitViewportForBounds } from "./networkSummaryViewport";
import type { CanvasCalloutTextSize, NodePosition } from "../types/app-controller";

interface WorkspaceNetworkViewportParams {
  nodes: NetworkNode[];
  networkNodePositions: Record<NodeId, NodePosition>;
  connectorMap: Map<ConnectorId, Connector>;
  spliceMap: Map<SpliceId, Splice>;
  segments: Segment[];
  configuredResetScale: number;
  networkViewWidth: number;
  networkViewHeight: number;
  showSegmentDressings: boolean;
  showCableCallouts: boolean;
  networkCalloutTextSize: CanvasCalloutTextSize;
  setCanvasGlobalRenderScalePercent: (value: number) => void;
  setNetworkScale: (value: number) => void;
  setNetworkOffset: (value: NodePosition) => void;
}

function collectNodePositionBounds(
  nodes: NetworkNode[],
  networkNodePositions: Record<NodeId, NodePosition>
): { minX: number; maxX: number; minY: number; maxY: number } | null {
  const positions = nodes
    .map((node) => networkNodePositions[node.id])
    .filter((position): position is NodePosition => position !== undefined);
  const firstPosition = positions[0];
  if (firstPosition === undefined) {
    return null;
  }

  let minX = firstPosition.x;
  let maxX = firstPosition.x;
  let minY = firstPosition.y;
  let maxY = firstPosition.y;
  for (const position of positions.slice(1)) {
    minX = Math.min(minX, position.x);
    maxX = Math.max(maxX, position.x);
    minY = Math.min(minY, position.y);
    maxY = Math.max(maxY, position.y);
  }
  return { minX, maxX, minY, maxY };
}

export function resetNetworkViewToConfiguredScale(params: WorkspaceNetworkViewportParams): void {
  const bounds = collectNodePositionBounds(params.nodes, params.networkNodePositions);
  if (bounds === null) {
    params.setCanvasGlobalRenderScalePercent(0);
    params.setNetworkScale(params.configuredResetScale);
    params.setNetworkOffset({ x: 0, y: 0 });
    return;
  }

  const scale = params.configuredResetScale > 0 ? params.configuredResetScale : 1;
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  params.setCanvasGlobalRenderScalePercent(0);
  params.setNetworkScale(scale);
  params.setNetworkOffset({
    x: params.networkViewWidth / 2 - centerX * scale,
    y: params.networkViewHeight / 2 - centerY * scale
  });
}

export function fitNetworkToContent(params: WorkspaceNetworkViewportParams): void {
  resetNetworkViewToConfiguredScale(params);

  if (params.nodes.length === 0) {
    return;
  }

  const bounds = collectNodePositionBounds(params.nodes, params.networkNodePositions);
  if (bounds === null) {
    return;
  }

  if (params.showCableCallouts) {
    const initialFit = computeNetworkFitViewportForBounds({
      bounds,
      networkViewWidth: params.networkViewWidth,
      networkViewHeight: params.networkViewHeight,
      networkMinScale: NETWORK_MIN_SCALE,
      networkMaxScale: NETWORK_MAX_SCALE
    });
    const safeScale = Math.max(0.05, initialFit.scale);
    const inverseLabelScale = 1 / safeScale;
    const estimatedCalloutHalfWidthBySize: Record<CanvasCalloutTextSize, number> = {
      small: 130,
      normal: 155,
      large: 180,
      extraLarge: 180
    };
    const estimatedCalloutHalfHeightBySize: Record<CanvasCalloutTextSize, number> = {
      small: 52,
      normal: 64,
      large: 74,
      extraLarge: 74
    };
    const calloutHalfWidth = estimatedCalloutHalfWidthBySize[params.networkCalloutTextSize] * inverseLabelScale;
    const calloutHalfHeight = estimatedCalloutHalfHeightBySize[params.networkCalloutTextSize] * inverseLabelScale;

    for (const node of params.nodes) {
      if (node.kind !== "connector" && node.kind !== "splice") {
        continue;
      }
      const persistedPosition =
        node.kind === "connector"
          ? params.connectorMap.get(node.connectorId)?.cableCalloutPosition
          : params.spliceMap.get(node.spliceId)?.cableCalloutPosition;
      if (persistedPosition === undefined) {
        continue;
      }

      bounds.minX = Math.min(bounds.minX, persistedPosition.x - calloutHalfWidth);
      bounds.maxX = Math.max(bounds.maxX, persistedPosition.x + calloutHalfWidth);
      bounds.minY = Math.min(bounds.minY, persistedPosition.y - calloutHalfHeight);
      bounds.maxY = Math.max(bounds.maxY, persistedPosition.y + calloutHalfHeight);
    }
  }
  if (params.showSegmentDressings) {
    const segmentCalloutHalfWidth = 120;
    const segmentCalloutHalfHeight = 24;
    for (const segment of params.segments) {
      const persistedPosition = segment.sheathCalloutPosition;
      if (persistedPosition === undefined) {
        continue;
      }
      bounds.minX = Math.min(bounds.minX, persistedPosition.x - segmentCalloutHalfWidth);
      bounds.maxX = Math.max(bounds.maxX, persistedPosition.x + segmentCalloutHalfWidth);
      bounds.minY = Math.min(bounds.minY, persistedPosition.y - segmentCalloutHalfHeight);
      bounds.maxY = Math.max(bounds.maxY, persistedPosition.y + segmentCalloutHalfHeight);
    }
  }
  const fittedViewport = computeNetworkFitViewportForBounds({
    bounds,
    networkViewWidth: params.networkViewWidth,
    networkViewHeight: params.networkViewHeight,
    networkMinScale: NETWORK_MIN_SCALE,
    networkMaxScale: NETWORK_MAX_SCALE
  });

  params.setNetworkScale(fittedViewport.scale);
  params.setNetworkOffset(fittedViewport.offset);
}
