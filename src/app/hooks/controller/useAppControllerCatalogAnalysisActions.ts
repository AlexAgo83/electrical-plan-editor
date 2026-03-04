import { useCallback } from "react";
import type { CatalogItemId, Connector, ConnectorId, Splice, SpliceId } from "../../../core/entities";
import type { AppControllerModelingHandlersOrchestrator } from "./useAppControllerModelingHandlersOrchestrator";

type ScreenId = "home" | "networkScope" | "modeling" | "analysis" | "validation" | "settings";
type SubScreenId = "catalog" | "connector" | "splice" | "node" | "segment" | "wire";

interface UseAppControllerCatalogAnalysisActionsParams {
  connectorMap: Map<ConnectorId, Connector>;
  spliceMap: Map<SpliceId, Splice>;
  connectorHandlers: AppControllerModelingHandlersOrchestrator["connector"];
  spliceHandlers: AppControllerModelingHandlersOrchestrator["splice"];
  setIsModelingAnalysisFocused: (focused: boolean) => void;
  setActiveScreen: (screen: ScreenId) => void;
  setActiveSubScreen: (subScreen: SubScreenId) => void;
  setDetailPanelsSelectionSource: (source: "table" | "external") => void;
}

export function useAppControllerCatalogAnalysisActions({
  connectorMap,
  spliceMap,
  connectorHandlers,
  spliceHandlers,
  setIsModelingAnalysisFocused,
  setActiveScreen,
  setActiveSubScreen,
  setDetailPanelsSelectionSource
}: UseAppControllerCatalogAnalysisActionsParams) {
  const handleCreateConnectorFromCatalog = useCallback(
    (catalogItemId: CatalogItemId) => {
      setIsModelingAnalysisFocused(false);
      setActiveScreen("modeling");
      setActiveSubScreen("connector");
      connectorHandlers.resetConnectorForm();
      connectorHandlers.syncDerivedConnectorCatalogFields?.(catalogItemId);
    },
    [connectorHandlers, setActiveScreen, setActiveSubScreen, setIsModelingAnalysisFocused]
  );

  const handleCreateSpliceFromCatalog = useCallback(
    (catalogItemId: CatalogItemId) => {
      setIsModelingAnalysisFocused(false);
      setActiveScreen("modeling");
      setActiveSubScreen("splice");
      spliceHandlers.resetSpliceForm();
      spliceHandlers.syncDerivedSpliceCatalogFields?.(catalogItemId);
    },
    [setActiveScreen, setActiveSubScreen, setIsModelingAnalysisFocused, spliceHandlers]
  );

  const handleOpenConnectorFromCatalogAnalysis = useCallback(
    (connectorId: ConnectorId) => {
      const connector = connectorMap.get(connectorId);
      if (connector === undefined) {
        return;
      }
      setDetailPanelsSelectionSource("table");
      setIsModelingAnalysisFocused(false);
      setActiveScreen("modeling");
      setActiveSubScreen("connector");
      connectorHandlers.startConnectorEdit(connector);
    },
    [connectorHandlers, connectorMap, setActiveScreen, setActiveSubScreen, setDetailPanelsSelectionSource, setIsModelingAnalysisFocused]
  );

  const handleOpenSpliceFromCatalogAnalysis = useCallback(
    (spliceId: SpliceId) => {
      const splice = spliceMap.get(spliceId);
      if (splice === undefined) {
        return;
      }
      setDetailPanelsSelectionSource("table");
      setIsModelingAnalysisFocused(false);
      setActiveScreen("modeling");
      setActiveSubScreen("splice");
      spliceHandlers.startSpliceEdit(splice);
    },
    [setActiveScreen, setActiveSubScreen, setDetailPanelsSelectionSource, setIsModelingAnalysisFocused, spliceHandlers, spliceMap]
  );

  return {
    handleCreateConnectorFromCatalog,
    handleCreateSpliceFromCatalog,
    handleOpenConnectorFromCatalogAnalysis,
    handleOpenSpliceFromCatalogAnalysis
  };
}

export type AppControllerCatalogAnalysisActionsModel = ReturnType<typeof useAppControllerCatalogAnalysisActions>;
