import { useCallback } from "react";
import type { Connector, ConnectorId, Splice, SpliceId, WireEndpoint } from "../../core/entities";

interface UseWireEndpointDescriptionsParams {
  connectorMap: Map<ConnectorId, Connector>;
  spliceMap: Map<SpliceId, Splice>;
}

export function useWireEndpointDescriptions({ connectorMap, spliceMap }: UseWireEndpointDescriptionsParams) {
  const describeWireEndpoint = useCallback(
    (endpoint: WireEndpoint): string => {
      if (endpoint.kind === "connectorCavity") {
        const connector = connectorMap.get(endpoint.connectorId);
        if (connector === undefined) {
          return `Connector ${endpoint.connectorId} / C${endpoint.cavityIndex}`;
        }

        return `${connector.name} (${connector.technicalId}) / C${endpoint.cavityIndex}`;
      }

      const splice = spliceMap.get(endpoint.spliceId);
      if (splice === undefined) {
        return `Splice ${endpoint.spliceId} / P${endpoint.portIndex}`;
      }

      return `${splice.name} (${splice.technicalId}) / P${endpoint.portIndex}`;
    },
    [connectorMap, spliceMap]
  );

  const describeWireEndpointId = useCallback(
    (endpoint: WireEndpoint): string => {
      if (endpoint.kind === "connectorCavity") {
        const connectorTechnicalId = connectorMap.get(endpoint.connectorId)?.technicalId ?? String(endpoint.connectorId);
        return `${connectorTechnicalId} / C${endpoint.cavityIndex}`;
      }

      const spliceTechnicalId = spliceMap.get(endpoint.spliceId)?.technicalId ?? String(endpoint.spliceId);
      return `${spliceTechnicalId} / P${endpoint.portIndex}`;
    },
    [connectorMap, spliceMap]
  );

  return {
    describeWireEndpoint,
    describeWireEndpointId
  };
}

export type WireEndpointDescriptions = ReturnType<typeof useWireEndpointDescriptions>;
