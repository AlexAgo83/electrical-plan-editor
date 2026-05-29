import type { FormEvent } from "react";
import type { Connector, ConnectorId, Network, NetworkId, NetworkNode, NodeId, Splice, SpliceId } from "../../core/entities";
import {
  formatIsoToLocalDateInput,
  isNetworkLogoUrlValid,
  isNetworkProjectCodeValid,
  normalizeNetworkLogoUrl,
  normalizeNetworkProjectCode,
  parseLocalDateInputToIso
} from "../../core/networkMetadata";
import { normalizeNetworkVoltageV } from "../../core/wireSizing";
import type { AppState, AppStore, ThemeMode } from "../../store";
import type { ConfirmDialogRequest } from "../types/confirm-dialog";
import {
  appActions,
  appReducer,
  createSampleNetworkState,
  selectNetworkTechnicalIdTaken
} from "../../store";
import {
  NETWORK_MAX_SCALE,
  NETWORK_MIN_SCALE,
  buildUniqueNetworkTechnicalId,
  createEntityId
} from "../lib/app-utils-shared";
import { computeNetworkFitViewportForBounds } from "../lib/networkSummaryViewport";
import type {
  AppLocale,
  CanvasCalloutTextSize,
  CanvasLabelRotationDegrees,
  CanvasLabelSizeMode,
  CanvasLabelStrokeMode,
  ConnectorDrawingDisplayMode,
  NetworkCalloutContentMode,
  NodePosition,
  SortDirection,
  SortField,
  SortState,
  TableDensity,
  TableFontSize,
  WorkspaceCurrencyCode,
  WorkspacePanelsLayoutMode
} from "../types/app-controller";

type DispatchAction = (
  action: Parameters<AppStore["dispatch"]>[0],
  options?: {
    trackHistory?: boolean;
  }
) => void;

interface UseWorkspaceHandlersParams {
  store: AppStore;
  networks: Network[];
  newNetworkName: string;
  setNewNetworkName: (value: string) => void;
  newNetworkTechnicalId: string;
  setNewNetworkTechnicalId: (value: string) => void;
  newNetworkCreatedAtDate: string;
  setNewNetworkCreatedAtDate: (value: string) => void;
  newNetworkDescription: string;
  setNewNetworkDescription: (value: string) => void;
  newNetworkAuthor: string;
  setNewNetworkAuthor: (value: string) => void;
  newNetworkVoltageV: string;
  setNewNetworkVoltageV: (value: string) => void;
  newNetworkProjectCode: string;
  setNewNetworkProjectCode: (value: string) => void;
  newNetworkLogoUrl: string;
  setNewNetworkLogoUrl: (value: string) => void;
  newNetworkExportNotes: string;
  setNewNetworkExportNotes: (value: string) => void;
  setNetworkFormError: (value: string | null) => void;
  isCurrentWorkspaceEmpty: boolean;
  hasBuiltInSampleState: boolean;
  dispatchAction: DispatchAction;
  replaceStateWithHistory: (nextState: ReturnType<typeof createSampleNetworkState>) => void;
  nodes: NetworkNode[];
  networkNodePositions: Record<NodeId, NodePosition>;
  connectorMap: Map<ConnectorId, Connector>;
  spliceMap: Map<SpliceId, Splice>;
  configuredResetScale: number;
  networkViewWidth: number;
  networkViewHeight: number;
  setNetworkScale: (value: number) => void;
  setNetworkOffset: (value: NodePosition) => void;
  showCableCallouts: boolean;
  networkCalloutTextSize: CanvasCalloutTextSize;
  setShowNetworkGrid: (value: boolean | ((current: boolean) => boolean)) => void;
  setSnapNodesToGrid: (value: boolean | ((current: boolean) => boolean)) => void;
  setLockEntityMovement: (value: boolean | ((current: boolean) => boolean)) => void;
  setShowNetworkInfoPanels: (value: boolean | ((current: boolean) => boolean)) => void;
  setShowSegmentNames: (value: boolean | ((current: boolean) => boolean)) => void;
  setShowSegmentLengths: (value: boolean | ((current: boolean) => boolean)) => void;
  setShowCableCallouts: (value: boolean | ((current: boolean) => boolean)) => void;
  setNetworkCalloutContentMode: (
    value: NetworkCalloutContentMode | ((current: NetworkCalloutContentMode) => NetworkCalloutContentMode)
  ) => void;
  setShowSelectedCalloutOnly: (value: boolean | ((current: boolean) => boolean)) => void;
  setNetworkLabelStrokeMode: (value: CanvasLabelStrokeMode | ((current: CanvasLabelStrokeMode) => CanvasLabelStrokeMode)) => void;
  setNetworkLabelSizeMode: (value: CanvasLabelSizeMode | ((current: CanvasLabelSizeMode) => CanvasLabelSizeMode)) => void;
  setNetworkCalloutTextSize: (value: CanvasCalloutTextSize | ((current: CanvasCalloutTextSize) => CanvasCalloutTextSize)) => void;
  setNetworkLabelRotationDegrees: (
    value: CanvasLabelRotationDegrees | ((current: CanvasLabelRotationDegrees) => CanvasLabelRotationDegrees)
  ) => void;
  setNetworkAutoSegmentLabelRotation: (value: boolean | ((current: boolean) => boolean)) => void;
  setConnectorSort: (value: SortState) => void;
  setSpliceSort: (value: SortState) => void;
  setWireSort: (value: SortState) => void;
  setConnectorSynthesisSort: (value: SortState) => void;
  setSpliceSynthesisSort: (value: SortState) => void;
  setNetworkSort: (value: SortState) => void;
  setNodeIdSortDirection: (value: SortDirection) => void;
  setSegmentIdSortDirection: (value: SortDirection) => void;
  setThemeMode: (value: ThemeMode | ((current: ThemeMode) => ThemeMode)) => void;
  setLocale: (value: AppLocale) => void;
  setTableDensity: (value: TableDensity) => void;
  setTableFontSize: (value: TableFontSize) => void;
  setWorkspaceCurrencyCode: (value: WorkspaceCurrencyCode) => void;
  setWorkspaceTaxEnabled: (value: boolean) => void;
  setWorkspaceTaxRatePercent: (value: number) => void;
  setBomTraceabilityLabelsHidden: (value: boolean) => void;
  setDefaultWireSectionMm2: (value: number) => void;
  setDefaultAutoCreateLinkedNodes: (value: boolean) => void;
  setDefaultSortField: (value: SortField) => void;
  setDefaultSortDirection: (value: SortDirection) => void;
  setDefaultIdSortDirection: (value: SortDirection) => void;
  setCanvasDefaultShowGrid: (value: boolean) => void;
  setCanvasDefaultSnapToGrid: (value: boolean) => void;
  setCanvasDefaultLockEntityMovement: (value: boolean) => void;
  setCanvasDefaultShowInfoPanels: (value: boolean) => void;
  setCanvasDefaultShowSegmentNames: (value: boolean) => void;
  setCanvasDefaultShowSegmentLengths: (value: boolean) => void;
  setCanvasDefaultShowCableCallouts: (value: boolean) => void;
  setCanvasDefaultCalloutContentMode: (value: NetworkCalloutContentMode) => void;
  setCanvasDefaultShowSelectedCalloutOnly: (value: boolean) => void;
  setCanvasDefaultLabelStrokeMode: (value: CanvasLabelStrokeMode) => void;
  setCanvasDefaultLabelSizeMode: (value: CanvasLabelSizeMode) => void;
  setCanvasDefaultCalloutTextSize: (value: CanvasCalloutTextSize) => void;
  setCanvasDefaultLabelRotationDegrees: (value: CanvasLabelRotationDegrees) => void;
  setCanvasDefaultAutoSegmentLabelRotation: (value: boolean) => void;
  setCanvasShowCalloutWireNames: (value: boolean) => void;
  setCanvasConnectorDrawingDisplayMode: (value: ConnectorDrawingDisplayMode) => void;
  setCanvasGlobalRenderScalePercent: (value: number) => void;
  setCanvasZoomInvariantNodeShapes: (value: boolean) => void;
  setCanvasNodeShapeSizePercent: (value: number) => void;
  setCanvasExportFormat: (value: "svg" | "png") => void;
  setCanvasPngExportIncludeBackground: (value: boolean) => void;
  setCanvasExportIncludeFrame: (value: boolean) => void;
  setCanvasExportIncludeCartouche: (value: boolean) => void;
  setCanvasResizeBehaviorMode: (value: "responsiveContentScale" | "visibleAreaOnly") => void;
  setCanvasResetZoomPercentInput: (value: string) => void;
  setShowShortcutHints: (value: boolean) => void;
  setKeyboardShortcutsEnabled: (value: boolean) => void;
  setRestoreViewportOnUndo: (value: boolean) => void;
  setShowFloatingInspectorPanel: (value: boolean) => void;
  setShowRoutePreviewPanel: (value: boolean) => void;
  setHideWireAnalysisRoutePanel: (value: boolean) => void;
  setWorkspacePanelsLayoutMode: (value: WorkspacePanelsLayoutMode) => void;
  setWorkspaceWideScreen: (value: boolean) => void;
  confirmAction: (request: ConfirmDialogRequest) => Promise<boolean>;
}

export function useWorkspaceHandlers({
  store,
  networks,
  newNetworkName,
  setNewNetworkName,
  newNetworkTechnicalId,
  setNewNetworkTechnicalId,
  newNetworkCreatedAtDate,
  setNewNetworkCreatedAtDate,
  newNetworkDescription,
  setNewNetworkDescription,
  newNetworkAuthor,
  setNewNetworkAuthor,
  newNetworkVoltageV,
  setNewNetworkVoltageV,
  newNetworkProjectCode,
  setNewNetworkProjectCode,
  newNetworkLogoUrl,
  setNewNetworkLogoUrl,
  newNetworkExportNotes,
  setNewNetworkExportNotes,
  setNetworkFormError,
  isCurrentWorkspaceEmpty,
  hasBuiltInSampleState,
  dispatchAction,
  replaceStateWithHistory,
  nodes,
  networkNodePositions,
  connectorMap,
  spliceMap,
  configuredResetScale,
  networkViewWidth,
  networkViewHeight,
  setNetworkScale,
  setNetworkOffset,
  showCableCallouts,
  networkCalloutTextSize,
  setShowNetworkGrid,
  setSnapNodesToGrid,
  setLockEntityMovement,
  setShowNetworkInfoPanels,
  setShowSegmentNames,
  setShowSegmentLengths,
  setShowCableCallouts,
  setNetworkCalloutContentMode,
  setShowSelectedCalloutOnly,
  setNetworkLabelStrokeMode,
  setNetworkLabelSizeMode,
  setNetworkCalloutTextSize,
  setNetworkLabelRotationDegrees,
  setNetworkAutoSegmentLabelRotation,
  setConnectorSort,
  setSpliceSort,
  setWireSort,
  setConnectorSynthesisSort,
  setSpliceSynthesisSort,
  setNetworkSort,
  setNodeIdSortDirection,
  setSegmentIdSortDirection,
  setThemeMode,
  setLocale,
  setTableDensity,
  setTableFontSize,
  setWorkspaceCurrencyCode,
  setWorkspaceTaxEnabled,
  setWorkspaceTaxRatePercent,
  setBomTraceabilityLabelsHidden,
  setDefaultWireSectionMm2,
  setDefaultAutoCreateLinkedNodes,
  setDefaultSortField,
  setDefaultSortDirection,
  setDefaultIdSortDirection,
  setCanvasDefaultShowGrid,
  setCanvasDefaultSnapToGrid,
  setCanvasDefaultLockEntityMovement,
  setCanvasDefaultShowInfoPanels,
  setCanvasDefaultShowSegmentNames,
  setCanvasDefaultShowSegmentLengths,
  setCanvasDefaultShowCableCallouts,
  setCanvasDefaultCalloutContentMode,
  setCanvasDefaultShowSelectedCalloutOnly,
  setCanvasDefaultLabelStrokeMode,
  setCanvasDefaultLabelSizeMode,
  setCanvasDefaultCalloutTextSize,
  setCanvasDefaultLabelRotationDegrees,
  setCanvasDefaultAutoSegmentLabelRotation,
  setCanvasShowCalloutWireNames,
  setCanvasConnectorDrawingDisplayMode,
  setCanvasGlobalRenderScalePercent,
  setCanvasZoomInvariantNodeShapes,
  setCanvasNodeShapeSizePercent,
  setCanvasExportFormat,
  setCanvasPngExportIncludeBackground,
  setCanvasExportIncludeFrame,
  setCanvasExportIncludeCartouche,
  setCanvasResizeBehaviorMode,
  setCanvasResetZoomPercentInput,
  setShowShortcutHints,
  setKeyboardShortcutsEnabled,
  setRestoreViewportOnUndo,
  setShowFloatingInspectorPanel,
  setShowRoutePreviewPanel,
  setHideWireAnalysisRoutePanel,
  setWorkspacePanelsLayoutMode,
  setWorkspaceWideScreen,
  confirmAction
}: UseWorkspaceHandlersParams) {
  function refreshBuiltInSampleNetworks(
    sampleFactory: () => AppState,
    options?: { activateImportedSample?: boolean }
  ): void {
    const currentState = store.getState();
    const sampleState = sampleFactory();
    const sampleNetworkIds = sampleState.networks.allIds;
    const sampleActiveNetworkId = sampleState.activeNetworkId;

    let nextState = currentState;
    for (const sampleNetworkId of sampleNetworkIds) {
      if (nextState.networks.byId[sampleNetworkId] === undefined) {
        continue;
      }
      nextState = appReducer(nextState, appActions.deleteNetwork(sampleNetworkId));
    }

    const orderedSampleNetworkIds =
      options?.activateImportedSample === true && sampleActiveNetworkId !== null
        ? [sampleActiveNetworkId, ...sampleNetworkIds.filter((networkId) => networkId !== sampleActiveNetworkId)]
        : sampleNetworkIds;
    const sampleNetworks = orderedSampleNetworkIds
      .map((networkId) => sampleState.networks.byId[networkId])
      .filter((network): network is NonNullable<typeof network> => network !== undefined);
    const imported = appReducer(
      nextState,
      appActions.importNetworks(sampleNetworks, sampleState.networkStates, options?.activateImportedSample ?? false)
    );
    replaceStateWithHistory(imported);
  }

  function handleCreateNetwork(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const trimmedName = newNetworkName.trim();
    const trimmedTechnicalId = newNetworkTechnicalId.trim();
    if (trimmedName.length === 0 || trimmedTechnicalId.length === 0) {
      setNetworkFormError("Network name and technical ID are required.");
      return;
    }

    if (selectNetworkTechnicalIdTaken(store.getState(), trimmedTechnicalId)) {
      setNetworkFormError(`Network technical ID '${trimmedTechnicalId}' is already used.`);
      return;
    }

    const normalizedProjectCode = normalizeNetworkProjectCode(newNetworkProjectCode);
    if (normalizedProjectCode !== undefined && !isNetworkProjectCodeValid(normalizedProjectCode)) {
      setNetworkFormError("Project code supports letters, numbers, spaces, and _ . / - characters only.");
      return;
    }

    const normalizedLogoUrl = normalizeNetworkLogoUrl(newNetworkLogoUrl);
    if (normalizedLogoUrl !== undefined && !isNetworkLogoUrlValid(normalizedLogoUrl)) {
      setNetworkFormError("Logo URL must use http, https, or data:image/*.");
      return;
    }

    const createdAtIso = parseLocalDateInputToIso(newNetworkCreatedAtDate);
    if (createdAtIso === null) {
      setNetworkFormError("Creation date is invalid.");
      return;
    }

    const rawVoltage = newNetworkVoltageV.trim();
    const parsedVoltage = rawVoltage.length === 0 ? undefined : Number(rawVoltage);
    const normalizedVoltageV = rawVoltage.length === 0 ? undefined : normalizeNetworkVoltageV(parsedVoltage);
    if (rawVoltage.length > 0 && normalizedVoltageV === undefined) {
      setNetworkFormError("Network voltage must be a positive value in V.");
      return;
    }

    const nowIso = new Date().toISOString();
    const networkId = createEntityId("net") as NetworkId;
    dispatchAction(
      appActions.createNetwork({
        id: networkId,
        name: trimmedName,
        technicalId: trimmedTechnicalId,
        createdAt: createdAtIso,
        author: newNetworkAuthor,
        voltageV: normalizedVoltageV,
        projectCode: newNetworkProjectCode,
        logoUrl: newNetworkLogoUrl,
        exportNotes: newNetworkExportNotes,
        description: newNetworkDescription.trim().length === 0 ? undefined : newNetworkDescription.trim(),
        updatedAt: nowIso
      })
    );

    if (store.getState().networks.byId[networkId] !== undefined) {
      setNetworkFormError(null);
      setNewNetworkName("");
      setNewNetworkTechnicalId("");
      setNewNetworkCreatedAtDate(formatIsoToLocalDateInput(nowIso));
      setNewNetworkDescription("");
      setNewNetworkAuthor("");
      setNewNetworkVoltageV("");
      setNewNetworkProjectCode("");
      setNewNetworkLogoUrl("");
      setNewNetworkExportNotes("");
      return;
    }

    setNetworkFormError("Unable to create network. Check technical ID uniqueness.");
  }

  function handleSelectNetwork(nextNetworkId: NetworkId): void {
    dispatchAction(appActions.selectNetwork(nextNetworkId), { trackHistory: false });
  }

  function handleUpdateActiveNetwork(event: FormEvent<HTMLFormElement>, targetNetworkId: NetworkId | null): void {
    event.preventDefault();

    if (targetNetworkId === null) {
      setNetworkFormError("No network selected for editing.");
      return;
    }

    const targetNetwork = store.getState().networks.byId[targetNetworkId];
    if (targetNetwork === undefined) {
      setNetworkFormError("Selected network no longer exists.");
      return;
    }

    const trimmedName = newNetworkName.trim();
    const trimmedTechnicalId = newNetworkTechnicalId.trim();
    if (trimmedName.length === 0 || trimmedTechnicalId.length === 0) {
      setNetworkFormError("Network name and technical ID are required.");
      return;
    }

    if (selectNetworkTechnicalIdTaken(store.getState(), trimmedTechnicalId, targetNetworkId)) {
      setNetworkFormError(`Network technical ID '${trimmedTechnicalId}' is already used.`);
      return;
    }

    const normalizedProjectCode = normalizeNetworkProjectCode(newNetworkProjectCode);
    if (normalizedProjectCode !== undefined && !isNetworkProjectCodeValid(normalizedProjectCode)) {
      setNetworkFormError("Project code supports letters, numbers, spaces, and _ . / - characters only.");
      return;
    }

    const normalizedLogoUrl = normalizeNetworkLogoUrl(newNetworkLogoUrl);
    if (normalizedLogoUrl !== undefined && !isNetworkLogoUrlValid(normalizedLogoUrl)) {
      setNetworkFormError("Logo URL must use http, https, or data:image/*.");
      return;
    }

    const createdAtIso = parseLocalDateInputToIso(newNetworkCreatedAtDate);
    if (createdAtIso === null) {
      setNetworkFormError("Creation date is invalid.");
      return;
    }

    const rawVoltage = newNetworkVoltageV.trim();
    const parsedVoltage = rawVoltage.length === 0 ? undefined : Number(rawVoltage);
    const normalizedVoltageV = rawVoltage.length === 0 ? undefined : normalizeNetworkVoltageV(parsedVoltage);
    if (rawVoltage.length > 0 && normalizedVoltageV === undefined) {
      setNetworkFormError("Network voltage must be a positive value in V.");
      return;
    }

    dispatchAction(
      appActions.updateNetwork(
        targetNetworkId,
        trimmedName,
        trimmedTechnicalId,
        new Date().toISOString(),
        newNetworkDescription.trim().length === 0 ? undefined : newNetworkDescription.trim(),
        {
          createdAt: createdAtIso,
          author: newNetworkAuthor,
          voltageV: normalizedVoltageV,
          projectCode: newNetworkProjectCode,
          logoUrl: newNetworkLogoUrl,
          exportNotes: newNetworkExportNotes
        }
      )
    );
    setNetworkFormError(null);
  }

  function handleDuplicateNetwork(targetNetworkId: NetworkId | null): void {
    if (targetNetworkId === null) {
      return;
    }

    const targetNetwork = store.getState().networks.byId[targetNetworkId];
    if (targetNetwork === undefined) {
      setNetworkFormError("Selected network no longer exists.");
      return;
    }

    const existingTechnicalIds = new Set(networks.map((network) => network.technicalId));
    const technicalId = buildUniqueNetworkTechnicalId(targetNetwork.technicalId, existingTechnicalIds);
    const nowIso = new Date().toISOString();
    dispatchAction(
      appActions.duplicateNetwork(targetNetwork.id, {
        id: createEntityId("net") as NetworkId,
        name: `${targetNetwork.name} (Copy)`,
        technicalId,
        description: targetNetwork.description,
        author: targetNetwork.author,
        voltageV: targetNetwork.voltageV,
        projectCode: targetNetwork.projectCode,
        logoUrl: targetNetwork.logoUrl,
        exportNotes: targetNetwork.exportNotes,
        createdAt: nowIso,
        updatedAt: nowIso
      })
    );
    setNetworkFormError(null);
  }

  function handleDeleteNetwork(targetNetworkId: NetworkId | null): void {
    if (targetNetworkId === null) {
      return;
    }

    const targetNetwork = store.getState().networks.byId[targetNetworkId];
    if (targetNetwork === undefined) {
      setNetworkFormError("Selected network no longer exists.");
      return;
    }

    void (async () => {
      const shouldDelete = await confirmAction({
        title: "Delete network",
        message: `Delete network '${targetNetwork.name}' (${targetNetwork.technicalId})?`,
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
        intent: "danger",
        confirmOnEnter: true
      });
      if (!shouldDelete) {
        return;
      }

      dispatchAction(appActions.deleteNetwork(targetNetwork.id));
      setNetworkFormError(null);
    })();
  }

  function handleRecreateSampleNetwork(): void {
    refreshBuiltInSampleNetworks(createSampleNetworkState, {
      activateImportedSample: isCurrentWorkspaceEmpty
    });
  }

  function handleResetSampleNetwork(): void {
    if (!hasBuiltInSampleState) {
      return;
    }

    void (async () => {
      const shouldReset = await confirmAction({
        title: "Reset sample network",
        message: "Reset the sample network to baseline? This removes any changes made to sample entities.",
        intent: "warning"
      });
      if (!shouldReset) {
        return;
      }

      refreshBuiltInSampleNetworks(createSampleNetworkState, {
        activateImportedSample: true
      });
    })();
  }

  function resetNetworkViewToConfiguredScale(): void {
    const positions = nodes
      .map((node) => networkNodePositions[node.id])
      .filter((position): position is NodePosition => position !== undefined);
    const firstPosition = positions[0];
    if (firstPosition === undefined) {
      setCanvasGlobalRenderScalePercent(0);
      setNetworkScale(configuredResetScale);
      setNetworkOffset({ x: 0, y: 0 });
      return;
    }

    let minX = firstPosition.x;
    let maxX = firstPosition.x;
    let minY = firstPosition.y;
    let maxY = firstPosition.y;
    for (const position of positions.slice(1)) {
      minX = Math.min(minX, position.x);
      maxX = Math.max(maxX, position.x);
      minY = Math.min(minY, position.y);
      maxY = Math.max(maxY, position.y);
    }

    const scale = configuredResetScale > 0 ? configuredResetScale : 1;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    setCanvasGlobalRenderScalePercent(0);
    setNetworkScale(scale);
    setNetworkOffset({
      x: networkViewWidth / 2 - centerX * scale,
      y: networkViewHeight / 2 - centerY * scale
    });
  }

  function fitNetworkToContent(): void {
    resetNetworkViewToConfiguredScale();

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

    if (showCableCallouts) {
      const initialFit = computeNetworkFitViewportForBounds({
        bounds: { minX, maxX, minY, maxY },
        networkViewWidth,
        networkViewHeight,
        networkMinScale: NETWORK_MIN_SCALE,
        networkMaxScale: NETWORK_MAX_SCALE
      });
      const safeScale = Math.max(0.05, initialFit.scale);
      const inverseLabelScale = 1 / safeScale;
      const estimatedCalloutHalfWidthBySize: Record<CanvasCalloutTextSize, number> = {
        small: 130,
        normal: 155,
        large: 180,
        extraLarge: 180
      };
      const estimatedCalloutHalfHeightBySize: Record<CanvasCalloutTextSize, number> = {
        small: 52,
        normal: 64,
        large: 74,
        extraLarge: 74
      };
      const calloutHalfWidth = estimatedCalloutHalfWidthBySize[networkCalloutTextSize] * inverseLabelScale;
      const calloutHalfHeight = estimatedCalloutHalfHeightBySize[networkCalloutTextSize] * inverseLabelScale;

      for (const node of nodes) {
        if (node.kind !== "connector" && node.kind !== "splice") {
          continue;
        }
        const persistedPosition =
          node.kind === "connector"
            ? connectorMap.get(node.connectorId)?.cableCalloutPosition
            : spliceMap.get(node.spliceId)?.cableCalloutPosition;
        if (persistedPosition === undefined) {
          continue;
        }

        minX = Math.min(minX, persistedPosition.x - calloutHalfWidth);
        maxX = Math.max(maxX, persistedPosition.x + calloutHalfWidth);
        minY = Math.min(minY, persistedPosition.y - calloutHalfHeight);
        maxY = Math.max(maxY, persistedPosition.y + calloutHalfHeight);
      }
    }
    const fittedViewport = computeNetworkFitViewportForBounds({
      bounds: { minX, maxX, minY, maxY },
      networkViewWidth,
      networkViewHeight,
      networkMinScale: NETWORK_MIN_SCALE,
      networkMaxScale: NETWORK_MAX_SCALE
    });

    setNetworkScale(fittedViewport.scale);
    setNetworkOffset(fittedViewport.offset);
  }

  function resetWorkspacePreferencesToDefaults(): void {
    const defaultSort: SortState = { field: "name", direction: "asc" };
    setLocale("en");
    setThemeMode("warmBrown");
    setTableDensity("compact");
    setTableFontSize("normal");
    setWorkspaceCurrencyCode("EUR");
    setWorkspaceTaxEnabled(true);
    setWorkspaceTaxRatePercent(20);
    setBomTraceabilityLabelsHidden(false);
    setDefaultWireSectionMm2(0.5);
    setDefaultAutoCreateLinkedNodes(true);
    setDefaultSortField("name");
    setDefaultSortDirection("asc");
    setDefaultIdSortDirection("asc");
    setConnectorSort(defaultSort);
    setSpliceSort(defaultSort);
    setWireSort(defaultSort);
    setNetworkSort(defaultSort);
    setConnectorSynthesisSort(defaultSort);
    setSpliceSynthesisSort(defaultSort);
    setNodeIdSortDirection("asc");
    setSegmentIdSortDirection("asc");
    setCanvasDefaultShowGrid(true);
    setCanvasDefaultSnapToGrid(true);
    setCanvasDefaultLockEntityMovement(false);
    setCanvasDefaultShowInfoPanels(true);
    setCanvasDefaultShowSegmentNames(false);
    setCanvasDefaultShowSegmentLengths(true);
    setCanvasDefaultShowCableCallouts(false);
    setCanvasDefaultCalloutContentMode("wireDetails");
    setCanvasConnectorDrawingDisplayMode("disabled");
    setCanvasGlobalRenderScalePercent(0);
    setCanvasDefaultShowSelectedCalloutOnly(false);
    setCanvasDefaultLabelStrokeMode("light");
    setCanvasDefaultLabelSizeMode("small");
    setCanvasDefaultCalloutTextSize("normal");
    setCanvasDefaultLabelRotationDegrees(0);
    setCanvasDefaultAutoSegmentLabelRotation(true);
    setCanvasShowCalloutWireNames(false);
    setCanvasZoomInvariantNodeShapes(true);
    setCanvasNodeShapeSizePercent(70);
    setCanvasExportFormat("svg");
    setCanvasPngExportIncludeBackground(true);
    setCanvasExportIncludeFrame(false);
    setCanvasExportIncludeCartouche(true);
    setCanvasResizeBehaviorMode("visibleAreaOnly");
    setCanvasResetZoomPercentInput("100");
    setShowNetworkGrid(true);
    setSnapNodesToGrid(true);
    setLockEntityMovement(false);
    setShowNetworkInfoPanels(true);
    setShowSegmentNames(false);
    setShowSegmentLengths(true);
    setShowCableCallouts(false);
    setNetworkCalloutContentMode("wireDetails");
    setShowSelectedCalloutOnly(false);
    setNetworkLabelStrokeMode("light");
    setNetworkLabelSizeMode("small");
    setNetworkCalloutTextSize("normal");
    setNetworkLabelRotationDegrees(0);
    setNetworkAutoSegmentLabelRotation(true);
    setNetworkScale(1);
    setNetworkOffset({ x: 0, y: 0 });
    setShowShortcutHints(false);
    setKeyboardShortcutsEnabled(true);
    setRestoreViewportOnUndo(true);
    setShowFloatingInspectorPanel(true);
    setShowRoutePreviewPanel(false);
    setHideWireAnalysisRoutePanel(false);
    setWorkspacePanelsLayoutMode("singleColumn");
    setWorkspaceWideScreen(false);
  }

  return {
    handleCreateNetwork,
    handleSelectNetwork,
    handleUpdateActiveNetwork,
    handleDuplicateNetwork,
    handleDeleteNetwork,
    handleRecreateSampleNetwork,
    handleResetSampleNetwork,
    resetNetworkViewToConfiguredScale,
    fitNetworkToContent,
    resetWorkspacePreferencesToDefaults
  };
}
