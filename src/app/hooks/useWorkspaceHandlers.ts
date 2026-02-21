import type { FormEvent } from "react";
import type { Network, NetworkId, NetworkNode, NodeId } from "../../core/entities";
import type { AppStore, ThemeMode } from "../../store";
import { appActions, createSampleNetworkState, selectNetworkTechnicalIdTaken } from "../../store";
import {
  NETWORK_MAX_SCALE,
  NETWORK_MIN_SCALE,
  NETWORK_VIEW_HEIGHT,
  NETWORK_VIEW_WIDTH,
  buildUniqueNetworkTechnicalId,
  clamp,
  createEntityId
} from "../lib/app-utils";
import type {
  CanvasLabelStrokeMode,
  NodePosition,
  SortDirection,
  SortField,
  SortState,
  TableDensity,
  TableFontSize
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
  configuredResetScale: number;
  setNetworkScale: (value: number) => void;
  setNetworkOffset: (value: NodePosition) => void;
  canvasDefaultShowGrid: boolean;
  canvasDefaultSnapToGrid: boolean;
  canvasDefaultShowInfoPanels: boolean;
  canvasDefaultShowSegmentLengths: boolean;
  canvasDefaultLabelStrokeMode: CanvasLabelStrokeMode;
  setShowNetworkGrid: (value: boolean | ((current: boolean) => boolean)) => void;
  setSnapNodesToGrid: (value: boolean | ((current: boolean) => boolean)) => void;
  setShowNetworkInfoPanels: (value: boolean | ((current: boolean) => boolean)) => void;
  setShowSegmentLengths: (value: boolean | ((current: boolean) => boolean)) => void;
  setNetworkLabelStrokeMode: (value: CanvasLabelStrokeMode | ((current: CanvasLabelStrokeMode) => CanvasLabelStrokeMode)) => void;
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
  setDefaultSortField: (value: SortField) => void;
  setDefaultSortDirection: (value: SortDirection) => void;
  setDefaultIdSortDirection: (value: SortDirection) => void;
  setCanvasDefaultShowGrid: (value: boolean) => void;
  setCanvasDefaultSnapToGrid: (value: boolean) => void;
  setCanvasDefaultShowInfoPanels: (value: boolean) => void;
  setCanvasDefaultShowSegmentLengths: (value: boolean) => void;
  setCanvasDefaultLabelStrokeMode: (value: CanvasLabelStrokeMode) => void;
  setCanvasResetZoomPercentInput: (value: string) => void;
  setShowShortcutHints: (value: boolean) => void;
  setKeyboardShortcutsEnabled: (value: boolean) => void;
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
  configuredResetScale,
  setNetworkScale,
  setNetworkOffset,
  canvasDefaultShowGrid,
  canvasDefaultSnapToGrid,
  canvasDefaultShowInfoPanels,
  canvasDefaultShowSegmentLengths,
  canvasDefaultLabelStrokeMode,
  setShowNetworkGrid,
  setSnapNodesToGrid,
  setShowNetworkInfoPanels,
  setShowSegmentLengths,
  setNetworkLabelStrokeMode,
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
  setDefaultSortField,
  setDefaultSortDirection,
  setDefaultIdSortDirection,
  setCanvasDefaultShowGrid,
  setCanvasDefaultSnapToGrid,
  setCanvasDefaultShowInfoPanels,
  setCanvasDefaultShowSegmentLengths,
  setCanvasDefaultLabelStrokeMode,
  setCanvasResetZoomPercentInput,
  setShowShortcutHints,
  setKeyboardShortcutsEnabled
}: UseWorkspaceHandlersParams) {
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

    if (typeof window !== "undefined" && typeof window.confirm === "function") {
      const shouldDelete = window.confirm(`Delete network '${targetNetwork.name}' (${targetNetwork.technicalId})?`);
      if (!shouldDelete) {
        return;
      }
    }

    dispatchAction(appActions.deleteNetwork(targetNetwork.id));
    setNetworkFormError(null);
  }

  function handleRecreateSampleNetwork(): void {
    if (!isCurrentWorkspaceEmpty) {
      return;
    }

    replaceStateWithHistory(createSampleNetworkState());
  }

  function handleResetSampleNetwork(): void {
    if (!hasBuiltInSampleState) {
      return;
    }

    if (typeof window !== "undefined" && typeof window.confirm === "function") {
      const shouldReset = window.confirm(
        "Reset the sample network to baseline? This removes any changes made to sample entities."
      );
      if (!shouldReset) {
        return;
      }
    }

    replaceStateWithHistory(createSampleNetworkState());
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
    setShowNetworkInfoPanels(canvasDefaultShowInfoPanels);
    setShowSegmentLengths(canvasDefaultShowSegmentLengths);
    setNetworkLabelStrokeMode(canvasDefaultLabelStrokeMode);
    resetNetworkViewToConfiguredScale();
  }

  function resetWorkspacePreferencesToDefaults(): void {
    const defaultSort: SortState = { field: "name", direction: "asc" };
    setThemeMode("dark");
    setTableDensity("compact");
    setTableFontSize("normal");
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
    setCanvasDefaultShowInfoPanels(true);
    setCanvasDefaultShowSegmentLengths(false);
    setCanvasDefaultLabelStrokeMode("normal");
    setCanvasResetZoomPercentInput("100");
    setShowNetworkGrid(true);
    setSnapNodesToGrid(true);
    setShowNetworkInfoPanels(true);
    setShowSegmentLengths(false);
    setNetworkLabelStrokeMode("normal");
    setNetworkScale(1);
    setNetworkOffset({ x: 0, y: 0 });
    setShowShortcutHints(false);
    setKeyboardShortcutsEnabled(true);
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
    applyListSortDefaults,
    applyCanvasDefaultsNow,
    resetWorkspacePreferencesToDefaults
  };
}
