import { translateCurrent as t } from "../../lib/i18n";
import { useCallback, useMemo, type ChangeEvent, type ComponentType, type RefObject } from "react";
import { appActions, createEmptyWorkspaceState, type AppState, type AppStore } from "../../../store";
import type { InteractionMode, UndoHistoryEntry } from "../../types/app-controller";
import type { CatalogItemId, ConnectorId, HarnessAssemblyId, NetworkId, NodeId, SegmentId, SpliceId, WireId } from "../../../core/entities";
import type { ConfirmDialogRequest } from "../../types/confirm-dialog";

type ScreenId = "home" | "networkScope" | "harnessAssembly" | "modeling" | "analysis" | "statistics" | "validation" | "settings";
type SubScreenId = "catalog" | "connector" | "splice" | "node" | "segment" | "wire";

type HomeWorkspaceContentProps = Parameters<
  typeof import("../../components/workspace/HomeWorkspaceContent").HomeWorkspaceContent
>[0];

interface UseAppControllerHomeWorkspaceContentParams {
  HomeWorkspaceContentComponent: ComponentType<HomeWorkspaceContentProps>;
  hasActiveNetwork: boolean;
  activeNetworkName: string | null;
  activeNetworkTechnicalId: string | null;
  activeNetworkId: NetworkId | null;
  undoHistoryEntries: UndoHistoryEntry[];
  store: AppStore;
  networkCount: number;
  onOpenImportPicker: () => void;
  onSaveWorkspace: () => void;
  importFileInputRef: RefObject<HTMLInputElement | null>;
  onImportFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onOpenOnboardingHelp: () => void;
  isCurrentWorkspaceEmpty: boolean;
  requestConfirmation: (input: ConfirmDialogRequest) => Promise<boolean>;
  replaceStateWithHistory: (state: AppState) => void;
  themeMode: Parameters<typeof createEmptyWorkspaceState>[0];
  setActiveScreen: (screen: ScreenId) => void;
  setActiveSubScreen: (subScreen: SubScreenId) => void;
  setInteractionMode: (mode: InteractionMode) => void;
  handleWorkspaceScreenChange: (screen: ScreenId) => void;
}

export function useAppControllerHomeWorkspaceContent({
  HomeWorkspaceContentComponent,
  hasActiveNetwork,
  activeNetworkName,
  activeNetworkTechnicalId,
  activeNetworkId,
  undoHistoryEntries,
  store,
  networkCount,
  onOpenImportPicker,
  onSaveWorkspace,
  importFileInputRef,
  onImportFileChange,
  onOpenOnboardingHelp,
  isCurrentWorkspaceEmpty,
  requestConfirmation,
  replaceStateWithHistory,
  themeMode,
  setActiveScreen,
  setActiveSubScreen,
  setInteractionMode,
  handleWorkspaceScreenChange
}: UseAppControllerHomeWorkspaceContentParams) {
  const handleCreateEmptyWorkspace = useCallback(() => {
    void (async () => {
      if (!isCurrentWorkspaceEmpty) {
        const shouldReplace = await requestConfirmation({
          title: t("ui.createEmptyWorkspace"),
          message: t("ui.replaceTheCurrentWorkspaceWithAnEmptyWorkspaceThisRemoves"),
          intent: "warning"
        });
        if (!shouldReplace) {
          return;
        }
      }

      replaceStateWithHistory(createEmptyWorkspaceState(themeMode));
      setActiveScreen("networkScope");
      setActiveSubScreen("connector");
      setInteractionMode("select");
    })();
  }, [
    isCurrentWorkspaceEmpty,
    replaceStateWithHistory,
    requestConfirmation,
    setActiveScreen,
    setActiveSubScreen,
    setInteractionMode,
    themeMode
  ]);

  const recentChangesForActiveNetwork = useMemo(
    () =>
      undoHistoryEntries
        .filter((entry) => entry.networkId === activeNetworkId)
        .slice(-10)
        .reverse(),
    [activeNetworkId, undoHistoryEntries]
  );

  const handleOpenRecentChangeTarget = useCallback(
    (entry: UndoHistoryEntry): void => {
      const state = store.getState();
      if (entry.navigationScreen === "networkScope") {
        if (entry.navigationSelectionId !== undefined && state.networks.byId[entry.navigationSelectionId as NetworkId] === undefined) {
          return;
        }
        handleWorkspaceScreenChange("networkScope");
        return;
      }

      if (entry.navigationScreen === "harnessAssembly") {
        if (
          entry.navigationSelectionId !== undefined &&
          state.harnessAssemblies.byId[entry.navigationSelectionId as HarnessAssemblyId] === undefined
        ) {
          return;
        }
        handleWorkspaceScreenChange("harnessAssembly");
        return;
      }

      if (
        entry.navigationScreen !== "modeling" ||
        entry.navigationSubScreen === undefined ||
        entry.navigationSelectionKind === undefined ||
        entry.navigationSelectionId === undefined
      ) {
        return;
      }

      const exists =
        entry.navigationSelectionKind === "catalog"
          ? state.catalogItems.byId[entry.navigationSelectionId as CatalogItemId] !== undefined
          : entry.navigationSelectionKind === "connector"
            ? state.connectors.byId[entry.navigationSelectionId as ConnectorId] !== undefined
            : entry.navigationSelectionKind === "splice"
              ? state.splices.byId[entry.navigationSelectionId as SpliceId] !== undefined
              : entry.navigationSelectionKind === "node"
                ? state.nodes.byId[entry.navigationSelectionId as NodeId] !== undefined
                : entry.navigationSelectionKind === "segment"
                  ? state.segments.byId[entry.navigationSelectionId as SegmentId] !== undefined
                  : state.wires.byId[entry.navigationSelectionId as WireId] !== undefined;
      if (!exists) {
        return;
      }

      setActiveScreen("modeling");
      setActiveSubScreen(entry.navigationSubScreen);
      store.dispatch(appActions.select({ kind: entry.navigationSelectionKind, id: entry.navigationSelectionId }));
    },
    [handleWorkspaceScreenChange, setActiveScreen, setActiveSubScreen, store]
  );

  const homeWorkspaceContent = (
    <HomeWorkspaceContentComponent
      hasActiveNetwork={hasActiveNetwork}
      activeNetworkName={activeNetworkName}
      activeNetworkTechnicalId={activeNetworkTechnicalId}
      recentChangesForActiveNetwork={recentChangesForActiveNetwork}
      networkCount={networkCount}
      onCreateEmptyWorkspace={handleCreateEmptyWorkspace}
      onSaveWorkspace={onSaveWorkspace}
      onOpenImportPicker={onOpenImportPicker}
      importFileInputRef={importFileInputRef}
      onImportFileChange={onImportFileChange}
      onOpenNetworkScope={() => handleWorkspaceScreenChange("networkScope")}
      onOpenModeling={() => {
        handleWorkspaceScreenChange("modeling");
        setActiveSubScreen("connector");
      }}
      onOpenRecentChangeTarget={handleOpenRecentChangeTarget}
      onOpenOnboardingHelp={onOpenOnboardingHelp}
    />
  );

  return {
    homeWorkspaceContent
  };
}
