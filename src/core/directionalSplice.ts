import type { WireEndpoint } from "./entities";

export type DirectionalSpliceSide = "L" | "R";

export function spliceSideToPortIndex(side: DirectionalSpliceSide): number {
  return side === "L" ? 1 : 2;
}

export function portIndexToSpliceSide(portIndex: number): DirectionalSpliceSide {
  return portIndex === 2 ? "R" : "L";
}

export function swapDirectionalSpliceSide(side: DirectionalSpliceSide): DirectionalSpliceSide {
  return side === "L" ? "R" : "L";
}

export function normalizeDirectionalSpliceEndpoint(
  endpoint: WireEndpoint,
  side: DirectionalSpliceSide
): WireEndpoint {
  if (endpoint.kind !== "splicePort") {
    return endpoint;
  }

  return {
    ...endpoint,
    portIndex: spliceSideToPortIndex(side),
    spliceSideOverride: side,
    spliceSideLocked: endpoint.spliceSideLocked === true
  };
}
