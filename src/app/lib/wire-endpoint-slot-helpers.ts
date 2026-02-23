import type { ConnectorId, SpliceId } from "../../core/entities";
import type { AppState } from "../../store";

interface OccupancyContext {
  connectorCavityOccupancy: AppState["connectorCavityOccupancy"];
  splicePortOccupancy: AppState["splicePortOccupancy"];
}

function isExcludedOccupant(occupantRef: string | undefined, excludeOccupantRefs: ReadonlySet<string>): boolean {
  return occupantRef !== undefined && excludeOccupantRefs.has(occupantRef);
}

export function findNextAvailableConnectorWay(
  context: OccupancyContext,
  connectorId: ConnectorId,
  cavityCount: number,
  excludeOccupantRefs: ReadonlySet<string>
): number | null {
  for (let index = 1; index <= cavityCount; index += 1) {
    const occupantRef = context.connectorCavityOccupancy[connectorId]?.[index];
    if (occupantRef === undefined || isExcludedOccupant(occupantRef, excludeOccupantRefs)) {
      return index;
    }
  }
  return null;
}

export function findNextAvailableSplicePort(
  context: OccupancyContext,
  spliceId: SpliceId,
  portCount: number,
  excludeOccupantRefs: ReadonlySet<string>
): number | null {
  for (let index = 1; index <= portCount; index += 1) {
    const occupantRef = context.splicePortOccupancy[spliceId]?.[index];
    if (occupantRef === undefined || isExcludedOccupant(occupantRef, excludeOccupantRefs)) {
      return index;
    }
  }
  return null;
}

export function getConnectorWayOccupant(
  context: OccupancyContext,
  connectorId: ConnectorId,
  cavityIndex: number
): string | undefined {
  return context.connectorCavityOccupancy[connectorId]?.[cavityIndex];
}

export function getSplicePortOccupant(
  context: OccupancyContext,
  spliceId: SpliceId,
  portIndex: number
): string | undefined {
  return context.splicePortOccupancy[spliceId]?.[portIndex];
}
