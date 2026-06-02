import type { Network, NetworkId } from "../../../core/entities";
import { normalizeNetworkIsoTimestamp } from "../../../core/networkMetadata";
import type { AppState, EntityState, ImportRejection, NetworkScopedState } from "../../types";
import {
  cloneScopedState,
  hasDuplicateNetworkTechnicalId,
  normalizeNetworkMetadata,
  normalizeOptionalText
} from "./networkClone";
import { upsertEntity } from "../shared";

export interface ImportNetworkValidationInput {
  networks: Network[];
  networkStates: Record<NetworkId, NetworkScopedState>;
  persisted: AppState;
  overwriteSet: ReadonlySet<string>;
  nowIso: string;
}

export interface ImportNetworkValidationResult {
  nextNetworks: EntityState<Network, NetworkId>;
  nextNetworkStates: Record<NetworkId, NetworkScopedState>;
  rejections: ImportRejection[];
}

export function collectNetworkImportRejections(
  input: ImportNetworkValidationInput
): ImportNetworkValidationResult {
  const { networks, networkStates, persisted, overwriteSet, nowIso } = input;
  let nextNetworks = persisted.networks;
  const nextNetworkStates: Record<NetworkId, NetworkScopedState> = { ...persisted.networkStates };
  const rejections: ImportRejection[] = [];

  const pushRejection = (network: Network, reason: string): void => {
    rejections.push({
      networkId: network.id,
      name: network.name,
      technicalId: network.technicalId,
      reason
    });
  };

  for (const network of networks) {
    const normalizedName = network.name.trim();
    const normalizedTechnicalId = network.technicalId.trim();
    if (normalizedName.length === 0 || normalizedTechnicalId.length === 0) {
      pushRejection(network, "name and technical ID are required");
      continue;
    }
    const isOverwrite = overwriteSet.has(network.id);
    if (!isOverwrite && nextNetworks.byId[network.id] !== undefined) {
      pushRejection(network, `ID '${network.id}' already exists`);
      continue;
    }
    if (hasDuplicateNetworkTechnicalId(
      { ...persisted, networks: nextNetworks },
      normalizedTechnicalId,
      isOverwrite ? network.id : undefined
    )) {
      pushRejection(network, `technical ID '${normalizedTechnicalId}' already exists`);
      continue;
    }
    const scoped = networkStates[network.id];
    if (scoped === undefined) {
      pushRejection(network, "network payload is incomplete");
      continue;
    }
    const normalizedMetadata = normalizeNetworkMetadata(network, {
      author: undefined,
      projectCode: undefined,
      logoUrl: undefined,
      exportNotes: undefined
    });
    if (normalizedMetadata.error !== null) {
      pushRejection(network, normalizedMetadata.error);
      continue;
    }
    const normalizedCreatedAt = normalizeNetworkIsoTimestamp(network.createdAt, nowIso);
    const normalizedUpdatedAt = normalizeNetworkIsoTimestamp(network.updatedAt, normalizedCreatedAt);
    nextNetworks = upsertEntity(nextNetworks, {
      ...network,
      name: normalizedName,
      technicalId: normalizedTechnicalId,
      description: normalizeOptionalText(network.description),
      createdAt: normalizedCreatedAt,
      updatedAt: normalizedUpdatedAt,
      ...normalizedMetadata.metadata
    });
    nextNetworkStates[network.id] = cloneScopedState(scoped);
  }

  return { nextNetworks, nextNetworkStates, rejections };
}
