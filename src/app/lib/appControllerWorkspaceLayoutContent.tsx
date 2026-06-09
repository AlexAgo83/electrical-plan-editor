import type { ReactNode } from "react";

interface BuildWorkspaceLayoutContentParams {
  state: {
    isAiAgentModelingOpen: boolean;
    hasTableSelectionForActiveSubScreen: boolean;
    hasActiveEntityForm: boolean;
    isCatalogSubScreen: boolean;
    isModelingScreen: boolean;
    hasInspectableSelectionForActiveSubScreen: boolean;
  };
  isModelingBatchModeActive: boolean;
  aiAgentWorkspaceContent: ReactNode;
  modelingLeftColumnContentForSubScreen: ReactNode;
  modelingFormsColumnContentForSubScreen: ReactNode;
  analysisWorkspaceContentForSubScreen: ReactNode;
  showMultiNetworkFunctionalAnalysisPanel: boolean;
}

export function buildWorkspaceLayoutContent({
  state,
  isModelingBatchModeActive,
  aiAgentWorkspaceContent,
  modelingLeftColumnContentForSubScreen,
  modelingFormsColumnContentForSubScreen,
  analysisWorkspaceContentForSubScreen,
  showMultiNetworkFunctionalAnalysisPanel
}: BuildWorkspaceLayoutContentParams) {
  const modelingLeftColumnContentForActiveMode = state.isAiAgentModelingOpen
    ? aiAgentWorkspaceContent
    : modelingLeftColumnContentForSubScreen;

  const modelingFormsColumnContentForLayout =
    !state.isAiAgentModelingOpen &&
    (isModelingBatchModeActive ||
      state.hasTableSelectionForActiveSubScreen ||
      state.hasActiveEntityForm ||
      state.isCatalogSubScreen)
      ? modelingFormsColumnContentForSubScreen
      : null;

  const analysisWorkspaceContentForLayout = state.isAiAgentModelingOpen
    ? null
    : state.isCatalogSubScreen
    ? analysisWorkspaceContentForSubScreen
    : showMultiNetworkFunctionalAnalysisPanel ||
        state.hasTableSelectionForActiveSubScreen ||
        (state.isModelingScreen && state.hasInspectableSelectionForActiveSubScreen)
      ? analysisWorkspaceContentForSubScreen
      : null;

  return {
    modelingLeftColumnContentForActiveMode,
    modelingFormsColumnContentForLayout,
    analysisWorkspaceContentForLayout
  };
}
