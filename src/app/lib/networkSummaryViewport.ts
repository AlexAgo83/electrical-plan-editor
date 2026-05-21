import type { NodePosition } from "../types/app-controller";
import { clamp } from "./app-utils-shared";

export interface NetworkFitBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface NetworkFitViewport {
  scale: number;
  offset: NodePosition;
  paddedMinX: number;
  paddedMaxX: number;
  paddedMinY: number;
  paddedMaxY: number;
}

const NETWORK_FIT_ENTITY_VISUAL_PADDING = 28;
const NETWORK_FIT_PADDING = 40;

export function computeNetworkFitViewportForBounds(options: {
  bounds: NetworkFitBounds;
  networkViewWidth: number;
  networkViewHeight: number;
  networkMinScale: number;
  networkMaxScale: number;
}): NetworkFitViewport {
  const { bounds, networkViewWidth, networkViewHeight, networkMinScale, networkMaxScale } = options;
  const paddedMinX = bounds.minX - NETWORK_FIT_ENTITY_VISUAL_PADDING;
  const paddedMaxX = bounds.maxX + NETWORK_FIT_ENTITY_VISUAL_PADDING;
  const paddedMinY = bounds.minY - NETWORK_FIT_ENTITY_VISUAL_PADDING;
  const paddedMaxY = bounds.maxY + NETWORK_FIT_ENTITY_VISUAL_PADDING;
  const contentWidth = Math.max(1, paddedMaxX - paddedMinX);
  const contentHeight = Math.max(1, paddedMaxY - paddedMinY);
  const availableWidth = Math.max(1, networkViewWidth - NETWORK_FIT_PADDING * 2);
  const availableHeight = Math.max(1, networkViewHeight - NETWORK_FIT_PADDING * 2);
  const scale = clamp(Math.min(availableWidth / contentWidth, availableHeight / contentHeight), networkMinScale, networkMaxScale);
  const centerX = (paddedMinX + paddedMaxX) / 2;
  const centerY = (paddedMinY + paddedMaxY) / 2;

  return {
    scale,
    offset: {
      x: networkViewWidth / 2 - centerX * scale,
      y: networkViewHeight / 2 - centerY * scale
    },
    paddedMinX,
    paddedMaxX,
    paddedMinY,
    paddedMaxY
  };
}

export function computeNetworkFitViewportForPositions(options: {
  positions: readonly NodePosition[];
  networkViewWidth: number;
  networkViewHeight: number;
  networkMinScale: number;
  networkMaxScale: number;
}): NetworkFitViewport | null {
  const firstPosition = options.positions[0];
  if (firstPosition === undefined) {
    return null;
  }

  let minX = firstPosition.x;
  let maxX = firstPosition.x;
  let minY = firstPosition.y;
  let maxY = firstPosition.y;
  for (const position of options.positions.slice(1)) {
    minX = Math.min(minX, position.x);
    maxX = Math.max(maxX, position.x);
    minY = Math.min(minY, position.y);
    maxY = Math.max(maxY, position.y);
  }

  return computeNetworkFitViewportForBounds({
    bounds: { minX, maxX, minY, maxY },
    networkViewWidth: options.networkViewWidth,
    networkViewHeight: options.networkViewHeight,
    networkMinScale: options.networkMinScale,
    networkMaxScale: options.networkMaxScale
  });
}
