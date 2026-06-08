import type { FormEvent } from "react";
import type { NetworkId } from "../../core/entities";
import { formatIsoToLocalDateInput } from "../../core/networkMetadata";
import type { AppState } from "../../store";
import {
  appActions,
  appReducer,
  createSampleNetworkState,
  selectNetworkTechnicalIdTaken
} from "../../store";
import { buildUniqueNetworkTechnicalId, createEntityId } from "../lib/app-utils-shared";
import { buildNetworkFormDraft } from "../lib/networkFormDraft";
import {
  fitNetworkToContent as fitNetworkToContentViewport,
  resetNetworkViewToConfiguredScale as resetNetworkViewToConfiguredScaleViewport
} from "../lib/workspaceNetworkViewportActions";
import type { SortState } from "../types/app-controller";
import type { UseWorkspaceHandlersParams } from "./workspaceHandlerTypes";

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
  segments,
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

    const draftResult = buildNetworkFormDraft({
      name: newNetworkName,
      technicalId: newNetworkTechnicalId,
      createdAtDate: newNetworkCreatedAtDate,
      description: newNetworkDescription,
      author: newNetworkAuthor,
      voltageV: newNetworkVoltageV,
      projectCode: newNetworkProjectCode,
      logoUrl: newNetworkLogoUrl,
      exportNotes: newNetworkExportNotes
    });
    if (draftResult.kind === "error") {
      setNetworkFormError(draftResult.message);
      return;
    }
    const { draft } = draftResult;

    if (selectNetworkTechnicalIdTaken(store.getState(), draft.technicalId)) {
      setNetworkFormError(`Network technical ID '${draft.technicalId}' is already used.`);
      return;
    }

    const nowIso = new Date().toISOString();
    const networkId = createEntityId("net") as NetworkId;
    dispatchAction(
      appActions.createNetwork({
        id: networkId,
        name: draft.name,
        technicalId: draft.technicalId,
        createdAt: draft.createdAtIso,
        author: draft.author,
        voltageV: draft.voltageV,
        projectCode: draft.projectCode,
        logoUrl: draft.logoUrl,
        exportNotes: draft.exportNotes,
        description: draft.description,
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

    const draftResult = buildNetworkFormDraft({
      name: newNetworkName,
      technicalId: newNetworkTechnicalId,
      createdAtDate: newNetworkCreatedAtDate,
      description: newNetworkDescription,
      author: newNetworkAuthor,
      voltageV: newNetworkVoltageV,
      projectCode: newNetworkProjectCode,
      logoUrl: newNetworkLogoUrl,
      exportNotes: newNetworkExportNotes
    });
    if (draftResult.kind === "error") {
      setNetworkFormError(draftResult.message);
      return;
    }
    const { draft } = draftResult;

    if (selectNetworkTechnicalIdTaken(store.getState(), draft.technicalId, targetNetworkId)) {
      setNetworkFormError(`Network technical ID '${draft.technicalId}' is already used.`);
      return;
    }

    dispatchAction(
      appActions.updateNetwork(
        targetNetworkId,
        draft.name,
        draft.technicalId,
        new Date().toISOString(),
        draft.description,
        {
          createdAt: draft.createdAtIso,
          author: draft.author,
          voltageV: draft.voltageV,
          projectCode: draft.projectCode,
          logoUrl: draft.logoUrl,
          exportNotes: draft.exportNotes
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
    resetNetworkViewToConfiguredScaleViewport({
      nodes,
      networkNodePositions,
      connectorMap,
      spliceMap,
      segments,
      configuredResetScale,
      networkViewWidth,
      networkViewHeight,
      showCableCallouts,
      networkCalloutTextSize,
      setCanvasGlobalRenderScalePercent,
      setNetworkScale,
      setNetworkOffset
    });
  }

  function fitNetworkToContent(): void {
    fitNetworkToContentViewport({
      nodes,
      networkNodePositions,
      connectorMap,
      spliceMap,
      segments,
      configuredResetScale,
      networkViewWidth,
      networkViewHeight,
      showCableCallouts,
      networkCalloutTextSize,
      setCanvasGlobalRenderScalePercent,
      setNetworkScale,
      setNetworkOffset
    });
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
