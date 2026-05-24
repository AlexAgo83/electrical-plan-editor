import { useCallback } from "react";
import type { AppStore } from "../../../store";
import { appActions } from "../../../store";
import type { CatalogItem, CatalogItemId, Connector, ConnectorId } from "../../../core/entities";
import type { ScreenId, SubScreenId } from "../../types/app-controller";

type DispatchAction = (
  action: Parameters<AppStore["dispatch"]>[0],
  options?: {
    trackHistory?: boolean;
  }
) => void;

interface UseAppControllerBomPreviewNavigationParams {
  store: AppStore;
  dispatchAction: DispatchAction;
  closeActiveBomPreview: () => void;
  setDetailPanelsSelectionSource: (value: "table" | "external") => void;
  setActiveScreen: (screen: ScreenId) => void;
  setActiveSubScreen: (subScreen: SubScreenId) => void;
  startCatalogEdit: (catalogItem: CatalogItem) => void;
  startConnectorEdit: (connector: Connector) => void;
}

export function useAppControllerBomPreviewNavigation({
  store,
  dispatchAction,
  closeActiveBomPreview,
  setDetailPanelsSelectionSource,
  setActiveScreen,
  setActiveSubScreen,
  startCatalogEdit,
  startConnectorEdit
}: UseAppControllerBomPreviewNavigationParams) {
  const openBomPreviewCatalogItem = useCallback(
    (catalogItemId: CatalogItemId) => {
      closeActiveBomPreview();
      setDetailPanelsSelectionSource("table");
      setActiveScreen("modeling");
      setActiveSubScreen("catalog");
      const catalogItem = store.getState().catalogItems.byId[catalogItemId];
      if (catalogItem !== undefined) {
        startCatalogEdit(catalogItem);
        return;
      }

      dispatchAction(
        appActions.select({
          kind: "catalog",
          id: catalogItemId
        })
      );
    },
    [closeActiveBomPreview, dispatchAction, setActiveScreen, setActiveSubScreen, setDetailPanelsSelectionSource, startCatalogEdit, store]
  );

  const openBomPreviewConnector = useCallback(
    (connectorId: ConnectorId) => {
      closeActiveBomPreview();
      setDetailPanelsSelectionSource("table");
      setActiveScreen("modeling");
      setActiveSubScreen("connector");
      const connector = store.getState().connectors.byId[connectorId];
      if (connector !== undefined) {
        startConnectorEdit(connector);
        return;
      }

      dispatchAction(
        appActions.select({
          kind: "connector",
          id: connectorId
        })
      );
    },
    [closeActiveBomPreview, dispatchAction, setActiveScreen, setActiveSubScreen, setDetailPanelsSelectionSource, startConnectorEdit, store]
  );

  return {
    openBomPreviewCatalogItem,
    openBomPreviewConnector
  };
}
