import type { ConnectorId, Wire } from "../../core/entities";

function isWireEndpointOnConnector(wire: Wire, endpointSide: "A" | "B", connectorId: ConnectorId): boolean {
  const endpoint = endpointSide === "A" ? wire.endpointA : wire.endpointB;
  return endpoint.kind === "connectorCavity" && endpoint.connectorId === connectorId;
}

export function clearConnectorEndpointReferences(wire: Wire, connectorId: ConnectorId): Wire {
  const clearEndpointA = isWireEndpointOnConnector(wire, "A", connectorId);
  const clearEndpointB = isWireEndpointOnConnector(wire, "B", connectorId);
  return {
    ...wire,
    endpointAConnectionReference: clearEndpointA ? undefined : wire.endpointAConnectionReference,
    endpointAConnectionName: clearEndpointA ? undefined : wire.endpointAConnectionName,
    endpointASealReference: clearEndpointA ? undefined : wire.endpointASealReference,
    endpointASealName: clearEndpointA ? undefined : wire.endpointASealName,
    endpointBConnectionReference: clearEndpointB ? undefined : wire.endpointBConnectionReference,
    endpointBConnectionName: clearEndpointB ? undefined : wire.endpointBConnectionName,
    endpointBSealReference: clearEndpointB ? undefined : wire.endpointBSealReference,
    endpointBSealName: clearEndpointB ? undefined : wire.endpointBSealName
  };
}

export function hasConnectorEndpointReferenceFields(wire: Wire, connectorId: ConnectorId): boolean {
  return (
    (isWireEndpointOnConnector(wire, "A", connectorId) &&
      (wire.endpointAConnectionReference !== undefined ||
        wire.endpointAConnectionName !== undefined ||
        wire.endpointASealReference !== undefined ||
        wire.endpointASealName !== undefined)) ||
    (isWireEndpointOnConnector(wire, "B", connectorId) &&
      (wire.endpointBConnectionReference !== undefined ||
        wire.endpointBConnectionName !== undefined ||
        wire.endpointBSealReference !== undefined ||
        wire.endpointBSealName !== undefined))
  );
}
