import type { FormEvent } from "react";
import type { Connector, ConnectorId, Network, NetworkId, NetworkNode, NodeId, Splice, SpliceId } from "../../core/entities";
import type { AppState, AppStore, ThemeMode } from "../../store";
import type { ConfirmDialogRequest } from "../types/confirm-dialog";
import {
  appActions,
  appReducer,
  createCatalogValidationIssuesSampleNetworkState,
  createPricingBomQaSampleNetworkState,
  createSampleNetworkState,
  createValidationIssuesSampleNetworkState,
  selectNetworkTechnicalIdTaken
} from "../../store";
import {
  NETWORK_MAX_SCALE,
  NETWORK_MIN_SCALE,
  NETWORK_VIEW_HEIGHT,
  NETWORK_VIEW_WIDTH,
  buildUniqueNetworkTechnicalId,
  clamp,
  createEntityId
} from "../lib/app-utils-shared";
import type {
  CanvasCalloutTextSize,
  CanvasLabelRotationDegrees,
  CanvasLabelSizeMode,
  CanvasLabelStrokeMode,
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
  newNetworkDescription: string;
  setNewNetworkDescription: (value: string) => void;
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
  networkScale: number;
  networkOffset: NodePosition;
  setNetworkScale: (value: number) => void;
  setNetworkOffset: (value: NodePosition) => void;
  canvasDefaultShowGrid: boolean;
  canvasDefaultSnapToGrid: boolean;
  canvasDefaultLockEntityMovement: boolean;
  canvasDefaultShowInfoPanels: boolean;
  canvasDefaultShowSegmentLengths: boolean;
  canvasDefaultShowCableCallouts: boolean;
  canvasDefaultShowSelectedCalloutOnly: boolean;
  canvasDefaultLabelStrokeMode: CanvasLabelStrokeMode;
  canvasDefaultLabelSizeMode: CanvasLabelSizeMode;
  canvasDefaultCalloutTextSize: CanvasCalloutTextSize;
  canvasDefaultLabelRotationDegrees: CanvasLabelRotationDegrees;
  canvasDefaultAutoSegmentLabelRotation: boolean;
  showCableCallouts: boolean;
  networkCalloutTextSize: CanvasCalloutTextSize;
  setShowNetworkGrid: (value: boolean | ((current: boolean) => boolean)) => void;
  setSnapNodesToGrid: (value: boolean | ((current: boolean) => boolean)) => void;
  setLockEntityMovement: (value: boolean | ((current: boolean) => boolean)) => void;
  setShowNetworkInfoPanels: (value: boolean | ((current: boolean) => boolean)) => void;
  setShowSegmentLengths: (value: boolean | ((current: boolean) => boolean)) => void;
  setShowCableCallouts: (value: boolean | ((current: boolean) => boolean)) => void;
  setShowSelectedCalloutOnly: (value: boolean | ((current: boolean) => boolean)) => void;
  setNetworkLabelStrokeMode: (value: CanvasLabelStrokeMode | ((current: CanvasLabelStrokeMode) => CanvasLabelStrokeMode)) => void;
  setNetworkLabelSizeMode: (value: CanvasLabelSizeMode | ((current: CanvasLabelSizeMode) => CanvasLabelSizeMode)) => void;
  setNetworkCalloutTextSize: (value: CanvasCalloutTextSize | ((current: CanvasCalloutTextSize) => CanvasCalloutTextSize)) => void;
  setNetworkLabelRotationDegrees: (
    value: CanvasLabelRotationDegrees | ((current: CanvasLabelRotationDegrees) => CanvasLabelRotationDegrees)
  ) => void;
  setNetworkAutoSegmentLabelRotation: (value: boolean | ((current: boolean) => boolean)) => void;
  defaultSortField: SortField;
  defaultSortDirection: SortDirection;
  defaultIdSortDirection: SortDirection;
  setConnectorSort: (value: SortState) => void;
  setSpliceSort: (value: SortState) => void;
  setWireSort: (value: SortState) => void;
  setConnectorSynthesisSort: (value: SortState) => void;
  setSpliceSynthesisSort: (value: SortState) => void;
  setNetworkSort: (value: SortState) => void;
  setNodeIdSortDirection: (value: SortDirection) => void;
  setSegmentIdSortDirection: (value: SortDirection) => void;
  setThemeMode: (value: ThemeMode | ((current: ThemeMode) => ThemeMode)) => void;
  setTableDensity: (value: TableDensity) => void;
  setTableFontSize: (value: TableFontSize) => void;
  setWorkspaceCurrencyCode: (value: WorkspaceCurrencyCode) => void;
  setWorkspaceTaxEnabled: (value: boolean) => void;
  setWorkspaceTaxRatePercent: (value: number) => void;
  setDefaultWireSectionMm2: (value: number) => void;
  setDefaultAutoCreateLinkedNodes: (value: boolean) => void;
  setDefaultSortField: (value: SortField) => void;
  setDefaultSortDirection: (value: SortDirection) => void;
  setDefaultIdSortDirection: (value: SortDirection) => void;
  setCanvasDefaultShowGrid: (value: boolean) => void;
  setCanvasDefaultSnapToGrid: (value: boolean) => void;
  setCanvasDefaultLockEntityMovement: (value: boolean) => void;
  setCanvasDefaultShowInfoPanels: (value: boolean) => void;
  setCanvasDefaultShowSegmentLengths: (value: boolean) => void;
  setCanvasDefaultShowCableCallouts: (value: boolean) => void;
  setCanvasDefaultShowSelectedCalloutOnly: (value: boolean) => void;
  setCanvasDefaultLabelStrokeMode: (value: CanvasLabelStrokeMode) => void;
  setCanvasDefaultLabelSizeMode: (value: CanvasLabelSizeMode) => void;
  setCanvasDefaultCalloutTextSize: (value: CanvasCalloutTextSize) => void;
  setCanvasDefaultLabelRotationDegrees: (value: CanvasLabelRotationDegrees) => void;
  setCanvasDefaultAutoSegmentLabelRotation: (value: boolean) => void;
  setCanvasPngExportIncludeBackground: (value: boolean) => void;
  setCanvasResetZoomPercentInput: (value: string) => void;
  setShowShortcutHints: (value: boolean) => void;
  setKeyboardShortcutsEnabled: (value: boolean) => void;
  setShowFloatingInspectorPanel: (value: boolean) => void;
  setWorkspacePanelsLayoutMode: (value: WorkspacePanelsLayoutMode) => void;
  confirmAction: (request: ConfirmDialogRequest) => Promise<boolean>;
}

export function useWorkspaceHandlers({
  store,
  networks,
  newNetworkName,
  setNewNetworkName,
  newNetworkTechnicalId,
  setNewNetworkTechnicalId,
  newNetworkDescription,
  setNewNetworkDescription,
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
  networkScale,
  networkOffset,
  setNetworkScale,
  setNetworkOffset,
  canvasDefaultShowGrid,
  canvasDefaultSnapToGrid,
  canvasDefaultLockEntityMovement,
  canvasDefaultShowInfoPanels,
  canvasDefaultShowSegmentLengths,
  canvasDefaultShowCableCallouts,
  canvasDefaultShowSelectedCalloutOnly,
  canvasDefaultLabelStrokeMode,
  canvasDefaultLabelSizeMode,
  canvasDefaultCalloutTextSize,
  canvasDefaultLabelRotationDegrees,
  canvasDefaultAutoSegmentLabelRotation,
  showCableCallouts,
  networkCalloutTextSize,
  setShowNetworkGrid,
  setSnapNodesToGrid,
  setLockEntityMovement,
  setShowNetworkInfoPanels,
  setShowSegmentLengths,
  setShowCableCallouts,
  setShowSelectedCalloutOnly,
  setNetworkLabelStrokeMode,
  setNetworkLabelSizeMode,
  setNetworkCalloutTextSize,
  setNetworkLabelRotationDegrees,
  setNetworkAutoSegmentLabelRotation,
  defaultSortField,
  defaultSortDirection,
  defaultIdSortDirection,
  setConnectorSort,
  setSpliceSort,
  setWireSort,
  setConnectorSynthesisSort,
  setSpliceSynthesisSort,
  setNetworkSort,
  setNodeIdSortDirection,
  setSegmentIdSortDirection,
  setThemeMode,
  setTableDensity,
  setTableFontSize,
  setWorkspaceCurrencyCode,
  setWorkspaceTaxEnabled,
  setWorkspaceTaxRatePercent,
  setDefaultWireSectionMm2,
  setDefaultAutoCreateLinkedNodes,
  setDefaultSortField,
  setDefaultSortDirection,
  setDefaultIdSortDirection,
  setCanvasDefaultShowGrid,
  setCanvasDefaultSnapToGrid,
  setCanvasDefaultLockEntityMovement,
  setCanvasDefaultShowInfoPanels,
  setCanvasDefaultShowSegmentLengths,
  setCanvasDefaultShowCableCallouts,
  setCanvasDefaultShowSelectedCalloutOnly,
  setCanvasDefaultLabelStrokeMode,
  setCanvasDefaultLabelSizeMode,
  setCanvasDefaultCalloutTextSize,
  setCanvasDefaultLabelRotationDegrees,
  setCanvasDefaultAutoSegmentLabelRotation,
  setCanvasPngExportIncludeBackground,
  setCanvasResetZoomPercentInput,
  setShowShortcutHints,
  setKeyboardShortcutsEnabled,
  setShowFloatingInspectorPanel,
  setWorkspacePanelsLayoutMode,
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

    const nowIso = new Date().toISOString();
    const networkId = createEntityId("net") as NetworkId;
    dispatchAction(
      appActions.createNetwork({
        id: networkId,
        name: trimmedName,
        technicalId: trimmedTechnicalId,
        description: newNetworkDescription.trim().length === 0 ? undefined : newNetworkDescription.trim(),
        createdAt: nowIso,
        updatedAt: nowIso
      })
    );

    if (store.getState().networks.byId[networkId] !== undefined) {
      setNetworkFormError(null);
      setNewNetworkName("");
      setNewNetworkTechnicalId("");
      setNewNetworkDescription("");
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

    dispatchAction(
      appActions.updateNetwork(
        targetNetworkId,
        trimmedName,
        trimmedTechnicalId,
        new Date().toISOString(),
        newNetworkDescription.trim().length === 0 ? undefined : newNetworkDescription.trim()
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
        intent: "danger"
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

  function handleRecreateValidationIssuesSampleNetwork(): void {
    if (isCurrentWorkspaceEmpty) {
      refreshBuiltInSampleNetworks(createValidationIssuesSampleNetworkState, {
        activateImportedSample: true
      });
      return;
    }

    void (async () => {
      const shouldReplace = await confirmAction({
        title: "Replace built-in sample content",
        message: "Refresh built-in sample networks with the validation issues sample? User-created networks are preserved.",
        intent: "warning"
      });
      if (!shouldReplace) {
        return;
      }

      refreshBuiltInSampleNetworks(createValidationIssuesSampleNetworkState, {
        activateImportedSample: true
      });
    })();
  }

  function handleRecreateCatalogValidationIssuesSampleNetwork(): void {
    if (isCurrentWorkspaceEmpty) {
      refreshBuiltInSampleNetworks(createCatalogValidationIssuesSampleNetworkState, {
        activateImportedSample: true
      });
      return;
    }

    void (async () => {
      const shouldReplace = await confirmAction({
        title: "Replace built-in sample content",
        message: "Refresh built-in sample networks with the catalog validation issues sample? User-created networks are preserved.",
        intent: "warning"
      });
      if (!shouldReplace) {
        return;
      }

      refreshBuiltInSampleNetworks(createCatalogValidationIssuesSampleNetworkState, {
        activateImportedSample: true
      });
    })();
  }

  function handleRecreatePricingBomQaSampleNetwork(): void {
    if (isCurrentWorkspaceEmpty) {
      refreshBuiltInSampleNetworks(createPricingBomQaSampleNetworkState, {
        activateImportedSample: true
      });
      return;
    }

    void (async () => {
      const shouldReplace = await confirmAction({
        title: "Replace built-in sample content",
        message: "Refresh built-in sample networks with the pricing / BOM QA sample? User-created networks are preserved.",
        intent: "warning"
      });
      if (!shouldReplace) {
        return;
      }

      refreshBuiltInSampleNetworks(createPricingBomQaSampleNetworkState, {
        activateImportedSample: true
      });
    })();
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

    const computeFitScaleForBounds = (bounds: { minX: number; maxX: number; minY: number; maxY: number }) => {
      // Nodes are positioned by their center coordinates; expand the fit bounds so shapes
      // (rect/circle) and labels do not visually stick to the viewport edges after fitting.
      const entityVisualPadding = 28;
      const fitPadding = 40;
      const paddedMinX = bounds.minX - entityVisualPadding;
      const paddedMaxX = bounds.maxX + entityVisualPadding;
      const paddedMinY = bounds.minY - entityVisualPadding;
      const paddedMaxY = bounds.maxY + entityVisualPadding;
      const contentWidth = Math.max(1, paddedMaxX - paddedMinX);
      const contentHeight = Math.max(1, paddedMaxY - paddedMinY);
      const availableWidth = Math.max(1, NETWORK_VIEW_WIDTH - fitPadding * 2);
      const availableHeight = Math.max(1, NETWORK_VIEW_HEIGHT - fitPadding * 2);
      const fittedScale = clamp(
        Math.min(availableWidth / contentWidth, availableHeight / contentHeight),
        NETWORK_MIN_SCALE,
        NETWORK_MAX_SCALE
      );

      return {
        fitPadding,
        paddedMinX,
        paddedMaxX,
        paddedMinY,
        paddedMaxY,
        fittedScale
      };
    };

    if (showCableCallouts) {
      let measuredCalloutBoundsFromDom = false;

      if (typeof document !== "undefined" && networkScale > 0.0001) {
        const svgElement = document.querySelector<SVGSVGElement>(".network-summary-stack .network-svg");
        const svgRect = svgElement?.getBoundingClientRect();
        const calloutFrames = svgElement?.querySelectorAll(".network-callout-frame");
        const hasUsableSvgRect =
          svgRect !== undefined &&
          svgRect.width > 0 &&
          svgRect.height > 0 &&
          Number.isFinite(svgRect.left) &&
          Number.isFinite(svgRect.top);

        if (svgElement !== null && hasUsableSvgRect && calloutFrames !== undefined && calloutFrames.length > 0) {
          const scaleX = NETWORK_VIEW_WIDTH / svgRect.width;
          const scaleY = NETWORK_VIEW_HEIGHT / svgRect.height;

          calloutFrames.forEach((frame) => {
            const rect = frame.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) {
              return;
            }

            const leftSvg = (rect.left - svgRect.left) * scaleX;
            const rightSvg = (rect.right - svgRect.left) * scaleX;
            const topSvg = (rect.top - svgRect.top) * scaleY;
            const bottomSvg = (rect.bottom - svgRect.top) * scaleY;

            const leftModel = (leftSvg - networkOffset.x) / networkScale;
            const rightModel = (rightSvg - networkOffset.x) / networkScale;
            const topModel = (topSvg - networkOffset.y) / networkScale;
            const bottomModel = (bottomSvg - networkOffset.y) / networkScale;

            minX = Math.min(minX, leftModel);
            maxX = Math.max(maxX, rightModel);
            minY = Math.min(minY, topModel);
            maxY = Math.max(maxY, bottomModel);
            measuredCalloutBoundsFromDom = true;
          });
        }
      }

      if (!measuredCalloutBoundsFromDom) {
        const initialFit = computeFitScaleForBounds({ minX, maxX, minY, maxY });
        const safeScale = Math.max(0.05, initialFit.fittedScale);
        const inverseLabelScale = 1 / safeScale;
        const estimatedCalloutHalfWidthBySize: Record<CanvasCalloutTextSize, number> = {
          small: 110,
          normal: 130,
          large: 155
        };
        const estimatedCalloutHalfHeightBySize: Record<CanvasCalloutTextSize, number> = {
          small: 42,
          normal: 52,
          large: 64
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
    }
    const { paddedMinX, paddedMaxX, paddedMinY, paddedMaxY, fittedScale } = computeFitScaleForBounds({
      minX,
      maxX,
      minY,
      maxY
    });

    const centerX = (paddedMinX + paddedMaxX) / 2;
    const centerY = (paddedMinY + paddedMaxY) / 2;
    setNetworkScale(fittedScale);
    setNetworkOffset({
      x: NETWORK_VIEW_WIDTH / 2 - centerX * fittedScale,
      y: NETWORK_VIEW_HEIGHT / 2 - centerY * fittedScale
    });
  }

  function applyListSortDefaults(): void {
    setNetworkSort({ field: defaultSortField, direction: defaultSortDirection });
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
    setLockEntityMovement(canvasDefaultLockEntityMovement);
    setShowNetworkInfoPanels(canvasDefaultShowInfoPanels);
    setShowSegmentLengths(canvasDefaultShowSegmentLengths);
    setShowCableCallouts(canvasDefaultShowCableCallouts);
    setShowSelectedCalloutOnly(canvasDefaultShowSelectedCalloutOnly);
    setNetworkLabelStrokeMode(canvasDefaultLabelStrokeMode);
    setNetworkLabelSizeMode(canvasDefaultLabelSizeMode);
    setNetworkCalloutTextSize(canvasDefaultCalloutTextSize);
    setNetworkLabelRotationDegrees(canvasDefaultLabelRotationDegrees);
    setNetworkAutoSegmentLabelRotation(canvasDefaultAutoSegmentLabelRotation);
    resetNetworkViewToConfiguredScale();
  }

  function resetWorkspacePreferencesToDefaults(): void {
    const defaultSort: SortState = { field: "name", direction: "asc" };
    setThemeMode("warmBrown");
    setTableDensity("compact");
    setTableFontSize("normal");
    setWorkspaceCurrencyCode("EUR");
    setWorkspaceTaxEnabled(true);
    setWorkspaceTaxRatePercent(20);
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
    setCanvasDefaultShowSegmentLengths(false);
    setCanvasDefaultShowCableCallouts(false);
    setCanvasDefaultShowSelectedCalloutOnly(false);
    setCanvasDefaultLabelStrokeMode("normal");
    setCanvasDefaultLabelSizeMode("normal");
    setCanvasDefaultCalloutTextSize("normal");
    setCanvasDefaultLabelRotationDegrees(0);
    setCanvasDefaultAutoSegmentLabelRotation(false);
    setCanvasPngExportIncludeBackground(true);
    setCanvasResetZoomPercentInput("60");
    setShowNetworkGrid(true);
    setSnapNodesToGrid(true);
    setLockEntityMovement(false);
    setShowNetworkInfoPanels(true);
    setShowSegmentLengths(false);
    setShowCableCallouts(false);
    setShowSelectedCalloutOnly(false);
    setNetworkLabelStrokeMode("normal");
    setNetworkLabelSizeMode("normal");
    setNetworkCalloutTextSize("normal");
    setNetworkLabelRotationDegrees(0);
    setNetworkAutoSegmentLabelRotation(false);
    setNetworkScale(1);
    setNetworkOffset({ x: 0, y: 0 });
    setShowShortcutHints(false);
    setKeyboardShortcutsEnabled(true);
    setShowFloatingInspectorPanel(true);
    setWorkspacePanelsLayoutMode("singleColumn");
  }

  return {
    handleCreateNetwork,
    handleSelectNetwork,
    handleUpdateActiveNetwork,
    handleDuplicateNetwork,
    handleDeleteNetwork,
    handleRecreateSampleNetwork,
    handleRecreateValidationIssuesSampleNetwork,
    handleRecreateCatalogValidationIssuesSampleNetwork,
    handleRecreatePricingBomQaSampleNetwork,
    handleResetSampleNetwork,
    resetNetworkViewToConfiguredScale,
    fitNetworkToContent,
    applyListSortDefaults,
    applyCanvasDefaultsNow,
    resetWorkspacePreferencesToDefaults
  };
}
