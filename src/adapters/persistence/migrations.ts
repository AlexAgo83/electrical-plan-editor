import { APP_RELEASE_VERSION, APP_SCHEMA_VERSION } from "../../core/schema";
import { normalizeWireColorState } from "../../core/cableColors";
import { FUNCTIONAL_FILTERS } from "../../core/functionalSchematic";
import {
  isNetworkLogoUrlValid,
  isNetworkProjectCodeValid,
  normalizeNetworkAuthor,
  normalizeNetworkExportNotes,
  normalizeNetworkIsoTimestamp,
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
import type {
  CatalogItem,
  CatalogItemId,
  Connector,
  ConnectorId,
  HarnessAssembly,
  HarnessAssemblyId,
  Network,
  NetworkId,
  NetworkNode,
  NodeId,
  Segment,
  SegmentId,
  Splice,
  SpliceId,
  Wire,
  WireId
} from "../../core/entities";
import { bootstrapCatalogForScopedState, normalizeCatalogItem, normalizeManufacturerReference } from "../../store/catalog";
import type { AppState, EntityState, LayoutNodePosition, NetworkScopedState, NetworkSummaryViewState } from "../../store";
import {
  DEFAULT_NETWORK_CREATED_AT,
  DEFAULT_NETWORK_ID,
  DEFAULT_NETWORK_TECHNICAL_ID,
  createInitialState,
  normalizeAppError,
  type AppError
} from "../../store/types";
import { normalizeHarnessAssemblyEntityState } from "./harnessAssemblyMigrations";

export const PERSISTED_STATE_SCHEMA_VERSION = 3;
export const PERSISTED_STATE_PAYLOAD_KIND = "electrical-plan-editor.workspace-state";

type PlainObject = Record<string, unknown>;

function isRecord(value: unknown): value is PlainObject {
  return typeof value === "object" && value !== null;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isEntityState(candidate: unknown): candidate is EntityState<unknown, string> {
  if (!isRecord(candidate)) {
    return false;
  }

  return isRecord(candidate.byId) && Array.isArray(candidate.allIds);
}

function normalizeNodePositions(candidate: unknown): Record<NodeId, LayoutNodePosition> {
  if (!isRecord(candidate)) {
    return {};
  }

  const normalized = {} as Record<NodeId, LayoutNodePosition>;
  for (const [nodeId, rawPosition] of Object.entries(candidate)) {
    if (!isRecord(rawPosition)) {
      continue;
    }

    const x = rawPosition.x;
    const y = rawPosition.y;
    if (!isFiniteNumber(x) || !isFiniteNumber(y)) {
      continue;
    }

    normalized[nodeId as NodeId] = { x, y };
  }

  return normalized;
}

function normalizeWireEntityState(candidate: EntityState<Wire, WireId>): EntityState<Wire, WireId> {
  const byId = {} as EntityState<Wire, WireId>["byId"];
  for (const wireId of candidate.allIds) {
    const wire = candidate.byId[wireId];
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
    allIds: [...candidate.allIds],
    byId
  };
}

function normalizeNetworkSummaryViewState(candidate: unknown): NetworkSummaryViewState | undefined {
  if (!isRecord(candidate)) {
    return undefined;
  }

  if (!isFiniteNumber(candidate.scale) || !isRecord(candidate.offset)) {
    return undefined;
  }

  const offsetX = candidate.offset.x;
  const offsetY = candidate.offset.y;
  if (!isFiniteNumber(offsetX) || !isFiniteNumber(offsetY)) {
    return undefined;
  }

  const showNetworkInfoPanels = candidate.showNetworkInfoPanels;
  const showSegmentNames = candidate.showSegmentNames;
  const showSegmentLengths = candidate.showSegmentLengths;
  const showCableCallouts = candidate.showCableCallouts;
  const showNetworkGrid = candidate.showNetworkGrid;
  const snapNodesToGrid = candidate.snapNodesToGrid;
  const lockEntityMovement = candidate.lockEntityMovement;
  const normalizedShowSegmentNames =
    showSegmentNames === undefined ? false : typeof showSegmentNames === "boolean" ? showSegmentNames : null;
  if (
    typeof showNetworkInfoPanels !== "boolean" ||
    normalizedShowSegmentNames === null ||
    typeof showSegmentLengths !== "boolean" ||
    typeof showCableCallouts !== "boolean" ||
    typeof showNetworkGrid !== "boolean" ||
    typeof snapNodesToGrid !== "boolean" ||
    typeof lockEntityMovement !== "boolean"
  ) {
    return undefined;
  }

  return {
    scale: candidate.scale,
    offset: { x: offsetX, y: offsetY },
    showNetworkInfoPanels,
    showSegmentNames: normalizedShowSegmentNames,
    showSegmentLengths,
    showCableCallouts,
    showNetworkGrid,
    snapNodesToGrid,
    lockEntityMovement
  };
}

function normalizeConnectorEntityState(
  candidate: EntityState<Connector, ConnectorId>
): EntityState<Connector, ConnectorId> {
  const byId = {} as EntityState<Connector, ConnectorId>["byId"];
  for (const connectorId of candidate.allIds) {
    const connector = candidate.byId[connectorId];
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
    allIds: [...candidate.allIds],
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

function normalizeSpliceEntityState(candidate: EntityState<Splice, SpliceId>): EntityState<Splice, SpliceId> {
  const byId = {} as EntityState<Splice, SpliceId>["byId"];
  for (const spliceId of candidate.allIds) {
    const splice = candidate.byId[spliceId];
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
    allIds: [...candidate.allIds],
    byId
  };
}

function normalizeCatalogEntityState(
  candidate: EntityState<CatalogItem, CatalogItemId>
): EntityState<CatalogItem, CatalogItemId> {
  const byId = {} as EntityState<CatalogItem, CatalogItemId>["byId"];
  const allIds: CatalogItemId[] = [];
  for (const catalogItemId of candidate.allIds) {
    const item = normalizeCatalogItem(candidate.byId[catalogItemId] as Partial<CatalogItem>);
    if (item === null) {
      continue;
    }
    byId[catalogItemId] = item;
    allIds.push(catalogItemId);
  }
  return { byId, allIds };
}

function normalizeNetworkEntityState(
  candidate: EntityState<Network, NetworkId>
): EntityState<Network, NetworkId> | null {
  const byId = {} as EntityState<Network, NetworkId>["byId"];
  const allIds: NetworkId[] = [];

  for (const networkId of candidate.allIds) {
    if (typeof networkId !== "string") {
      return null;
    }

    const network = candidate.byId[networkId];
    if (!isRecord(network)) {
      return null;
    }

    const normalizedName = typeof network.name === "string" ? network.name.trim() : "";
    const normalizedTechnicalId = typeof network.technicalId === "string" ? network.technicalId.trim() : "";
    if (normalizedName.length === 0 || normalizedTechnicalId.length === 0) {
      return null;
    }

    const normalizedCreatedAt = normalizeNetworkIsoTimestamp(network.createdAt, DEFAULT_NETWORK_CREATED_AT);
    const normalizedUpdatedAt = normalizeNetworkIsoTimestamp(network.updatedAt, normalizedCreatedAt);
    const normalizedProjectCode = normalizeNetworkProjectCode(network.projectCode);
    const normalizedLogoUrl = normalizeNetworkLogoUrl(network.logoUrl);

    byId[networkId] = {
      id: networkId,
      name: normalizedName,
      technicalId: normalizedTechnicalId,
      description: typeof network.description === "string" ? network.description.trim() || undefined : undefined,
      voltageV: normalizeNetworkVoltageV(network.voltageV),
      author: normalizeNetworkAuthor(network.author),
      projectCode:
        normalizedProjectCode !== undefined && isNetworkProjectCodeValid(normalizedProjectCode)
          ? normalizedProjectCode
          : undefined,
      logoUrl:
        normalizedLogoUrl !== undefined && isNetworkLogoUrlValid(normalizedLogoUrl) ? normalizedLogoUrl : undefined,
      exportNotes: normalizeNetworkExportNotes(network.exportNotes),
      createdAt: normalizedCreatedAt,
      updatedAt: normalizedUpdatedAt
    };
    allIds.push(networkId);
  }

  return {
    byId,
    allIds
  };
}

function normalizeNetworkScopedState(candidate: unknown): NetworkScopedState | null {
  if (!isRecord(candidate)) {
    return null;
  }

  if (
    (candidate.catalogItems !== undefined && !isEntityState(candidate.catalogItems)) ||
    !isEntityState(candidate.connectors) ||
    !isEntityState(candidate.splices) ||
    !isEntityState(candidate.nodes) ||
    !isEntityState(candidate.segments) ||
    !isEntityState(candidate.wires) ||
    !isRecord(candidate.connectorCavityOccupancy) ||
    !isRecord(candidate.splicePortOccupancy)
  ) {
    return null;
  }

  return bootstrapCatalogForScopedState({
    catalogItems:
      candidate.catalogItems !== undefined
        ? normalizeCatalogEntityState(candidate.catalogItems as EntityState<CatalogItem, CatalogItemId>)
        : ({ byId: {}, allIds: [] }),
    connectors: normalizeConnectorEntityState(candidate.connectors as EntityState<Connector, ConnectorId>),
    splices: normalizeSpliceEntityState(candidate.splices as EntityState<Splice, SpliceId>),
    nodes: candidate.nodes as NetworkScopedState["nodes"],
    segments: candidate.segments as NetworkScopedState["segments"],
    wires: normalizeWireEntityState(candidate.wires as EntityState<Wire, WireId>),
    nodePositions: normalizeNodePositions(candidate.nodePositions),
    connectorCavityOccupancy: candidate.connectorCavityOccupancy as NetworkScopedState["connectorCavityOccupancy"],
    splicePortOccupancy: candidate.splicePortOccupancy as NetworkScopedState["splicePortOccupancy"],
    networkSummaryViewState: normalizeNetworkSummaryViewState(candidate.networkSummaryViewState)
  });
}

function normalizePersistedAppError(candidate: unknown): AppError | null {
  if (candidate === null || candidate === undefined) {
    return null;
  }

  if (typeof candidate === "string") {
    return normalizeAppError(candidate);
  }

  if (typeof candidate === "object" && candidate !== null) {
    const message = "message" in candidate ? (candidate as { message?: unknown }).message : undefined;
    const code = "code" in candidate ? (candidate as { code?: unknown }).code : undefined;
    const context = "context" in candidate ? (candidate as { context?: unknown }).context : undefined;
    if (typeof message === "string" && typeof code === "string") {
      return normalizeAppError({
        code,
        message,
        context: typeof context === "object" && context !== null ? (context as Record<string, unknown>) : undefined
      });
    }
  }

  return null;
}

function normalizeAndValidateCurrentAppState(candidate: unknown): AppState | null {
  if (!isRecord(candidate)) {
    return null;
  }

  if (
    !isEntityState(candidate.networks) ||
    !isRecord(candidate.networkStates) ||
    (candidate.harnessAssemblies !== undefined && !isEntityState(candidate.harnessAssemblies)) ||
    (candidate.catalogItems !== undefined && !isEntityState(candidate.catalogItems)) ||
    !isEntityState(candidate.connectors) ||
    !isEntityState(candidate.splices) ||
    !isEntityState(candidate.nodes) ||
    !isEntityState(candidate.segments) ||
    !isEntityState(candidate.wires) ||
    !isRecord(candidate.connectorCavityOccupancy) ||
    !isRecord(candidate.splicePortOccupancy) ||
    !isRecord(candidate.ui) ||
    !isRecord(candidate.meta)
  ) {
    return null;
  }

  const rawNetworks = candidate.networks as EntityState<Network, NetworkId>;
  const normalizedNetworks = normalizeNetworkEntityState(rawNetworks);
  if (normalizedNetworks === null) {
    return null;
  }
  const rawNetworkStates = candidate.networkStates;
  const normalizedNetworkStates = {} as AppState["networkStates"];

  for (const networkId of normalizedNetworks.allIds) {
    const scoped = normalizeNetworkScopedState(rawNetworkStates[networkId]);
    if (scoped === null) {
      return null;
    }
    normalizedNetworkStates[networkId] = scoped;
  }

  const candidateState = {
    ...(candidate as unknown as AppState),
    schemaVersion: APP_SCHEMA_VERSION,
    networks: normalizedNetworks,
    harnessAssemblies: normalizeHarnessAssemblyEntityState(candidate.harnessAssemblies, normalizedNetworks),
    networkStates: normalizedNetworkStates,
    catalogItems:
      candidate.catalogItems !== undefined
        ? normalizeCatalogEntityState(candidate.catalogItems as EntityState<CatalogItem, CatalogItemId>)
        : ({ byId: {}, allIds: [] }),
    connectors: normalizeConnectorEntityState(candidate.connectors as EntityState<Connector, ConnectorId>),
    splices: normalizeSpliceEntityState(candidate.splices as EntityState<Splice, SpliceId>),
    wires: normalizeWireEntityState(candidate.wires as EntityState<Wire, WireId>),
    nodePositions: normalizeNodePositions(candidate.nodePositions),
    ui: {
      ...(candidate.ui as AppState["ui"]),
      lastError: normalizePersistedAppError((candidate.ui as { lastError?: unknown }).lastError)
    }
  } satisfies AppState;

  const knownNetworkIds = new Set(candidateState.networks.allIds);
  let nextActiveNetworkId = candidateState.activeNetworkId;
  if (nextActiveNetworkId !== null && !knownNetworkIds.has(nextActiveNetworkId)) {
    nextActiveNetworkId = candidateState.networks.allIds[0] ?? null;
  }

  const nextState: AppState = {
    ...candidateState,
    activeNetworkId: nextActiveNetworkId
  };

  if (nextActiveNetworkId !== null) {
    const activeScoped = normalizedNetworkStates[nextActiveNetworkId];
    if (activeScoped === undefined) {
      return null;
    }

    nextState.connectors = activeScoped.connectors;
    nextState.catalogItems = activeScoped.catalogItems;
    nextState.splices = activeScoped.splices;
    nextState.nodes = activeScoped.nodes;
    nextState.segments = activeScoped.segments;
    nextState.wires = activeScoped.wires;
    nextState.nodePositions = activeScoped.nodePositions;
    nextState.connectorCavityOccupancy = activeScoped.connectorCavityOccupancy;
    nextState.splicePortOccupancy = activeScoped.splicePortOccupancy;
  }
  if (nextActiveNetworkId === null && candidate.catalogItems === undefined) {
    nextState.catalogItems = { byId: {}, allIds: [] };
  }

  return nextState;
}

interface LegacySingleNetworkState {
  schemaVersion: 1;
  connectors: EntityState<Connector, ConnectorId>;
  splices: EntityState<Splice, SpliceId>;
  nodes: EntityState<NetworkNode, NodeId>;
  segments: EntityState<Segment, SegmentId>;
  wires: EntityState<Wire, WireId>;
  connectorCavityOccupancy: Record<ConnectorId, Record<number, string>>;
  splicePortOccupancy: Record<SpliceId, Record<number, string>>;
  ui: {
    selected: AppState["ui"]["selected"];
    lastError: string | AppError | null;
  };
  meta: {
    revision: number;
  };
}

function isLegacySingleNetworkState(candidate: unknown): candidate is LegacySingleNetworkState {
  if (!isRecord(candidate)) {
    return false;
  }

  if (candidate.schemaVersion !== 1) {
    return false;
  }

  return (
    isEntityState(candidate.connectors) &&
    isEntityState(candidate.splices) &&
    isEntityState(candidate.nodes) &&
    isEntityState(candidate.segments) &&
    isEntityState(candidate.wires) &&
    isRecord(candidate.connectorCavityOccupancy) &&
    isRecord(candidate.splicePortOccupancy) &&
    isRecord(candidate.ui) &&
    isRecord(candidate.meta)
  );
}

export interface PersistedStateSnapshotV1 {
  schemaVersion: number;
  createdAtIso: string;
  updatedAtIso: string;
  state: AppState;
  payloadKind?: string;
  appVersion?: string;
  appSchemaVersion?: number;
}

export interface PersistedStateSnapshot
  extends Omit<PersistedStateSnapshotV1, "schemaVersion" | "payloadKind" | "appVersion" | "appSchemaVersion"> {
  schemaVersion: typeof PERSISTED_STATE_SCHEMA_VERSION;
  payloadKind: typeof PERSISTED_STATE_PAYLOAD_KIND;
  appVersion: string;
  appSchemaVersion: typeof APP_SCHEMA_VERSION;
}

export interface PersistenceMigrationResult {
  snapshot: PersistedStateSnapshot;
  wasMigrated: boolean;
  diagnostics: string[];
}

export interface PersistenceMigrationFailure {
  code: "unsupportedFutureVersion" | "invalidPayload";
  message: string;
}

export type PersistenceMigrationAttempt =
  | ({ ok: true } & PersistenceMigrationResult)
  | {
      ok: false;
      error: PersistenceMigrationFailure;
    };

function buildCurrentSnapshotEnvelope(
  state: AppState,
  createdAtIso: string,
  updatedAtIso: string
): PersistedStateSnapshot {
  return {
    payloadKind: PERSISTED_STATE_PAYLOAD_KIND,
    schemaVersion: PERSISTED_STATE_SCHEMA_VERSION,
    appVersion: APP_RELEASE_VERSION,
    appSchemaVersion: APP_SCHEMA_VERSION,
    createdAtIso,
    updatedAtIso,
    state: {
      ...state,
      schemaVersion: APP_SCHEMA_VERSION
    }
  };
}

function asCurrentVersionedSnapshot(payload: unknown): PersistedStateSnapshot | null {
  if (!isRecord(payload)) {
    return null;
  }

  if (
    payload.payloadKind !== PERSISTED_STATE_PAYLOAD_KIND ||
    payload.schemaVersion !== PERSISTED_STATE_SCHEMA_VERSION ||
    typeof payload.appVersion !== "string" ||
    payload.appVersion.trim().length === 0 ||
    payload.appSchemaVersion !== APP_SCHEMA_VERSION
  ) {
    return null;
  }

  const createdAtIso = payload.createdAtIso;
  const updatedAtIso = payload.updatedAtIso;
  if (!isIsoDate(createdAtIso) || !isIsoDate(updatedAtIso)) {
    return null;
  }

  const normalizedState = normalizeAndValidateCurrentAppState(payload.state);
  if (normalizedState === null) {
    return null;
  }

  return buildCurrentSnapshotEnvelope(normalizedState, createdAtIso, updatedAtIso);
}

interface LegacyTimestampedSnapshotV1 {
  schemaVersion: number;
  createdAtIso: string;
  updatedAtIso: string;
  state: AppState;
}

function asLegacyTimestampedSnapshotV1(payload: unknown): LegacyTimestampedSnapshotV1 | null {
  if (!isRecord(payload)) {
    return null;
  }

  if (
    payload.schemaVersion !== APP_SCHEMA_VERSION ||
    typeof payload.createdAtIso !== "string" ||
    typeof payload.updatedAtIso !== "string" ||
    !("state" in payload)
  ) {
    return null;
  }

  if (!isIsoDate(payload.createdAtIso) || !isIsoDate(payload.updatedAtIso)) {
    return null;
  }

  const normalizedState = normalizeAndValidateCurrentAppState(payload.state);
  if (normalizedState === null) {
    return null;
  }

  return {
    schemaVersion: 1,
    createdAtIso: payload.createdAtIso,
    updatedAtIso: payload.updatedAtIso,
    state: normalizedState
  };
}

function asPreTimestampSnapshot(payload: unknown): AppState | null {
  if (!isRecord(payload) || payload.schemaVersion !== APP_SCHEMA_VERSION) {
    return null;
  }

  return normalizeAndValidateCurrentAppState(payload.state);
}

function migrateLegacySingleNetworkStateToCurrent(
  legacy: LegacySingleNetworkState,
  nowIso: string
): AppState {
  const seeded = createInitialState();
  const scoped: NetworkScopedState = {
    catalogItems: { byId: {}, allIds: [] },
    connectors: normalizeConnectorEntityState(legacy.connectors),
    splices: normalizeSpliceEntityState(legacy.splices),
    nodes: legacy.nodes,
    segments: legacy.segments,
    wires: normalizeWireEntityState(legacy.wires),
    nodePositions: {},
    connectorCavityOccupancy: legacy.connectorCavityOccupancy,
    splicePortOccupancy: legacy.splicePortOccupancy
  };
  const catalogBootstrappedScoped = bootstrapCatalogForScopedState(scoped);

  const defaultNetwork = seeded.networks.byId[DEFAULT_NETWORK_ID];
  if (defaultNetwork === undefined) {
    return seeded;
  }

  const network = {
    ...defaultNetwork,
    technicalId: DEFAULT_NETWORK_TECHNICAL_ID,
    createdAt: DEFAULT_NETWORK_CREATED_AT,
    updatedAt: nowIso
  };
  const legacySampleAssemblyId = "assembly-sample-vehicle-platform" as HarnessAssemblyId;
  const legacySampleMainConnectorId = "C-SRC" as ConnectorId;
  const harnessAssemblies =
    catalogBootstrappedScoped.connectors.byId[legacySampleMainConnectorId] === undefined
      ? ({ byId: {} as Record<HarnessAssemblyId, HarnessAssembly>, allIds: [] } satisfies AppState["harnessAssemblies"])
      : ({
          byId: {
            [legacySampleAssemblyId]: {
              id: legacySampleAssemblyId,
              name: "Vehicle platform assembly (Sample)",
              technicalId: "ASM-SAMPLE-VEHICLE",
              members: [{ networkId: network.id, color: "#2563eb" }],
              masterConnectorRefs: [{ networkId: network.id, connectorId: legacySampleMainConnectorId }],
              connectorLinks: [],
              createdAt: nowIso,
              updatedAt: nowIso
            }
          } as Record<HarnessAssemblyId, HarnessAssembly>,
          allIds: [legacySampleAssemblyId]
        } satisfies AppState["harnessAssemblies"]);

  return {
    ...seeded,
    networks: {
      byId: {
        [network.id]: network
      },
      allIds: [network.id]
    },
    harnessAssemblies,
    activeNetworkId: network.id,
    networkStates: {
      [network.id]: catalogBootstrappedScoped
    },
    catalogItems: catalogBootstrappedScoped.catalogItems,
    connectors: catalogBootstrappedScoped.connectors,
    splices: catalogBootstrappedScoped.splices,
    nodes: catalogBootstrappedScoped.nodes,
    segments: catalogBootstrappedScoped.segments,
    wires: catalogBootstrappedScoped.wires,
    nodePositions: catalogBootstrappedScoped.nodePositions,
    connectorCavityOccupancy: catalogBootstrappedScoped.connectorCavityOccupancy,
    splicePortOccupancy: catalogBootstrappedScoped.splicePortOccupancy,
    ui: {
      selected: legacy.ui.selected,
      lastError: normalizePersistedAppError(legacy.ui.lastError),
      themeMode: "warmBrown"
    },
    meta: {
      revision: legacy.meta.revision
    }
  };
}

type PipelineVersion = 1 | 2 | 3;
const CURRENT_PIPELINE_VERSION: PipelineVersion = 3;

interface PipelineSnapshot {
  version: PipelineVersion;
  createdAtIso: string;
  updatedAtIso: string;
  state: AppState;
}

type MigrationStep = (snapshot: PipelineSnapshot) => PipelineSnapshot;
const migrationStepOverrides = new Map<1 | 2, MigrationStep>();

const PIPELINE_MIGRATIONS: Record<Exclude<PipelineVersion, typeof CURRENT_PIPELINE_VERSION>, MigrationStep> = {
  1: (snapshot) => ({
    ...snapshot,
    version: 2
  }),
  2: (snapshot) => ({
    ...snapshot,
    version: 3
  })
};

function runPipeline(initial: PipelineSnapshot): { snapshot: PipelineSnapshot; diagnostics: string[] } {
  const diagnostics: string[] = [];
  let current = initial;
  while (current.version < CURRENT_PIPELINE_VERSION) {
    const currentVersion = current.version as keyof typeof PIPELINE_MIGRATIONS;
    const step = migrationStepOverrides.get(currentVersion) ?? PIPELINE_MIGRATIONS[currentVersion];
    diagnostics.push(`Applied persistence migration v${current.version} -> v${current.version + 1}.`);
    current = step(current);
  }
  return { snapshot: current, diagnostics };
}

export function setPersistenceMigrationStepOverrideForTests(
  version: 1 | 2,
  step: MigrationStep | null
): void {
  if (step === null) {
    migrationStepOverrides.delete(version);
    return;
  }

  migrationStepOverrides.set(version, step);
}

function detectUnsupportedFutureVersion(payload: unknown): PersistenceMigrationFailure | null {
  if (!isRecord(payload)) {
    return null;
  }

  const version = payload.schemaVersion;
  if (typeof version === "number" && Number.isInteger(version) && version > PERSISTED_STATE_SCHEMA_VERSION) {
    return {
      code: "unsupportedFutureVersion",
      message: `Unsupported persisted data schema version '${version}'. This data was likely created by a newer app version.`
    };
  }

  return null;
}

function validatePostMigrationState(state: AppState): string[] {
  const diagnostics: string[] = [];
  const networkIds = state.networks.allIds;
  const networkIdSet = new Set<string>(networkIds);
  if (networkIds.length === 0 && state.activeNetworkId !== null) {
    diagnostics.push("Active network ID is set while no networks exist; active selection was normalized.");
  }

  for (const networkId of networkIds) {
    if (state.networkStates[networkId] === undefined) {
      diagnostics.push(`Missing network state for '${networkId}'.`);
    }
  }

  for (const networkId of Object.keys(state.networkStates)) {
    if (!networkIdSet.has(networkId)) {
      diagnostics.push(`Orphan network state '${networkId}' was dropped during normalization.`);
    }
  }

  return diagnostics;
}

export function migratePersistedPayloadDetailed(payload: unknown, nowIso: string): PersistenceMigrationAttempt {
  const currentSnapshot = asCurrentVersionedSnapshot(payload);
  if (currentSnapshot !== null) {
    return {
      ok: true,
      snapshot: currentSnapshot,
      wasMigrated: false,
      diagnostics: validatePostMigrationState(currentSnapshot.state)
    };
  }

  const futureError = detectUnsupportedFutureVersion(payload);
  if (futureError !== null) {
    return {
      ok: false,
      error: futureError
    };
  }

  const legacyTimestamped = asLegacyTimestampedSnapshotV1(payload);
  if (legacyTimestamped !== null) {
    try {
      const pipeline = runPipeline({
        version: legacyTimestamped.schemaVersion as PipelineVersion,
        createdAtIso: legacyTimestamped.createdAtIso,
        updatedAtIso: legacyTimestamped.updatedAtIso,
        state: legacyTimestamped.state
      });

      return {
        ok: true,
        snapshot: buildCurrentSnapshotEnvelope(
          pipeline.snapshot.state,
          pipeline.snapshot.createdAtIso,
          pipeline.snapshot.updatedAtIso
        ),
        wasMigrated: true,
        diagnostics: [...pipeline.diagnostics, ...validatePostMigrationState(pipeline.snapshot.state)]
      };
    } catch {
      return {
        ok: false,
        error: {
          code: "invalidPayload",
          message: "Persisted workspace migration failed before the data could be upgraded safely."
        }
      };
    }
  }

  const currentStateWithoutTimestamp = asPreTimestampSnapshot(payload);
  if (currentStateWithoutTimestamp !== null) {
    try {
      const pipeline = runPipeline({
        version: 1,
        createdAtIso: nowIso,
        updatedAtIso: nowIso,
        state: currentStateWithoutTimestamp
      });

      return {
        ok: true,
        snapshot: buildCurrentSnapshotEnvelope(
          pipeline.snapshot.state,
          pipeline.snapshot.createdAtIso,
          pipeline.snapshot.updatedAtIso
        ),
        wasMigrated: true,
        diagnostics: [
          "Normalized legacy untimestamped persisted payload.",
          ...pipeline.diagnostics,
          ...validatePostMigrationState(pipeline.snapshot.state)
        ]
      };
    } catch {
      return {
        ok: false,
        error: {
          code: "invalidPayload",
          message: "Persisted workspace migration failed before the data could be upgraded safely."
        }
      };
    }
  }

  const legacyState = isLegacySingleNetworkState(payload)
    ? payload
    : isRecord(payload) && payload.schemaVersion === 1 && isLegacySingleNetworkState(payload.state)
      ? payload.state
      : null;

  if (legacyState !== null) {
    try {
      const migratedState = migrateLegacySingleNetworkStateToCurrent(legacyState, nowIso);
      const pipeline = runPipeline({
        version: 1,
        createdAtIso: nowIso,
        updatedAtIso: nowIso,
        state: migratedState
      });

      return {
        ok: true,
        snapshot: buildCurrentSnapshotEnvelope(
          pipeline.snapshot.state,
          pipeline.snapshot.createdAtIso,
          pipeline.snapshot.updatedAtIso
        ),
        wasMigrated: true,
        diagnostics: [
          "Normalized legacy single-network payload into multi-network workspace format.",
          ...pipeline.diagnostics,
          ...validatePostMigrationState(pipeline.snapshot.state)
        ]
      };
    } catch {
      return {
        ok: false,
        error: {
          code: "invalidPayload",
          message: "Persisted workspace migration failed before the data could be upgraded safely."
        }
      };
    }
  }

  return {
    ok: false,
    error: {
      code: "invalidPayload",
      message: "Persisted payload is invalid or unsupported."
    }
  };
}

export function migratePersistedPayload(payload: unknown, nowIso: string): PersistenceMigrationResult | null {
  const result = migratePersistedPayloadDetailed(payload, nowIso);
  if (!result.ok) {
    return null;
  }

  return {
    snapshot: result.snapshot,
    wasMigrated: result.wasMigrated,
    diagnostics: result.diagnostics
  };
}
