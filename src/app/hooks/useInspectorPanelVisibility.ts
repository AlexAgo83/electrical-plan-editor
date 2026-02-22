import { useEffect, useState } from "react";

interface UseInspectorPanelVisibilityParams {
  isModelingScreen: boolean;
  isAnalysisScreen: boolean;
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
  hasActiveNetwork,
  hasInspectableSelection,
  showFloatingInspectorPanel,
  viewportWidth,
  isDialogFocusActive,
  isNavigationDrawerOpen,
  isOperationsPanelOpen
}: UseInspectorPanelVisibilityParams) {
  const [isInspectorExpandedOnNarrowViewport, setIsInspectorExpandedOnNarrowViewport] = useState(false);
  const [isInspectorCollapsedOnWideViewport, setIsInspectorCollapsedOnWideViewport] = useState(false);

  const isInspectorVisibilityScreen = isModelingScreen || isAnalysisScreen;
  const isInspectorNarrowViewport = viewportWidth < 960;
  const isModalDialogFocusActive = isDialogFocusActive || isNavigationDrawerOpen || isOperationsPanelOpen;
  const isInspectorHidden = !showFloatingInspectorPanel || !isInspectorVisibilityScreen || !hasActiveNetwork || isModalDialogFocusActive;
  const isInspectorOpen =
    !isInspectorHidden &&
    hasInspectableSelection &&
    (isInspectorNarrowViewport ? isInspectorExpandedOnNarrowViewport : !isInspectorCollapsedOnWideViewport);
  const canExpandInspectorFromCollapsed =
    !isInspectorHidden &&
    hasInspectableSelection &&
    (isInspectorNarrowViewport ? !isInspectorExpandedOnNarrowViewport : isInspectorCollapsedOnWideViewport);
  const canCollapseInspectorToCollapsed =
    !isInspectorHidden &&
    hasInspectableSelection &&
    (isInspectorNarrowViewport ? isInspectorExpandedOnNarrowViewport : !isInspectorCollapsedOnWideViewport);

  useEffect(() => {
    if (isInspectorHidden || !hasInspectableSelection || !isInspectorNarrowViewport) {
      setIsInspectorExpandedOnNarrowViewport(false);
    }
  }, [hasInspectableSelection, isInspectorHidden, isInspectorNarrowViewport]);

  function expandInspectorFromCollapsed(): void {
    if (isInspectorNarrowViewport) {
      setIsInspectorExpandedOnNarrowViewport(true);
      return;
    }
    setIsInspectorCollapsedOnWideViewport(false);
  }

  function collapseInspectorToCollapsed(): void {
    if (isInspectorNarrowViewport) {
      setIsInspectorExpandedOnNarrowViewport(false);
      return;
    }
    setIsInspectorCollapsedOnWideViewport(true);
  }

  return {
    isInspectorHidden,
    canExpandInspectorFromCollapsed,
    canCollapseInspectorToCollapsed,
    isInspectorOpen,
    expandInspectorFromCollapsed,
    collapseInspectorToCollapsed
  };
}
