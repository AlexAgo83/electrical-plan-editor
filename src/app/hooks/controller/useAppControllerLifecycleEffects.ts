import { useEffect, type MutableRefObject } from "react";
import { appActions, type AppStore, type ThemeMode } from "../../../store";
import type { SubScreenId } from "../../types/app-controller";

type WorkspaceScreenId = "home" | "networkScope" | "modeling" | "analysis" | "validation" | "settings";
type AnalysisSubScreenId = "connector" | "splice" | "node" | "segment" | "wire";

type DetailPanelsSelectionSource = "table" | "external";

interface UseAppControllerThemeSyncEffectParams {
  store: AppStore;
  themeMode: ThemeMode;
}

export function useAppControllerThemeSyncEffect({ store, themeMode }: UseAppControllerThemeSyncEffectParams) {
  useEffect(() => {
    store.dispatch(appActions.setThemeMode(themeMode));
  }, [store, themeMode]);
}

interface UseAppControllerActionRefsSyncEffectParams {
  undoActionRef: MutableRefObject<() => void>;
  redoActionRef: MutableRefObject<() => void>;
  exportActiveNetworkRef: MutableRefObject<() => void>;
  fitNetworkToContentRef: MutableRefObject<() => void>;
  previousValidationIssueRef: MutableRefObject<() => void>;
  nextValidationIssueRef: MutableRefObject<() => void>;
  handleUndo: () => void;
  handleRedo: () => void;
  handleSaveActiveNetworkWithConfirmation: () => void;
  fitNetworkToContent: () => void;
  activeScreenRef: MutableRefObject<WorkspaceScreenId>;
  moveVisibleValidationIssueCursor: (direction: 1 | -1) => void;
  moveValidationIssueCursor: (direction: 1 | -1) => void;
}

export function useAppControllerActionRefsSyncEffect({
  undoActionRef,
  redoActionRef,
  exportActiveNetworkRef,
  fitNetworkToContentRef,
  previousValidationIssueRef,
  nextValidationIssueRef,
  handleUndo,
  handleRedo,
  handleSaveActiveNetworkWithConfirmation,
  fitNetworkToContent,
  activeScreenRef,
  moveVisibleValidationIssueCursor,
  moveValidationIssueCursor
}: UseAppControllerActionRefsSyncEffectParams) {
  useEffect(() => {
    undoActionRef.current = handleUndo;
    redoActionRef.current = handleRedo;
    exportActiveNetworkRef.current = handleSaveActiveNetworkWithConfirmation;
    fitNetworkToContentRef.current = fitNetworkToContent;
    previousValidationIssueRef.current = () => {
      if (activeScreenRef.current === "validation") {
        moveVisibleValidationIssueCursor(-1);
        return;
      }
      moveValidationIssueCursor(-1);
    };
    nextValidationIssueRef.current = () => {
      if (activeScreenRef.current === "validation") {
        moveVisibleValidationIssueCursor(1);
        return;
      }
      moveValidationIssueCursor(1);
    };
  }, [
    activeScreenRef,
    exportActiveNetworkRef,
    fitNetworkToContent,
    fitNetworkToContentRef,
    handleRedo,
    handleSaveActiveNetworkWithConfirmation,
    handleUndo,
    moveValidationIssueCursor,
    moveVisibleValidationIssueCursor,
    nextValidationIssueRef,
    previousValidationIssueRef,
    redoActionRef,
    undoActionRef
  ]);
}

interface UseAppControllerAnalysisSubScreenTrackingEffectParams {
  activeScreen: WorkspaceScreenId;
  activeSubScreen: SubScreenId;
  isModelingAnalysisFocused: boolean;
  setLastAnalysisSubScreen: (value: AnalysisSubScreenId) => void;
}

export function useAppControllerAnalysisSubScreenTrackingEffect({
  activeScreen,
  activeSubScreen,
  isModelingAnalysisFocused,
  setLastAnalysisSubScreen
}: UseAppControllerAnalysisSubScreenTrackingEffectParams) {
  useEffect(() => {
    if (activeScreen === "analysis" || (activeScreen === "modeling" && isModelingAnalysisFocused)) {
      if (activeSubScreen !== "catalog") {
        setLastAnalysisSubScreen(activeSubScreen);
      }
    }
  }, [activeScreen, activeSubScreen, isModelingAnalysisFocused, setLastAnalysisSubScreen]);
}

interface UseAppControllerInspectorSelectionSourceEffectParams {
  hasInspectableSelection: boolean;
  setDetailPanelsSelectionSource: (value: DetailPanelsSelectionSource) => void;
}

export function useAppControllerInspectorSelectionSourceEffect({
  hasInspectableSelection,
  setDetailPanelsSelectionSource
}: UseAppControllerInspectorSelectionSourceEffectParams) {
  useEffect(() => {
    if (!hasInspectableSelection) {
      setDetailPanelsSelectionSource("external");
    }
  }, [hasInspectableSelection, setDetailPanelsSelectionSource]);
}

interface UseAppControllerCatalogFormGuardEffectParams {
  activeSubScreen: SubScreenId;
  catalogFormMode: "create" | "edit" | "idle";
  clearCatalogForm: () => void;
}

export function useAppControllerCatalogFormGuardEffect({
  activeSubScreen,
  catalogFormMode,
  clearCatalogForm
}: UseAppControllerCatalogFormGuardEffectParams) {
  useEffect(() => {
    if (activeSubScreen !== "catalog" && catalogFormMode !== "idle") {
      clearCatalogForm();
    }
  }, [activeSubScreen, catalogFormMode, clearCatalogForm]);
}
