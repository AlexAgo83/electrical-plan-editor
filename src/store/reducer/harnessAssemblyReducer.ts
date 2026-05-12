import type { HarnessAssemblyId, NetworkId } from "../../core/entities";
import type { AppAction } from "../actions";
import type { AppState } from "../types";
import { bumpRevision, clearLastError, removeEntity, upsertEntity, withError } from "./shared";

function normalizeOptionalText(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const normalized = value.trim();
  return normalized.length === 0 ? undefined : normalized;
}

function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

function hasDuplicateTechnicalId(state: AppState, technicalId: string, excludedId?: HarnessAssemblyId): boolean {
  return state.harnessAssemblies.allIds.some((assemblyId) => {
    if (assemblyId === excludedId) {
      return false;
    }
    return state.harnessAssemblies.byId[assemblyId]?.technicalId === technicalId;
  });
}

function cleanupAssembliesAfterNetworkDelete(state: AppState, deletedNetworkId: NetworkId): AppState {
  let didChange = false;
  const nextById = { ...state.harnessAssemblies.byId };
  for (const assemblyId of state.harnessAssemblies.allIds) {
    const assembly = state.harnessAssemblies.byId[assemblyId];
    if (assembly === undefined) {
      continue;
    }
    const nextMembers = assembly.members.filter((member) => member.networkId !== deletedNetworkId);
    const nextMasterConnectorRefs = assembly.masterConnectorRefs.filter((root) => root.networkId !== deletedNetworkId);
    const nextConnectorLinks = assembly.connectorLinks.filter(
      (link) => link.sourceNetworkId !== deletedNetworkId && link.targetNetworkId !== deletedNetworkId
    );
    if (
      nextMembers.length === assembly.members.length &&
      nextMasterConnectorRefs.length === assembly.masterConnectorRefs.length &&
      nextConnectorLinks.length === assembly.connectorLinks.length
    ) {
      continue;
    }
    didChange = true;
    nextById[assemblyId] = {
      ...assembly,
      members: nextMembers,
      masterConnectorRefs: nextMasterConnectorRefs,
      connectorLinks: nextConnectorLinks,
      updatedAt: new Date().toISOString()
    };
  }

  if (!didChange) {
    return state;
  }

  return {
    ...state,
    harnessAssemblies: {
      ...state.harnessAssemblies,
      byId: nextById
    }
  };
}

export function handleHarnessAssemblyActions(state: AppState, action: AppAction): AppState | null {
  switch (action.type) {
    case "harnessAssembly/upsert": {
      const assembly = action.payload;
      const name = assembly.name.trim();
      const technicalId = assembly.technicalId.trim();
      if (name.length === 0 || technicalId.length === 0) {
        return withError(state, "Harness assembly name and technical ID are required.");
      }
      if (hasDuplicateTechnicalId(state, technicalId, assembly.id)) {
        return withError(state, `Harness assembly technical ID '${technicalId}' is already used.`);
      }

      const knownNetworkIds = new Set(state.networks.allIds);
      const memberNetworkIds = new Set<string>();
      for (const member of assembly.members) {
        if (!knownNetworkIds.has(member.networkId)) {
          return withError(state, `Harness assembly references unknown network '${member.networkId}'.`);
        }
        if (memberNetworkIds.has(member.networkId)) {
          return withError(state, `Harness assembly contains duplicate network '${member.networkId}'.`);
        }
        memberNetworkIds.add(member.networkId);
        if (!isHexColor(member.color)) {
          return withError(state, "Harness assembly colors must use #RRGGBB format.");
        }
      }

      const nextState: AppState = {
        ...clearLastError(state),
        harnessAssemblies: upsertEntity(state.harnessAssemblies, {
          ...assembly,
          name,
          technicalId,
          members: assembly.members.map((member) => ({ ...member })),
          masterConnectorRefs: assembly.masterConnectorRefs.map((root) => ({ ...root })),
          connectorLinks: assembly.connectorLinks.map((link) => ({
            ...link,
            name: normalizeOptionalText(link.name)
          }))
        })
      };
      return bumpRevision(nextState);
    }

    case "harnessAssembly/remove": {
      if (state.harnessAssemblies.byId[action.payload.id] === undefined) {
        return withError(state, "Cannot delete unknown harness assembly.");
      }
      return bumpRevision({
        ...clearLastError(state),
        harnessAssemblies: removeEntity(state.harnessAssemblies, action.payload.id)
      });
    }

    default:
      return null;
  }
}

export function cleanupHarnessAssembliesForDeletedNetwork(state: AppState, deletedNetworkId: NetworkId): AppState {
  return cleanupAssembliesAfterNetworkDelete(state, deletedNetworkId);
}
