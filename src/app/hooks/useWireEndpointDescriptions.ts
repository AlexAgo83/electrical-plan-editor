import { useCallback } from "react";
import { portIndexToSpliceSide } from "../../core/directionalSplice";
import type { Connector, ConnectorId, Splice, SpliceId, WireEndpoint } from "../../core/entities";
import { resolveSplicePortMode } from "../../core/splicePortMode";

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

      if (resolveSplicePortMode(splice) === "directional") {
        return `${splice.name} (${splice.technicalId}) / ${endpoint.spliceSideOverride ?? portIndexToSpliceSide(endpoint.portIndex)}`;
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
      const splice = spliceMap.get(endpoint.spliceId);
      if (splice !== undefined && resolveSplicePortMode(splice) === "directional") {
        return `${spliceTechnicalId} / ${endpoint.spliceSideOverride ?? portIndexToSpliceSide(endpoint.portIndex)}`;
      }
      return `${spliceTechnicalId} / P${endpoint.portIndex}`;
    },
    [connectorMap, spliceMap]
  );

  const describeWireEndpointCsvParts = useCallback(
    (endpoint: WireEndpoint): { endpointId: string; pin: string } => {
      if (endpoint.kind === "connectorCavity") {
        const connectorTechnicalId = connectorMap.get(endpoint.connectorId)?.technicalId ?? String(endpoint.connectorId);
        return {
          endpointId: connectorTechnicalId,
          pin: `C${endpoint.cavityIndex}`
        };
      }

      const spliceTechnicalId = spliceMap.get(endpoint.spliceId)?.technicalId ?? String(endpoint.spliceId);
      const splice = spliceMap.get(endpoint.spliceId);
      return {
        endpointId: spliceTechnicalId,
        pin:
          splice !== undefined && resolveSplicePortMode(splice) === "directional"
            ? endpoint.spliceSideOverride ?? portIndexToSpliceSide(endpoint.portIndex)
            : `P${endpoint.portIndex}`
      };
    },
    [connectorMap, spliceMap]
  );

  return {
    describeWireEndpoint,
    describeWireEndpointId,
    describeWireEndpointCsvParts
  };
}

export type WireEndpointDescriptions = ReturnType<typeof useWireEndpointDescriptions>;
