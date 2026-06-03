import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { NetworkScopeFormStateModel } from "../useNetworkScopeFormState";
import type { ValidationModel } from "../useValidationModel";
import type { AppControllerPreferencesStateModel } from "../useAppControllerPreferencesState";
import type { AppControllerCanvasDisplayStateModel } from "../useAppControllerCanvasDisplayState";
import type { AiSettingsModel } from "../useAiSettings";
import type { UseWorkspaceFileStorageModel } from "../useWorkspaceFileStorage";
import { useAppControllerAuxScreenContentDomains } from "./useAppControllerAuxScreenContentDomains";

type AuxDomainsParams = Parameters<typeof useAppControllerAuxScreenContentDomains>[0];
type AuxDomainsResult = ReturnType<typeof useAppControllerAuxScreenContentDomains>;

type ScreenChangeTarget = "home" | "networkScope" | "harnessAssembly" | "modeling" | "analysis" | "statistics" | "validation" | "settings";
type NetworkScopeSortSetter = Dispatch<SetStateAction<AuxDomainsParams["networkScope"]["networkSort"]>>;

interface UseAppControllerAuxDomainAssemblyParams {
  components: AuxDomainsParams["components"];
  networkScope: {
    networks: AuxDomainsParams["networkScope"]["networks"];
    networkSort: AuxDomainsParams["networkScope"]["networkSort"];
    setNetworkSort: NetworkScopeSortSetter;
    networkEntityCountsById: AuxDomainsParams["networkScope"]["networkEntityCountsById"];
    activeNetworkId: AuxDomainsParams["networkScope"]["activeNetworkId"];
    handleSelectNetwork: AuxDomainsParams["networkScope"]["handleSelectNetwork"];
    handleWorkspaceScreenChange: (targetScreen: ScreenChangeTarget) => void;
    handleDuplicateNetwork: AuxDomainsParams["networkScope"]["handleDuplicateNetwork"];
    handleSaveNetworkWithConfirmation: AuxDomainsParams["networkScope"]["handleExportNetwork"];
    handleOpenImportPicker: AuxDomainsParams["networkScope"]["handleOpenImportPicker"];
    importFileInputRef: AuxDomainsParams["networkScope"]["importFileInputRef"];
    handleImportFileChange: AuxDomainsParams["networkScope"]["handleImportFileChange"];
    importOverwriteDialog: AuxDomainsParams["networkScope"]["importOverwriteDialog"];
    importFailureDialog: AuxDomainsParams["networkScope"]["importFailureDialog"];
    handleDeleteNetwork: AuxDomainsParams["networkScope"]["handleDeleteNetwork"];
    handleOpenCreateNetworkForm: () => void;
    handleOpenEditNetworkForm: AuxDomainsParams["networkScope"]["handleOpenEditNetworkForm"];
    handleCloseNetworkForm: () => void;
    networkTechnicalIdAlreadyUsed: boolean;
    handleSubmitNetworkForm: (event: FormEvent<HTMLFormElement>) => void;
    openNetworkScopeOnboardingHelp: () => void;
    networkScopeFormState: NetworkScopeFormStateModel;
    functionalSchematicPanel: AuxDomainsParams["networkScope"]["functionalSchematicPanel"];
  };
  validation: {
    validationModel: ValidationModel;
    handleValidationIssueRowGoTo: AuxDomainsParams["validation"]["handleValidationIssueRowGoTo"];
  };
  settings: {
    isCurrentWorkspaceEmpty: boolean;
    hasBuiltInSampleState: boolean;
    handleRecreateSampleNetwork: () => void;
    handleResetSampleNetwork: () => void;
    activeNetworkId: AuxDomainsParams["settings"]["activeNetworkId"];
    networkImportExportModel: AuxDomainsParams["settings"]["importExport"];
    handleExportNetworksWithActiveSaveConfirmation: AuxDomainsParams["settings"]["importExport"]["handleExportNetworks"];
    networks: AuxDomainsParams["settings"]["networks"];
    preferencesState: AppControllerPreferencesStateModel;
    canvasDisplayState: AppControllerCanvasDisplayStateModel;
    configuredResetZoomPercent: number;
    handleZoomAction: (target: "in" | "out" | "reset") => void;
    resetWorkspacePreferencesToDefaults: () => void;
    aiSettings: AiSettingsModel;
    workspaceFileStorage: UseWorkspaceFileStorageModel;
  };
  includeNetworkScopeContent: boolean;
  includeValidationContent: boolean;
  includeSettingsContent: boolean;
}

export function useAppControllerAuxDomainAssembly({
  components,
  networkScope,
  validation,
  settings,
  includeNetworkScopeContent,
  includeValidationContent,
  includeSettingsContent
}: UseAppControllerAuxDomainAssemblyParams): AuxDomainsResult {
  return useAppControllerAuxScreenContentDomains({
    components,
    networkScope: {
      networks: networkScope.networks,
      networkSort: networkScope.networkSort,
      setNetworkSort: networkScope.setNetworkSort,
      networkEntityCountsById: networkScope.networkEntityCountsById,
      activeNetworkId: networkScope.activeNetworkId,
      handleSelectNetwork: networkScope.handleSelectNetwork,
      handleOpenNetworkInModeling: (networkId) => {
        networkScope.handleSelectNetwork(networkId);
        networkScope.handleWorkspaceScreenChange("modeling");
      },
      handleDuplicateNetwork: networkScope.handleDuplicateNetwork,
      handleExportNetwork: networkScope.handleSaveNetworkWithConfirmation,
      handleOpenImportPicker: networkScope.handleOpenImportPicker,
      importFileInputRef: networkScope.importFileInputRef,
      handleImportFileChange: networkScope.handleImportFileChange,
      importOverwriteDialog: networkScope.importOverwriteDialog,
      importFailureDialog: networkScope.importFailureDialog,
      handleDeleteNetwork: networkScope.handleDeleteNetwork,
      handleOpenCreateNetworkForm: networkScope.handleOpenCreateNetworkForm,
      handleOpenEditNetworkForm: networkScope.handleOpenEditNetworkForm,
      handleCloseNetworkForm: networkScope.handleCloseNetworkForm,
      networkTechnicalIdAlreadyUsed: networkScope.networkTechnicalIdAlreadyUsed,
      handleSubmitNetworkForm: networkScope.handleSubmitNetworkForm,
      onOpenOnboardingHelp: networkScope.openNetworkScopeOnboardingHelp,
      functionalSchematicPanel: networkScope.functionalSchematicPanel,
      formState: networkScope.networkScopeFormState
    },
    validation: {
      ...validation.validationModel,
      handleValidationIssueRowGoTo: validation.handleValidationIssueRowGoTo
    },
    settings: {
      isCurrentWorkspaceEmpty: settings.isCurrentWorkspaceEmpty,
      hasBuiltInSampleState: settings.hasBuiltInSampleState,
      handleRecreateSampleNetwork: settings.handleRecreateSampleNetwork,
      handleResetSampleNetwork: settings.handleResetSampleNetwork,
      activeNetworkId: settings.activeNetworkId,
      importExport: {
        ...settings.networkImportExportModel,
        handleExportNetworks: settings.handleExportNetworksWithActiveSaveConfirmation
      },
      networks: settings.networks,
      prefs: settings.preferencesState,
      canvasDisplay: settings.canvasDisplayState,
      configuredResetZoomPercent: settings.configuredResetZoomPercent,
      handleZoomAction: settings.handleZoomAction,
      resetWorkspacePreferencesToDefaults: settings.resetWorkspacePreferencesToDefaults,
      aiSettings: settings.aiSettings,
      workspaceFileStorage: settings.workspaceFileStorage
    },
    includeNetworkScopeContent,
    includeValidationContent,
    includeSettingsContent
  });
}
