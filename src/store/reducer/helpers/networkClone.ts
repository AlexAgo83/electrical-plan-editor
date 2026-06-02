import type { Network, NetworkId } from "../../../core/entities";
import {
  isNetworkLogoUrlValid,
  isNetworkProjectCodeValid,
  normalizeNetworkAuthor,
  normalizeNetworkExportNotes,
  normalizeNetworkLogoUrl,
  normalizeNetworkProjectCode
} from "../../../core/networkMetadata";
import { cloneNetworkSummaryViewState, type AppState, type NetworkScopedState } from "../../types";

export function normalizeOptionalText(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const normalized = value.trim();
  return normalized.length === 0 ? undefined : normalized;
}

export interface NormalizeNetworkMetadataResult {
  metadata: Pick<Network, "author" | "projectCode" | "logoUrl" | "exportNotes">;
  error: string | null;
}

export function normalizeNetworkMetadata(
  source: Partial<Pick<Network, "author" | "projectCode" | "logoUrl" | "exportNotes">>,
  fallback: Pick<Network, "author" | "projectCode" | "logoUrl" | "exportNotes">
): NormalizeNetworkMetadataResult {
  const rawProjectCode = source.projectCode === undefined ? fallback.projectCode : source.projectCode;
  const rawLogoUrl = source.logoUrl === undefined ? fallback.logoUrl : source.logoUrl;
  const normalizedProjectCode = normalizeNetworkProjectCode(rawProjectCode);
  const normalizedLogoUrl = normalizeNetworkLogoUrl(rawLogoUrl);
  if (normalizedProjectCode !== undefined && !isNetworkProjectCodeValid(normalizedProjectCode)) {
    return {
      metadata: fallback,
      error: "Project code supports letters, numbers, spaces, and _ . / - characters only."
    };
  }
  if (normalizedLogoUrl !== undefined && !isNetworkLogoUrlValid(normalizedLogoUrl)) {
    return {
      metadata: fallback,
      error: "Logo URL must use http, https, or data:image/*."
    };
  }
  return {
    metadata: {
      author: normalizeNetworkAuthor(source.author === undefined ? fallback.author : source.author),
      projectCode: normalizedProjectCode,
      logoUrl: normalizedLogoUrl,
      exportNotes: normalizeNetworkExportNotes(source.exportNotes === undefined ? fallback.exportNotes : source.exportNotes)
    },
    error: null
  };
}

export function hasDuplicateNetworkTechnicalId(
  state: AppState,
  technicalId: string,
  excludedNetworkId?: NetworkId
): boolean {
  return state.networks.allIds.some((networkId) => {
    if (excludedNetworkId !== undefined && networkId === excludedNetworkId) {
      return false;
    }
    const network = state.networks.byId[networkId];
    return network?.technicalId === technicalId;
  });
}

export function cloneScopedState(scoped: NetworkScopedState): NetworkScopedState {
  return {
    catalogItems: { byId: { ...scoped.catalogItems.byId }, allIds: [...scoped.catalogItems.allIds] },
    connectors: { byId: { ...scoped.connectors.byId }, allIds: [...scoped.connectors.allIds] },
    splices: { byId: { ...scoped.splices.byId }, allIds: [...scoped.splices.allIds] },
    nodes: { byId: { ...scoped.nodes.byId }, allIds: [...scoped.nodes.allIds] },
    segments: { byId: { ...scoped.segments.byId }, allIds: [...scoped.segments.allIds] },
    wires: { byId: { ...scoped.wires.byId }, allIds: [...scoped.wires.allIds] },
    nodePositions: { ...scoped.nodePositions },
    connectorCavityOccupancy: { ...scoped.connectorCavityOccupancy },
    splicePortOccupancy: { ...scoped.splicePortOccupancy },
    networkSummaryViewState: cloneNetworkSummaryViewState(scoped.networkSummaryViewState)
  };
}
