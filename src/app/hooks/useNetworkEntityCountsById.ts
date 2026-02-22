import { useMemo } from "react";
import type { Network, NetworkId } from "../../core/entities";
import type { AppStore } from "../../store";

type AppState = ReturnType<AppStore["getState"]>;

interface NetworkEntityCounts {
  connectorCount: number;
  spliceCount: number;
  nodeCount: number;
  segmentCount: number;
  wireCount: number;
}

export function useNetworkEntityCountsById(
  networks: Network[],
  networkStates: AppState["networkStates"]
): Partial<Record<NetworkId, NetworkEntityCounts>> {
  return useMemo(() => {
    const counts: Partial<Record<NetworkId, NetworkEntityCounts>> = {};

    for (const network of networks) {
      const scoped = networkStates[network.id];
      counts[network.id] = {
        connectorCount: scoped?.connectors.allIds.length ?? 0,
        spliceCount: scoped?.splices.allIds.length ?? 0,
        nodeCount: scoped?.nodes.allIds.length ?? 0,
        segmentCount: scoped?.segments.allIds.length ?? 0,
        wireCount: scoped?.wires.allIds.length ?? 0
      };
    }

    return counts;
  }, [networks, networkStates]);
}
