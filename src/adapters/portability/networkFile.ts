import type {
  CatalogItem,
  CatalogItemId,
  Connector,
  ConnectorId,
  HarnessAssembly,
  HarnessAssemblyId,
  InterHarnessConnectorLinkId,
  Network,
  NetworkId,
  NodeId,
  Splice,
  SpliceId,
  Wire,
  WireId
} from "../../core/entities";
import { normalizeWireColorState } from "../../core/cableColors";
import { FUNCTIONAL_FILTERS } from "../../core/functionalSchematic";
import { APP_RELEASE_VERSION, APP_SCHEMA_VERSION } from "../../core/schema";
import {
  isNetworkLogoUrlValid,
  isNetworkProjectCodeValid,
  normalizeNetworkAuthor,
  normalizeNetworkExportNotes,
  normalizeNetworkLogoUrl,
  normalizeNetworkProjectCode
} from "../../core/networkMetadata";
import { normalizeNetworkVoltageV, normalizeWireCurrentA, normalizeWireMaterial } from "../../core/wireSizing";
import { resolveWireSectionMm2 } from "../../core/wireSection";
import { normalizeWireEndpointReferenceName } from "../../core/wireReferences";
import { normalizeConnectorTerminalMaterial } from "../../core/connectorCatalogMaterials";
import {
  DIRECTIONAL_SPLICE_PORT_COUNT,
  normalizeSplicePortMode,
  normalizeUnboundedPortCountFallback
} from "../../core/splicePortMode";
import type { AppState, LayoutNodePosition, NetworkScopedState } from "../../store";
import { bootstrapCatalogForScopedState, normalizeCatalogItem, normalizeManufacturerReference } from "../../store/catalog";

export const NETWORK_FILE_SCHEMA_VERSION = 3;
export const NETWORK_FILE_PAYLOAD_KIND = "electrical-plan-editor.network-export";

export type NetworkExportScope = "active" | "selected" | "all";

export interface ExportedNetworkBundle {
  network: Network;
  state: NetworkScopedState;
}

export interface NetworkFilePayloadV1 {
  payloadKind?: typeof NETWORK_FILE_PAYLOAD_KIND;
  schemaVersion: number;
  exportedAt: string;
  source: {
    app: "electrical-plan-editor";
    appVersion?: string;
    appSchemaVersion: number;
  };
  networks: ExportedNetworkBundle[];
  harnessAssemblies?: HarnessAssembly[];
}

export interface NetworkImportSummary {
  importedNetworkIds: NetworkId[];
  skippedNetworkIds: string[];
  warnings: string[];
  errors: string[];
}

export interface NetworkImportResult {
  networks: Network[];
  networkStates: Record<NetworkId, NetworkScopedState>;
  harnessAssemblies: HarnessAssembly[];
  overwriteHarnessAssemblyIds: HarnessAssemblyId[];
  summary: NetworkImportSummary;
}

type PlainObject = Record<string, unknown>;

function isRecord(value: unknown): value is PlainObject {
  return typeof value === "object" && value !== null;
}

function isEntityState(value: unknown): boolean {
  return isRecord(value) && Array.isArray(value.allIds) && isRecord(value.byId);
}

function normalizeNodePositions(value: unknown): Record<NodeId, LayoutNodePosition> {
  if (!isRecord(value)) {
    return {} as Record<NodeId, LayoutNodePosition>;
  }

  const normalized = {} as Record<NodeId, LayoutNodePosition>;
  for (const [nodeId, rawPosition] of Object.entries(value)) {
    if (!isRecord(rawPosition)) {
      continue;
    }

    const x = rawPosition.x;
    const y = rawPosition.y;
    if (typeof x !== "number" || typeof y !== "number" || !Number.isFinite(x) || !Number.isFinite(y)) {
      continue;
    }

    normalized[nodeId as NodeId] = { x, y };
  }

  return normalized;
}

function normalizeWiresEntityState(
  wires: NetworkScopedState["wires"]
): NetworkScopedState["wires"] {
  const byId = {} as Record<WireId, Wire>;

  for (const wireId of wires.allIds) {
    const wire = wires.byId[wireId];
    if (wire === undefined) {
      continue;
    }

    const functionalDomainTag =
      typeof (wire as Partial<Wire>).functionalDomainTag === "string" &&
      (FUNCTIONAL_FILTERS as readonly string[]).includes(((wire as Partial<Wire>).functionalDomainTag ?? "").trim()) &&
      ((wire as Partial<Wire>).functionalDomainTag ?? "").trim() !== "all"
        ? ((wire as Partial<Wire>).functionalDomainTag ?? "").trim()
        : undefined;
    byId[wireId] = {
      ...wire,
      twistGroupLabel:
        typeof (wire as Partial<Wire>).twistGroupLabel === "string" &&
        ((wire as Partial<Wire>).twistGroupLabel ?? "").trim().length > 0
          ? ((wire as Partial<Wire>).twistGroupLabel ?? "").trim().slice(0, 80)
          : undefined,
      functionalDomainTag,
      sectionMm2: resolveWireSectionMm2((wire as Partial<Wire>).sectionMm2),
      currentA: normalizeWireCurrentA((wire as Partial<Wire>).currentA),
      material: normalizeWireMaterial((wire as Partial<Wire>).material),
      ...normalizeWireColorState(
        (wire as Partial<Wire>).primaryColorId,
        (wire as Partial<Wire>).secondaryColorId,
        (wire as Partial<Wire>).freeColorLabel,
        (wire as Partial<Wire>).colorMode
      ),
      endpointAConnectionReference: normalizeManufacturerReference((wire as Partial<Wire>).endpointAConnectionReference),
      endpointAConnectionName: normalizeWireEndpointReferenceName((wire as Partial<Wire>).endpointAConnectionName),
      endpointASealReference: normalizeManufacturerReference((wire as Partial<Wire>).endpointASealReference),
      endpointASealName: normalizeWireEndpointReferenceName((wire as Partial<Wire>).endpointASealName),
      endpointBConnectionReference: normalizeManufacturerReference((wire as Partial<Wire>).endpointBConnectionReference),
      endpointBConnectionName: normalizeWireEndpointReferenceName((wire as Partial<Wire>).endpointBConnectionName),
      endpointBSealReference: normalizeManufacturerReference((wire as Partial<Wire>).endpointBSealReference),
      endpointBSealName: normalizeWireEndpointReferenceName((wire as Partial<Wire>).endpointBSealName)
    };
  }

  return {
    allIds: [...wires.allIds],
    byId
  };
}

function normalizeConnectorsEntityState(
  connectors: NetworkScopedState["connectors"]
): NetworkScopedState["connectors"] {
  const byId = {} as Record<ConnectorId, Connector>;
  for (const connectorId of connectors.allIds) {
    const connector = connectors.byId[connectorId];
    if (connector === undefined) {
      continue;
    }

    byId[connectorId] = {
      ...connector,
      isMainHarnessConnector: connector.isMainHarnessConnector === true ? true : undefined,
      isTerminalConnector: connector.isTerminalConnector === true ? true : undefined,
      applyCatalogPlugs: connector.applyCatalogPlugs === false ? false : undefined,
      applyCatalogSeals: connector.applyCatalogSeals === false ? false : undefined,
      terminalOverrides: normalizeConnectorTerminalOverrides(connector.terminalOverrides, connector.cavityCount),
      manufacturerReference: normalizeManufacturerReference((connector as Partial<Connector>).manufacturerReference)
    };
  }

  return {
    allIds: [...connectors.allIds],
    byId
  };
}

function normalizeConnectorTerminalOverrides(
  overrides: Connector["terminalOverrides"],
  cavityCount: number
): Connector["terminalOverrides"] {
  if (overrides === undefined || typeof overrides !== "object") {
    return undefined;
  }
  const normalized: NonNullable<Connector["terminalOverrides"]> = {};
  for (const [key, value] of Object.entries(overrides)) {
    const cavityIndex = Number(key);
    if (!Number.isInteger(cavityIndex) || cavityIndex < 1 || cavityIndex > cavityCount) {
      continue;
    }
    const material = normalizeConnectorTerminalMaterial(value);
    if (material !== undefined) {
      normalized[cavityIndex] = material;
    }
  }
  return Object.keys(normalized).length === 0 ? undefined : normalized;
}

function normalizeHarnessAssemblyColor(value: unknown, fallback: string): string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

function normalizeHarnessAssemblies(
  value: unknown,
  allowedNetworkIds: ReadonlySet<string>
): HarnessAssembly[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const colors = ["#2563eb", "#16a34a", "#dc2626", "#9333ea", "#ca8a04", "#0891b2"];
  const assemblies: HarnessAssembly[] = [];
  for (const entry of value) {
    if (!isRecord(entry) || typeof entry.id !== "string") {
      continue;
    }
    const name = typeof entry.name === "string" ? entry.name.trim() : "";
    const technicalId = typeof entry.technicalId === "string" ? entry.technicalId.trim() : "";
    if (name.length === 0 || technicalId.length === 0) {
      continue;
    }
    const members = (Array.isArray(entry.members) ? entry.members : []).flatMap((member, index) => {
      if (!isRecord(member) || typeof member.networkId !== "string" || !allowedNetworkIds.has(member.networkId)) {
        return [];
      }
      return [
        {
          networkId: member.networkId as NetworkId,
          color: normalizeHarnessAssemblyColor(member.color, colors[index % colors.length] ?? "#2563eb")
        }
      ];
    });
    const memberIds = new Set(members.map((member) => member.networkId as string));
    const masterConnectorRefs = (Array.isArray(entry.masterConnectorRefs) ? entry.masterConnectorRefs : []).flatMap((ref) => {
      if (
        !isRecord(ref) ||
        typeof ref.networkId !== "string" ||
        typeof ref.connectorId !== "string" ||
        !memberIds.has(ref.networkId)
      ) {
        return [];
      }
      return [{ networkId: ref.networkId as NetworkId, connectorId: ref.connectorId as ConnectorId }];
    });
    const connectorLinks = (Array.isArray(entry.connectorLinks) ? entry.connectorLinks : []).flatMap((link) => {
      if (
        !isRecord(link) ||
        typeof link.id !== "string" ||
        typeof link.sourceNetworkId !== "string" ||
        typeof link.sourceConnectorId !== "string" ||
        typeof link.targetNetworkId !== "string" ||
        typeof link.targetConnectorId !== "string" ||
        !memberIds.has(link.sourceNetworkId) ||
        !memberIds.has(link.targetNetworkId)
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

    assemblies.push({
      id: entry.id as HarnessAssemblyId,
      name,
      technicalId,
      members,
      masterConnectorRefs,
      connectorLinks,
      createdAt: typeof entry.createdAt === "string" ? entry.createdAt : "2026-01-01T00:00:00.000Z",
      updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : "2026-01-01T00:00:00.000Z"
    });
  }

  return assemblies.sort((left, right) => left.technicalId.localeCompare(right.technicalId));
}

function normalizeSplicesEntityState(splices: NetworkScopedState["splices"]): NetworkScopedState["splices"] {
  const byId = {} as Record<SpliceId, Splice>;
  for (const spliceId of splices.allIds) {
    const splice = splices.byId[spliceId];
    if (splice === undefined) {
      continue;
    }
    const rawSplice = splice as Partial<Splice>;
    const portMode = normalizeSplicePortMode(rawSplice.portMode);
    const boundedPortCount =
      typeof rawSplice.portCount === "number" && Number.isInteger(rawSplice.portCount) && rawSplice.portCount > 0
        ? rawSplice.portCount
        : 1;

    byId[spliceId] = {
      ...splice,
      portMode,
      portCount:
        portMode === "bounded"
          ? boundedPortCount
          : portMode === "directional"
            ? DIRECTIONAL_SPLICE_PORT_COUNT
            : normalizeUnboundedPortCountFallback(rawSplice.portCount),
      sideInverted: rawSplice.sideInverted === true,
      manufacturerReference: normalizeManufacturerReference(rawSplice.manufacturerReference)
    };
  }

  return {
    allIds: [...splices.allIds],
    byId
  };
}

function normalizeCatalogItemsEntityState(
  catalogItems: NetworkScopedState["catalogItems"] | undefined
): NetworkScopedState["catalogItems"] {
  const empty = { byId: {} as Record<CatalogItemId, CatalogItem>, allIds: [] as CatalogItemId[] };
  if (catalogItems === undefined) {
    return empty;
  }

  const byId = {} as Record<CatalogItemId, CatalogItem>;
  const allIds: CatalogItemId[] = [];
  for (const catalogItemId of catalogItems.allIds) {
    const normalized = normalizeCatalogItem(catalogItems.byId[catalogItemId] as Partial<CatalogItem>);
    if (normalized === null) {
      continue;
    }
    byId[catalogItemId] = normalized;
    allIds.push(catalogItemId);
  }
  allIds.sort((left, right) => left.localeCompare(right));
  return { byId, allIds };
}

function isNetworkScopedState(value: unknown): value is NetworkScopedState {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isEntityState(value.connectors) &&
    (value.catalogItems === undefined || isEntityState(value.catalogItems)) &&
    isEntityState(value.splices) &&
    isEntityState(value.nodes) &&
    isEntityState(value.segments) &&
    isEntityState(value.wires) &&
    (value.nodePositions === undefined || isRecord(value.nodePositions)) &&
    isRecord(value.connectorCavityOccupancy) &&
    isRecord(value.splicePortOccupancy)
  );
}

function isExportedNetworkBundle(value: unknown): value is ExportedNetworkBundle {
  if (!isRecord(value)) {
    return false;
  }

  const network = value.network;
  const state = value.state;
  if (!isRecord(network) || !isNetworkScopedState(state)) {
    return false;
  }

  return (
    typeof network.id === "string" &&
    typeof network.name === "string" &&
    typeof network.technicalId === "string" &&
    (network.author === undefined || typeof network.author === "string") &&
    (network.projectCode === undefined || typeof network.projectCode === "string") &&
    (network.logoUrl === undefined || typeof network.logoUrl === "string") &&
    (network.exportNotes === undefined || typeof network.exportNotes === "string") &&
    typeof network.createdAt === "string" &&
    typeof network.updatedAt === "string"
  );
}

function normalizeScopedState(scoped: NetworkScopedState): NetworkScopedState {
  return bootstrapCatalogForScopedState({
    catalogItems: normalizeCatalogItemsEntityState(scoped.catalogItems),
    connectors: {
      allIds: [...scoped.connectors.allIds].sort((left, right) => left.localeCompare(right)),
      byId: normalizeConnectorsEntityState(scoped.connectors).byId
    },
    splices: {
      allIds: [...scoped.splices.allIds].sort((left, right) => left.localeCompare(right)),
      byId: normalizeSplicesEntityState(scoped.splices).byId
    },
    nodes: {
      allIds: [...scoped.nodes.allIds].sort((left, right) => left.localeCompare(right)),
      byId: { ...scoped.nodes.byId }
    },
    segments: {
      allIds: [...scoped.segments.allIds].sort((left, right) => left.localeCompare(right)),
      byId: { ...scoped.segments.byId }
    },
    wires: {
      allIds: [...scoped.wires.allIds].sort((left, right) => left.localeCompare(right)),
      byId: normalizeWiresEntityState(scoped.wires).byId
    },
    nodePositions: normalizeNodePositions(scoped.nodePositions),
    connectorCavityOccupancy: { ...scoped.connectorCavityOccupancy },
    splicePortOccupancy: { ...scoped.splicePortOccupancy }
  });
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => canonicalize(entry));
  }

  if (!isRecord(value)) {
    return value;
  }

  return Object.keys(value)
    .sort((left, right) => left.localeCompare(right))
    .reduce((result, key) => {
      result[key] = canonicalize(value[key]);
      return result;
    }, {} as PlainObject);
}

function dedupeWithSuffix(base: string, taken: Set<string>, suffix: string): string {
  if (!taken.has(base)) {
    return base;
  }

  let index = 1;
  let candidate = `${base}${suffix}`;
  while (taken.has(candidate)) {
    index += 1;
    candidate = `${base}${suffix}-${index}`;
  }
  return candidate;
}

function buildHarnessAssemblyMemberKey(networkIds: readonly NetworkId[]): string {
  return [...new Set(networkIds.map((networkId) => networkId as string))]
    .sort((left, right) => left.localeCompare(right))
    .join("|");
}

function parseIsoDate(value: string): number | null {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function normalizeImportedNetworkTimestamps(
  network: Network,
  importBaseIso: string,
  warnings: string[]
): Pick<Network, "createdAt" | "updatedAt"> {
  const rawCreatedAt = network.createdAt.trim();
  const rawUpdatedAt = network.updatedAt.trim();
  const createdAtMs = parseIsoDate(rawCreatedAt);
  const updatedAtMs = parseIsoDate(rawUpdatedAt);

  let normalizedCreatedAt = rawCreatedAt;
  let normalizedUpdatedAt = rawUpdatedAt;
  const appliedFixes: string[] = [];

  if (createdAtMs === null && updatedAtMs !== null) {
    normalizedCreatedAt = rawUpdatedAt;
    appliedFixes.push("createdAt<-updatedAt");
  } else if (createdAtMs !== null && updatedAtMs === null) {
    normalizedUpdatedAt = rawCreatedAt;
    appliedFixes.push("updatedAt<-createdAt");
  } else if (createdAtMs === null && updatedAtMs === null) {
    normalizedCreatedAt = importBaseIso;
    normalizedUpdatedAt = importBaseIso;
    appliedFixes.push("createdAt/updatedAt<-importBaseIso");
  }

  const normalizedCreatedAtMs = parseIsoDate(normalizedCreatedAt);
  const normalizedUpdatedAtMs = parseIsoDate(normalizedUpdatedAt);
  if (
    normalizedCreatedAtMs !== null &&
    normalizedUpdatedAtMs !== null &&
    normalizedUpdatedAtMs < normalizedCreatedAtMs
  ) {
    normalizedUpdatedAt = normalizedCreatedAt;
    appliedFixes.push("updatedAt>=createdAt");
  }

  if (appliedFixes.length > 0) {
    warnings.push(
      `Network '${network.technicalId}' timestamps were normalized (${appliedFixes.join(", ")}).`
    );
  }

  return {
    createdAt: normalizedCreatedAt,
    updatedAt: normalizedUpdatedAt
  };
}

function normalizeImportedNetworkMetadata(
  network: Network,
  warnings: string[]
): Pick<Network, "author" | "projectCode" | "logoUrl" | "exportNotes" | "voltageV"> {
  const normalizedAuthor = normalizeNetworkAuthor(network.author);
  const normalizedVoltageV = normalizeNetworkVoltageV(network.voltageV);
  const normalizedProjectCode = normalizeNetworkProjectCode(network.projectCode);
  const normalizedLogoUrl = normalizeNetworkLogoUrl(network.logoUrl);
  const normalizedExportNotes = normalizeNetworkExportNotes(network.exportNotes);

  const appliedFixes: string[] = [];
  if (network.voltageV !== undefined && normalizedVoltageV === undefined) {
    appliedFixes.push("voltageV<-undefined");
  }
  if (normalizedProjectCode !== undefined && !isNetworkProjectCodeValid(normalizedProjectCode)) {
    appliedFixes.push("projectCode<-undefined");
  }
  if (normalizedLogoUrl !== undefined && !isNetworkLogoUrlValid(normalizedLogoUrl)) {
    appliedFixes.push("logoUrl<-undefined");
  }

  if (appliedFixes.length > 0) {
    warnings.push(`Network '${network.technicalId}' metadata was normalized (${appliedFixes.join(", ")}).`);
  }

  return {
    author: normalizedAuthor,
    voltageV: normalizedVoltageV,
    projectCode:
      normalizedProjectCode !== undefined && isNetworkProjectCodeValid(normalizedProjectCode)
        ? normalizedProjectCode
        : undefined,
    logoUrl:
      normalizedLogoUrl !== undefined && isNetworkLogoUrlValid(normalizedLogoUrl)
        ? normalizedLogoUrl
        : undefined,
    exportNotes: normalizedExportNotes
  };
}

function resolveNetworkIdsForScope(
  state: AppState,
  scope: NetworkExportScope,
  selectedNetworkIds: NetworkId[]
): NetworkId[] {
  if (scope === "active") {
    return state.activeNetworkId === null ? [] : [state.activeNetworkId];
  }

  if (scope === "selected") {
    const selectedSet = new Set(selectedNetworkIds);
    return state.networks.allIds.filter((networkId) => selectedSet.has(networkId));
  }

  return [...state.networks.allIds];
}

export function buildNetworkFilePayload(
  state: AppState,
  scope: NetworkExportScope,
  selectedNetworkIds: NetworkId[],
  exportedAt: string
): NetworkFilePayloadV1 {
  const networkIds = resolveNetworkIdsForScope(state, scope, selectedNetworkIds);
  const networkIdSet = new Set(networkIds.map((networkId) => networkId as string));
  const bundles = networkIds
    .map((networkId) => {
      const network = state.networks.byId[networkId];
      const scoped = state.networkStates[networkId];
      if (network === undefined || scoped === undefined) {
        return null;
      }

      const normalizedProjectCode = normalizeNetworkProjectCode(network.projectCode);
      const normalizedLogoUrl = normalizeNetworkLogoUrl(network.logoUrl);
      const normalizedNetwork: Network = {
        ...network,
        voltageV: normalizeNetworkVoltageV(network.voltageV),
        author: normalizeNetworkAuthor(network.author),
        projectCode:
          normalizedProjectCode !== undefined && isNetworkProjectCodeValid(normalizedProjectCode)
            ? normalizedProjectCode
            : undefined,
        logoUrl:
          normalizedLogoUrl !== undefined && isNetworkLogoUrlValid(normalizedLogoUrl) ? normalizedLogoUrl : undefined,
        exportNotes: normalizeNetworkExportNotes(network.exportNotes)
      };

      return {
        network: normalizedNetwork,
        state: normalizeScopedState(scoped)
      } satisfies ExportedNetworkBundle;
    })
    .filter((bundle): bundle is ExportedNetworkBundle => bundle !== null)
    .sort((left, right) => left.network.technicalId.localeCompare(right.network.technicalId));

  const harnessAssemblies = state.harnessAssemblies.allIds
    .map((assemblyId) => state.harnessAssemblies.byId[assemblyId])
    .filter((assembly): assembly is HarnessAssembly => {
      if (assembly === undefined) {
        return false;
      }
      return assembly.members.some((member) => networkIdSet.has(member.networkId));
    })
    .map((assembly) => {
      const members = assembly.members.filter((member) => networkIdSet.has(member.networkId));
      const memberIds = new Set(members.map((member) => member.networkId as string));
      return {
        ...assembly,
        members,
        masterConnectorRefs: assembly.masterConnectorRefs.filter((root) => memberIds.has(root.networkId)),
        connectorLinks: assembly.connectorLinks.filter(
          (link) => memberIds.has(link.sourceNetworkId) && memberIds.has(link.targetNetworkId)
        )
      };
    })
    .filter((assembly) => assembly.members.length > 0)
    .sort((left, right) => left.technicalId.localeCompare(right.technicalId));

  return {
    payloadKind: NETWORK_FILE_PAYLOAD_KIND,
    schemaVersion: NETWORK_FILE_SCHEMA_VERSION,
    exportedAt,
    source: {
      app: "electrical-plan-editor",
      appVersion: APP_RELEASE_VERSION,
      appSchemaVersion: APP_SCHEMA_VERSION
    },
    networks: bundles,
    harnessAssemblies
  };
}

export function serializeNetworkFilePayload(payload: NetworkFilePayloadV1): string {
  const payloadForSerialization: NetworkFilePayloadV1 = {
    ...payload,
    networks: payload.networks.map((bundle) => {
      const nextSplicesById = { ...bundle.state.splices.byId };
      for (const spliceId of bundle.state.splices.allIds) {
        const splice = nextSplicesById[spliceId];
        if (splice === undefined || splice.portMode !== "unbounded") {
          continue;
        }
        const serializedSplice = { ...splice } as Partial<Splice>;
        delete serializedSplice.portCount;
        nextSplicesById[spliceId] = serializedSplice as Splice;
      }

      return {
        ...bundle,
        state: {
          ...bundle.state,
          splices: {
            ...bundle.state.splices,
            byId: nextSplicesById
          }
        }
      };
    })
  };

  return JSON.stringify(canonicalize(payloadForSerialization), null, 2);
}

export function parseNetworkFilePayload(rawJson: string): { payload: NetworkFilePayloadV1 | null; error: string | null } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson) as unknown;
  } catch {
    return {
      payload: null,
      error: "Invalid JSON file."
    };
  }

  if (!isRecord(parsed)) {
    return {
      payload: null,
      error: "Invalid file payload root."
    };
  }

  const schemaVersion = parsed.schemaVersion;
  const networks = parsed.networks;
  const exportedAt = parsed.exportedAt;
  if (!Array.isArray(networks) || typeof exportedAt !== "string") {
    return {
      payload: null,
      error: "Invalid payload structure: missing networks or exportedAt."
    };
  }

  const parsedBundles = networks.filter((bundle) => isExportedNetworkBundle(bundle));
  if (parsedBundles.length !== networks.length) {
    return {
      payload: null,
      error: "Invalid payload structure: at least one network bundle is malformed."
    };
  }

  if (typeof schemaVersion !== "number" || !Number.isInteger(schemaVersion)) {
    return {
      payload: null,
      error: "Invalid payload structure: missing or invalid schemaVersion."
    };
  }

  if (schemaVersion > NETWORK_FILE_SCHEMA_VERSION) {
    return {
      payload: null,
      error: `Unsupported file schema version '${String(schemaVersion)}' (newer than supported ${NETWORK_FILE_SCHEMA_VERSION}).`
    };
  }

  if (schemaVersion !== 0 && schemaVersion !== 1 && schemaVersion !== 2 && schemaVersion !== 3) {
    return {
      payload: null,
      error: `Unsupported file schema version '${String(schemaVersion)}'.`
    };
  }

  const rawSource = parsed.source;
  const sourceRecord = isRecord(rawSource) ? rawSource : {};
  const sourceAppVersion =
    typeof sourceRecord.appVersion === "string" && sourceRecord.appVersion.trim().length > 0
      ? sourceRecord.appVersion
      : "unknown";

  const parsedNetworkIds = new Set(parsedBundles.map((bundle) => bundle.network.id as string));
  const harnessAssemblies = normalizeHarnessAssemblies(parsed.harnessAssemblies, parsedNetworkIds);

  return {
    payload: {
      payloadKind: NETWORK_FILE_PAYLOAD_KIND,
      schemaVersion: NETWORK_FILE_SCHEMA_VERSION,
      exportedAt,
      source: {
        app: "electrical-plan-editor",
        appVersion: sourceAppVersion,
        appSchemaVersion: APP_SCHEMA_VERSION
      },
      networks: parsedBundles.map((bundle) => ({
        network: {
          ...bundle.network
        },
        state: normalizeScopedState(bundle.state)
      })),
      harnessAssemblies
    },
    error: null
  };
}

export interface OverwriteCandidate {
  importedNetworkId: string;
  importedName: string;
  importedTechnicalId: string;
  existingNetworkId: NetworkId;
  existingName: string;
  existingTechnicalId: string;
  matchReason: "technicalId" | "name" | "nameVariant";
}

export function detectOverwriteCandidates(
  payload: NetworkFilePayloadV1,
  existingNetworks: Network[]
): OverwriteCandidate[] {
  const candidates: OverwriteCandidate[] = [];
  const matchedExistingIds = new Set<string>();

  for (const bundle of payload.networks) {
    const { id: importedId, name: rawImportedName, technicalId: rawImportedTechId } = bundle.network;
    const normalizedImportedName = rawImportedName.trim().toLowerCase();
    const normalizedImportedTechId = rawImportedTechId.trim();
    const strippedImportedName = normalizedImportedName.replace(/-imp\d*$/i, "").trim();
    const strippedImportedTechId = normalizedImportedTechId.replace(/-IMP\d*$/, "");

    for (const existing of existingNetworks) {
      if (matchedExistingIds.has(existing.id as string)) {
        continue;
      }

      const normalizedExistingName = existing.name.trim().toLowerCase();
      const normalizedExistingTechId = existing.technicalId.trim();

      let matchReason: OverwriteCandidate["matchReason"] | null = null;

      if (normalizedImportedTechId === normalizedExistingTechId) {
        matchReason = "technicalId";
      } else if (normalizedImportedName === normalizedExistingName) {
        matchReason = "name";
      } else if (
        (strippedImportedName !== normalizedImportedName && strippedImportedName === normalizedExistingName) ||
        (strippedImportedTechId !== normalizedImportedTechId && strippedImportedTechId === normalizedExistingTechId)
      ) {
        matchReason = "nameVariant";
      }

      if (matchReason !== null) {
        matchedExistingIds.add(existing.id as string);
        candidates.push({
          importedNetworkId: importedId as string,
          importedName: rawImportedName.trim(),
          importedTechnicalId: normalizedImportedTechId,
          existingNetworkId: existing.id,
          existingName: existing.name.trim(),
          existingTechnicalId: normalizedExistingTechId,
          matchReason
        });
        break;
      }
    }
  }

  return candidates;
}

export function resolveImportConflicts(
  payload: NetworkFilePayloadV1,
  existingState: AppState,
  overwriteMap: ReadonlyMap<string, NetworkId> = new Map()
): NetworkImportResult {
  const importBaseIso = new Date().toISOString();
  const existingTechnicalIds = new Set(existingState.networks.allIds.map((id) => existingState.networks.byId[id]?.technicalId ?? ""));

  for (const existingId of overwriteMap.values()) {
    const overwrittenNetwork = existingState.networks.byId[existingId];
    if (overwrittenNetwork !== undefined) {
      existingTechnicalIds.delete(overwrittenNetwork.technicalId);
    }
  }

  const existingIds = new Set(existingState.networks.allIds.map((id) => id as string));
  const existingHarnessAssemblyIds = new Set(existingState.harnessAssemblies.allIds.map((id) => id as string));
  const existingHarnessAssemblyTechnicalIds = new Set(
    existingState.harnessAssemblies.allIds.map((id) => existingState.harnessAssemblies.byId[id]?.technicalId ?? "")
  );
  const overwrittenNetworkIds = new Set<string>([...overwriteMap.values()].map((id) => id as string));
  const harnessAssemblyByTechnicalId = new Map<string, HarnessAssembly>();
  const harnessAssemblyByMemberKey = new Map<string, HarnessAssembly>();
  for (const assemblyId of existingState.harnessAssemblies.allIds) {
    const assembly = existingState.harnessAssemblies.byId[assemblyId];
    if (assembly === undefined) {
      continue;
    }
    harnessAssemblyByTechnicalId.set(assembly.technicalId.trim(), assembly);
    harnessAssemblyByMemberKey.set(buildHarnessAssemblyMemberKey(assembly.members.map((member) => member.networkId)), assembly);
  }

  const summary: NetworkImportSummary = {
    importedNetworkIds: [],
    skippedNetworkIds: [],
    warnings: [],
    errors: []
  };
  const networks: Network[] = [];
  const networkStates = {} as Record<NetworkId, NetworkScopedState>;
  const importedNetworkIdBySourceId = new Map<string, NetworkId>();
  const overwriteHarnessAssemblyIds: HarnessAssemblyId[] = [];

  for (const bundle of payload.networks) {
    const sourceNetwork = bundle.network;
    const normalizedName = sourceNetwork.name.trim();
    const normalizedTechnicalId = sourceNetwork.technicalId.trim();
    if (normalizedName.length === 0 || normalizedTechnicalId.length === 0) {
      summary.errors.push(`Skipped network '${sourceNetwork.id}': name and technical ID are required.`);
      summary.skippedNetworkIds.push(sourceNetwork.id);
      continue;
    }

    let importedId = sourceNetwork.id as string;
    const targetExistingId = overwriteMap.get(importedId);

    if (targetExistingId !== undefined) {
      importedId = targetExistingId as string;
    } else if (existingIds.has(importedId)) {
      const dedupedId = dedupeWithSuffix(importedId, existingIds, "-import");
      summary.warnings.push(`Network ID '${sourceNetwork.id}' was renamed to '${dedupedId}' during import.`);
      importedId = dedupedId;
      existingIds.add(importedId);
    } else {
      existingIds.add(importedId);
    }

    let importedTechnicalId = normalizedTechnicalId;
    if (existingTechnicalIds.has(importedTechnicalId)) {
      const dedupedTechnicalId = dedupeWithSuffix(importedTechnicalId, existingTechnicalIds, "-IMP");
      summary.warnings.push(
        `Network technical ID '${normalizedTechnicalId}' was renamed to '${dedupedTechnicalId}' during import.`
      );
      importedTechnicalId = dedupedTechnicalId;
    }

    existingTechnicalIds.add(importedTechnicalId);

    const networkId = importedId as NetworkId;
    importedNetworkIdBySourceId.set(sourceNetwork.id as string, networkId);
    const normalizedTimestamps = normalizeImportedNetworkTimestamps(sourceNetwork, importBaseIso, summary.warnings);
    const normalizedMetadata = normalizeImportedNetworkMetadata(sourceNetwork, summary.warnings);
    networks.push({
      ...sourceNetwork,
      id: networkId,
      name: normalizedName,
      technicalId: importedTechnicalId,
      createdAt: normalizedTimestamps.createdAt,
      updatedAt: normalizedTimestamps.updatedAt,
      ...normalizedMetadata
    });
    networkStates[networkId] = normalizeScopedState(bundle.state);
    summary.importedNetworkIds.push(networkId);
  }

  const harnessAssemblies = (payload.harnessAssemblies ?? []).flatMap((assembly) => {
    const members = assembly.members.flatMap((member) => {
      const networkId = importedNetworkIdBySourceId.get(member.networkId as string);
      return networkId === undefined ? [] : [{ ...member, networkId }];
    });
    if (members.length === 0) {
      summary.warnings.push(`Harness assembly '${assembly.technicalId}' was skipped because none of its networks were imported.`);
      return [];
    }
    const memberIds = new Set(members.map((member) => member.networkId as string));
    const overwritesExistingNetwork = members.some((member) => overwrittenNetworkIds.has(member.networkId as string));
    const existingAssemblyForOverwrite =
      overwritesExistingNetwork
        ? existingState.harnessAssemblies.byId[assembly.id] ??
          harnessAssemblyByTechnicalId.get(assembly.technicalId.trim()) ??
          harnessAssemblyByMemberKey.get(buildHarnessAssemblyMemberKey(members.map((member) => member.networkId)))
        : undefined;
    const remapNetworkId = (networkId: NetworkId): NetworkId | null =>
      importedNetworkIdBySourceId.get(networkId as string) ?? null;
    let importedAssemblyId = (existingAssemblyForOverwrite?.id ?? assembly.id) as string;
    if (existingAssemblyForOverwrite !== undefined) {
      overwriteHarnessAssemblyIds.push(existingAssemblyForOverwrite.id);
      existingHarnessAssemblyIds.delete(existingAssemblyForOverwrite.id as string);
      existingHarnessAssemblyTechnicalIds.delete(existingAssemblyForOverwrite.technicalId.trim());
    } else if (existingHarnessAssemblyIds.has(importedAssemblyId)) {
      const dedupedAssemblyId = dedupeWithSuffix(importedAssemblyId, existingHarnessAssemblyIds, "-import");
      summary.warnings.push(`Harness assembly ID '${assembly.id}' was renamed to '${dedupedAssemblyId}' during import.`);
      importedAssemblyId = dedupedAssemblyId;
    }
    existingHarnessAssemblyIds.add(importedAssemblyId);

    let importedAssemblyTechnicalId = assembly.technicalId.trim();
    if (existingHarnessAssemblyTechnicalIds.has(importedAssemblyTechnicalId)) {
      const dedupedTechnicalId = dedupeWithSuffix(importedAssemblyTechnicalId, existingHarnessAssemblyTechnicalIds, "-IMP");
      summary.warnings.push(
        `Harness assembly technical ID '${assembly.technicalId}' was renamed to '${dedupedTechnicalId}' during import.`
      );
      importedAssemblyTechnicalId = dedupedTechnicalId;
    }
    existingHarnessAssemblyTechnicalIds.add(importedAssemblyTechnicalId);

    return [
      {
        ...assembly,
        id: importedAssemblyId as HarnessAssemblyId,
        technicalId: importedAssemblyTechnicalId,
        members,
        masterConnectorRefs: assembly.masterConnectorRefs.flatMap((root) => {
          const networkId = remapNetworkId(root.networkId);
          return networkId !== null && memberIds.has(networkId) ? [{ ...root, networkId }] : [];
        }),
        connectorLinks: assembly.connectorLinks.flatMap((link) => {
          const sourceNetworkId = remapNetworkId(link.sourceNetworkId);
          const targetNetworkId = remapNetworkId(link.targetNetworkId);
          if (sourceNetworkId === null || targetNetworkId === null) {
            return [];
          }
          return [{ ...link, sourceNetworkId, targetNetworkId }];
        })
      }
    ];
  });

  return {
    networks,
    networkStates,
    harnessAssemblies,
    overwriteHarnessAssemblyIds,
    summary
  };
}
