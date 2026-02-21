import {
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type WheelEvent as ReactWheelEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore
} from "react";
import type {
  Connector,
  ConnectorId,
  NetworkNode,
  NodeId,
  Segment,
  SegmentId,
  Splice,
  SpliceId,
  Wire,
  WireEndpoint,
  WireId
} from "../core/entities";
import {
  type AppStore,
  appActions,
  selectConnectorById,
  selectConnectorCavityStatuses,
  selectConnectorTechnicalIdTaken,
  selectConnectors,
  selectLastError,
  selectNodeById,
  selectNodes,
  selectRoutingGraphIndex,
  selectSegmentById,
  selectSegments,
  selectSelection,
  selectShortestRouteBetweenNodes,
  selectSpliceById,
  selectSplicePortStatuses,
  selectSpliceTechnicalIdTaken,
  selectSplices,
  selectSubNetworkSummaries,
  selectWireById,
  selectWireTechnicalIdTaken,
  selectWires
} from "../store";
import { appStore } from "./store";
import "./styles.css";

function useAppSnapshot(store: AppStore) {
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}

function createEntityId(prefix: string): string {
  const randomPart = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  return `${prefix}-${randomPart}`;
}

function toPositiveInteger(raw: string): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, Math.trunc(parsed));
}

function toPositiveNumber(raw: string): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return parsed;
}

function normalizeSearch(raw: string): string {
  return raw.trim().toLocaleLowerCase();
}

const NETWORK_VIEW_WIDTH = 760;
const NETWORK_VIEW_HEIGHT = 420;
const HISTORY_LIMIT = 60;
const NETWORK_GRID_STEP = 20;
const NETWORK_MIN_SCALE = 0.6;
const NETWORK_MAX_SCALE = 2.2;
const UI_PREFERENCES_SCHEMA_VERSION = 1;
const UI_PREFERENCES_STORAGE_KEY = "electrical-plan-editor.ui-preferences.v1";

interface NodePosition {
  x: number;
  y: number;
}

type SortField = "name" | "technicalId";
type SortDirection = "asc" | "desc";

interface SortState {
  field: SortField;
  direction: SortDirection;
}

interface UiPreferencesPayload {
  schemaVersion: number;
  tableDensity: TableDensity;
  defaultSortField: SortField;
  defaultSortDirection: SortDirection;
  defaultIdSortDirection: SortDirection;
  canvasDefaultShowGrid: boolean;
  canvasDefaultSnapToGrid: boolean;
  canvasResetZoomPercentInput: string;
  showShortcutHints: boolean;
  keyboardShortcutsEnabled: boolean;
}

interface ConnectorSynthesisRow {
  wireId: WireId;
  wireName: string;
  wireTechnicalId: string;
  localEndpointLabel: string;
  remoteEndpointLabel: string;
  lengthMm: number;
}

interface SpliceSynthesisRow {
  wireId: WireId;
  wireName: string;
  wireTechnicalId: string;
  localEndpointLabel: string;
  remoteEndpointLabel: string;
  lengthMm: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function snapToGrid(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName;
  if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
    return true;
  }

  return target.isContentEditable;
}

function readUiPreferences(): Partial<UiPreferencesPayload> | null {
  try {
    const raw = localStorage.getItem(UI_PREFERENCES_STORAGE_KEY);
    if (raw === null) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    const payload = parsed as Partial<UiPreferencesPayload>;
    if (payload.schemaVersion !== UI_PREFERENCES_SCHEMA_VERSION) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function sortByNameAndTechnicalId<T>(
  items: T[],
  sortState: SortState,
  getName: (item: T) => string,
  getTechnicalId: (item: T) => string
): T[] {
  return [...items].sort((left, right) => {
    const leftPrimary = sortState.field === "name" ? getName(left) : getTechnicalId(left);
    const rightPrimary = sortState.field === "name" ? getName(right) : getTechnicalId(right);
    const primaryComparison = leftPrimary.localeCompare(rightPrimary, undefined, { sensitivity: "base" });
    if (primaryComparison !== 0) {
      return sortState.direction === "asc" ? primaryComparison : -primaryComparison;
    }

    const leftSecondary = sortState.field === "name" ? getTechnicalId(left) : getName(left);
    const rightSecondary = sortState.field === "name" ? getTechnicalId(right) : getName(right);
    return leftSecondary.localeCompare(rightSecondary, undefined, { sensitivity: "base" });
  });
}

function sortById<T>(items: T[], direction: SortDirection, getId: (item: T) => string): T[] {
  return [...items].sort((left, right) => {
    const comparison = getId(left).localeCompare(getId(right), undefined, { sensitivity: "base" });
    return direction === "asc" ? comparison : -comparison;
  });
}

function nextSortState(current: SortState, field: SortField): SortState {
  if (current.field !== field) {
    return { field, direction: "asc" };
  }

  return {
    field,
    direction: current.direction === "asc" ? "desc" : "asc"
  };
}

function createNodePositionMap(nodes: NetworkNode[]): Record<NodeId, NodePosition> {
  const positions = {} as Record<NodeId, NodePosition>;
  if (nodes.length === 0) {
    return positions;
  }

  const centerX = NETWORK_VIEW_WIDTH / 2;
  const centerY = NETWORK_VIEW_HEIGHT / 2;
  if (nodes.length === 1) {
    const singleNode = nodes[0];
    if (singleNode !== undefined) {
      positions[singleNode.id] = { x: centerX, y: centerY };
    }
    return positions;
  }

  const radius = Math.min(NETWORK_VIEW_WIDTH, NETWORK_VIEW_HEIGHT) * 0.36;
  const orderedNodes = [...nodes].sort((left, right) => left.id.localeCompare(right.id));
  orderedNodes.forEach((node, index) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / orderedNodes.length;
    positions[node.id] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });

  return positions;
}

function toConnectorOccupancyKey(connectorId: ConnectorId, cavityIndex: number): string {
  return `${connectorId}:${cavityIndex}`;
}

function toSpliceOccupancyKey(spliceId: SpliceId, portIndex: number): string {
  return `${spliceId}:${portIndex}`;
}

function parseWireOccupantRef(raw: string): { wireId: WireId; side: "A" | "B" } | null {
  const trimmed = raw.trim();
  const match = /^wire:([^:]+):(A|B)$/.exec(trimmed);
  if (match === null) {
    return null;
  }

  const wireIdCandidate = match[1];
  const sideCandidate = match[2];
  if (wireIdCandidate === undefined || sideCandidate === undefined) {
    return null;
  }

  return {
    wireId: wireIdCandidate as WireId,
    side: sideCandidate as "A" | "B"
  };
}

function resolveEndpointNodeId(
  endpoint: WireEndpoint,
  connectorNodeByConnectorId: Map<ConnectorId, NodeId>,
  spliceNodeBySpliceId: Map<SpliceId, NodeId>
): NodeId | null {
  if (endpoint.kind === "connectorCavity") {
    return connectorNodeByConnectorId.get(endpoint.connectorId) ?? null;
  }

  return spliceNodeBySpliceId.get(endpoint.spliceId) ?? null;
}

function isOrderedRouteValid(
  routeSegmentIds: SegmentId[],
  startNodeId: NodeId,
  endNodeId: NodeId,
  segmentMap: Map<SegmentId, Segment>
): boolean {
  let currentNodeId = startNodeId;
  for (const segmentId of routeSegmentIds) {
    const segment = segmentMap.get(segmentId);
    if (segment === undefined) {
      return false;
    }

    if (segment.nodeA === currentNodeId) {
      currentNodeId = segment.nodeB;
      continue;
    }

    if (segment.nodeB === currentNodeId) {
      currentNodeId = segment.nodeA;
      continue;
    }

    return false;
  }

  return currentNodeId === endNodeId;
}

export interface AppProps {
  store?: AppStore;
}

type ScreenId = "modeling" | "analysis" | "validation" | "settings";
type SubScreenId = "connector" | "splice" | "node" | "segment" | "wire";
type InteractionMode = "select" | "addNode" | "addSegment" | "connect" | "route";
type TableDensity = "comfortable" | "compact";
type OccupancyFilter = "all" | "occupied" | "free";
type SegmentSubNetworkFilter = "all" | "default" | "tagged";
type ValidationSeverityFilter = "all" | "error" | "warning";

interface ValidationIssue {
  id: string;
  severity: "error" | "warning";
  category: string;
  message: string;
  subScreen: SubScreenId;
  selectionKind: "connector" | "splice" | "node" | "segment" | "wire";
  selectionId: string;
}

interface SelectionTarget {
  kind: ValidationIssue["selectionKind"];
  id: string;
}

export function App({ store = appStore }: AppProps): ReactElement {
  const state = useAppSnapshot(store);

  const connectors = selectConnectors(state);
  const splices = selectSplices(state);
  const nodes = selectNodes(state);
  const segments = selectSegments(state);
  const wires = selectWires(state);
  const routingGraph = selectRoutingGraphIndex(state);
  const subNetworkSummaries = selectSubNetworkSummaries(state);

  const connectorMap = useMemo(() => new Map(connectors.map((connector) => [connector.id, connector])), [connectors]);
  const spliceMap = useMemo(() => new Map(splices.map((splice) => [splice.id, splice])), [splices]);
  const segmentMap = useMemo(() => new Map(segments.map((segment) => [segment.id, segment])), [segments]);
  const connectorNodeByConnectorId = useMemo(
    () =>
      new Map(
        nodes
          .filter((node): node is Extract<NetworkNode, { kind: "connector" }> => node.kind === "connector")
          .map((node) => [node.connectorId, node.id])
      ),
    [nodes]
  );
  const spliceNodeBySpliceId = useMemo(
    () =>
      new Map(
        nodes
          .filter((node): node is Extract<NetworkNode, { kind: "splice" }> => node.kind === "splice")
          .map((node) => [node.spliceId, node.id])
      ),
    [nodes]
  );

  const [connectorFormMode, setConnectorFormMode] = useState<"create" | "edit">("create");
  const [editingConnectorId, setEditingConnectorId] = useState<ConnectorId | null>(null);
  const [connectorName, setConnectorName] = useState("");
  const [connectorTechnicalId, setConnectorTechnicalId] = useState("");
  const [cavityCount, setCavityCount] = useState("4");
  const [cavityIndexInput, setCavityIndexInput] = useState("1");
  const [connectorOccupantRefInput, setConnectorOccupantRefInput] = useState("manual-assignment");
  const [connectorFormError, setConnectorFormError] = useState<string | null>(null);

  const [spliceFormMode, setSpliceFormMode] = useState<"create" | "edit">("create");
  const [editingSpliceId, setEditingSpliceId] = useState<SpliceId | null>(null);
  const [spliceName, setSpliceName] = useState("");
  const [spliceTechnicalId, setSpliceTechnicalId] = useState("");
  const [portCount, setPortCount] = useState("4");
  const [portIndexInput, setPortIndexInput] = useState("1");
  const [spliceOccupantRefInput, setSpliceOccupantRefInput] = useState("manual-assignment");
  const [spliceFormError, setSpliceFormError] = useState<string | null>(null);

  const [nodeFormMode, setNodeFormMode] = useState<"create" | "edit">("create");
  const [editingNodeId, setEditingNodeId] = useState<NodeId | null>(null);
  const [nodeIdInput, setNodeIdInput] = useState("");
  const [nodeKind, setNodeKind] = useState<NetworkNode["kind"]>("intermediate");
  const [nodeConnectorId, setNodeConnectorId] = useState("");
  const [nodeSpliceId, setNodeSpliceId] = useState("");
  const [nodeLabel, setNodeLabel] = useState("");
  const [nodeFormError, setNodeFormError] = useState<string | null>(null);

  const [segmentFormMode, setSegmentFormMode] = useState<"create" | "edit">("create");
  const [editingSegmentId, setEditingSegmentId] = useState<SegmentId | null>(null);
  const [segmentIdInput, setSegmentIdInput] = useState("");
  const [segmentNodeA, setSegmentNodeA] = useState("");
  const [segmentNodeB, setSegmentNodeB] = useState("");
  const [segmentLengthMm, setSegmentLengthMm] = useState("120");
  const [segmentSubNetworkTag, setSegmentSubNetworkTag] = useState("");
  const [segmentFormError, setSegmentFormError] = useState<string | null>(null);
  const [wireFormMode, setWireFormMode] = useState<"create" | "edit">("create");
  const [editingWireId, setEditingWireId] = useState<WireId | null>(null);
  const [wireName, setWireName] = useState("");
  const [wireTechnicalId, setWireTechnicalId] = useState("");
  const [wireEndpointAKind, setWireEndpointAKind] = useState<WireEndpoint["kind"]>("connectorCavity");
  const [wireEndpointAConnectorId, setWireEndpointAConnectorId] = useState("");
  const [wireEndpointACavityIndex, setWireEndpointACavityIndex] = useState("1");
  const [wireEndpointASpliceId, setWireEndpointASpliceId] = useState("");
  const [wireEndpointAPortIndex, setWireEndpointAPortIndex] = useState("1");
  const [wireEndpointBKind, setWireEndpointBKind] = useState<WireEndpoint["kind"]>("splicePort");
  const [wireEndpointBConnectorId, setWireEndpointBConnectorId] = useState("");
  const [wireEndpointBCavityIndex, setWireEndpointBCavityIndex] = useState("1");
  const [wireEndpointBSpliceId, setWireEndpointBSpliceId] = useState("");
  const [wireEndpointBPortIndex, setWireEndpointBPortIndex] = useState("1");
  const [wireForcedRouteInput, setWireForcedRouteInput] = useState("");
  const [wireFormError, setWireFormError] = useState<string | null>(null);
  const [routePreviewStartNodeId, setRoutePreviewStartNodeId] = useState("");
  const [routePreviewEndNodeId, setRoutePreviewEndNodeId] = useState("");
  const [activeScreen, setActiveScreen] = useState<ScreenId>("modeling");
  const [activeSubScreen, setActiveSubScreen] = useState<SubScreenId>("connector");
  const [interactionMode, setInteractionMode] = useState<InteractionMode>("select");
  const [modeAnchorNodeId, setModeAnchorNodeId] = useState<NodeId | null>(null);
  const [pendingNewNodePosition, setPendingNewNodePosition] = useState<NodePosition | null>(null);
  const [connectorSearchQuery, setConnectorSearchQuery] = useState("");
  const [spliceSearchQuery, setSpliceSearchQuery] = useState("");
  const [nodeSearchQuery, setNodeSearchQuery] = useState("");
  const [segmentSearchQuery, setSegmentSearchQuery] = useState("");
  const [wireSearchQuery, setWireSearchQuery] = useState("");
  const [connectorOccupancyFilter, setConnectorOccupancyFilter] = useState<OccupancyFilter>("all");
  const [spliceOccupancyFilter, setSpliceOccupancyFilter] = useState<OccupancyFilter>("all");
  const [nodeKindFilter, setNodeKindFilter] = useState<"all" | NetworkNode["kind"]>("all");
  const [segmentSubNetworkFilter, setSegmentSubNetworkFilter] = useState<SegmentSubNetworkFilter>("all");
  const [wireRouteFilter, setWireRouteFilter] = useState<"all" | "auto" | "locked">("all");
  const [validationCategoryFilter, setValidationCategoryFilter] = useState<string>("all");
  const [validationSeverityFilter, setValidationSeverityFilter] = useState<ValidationSeverityFilter>("all");
  const [validationIssueCursor, setValidationIssueCursor] = useState(-1);
  const [connectorSort, setConnectorSort] = useState<SortState>({ field: "name", direction: "asc" });
  const [spliceSort, setSpliceSort] = useState<SortState>({ field: "name", direction: "asc" });
  const [nodeIdSortDirection, setNodeIdSortDirection] = useState<SortDirection>("asc");
  const [segmentIdSortDirection, setSegmentIdSortDirection] = useState<SortDirection>("asc");
  const [wireSort, setWireSort] = useState<SortState>({ field: "name", direction: "asc" });
  const [connectorSynthesisSort, setConnectorSynthesisSort] = useState<SortState>({
    field: "name",
    direction: "asc"
  });
  const [spliceSynthesisSort, setSpliceSynthesisSort] = useState<SortState>({
    field: "name",
    direction: "asc"
  });
  const [manualNodePositions, setManualNodePositions] = useState<Record<NodeId, NodePosition>>({} as Record<NodeId, NodePosition>);
  const [draggingNodeId, setDraggingNodeId] = useState<NodeId | null>(null);
  const [isPanningNetwork, setIsPanningNetwork] = useState(false);
  const [showNetworkGrid, setShowNetworkGrid] = useState(true);
  const [snapNodesToGrid, setSnapNodesToGrid] = useState(false);
  const [networkScale, setNetworkScale] = useState(1);
  const [networkOffset, setNetworkOffset] = useState<NodePosition>({ x: 0, y: 0 });
  const [tableDensity, setTableDensity] = useState<TableDensity>("comfortable");
  const [defaultSortField, setDefaultSortField] = useState<SortField>("name");
  const [defaultSortDirection, setDefaultSortDirection] = useState<SortDirection>("asc");
  const [defaultIdSortDirection, setDefaultIdSortDirection] = useState<SortDirection>("asc");
  const [canvasDefaultShowGrid, setCanvasDefaultShowGrid] = useState(true);
  const [canvasDefaultSnapToGrid, setCanvasDefaultSnapToGrid] = useState(false);
  const [canvasResetZoomPercentInput, setCanvasResetZoomPercentInput] = useState("100");
  const [showShortcutHints, setShowShortcutHints] = useState(true);
  const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] = useState(true);
  const [preferencesHydrated, setPreferencesHydrated] = useState(false);
  const [undoStack, setUndoStack] = useState<ReturnType<AppStore["getState"]>[]>([]);
  const [redoStack, setRedoStack] = useState<ReturnType<AppStore["getState"]>[]>([]);
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "error">("saved");
  const saveStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panStartRef = useRef<{
    clientX: number;
    clientY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const lastInspectorSelectionRef = useRef<string | null>(null);
  const undoActionRef = useRef<() => void>(() => {});
  const redoActionRef = useRef<() => void>(() => {});
  const fitNetworkToContentRef = useRef<() => void>(() => {});
  const previousValidationIssueRef = useRef<() => void>(() => {});
  const nextValidationIssueRef = useRef<() => void>(() => {});
  const activeScreenRef = useRef<ScreenId>("modeling");

  const selected = selectSelection(state);
  const selectedConnectorId = selected?.kind === "connector" ? (selected.id as ConnectorId) : null;
  const selectedSpliceId = selected?.kind === "splice" ? (selected.id as SpliceId) : null;
  const selectedNodeId = selected?.kind === "node" ? (selected.id as NodeId) : null;
  const selectedSegmentId = selected?.kind === "segment" ? (selected.id as SegmentId) : null;
  const selectedWireId = selected?.kind === "wire" ? (selected.id as WireId) : null;

  const selectedConnector =
    selectedConnectorId === null ? null : (selectConnectorById(state, selectedConnectorId) ?? null);
  const selectedSplice = selectedSpliceId === null ? null : (selectSpliceById(state, selectedSpliceId) ?? null);
  const selectedNode = selectedNodeId === null ? null : (selectNodeById(state, selectedNodeId) ?? null);
  const selectedSegment = selectedSegmentId === null ? null : (selectSegmentById(state, selectedSegmentId) ?? null);
  const selectedWire = selectedWireId === null ? null : (selectWireById(state, selectedWireId) ?? null);

  const connectorCavityStatuses = useMemo(() => {
    if (selectedConnectorId === null) {
      return [];
    }

    return selectConnectorCavityStatuses(state, selectedConnectorId);
  }, [state, selectedConnectorId]);

  const splicePortStatuses = useMemo(() => {
    if (selectedSpliceId === null) {
      return [];
    }

    return selectSplicePortStatuses(state, selectedSpliceId);
  }, [state, selectedSpliceId]);

  const connectorIdExcludedFromUniqueness =
    connectorFormMode === "edit" ? editingConnectorId ?? undefined : undefined;
  const connectorTechnicalIdAlreadyUsed =
    connectorTechnicalId.trim().length > 0 &&
    selectConnectorTechnicalIdTaken(state, connectorTechnicalId.trim(), connectorIdExcludedFromUniqueness);

  const spliceIdExcludedFromUniqueness = spliceFormMode === "edit" ? editingSpliceId ?? undefined : undefined;
  const spliceTechnicalIdAlreadyUsed =
    spliceTechnicalId.trim().length > 0 &&
    selectSpliceTechnicalIdTaken(state, spliceTechnicalId.trim(), spliceIdExcludedFromUniqueness);
  const wireIdExcludedFromUniqueness = wireFormMode === "edit" ? editingWireId ?? undefined : undefined;
  const wireTechnicalIdAlreadyUsed =
    wireTechnicalId.trim().length > 0 &&
    selectWireTechnicalIdTaken(state, wireTechnicalId.trim(), wireIdExcludedFromUniqueness);

  const totalEdgeEntries = routingGraph.nodeIds.reduce(
    (sum, nodeId) => sum + (routingGraph.edgesByNodeId[nodeId]?.length ?? 0),
    0
  );
  const routePreview = useMemo(() => {
    if (routePreviewStartNodeId.length === 0 || routePreviewEndNodeId.length === 0) {
      return null;
    }

    return selectShortestRouteBetweenNodes(
      state,
      routePreviewStartNodeId as NodeId,
      routePreviewEndNodeId as NodeId
    );
  }, [state, routePreviewStartNodeId, routePreviewEndNodeId]);
  const selectedWireRouteSegmentIds = useMemo(() => new Set(selectedWire?.routeSegmentIds ?? []), [selectedWire]);
  const autoNodePositions = useMemo(() => createNodePositionMap(nodes), [nodes]);
  const networkNodePositions = useMemo(() => {
    const merged = { ...autoNodePositions };
    for (const node of nodes) {
      const manualPosition = manualNodePositions[node.id];
      if (manualPosition !== undefined) {
        merged[node.id] = manualPosition;
      }
    }
    return merged;
  }, [autoNodePositions, manualNodePositions, nodes]);
  const isModelingScreen = activeScreen === "modeling";
  const isAnalysisScreen = activeScreen === "analysis";
  const isValidationScreen = activeScreen === "validation";
  const isSettingsScreen = activeScreen === "settings";
  const isUndoAvailable = undoStack.length > 0;
  const isRedoAvailable = redoStack.length > 0;
  const isConnectorSubScreen = activeSubScreen === "connector";
  const isSpliceSubScreen = activeSubScreen === "splice";
  const isNodeSubScreen = activeSubScreen === "node";
  const isSegmentSubScreen = activeSubScreen === "segment";
  const isWireSubScreen = activeSubScreen === "wire";
  const selectedSubScreen = selected?.kind === undefined ? null : (selected.kind as SubScreenId);
  const appShellClassName = tableDensity === "compact" ? "app-shell table-density-compact" : "app-shell";
  const configuredResetScale = useMemo(() => {
    const parsedPercent = Number(canvasResetZoomPercentInput);
    if (!Number.isFinite(parsedPercent) || parsedPercent <= 0) {
      return 1;
    }

    return clamp(parsedPercent / 100, NETWORK_MIN_SCALE, NETWORK_MAX_SCALE);
  }, [canvasResetZoomPercentInput]);
  const configuredResetZoomPercent = Math.round(configuredResetScale * 100);

  useEffect(() => {
    const preferences = readUiPreferences();
    if (preferences !== null) {
      const sortField = preferences.defaultSortField === "technicalId" ? "technicalId" : "name";
      const sortDirection = preferences.defaultSortDirection === "desc" ? "desc" : "asc";
      const idSortDirection = preferences.defaultIdSortDirection === "desc" ? "desc" : "asc";
      const showGridDefault =
        typeof preferences.canvasDefaultShowGrid === "boolean" ? preferences.canvasDefaultShowGrid : true;
      const snapDefault =
        typeof preferences.canvasDefaultSnapToGrid === "boolean" ? preferences.canvasDefaultSnapToGrid : false;
      const rawResetZoomPercent =
        typeof preferences.canvasResetZoomPercentInput === "string" ? preferences.canvasResetZoomPercentInput : "100";
      const parsedResetZoomPercent = Number(rawResetZoomPercent);
      const resetScale = Number.isFinite(parsedResetZoomPercent)
        ? clamp(parsedResetZoomPercent / 100, NETWORK_MIN_SCALE, NETWORK_MAX_SCALE)
        : 1;

      setTableDensity(preferences.tableDensity === "compact" ? "compact" : "comfortable");
      setDefaultSortField(sortField);
      setDefaultSortDirection(sortDirection);
      setDefaultIdSortDirection(idSortDirection);
      setConnectorSort({ field: sortField, direction: sortDirection });
      setSpliceSort({ field: sortField, direction: sortDirection });
      setWireSort({ field: sortField, direction: sortDirection });
      setConnectorSynthesisSort({ field: sortField, direction: sortDirection });
      setSpliceSynthesisSort({ field: sortField, direction: sortDirection });
      setNodeIdSortDirection(idSortDirection);
      setSegmentIdSortDirection(idSortDirection);
      setCanvasDefaultShowGrid(showGridDefault);
      setCanvasDefaultSnapToGrid(snapDefault);
      setShowNetworkGrid(showGridDefault);
      setSnapNodesToGrid(snapDefault);
      setCanvasResetZoomPercentInput(rawResetZoomPercent);
      setNetworkScale(resetScale);
      setNetworkOffset({ x: 0, y: 0 });
      setShowShortcutHints(
        typeof preferences.showShortcutHints === "boolean" ? preferences.showShortcutHints : true
      );
      setKeyboardShortcutsEnabled(
        typeof preferences.keyboardShortcutsEnabled === "boolean" ? preferences.keyboardShortcutsEnabled : true
      );
    }

    setPreferencesHydrated(true);
  }, []);

  useEffect(() => {
    if (!preferencesHydrated) {
      return;
    }

    const payload: UiPreferencesPayload = {
      schemaVersion: UI_PREFERENCES_SCHEMA_VERSION,
      tableDensity,
      defaultSortField,
      defaultSortDirection,
      defaultIdSortDirection,
      canvasDefaultShowGrid,
      canvasDefaultSnapToGrid,
      canvasResetZoomPercentInput,
      showShortcutHints,
      keyboardShortcutsEnabled
    };

    try {
      localStorage.setItem(UI_PREFERENCES_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage write failures to preserve runtime behavior.
    }
  }, [
    canvasDefaultShowGrid,
    canvasDefaultSnapToGrid,
    canvasResetZoomPercentInput,
    defaultIdSortDirection,
    defaultSortDirection,
    defaultSortField,
    keyboardShortcutsEnabled,
    preferencesHydrated,
    showShortcutHints,
    tableDensity
  ]);
  const describeWireEndpoint = useCallback((endpoint: WireEndpoint): string => {
    if (endpoint.kind === "connectorCavity") {
      const connector = connectorMap.get(endpoint.connectorId);
      if (connector === undefined) {
        return `Connector ${endpoint.connectorId} / C${endpoint.cavityIndex}`;
      }

      return `${connector.name} (${connector.technicalId}) / C${endpoint.cavityIndex}`;
    }

    const splice = spliceMap.get(endpoint.spliceId);
    if (splice === undefined) {
      return `Splice ${endpoint.spliceId} / P${endpoint.portIndex}`;
    }

    return `${splice.name} (${splice.technicalId}) / P${endpoint.portIndex}`;
  }, [connectorMap, spliceMap]);

  useEffect(() => {
    activeScreenRef.current = activeScreen;
  }, [activeScreen]);

  useEffect(() => {
    const validNodeIds = new Set(nodes.map((node) => node.id));
    setManualNodePositions((previous) => {
      let changed = false;
      const next = {} as Record<NodeId, NodePosition>;
      for (const nodeId of Object.keys(previous) as NodeId[]) {
        const position = previous[nodeId];
        if (position !== undefined && validNodeIds.has(nodeId)) {
          next[nodeId] = position;
          continue;
        }

        changed = true;
      }

      return changed ? next : previous;
    });
  }, [nodes]);

  useEffect(() => {
    setModeAnchorNodeId(null);
    if (interactionMode !== "addNode") {
      setPendingNewNodePosition(null);
    }
  }, [interactionMode]);

  useEffect(() => {
    const selectionKey = selected === null ? null : `${selected.kind}:${selected.id}`;
    const hasSelectionChanged = selectionKey !== lastInspectorSelectionRef.current;
    lastInspectorSelectionRef.current = selectionKey;

    if (!isModelingScreen || selected === null || !hasSelectionChanged) {
      return;
    }

    const selectedKind = selected.kind as SubScreenId;
    if (activeSubScreen !== selectedKind) {
      setActiveSubScreen(selectedKind);
    }
  }, [activeSubScreen, isModelingScreen, selected]);

  const connectorSynthesisRows = useMemo<ConnectorSynthesisRow[]>(() => {
    if (selectedConnector === null) {
      return [];
    }

    return wires.flatMap((wire) => {
      const entries: ConnectorSynthesisRow[] = [];

      if (wire.endpointA.kind === "connectorCavity" && wire.endpointA.connectorId === selectedConnector.id) {
        entries.push({
          wireId: wire.id,
          wireName: wire.name,
          wireTechnicalId: wire.technicalId,
          localEndpointLabel: `C${wire.endpointA.cavityIndex}`,
          remoteEndpointLabel: describeWireEndpoint(wire.endpointB),
          lengthMm: wire.lengthMm
        });
      }

      if (wire.endpointB.kind === "connectorCavity" && wire.endpointB.connectorId === selectedConnector.id) {
        entries.push({
          wireId: wire.id,
          wireName: wire.name,
          wireTechnicalId: wire.technicalId,
          localEndpointLabel: `C${wire.endpointB.cavityIndex}`,
          remoteEndpointLabel: describeWireEndpoint(wire.endpointA),
          lengthMm: wire.lengthMm
        });
      }

      return entries;
    });
  }, [describeWireEndpoint, selectedConnector, wires]);

  const spliceSynthesisRows = useMemo<SpliceSynthesisRow[]>(() => {
    if (selectedSplice === null) {
      return [];
    }

    return wires.flatMap((wire) => {
      const entries: SpliceSynthesisRow[] = [];

      if (wire.endpointA.kind === "splicePort" && wire.endpointA.spliceId === selectedSplice.id) {
        entries.push({
          wireId: wire.id,
          wireName: wire.name,
          wireTechnicalId: wire.technicalId,
          localEndpointLabel: `P${wire.endpointA.portIndex}`,
          remoteEndpointLabel: describeWireEndpoint(wire.endpointB),
          lengthMm: wire.lengthMm
        });
      }

      if (wire.endpointB.kind === "splicePort" && wire.endpointB.spliceId === selectedSplice.id) {
        entries.push({
          wireId: wire.id,
          wireName: wire.name,
          wireTechnicalId: wire.technicalId,
          localEndpointLabel: `P${wire.endpointB.portIndex}`,
          remoteEndpointLabel: describeWireEndpoint(wire.endpointA),
          lengthMm: wire.lengthMm
        });
      }

      return entries;
    });
  }, [describeWireEndpoint, selectedSplice, wires]);

  const sortedConnectors = useMemo(
    () => sortByNameAndTechnicalId(connectors, connectorSort, (connector) => connector.name, (connector) => connector.technicalId),
    [connectors, connectorSort]
  );
  const sortedSplices = useMemo(
    () => sortByNameAndTechnicalId(splices, spliceSort, (splice) => splice.name, (splice) => splice.technicalId),
    [splices, spliceSort]
  );
  const sortedNodes = useMemo(() => sortById(nodes, nodeIdSortDirection, (node) => node.id), [nodes, nodeIdSortDirection]);
  const sortedSegments = useMemo(
    () => sortById(segments, segmentIdSortDirection, (segment) => segment.id),
    [segments, segmentIdSortDirection]
  );
  const sortedWires = useMemo(
    () => sortByNameAndTechnicalId(wires, wireSort, (wire) => wire.name, (wire) => wire.technicalId),
    [wires, wireSort]
  );
  const sortedConnectorSynthesisRows = useMemo(
    () =>
      sortByNameAndTechnicalId(
        connectorSynthesisRows,
        connectorSynthesisSort,
        (row) => row.wireName,
        (row) => row.wireTechnicalId
      ),
    [connectorSynthesisRows, connectorSynthesisSort]
  );
  const sortedSpliceSynthesisRows = useMemo(
    () =>
      sortByNameAndTechnicalId(
        spliceSynthesisRows,
        spliceSynthesisSort,
        (row) => row.wireName,
        (row) => row.wireTechnicalId
      ),
    [spliceSynthesisRows, spliceSynthesisSort]
  );
  const normalizedConnectorSearch = normalizeSearch(connectorSearchQuery);
  const normalizedSpliceSearch = normalizeSearch(spliceSearchQuery);
  const normalizedNodeSearch = normalizeSearch(nodeSearchQuery);
  const normalizedSegmentSearch = normalizeSearch(segmentSearchQuery);
  const normalizedWireSearch = normalizeSearch(wireSearchQuery);
  const connectorOccupiedCountById = useMemo(() => {
    const result = new Map<ConnectorId, number>();
    for (const connector of connectors) {
      const occupiedCount = selectConnectorCavityStatuses(state, connector.id).filter((slot) => slot.isOccupied).length;
      result.set(connector.id, occupiedCount);
    }

    return result;
  }, [connectors, state]);
  const spliceOccupiedCountById = useMemo(() => {
    const result = new Map<SpliceId, number>();
    for (const splice of splices) {
      const occupiedCount = selectSplicePortStatuses(state, splice.id).filter((slot) => slot.isOccupied).length;
      result.set(splice.id, occupiedCount);
    }

    return result;
  }, [splices, state]);
  const visibleConnectors = useMemo(
    () => {
      return sortedConnectors.filter((connector) => {
        const occupiedCount = connectorOccupiedCountById.get(connector.id) ?? 0;
        if (connectorOccupancyFilter === "occupied" && occupiedCount === 0) {
          return false;
        }

        if (connectorOccupancyFilter === "free" && occupiedCount > 0) {
          return false;
        }

        return `${connector.name} ${connector.technicalId}`.toLocaleLowerCase().includes(normalizedConnectorSearch);
      });
    },
    [connectorOccupiedCountById, connectorOccupancyFilter, normalizedConnectorSearch, sortedConnectors]
  );
  const visibleSplices = useMemo(
    () => {
      return sortedSplices.filter((splice) => {
        const occupiedCount = spliceOccupiedCountById.get(splice.id) ?? 0;
        if (spliceOccupancyFilter === "occupied" && occupiedCount === 0) {
          return false;
        }

        if (spliceOccupancyFilter === "free" && occupiedCount > 0) {
          return false;
        }

        return `${splice.name} ${splice.technicalId}`.toLocaleLowerCase().includes(normalizedSpliceSearch);
      });
    },
    [normalizedSpliceSearch, sortedSplices, spliceOccupancyFilter, spliceOccupiedCountById]
  );
  const visibleNodes = useMemo(
    () =>
      sortedNodes.filter((node) => {
        if (nodeKindFilter !== "all" && node.kind !== nodeKindFilter) {
          return false;
        }

        if (normalizedNodeSearch.length === 0) {
          return true;
        }

        if (node.kind === "intermediate") {
          return `${node.id} ${node.label}`.toLocaleLowerCase().includes(normalizedNodeSearch);
        }

        if (node.kind === "connector") {
          const connector = connectorMap.get(node.connectorId);
          return `${node.id} ${node.connectorId} ${connector?.name ?? ""} ${connector?.technicalId ?? ""}`
            .toLocaleLowerCase()
            .includes(normalizedNodeSearch);
        }

        const splice = spliceMap.get(node.spliceId);
        return `${node.id} ${node.spliceId} ${splice?.name ?? ""} ${splice?.technicalId ?? ""}`
          .toLocaleLowerCase()
          .includes(normalizedNodeSearch);
      }),
    [connectorMap, nodeKindFilter, normalizedNodeSearch, sortedNodes, spliceMap]
  );
  const visibleSegments = useMemo(
    () => {
      return sortedSegments.filter((segment) => {
        const normalizedSubNetworkTag = segment.subNetworkTag?.trim() ?? "";
        if (segmentSubNetworkFilter === "default" && normalizedSubNetworkTag.length > 0) {
          return false;
        }

        if (segmentSubNetworkFilter === "tagged" && normalizedSubNetworkTag.length === 0) {
          return false;
        }

        return `${segment.id} ${segment.nodeA} ${segment.nodeB} ${segment.subNetworkTag ?? ""}`
          .toLocaleLowerCase()
          .includes(normalizedSegmentSearch);
      });
    },
    [normalizedSegmentSearch, segmentSubNetworkFilter, sortedSegments]
  );
  const visibleWires = useMemo(
    () =>
      sortedWires.filter((wire) => {
        if (wireRouteFilter === "locked" && !wire.isRouteLocked) {
          return false;
        }

        if (wireRouteFilter === "auto" && wire.isRouteLocked) {
          return false;
        }

        if (normalizedWireSearch.length === 0) {
          return true;
        }

        return `${wire.name} ${wire.technicalId}`.toLocaleLowerCase().includes(normalizedWireSearch);
      }),
    [normalizedWireSearch, sortedWires, wireRouteFilter]
  );
  const validationIssues = useMemo<ValidationIssue[]>(() => {
    const issues: ValidationIssue[] = [];

    const expectedConnectorOccupancy = new Map<string, string>();
    const expectedSpliceOccupancy = new Map<string, string>();

    function registerExpectedWireOccupancy(endpoint: WireEndpoint, occupantRef: string): void {
      if (endpoint.kind === "connectorCavity") {
        const key = toConnectorOccupancyKey(endpoint.connectorId, endpoint.cavityIndex);
        const existing = expectedConnectorOccupancy.get(key);
        if (existing !== undefined && existing !== occupantRef) {
          issues.push({
            id: `occupancy-duplicate-connector-${key}`,
            severity: "error",
            category: "Occupancy conflict",
            message: `Connector cavity ${endpoint.connectorId}/C${endpoint.cavityIndex} has multiple wire assignments.`,
            subScreen: "connector",
            selectionKind: "connector",
            selectionId: endpoint.connectorId
          });
        }
        expectedConnectorOccupancy.set(key, occupantRef);
        return;
      }

      const key = toSpliceOccupancyKey(endpoint.spliceId, endpoint.portIndex);
      const existing = expectedSpliceOccupancy.get(key);
      if (existing !== undefined && existing !== occupantRef) {
        issues.push({
          id: `occupancy-duplicate-splice-${key}`,
          severity: "error",
          category: "Occupancy conflict",
          message: `Splice port ${endpoint.spliceId}/P${endpoint.portIndex} has multiple wire assignments.`,
          subScreen: "splice",
          selectionKind: "splice",
          selectionId: endpoint.spliceId
        });
      }
      expectedSpliceOccupancy.set(key, occupantRef);
    }

    for (const node of nodes) {
      if (node.kind === "connector" && connectorMap.get(node.connectorId) === undefined) {
        issues.push({
          id: `node-missing-connector-${node.id}`,
          severity: "error",
          category: "Missing reference",
          message: `Node '${node.id}' references missing connector '${node.connectorId}'.`,
          subScreen: "node",
          selectionKind: "node",
          selectionId: node.id
        });
      }

      if (node.kind === "splice" && spliceMap.get(node.spliceId) === undefined) {
        issues.push({
          id: `node-missing-splice-${node.id}`,
          severity: "error",
          category: "Missing reference",
          message: `Node '${node.id}' references missing splice '${node.spliceId}'.`,
          subScreen: "node",
          selectionKind: "node",
          selectionId: node.id
        });
      }

      if (node.kind === "intermediate" && node.label.trim().length === 0) {
        issues.push({
          id: `node-missing-label-${node.id}`,
          severity: "error",
          category: "Incomplete required fields",
          message: `Intermediate node '${node.id}' is missing its label.`,
          subScreen: "node",
          selectionKind: "node",
          selectionId: node.id
        });
      }
    }

    for (const segment of segments) {
      if (state.nodes.byId[segment.nodeA] === undefined || state.nodes.byId[segment.nodeB] === undefined) {
        issues.push({
          id: `segment-missing-node-${segment.id}`,
          severity: "error",
          category: "Missing reference",
          message: `Segment '${segment.id}' has an endpoint that is no longer available.`,
          subScreen: "segment",
          selectionKind: "segment",
          selectionId: segment.id
        });
      }

      if (!Number.isFinite(segment.lengthMm) || segment.lengthMm <= 0) {
        issues.push({
          id: `segment-invalid-length-${segment.id}`,
          severity: "error",
          category: "Incomplete required fields",
          message: `Segment '${segment.id}' must have a strictly positive length.`,
          subScreen: "segment",
          selectionKind: "segment",
          selectionId: segment.id
        });
      }
    }

    for (const connector of connectors) {
      if (connector.name.trim().length === 0 || connector.technicalId.trim().length === 0 || connector.cavityCount < 1) {
        issues.push({
          id: `connector-required-fields-${connector.id}`,
          severity: "error",
          category: "Incomplete required fields",
          message: `Connector '${connector.id}' is missing required fields or has invalid cavity count.`,
          subScreen: "connector",
          selectionKind: "connector",
          selectionId: connector.id
        });
      }
    }

    for (const splice of splices) {
      if (splice.name.trim().length === 0 || splice.technicalId.trim().length === 0 || splice.portCount < 1) {
        issues.push({
          id: `splice-required-fields-${splice.id}`,
          severity: "error",
          category: "Incomplete required fields",
          message: `Splice '${splice.id}' is missing required fields or has invalid port count.`,
          subScreen: "splice",
          selectionKind: "splice",
          selectionId: splice.id
        });
      }
    }

    for (const wire of wires) {
      if (wire.endpointA.kind === "connectorCavity" && connectorMap.get(wire.endpointA.connectorId) === undefined) {
        issues.push({
          id: `wire-missing-connector-a-${wire.id}`,
          severity: "error",
          category: "Missing reference",
          message: `Wire '${wire.technicalId}' endpoint A references missing connector '${wire.endpointA.connectorId}'.`,
          subScreen: "wire",
          selectionKind: "wire",
          selectionId: wire.id
        });
      }
      if (wire.endpointA.kind === "splicePort" && spliceMap.get(wire.endpointA.spliceId) === undefined) {
        issues.push({
          id: `wire-missing-splice-a-${wire.id}`,
          severity: "error",
          category: "Missing reference",
          message: `Wire '${wire.technicalId}' endpoint A references missing splice '${wire.endpointA.spliceId}'.`,
          subScreen: "wire",
          selectionKind: "wire",
          selectionId: wire.id
        });
      }
      if (wire.endpointB.kind === "connectorCavity" && connectorMap.get(wire.endpointB.connectorId) === undefined) {
        issues.push({
          id: `wire-missing-connector-b-${wire.id}`,
          severity: "error",
          category: "Missing reference",
          message: `Wire '${wire.technicalId}' endpoint B references missing connector '${wire.endpointB.connectorId}'.`,
          subScreen: "wire",
          selectionKind: "wire",
          selectionId: wire.id
        });
      }
      if (wire.endpointB.kind === "splicePort" && spliceMap.get(wire.endpointB.spliceId) === undefined) {
        issues.push({
          id: `wire-missing-splice-b-${wire.id}`,
          severity: "error",
          category: "Missing reference",
          message: `Wire '${wire.technicalId}' endpoint B references missing splice '${wire.endpointB.spliceId}'.`,
          subScreen: "wire",
          selectionKind: "wire",
          selectionId: wire.id
        });
      }

      if (wire.name.trim().length === 0 || wire.technicalId.trim().length === 0) {
        issues.push({
          id: `wire-required-fields-${wire.id}`,
          severity: "error",
          category: "Incomplete required fields",
          message: `Wire '${wire.id}' is missing required name or technical ID.`,
          subScreen: "wire",
          selectionKind: "wire",
          selectionId: wire.id
        });
      }

      registerExpectedWireOccupancy(wire.endpointA, `wire:${wire.id}:A`);
      registerExpectedWireOccupancy(wire.endpointB, `wire:${wire.id}:B`);

      if (wire.routeSegmentIds.length === 0) {
        issues.push({
          id: `wire-empty-route-${wire.id}`,
          severity: wire.isRouteLocked ? "error" : "warning",
          category: "Route lock validity",
          message: wire.isRouteLocked
            ? `Wire '${wire.technicalId}' is route-locked but has no segment in its forced route.`
            : `Wire '${wire.technicalId}' currently has an empty auto-route.`,
          subScreen: "wire",
          selectionKind: "wire",
          selectionId: wire.id
        });
      }

      const missingRouteSegmentIds = wire.routeSegmentIds.filter((segmentId) => state.segments.byId[segmentId] === undefined);
      if (missingRouteSegmentIds.length > 0) {
        issues.push({
          id: `wire-missing-route-segment-${wire.id}`,
          severity: "error",
          category: "Route lock validity",
          message: `Wire '${wire.technicalId}' route references missing segments: ${missingRouteSegmentIds.join(", ")}.`,
          subScreen: "wire",
          selectionKind: "wire",
          selectionId: wire.id
        });
      } else if (wire.routeSegmentIds.length > 0 && wire.isRouteLocked) {
        const startNodeId = resolveEndpointNodeId(wire.endpointA, connectorNodeByConnectorId, spliceNodeBySpliceId);
        const endNodeId = resolveEndpointNodeId(wire.endpointB, connectorNodeByConnectorId, spliceNodeBySpliceId);
        if (startNodeId === null || endNodeId === null) {
          issues.push({
            id: `wire-locked-route-missing-endpoint-node-${wire.id}`,
            severity: "error",
            category: "Route lock validity",
            message: `Wire '${wire.technicalId}' is route-locked but at least one endpoint node is missing.`,
            subScreen: "wire",
            selectionKind: "wire",
            selectionId: wire.id
          });
        } else if (!isOrderedRouteValid(wire.routeSegmentIds, startNodeId, endNodeId, segmentMap)) {
          issues.push({
            id: `wire-locked-route-invalid-chain-${wire.id}`,
            severity: "error",
            category: "Route lock validity",
            message: `Wire '${wire.technicalId}' has an invalid forced route chain between its endpoints.`,
            subScreen: "wire",
            selectionKind: "wire",
            selectionId: wire.id
          });
        }
      }
    }

    for (const [connectorId, occupancyByCavity] of Object.entries(state.connectorCavityOccupancy)) {
      const typedConnectorId = connectorId as ConnectorId;
      for (const [cavityIndexRaw, occupantRef] of Object.entries(occupancyByCavity)) {
        if (occupantRef.trim().length === 0) {
          continue;
        }

        const cavityIndex = Number(cavityIndexRaw);
        const key = toConnectorOccupancyKey(typedConnectorId, cavityIndex);
        const expectedRef = expectedConnectorOccupancy.get(key);
        if (expectedRef === undefined) {
          issues.push({
            id: `connector-manual-occupancy-${typedConnectorId}-${cavityIndex}`,
            severity: "warning",
            category: "Occupancy conflict",
            message: `Connector '${typedConnectorId}' cavity C${cavityIndex} is occupied by '${occupantRef}' without linked wire endpoint.`,
            subScreen: "connector",
            selectionKind: "connector",
            selectionId: typedConnectorId
          });
          continue;
        }

        if (expectedRef !== occupantRef) {
          issues.push({
            id: `connector-occupancy-mismatch-${typedConnectorId}-${cavityIndex}`,
            severity: "error",
            category: "Occupancy conflict",
            message: `Connector '${typedConnectorId}' cavity C${cavityIndex} occupancy mismatch ('${occupantRef}' vs expected '${expectedRef}').`,
            subScreen: "connector",
            selectionKind: "connector",
            selectionId: typedConnectorId
          });
        }

        const parsed = parseWireOccupantRef(occupantRef);
        if (parsed !== null && state.wires.byId[parsed.wireId] === undefined) {
          issues.push({
            id: `connector-occupancy-missing-wire-${typedConnectorId}-${cavityIndex}`,
            severity: "error",
            category: "Occupancy conflict",
            message: `Connector '${typedConnectorId}' cavity C${cavityIndex} references unknown wire '${parsed.wireId}'.`,
            subScreen: "connector",
            selectionKind: "connector",
            selectionId: typedConnectorId
          });
        }
      }
    }

    for (const [spliceId, occupancyByPort] of Object.entries(state.splicePortOccupancy)) {
      const typedSpliceId = spliceId as SpliceId;
      for (const [portIndexRaw, occupantRef] of Object.entries(occupancyByPort)) {
        if (occupantRef.trim().length === 0) {
          continue;
        }

        const portIndex = Number(portIndexRaw);
        const key = toSpliceOccupancyKey(typedSpliceId, portIndex);
        const expectedRef = expectedSpliceOccupancy.get(key);
        if (expectedRef === undefined) {
          issues.push({
            id: `splice-manual-occupancy-${typedSpliceId}-${portIndex}`,
            severity: "warning",
            category: "Occupancy conflict",
            message: `Splice '${typedSpliceId}' port P${portIndex} is occupied by '${occupantRef}' without linked wire endpoint.`,
            subScreen: "splice",
            selectionKind: "splice",
            selectionId: typedSpliceId
          });
          continue;
        }

        if (expectedRef !== occupantRef) {
          issues.push({
            id: `splice-occupancy-mismatch-${typedSpliceId}-${portIndex}`,
            severity: "error",
            category: "Occupancy conflict",
            message: `Splice '${typedSpliceId}' port P${portIndex} occupancy mismatch ('${occupantRef}' vs expected '${expectedRef}').`,
            subScreen: "splice",
            selectionKind: "splice",
            selectionId: typedSpliceId
          });
        }

        const parsed = parseWireOccupantRef(occupantRef);
        if (parsed !== null && state.wires.byId[parsed.wireId] === undefined) {
          issues.push({
            id: `splice-occupancy-missing-wire-${typedSpliceId}-${portIndex}`,
            severity: "error",
            category: "Occupancy conflict",
            message: `Splice '${typedSpliceId}' port P${portIndex} references unknown wire '${parsed.wireId}'.`,
            subScreen: "splice",
            selectionKind: "splice",
            selectionId: typedSpliceId
          });
        }
      }
    }

    for (const [expectedKey, expectedRef] of expectedConnectorOccupancy) {
      const [connectorIdRaw, cavityIndexRaw] = expectedKey.split(":");
      const connectorId = connectorIdRaw as ConnectorId;
      const cavityIndex = Number(cavityIndexRaw);
      const actualRef = state.connectorCavityOccupancy[connectorId]?.[cavityIndex];
      if (actualRef === expectedRef) {
        continue;
      }

      issues.push({
        id: `connector-expected-occupancy-missing-${connectorId}-${cavityIndex}`,
        severity: "error",
        category: "Occupancy conflict",
        message: `Connector '${connectorId}' cavity C${cavityIndex} should be occupied by '${expectedRef}' but current occupancy is '${actualRef ?? "none"}'.`,
        subScreen: "connector",
        selectionKind: "connector",
        selectionId: connectorId
      });
    }

    for (const [expectedKey, expectedRef] of expectedSpliceOccupancy) {
      const [spliceIdRaw, portIndexRaw] = expectedKey.split(":");
      const spliceId = spliceIdRaw as SpliceId;
      const portIndex = Number(portIndexRaw);
      const actualRef = state.splicePortOccupancy[spliceId]?.[portIndex];
      if (actualRef === expectedRef) {
        continue;
      }

      issues.push({
        id: `splice-expected-occupancy-missing-${spliceId}-${portIndex}`,
        severity: "error",
        category: "Occupancy conflict",
        message: `Splice '${spliceId}' port P${portIndex} should be occupied by '${expectedRef}' but current occupancy is '${actualRef ?? "none"}'.`,
        subScreen: "splice",
        selectionKind: "splice",
        selectionId: spliceId
      });
    }

    return issues;
  }, [
    connectorMap,
    connectorNodeByConnectorId,
    connectors,
    nodes,
    segmentMap,
    segments,
    spliceMap,
    spliceNodeBySpliceId,
    splices,
    state.connectorCavityOccupancy,
    state.nodes.byId,
    state.segments.byId,
    state.splicePortOccupancy,
    state.wires.byId,
    wires
  ]);

  const orderedValidationIssues = useMemo(
    () =>
      [...validationIssues].sort((left, right) => {
        const leftSeverityRank = left.severity === "error" ? 0 : 1;
        const rightSeverityRank = right.severity === "error" ? 0 : 1;
        if (leftSeverityRank !== rightSeverityRank) {
          return leftSeverityRank - rightSeverityRank;
        }

        const categoryComparison = left.category.localeCompare(right.category);
        if (categoryComparison !== 0) {
          return categoryComparison;
        }

        const subScreenComparison = left.subScreen.localeCompare(right.subScreen);
        if (subScreenComparison !== 0) {
          return subScreenComparison;
        }

        const selectionComparison = left.selectionId.localeCompare(right.selectionId);
        if (selectionComparison !== 0) {
          return selectionComparison;
        }

        return left.id.localeCompare(right.id);
      }),
    [validationIssues]
  );
  const validationCategories = useMemo(
    () => [...new Set(orderedValidationIssues.map((issue) => issue.category))].sort((left, right) => left.localeCompare(right)),
    [orderedValidationIssues]
  );
  const visibleValidationIssues = useMemo(
    () =>
      orderedValidationIssues.filter((issue) => {
        if (validationCategoryFilter !== "all" && issue.category !== validationCategoryFilter) {
          return false;
        }

        if (validationSeverityFilter !== "all" && issue.severity !== validationSeverityFilter) {
          return false;
        }

        return true;
      }),
    [orderedValidationIssues, validationCategoryFilter, validationSeverityFilter]
  );
  const validationErrorCount = useMemo(
    () => validationIssues.filter((issue) => issue.severity === "error").length,
    [validationIssues]
  );
  const validationWarningCount = useMemo(
    () => validationIssues.filter((issue) => issue.severity === "warning").length,
    [validationIssues]
  );
  const groupedValidationIssues = useMemo(() => {
    const grouped = new Map<string, ValidationIssue[]>();
    for (const issue of visibleValidationIssues) {
      const existing = grouped.get(issue.category);
      if (existing === undefined) {
        grouped.set(issue.category, [issue]);
        continue;
      }

      existing.push(issue);
    }

    return [...grouped.entries()].sort(([left], [right]) => left.localeCompare(right));
  }, [visibleValidationIssues]);

  useEffect(() => {
    if (validationCategoryFilter === "all") {
      return;
    }

    if (validationCategories.includes(validationCategoryFilter)) {
      return;
    }

    setValidationCategoryFilter("all");
  }, [validationCategories, validationCategoryFilter]);

  useEffect(() => {
    if (orderedValidationIssues.length === 0) {
      setValidationIssueCursor(-1);
      return;
    }

    if (validationIssueCursor >= orderedValidationIssues.length) {
      setValidationIssueCursor(0);
    }
  }, [orderedValidationIssues, validationIssueCursor]);

  const entityCountBySubScreen: Record<SubScreenId, number> = {
    connector: connectors.length,
    splice: splices.length,
    node: nodes.length,
    segment: segments.length,
    wire: wires.length
  };

  const lastError = selectLastError(state);

  useEffect(() => {
    return () => {
      if (saveStatusTimeoutRef.current !== null) {
        clearTimeout(saveStatusTimeoutRef.current);
      }
    };
  }, []);

  function queueSavedStatus(): void {
    if (saveStatusTimeoutRef.current !== null) {
      clearTimeout(saveStatusTimeoutRef.current);
    }

    saveStatusTimeoutRef.current = setTimeout(() => {
      setSaveStatus((current) => (current === "unsaved" ? "saved" : current));
      saveStatusTimeoutRef.current = null;
    }, 250);
  }

  function dispatchAction(
    action: Parameters<AppStore["dispatch"]>[0],
    options?: {
      trackHistory?: boolean;
    }
  ): void {
    const shouldTrackHistory = options?.trackHistory ?? !action.type.startsWith("ui/");
    const previousState = store.getState();

    try {
      store.dispatch(action);
    } catch {
      setSaveStatus("error");
      return;
    }

    const nextState = store.getState();
    if (nextState === previousState) {
      return;
    }

    if (!shouldTrackHistory) {
      return;
    }

    setUndoStack((previous) => {
      const next = [...previous, previousState];
      return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next;
    });
    setRedoStack([]);
    setSaveStatus("unsaved");
    queueSavedStatus();
  }

  function handleUndo(): void {
    if (undoStack.length === 0) {
      return;
    }

    const previousState = undoStack[undoStack.length - 1];
    if (previousState === undefined) {
      return;
    }

    const currentState = store.getState();
    try {
      store.replaceState(previousState);
    } catch {
      setSaveStatus("error");
      return;
    }

    setUndoStack((previous) => previous.slice(0, -1));
    setRedoStack((previous) => {
      const next = [...previous, currentState];
      return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next;
    });
    setModeAnchorNodeId(null);
    setPendingNewNodePosition(null);
    setSaveStatus("unsaved");
    queueSavedStatus();
  }

  function handleRedo(): void {
    if (redoStack.length === 0) {
      return;
    }

    const redoState = redoStack[redoStack.length - 1];
    if (redoState === undefined) {
      return;
    }

    const currentState = store.getState();
    try {
      store.replaceState(redoState);
    } catch {
      setSaveStatus("error");
      return;
    }

    setRedoStack((previous) => previous.slice(0, -1));
    setUndoStack((previous) => {
      const next = [...previous, currentState];
      return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next;
    });
    setModeAnchorNodeId(null);
    setPendingNewNodePosition(null);
    setSaveStatus("unsaved");
    queueSavedStatus();
  }

  function resetNetworkViewToConfiguredScale(): void {
    setNetworkScale(configuredResetScale);
    setNetworkOffset({ x: 0, y: 0 });
  }

  function fitNetworkToContent(): void {
    if (nodes.length === 0) {
      return;
    }

    const positions = nodes
      .map((node) => networkNodePositions[node.id])
      .filter((position): position is NodePosition => position !== undefined);
    if (positions.length === 0) {
      return;
    }

    const firstPosition = positions[0];
    if (firstPosition === undefined) {
      return;
    }

    let minX = firstPosition.x;
    let maxX = firstPosition.x;
    let minY = firstPosition.y;
    let maxY = firstPosition.y;
    for (const position of positions.slice(1)) {
      if (position.x < minX) {
        minX = position.x;
      }
      if (position.x > maxX) {
        maxX = position.x;
      }
      if (position.y < minY) {
        minY = position.y;
      }
      if (position.y > maxY) {
        maxY = position.y;
      }
    }

    const fitPadding = 36;
    const contentWidth = Math.max(1, maxX - minX);
    const contentHeight = Math.max(1, maxY - minY);
    const availableWidth = Math.max(1, NETWORK_VIEW_WIDTH - fitPadding * 2);
    const availableHeight = Math.max(1, NETWORK_VIEW_HEIGHT - fitPadding * 2);
    const fittedScale = clamp(
      Math.min(availableWidth / contentWidth, availableHeight / contentHeight),
      NETWORK_MIN_SCALE,
      NETWORK_MAX_SCALE
    );

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    setNetworkScale(fittedScale);
    setNetworkOffset({
      x: NETWORK_VIEW_WIDTH / 2 - centerX * fittedScale,
      y: NETWORK_VIEW_HEIGHT / 2 - centerY * fittedScale
    });
  }

  function applyListSortDefaults(): void {
    setConnectorSort({ field: defaultSortField, direction: defaultSortDirection });
    setSpliceSort({ field: defaultSortField, direction: defaultSortDirection });
    setWireSort({ field: defaultSortField, direction: defaultSortDirection });
    setConnectorSynthesisSort({ field: defaultSortField, direction: defaultSortDirection });
    setSpliceSynthesisSort({ field: defaultSortField, direction: defaultSortDirection });
    setNodeIdSortDirection(defaultIdSortDirection);
    setSegmentIdSortDirection(defaultIdSortDirection);
  }

  function applyCanvasDefaultsNow(): void {
    setShowNetworkGrid(canvasDefaultShowGrid);
    setSnapNodesToGrid(canvasDefaultSnapToGrid);
    resetNetworkViewToConfiguredScale();
  }

  function resetWorkspacePreferencesToDefaults(): void {
    const defaultSort: SortState = { field: "name", direction: "asc" };
    setTableDensity("comfortable");
    setDefaultSortField("name");
    setDefaultSortDirection("asc");
    setDefaultIdSortDirection("asc");
    setConnectorSort(defaultSort);
    setSpliceSort(defaultSort);
    setWireSort(defaultSort);
    setConnectorSynthesisSort(defaultSort);
    setSpliceSynthesisSort(defaultSort);
    setNodeIdSortDirection("asc");
    setSegmentIdSortDirection("asc");
    setCanvasDefaultShowGrid(true);
    setCanvasDefaultSnapToGrid(false);
    setCanvasResetZoomPercentInput("100");
    setShowNetworkGrid(true);
    setSnapNodesToGrid(false);
    setNetworkScale(1);
    setNetworkOffset({ x: 0, y: 0 });
    setShowShortcutHints(true);
    setKeyboardShortcutsEnabled(true);
  }

  useEffect(() => {
    undoActionRef.current = handleUndo;
    redoActionRef.current = handleRedo;
    fitNetworkToContentRef.current = fitNetworkToContent;
    previousValidationIssueRef.current = () => moveValidationIssueCursor(-1);
    nextValidationIssueRef.current = () => moveValidationIssueCursor(1);
  });

  useEffect(() => {
    if (!keyboardShortcutsEnabled) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (isEditableElement(event.target)) {
        return;
      }

      const normalizedKey = event.key.toLocaleLowerCase();
      const hasCommandModifier = event.metaKey || event.ctrlKey;
      if (hasCommandModifier) {
        if (normalizedKey === "z") {
          event.preventDefault();
          if (event.shiftKey) {
            redoActionRef.current();
            return;
          }

          undoActionRef.current();
          return;
        }

        if (normalizedKey === "y") {
          event.preventDefault();
          redoActionRef.current();
        }
        return;
      }

      if (!event.altKey) {
        return;
      }

      if (event.shiftKey) {
        const subScreenByKey: Record<string, SubScreenId | undefined> = {
          "1": "connector",
          "2": "splice",
          "3": "node",
          "4": "segment",
          "5": "wire"
        };
        const targetSubScreen = subScreenByKey[normalizedKey];
        if (targetSubScreen !== undefined) {
          event.preventDefault();
          const nextScreenForSubScreen = activeScreenRef.current === "analysis" ? "analysis" : "modeling";
          setActiveScreen(nextScreenForSubScreen);
          setActiveSubScreen(targetSubScreen);
          return;
        }
      } else {
        const screenByKey: Record<string, ScreenId | undefined> = {
          "1": "modeling",
          "2": "analysis",
          "3": "validation",
          "4": "settings"
        };
        const targetScreen = screenByKey[normalizedKey];
        if (targetScreen !== undefined) {
          event.preventDefault();
          setActiveScreen(targetScreen);
          return;
        }
      }

      if (normalizedKey === "f") {
        if (activeScreenRef.current === "modeling" || activeScreenRef.current === "analysis") {
          event.preventDefault();
          fitNetworkToContentRef.current();
        }
        return;
      }

      if (normalizedKey === "j") {
        event.preventDefault();
        previousValidationIssueRef.current();
        return;
      }

      if (normalizedKey === "k") {
        event.preventDefault();
        nextValidationIssueRef.current();
        return;
      }

      const modeByKey: Record<string, InteractionMode | undefined> = {
        v: "select",
        n: "addNode",
        g: "addSegment",
        c: "connect",
        r: "route"
      };
      const targetMode = modeByKey[normalizedKey];
      if (targetMode !== undefined) {
        event.preventDefault();
        if (activeScreenRef.current !== "modeling" && activeScreenRef.current !== "analysis") {
          setActiveScreen("modeling");
        }
        setInteractionMode(targetMode);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [keyboardShortcutsEnabled]);

  function getSortIndicator(sortState: SortState, field: SortField): string {
    if (sortState.field !== field) {
      return "";
    }

    return sortState.direction === "asc" ? "▲" : "▼";
  }

  function describeNode(node: NetworkNode): string {
    if (node.kind === "intermediate") {
      return `Intermediate: ${node.label}`;
    }

    if (node.kind === "connector") {
      const connector = connectorMap.get(node.connectorId);
      return connector === undefined
        ? `Connector node (${node.connectorId})`
        : `Connector: ${connector.name} (${connector.technicalId})`;
    }

    const splice = spliceMap.get(node.spliceId);
    return splice === undefined ? `Splice node (${node.spliceId})` : `Splice: ${splice.name} (${splice.technicalId})`;
  }

  function resetConnectorForm(): void {
    setConnectorFormMode("create");
    setEditingConnectorId(null);
    setConnectorName("");
    setConnectorTechnicalId("");
    setCavityCount("4");
    setConnectorFormError(null);
  }

  function startConnectorEdit(connector: Connector): void {
    setConnectorFormMode("edit");
    setEditingConnectorId(connector.id);
    setConnectorName(connector.name);
    setConnectorTechnicalId(connector.technicalId);
    setCavityCount(String(connector.cavityCount));
    dispatchAction(appActions.select({ kind: "connector", id: connector.id }));
  }

  function handleConnectorSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const trimmedName = connectorName.trim();
    const trimmedTechnicalId = connectorTechnicalId.trim();
    const normalizedCavityCount = toPositiveInteger(cavityCount);

    if (trimmedName.length === 0 || trimmedTechnicalId.length === 0 || normalizedCavityCount < 1) {
      setConnectorFormError("All fields are required and cavity count must be >= 1.");
      return;
    }
    setConnectorFormError(null);

    const connectorId =
      connectorFormMode === "edit" && editingConnectorId !== null
        ? editingConnectorId
        : (createEntityId("conn") as ConnectorId);

    dispatchAction(
      appActions.upsertConnector({
        id: connectorId,
        name: trimmedName,
        technicalId: trimmedTechnicalId,
        cavityCount: normalizedCavityCount
      })
    );

    const nextState = store.getState();
    if (nextState.connectors.byId[connectorId] !== undefined) {
      dispatchAction(appActions.select({ kind: "connector", id: connectorId }));
      resetConnectorForm();
    }
  }

  function handleConnectorDelete(connectorId: ConnectorId): void {
    dispatchAction(appActions.removeConnector(connectorId));

    if (editingConnectorId === connectorId) {
      resetConnectorForm();
    }
  }

  function handleReserveCavity(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (selectedConnectorId === null) {
      return;
    }

    const cavityIndex = toPositiveInteger(cavityIndexInput);
    dispatchAction(appActions.occupyConnectorCavity(selectedConnectorId, cavityIndex, connectorOccupantRefInput));
  }

  function handleReleaseCavity(cavityIndex: number): void {
    if (selectedConnectorId === null) {
      return;
    }

    dispatchAction(appActions.releaseConnectorCavity(selectedConnectorId, cavityIndex));
  }

  function resetSpliceForm(): void {
    setSpliceFormMode("create");
    setEditingSpliceId(null);
    setSpliceName("");
    setSpliceTechnicalId("");
    setPortCount("4");
    setSpliceFormError(null);
  }

  function startSpliceEdit(splice: Splice): void {
    setSpliceFormMode("edit");
    setEditingSpliceId(splice.id);
    setSpliceName(splice.name);
    setSpliceTechnicalId(splice.technicalId);
    setPortCount(String(splice.portCount));
    dispatchAction(appActions.select({ kind: "splice", id: splice.id }));
  }

  function handleSpliceSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const trimmedName = spliceName.trim();
    const trimmedTechnicalId = spliceTechnicalId.trim();
    const normalizedPortCount = toPositiveInteger(portCount);

    if (trimmedName.length === 0 || trimmedTechnicalId.length === 0 || normalizedPortCount < 1) {
      setSpliceFormError("All fields are required and port count must be >= 1.");
      return;
    }
    setSpliceFormError(null);

    const spliceId =
      spliceFormMode === "edit" && editingSpliceId !== null
        ? editingSpliceId
        : (createEntityId("splice") as SpliceId);

    dispatchAction(
      appActions.upsertSplice({
        id: spliceId,
        name: trimmedName,
        technicalId: trimmedTechnicalId,
        portCount: normalizedPortCount
      })
    );

    const nextState = store.getState();
    if (nextState.splices.byId[spliceId] !== undefined) {
      dispatchAction(appActions.select({ kind: "splice", id: spliceId }));
      resetSpliceForm();
    }
  }

  function handleSpliceDelete(spliceId: SpliceId): void {
    dispatchAction(appActions.removeSplice(spliceId));

    if (editingSpliceId === spliceId) {
      resetSpliceForm();
    }
  }

  function handleReservePort(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (selectedSpliceId === null) {
      return;
    }

    const portIndex = toPositiveInteger(portIndexInput);
    dispatchAction(appActions.occupySplicePort(selectedSpliceId, portIndex, spliceOccupantRefInput));
  }

  function handleReleasePort(portIndex: number): void {
    if (selectedSpliceId === null) {
      return;
    }

    dispatchAction(appActions.releaseSplicePort(selectedSpliceId, portIndex));
  }

  function resetNodeForm(): void {
    setNodeFormMode("create");
    setEditingNodeId(null);
    setNodeIdInput("");
    setNodeKind("intermediate");
    setNodeConnectorId("");
    setNodeSpliceId("");
    setNodeLabel("");
    setNodeFormError(null);
    setPendingNewNodePosition(null);
  }

  function startNodeEdit(node: NetworkNode): void {
    setNodeFormMode("edit");
    setEditingNodeId(node.id);
    setNodeIdInput(node.id);
    setNodeKind(node.kind);
    setNodeLabel(node.kind === "intermediate" ? node.label : "");
    setNodeConnectorId(node.kind === "connector" ? node.connectorId : "");
    setNodeSpliceId(node.kind === "splice" ? node.spliceId : "");
    dispatchAction(appActions.select({ kind: "node", id: node.id }));
  }

  function handleNodeSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const normalizedNodeId = nodeIdInput.trim();
    const nodeId = (nodeFormMode === "edit" && editingNodeId !== null
      ? editingNodeId
      : normalizedNodeId) as NodeId;

    if (nodeFormMode === "create") {
      if (normalizedNodeId.length === 0) {
        setNodeFormError("Node ID is required.");
        return;
      }

      if (state.nodes.byId[nodeId] !== undefined) {
        setNodeFormError(`Node ID '${normalizedNodeId}' already exists.`);
        return;
      }
    }

    if (nodeKind === "intermediate") {
      const trimmedLabel = nodeLabel.trim();
      if (trimmedLabel.length === 0) {
        setNodeFormError("Intermediate node label is required.");
        return;
      }

      setNodeFormError(null);
      dispatchAction(appActions.upsertNode({ id: nodeId, kind: "intermediate", label: trimmedLabel }));
    }

    if (nodeKind === "connector") {
      if (nodeConnectorId.length === 0) {
        setNodeFormError("Select a connector to create a connector node.");
        return;
      }

      setNodeFormError(null);
      dispatchAction(
        appActions.upsertNode({
          id: nodeId,
          kind: "connector",
          connectorId: nodeConnectorId as ConnectorId
        })
      );
    }

    if (nodeKind === "splice") {
      if (nodeSpliceId.length === 0) {
        setNodeFormError("Select a splice to create a splice node.");
        return;
      }

      setNodeFormError(null);
      dispatchAction(
        appActions.upsertNode({
          id: nodeId,
          kind: "splice",
          spliceId: nodeSpliceId as SpliceId
        })
      );
    }

    const nextState = store.getState();
    if (nextState.nodes.byId[nodeId] !== undefined) {
      if (pendingNewNodePosition !== null) {
        setManualNodePositions((previous) => ({
          ...previous,
          [nodeId]: pendingNewNodePosition
        }));
      }
      dispatchAction(appActions.select({ kind: "node", id: nodeId }));
      resetNodeForm();
    }
  }

  function handleNodeDelete(nodeId: NodeId): void {
    dispatchAction(appActions.removeNode(nodeId));

    if (editingNodeId === nodeId) {
      resetNodeForm();
    }
  }

  function resetSegmentForm(): void {
    setSegmentFormMode("create");
    setEditingSegmentId(null);
    setSegmentIdInput("");
    setSegmentNodeA("");
    setSegmentNodeB("");
    setSegmentLengthMm("120");
    setSegmentSubNetworkTag("");
    setSegmentFormError(null);
  }

  function startSegmentEdit(segment: Segment): void {
    setSegmentFormMode("edit");
    setEditingSegmentId(segment.id);
    setSegmentIdInput(segment.id);
    setSegmentNodeA(segment.nodeA);
    setSegmentNodeB(segment.nodeB);
    setSegmentLengthMm(String(segment.lengthMm));
    setSegmentSubNetworkTag(segment.subNetworkTag ?? "");
    dispatchAction(appActions.select({ kind: "segment", id: segment.id }));
  }

  function handleSegmentSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const normalizedSegmentId = segmentIdInput.trim();
    const segmentId = (segmentFormMode === "edit" && editingSegmentId !== null
      ? editingSegmentId
      : normalizedSegmentId) as SegmentId;

    if (segmentFormMode === "create") {
      if (normalizedSegmentId.length === 0) {
        setSegmentFormError("Segment ID is required.");
        return;
      }

      if (state.segments.byId[segmentId] !== undefined) {
        setSegmentFormError(`Segment ID '${normalizedSegmentId}' already exists.`);
        return;
      }
    }

    if (segmentNodeA.length === 0 || segmentNodeB.length === 0) {
      setSegmentFormError("Both segment endpoints are required.");
      return;
    }

    const lengthMm = toPositiveNumber(segmentLengthMm);
    if (lengthMm <= 0) {
      setSegmentFormError("Segment length must be > 0.");
      return;
    }

    setSegmentFormError(null);

    dispatchAction(
      appActions.upsertSegment({
        id: segmentId,
        nodeA: segmentNodeA as NodeId,
        nodeB: segmentNodeB as NodeId,
        lengthMm,
        subNetworkTag: segmentSubNetworkTag
      })
    );

    const nextState = store.getState();
    if (nextState.segments.byId[segmentId] !== undefined) {
      dispatchAction(appActions.select({ kind: "segment", id: segmentId }));
      resetSegmentForm();
    }
  }

  function handleSegmentDelete(segmentId: SegmentId): void {
    dispatchAction(appActions.removeSegment(segmentId));

    if (editingSegmentId === segmentId) {
      resetSegmentForm();
    }
  }

  function resetWireForm(): void {
    setWireFormMode("create");
    setEditingWireId(null);
    setWireName("");
    setWireTechnicalId("");
    setWireEndpointAKind("connectorCavity");
    setWireEndpointAConnectorId("");
    setWireEndpointACavityIndex("1");
    setWireEndpointASpliceId("");
    setWireEndpointAPortIndex("1");
    setWireEndpointBKind("splicePort");
    setWireEndpointBConnectorId("");
    setWireEndpointBCavityIndex("1");
    setWireEndpointBSpliceId("");
    setWireEndpointBPortIndex("1");
    setWireForcedRouteInput("");
    setWireFormError(null);
  }

  function startWireEdit(wire: Wire): void {
    setWireFormMode("edit");
    setEditingWireId(wire.id);
    setWireName(wire.name);
    setWireTechnicalId(wire.technicalId);
    setWireEndpointAKind(wire.endpointA.kind);
    if (wire.endpointA.kind === "connectorCavity") {
      setWireEndpointAConnectorId(wire.endpointA.connectorId);
      setWireEndpointACavityIndex(String(wire.endpointA.cavityIndex));
      setWireEndpointASpliceId("");
      setWireEndpointAPortIndex("1");
    } else {
      setWireEndpointASpliceId(wire.endpointA.spliceId);
      setWireEndpointAPortIndex(String(wire.endpointA.portIndex));
      setWireEndpointAConnectorId("");
      setWireEndpointACavityIndex("1");
    }

    setWireEndpointBKind(wire.endpointB.kind);
    if (wire.endpointB.kind === "connectorCavity") {
      setWireEndpointBConnectorId(wire.endpointB.connectorId);
      setWireEndpointBCavityIndex(String(wire.endpointB.cavityIndex));
      setWireEndpointBSpliceId("");
      setWireEndpointBPortIndex("1");
    } else {
      setWireEndpointBSpliceId(wire.endpointB.spliceId);
      setWireEndpointBPortIndex(String(wire.endpointB.portIndex));
      setWireEndpointBConnectorId("");
      setWireEndpointBCavityIndex("1");
    }

    setWireForcedRouteInput(wire.routeSegmentIds.join(", "));
    dispatchAction(appActions.select({ kind: "wire", id: wire.id }));
  }

  function buildWireEndpoint(side: "A" | "B"): WireEndpoint | null {
    if (side === "A") {
      if (wireEndpointAKind === "connectorCavity") {
        if (wireEndpointAConnectorId.length === 0) {
          setWireFormError("Endpoint A connector is required.");
          return null;
        }

        return {
          kind: "connectorCavity",
          connectorId: wireEndpointAConnectorId as ConnectorId,
          cavityIndex: toPositiveInteger(wireEndpointACavityIndex)
        };
      }

      if (wireEndpointASpliceId.length === 0) {
        setWireFormError("Endpoint A splice is required.");
        return null;
      }

      return {
        kind: "splicePort",
        spliceId: wireEndpointASpliceId as SpliceId,
        portIndex: toPositiveInteger(wireEndpointAPortIndex)
      };
    }

    if (wireEndpointBKind === "connectorCavity") {
      if (wireEndpointBConnectorId.length === 0) {
        setWireFormError("Endpoint B connector is required.");
        return null;
      }

      return {
        kind: "connectorCavity",
        connectorId: wireEndpointBConnectorId as ConnectorId,
        cavityIndex: toPositiveInteger(wireEndpointBCavityIndex)
      };
    }

    if (wireEndpointBSpliceId.length === 0) {
      setWireFormError("Endpoint B splice is required.");
      return null;
    }

    return {
      kind: "splicePort",
      spliceId: wireEndpointBSpliceId as SpliceId,
      portIndex: toPositiveInteger(wireEndpointBPortIndex)
    };
  }

  function handleWireSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const normalizedName = wireName.trim();
    const normalizedTechnicalId = wireTechnicalId.trim();
    if (normalizedName.length === 0 || normalizedTechnicalId.length === 0) {
      setWireFormError("Wire name and technical ID are required.");
      return;
    }

    const endpointA = buildWireEndpoint("A");
    const endpointB = buildWireEndpoint("B");
    if (endpointA === null || endpointB === null) {
      return;
    }

    setWireFormError(null);

    const wireId = wireFormMode === "edit" && editingWireId !== null ? editingWireId : (createEntityId("wire") as WireId);
    dispatchAction(
      appActions.saveWire({
        id: wireId,
        name: normalizedName,
        technicalId: normalizedTechnicalId,
        endpointA,
        endpointB
      })
    );

    const nextState = store.getState();
    if (nextState.wires.byId[wireId] !== undefined) {
      dispatchAction(appActions.select({ kind: "wire", id: wireId }));
      resetWireForm();
      setWireForcedRouteInput(nextState.wires.byId[wireId].routeSegmentIds.join(", "));
    }
  }

  function handleWireDelete(wireId: WireId): void {
    dispatchAction(appActions.removeWire(wireId));
    if (editingWireId === wireId) {
      resetWireForm();
    }
  }

  function handleLockWireRoute(): void {
    if (selectedWire === null) {
      return;
    }

    const forcedSegmentIds = wireForcedRouteInput
      .split(",")
      .map((token) => token.trim())
      .filter((token) => token.length > 0) as SegmentId[];

    if (forcedSegmentIds.length === 0) {
      setWireFormError("Provide at least one segment ID to lock a forced route.");
      return;
    }

    setWireFormError(null);
    dispatchAction(appActions.lockWireRoute(selectedWire.id, forcedSegmentIds));
  }

  function handleResetWireRoute(): void {
    if (selectedWire === null) {
      return;
    }

    setWireFormError(null);
    dispatchAction(appActions.resetWireRoute(selectedWire.id));
    const nextState = store.getState();
    const updatedWire = nextState.wires.byId[selectedWire.id];
    if (updatedWire !== undefined) {
      setWireForcedRouteInput(updatedWire.routeSegmentIds.join(", "));
    }
  }

  function resolveSelectionAnchor(target: SelectionTarget): NodePosition | null {
    if (target.kind === "node") {
      return networkNodePositions[target.id as NodeId] ?? null;
    }

    if (target.kind === "segment") {
      const segment = segmentMap.get(target.id as SegmentId);
      if (segment === undefined) {
        return null;
      }

      const nodeAPosition = networkNodePositions[segment.nodeA];
      const nodeBPosition = networkNodePositions[segment.nodeB];
      if (nodeAPosition === undefined || nodeBPosition === undefined) {
        return null;
      }

      return {
        x: (nodeAPosition.x + nodeBPosition.x) / 2,
        y: (nodeAPosition.y + nodeBPosition.y) / 2
      };
    }

    if (target.kind === "connector") {
      const nodeId = connectorNodeByConnectorId.get(target.id as ConnectorId);
      if (nodeId === undefined) {
        return null;
      }

      return networkNodePositions[nodeId] ?? null;
    }

    if (target.kind === "splice") {
      const nodeId = spliceNodeBySpliceId.get(target.id as SpliceId);
      if (nodeId === undefined) {
        return null;
      }

      return networkNodePositions[nodeId] ?? null;
    }

    const wire = state.wires.byId[target.id as WireId];
    if (wire === undefined) {
      return null;
    }

    const firstSegmentId = wire.routeSegmentIds[0];
    if (firstSegmentId !== undefined) {
      const firstSegment = segmentMap.get(firstSegmentId);
      if (firstSegment !== undefined) {
        const nodeAPosition = networkNodePositions[firstSegment.nodeA];
        const nodeBPosition = networkNodePositions[firstSegment.nodeB];
        if (nodeAPosition !== undefined && nodeBPosition !== undefined) {
          return {
            x: (nodeAPosition.x + nodeBPosition.x) / 2,
            y: (nodeAPosition.y + nodeBPosition.y) / 2
          };
        }
      }
    }

    const endpointNodeId = resolveEndpointNodeId(wire.endpointA, connectorNodeByConnectorId, spliceNodeBySpliceId);
    if (endpointNodeId !== null) {
      return networkNodePositions[endpointNodeId] ?? null;
    }

    return null;
  }

  function focusSelectionOnCanvas(target: SelectionTarget): void {
    const anchor = resolveSelectionAnchor(target);
    if (anchor === null) {
      return;
    }

    setInteractionMode("select");
    const targetScale = networkScale < 1 ? 1 : networkScale;
    setNetworkScale(targetScale);
    setNetworkOffset({
      x: NETWORK_VIEW_WIDTH / 2 - anchor.x * targetScale,
      y: NETWORK_VIEW_HEIGHT / 2 - anchor.y * targetScale
    });
  }

  function handleFocusCurrentSelectionOnCanvas(): void {
    if (selected === null) {
      return;
    }

    focusSelectionOnCanvas({
      kind: selected.kind,
      id: selected.id
    });
  }

  function handleValidationIssueGoTo(issue: ValidationIssue): void {
    setActiveScreen("modeling");
    setActiveSubScreen(issue.subScreen);
    dispatchAction(
      appActions.select({
        kind: issue.selectionKind,
        id: issue.selectionId
      })
    );
    focusSelectionOnCanvas({
      kind: issue.selectionKind,
      id: issue.selectionId
    });
  }

  function handleOpenValidationScreen(filter: ValidationSeverityFilter): void {
    setValidationCategoryFilter("all");
    setValidationSeverityFilter(filter);
    setActiveScreen("validation");
  }

  function moveValidationIssueCursor(direction: 1 | -1): void {
    if (orderedValidationIssues.length === 0) {
      return;
    }

    const baseIndex = validationIssueCursor < 0 ? (direction > 0 ? -1 : 0) : validationIssueCursor;
    const nextIndex = (baseIndex + direction + orderedValidationIssues.length) % orderedValidationIssues.length;
    const issue = orderedValidationIssues[nextIndex];
    if (issue === undefined) {
      return;
    }

    setValidationIssueCursor(nextIndex);
    handleValidationIssueGoTo(issue);
  }

  function handleOpenSelectionInInspector(): void {
    if (selectedSubScreen === null) {
      return;
    }

    setActiveScreen("modeling");
    setActiveSubScreen(selectedSubScreen);
  }

  function handleStartSelectedEdit(): void {
    if (selectedSubScreen === null) {
      return;
    }

    setActiveScreen("modeling");
    setActiveSubScreen(selectedSubScreen);

    if (selectedConnector !== null) {
      startConnectorEdit(selectedConnector);
      return;
    }

    if (selectedSplice !== null) {
      startSpliceEdit(selectedSplice);
      return;
    }

    if (selectedNode !== null) {
      startNodeEdit(selectedNode);
      return;
    }

    if (selectedSegment !== null) {
      startSegmentEdit(selectedSegment);
      return;
    }

    if (selectedWire !== null) {
      startWireEdit(selectedWire);
    }
  }

  function applyNodeToWireEndpoint(side: "A" | "B", node: NetworkNode): boolean {
    if (node.kind === "intermediate") {
      setWireFormError("Connect mode only supports connector/splice nodes as wire endpoints.");
      return false;
    }

    if (side === "A") {
      if (node.kind === "connector") {
        setWireEndpointAKind("connectorCavity");
        setWireEndpointAConnectorId(node.connectorId);
      } else {
        setWireEndpointAKind("splicePort");
        setWireEndpointASpliceId(node.spliceId);
      }
      return true;
    }

    if (node.kind === "connector") {
      setWireEndpointBKind("connectorCavity");
      setWireEndpointBConnectorId(node.connectorId);
    } else {
      setWireEndpointBKind("splicePort");
      setWireEndpointBSpliceId(node.spliceId);
    }
    return true;
  }

  function handleNetworkSegmentClick(segmentId: SegmentId): void {
    if (interactionMode !== "select") {
      return;
    }
    dispatchAction(appActions.select({ kind: "segment", id: segmentId }));
  }

  function handleNetworkNodeClick(nodeId: NodeId): void {
    const node = state.nodes.byId[nodeId];
    if (node === undefined) {
      return;
    }

    if (interactionMode === "select") {
      dispatchAction(appActions.select({ kind: "node", id: nodeId }));
      return;
    }

    if (interactionMode === "addSegment") {
      setActiveScreen("modeling");
      setActiveSubScreen("segment");
      setSegmentFormMode("create");
      setEditingSegmentId(null);
      setSegmentFormError(null);
      if (modeAnchorNodeId === null) {
        setModeAnchorNodeId(nodeId);
        setSegmentNodeA(nodeId);
        setSegmentNodeB("");
        return;
      }

      if (modeAnchorNodeId === nodeId) {
        setModeAnchorNodeId(null);
        setSegmentNodeB("");
        return;
      }

      setSegmentNodeA(modeAnchorNodeId);
      setSegmentNodeB(nodeId);
      setModeAnchorNodeId(null);
      return;
    }

    if (interactionMode === "route") {
      setActiveScreen("analysis");
      setActiveSubScreen("segment");
      if (routePreviewStartNodeId.length === 0 || routePreviewEndNodeId.length > 0) {
        setRoutePreviewStartNodeId(nodeId);
        setRoutePreviewEndNodeId("");
      } else {
        setRoutePreviewEndNodeId(nodeId);
      }
      return;
    }

    if (interactionMode === "connect") {
      setActiveScreen("modeling");
      setActiveSubScreen("wire");
      setWireFormMode("create");
      setEditingWireId(null);

      if (modeAnchorNodeId === null) {
        if (!applyNodeToWireEndpoint("A", node)) {
          return;
        }

        setWireFormError(null);
        setModeAnchorNodeId(nodeId);
        return;
      }

      if (modeAnchorNodeId === nodeId) {
        setWireFormError("Connect mode expects two distinct endpoint nodes.");
        return;
      }

      if (!applyNodeToWireEndpoint("B", node)) {
        return;
      }

      setModeAnchorNodeId(null);
      setWireFormError(null);
      return;
    }
  }

  function handleNetworkCanvasClick(event: ReactMouseEvent<SVGSVGElement>): void {
    if (interactionMode !== "addNode") {
      return;
    }

    if (event.target !== event.currentTarget) {
      return;
    }

    const coordinates = getSvgCoordinates(event.currentTarget, event.clientX, event.clientY);
    if (coordinates === null) {
      return;
    }

    setActiveScreen("modeling");
    setActiveSubScreen("node");
    setNodeFormMode("create");
    setEditingNodeId(null);
    setNodeKind("intermediate");
    setNodeIdInput("");
    setNodeConnectorId("");
    setNodeSpliceId("");
    setNodeLabel(`N-branch-${nodes.length + 1}`);
    setNodeFormError(null);
    setPendingNewNodePosition(coordinates);
  }

  function getLocalSvgPoint(svgElement: SVGSVGElement, clientX: number, clientY: number): NodePosition | null {
    const bounds = svgElement.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) {
      return null;
    }

    return {
      x: ((clientX - bounds.left) / bounds.width) * NETWORK_VIEW_WIDTH,
      y: ((clientY - bounds.top) / bounds.height) * NETWORK_VIEW_HEIGHT
    };
  }

  function getSvgCoordinates(svgElement: SVGSVGElement, clientX: number, clientY: number): NodePosition | null {
    const localPoint = getLocalSvgPoint(svgElement, clientX, clientY);
    if (localPoint === null) {
      return null;
    }

    const localX = localPoint.x;
    const localY = localPoint.y;
    const modelX = (localX - networkOffset.x) / networkScale;
    const modelY = (localY - networkOffset.y) / networkScale;
    const snappedX = snapNodesToGrid ? snapToGrid(modelX, NETWORK_GRID_STEP) : modelX;
    const snappedY = snapNodesToGrid ? snapToGrid(modelY, NETWORK_GRID_STEP) : modelY;

    return {
      x: clamp(snappedX, 20, NETWORK_VIEW_WIDTH - 20),
      y: clamp(snappedY, 20, NETWORK_VIEW_HEIGHT - 20)
    };
  }

  function handleNetworkNodeMouseDown(event: ReactMouseEvent<SVGGElement>, nodeId: NodeId): void {
    if (interactionMode !== "select") {
      return;
    }
    event.preventDefault();
    setDraggingNodeId(nodeId);
    handleNetworkNodeClick(nodeId);
  }

  function handleNetworkCanvasMouseDown(event: ReactMouseEvent<SVGSVGElement>): void {
    if (!event.shiftKey) {
      return;
    }

    if (event.target !== event.currentTarget) {
      return;
    }

    event.preventDefault();
    panStartRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      offsetX: networkOffset.x,
      offsetY: networkOffset.y
    };
    setIsPanningNetwork(true);
  }

  function handleNetworkWheel(event: ReactWheelEvent<SVGSVGElement>): void {
    event.preventDefault();

    const localPoint = getLocalSvgPoint(event.currentTarget, event.clientX, event.clientY);
    if (localPoint === null) {
      return;
    }

    const zoomFactor = event.deltaY < 0 ? 1.08 : 0.92;
    const nextScale = clamp(networkScale * zoomFactor, NETWORK_MIN_SCALE, NETWORK_MAX_SCALE);
    if (nextScale === networkScale) {
      return;
    }

    const modelX = (localPoint.x - networkOffset.x) / networkScale;
    const modelY = (localPoint.y - networkOffset.y) / networkScale;
    setNetworkScale(nextScale);
    setNetworkOffset({
      x: localPoint.x - modelX * nextScale,
      y: localPoint.y - modelY * nextScale
    });
  }

  function handleZoomAction(target: "in" | "out" | "reset"): void {
    if (target === "reset") {
      resetNetworkViewToConfiguredScale();
      return;
    }

    setNetworkScale((current) =>
      clamp(current * (target === "in" ? 1.12 : 0.88), NETWORK_MIN_SCALE, NETWORK_MAX_SCALE)
    );
  }

  function handleNetworkMouseMove(event: ReactMouseEvent<SVGSVGElement>): void {
    if (draggingNodeId === null) {
      if (panStartRef.current === null) {
        return;
      }

      const bounds = event.currentTarget.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) {
        return;
      }

      const deltaX = ((event.clientX - panStartRef.current.clientX) / bounds.width) * NETWORK_VIEW_WIDTH;
      const deltaY = ((event.clientY - panStartRef.current.clientY) / bounds.height) * NETWORK_VIEW_HEIGHT;
      setNetworkOffset({
        x: panStartRef.current.offsetX + deltaX,
        y: panStartRef.current.offsetY + deltaY
      });
      return;
    }

    const coordinates = getSvgCoordinates(event.currentTarget, event.clientX, event.clientY);
    if (coordinates === null) {
      return;
    }

    setManualNodePositions((previous) => ({
      ...previous,
      [draggingNodeId]: coordinates
    }));
  }

  function stopNetworkNodeDrag(): void {
    if (draggingNodeId !== null) {
      setDraggingNodeId(null);
    }

    if (panStartRef.current !== null) {
      panStartRef.current = null;
      setIsPanningNetwork(false);
    }
  }

  const interactionModeHint =
    interactionMode === "select"
      ? "Select mode: node drag-and-drop and network selection are active."
      : interactionMode === "addNode"
        ? pendingNewNodePosition === null
          ? "Add Node mode: click on empty canvas area to prepare an intermediate node placement."
          : `Add Node mode: placement captured at x=${Math.round(pendingNewNodePosition.x)}, y=${Math.round(
              pendingNewNodePosition.y
            )}. Complete Node ID then create.`
        : interactionMode === "addSegment"
          ? modeAnchorNodeId === null
            ? "Add Segment mode: click first node, then second node to prefill segment endpoints."
            : `Add Segment mode: first node '${modeAnchorNodeId}' selected. Click second node.`
          : interactionMode === "connect"
            ? modeAnchorNodeId === null
              ? "Connect mode: click first connector/splice node to set wire endpoint A."
              : `Connect mode: endpoint A captured on '${modeAnchorNodeId}'. Click second connector/splice node.`
            : "Route mode: click start node then end node to fill route preview.";
  const networkScalePercent = Math.round(networkScale * 100);
  const inspectorContextPanel = (
    <article className="panel">
      <h2>Inspector context</h2>
      {selected === null ? (
        <p className="empty-copy">No entity selected. Select a row or a canvas item to inspect details here.</p>
      ) : (
        <>
          <p className="meta-line">
            Focused entity: <strong>{selected.kind}</strong> <span className="technical-id">{selected.id}</span>
          </p>
          <div className="selection-snapshot inspector-snapshot">
            {selectedConnector !== null ? (
              <>
                <p>Name: {selectedConnector.name}</p>
                <p>Technical ID: <span className="technical-id">{selectedConnector.technicalId}</span></p>
                <p>
                  Cavities: {selectedConnector.cavityCount} / Occupied:{" "}
                  {selectConnectorCavityStatuses(state, selectedConnector.id).filter((slot) => slot.isOccupied).length}
                </p>
              </>
            ) : null}
            {selectedSplice !== null ? (
              <>
                <p>Name: {selectedSplice.name}</p>
                <p>Technical ID: <span className="technical-id">{selectedSplice.technicalId}</span></p>
                <p>
                  Ports: {selectedSplice.portCount} / Occupied:{" "}
                  {selectSplicePortStatuses(state, selectedSplice.id).filter((slot) => slot.isOccupied).length}
                </p>
              </>
            ) : null}
            {selectedNode !== null ? (
              <>
                <p>Node kind: {selectedNode.kind}</p>
                <p>{describeNode(selectedNode)}</p>
              </>
            ) : null}
            {selectedSegment !== null ? (
              <>
                <p>Node A: <span className="technical-id">{selectedSegment.nodeA}</span></p>
                <p>Node B: <span className="technical-id">{selectedSegment.nodeB}</span></p>
                <p>Length: {selectedSegment.lengthMm} mm</p>
              </>
            ) : null}
            {selectedWire !== null ? (
              <>
                <p>Name: {selectedWire.name}</p>
                <p>Technical ID: <span className="technical-id">{selectedWire.technicalId}</span></p>
                <p>
                  Route mode: {selectedWire.isRouteLocked ? "Locked" : "Auto"} / Segments:{" "}
                  {selectedWire.routeSegmentIds.length === 0 ? "(none)" : selectedWire.routeSegmentIds.join(" -> ")}
                </p>
              </>
            ) : null}
          </div>
          <div className="row-actions compact">
            <button type="button" onClick={handleOpenSelectionInInspector} disabled={selectedSubScreen === null}>
              Open in inspector
            </button>
            <button type="button" onClick={handleStartSelectedEdit} disabled={selectedSubScreen === null}>
              Edit selected
            </button>
            <button type="button" onClick={handleFocusCurrentSelectionOnCanvas} disabled={selectedSubScreen === null}>
              Focus canvas
            </button>
            <button type="button" onClick={() => dispatchAction(appActions.clearSelection())}>
              Clear selection
            </button>
          </div>
        </>
      )}
    </article>
  );

  const networkSummaryPanel = (
    <section className="panel">
      <h2>Network summary</h2>
      <div className="canvas-toolbar" aria-label="Canvas interaction mode">
        <span>Interaction mode</span>
        {([
          ["select", "Select"],
          ["addNode", "Add Node"],
          ["addSegment", "Add Segment"],
          ["connect", "Connect"],
          ["route", "Route"]
        ] as const).map(([modeId, label]) => (
          <button
            key={modeId}
            type="button"
            className={interactionMode === modeId ? "workspace-tab is-active" : "workspace-tab"}
            onClick={() => setInteractionMode(modeId)}
          >
            {label}
          </button>
        ))}
        <span className="canvas-toolbar-separator" />
        <button type="button" className="workspace-tab" onClick={() => handleZoomAction("out")}>
          Zoom -
        </button>
        <button type="button" className="workspace-tab" onClick={() => handleZoomAction("in")}>
          Zoom +
        </button>
        <button type="button" className="workspace-tab" onClick={() => handleZoomAction("reset")}>
          Reset view
        </button>
        <button type="button" className="workspace-tab" onClick={fitNetworkToContent}>
          Fit network
        </button>
        <button
          type="button"
          className={showNetworkGrid ? "workspace-tab is-active" : "workspace-tab"}
          onClick={() => setShowNetworkGrid((current) => !current)}
        >
          Grid
        </button>
        <button
          type="button"
          className={snapNodesToGrid ? "workspace-tab is-active" : "workspace-tab"}
          onClick={() => setSnapNodesToGrid((current) => !current)}
        >
          Snap
        </button>
      </div>
      <p className="meta-line">
        {interactionModeHint} View: {networkScalePercent}% zoom. Hold <strong>Shift</strong> and drag empty canvas to pan.
      </p>
      <div className="summary-grid">
        <article>
          <h3>Graph nodes</h3>
          <p>{routingGraph.nodeIds.length}</p>
        </article>
        <article>
          <h3>Graph segments</h3>
          <p>{routingGraph.segmentIds.length}</p>
        </article>
        <article>
          <h3>Adjacency entries</h3>
          <p>{totalEdgeEntries}</p>
        </article>
      </div>

      <h3 className="summary-title">2D network view</h3>
      {nodes.length === 0 ? (
        <p className="empty-copy">No nodes yet. Create nodes and segments to render the 2D network.</p>
      ) : (
        <div className={`network-canvas-shell${isPanningNetwork ? " is-panning" : ""}`}>
          <svg
            className="network-svg"
            role="img"
            aria-label="2D network diagram"
            viewBox={`0 0 ${NETWORK_VIEW_WIDTH} ${NETWORK_VIEW_HEIGHT}`}
            onMouseDown={handleNetworkCanvasMouseDown}
            onClick={handleNetworkCanvasClick}
            onWheel={handleNetworkWheel}
            onMouseMove={handleNetworkMouseMove}
            onMouseUp={stopNetworkNodeDrag}
            onMouseLeave={stopNetworkNodeDrag}
          >
            {showNetworkGrid ? (
              <g
                className="network-grid"
                transform={`translate(${networkOffset.x} ${networkOffset.y}) scale(${networkScale})`}
              >
                {Array.from({ length: Math.floor(NETWORK_VIEW_WIDTH / NETWORK_GRID_STEP) + 1 }).map((_, index) => {
                  const position = index * NETWORK_GRID_STEP;
                  return (
                    <line
                      key={`grid-v-${position}`}
                      x1={position}
                      y1={0}
                      x2={position}
                      y2={NETWORK_VIEW_HEIGHT}
                    />
                  );
                })}
                {Array.from({ length: Math.floor(NETWORK_VIEW_HEIGHT / NETWORK_GRID_STEP) + 1 }).map((_, index) => {
                  const position = index * NETWORK_GRID_STEP;
                  return (
                    <line
                      key={`grid-h-${position}`}
                      x1={0}
                      y1={position}
                      x2={NETWORK_VIEW_WIDTH}
                      y2={position}
                    />
                  );
                })}
              </g>
            ) : null}
            <g transform={`translate(${networkOffset.x} ${networkOffset.y}) scale(${networkScale})`}>
              {segments.map((segment) => {
                const nodeAPosition = networkNodePositions[segment.nodeA];
                const nodeBPosition = networkNodePositions[segment.nodeB];
                if (nodeAPosition === undefined || nodeBPosition === undefined) {
                  return null;
                }

                const isWireHighlighted = selectedWireRouteSegmentIds.has(segment.id);
                const isSelectedSegment = selectedSegmentId === segment.id;
                const segmentClassName = `network-segment${isWireHighlighted ? " is-wire-highlighted" : ""}${
                  isSelectedSegment ? " is-selected" : ""
                }`;
                const labelX = (nodeAPosition.x + nodeBPosition.x) / 2;
                const labelY = (nodeAPosition.y + nodeBPosition.y) / 2;

                return (
                  <g key={segment.id}>
                    <line
                      className={segmentClassName}
                      x1={nodeAPosition.x}
                      y1={nodeAPosition.y}
                      x2={nodeBPosition.x}
                      y2={nodeBPosition.y}
                    />
                    <line
                      className="network-segment-hitbox"
                      x1={nodeAPosition.x}
                      y1={nodeAPosition.y}
                      x2={nodeBPosition.x}
                      y2={nodeBPosition.y}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleNetworkSegmentClick(segment.id);
                      }}
                    />
                    <text className="network-segment-label" x={labelX} y={labelY - 6} textAnchor="middle">
                      {segment.id}
                    </text>
                  </g>
                );
              })}

              {nodes.map((node) => {
                const position = networkNodePositions[node.id];
                if (position === undefined) {
                  return null;
                }

                const nodeKindClass =
                  node.kind === "connector" ? "connector" : node.kind === "splice" ? "splice" : "intermediate";
                const isSelectedNode = selectedNodeId === node.id;
                const nodeClassName = `network-node ${nodeKindClass}${isSelectedNode ? " is-selected" : ""}`;
                const nodeLabel =
                  node.kind === "intermediate"
                    ? node.label
                    : node.kind === "connector"
                      ? (connectorMap.get(node.connectorId)?.technicalId ?? node.connectorId)
                      : (spliceMap.get(node.spliceId)?.technicalId ?? node.spliceId);

                return (
                  <g
                    key={node.id}
                    className={nodeClassName}
                    onMouseDown={(event) => handleNetworkNodeMouseDown(event, node.id)}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleNetworkNodeClick(node.id);
                    }}
                  >
                    <title>{describeNode(node)}</title>
                    <circle cx={position.x} cy={position.y} r={17} />
                    <text className="network-node-label" x={position.x} y={position.y + 4} textAnchor="middle">
                      {nodeLabel}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      )}
      <ul className="network-legend">
        <li>
          <span className="legend-swatch connector" /> Connector node
        </li>
        <li>
          <span className="legend-swatch splice" /> Splice node
        </li>
        <li>
          <span className="legend-swatch intermediate" /> Intermediate node
        </li>
        <li>
          <span className="legend-line selected" /> Selected segment
        </li>
        <li>
          <span className="legend-line wire" /> Wire highlighted segment
        </li>
      </ul>

      <h3 className="summary-title">Sub-networks</h3>
      {subNetworkSummaries.length === 0 ? (
        <p className="empty-copy">No sub-network tags yet. Segments currently belong to the default group.</p>
      ) : (
        <ul className="subnetwork-list">
          {subNetworkSummaries.map((group) => (
            <li key={group.tag}>
              <span className="subnetwork-chip">{group.tag}</span>
              <span>
                {group.segmentCount} segment(s), {group.totalLengthMm} mm total
              </span>
            </li>
          ))}
        </ul>
      )}

      <h3 className="summary-title">Selection snapshot</h3>
      <div className="selection-snapshot">
        <p>Connector: {selectedConnector === null ? "none" : `${selectedConnector.name} (${selectedConnector.technicalId})`}</p>
        <p>Splice: {selectedSplice === null ? "none" : `${selectedSplice.name} (${selectedSplice.technicalId})`}</p>
        <p>Node: {selectedNode === null ? "none" : describeNode(selectedNode)}</p>
        <p>Segment: {selectedSegment === null ? "none" : `${selectedSegment.id} (${selectedSegment.lengthMm} mm)`}</p>
        <p>Wire: {selectedWire === null ? "none" : `${selectedWire.name} (${selectedWire.technicalId})`}</p>
      </div>

      <h3 className="summary-title">Route preview</h3>
      <form className="row-form">
        <label>
          Start node
          <select value={routePreviewStartNodeId} onChange={(event) => setRoutePreviewStartNodeId(event.target.value)}>
            <option value="">Select node</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {describeNode(node)}
              </option>
            ))}
          </select>
        </label>

        <label>
          End node
          <select value={routePreviewEndNodeId} onChange={(event) => setRoutePreviewEndNodeId(event.target.value)}>
            <option value="">Select node</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {describeNode(node)}
              </option>
            ))}
          </select>
        </label>
      </form>

      {routePreviewStartNodeId.length > 0 && routePreviewEndNodeId.length > 0 ? (
        routePreview === null ? (
          <p className="empty-copy">No route currently exists between the selected nodes.</p>
        ) : (
          <div className="selection-snapshot">
            <p>Length: {routePreview.totalLengthMm} mm</p>
            <p>Segments: {routePreview.segmentIds.length === 0 ? "(none)" : routePreview.segmentIds.join(" -> ")}</p>
            <p>Nodes: {routePreview.nodeIds.join(" -> ")}</p>
          </div>
        )
      ) : (
        <p className="empty-copy">Select start and end nodes to preview shortest path routing.</p>
      )}
    </section>
  );

  return (
    <main className={appShellClassName}>
      <section className="header-block">
        <h1>Electrical Plan Editor</h1>
      </section>

      {lastError !== null ? (
        <section className="error-banner" role="alert">
          <p>{lastError}</p>
          <button type="button" onClick={() => dispatchAction(appActions.clearError())}>
            Clear
          </button>
        </section>
      ) : null}

      <section className="stats-grid" aria-label="Entity counters">
        <article>
          <h2>Connectors</h2>
          <p>{connectors.length}</p>
        </article>
        <article>
          <h2>Splices</h2>
          <p>{splices.length}</p>
        </article>
        <article>
          <h2>Nodes</h2>
          <p>{nodes.length}</p>
        </article>
        <article>
          <h2>Segments</h2>
          <p>{segments.length}</p>
        </article>
        <article>
          <h2>Wires</h2>
          <p>{wires.length}</p>
        </article>
      </section>

      <section className="workspace-shell">
        <aside className="workspace-sidebar">
          <section className="workspace-switcher">
            <div className="workspace-nav-row">
              {([
                ["modeling", "Modeling"],
                ["analysis", "Analysis"],
                ["validation", "Validation"],
                ["settings", "Settings"]
              ] as const).map(([screenId, label]) => (
                <button
                  key={screenId}
                  type="button"
                  className={activeScreen === screenId ? "workspace-tab is-active" : "workspace-tab"}
                  onClick={() => setActiveScreen(screenId)}
                >
                  <span className="workspace-tab-content">
                    <span>{label}</span>
                    {screenId === "validation" ? (
                      <span
                        className={validationErrorCount > 0 ? "workspace-tab-badge is-error" : "workspace-tab-badge"}
                        aria-hidden="true"
                      >
                        {validationIssues.length}
                      </span>
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
            {isModelingScreen || isAnalysisScreen ? (
              <div className="workspace-nav-row secondary">
                {([
                  ["connector", "Connector"],
                  ["splice", "Splice"],
                  ["node", "Node"],
                  ["segment", "Segment"],
                  ["wire", "Wire"]
                ] as const).map(([subScreenId, label]) => (
                  <button
                    key={subScreenId}
                    type="button"
                    className={activeSubScreen === subScreenId ? "workspace-tab is-active" : "workspace-tab"}
                    onClick={() => setActiveSubScreen(subScreenId)}
                  >
                    <span className="workspace-tab-content">
                      <span>{label}</span>
                      <span className="workspace-tab-badge" aria-hidden="true">
                        {entityCountBySubScreen[subScreenId]}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
            <p className="meta-line screen-description">
              {isModelingScreen
                ? "Modeling workspace: entity editor + operational lists."
                : isAnalysisScreen
                  ? "Analysis workspace: synthesis, route control, and network insight."
                  : isValidationScreen
                    ? "Validation center: grouped model integrity issues with one-click navigation."
                    : "Settings workspace: workspace preferences and project-level options."}
            </p>
          </section>

          <section className="workspace-meta">
            <div className="workspace-meta-main">
              <div className="row-actions compact">
                <button type="button" onClick={handleUndo} disabled={!isUndoAvailable}>
                  Undo
                </button>
                <button type="button" onClick={handleRedo} disabled={!isRedoAvailable}>
                  Redo
                </button>
              </div>
              {showShortcutHints ? (
                <>
                  <p className="shortcut-hints">Shortcuts: Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y redo.</p>
                  <p className="shortcut-hints">Nav: Alt+1..4 screens, Alt+Shift+1..5 entity tabs, Alt+V/N/G/C/R modes, Alt+F fit canvas, Alt+J/K issue nav.</p>
                </>
              ) : null}
            </div>
            <p className={`save-status is-${saveStatus}`}>
              State: {saveStatus === "saved" ? "Saved" : saveStatus === "unsaved" ? "Unsaved" : "Error"}
            </p>
            <section className="workspace-health" aria-label="Model health">
              <h2>Model health</h2>
              <p className="meta-line">
                Total issues: <strong>{validationIssues.length}</strong>
              </p>
              <p className="meta-line">
                Errors: <strong>{validationErrorCount}</strong> / Warnings: <strong>{validationWarningCount}</strong>
              </p>
              <p className="meta-line">
                Issue navigator:{" "}
                <strong>
                  {orderedValidationIssues.length === 0
                    ? "No issue"
                    : `${validationIssueCursor >= 0 ? validationIssueCursor + 1 : 1}/${orderedValidationIssues.length}`}
                </strong>
              </p>
              <div className="row-actions compact">
                <button type="button" onClick={() => handleOpenValidationScreen("all")}>
                  Open validation
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenValidationScreen("error")}
                  disabled={validationErrorCount === 0}
                >
                  Review errors
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenValidationScreen("warning")}
                  disabled={validationWarningCount === 0}
                >
                  Review warnings
                </button>
                <button
                  type="button"
                  onClick={() => moveValidationIssueCursor(-1)}
                  disabled={orderedValidationIssues.length === 0}
                >
                  Previous issue
                </button>
                <button
                  type="button"
                  onClick={() => moveValidationIssueCursor(1)}
                  disabled={orderedValidationIssues.length === 0}
                >
                  Next issue
                </button>
              </div>
            </section>
          </section>
        </aside>

        <section className="workspace-content">
      {isModelingScreen ? (
        <>
      <section className="workspace-stage">
      <section className="panel-grid workspace-column workspace-column-right">
        {inspectorContextPanel}
        <article className="panel" hidden={!isConnectorSubScreen}>
          <h2>{connectorFormMode === "create" ? "Create Connector" : "Edit Connector"}</h2>
          <form className="stack-form" onSubmit={handleConnectorSubmit}>
            <label>
              Functional name
              <input
                value={connectorName}
                onChange={(event) => setConnectorName(event.target.value)}
                placeholder="Rear body connector"
                required
              />
            </label>

            <label>
              Technical ID
              <input
                value={connectorTechnicalId}
                onChange={(event) => setConnectorTechnicalId(event.target.value)}
                placeholder="C-001"
                required
              />
            </label>
            {connectorTechnicalIdAlreadyUsed ? <small className="inline-error">This technical ID is already used.</small> : null}

            <label>
              Cavity count
              <input
                type="number"
                min={1}
                step={1}
                value={cavityCount}
                onChange={(event) => setCavityCount(event.target.value)}
                required
              />
            </label>

            <div className="row-actions">
              <button type="submit" disabled={connectorTechnicalIdAlreadyUsed}>
                {connectorFormMode === "create" ? "Create" : "Save"}
              </button>
              {connectorFormMode === "edit" ? (
                <button type="button" onClick={resetConnectorForm}>
                  Cancel edit
                </button>
              ) : null}
            </div>
            {connectorFormError !== null ? <small className="inline-error">{connectorFormError}</small> : null}
          </form>
        </article>

        <article className="panel" hidden={!isSpliceSubScreen}>
          <h2>{spliceFormMode === "create" ? "Create Splice" : "Edit Splice"}</h2>
          <form className="stack-form" onSubmit={handleSpliceSubmit}>
            <label>
              Functional name
              <input
                value={spliceName}
                onChange={(event) => setSpliceName(event.target.value)}
                placeholder="Cabin junction"
                required
              />
            </label>

            <label>
              Technical ID
              <input
                value={spliceTechnicalId}
                onChange={(event) => setSpliceTechnicalId(event.target.value)}
                placeholder="S-001"
                required
              />
            </label>
            {spliceTechnicalIdAlreadyUsed ? <small className="inline-error">This technical ID is already used.</small> : null}

            <label>
              Port count
              <input
                type="number"
                min={1}
                step={1}
                value={portCount}
                onChange={(event) => setPortCount(event.target.value)}
                required
              />
            </label>

            <div className="row-actions">
              <button type="submit" disabled={spliceTechnicalIdAlreadyUsed}>
                {spliceFormMode === "create" ? "Create" : "Save"}
              </button>
              {spliceFormMode === "edit" ? (
                <button type="button" onClick={resetSpliceForm}>
                  Cancel edit
                </button>
              ) : null}
            </div>
            {spliceFormError !== null ? <small className="inline-error">{spliceFormError}</small> : null}
          </form>
        </article>

        <article className="panel" hidden={!isNodeSubScreen}>
          <h2>{nodeFormMode === "create" ? "Create Node" : "Edit Node"}</h2>
          <form className="stack-form" onSubmit={handleNodeSubmit}>
            <label>
              Node ID
              <input
                value={nodeIdInput}
                onChange={(event) => setNodeIdInput(event.target.value)}
                placeholder="N-001"
                disabled={nodeFormMode === "edit"}
                required
              />
            </label>
            {nodeFormMode === "edit" ? <small className="inline-help">Node ID is immutable in edit mode.</small> : null}
            {nodeFormMode === "create" && pendingNewNodePosition !== null ? (
              <small className="inline-help">
                Canvas placement captured at x={Math.round(pendingNewNodePosition.x)}, y={Math.round(pendingNewNodePosition.y)}.
              </small>
            ) : null}

            <label>
              Node kind
              <select value={nodeKind} onChange={(event) => setNodeKind(event.target.value as NetworkNode["kind"])}>
                <option value="intermediate">Intermediate</option>
                <option value="connector">Connector node</option>
                <option value="splice">Splice node</option>
              </select>
            </label>

            {nodeKind === "intermediate" ? (
              <label>
                Label
                <input
                  value={nodeLabel}
                  onChange={(event) => setNodeLabel(event.target.value)}
                  placeholder="N-branch-01"
                  required
                />
              </label>
            ) : null}

            {nodeKind === "connector" ? (
              <label>
                Connector
                <select value={nodeConnectorId} onChange={(event) => setNodeConnectorId(event.target.value)} required>
                  <option value="">Select connector</option>
                  {connectors.map((connector) => (
                    <option key={connector.id} value={connector.id}>
                      {connector.name} ({connector.technicalId})
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {nodeKind === "splice" ? (
              <label>
                Splice
                <select value={nodeSpliceId} onChange={(event) => setNodeSpliceId(event.target.value)} required>
                  <option value="">Select splice</option>
                  {splices.map((splice) => (
                    <option key={splice.id} value={splice.id}>
                      {splice.name} ({splice.technicalId})
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <div className="row-actions">
              <button type="submit">{nodeFormMode === "create" ? "Create" : "Save"}</button>
              {nodeFormMode === "edit" ? (
                <button type="button" onClick={resetNodeForm}>
                  Cancel edit
                </button>
              ) : null}
            </div>
            {nodeFormError !== null ? <small className="inline-error">{nodeFormError}</small> : null}
          </form>
        </article>

        <article className="panel" hidden={!isSegmentSubScreen}>
          <h2>{segmentFormMode === "create" ? "Create Segment" : "Edit Segment"}</h2>
          <form className="stack-form" onSubmit={handleSegmentSubmit}>
            <label>
              Segment ID
              <input
                value={segmentIdInput}
                onChange={(event) => setSegmentIdInput(event.target.value)}
                placeholder="SEG-001"
                disabled={segmentFormMode === "edit"}
                required
              />
            </label>
            {segmentFormMode === "edit" ? (
              <small className="inline-help">Segment ID is immutable in edit mode.</small>
            ) : null}

            <label>
              Node A
              <select value={segmentNodeA} onChange={(event) => setSegmentNodeA(event.target.value)} required>
                <option value="">Select node</option>
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {describeNode(node)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Node B
              <select value={segmentNodeB} onChange={(event) => setSegmentNodeB(event.target.value)} required>
                <option value="">Select node</option>
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {describeNode(node)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Length (mm)
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={segmentLengthMm}
                onChange={(event) => setSegmentLengthMm(event.target.value)}
                required
              />
            </label>

            <label>
              Sub-network tag
              <input
                value={segmentSubNetworkTag}
                onChange={(event) => setSegmentSubNetworkTag(event.target.value)}
                placeholder="front-harness"
              />
            </label>

            <div className="row-actions">
              <button type="submit">{segmentFormMode === "create" ? "Create" : "Save"}</button>
              {segmentFormMode === "edit" ? (
                <button type="button" onClick={resetSegmentForm}>
                  Cancel edit
                </button>
              ) : null}
            </div>
            {segmentFormError !== null ? <small className="inline-error">{segmentFormError}</small> : null}
          </form>
        </article>

        <article className="panel" hidden={!isWireSubScreen}>
          <h2>{wireFormMode === "create" ? "Create Wire" : "Edit Wire"}</h2>
          <form className="stack-form" onSubmit={handleWireSubmit}>
            <label>
              Functional name
              <input value={wireName} onChange={(event) => setWireName(event.target.value)} placeholder="Feed wire" required />
            </label>

            <label>
              Technical ID
              <input
                value={wireTechnicalId}
                onChange={(event) => setWireTechnicalId(event.target.value)}
                placeholder="W-001"
                required
              />
            </label>
            {wireTechnicalIdAlreadyUsed ? <small className="inline-error">This technical ID is already used.</small> : null}

            <div className="form-split">
              <fieldset className="inline-fieldset">
                <legend>Endpoint A</legend>
                <label>
                  Type
                  <select value={wireEndpointAKind} onChange={(event) => setWireEndpointAKind(event.target.value as WireEndpoint["kind"])}>
                    <option value="connectorCavity">Connector cavity</option>
                    <option value="splicePort">Splice port</option>
                  </select>
                </label>
                {wireEndpointAKind === "connectorCavity" ? (
                  <>
                    <label>
                      Connector
                      <select value={wireEndpointAConnectorId} onChange={(event) => setWireEndpointAConnectorId(event.target.value)}>
                        <option value="">Select connector</option>
                        {connectors.map((connector) => (
                          <option key={connector.id} value={connector.id}>
                            {connector.name} ({connector.technicalId})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Cavity index
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={wireEndpointACavityIndex}
                        onChange={(event) => setWireEndpointACavityIndex(event.target.value)}
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <label>
                      Splice
                      <select value={wireEndpointASpliceId} onChange={(event) => setWireEndpointASpliceId(event.target.value)}>
                        <option value="">Select splice</option>
                        {splices.map((splice) => (
                          <option key={splice.id} value={splice.id}>
                            {splice.name} ({splice.technicalId})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Port index
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={wireEndpointAPortIndex}
                        onChange={(event) => setWireEndpointAPortIndex(event.target.value)}
                      />
                    </label>
                  </>
                )}
              </fieldset>

              <fieldset className="inline-fieldset">
                <legend>Endpoint B</legend>
                <label>
                  Type
                  <select value={wireEndpointBKind} onChange={(event) => setWireEndpointBKind(event.target.value as WireEndpoint["kind"])}>
                    <option value="connectorCavity">Connector cavity</option>
                    <option value="splicePort">Splice port</option>
                  </select>
                </label>
                {wireEndpointBKind === "connectorCavity" ? (
                  <>
                    <label>
                      Connector
                      <select value={wireEndpointBConnectorId} onChange={(event) => setWireEndpointBConnectorId(event.target.value)}>
                        <option value="">Select connector</option>
                        {connectors.map((connector) => (
                          <option key={connector.id} value={connector.id}>
                            {connector.name} ({connector.technicalId})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Cavity index
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={wireEndpointBCavityIndex}
                        onChange={(event) => setWireEndpointBCavityIndex(event.target.value)}
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <label>
                      Splice
                      <select value={wireEndpointBSpliceId} onChange={(event) => setWireEndpointBSpliceId(event.target.value)}>
                        <option value="">Select splice</option>
                        {splices.map((splice) => (
                          <option key={splice.id} value={splice.id}>
                            {splice.name} ({splice.technicalId})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Port index
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={wireEndpointBPortIndex}
                        onChange={(event) => setWireEndpointBPortIndex(event.target.value)}
                      />
                    </label>
                  </>
                )}
              </fieldset>
            </div>

            <div className="row-actions">
              <button type="submit" disabled={wireTechnicalIdAlreadyUsed}>
                {wireFormMode === "create" ? "Create" : "Save"}
              </button>
              {wireFormMode === "edit" ? (
                <button type="button" onClick={resetWireForm}>
                  Cancel edit
                </button>
              ) : null}
            </div>
            {wireFormError !== null ? <small className="inline-error">{wireFormError}</small> : null}
          </form>
        </article>
      </section>

      <section className="panel-grid workspace-column workspace-column-left">
        <article className="panel" hidden={!isConnectorSubScreen}>
          <h2>Connectors</h2>
          <div className="list-toolbar">
            <label className="stack-label list-search">
              Search
              <input
                aria-label="Search connectors"
                value={connectorSearchQuery}
                onChange={(event) => setConnectorSearchQuery(event.target.value)}
                placeholder="Name or technical ID"
              />
            </label>
            <div className="chip-group" role="group" aria-label="Connector occupancy filter">
              {([
                ["all", "All"],
                ["occupied", "Occupied"],
                ["free", "Free"]
              ] as const).map(([filterId, label]) => (
                <button
                  key={filterId}
                  type="button"
                  className={connectorOccupancyFilter === filterId ? "filter-chip is-active" : "filter-chip"}
                  onClick={() => setConnectorOccupancyFilter(filterId)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {connectors.length === 0 ? (
            <p className="empty-copy">No connector yet.</p>
          ) : visibleConnectors.length === 0 ? (
            <p className="empty-copy">No connector matches the current search/filter.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() => setConnectorSort((current) => nextSortState(current, "name"))}
                    >
                      Name <span className="sort-indicator">{getSortIndicator(connectorSort, "name")}</span>
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() => setConnectorSort((current) => nextSortState(current, "technicalId"))}
                    >
                      Technical ID <span className="sort-indicator">{getSortIndicator(connectorSort, "technicalId")}</span>
                    </button>
                  </th>
                  <th>Cavities</th>
                  <th>Occupied</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleConnectors.map((connector) => {
                  const occupiedCount = connectorOccupiedCountById.get(connector.id) ?? 0;
                  const isSelected = selectedConnectorId === connector.id;

                  return (
                    <tr key={connector.id} className={isSelected ? "is-selected" : undefined}>
                      <td>{connector.name}</td>
                      <td className="technical-id">{connector.technicalId}</td>
                      <td>{connector.cavityCount}</td>
                      <td>{occupiedCount}</td>
                      <td>
                        <div className="row-actions compact">
                          <button
                            type="button"
                            onClick={() => dispatchAction(appActions.select({ kind: "connector", id: connector.id }))}
                          >
                            Select
                          </button>
                          <button type="button" onClick={() => startConnectorEdit(connector)}>
                            Edit
                          </button>
                          <button type="button" onClick={() => handleConnectorDelete(connector.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </article>

        <article className="panel" hidden={!isSpliceSubScreen}>
          <h2>Splices</h2>
          <div className="list-toolbar">
            <label className="stack-label list-search">
              Search
              <input
                aria-label="Search splices"
                value={spliceSearchQuery}
                onChange={(event) => setSpliceSearchQuery(event.target.value)}
                placeholder="Name or technical ID"
              />
            </label>
            <div className="chip-group" role="group" aria-label="Splice occupancy filter">
              {([
                ["all", "All"],
                ["occupied", "Occupied"],
                ["free", "Free"]
              ] as const).map(([filterId, label]) => (
                <button
                  key={filterId}
                  type="button"
                  className={spliceOccupancyFilter === filterId ? "filter-chip is-active" : "filter-chip"}
                  onClick={() => setSpliceOccupancyFilter(filterId)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {splices.length === 0 ? (
            <p className="empty-copy">No splice yet.</p>
          ) : visibleSplices.length === 0 ? (
            <p className="empty-copy">No splice matches the current search/filter.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() => setSpliceSort((current) => nextSortState(current, "name"))}
                    >
                      Name <span className="sort-indicator">{getSortIndicator(spliceSort, "name")}</span>
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() => setSpliceSort((current) => nextSortState(current, "technicalId"))}
                    >
                      Technical ID <span className="sort-indicator">{getSortIndicator(spliceSort, "technicalId")}</span>
                    </button>
                  </th>
                  <th>Ports</th>
                  <th>Branches</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleSplices.map((splice) => {
                  const occupiedCount = spliceOccupiedCountById.get(splice.id) ?? 0;
                  const isSelected = selectedSpliceId === splice.id;

                  return (
                    <tr key={splice.id} className={isSelected ? "is-selected" : undefined}>
                      <td>
                        <span className="splice-badge">Junction</span> {splice.name}
                      </td>
                      <td className="technical-id">{splice.technicalId}</td>
                      <td>{splice.portCount}</td>
                      <td>{occupiedCount}</td>
                      <td>
                        <div className="row-actions compact">
                          <button
                            type="button"
                            onClick={() => dispatchAction(appActions.select({ kind: "splice", id: splice.id }))}
                          >
                            Select
                          </button>
                          <button type="button" onClick={() => startSpliceEdit(splice)}>
                            Edit
                          </button>
                          <button type="button" onClick={() => handleSpliceDelete(splice.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </article>

        <article className="panel" hidden={!isNodeSubScreen}>
          <h2>Nodes</h2>
          <div className="list-toolbar">
            <label className="stack-label list-search">
              Search
              <input
                aria-label="Search nodes"
                value={nodeSearchQuery}
                onChange={(event) => setNodeSearchQuery(event.target.value)}
                placeholder="ID, label, connector, splice"
              />
            </label>
            <div className="chip-group" role="group" aria-label="Node kind filter">
              {([
                ["all", "All"],
                ["connector", "Connector"],
                ["splice", "Splice"],
                ["intermediate", "Intermediate"]
              ] as const).map(([kindId, label]) => (
                <button
                  key={kindId}
                  type="button"
                  className={nodeKindFilter === kindId ? "filter-chip is-active" : "filter-chip"}
                  onClick={() => setNodeKindFilter(kindId)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {nodes.length === 0 ? (
            <p className="empty-copy">No node yet.</p>
          ) : visibleNodes.length === 0 ? (
            <p className="empty-copy">No node matches the current search/filter.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() =>
                        setNodeIdSortDirection((currentDirection) =>
                          currentDirection === "asc" ? "desc" : "asc"
                        )
                      }
                    >
                      ID <span className="sort-indicator">{nodeIdSortDirection === "asc" ? "▲" : "▼"}</span>
                    </button>
                  </th>
                  <th>Kind</th>
                  <th>Reference</th>
                  <th>Linked segments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleNodes.map((node) => {
                  const linkedSegments = segments.filter(
                    (segment) => segment.nodeA === node.id || segment.nodeB === node.id
                  ).length;
                  const isSelected = selectedNodeId === node.id;

                  return (
                    <tr key={node.id} className={isSelected ? "is-selected" : undefined}>
                      <td className="technical-id">{node.id}</td>
                      <td>{node.kind}</td>
                      <td>{describeNode(node)}</td>
                      <td>{linkedSegments}</td>
                      <td>
                        <div className="row-actions compact">
                          <button type="button" onClick={() => dispatchAction(appActions.select({ kind: "node", id: node.id }))}>
                            Select
                          </button>
                          <button type="button" onClick={() => startNodeEdit(node)}>
                            Edit
                          </button>
                          <button type="button" onClick={() => handleNodeDelete(node.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </article>

        <article className="panel" hidden={!isSegmentSubScreen}>
          <h2>Segments</h2>
          <div className="list-toolbar">
            <label className="stack-label list-search">
              Search
              <input
                aria-label="Search segments"
                value={segmentSearchQuery}
                onChange={(event) => setSegmentSearchQuery(event.target.value)}
                placeholder="ID, node, sub-network"
              />
            </label>
            <div className="chip-group" role="group" aria-label="Segment sub-network filter">
              {([
                ["all", "All"],
                ["default", "Default"],
                ["tagged", "Tagged"]
              ] as const).map(([filterId, label]) => (
                <button
                  key={filterId}
                  type="button"
                  className={segmentSubNetworkFilter === filterId ? "filter-chip is-active" : "filter-chip"}
                  onClick={() => setSegmentSubNetworkFilter(filterId)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {segments.length === 0 ? (
            <p className="empty-copy">No segment yet.</p>
          ) : visibleSegments.length === 0 ? (
            <p className="empty-copy">No segment matches the current search/filter.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() =>
                        setSegmentIdSortDirection((currentDirection) =>
                          currentDirection === "asc" ? "desc" : "asc"
                        )
                      }
                    >
                      ID <span className="sort-indicator">{segmentIdSortDirection === "asc" ? "▲" : "▼"}</span>
                    </button>
                  </th>
                  <th>Node A</th>
                  <th>Node B</th>
                  <th>Length (mm)</th>
                  <th>Sub-network</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleSegments.map((segment) => {
                  const nodeA = state.nodes.byId[segment.nodeA];
                  const nodeB = state.nodes.byId[segment.nodeB];
                  const isSelected = selectedSegmentId === segment.id;
                  const isWireHighlighted = selectedWireRouteSegmentIds.has(segment.id);
                  const rowClassName = isSelected
                    ? "is-selected"
                    : isWireHighlighted
                      ? "is-wire-highlighted"
                      : undefined;

                  return (
                    <tr key={segment.id} className={rowClassName}>
                      <td className="technical-id">{segment.id}</td>
                      <td>{nodeA === undefined ? segment.nodeA : describeNode(nodeA)}</td>
                      <td>{nodeB === undefined ? segment.nodeB : describeNode(nodeB)}</td>
                      <td>{segment.lengthMm}</td>
                      <td>
                        <span className="subnetwork-chip">{segment.subNetworkTag?.trim() || "(default)"}</span>
                      </td>
                      <td>
                        <div className="row-actions compact">
                          <button
                            type="button"
                            onClick={() => dispatchAction(appActions.select({ kind: "segment", id: segment.id }))}
                          >
                            Select
                          </button>
                          <button type="button" onClick={() => startSegmentEdit(segment)}>
                            Edit
                          </button>
                          <button type="button" onClick={() => handleSegmentDelete(segment.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </article>

        <article className="panel" hidden={!isWireSubScreen}>
          <h2>Wires</h2>
          <div className="list-toolbar">
            <label className="stack-label list-search">
              Search
              <input
                aria-label="Search wires"
                value={wireSearchQuery}
                onChange={(event) => setWireSearchQuery(event.target.value)}
                placeholder="Name or technical ID"
              />
            </label>
            <div className="chip-group" role="group" aria-label="Wire route mode filter">
              {([
                ["all", "All"],
                ["auto", "Auto"],
                ["locked", "Locked"]
              ] as const).map(([filterId, label]) => (
                <button
                  key={filterId}
                  type="button"
                  className={wireRouteFilter === filterId ? "filter-chip is-active" : "filter-chip"}
                  onClick={() => setWireRouteFilter(filterId)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {wires.length === 0 ? (
            <p className="empty-copy">No wire yet.</p>
          ) : visibleWires.length === 0 ? (
            <p className="empty-copy">No wire matches the current search/filter.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() => setWireSort((current) => nextSortState(current, "name"))}
                    >
                      Name <span className="sort-indicator">{getSortIndicator(wireSort, "name")}</span>
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() => setWireSort((current) => nextSortState(current, "technicalId"))}
                    >
                      Technical ID <span className="sort-indicator">{getSortIndicator(wireSort, "technicalId")}</span>
                    </button>
                  </th>
                  <th>Endpoints</th>
                  <th>Length (mm)</th>
                  <th>Route mode</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleWires.map((wire) => {
                  const isSelected = selectedWireId === wire.id;

                  return (
                    <tr key={wire.id} className={isSelected ? "is-selected" : undefined}>
                      <td>{wire.name}</td>
                      <td className="technical-id">{wire.technicalId}</td>
                      <td>
                        {describeWireEndpoint(wire.endpointA)} <strong>&rarr;</strong> {describeWireEndpoint(wire.endpointB)}
                      </td>
                      <td>{wire.lengthMm}</td>
                      <td>{wire.isRouteLocked ? "Locked" : "Auto"}</td>
                      <td>
                        <div className="row-actions compact">
                          <button
                            type="button"
                            onClick={() => {
                              setWireForcedRouteInput(wire.routeSegmentIds.join(", "));
                              dispatchAction(appActions.select({ kind: "wire", id: wire.id }));
                            }}
                          >
                            Select
                          </button>
                          <button type="button" onClick={() => startWireEdit(wire)}>
                            Edit
                          </button>
                          <button type="button" onClick={() => handleWireDelete(wire.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </article>
      </section>
      <section className="panel-grid workspace-column workspace-column-center">{networkSummaryPanel}</section>
      </section>
        </>
      ) : null}

      {isAnalysisScreen ? (
      <section className="panel-grid">
        {inspectorContextPanel}
        <section className="panel" hidden={!isConnectorSubScreen}>
          <h2>Connector cavities</h2>
          {selectedConnector === null ? (
            <p className="empty-copy">Select a connector to view and manage cavity occupancy.</p>
          ) : (
            <>
              <p className="meta-line">
                <strong>{selectedConnector.name}</strong> ({selectedConnector.technicalId})
              </p>
              <form className="row-form" onSubmit={handleReserveCavity}>
                <label>
                  Cavity index
                  <input
                    type="number"
                    min={1}
                    max={selectedConnector.cavityCount}
                    step={1}
                    value={cavityIndexInput}
                    onChange={(event) => setCavityIndexInput(event.target.value)}
                    required
                  />
                </label>

                <label>
                  Occupant reference
                  <input
                    value={connectorOccupantRefInput}
                    onChange={(event) => setConnectorOccupantRefInput(event.target.value)}
                    placeholder="wire-draft-001:A"
                    required
                  />
                </label>

                <button type="submit">Reserve cavity</button>
              </form>

              <div className="cavity-grid" aria-label="Cavity occupancy grid">
                {connectorCavityStatuses.map((slot) => (
                  <article key={slot.cavityIndex} className={slot.isOccupied ? "cavity is-occupied" : "cavity"}>
                    <h3>C{slot.cavityIndex}</h3>
                    <p>{slot.isOccupied ? slot.occupantRef : "Free"}</p>
                    {slot.isOccupied ? (
                      <button type="button" onClick={() => handleReleaseCavity(slot.cavityIndex)}>
                        Release
                      </button>
                    ) : null}
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="panel" hidden={!isConnectorSubScreen}>
          <h2>Connector synthesis</h2>
          {selectedConnector === null ? (
            <p className="empty-copy">Select a connector to view connected wire synthesis.</p>
          ) : sortedConnectorSynthesisRows.length === 0 ? (
            <p className="empty-copy">No wire currently connected to this connector.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() => setConnectorSynthesisSort((current) => nextSortState(current, "name"))}
                    >
                      Wire <span className="sort-indicator">{getSortIndicator(connectorSynthesisSort, "name")}</span>
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() => setConnectorSynthesisSort((current) => nextSortState(current, "technicalId"))}
                    >
                      Technical ID{" "}
                      <span className="sort-indicator">{getSortIndicator(connectorSynthesisSort, "technicalId")}</span>
                    </button>
                  </th>
                  <th>Local cavity</th>
                  <th>Destination</th>
                  <th>Length (mm)</th>
                </tr>
              </thead>
              <tbody>
                {sortedConnectorSynthesisRows.map((row) => (
                  <tr key={`${row.wireId}-${row.localEndpointLabel}`}>
                    <td>{row.wireName}</td>
                    <td className="technical-id">{row.wireTechnicalId}</td>
                    <td>{row.localEndpointLabel}</td>
                    <td>{row.remoteEndpointLabel}</td>
                    <td>{row.lengthMm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="panel" hidden={!isSpliceSubScreen}>
          <h2>Splice ports</h2>
          {selectedSplice === null ? (
            <p className="empty-copy">Select a splice to view and manage port occupancy.</p>
          ) : (
            <>
              <p className="meta-line">
                <span className="splice-badge">Junction</span> <strong>{selectedSplice.name}</strong> (
                {selectedSplice.technicalId})
              </p>
              <p className="meta-line">Branch count: {splicePortStatuses.filter((slot) => slot.isOccupied).length}</p>
              <form className="row-form" onSubmit={handleReservePort}>
                <label>
                  Port index
                  <input
                    type="number"
                    min={1}
                    max={selectedSplice.portCount}
                    step={1}
                    value={portIndexInput}
                    onChange={(event) => setPortIndexInput(event.target.value)}
                    required
                  />
                </label>

                <label>
                  Occupant reference
                  <input
                    value={spliceOccupantRefInput}
                    onChange={(event) => setSpliceOccupantRefInput(event.target.value)}
                    placeholder="wire-draft-001:B"
                    required
                  />
                </label>

                <button type="submit">Reserve port</button>
              </form>

              <div className="cavity-grid" aria-label="Splice port occupancy grid">
                {splicePortStatuses.map((slot) => (
                  <article key={slot.portIndex} className={slot.isOccupied ? "cavity is-occupied" : "cavity"}>
                    <h3>P{slot.portIndex}</h3>
                    <p>{slot.isOccupied ? slot.occupantRef : "Free"}</p>
                    {slot.isOccupied ? (
                      <button type="button" onClick={() => handleReleasePort(slot.portIndex)}>
                        Release
                      </button>
                    ) : null}
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="panel" hidden={!isSpliceSubScreen}>
          <h2>Splice synthesis</h2>
          {selectedSplice === null ? (
            <p className="empty-copy">Select a splice to view connected wire synthesis.</p>
          ) : sortedSpliceSynthesisRows.length === 0 ? (
            <p className="empty-copy">No wire currently connected to this splice.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() => setSpliceSynthesisSort((current) => nextSortState(current, "name"))}
                    >
                      Wire <span className="sort-indicator">{getSortIndicator(spliceSynthesisSort, "name")}</span>
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() => setSpliceSynthesisSort((current) => nextSortState(current, "technicalId"))}
                    >
                      Technical ID <span className="sort-indicator">{getSortIndicator(spliceSynthesisSort, "technicalId")}</span>
                    </button>
                  </th>
                  <th>Local port</th>
                  <th>Destination</th>
                  <th>Length (mm)</th>
                </tr>
              </thead>
              <tbody>
                {sortedSpliceSynthesisRows.map((row) => (
                  <tr key={`${row.wireId}-${row.localEndpointLabel}`}>
                    <td>{row.wireName}</td>
                    <td className="technical-id">{row.wireTechnicalId}</td>
                    <td>{row.localEndpointLabel}</td>
                    <td>{row.remoteEndpointLabel}</td>
                    <td>{row.lengthMm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="panel" hidden={!isWireSubScreen}>
          <h2>Wire route control</h2>
          {selectedWire === null ? (
            <p className="empty-copy">Select a wire to lock a forced route or reset to auto shortest path.</p>
          ) : (
            <>
              <p className="meta-line">
                <strong>{selectedWire.name}</strong> ({selectedWire.technicalId}) - {selectedWire.isRouteLocked ? "Locked" : "Auto"}
              </p>
              <p className="meta-line">
                {describeWireEndpoint(selectedWire.endpointA)} <strong>&rarr;</strong> {describeWireEndpoint(selectedWire.endpointB)}
              </p>
              <p className="meta-line">Current route: {selectedWire.routeSegmentIds.join(" -> ") || "(none)"}</p>
              <label className="stack-label">
                Forced route segment IDs (comma-separated)
                <input
                  value={wireForcedRouteInput}
                  onChange={(event) => setWireForcedRouteInput(event.target.value)}
                  placeholder="segment-1, segment-2, segment-3"
                />
              </label>
              <div className="row-actions">
                <button type="button" onClick={handleLockWireRoute}>
                  Lock forced route
                </button>
                <button type="button" onClick={handleResetWireRoute}>
                  Reset to auto route
                </button>
              </div>
              {wireFormError !== null ? <small className="inline-error">{wireFormError}</small> : null}
            </>
          )}
        </section>

        {networkSummaryPanel}
      </section>
      ) : null}

      {isValidationScreen ? (
        <section className="panel-grid">
          <section className="panel">
            <h2>Validation center</h2>
            <div className="validation-toolbar">
              <span>Issue filters</span>
              <div className="chip-group" role="group" aria-label="Validation severity filter">
                {([
                  ["all", "All severities"],
                  ["error", "Errors"],
                  ["warning", "Warnings"]
                ] as const).map(([severity, label]) => (
                  <button
                    key={severity}
                    type="button"
                    className={validationSeverityFilter === severity ? "filter-chip is-active" : "filter-chip"}
                    onClick={() => setValidationSeverityFilter(severity)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="chip-group" role="group" aria-label="Validation category filter">
                <button
                  type="button"
                  className={validationCategoryFilter === "all" ? "filter-chip is-active" : "filter-chip"}
                  onClick={() => setValidationCategoryFilter("all")}
                >
                  All
                </button>
                {validationCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={validationCategoryFilter === category ? "filter-chip is-active" : "filter-chip"}
                    onClick={() => setValidationCategoryFilter(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            {validationIssues.length === 0 ? (
              <p className="empty-copy">No integrity issue found in the current model.</p>
            ) : visibleValidationIssues.length === 0 ? (
              <p className="empty-copy">No integrity issue matches the selected category filter.</p>
            ) : (
              <div className="validation-groups">
                {groupedValidationIssues.map(([category, issues]) => (
                  <article key={category} className="validation-group">
                    <h3>{category}</h3>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Severity</th>
                          <th>Issue</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {issues.map((issue) => (
                          <tr key={issue.id}>
                            <td>
                              <span className={issue.severity === "error" ? "status-chip is-error" : "status-chip is-warning"}>
                                {issue.severity.toUpperCase()}
                              </span>
                            </td>
                            <td>{issue.message}</td>
                            <td>
                              <button type="button" onClick={() => handleValidationIssueGoTo(issue)}>
                                Go to
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </article>
                ))}
              </div>
            )}
          </section>
          <section className="panel">
            <h2>Validation summary</h2>
            <div className="summary-grid">
              <article>
                <h3>Total issues</h3>
                <p>{validationIssues.length}</p>
              </article>
              <article>
                <h3>Errors</h3>
                <p>{validationErrorCount}</p>
              </article>
              <article>
                <h3>Warnings</h3>
                <p>{validationWarningCount}</p>
              </article>
              <article>
                <h3>Visible</h3>
                <p>{visibleValidationIssues.length}</p>
              </article>
            </div>
            <p className="meta-line validation-active-filter">
              Active filters:{" "}
              {validationSeverityFilter === "all" ? "All severities" : validationSeverityFilter === "error" ? "Errors" : "Warnings"} /{" "}
              {validationCategoryFilter === "all" ? "All categories" : validationCategoryFilter}
            </p>
          </section>
        </section>
      ) : null}

      {isSettingsScreen ? (
        <section className="panel-grid">
          <section className="panel">
            <h2>Table and list preferences</h2>
            <div className="settings-grid">
              <label>
                Table density
                <select value={tableDensity} onChange={(event) => setTableDensity(event.target.value as TableDensity)}>
                  <option value="comfortable">Comfortable</option>
                  <option value="compact">Compact</option>
                </select>
              </label>
              <label>
                Default sort column
                <select value={defaultSortField} onChange={(event) => setDefaultSortField(event.target.value as SortField)}>
                  <option value="name">Name</option>
                  <option value="technicalId">Technical ID</option>
                </select>
              </label>
              <label>
                Default sort direction
                <select
                  value={defaultSortDirection}
                  onChange={(event) => setDefaultSortDirection(event.target.value as SortDirection)}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </label>
              <label>
                Default ID sort direction
                <select
                  value={defaultIdSortDirection}
                  onChange={(event) => setDefaultIdSortDirection(event.target.value as SortDirection)}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </label>
            </div>
            <div className="row-actions">
              <button type="button" onClick={applyListSortDefaults}>
                Apply sort defaults now
              </button>
            </div>
          </section>

          <section className="panel">
            <h2>Canvas preferences</h2>
            <div className="settings-grid">
              <label className="settings-checkbox">
                <input
                  type="checkbox"
                  checked={canvasDefaultShowGrid}
                  onChange={(event) => setCanvasDefaultShowGrid(event.target.checked)}
                />
                Show grid by default
              </label>
              <label className="settings-checkbox">
                <input
                  type="checkbox"
                  checked={canvasDefaultSnapToGrid}
                  onChange={(event) => setCanvasDefaultSnapToGrid(event.target.checked)}
                />
                Snap node movement by default
              </label>
              <label>
                Reset zoom target (%)
                <input
                  type="number"
                  min={Math.round(NETWORK_MIN_SCALE * 100)}
                  max={Math.round(NETWORK_MAX_SCALE * 100)}
                  step={5}
                  value={canvasResetZoomPercentInput}
                  onChange={(event) => setCanvasResetZoomPercentInput(event.target.value)}
                />
              </label>
            </div>
            <div className="row-actions">
              <button type="button" onClick={applyCanvasDefaultsNow}>
                Apply canvas defaults now
              </button>
              <button type="button" onClick={() => handleZoomAction("reset")}>
                Reset current view
              </button>
            </div>
            <p className="meta-line">Configured reset zoom: {configuredResetZoomPercent}%.</p>
          </section>

          <section className="panel">
            <h2>Action bar and shortcuts</h2>
            <div className="settings-grid">
              <label className="settings-checkbox">
                <input
                  type="checkbox"
                  checked={showShortcutHints}
                  onChange={(event) => setShowShortcutHints(event.target.checked)}
                />
                Show shortcut hints in the action bar
              </label>
              <label className="settings-checkbox">
                <input
                  type="checkbox"
                  checked={keyboardShortcutsEnabled}
                  onChange={(event) => setKeyboardShortcutsEnabled(event.target.checked)}
                />
                Enable keyboard shortcuts (undo/redo/navigation/modes)
              </label>
            </div>
            <ul className="subnetwork-list">
              <li>
                <span className="technical-id">Ctrl/Cmd + Z</span> Undo last modeling action
              </li>
              <li>
                <span className="technical-id">Ctrl/Cmd + Shift + Z</span> Redo
              </li>
              <li>
                <span className="technical-id">Ctrl/Cmd + Y</span> Redo alternative shortcut
              </li>
              <li>
                <span className="technical-id">Alt + 1..4</span> Switch top-level workspace
              </li>
              <li>
                <span className="technical-id">Alt + Shift + 1..5</span> Switch entity sub-screen
              </li>
              <li>
                <span className="technical-id">Alt + V/N/G/C/R</span> Set interaction mode
              </li>
              <li>
                <span className="technical-id">Alt + F</span> Fit network view to current graph
              </li>
              <li>
                <span className="technical-id">Alt + J / Alt + K</span> Previous / next validation issue
              </li>
            </ul>
            <div className="row-actions">
              <button type="button" onClick={resetWorkspacePreferencesToDefaults}>
                Reset all UI preferences
              </button>
            </div>
          </section>
        </section>
      ) : null}
        </section>
      </section>
    </main>
  );
}
