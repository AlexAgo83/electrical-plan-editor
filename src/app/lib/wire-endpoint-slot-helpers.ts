import type { ConnectorId, SpliceId } from "../../core/entities";
import { occupantsAt } from "../../core/connectorOccupancy";
import { resolveSplicePortMode } from "../../core/splicePortMode";
import type { AppState } from "../../store";

interface OccupancyContext {
  connectorCavityOccupancy: AppState["connectorCavityOccupancy"];
  splicePortOccupancy: AppState["splicePortOccupancy"];
}

function isExcludedOccupant(occupantRef: string | undefined, excludeOccupantRefs: ReadonlySet<string>): boolean {
  return occupantRef !== undefined && excludeOccupantRefs.has(occupantRef);
}

/** A connector way is available when it is empty or every occupant is excluded (e.g. the wire being edited). */
function isConnectorWayAvailable(occupants: string[], excludeOccupantRefs: ReadonlySet<string>): boolean {
  return occupants.length === 0 || occupants.every((ref) => excludeOccupantRefs.has(ref));
}

export function findNextAvailableConnectorWay(
  context: OccupancyContext,
  connectorId: ConnectorId,
  cavityCount: number,
  excludeOccupantRefs: ReadonlySet<string>
): number | null {
  for (let index = 1; index <= cavityCount; index += 1) {
    const occupants = occupantsAt(context.connectorCavityOccupancy[connectorId]?.[index]);
    if (isConnectorWayAvailable(occupants, excludeOccupantRefs)) {
      return index;
    }
  }
  return null;
}

export function findNextAvailableSplicePort(
  context: OccupancyContext,
  spliceId: SpliceId,
  splice: {
    portMode?: "bounded" | "unbounded" | "directional";
    portCount: number;
  },
  excludeOccupantRefs: ReadonlySet<string>
): number | null {
  const spliceOccupancy = context.splicePortOccupancy[spliceId] ?? {};
  const portMode = resolveSplicePortMode(splice);
  if (portMode === "directional") {
    return 1;
  }
  const isUnbounded = portMode === "unbounded";
  if (!isUnbounded) {
    for (let index = 1; index <= splice.portCount; index += 1) {
      const occupantRef = spliceOccupancy[index];
      if (occupantRef === undefined || isExcludedOccupant(occupantRef, excludeOccupantRefs)) {
        return index;
      }
    }
    return null;
  }

  const maxScanBound = Object.keys(spliceOccupancy).length + excludeOccupantRefs.size + 2;
  for (let index = 1; index <= maxScanBound; index += 1) {
    const occupantRef = spliceOccupancy[index];
    if (occupantRef === undefined || isExcludedOccupant(occupantRef, excludeOccupantRefs)) {
      return index;
    }
  }

  return maxScanBound + 1;
}

export function getConnectorWayOccupant(
  context: OccupancyContext,
  connectorId: ConnectorId,
  cavityIndex: number
): string | undefined {
  return occupantsAt(context.connectorCavityOccupancy[connectorId]?.[cavityIndex])[0];
}

export function getConnectorWayOccupants(
  context: OccupancyContext,
  connectorId: ConnectorId,
  cavityIndex: number
): string[] {
  return occupantsAt(context.connectorCavityOccupancy[connectorId]?.[cavityIndex]);
}

export function getSplicePortOccupant(
  context: OccupancyContext,
  spliceId: SpliceId,
  portIndex: number
): string | undefined {
  return context.splicePortOccupancy[spliceId]?.[portIndex];
}
