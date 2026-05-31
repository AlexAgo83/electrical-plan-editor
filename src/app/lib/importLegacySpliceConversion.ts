import type { NetworkId, SpliceId, WireEndpoint } from "../../core/entities";
import { spliceSideToPortIndex } from "../../core/directionalSplice";
import { DIRECTIONAL_SPLICE_PORT_COUNT, resolveSplicePortMode } from "../../core/splicePortMode";
import type { NetworkScopedState } from "../../store";

export function hasLegacyNumericSplices(networkStates: Record<NetworkId, NetworkScopedState>): boolean {
  return Object.values(networkStates).some((networkState) =>
    networkState.splices.allIds.some((spliceId) => {
      const splice = networkState.splices.byId[spliceId];
      return splice !== undefined && resolveSplicePortMode(splice) !== "directional";
    })
  );
}

export function convertLegacyNumericSplicesToDirectional(
  networkStates: Record<NetworkId, NetworkScopedState>
): Record<NetworkId, NetworkScopedState> {
  const nextStates = { ...networkStates };
  for (const [networkId, networkState] of Object.entries(networkStates) as Array<[NetworkId, NetworkScopedState]>) {
    const convertedSpliceIds = new Set<SpliceId>();
    const nextSplicesById = { ...networkState.splices.byId };
    const originalPortCountBySpliceId = new Map<SpliceId, number>();

    for (const spliceId of networkState.splices.allIds) {
      const splice = networkState.splices.byId[spliceId];
      if (splice === undefined || resolveSplicePortMode(splice) === "directional") {
        continue;
      }
      convertedSpliceIds.add(spliceId);
      originalPortCountBySpliceId.set(spliceId, splice.portCount);
      nextSplicesById[spliceId] = {
        ...splice,
        portMode: "directional",
        portCount: DIRECTIONAL_SPLICE_PORT_COUNT,
        sideInverted: false
      };
    }

    if (convertedSpliceIds.size === 0) {
      continue;
    }

    const convertEndpoint = (endpoint: WireEndpoint): WireEndpoint => {
      if (endpoint.kind !== "splicePort" || !convertedSpliceIds.has(endpoint.spliceId)) {
        return endpoint;
      }
      const originalPortCount = originalPortCountBySpliceId.get(endpoint.spliceId) ?? DIRECTIONAL_SPLICE_PORT_COUNT;
      const side = endpoint.portIndex > Math.ceil(originalPortCount / 2) ? "R" : "L";
      return {
        ...endpoint,
        portIndex: spliceSideToPortIndex(side),
        spliceSideOverride: side,
        spliceSideLocked: false
      };
    };

    const nextWiresById = { ...networkState.wires.byId };
    for (const wireId of networkState.wires.allIds) {
      const wire = networkState.wires.byId[wireId];
      if (wire === undefined) {
        continue;
      }
      nextWiresById[wireId] = {
        ...wire,
        endpointA: convertEndpoint(wire.endpointA),
        endpointB: convertEndpoint(wire.endpointB)
      };
    }

    const nextSplicePortOccupancy = { ...networkState.splicePortOccupancy };
    for (const spliceId of convertedSpliceIds) {
      delete nextSplicePortOccupancy[spliceId];
    }

    nextStates[networkId] = {
      ...networkState,
      splices: {
        ...networkState.splices,
        byId: nextSplicesById
      },
      wires: {
        ...networkState.wires,
        byId: nextWiresById
      },
      splicePortOccupancy: nextSplicePortOccupancy
    };
  }

  return nextStates;
}
