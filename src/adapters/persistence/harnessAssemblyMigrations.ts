import type {
  ConnectorId,
  HarnessAssembly,
  HarnessAssemblyId,
  InterHarnessConnectorLinkId,
  Network,
  NetworkId
} from "../../core/entities";
import type { EntityState } from "../../store";
import { DEFAULT_NETWORK_CREATED_AT } from "../../store/types";
import { normalizeNetworkIsoTimestamp } from "../../core/networkMetadata";

type PlainObject = Record<string, unknown>;

function isRecord(value: unknown): value is PlainObject {
  return typeof value === "object" && value !== null;
}

function isEntityState(candidate: unknown): candidate is EntityState<unknown, string> {
  if (!isRecord(candidate)) {
    return false;
  }

  return isRecord(candidate.byId) && Array.isArray(candidate.allIds);
}

function normalizeHarnessColor(value: unknown, fallback: string): string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

export function normalizeHarnessAssemblyEntityState(
  candidate: unknown,
  networks: EntityState<Network, NetworkId>
): EntityState<HarnessAssembly, HarnessAssemblyId> {
  if (!isEntityState(candidate)) {
    return { byId: {}, allIds: [] };
  }

  const knownNetworkIds = new Set(networks.allIds);
  const byId = {} as Record<HarnessAssemblyId, HarnessAssembly>;
  const allIds: HarnessAssemblyId[] = [];
  const defaultColors = ["#2563eb", "#16a34a", "#dc2626", "#9333ea", "#ca8a04", "#0891b2"];

  for (const rawId of candidate.allIds) {
    if (typeof rawId !== "string") {
      continue;
    }
    const raw = candidate.byId[rawId];
    if (!isRecord(raw)) {
      continue;
    }
    const name = typeof raw.name === "string" ? raw.name.trim() : "";
    const technicalId = typeof raw.technicalId === "string" ? raw.technicalId.trim() : "";
    if (name.length === 0 || technicalId.length === 0) {
      continue;
    }

    const rawMembers = Array.isArray(raw.members) ? raw.members : [];
    const members = rawMembers.flatMap((member, index) => {
      if (!isRecord(member) || typeof member.networkId !== "string" || !knownNetworkIds.has(member.networkId as NetworkId)) {
        return [];
      }
      return [
        {
          networkId: member.networkId as NetworkId,
          color: normalizeHarnessColor(member.color, defaultColors[index % defaultColors.length] ?? "#2563eb")
        }
      ];
    });
    const memberNetworkIds = new Set(members.map((member) => member.networkId));

    const masterConnectorRefs = (Array.isArray(raw.masterConnectorRefs) ? raw.masterConnectorRefs : []).flatMap((ref) => {
      if (
        !isRecord(ref) ||
        typeof ref.networkId !== "string" ||
        typeof ref.connectorId !== "string" ||
        !memberNetworkIds.has(ref.networkId as NetworkId)
      ) {
        return [];
      }
      return [{ networkId: ref.networkId as NetworkId, connectorId: ref.connectorId as ConnectorId }];
    });

    const connectorLinks = (Array.isArray(raw.connectorLinks) ? raw.connectorLinks : []).flatMap((link) => {
      if (
        !isRecord(link) ||
        typeof link.id !== "string" ||
        typeof link.sourceNetworkId !== "string" ||
        typeof link.sourceConnectorId !== "string" ||
        typeof link.targetNetworkId !== "string" ||
        typeof link.targetConnectorId !== "string" ||
        !memberNetworkIds.has(link.sourceNetworkId as NetworkId) ||
        !memberNetworkIds.has(link.targetNetworkId as NetworkId)
      ) {
        return [];
      }
      return [
        {
          id: link.id as InterHarnessConnectorLinkId,
          name: typeof link.name === "string" && link.name.trim().length > 0 ? link.name.trim() : undefined,
          sourceNetworkId: link.sourceNetworkId as NetworkId,
          sourceConnectorId: link.sourceConnectorId as ConnectorId,
          targetNetworkId: link.targetNetworkId as NetworkId,
          targetConnectorId: link.targetConnectorId as ConnectorId
        }
      ];
    });

    const assemblyId = rawId as HarnessAssemblyId;
    byId[assemblyId] = {
      id: assemblyId,
      name,
      technicalId,
      members,
      masterConnectorRefs,
      connectorLinks,
      createdAt: normalizeNetworkIsoTimestamp(raw.createdAt, DEFAULT_NETWORK_CREATED_AT),
      updatedAt: normalizeNetworkIsoTimestamp(raw.updatedAt, DEFAULT_NETWORK_CREATED_AT)
    };
    allIds.push(assemblyId);
  }

  return { byId, allIds };
}
