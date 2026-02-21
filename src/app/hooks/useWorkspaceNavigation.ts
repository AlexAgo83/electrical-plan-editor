import { useEffect, useRef, useState, type MutableRefObject } from "react";
import type { SelectionState } from "../../store/types";

type ScreenId = "networkScope" | "modeling" | "analysis" | "validation" | "settings";
type SubScreenId = "connector" | "splice" | "node" | "segment" | "wire";

interface UseWorkspaceNavigationResult {
  activeScreen: ScreenId;
  setActiveScreen: (screen: ScreenId) => void;
  activeSubScreen: SubScreenId;
  setActiveSubScreen: (subScreen: SubScreenId) => void;
  isNetworkScopeScreen: boolean;
  isModelingScreen: boolean;
  isAnalysisScreen: boolean;
  isValidationScreen: boolean;
  isSettingsScreen: boolean;
  activeScreenRef: MutableRefObject<ScreenId>;
}

export function useWorkspaceNavigation(selected: SelectionState | null): UseWorkspaceNavigationResult {
  const [activeScreen, setActiveScreen] = useState<ScreenId>("modeling");
  const [activeSubScreen, setActiveSubScreen] = useState<SubScreenId>("connector");
  const activeScreenRef = useRef<ScreenId>("modeling");
  const lastInspectorSelectionRef = useRef<string | null>(null);

  const isNetworkScopeScreen = activeScreen === "networkScope";
  const isModelingScreen = activeScreen === "modeling";
  const isAnalysisScreen = activeScreen === "analysis";
  const isValidationScreen = activeScreen === "validation";
  const isSettingsScreen = activeScreen === "settings";

  useEffect(() => {
    activeScreenRef.current = activeScreen;
  }, [activeScreen]);

  useEffect(() => {
    const selectionKey = selected === null ? null : `${selected.kind}:${selected.id}`;
    const hasSelectionChanged = selectionKey !== lastInspectorSelectionRef.current;
    lastInspectorSelectionRef.current = selectionKey;

    if (!isModelingScreen || selected === null || !hasSelectionChanged) {
      return;
    }

    const selectedKind = selected.kind as SubScreenId;
    if (activeSubScreen !== selectedKind) {
      setActiveSubScreen(selectedKind);
    }
  }, [activeSubScreen, isModelingScreen, selected]);

  return {
    activeScreen,
    setActiveScreen,
    activeSubScreen,
    setActiveSubScreen,
    isNetworkScopeScreen,
    isModelingScreen,
    isAnalysisScreen,
    isValidationScreen,
    isSettingsScreen,
    activeScreenRef
  };
}
