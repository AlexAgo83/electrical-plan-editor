import { useEffect, useState } from "react";

interface UseInspectorPanelVisibilityParams {
  isModelingScreen: boolean;
  isAnalysisScreen: boolean;
  isValidationScreen: boolean;
  hasActiveNetwork: boolean;
  hasInspectableSelection: boolean;
  showFloatingInspectorPanel: boolean;
  viewportWidth: number;
  isDialogFocusActive: boolean;
  isNavigationDrawerOpen: boolean;
  isOperationsPanelOpen: boolean;
}

export function useInspectorPanelVisibility({
  isModelingScreen,
  isAnalysisScreen,
  isValidationScreen,
  hasActiveNetwork,
  hasInspectableSelection,
  showFloatingInspectorPanel,
  viewportWidth,
  isDialogFocusActive,
  isNavigationDrawerOpen,
  isOperationsPanelOpen
}: UseInspectorPanelVisibilityParams) {
  const [isInspectorExpandedOnNarrowViewport, setIsInspectorExpandedOnNarrowViewport] = useState(false);

  const isInspectorVisibilityScreen = isModelingScreen || isAnalysisScreen || isValidationScreen;
  const isInspectorNarrowViewport = viewportWidth < 960;
  const isModalDialogFocusActive = isDialogFocusActive || isNavigationDrawerOpen || isOperationsPanelOpen;
  const isInspectorHidden = !showFloatingInspectorPanel || !isInspectorVisibilityScreen || !hasActiveNetwork || isModalDialogFocusActive;
  const isInspectorAutoCollapsed = !hasInspectableSelection || isInspectorNarrowViewport;
  const canExpandInspectorFromCollapsed = hasInspectableSelection && isInspectorNarrowViewport;
  const isInspectorOpen =
    !isInspectorHidden &&
    (!isInspectorAutoCollapsed || (canExpandInspectorFromCollapsed && isInspectorExpandedOnNarrowViewport));

  useEffect(() => {
    if (isInspectorHidden || !canExpandInspectorFromCollapsed) {
      setIsInspectorExpandedOnNarrowViewport(false);
    }
  }, [canExpandInspectorFromCollapsed, isInspectorHidden]);

  return {
    isInspectorHidden,
    canExpandInspectorFromCollapsed,
    isInspectorOpen,
    setIsInspectorExpandedOnNarrowViewport
  };
}
