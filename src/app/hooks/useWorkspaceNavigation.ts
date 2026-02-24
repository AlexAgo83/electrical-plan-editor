import { useEffect, useRef, useState, type MutableRefObject } from "react";

type ScreenId = "home" | "networkScope" | "modeling" | "analysis" | "validation" | "settings";
type SubScreenId = "connector" | "splice" | "node" | "segment" | "wire";

interface UseWorkspaceNavigationResult {
  activeScreen: ScreenId;
  setActiveScreen: (screen: ScreenId) => void;
  activeSubScreen: SubScreenId;
  setActiveSubScreen: (subScreen: SubScreenId) => void;
  isNetworkScopeScreen: boolean;
  isHomeScreen: boolean;
  isModelingScreen: boolean;
  isAnalysisScreen: boolean;
  isValidationScreen: boolean;
  isSettingsScreen: boolean;
  activeScreenRef: MutableRefObject<ScreenId>;
}

export function useWorkspaceNavigation(): UseWorkspaceNavigationResult {
  const [activeScreen, setActiveScreen] = useState<ScreenId>("home");
  const [activeSubScreen, setActiveSubScreen] = useState<SubScreenId>("connector");
  const activeScreenRef = useRef<ScreenId>("home");

  const isHomeScreen = activeScreen === "home";
  const isNetworkScopeScreen = activeScreen === "networkScope";
  const isModelingScreen = activeScreen === "modeling";
  const isAnalysisScreen = activeScreen === "analysis";
  const isValidationScreen = activeScreen === "validation";
  const isSettingsScreen = activeScreen === "settings";

  useEffect(() => {
    activeScreenRef.current = activeScreen;
  }, [activeScreen]);

  return {
    activeScreen,
    setActiveScreen,
    activeSubScreen,
    setActiveSubScreen,
    isHomeScreen,
    isNetworkScopeScreen,
    isModelingScreen,
    isAnalysisScreen,
    isValidationScreen,
    isSettingsScreen,
    activeScreenRef
  };
}
