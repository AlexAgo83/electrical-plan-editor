import type { ConnectorId, SpliceId, WireEndpoint } from "../../core/entities";
import { resolveSplicePortMode } from "../../core/splicePortMode";
import type { AppStore } from "../../store";
import { toPositiveInteger } from "../lib/app-utils-shared";
import {
  findNextAvailableConnectorWay,
  findNextAvailableSplicePort,
  getConnectorWayOccupant,
  getSplicePortOccupant
} from "../lib/wire-endpoint-slot-helpers";

type AppState = ReturnType<AppStore["getState"]>;

export interface WireEndpointSlotHint {
  tone: "error" | "help";
  message: string;
}

interface EndpointDraftInput {
  kind: WireEndpoint["kind"];
  connectorId: string;
  cavityIndex: string;
  spliceId: string;
  portIndex: string;
}

export function buildWireEndpointDraft(input: EndpointDraftInput): WireEndpoint | null {
  if (input.kind === "connectorCavity") {
    if (input.connectorId.length === 0) {
      return null;
    }

    const cavityIndex = toPositiveInteger(input.cavityIndex);
    if (cavityIndex <= 0) {
      return null;
    }

    return {
      kind: "connectorCavity",
      connectorId: input.connectorId as ConnectorId,
      cavityIndex
    };
  }

  if (input.spliceId.length === 0) {
    return null;
  }

  const portIndex = toPositiveInteger(input.portIndex);
  if (portIndex <= 0) {
    return null;
  }

  return {
    kind: "splicePort",
    spliceId: input.spliceId as SpliceId,
    portIndex
  };
}

export function computeWireEndpointSlotHint(
  snapshot: AppState,
  excluded: ReadonlySet<string>,
  input: EndpointDraftInput
): WireEndpointSlotHint | null {
  if (input.kind === "connectorCavity") {
    if (input.connectorId.length === 0) {
      return null;
    }
    const connector = snapshot.connectors.byId[input.connectorId as ConnectorId];
    if (connector === undefined) {
      return null;
    }
    const cavityIndex = toPositiveInteger(input.cavityIndex);
    if (cavityIndex <= 0) {
      return null;
    }
    const occupant = getConnectorWayOccupant(snapshot, connector.id, cavityIndex);
    if (occupant === undefined || excluded.has(occupant)) {
      return null;
    }
    const nextFree = findNextAvailableConnectorWay(snapshot, connector.id, connector.cavityCount, excluded);
    if (nextFree === null) {
      return { tone: "error", message: "Way is already occupied. No available ways on selected connector." };
    }
    return nextFree === cavityIndex ? null : { tone: "error", message: `Way ${cavityIndex} is already occupied. Suggested: way ${nextFree}.` };
  }

  if (input.spliceId.length === 0) {
    return null;
  }
  const splice = snapshot.splices.byId[input.spliceId as SpliceId];
  if (splice === undefined || resolveSplicePortMode(splice) === "directional") {
    return null;
  }
  const portIndex = toPositiveInteger(input.portIndex);
  if (portIndex <= 0) {
    return null;
  }
  const occupant = getSplicePortOccupant(snapshot, splice.id, portIndex);
  if (occupant === undefined || excluded.has(occupant)) {
    return null;
  }
  const nextFree = findNextAvailableSplicePort(snapshot, splice.id, splice, excluded);
  if (nextFree === null) {
    return { tone: "error", message: "Port is already occupied. No available ports on selected splice." };
  }
  return nextFree === portIndex ? null : { tone: "error", message: `Port ${portIndex} is already occupied. Suggested: port ${nextFree}.` };
}

export function findNextAvailableEndpointIndex(snapshot: AppState, excluded: ReadonlySet<string>, input: EndpointDraftInput): number | null {
  if (input.kind === "connectorCavity") {
    if (input.connectorId.length === 0) {
      return null;
    }
    const connector = snapshot.connectors.byId[input.connectorId as ConnectorId];
    return connector === undefined ? null : findNextAvailableConnectorWay(snapshot, connector.id, connector.cavityCount, excluded);
  }

  if (input.spliceId.length === 0) {
    return null;
  }
  const splice = snapshot.splices.byId[input.spliceId as SpliceId];
  return splice === undefined ? null : findNextAvailableSplicePort(snapshot, splice.id, splice, excluded);
}
