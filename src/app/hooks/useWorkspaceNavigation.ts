import { useEffect, useRef, useState, type MutableRefObject } from "react";
import type { ScreenId, SubScreenId } from "../types/app-controller";

interface UseWorkspaceNavigationResult {
  activeScreen: ScreenId;
  setActiveScreen: (screen: ScreenId) => void;
  activeSubScreen: SubScreenId;
  setActiveSubScreen: (subScreen: SubScreenId) => void;
  isNetworkScopeScreen: boolean;
  isHarnessAssemblyScreen: boolean;
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
  const isHarnessAssemblyScreen = activeScreen === "harnessAssembly";
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
    isHarnessAssemblyScreen,
    isModelingScreen,
    isAnalysisScreen,
    isValidationScreen,
    isSettingsScreen,
    activeScreenRef
  };
}
