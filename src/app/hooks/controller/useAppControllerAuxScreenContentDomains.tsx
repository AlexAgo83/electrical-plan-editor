import type { AppControllerCanvasDisplayStateModel } from "../useAppControllerCanvasDisplayState";
import type { AppControllerPreferencesStateModel } from "../useAppControllerPreferencesState";
import type { NetworkImportExportModel } from "../useNetworkImportExport";
import type { NetworkScopeFormStateModel } from "../useNetworkScopeFormState";
import type { ValidationModel } from "../useValidationModel";
import {
  buildNetworkScopeScreenContentSlice,
  buildSettingsScreenContentSlice,
  buildValidationScreenContentSlice
} from "./useAppControllerScreenContentSlices";

type NetworkScopeSliceParams = Parameters<typeof buildNetworkScopeScreenContentSlice>[0];
type ValidationSliceParams = Parameters<typeof buildValidationScreenContentSlice>[0];
type SettingsSliceParams = Parameters<typeof buildSettingsScreenContentSlice>[0];

interface UseAppControllerAuxScreenContentDomainsParams {
  components: Pick<
    NetworkScopeSliceParams,
    "NetworkScopeWorkspaceContentComponent"
  > &
    Pick<ValidationSliceParams, "ValidationWorkspaceContentComponent"> &
    Pick<SettingsSliceParams, "SettingsWorkspaceContentComponent">;
  networkScope: Pick<
    NetworkScopeSliceParams,
    | "networks"
    | "networkSort"
    | "setNetworkSort"
    | "networkEntityCountsById"
    | "activeNetworkId"
    | "handleSelectNetwork"
    | "handleDuplicateNetwork"
    | "handleDeleteNetwork"
    | "handleOpenCreateNetworkForm"
    | "handleOpenEditNetworkForm"
    | "handleCloseNetworkForm"
    | "networkTechnicalIdAlreadyUsed"
    | "handleSubmitNetworkForm"
  > & {
    formState: NetworkScopeFormStateModel;
  };
  validation: ValidationModel & {
    moveVisibleValidationIssueCursor: ValidationSliceParams["moveVisibleValidationIssueCursor"];
    handleValidationIssueRowGoTo: ValidationSliceParams["handleValidationIssueRowGoTo"];
  };
  settings: {
    isCurrentWorkspaceEmpty: SettingsSliceParams["isCurrentWorkspaceEmpty"];
    hasBuiltInSampleState: SettingsSliceParams["hasBuiltInSampleState"];
    handleRecreateSampleNetwork: SettingsSliceParams["handleRecreateSampleNetwork"];
    handleResetSampleNetwork: SettingsSliceParams["handleResetSampleNetwork"];
    activeNetworkId: SettingsSliceParams["activeNetworkId"];
    importExport: NetworkImportExportModel;
    networks: SettingsSliceParams["networks"];
    prefs: AppControllerPreferencesStateModel;
    canvasDisplay: AppControllerCanvasDisplayStateModel;
    configuredResetZoomPercent: SettingsSliceParams["configuredResetZoomPercent"];
    applyListSortDefaults: SettingsSliceParams["applyListSortDefaults"];
    applyCanvasDefaultsNow: SettingsSliceParams["applyCanvasDefaultsNow"];
    handleZoomAction: SettingsSliceParams["handleZoomAction"];
    resetWorkspacePreferencesToDefaults: SettingsSliceParams["resetWorkspacePreferencesToDefaults"];
  };
  includeNetworkScopeContent: boolean;
  includeValidationContent: boolean;
  includeSettingsContent: boolean;
}

export function useAppControllerAuxScreenContentDomains({
  components,
  networkScope,
  validation,
  settings,
  includeNetworkScopeContent,
  includeValidationContent,
  includeSettingsContent
}: UseAppControllerAuxScreenContentDomainsParams) {
  const networkScopeSlice = includeNetworkScopeContent
    ? buildNetworkScopeScreenContentSlice({
    NetworkScopeWorkspaceContentComponent: components.NetworkScopeWorkspaceContentComponent,
    networks: networkScope.networks,
    networkSort: networkScope.networkSort,
    setNetworkSort: networkScope.setNetworkSort,
    networkEntityCountsById: networkScope.networkEntityCountsById,
    activeNetworkId: networkScope.activeNetworkId,
    handleSelectNetwork: networkScope.handleSelectNetwork,
    handleDuplicateNetwork: networkScope.handleDuplicateNetwork,
    handleDeleteNetwork: networkScope.handleDeleteNetwork,
    networkFormMode: networkScope.formState.networkFormMode,
    handleOpenCreateNetworkForm: networkScope.handleOpenCreateNetworkForm,
    handleOpenEditNetworkForm: networkScope.handleOpenEditNetworkForm,
    handleCloseNetworkForm: networkScope.handleCloseNetworkForm,
    newNetworkName: networkScope.formState.newNetworkName,
    setNewNetworkName: networkScope.formState.setNewNetworkName,
    newNetworkTechnicalId: networkScope.formState.newNetworkTechnicalId,
    setNewNetworkTechnicalId: networkScope.formState.setNewNetworkTechnicalId,
    newNetworkDescription: networkScope.formState.newNetworkDescription,
    setNewNetworkDescription: networkScope.formState.setNewNetworkDescription,
    networkFormError: networkScope.formState.networkFormError,
    networkTechnicalIdAlreadyUsed: networkScope.networkTechnicalIdAlreadyUsed,
    handleSubmitNetworkForm: networkScope.handleSubmitNetworkForm,
    networkFocusRequest: networkScope.formState.networkFocusRequest
      })
    : null;

  const validationSlice = includeValidationContent
    ? buildValidationScreenContentSlice({
    ValidationWorkspaceContentComponent: components.ValidationWorkspaceContentComponent,
    validationSeverityFilter: validation.validationSeverityFilter,
    setValidationSeverityFilter: validation.setValidationSeverityFilter,
    validationIssuesForSeverityCounts: validation.validationIssuesForSeverityCounts,
    validationSeverityCountByLevel: validation.validationSeverityCountByLevel,
    validationCategoryFilter: validation.validationCategoryFilter,
    setValidationCategoryFilter: validation.setValidationCategoryFilter,
    validationIssuesForCategoryCounts: validation.validationIssuesForCategoryCounts,
    validationCategories: validation.validationCategories,
    validationCategoryCountByName: validation.validationCategoryCountByName,
    moveVisibleValidationIssueCursor: validation.moveVisibleValidationIssueCursor,
    visibleValidationIssues: validation.visibleValidationIssues,
    clearValidationFilters: validation.clearValidationFilters,
    validationIssues: validation.validationIssues,
    groupedValidationIssues: validation.groupedValidationIssues,
    findValidationIssueIndex: validation.findValidationIssueIndex,
    validationIssueCursor: validation.validationIssueCursor,
    handleValidationIssueRowGoTo: validation.handleValidationIssueRowGoTo,
    validationErrorCount: validation.validationErrorCount,
    validationWarningCount: validation.validationWarningCount
      })
    : null;

  const settingsSlice = includeSettingsContent
    ? buildSettingsScreenContentSlice({
    SettingsWorkspaceContentComponent: components.SettingsWorkspaceContentComponent,
    isCurrentWorkspaceEmpty: settings.isCurrentWorkspaceEmpty,
    hasBuiltInSampleState: settings.hasBuiltInSampleState,
    handleRecreateSampleNetwork: settings.handleRecreateSampleNetwork,
    handleResetSampleNetwork: settings.handleResetSampleNetwork,
    activeNetworkId: settings.activeNetworkId,
    selectedExportNetworkIds: settings.importExport.selectedExportNetworkIds,
    handleExportNetworks: settings.importExport.handleExportNetworks,
    networks: settings.networks,
    toggleSelectedExportNetwork: settings.importExport.toggleSelectedExportNetwork,
    handleOpenImportPicker: settings.importExport.handleOpenImportPicker,
    importFileInputRef: settings.importExport.importFileInputRef,
    handleImportFileChange: settings.importExport.handleImportFileChange,
    importExportStatus: settings.importExport.importExportStatus,
    lastImportSummary: settings.importExport.lastImportSummary,
    themeMode: settings.prefs.themeMode,
    setThemeMode: settings.prefs.setThemeMode,
    tableDensity: settings.prefs.tableDensity,
    setTableDensity: settings.prefs.setTableDensity,
    tableFontSize: settings.prefs.tableFontSize,
    setTableFontSize: settings.prefs.setTableFontSize,
    defaultSortField: settings.prefs.defaultSortField,
    setDefaultSortField: settings.prefs.setDefaultSortField,
    defaultSortDirection: settings.prefs.defaultSortDirection,
    setDefaultSortDirection: settings.prefs.setDefaultSortDirection,
    defaultIdSortDirection: settings.prefs.defaultIdSortDirection,
    setDefaultIdSortDirection: settings.prefs.setDefaultIdSortDirection,
    applyListSortDefaults: settings.applyListSortDefaults,
    canvasDefaultShowGrid: settings.prefs.canvasDefaultShowGrid,
    setCanvasDefaultShowGrid: settings.prefs.setCanvasDefaultShowGrid,
    canvasDefaultSnapToGrid: settings.prefs.canvasDefaultSnapToGrid,
    setCanvasDefaultSnapToGrid: settings.prefs.setCanvasDefaultSnapToGrid,
    canvasDefaultShowInfoPanels: settings.prefs.canvasDefaultShowInfoPanels,
    setCanvasDefaultShowInfoPanels: settings.prefs.setCanvasDefaultShowInfoPanels,
    canvasDefaultShowSegmentLengths: settings.prefs.canvasDefaultShowSegmentLengths,
    setCanvasDefaultShowSegmentLengths: settings.prefs.setCanvasDefaultShowSegmentLengths,
    canvasDefaultLabelStrokeMode: settings.prefs.canvasDefaultLabelStrokeMode,
    setCanvasDefaultLabelStrokeMode: settings.prefs.setCanvasDefaultLabelStrokeMode,
    canvasResetZoomPercentInput: settings.canvasDisplay.canvasResetZoomPercentInput,
    setCanvasResetZoomPercentInput: settings.canvasDisplay.setCanvasResetZoomPercentInput,
    configuredResetZoomPercent: settings.configuredResetZoomPercent,
    applyCanvasDefaultsNow: settings.applyCanvasDefaultsNow,
    handleZoomAction: settings.handleZoomAction,
    showShortcutHints: settings.prefs.showShortcutHints,
    setShowShortcutHints: settings.prefs.setShowShortcutHints,
    keyboardShortcutsEnabled: settings.prefs.keyboardShortcutsEnabled,
    setKeyboardShortcutsEnabled: settings.prefs.setKeyboardShortcutsEnabled,
    resetWorkspacePreferencesToDefaults: settings.resetWorkspacePreferencesToDefaults
      })
    : null;

  return {
    networkScopeWorkspaceContent: networkScopeSlice?.networkScopeWorkspaceContent ?? null,
    validationWorkspaceContent: validationSlice?.validationWorkspaceContent ?? null,
    settingsWorkspaceContent: settingsSlice?.settingsWorkspaceContent ?? null
  };
}
