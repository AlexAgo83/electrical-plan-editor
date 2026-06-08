import { useRef } from "react";
import type { AppStore, AppState } from "../../../store";
import type { NetworkSummaryPanelHandle } from "../../components/network-summary/NetworkSummaryPanel.types";
import type { AppAction } from "../../../store/actions";
import type { CatalogItem, NetworkNode, Segment } from "../../../core/entities";
import type { AppControllerCanvasDisplayStateModel } from "../useAppControllerCanvasDisplayState";
import type { CanvasStateModel } from "../useCanvasState";
import type { EntityListModel } from "../useEntityListModel";
import type { NetworkScopeFormStateModel } from "../useNetworkScopeFormState";
import type { AppControllerPreferencesStateModel } from "../useAppControllerPreferencesState";
import type { AppControllerLayoutDerivedStateModel } from "../useAppControllerLayoutDerivedState";
import type { ConfirmDialogRequest } from "../../types/confirm-dialog";
import type { ToastNotificationVariant } from "../useToastNotifications";
import { useNetworkImportExport } from "../useNetworkImportExport";
import { useAppControllerSaveExportActions } from "./useAppControllerSaveExportActions";
import { useCatalogCsvImportExport } from "../useCatalogCsvImportExport";
import { useAppControllerWorkspaceHandlersDomainAssembly } from "./useAppControllerWorkspaceHandlersDomainAssembly";
import { useNetworkScopeFormOrchestration } from "../useNetworkScopeFormOrchestration";
import { useAppControllerRegenerateLayoutAction } from "./useAppControllerRegenerateLayoutAction";

type WorkspaceHandlersAssemblyParams = Parameters<typeof useAppControllerWorkspaceHandlersDomainAssembly>[0];
type NetworkScopeOrchestrationParams = Parameters<typeof useNetworkScopeFormOrchestration>[0];

type ScreenId = "home" | "networkScope" | "harnessAssembly" | "modeling" | "analysis" | "statistics" | "validation" | "settings";
type SubScreenId = "catalog" | "connector" | "splice" | "node" | "segment" | "wire";

interface UseAppControllerWorkspaceNetworkDomainAssemblyParams {
  core: {
    store: AppStore;
    state: AppState;
    nodes: NetworkNode[];
    segments: Segment[];
    networks: NetworkScopeOrchestrationParams["networks"];
    activeNetworkId: NetworkScopeOrchestrationParams["activeNetworkId"];
    catalogItems: CatalogItem[];
    isNetworkScopeScreen: boolean;
    dispatchAction: (action: AppAction, options?: { trackHistory?: boolean }) => void;
    notifyToast: (title: string, options?: { message?: string; variant?: ToastNotificationVariant }) => void;
    replaceStateWithHistory: (nextState: AppState) => void;
  };
  forms: {
    networkScopeFormState: NetworkScopeFormStateModel;
  };
  layout: {
    persistedNodePositions: AppControllerLayoutDerivedStateModel["persistedNodePositions"];
    networkNodePositions: AppControllerLayoutDerivedStateModel["networkNodePositions"];
    snapNodesToGrid: CanvasStateModel["snapNodesToGrid"];
    setManualNodePositions: CanvasStateModel["setManualNodePositions"];
  };
  workspace: {
    isCurrentWorkspaceEmpty: boolean;
    hasBuiltInSampleState: boolean;
    connectorMap: WorkspaceHandlersAssemblyParams["workspace"]["connectorMap"];
    spliceMap: WorkspaceHandlersAssemblyParams["workspace"]["spliceMap"];
    configuredResetScale: WorkspaceHandlersAssemblyParams["workspace"]["configuredResetScale"];
    effectiveNetworkViewWidth: number;
    effectiveNetworkViewHeight: number;
    setNetworkScale: WorkspaceHandlersAssemblyParams["workspace"]["setNetworkScale"];
    setNetworkOffset: WorkspaceHandlersAssemblyParams["workspace"]["setNetworkOffset"];
  };
  ui: {
    canvasDisplayState: AppControllerCanvasDisplayStateModel;
    canvasViewportSetters: WorkspaceHandlersAssemblyParams["canvasViewportSetters"];
    sortSetters: Pick<
      EntityListModel,
      | "setConnectorSort"
      | "setSpliceSort"
      | "setWireSort"
      | "setConnectorSynthesisSort"
      | "setSpliceSynthesisSort"
      | "setNodeIdSortDirection"
      | "setSegmentIdSortDirection"
    >;
    preferencesState: AppControllerPreferencesStateModel;
  };
  navigation: {
    setActiveScreen: (screen: ScreenId) => void;
    setActiveSubScreen: (subScreen: SubScreenId) => void;
  };
  requestConfirmation: (request: ConfirmDialogRequest) => Promise<boolean>;
}

export function useAppControllerWorkspaceNetworkDomainAssembly({
  core,
  forms,
  layout,
  workspace,
  ui,
  navigation,
  requestConfirmation
}: UseAppControllerWorkspaceNetworkDomainAssemblyParams) {
  const handleRegenerateLayout = useAppControllerRegenerateLayoutAction({
    nodes: core.nodes,
    segments: core.segments,
    persistedNodePositions: layout.persistedNodePositions,
    snapNodesToGrid: layout.snapNodesToGrid,
    state: core.state,
    requestConfirmation,
    setManualNodePositions: layout.setManualNodePositions,
    replaceStateWithHistory: core.replaceStateWithHistory
  });

  const networkSummaryPanelRef = useRef<NetworkSummaryPanelHandle | null>(null);

  const networkImportExportModel = useNetworkImportExport({
    store: core.store,
    networks: core.networks,
    activeNetworkId: core.activeNetworkId,
    dispatchAction: core.dispatchAction,
    notifyToast: core.notifyToast,
    groupedBomPreferences: {
      workspaceCurrencyCode: ui.preferencesState.workspaceCurrencyCode,
      workspaceTaxEnabled: ui.preferencesState.workspaceTaxEnabled,
      workspaceTaxRatePercent: ui.preferencesState.workspaceTaxRatePercent,
      bomExportCompactColumns: ui.preferencesState.bomExportCompactColumns,
      bomTraceabilityLabelsHidden: ui.preferencesState.bomTraceabilityLabelsHidden
    },
    networkSummaryPanelRef,
    ensureNetworkPlanScreen: () => navigation.setActiveScreen("modeling")
  });

  const {
    handleSaveActiveNetworkWithConfirmation,
    handleSaveNetworkWithConfirmation,
    handleExportNetworksWithActiveSaveConfirmation
  } = useAppControllerSaveExportActions({
    activeNetworkId: core.activeNetworkId,
    activeNetworkName: core.state.activeNetworkId !== null ? core.state.networks.byId[core.state.activeNetworkId]?.name ?? null : null,
    activeNetworkTechnicalId:
      core.state.activeNetworkId !== null ? core.state.networks.byId[core.state.activeNetworkId]?.technicalId ?? null : null,
    getNetworkExportMetadata: (networkId) => ({
      name: core.state.networks.byId[networkId]?.name ?? null,
      technicalId: core.state.networks.byId[networkId]?.technicalId ?? null
    }),
    handleExportNetworks: networkImportExportModel.handleExportNetworks,
    handleExportNetwork: networkImportExportModel.handleExportNetwork,
    requestConfirmation
  });

  const {
    catalogCsvImportFileInputRef,
    catalogCsvImportExportStatus,
    catalogCsvLastImportSummaryLine,
    catalogCsvImportFailureDialog,
    handleExportCatalogCsv,
    handleOpenCatalogCsvImportPicker,
    handleCatalogCsvImportFileChange
  } = useCatalogCsvImportExport({
    store: core.store,
    catalogItems: core.catalogItems,
    replaceStateWithHistory: core.replaceStateWithHistory,
    requestConfirmation,
    setActiveScreen: navigation.setActiveScreen,
    setActiveSubScreen: navigation.setActiveSubScreen
  });

  const {
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
  } = useAppControllerWorkspaceHandlersDomainAssembly({
    base: {
      store: core.store,
      networks: core.networks,
      dispatchAction: core.dispatchAction,
      replaceStateWithHistory: core.replaceStateWithHistory
    },
    requestConfirmation,
    networkScopeFormState: forms.networkScopeFormState,
    workspace: {
      isCurrentWorkspaceEmpty: workspace.isCurrentWorkspaceEmpty,
      hasBuiltInSampleState: workspace.hasBuiltInSampleState,
      nodes: core.nodes,
      segments: core.segments,
      networkNodePositions: layout.networkNodePositions,
      connectorMap: workspace.connectorMap,
      spliceMap: workspace.spliceMap,
      configuredResetScale: workspace.configuredResetScale,
      networkViewWidth: workspace.effectiveNetworkViewWidth,
      networkViewHeight: workspace.effectiveNetworkViewHeight,
      setNetworkScale: workspace.setNetworkScale,
      setNetworkOffset: workspace.setNetworkOffset
    },
    canvasDisplayState: ui.canvasDisplayState,
    canvasViewportSetters: ui.canvasViewportSetters,
    sortSetters: ui.sortSetters,
    preferencesState: ui.preferencesState
  });

  const {
    handleOpenCreateNetworkForm,
    handleOpenEditNetworkForm,
    handleCloseNetworkForm,
    handleSubmitNetworkForm
  } = useNetworkScopeFormOrchestration({
    store: core.store,
    networks: core.networks,
    activeNetworkId: core.activeNetworkId,
    isNetworkScopeScreen: core.isNetworkScopeScreen,
    networksById: core.state.networks.byId,
    setNewNetworkName: forms.networkScopeFormState.setNewNetworkName,
    setNewNetworkTechnicalId: forms.networkScopeFormState.setNewNetworkTechnicalId,
    setNewNetworkCreatedAtDate: forms.networkScopeFormState.setNewNetworkCreatedAtDate,
    setNewNetworkDescription: forms.networkScopeFormState.setNewNetworkDescription,
    setNewNetworkAuthor: forms.networkScopeFormState.setNewNetworkAuthor,
    setNewNetworkVoltageV: forms.networkScopeFormState.setNewNetworkVoltageV,
    setNewNetworkProjectCode: forms.networkScopeFormState.setNewNetworkProjectCode,
    setNewNetworkLogoUrl: forms.networkScopeFormState.setNewNetworkLogoUrl,
    setNewNetworkExportNotes: forms.networkScopeFormState.setNewNetworkExportNotes,
    setNetworkFormError: forms.networkScopeFormState.setNetworkFormError,
    networkFormMode: forms.networkScopeFormState.networkFormMode,
    setNetworkFormMode: forms.networkScopeFormState.setNetworkFormMode,
    networkFormTargetId: forms.networkScopeFormState.networkFormTargetId,
    setNetworkFormTargetId: forms.networkScopeFormState.setNetworkFormTargetId,
    setNetworkFocusRequest: forms.networkScopeFormState.setNetworkFocusRequest,
    handleCreateNetwork,
    handleUpdateActiveNetwork
  });

  return {
    handleRegenerateLayout,
    networkImportExportModel,
    handleSaveActiveNetworkWithConfirmation,
    handleSaveNetworkWithConfirmation,
    handleExportNetworksWithActiveSaveConfirmation,
    catalogCsvImportFileInputRef,
    catalogCsvImportExportStatus,
    catalogCsvLastImportSummaryLine,
    catalogCsvImportFailureDialog,
    handleExportCatalogCsv,
    handleOpenCatalogCsvImportPicker,
    handleCatalogCsvImportFileChange,
    handleCreateNetwork,
    handleSelectNetwork,
    handleUpdateActiveNetwork,
    handleDuplicateNetwork,
    handleDeleteNetwork,
    handleRecreateSampleNetwork,
    handleResetSampleNetwork,
    resetNetworkViewToConfiguredScale,
    fitNetworkToContent,
    resetWorkspacePreferencesToDefaults,
    handleOpenCreateNetworkForm,
    handleOpenEditNetworkForm,
    handleCloseNetworkForm,
    handleSubmitNetworkForm,
    importFileInputRef: networkImportExportModel.importFileInputRef,
    importExportStatus: networkImportExportModel.importExportStatus,
    lastImportSummary: networkImportExportModel.lastImportSummary,
    handleOpenImportPicker: networkImportExportModel.handleOpenImportPicker,
    handleImportFileChange: networkImportExportModel.handleImportFileChange,
    importOverwriteDialog: networkImportExportModel.importOverwriteDialog,
    importFailureDialog: networkImportExportModel.importFailureDialog,
    networkSummaryPanelRef
  };
}

export type AppControllerWorkspaceNetworkDomainAssemblyModel =
  ReturnType<typeof useAppControllerWorkspaceNetworkDomainAssembly>;
