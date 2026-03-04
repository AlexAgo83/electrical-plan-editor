import { useCallback } from "react";
import type { SelectionState } from "../../../store";
import type { SubScreenId } from "../../types/app-controller";
import type { AppControllerSelectionEntitiesModel } from "../useAppControllerSelectionEntities";

type ScreenId = "home" | "networkScope" | "modeling" | "analysis" | "validation" | "settings";
type DetailPanelsSelectionSource = "table" | "external";
type AnalysisSubScreen = Exclude<SubScreenId, "catalog">;

interface UseAppControllerWorkspaceScreenControllerParams {
  lastAnalysisSubScreen: AnalysisSubScreen;
  selected: AppControllerSelectionEntitiesModel["selected"];
  selectedSubScreen: AppControllerSelectionEntitiesModel["selectedSubScreen"];
  selectedConnector: AppControllerSelectionEntitiesModel["selectedConnector"];
  selectedSplice: AppControllerSelectionEntitiesModel["selectedSplice"];
  selectedNode: AppControllerSelectionEntitiesModel["selectedNode"];
  selectedSegment: AppControllerSelectionEntitiesModel["selectedSegment"];
  selectedWire: AppControllerSelectionEntitiesModel["selectedWire"];
  handleStartSelectedEdit: () => void;
  setIsModelingAnalysisFocused: (next: boolean) => void;
  setActiveScreen: (screen: ScreenId) => void;
  setActiveSubScreen: (subScreen: SubScreenId) => void;
  setDetailPanelsSelectionSource: (source: DetailPanelsSelectionSource) => void;
  onSelectEntityWithoutHistory: (selection: SelectionState) => void;
}

export function useAppControllerWorkspaceScreenController({
  lastAnalysisSubScreen,
  selected,
  selectedSubScreen,
  selectedConnector,
  selectedSplice,
  selectedNode,
  selectedSegment,
  selectedWire,
  handleStartSelectedEdit,
  setIsModelingAnalysisFocused,
  setActiveScreen,
  setActiveSubScreen,
  setDetailPanelsSelectionSource,
  onSelectEntityWithoutHistory
}: UseAppControllerWorkspaceScreenControllerParams) {
  const handleWorkspaceScreenChange = useCallback(
    (targetScreen: ScreenId) => {
      if (targetScreen === "analysis") {
        const analysisSubScreen = lastAnalysisSubScreen;

        if (selectedConnector !== null) {
          onSelectEntityWithoutHistory({ kind: "connector", id: selectedConnector.id });
        } else if (selectedSplice !== null) {
          onSelectEntityWithoutHistory({ kind: "splice", id: selectedSplice.id });
        } else if (selectedNode !== null) {
          onSelectEntityWithoutHistory({ kind: "node", id: selectedNode.id });
        } else if (selectedSegment !== null) {
          onSelectEntityWithoutHistory({ kind: "segment", id: selectedSegment.id });
        } else if (selectedWire !== null) {
          onSelectEntityWithoutHistory({ kind: "wire", id: selectedWire.id });
        }

        setIsModelingAnalysisFocused(true);
        setActiveScreen("modeling");
        setActiveSubScreen(analysisSubScreen);
        return;
      }

      if (targetScreen === "modeling") {
        setIsModelingAnalysisFocused(false);
        if (selected !== null && selectedSubScreen !== null) {
          handleStartSelectedEdit();
          return;
        }
        setActiveScreen("modeling");
        return;
      }

      if (targetScreen !== "settings") {
        setIsModelingAnalysisFocused(false);
      }
      setActiveScreen(targetScreen);
    },
    [
      handleStartSelectedEdit,
      lastAnalysisSubScreen,
      onSelectEntityWithoutHistory,
      selected,
      selectedConnector,
      selectedNode,
      selectedSegment,
      selectedSplice,
      selectedSubScreen,
      selectedWire,
      setActiveScreen,
      setActiveSubScreen,
      setIsModelingAnalysisFocused
    ]
  );

  const handleWorkspaceDrawerScreenChange = useCallback(
    (targetScreen: ScreenId) => {
      if (targetScreen === "modeling") {
        setIsModelingAnalysisFocused(false);
        setActiveScreen("modeling");
        return;
      }

      handleWorkspaceScreenChange(targetScreen);
    },
    [handleWorkspaceScreenChange, setActiveScreen, setIsModelingAnalysisFocused]
  );

  const markDetailPanelsSelectionSourceAsTable = useCallback(() => {
    setDetailPanelsSelectionSource("table");
  }, [setDetailPanelsSelectionSource]);

  const markDetailPanelsSelectionSourceAsExternal = useCallback(() => {
    setDetailPanelsSelectionSource("external");
  }, [setDetailPanelsSelectionSource]);

  return {
    handleWorkspaceScreenChange,
    handleWorkspaceDrawerScreenChange,
    markDetailPanelsSelectionSourceAsTable,
    markDetailPanelsSelectionSourceAsExternal
  };
}
