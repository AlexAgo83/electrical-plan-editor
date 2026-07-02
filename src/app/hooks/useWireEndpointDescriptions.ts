import { useCallback } from "react";
import { resolveConnectorCavityDisplayLabel } from "../../core/connectorLayout";
import { portIndexToSpliceSide } from "../../core/directionalSplice";
import type { CatalogItem, CatalogItemId, Connector, ConnectorId, Splice, SpliceId, WireEndpoint } from "../../core/entities";
import { resolveSplicePortMode } from "../../core/splicePortMode";

interface UseWireEndpointDescriptionsParams {
  connectorMap: Map<ConnectorId, Connector>;
  catalogItemMap: Map<CatalogItemId, CatalogItem>;
  spliceMap: Map<SpliceId, Splice>;
}

export function useWireEndpointDescriptions({ connectorMap, catalogItemMap, spliceMap }: UseWireEndpointDescriptionsParams) {
  const describeWireEndpoint = useCallback(
    (endpoint: WireEndpoint): string => {
      if (endpoint.kind === "connectorCavity") {
        const connector = connectorMap.get(endpoint.connectorId);
        const catalogItem = connector?.catalogItemId === undefined ? undefined : catalogItemMap.get(connector.catalogItemId);
        const cavityLabel = resolveConnectorCavityDisplayLabel(connector, catalogItem, endpoint.cavityIndex);
        if (connector === undefined) {
          return `Connector ${endpoint.connectorId} / ${cavityLabel}`;
        }

        return `${connector.name} (${connector.technicalId}) / ${cavityLabel}`;
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
    [catalogItemMap, connectorMap, spliceMap]
  );

  const describeWireEndpointId = useCallback(
    (endpoint: WireEndpoint): string => {
      if (endpoint.kind === "connectorCavity") {
        const connector = connectorMap.get(endpoint.connectorId);
        const connectorTechnicalId = connector?.technicalId ?? String(endpoint.connectorId);
        const catalogItem = connector?.catalogItemId === undefined ? undefined : catalogItemMap.get(connector.catalogItemId);
        return `${connectorTechnicalId} / ${resolveConnectorCavityDisplayLabel(connector, catalogItem, endpoint.cavityIndex)}`;
      }

      const spliceTechnicalId = spliceMap.get(endpoint.spliceId)?.technicalId ?? String(endpoint.spliceId);
      const splice = spliceMap.get(endpoint.spliceId);
      if (splice !== undefined && resolveSplicePortMode(splice) === "directional") {
        return `${spliceTechnicalId} / ${endpoint.spliceSideOverride ?? portIndexToSpliceSide(endpoint.portIndex)}`;
      }
      return `${spliceTechnicalId} / P${endpoint.portIndex}`;
    },
    [catalogItemMap, connectorMap, spliceMap]
  );

  const describeWireEndpointCsvParts = useCallback(
    (endpoint: WireEndpoint): { endpointId: string; pin: string } => {
      if (endpoint.kind === "connectorCavity") {
        const connector = connectorMap.get(endpoint.connectorId);
        const connectorTechnicalId = connector?.technicalId ?? String(endpoint.connectorId);
        const catalogItem = connector?.catalogItemId === undefined ? undefined : catalogItemMap.get(connector.catalogItemId);
        return {
          endpointId: connectorTechnicalId,
          pin: resolveConnectorCavityDisplayLabel(connector, catalogItem, endpoint.cavityIndex)
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
    [catalogItemMap, connectorMap, spliceMap]
  );

  return {
    describeWireEndpoint,
    describeWireEndpointId,
    describeWireEndpointCsvParts
  };
}

export type WireEndpointDescriptions = ReturnType<typeof useWireEndpointDescriptions>;
