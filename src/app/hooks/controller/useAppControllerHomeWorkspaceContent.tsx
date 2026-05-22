import { useCallback, useMemo, type ChangeEvent, type ComponentType, type RefObject } from "react";
import { createEmptyWorkspaceState, type AppState } from "../../../store";
import type { InteractionMode, UndoHistoryEntry } from "../../types/app-controller";
import type { NetworkId } from "../../../core/entities";
import type { ConfirmDialogRequest } from "../../types/confirm-dialog";

type ScreenId = "home" | "networkScope" | "harnessAssembly" | "modeling" | "analysis" | "validation" | "settings";
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
          title: "Create empty workspace",
          message: "Replace the current workspace with an empty workspace? This removes current workspace changes.",
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
      onOpenOnboardingHelp={onOpenOnboardingHelp}
    />
  );

  return {
    homeWorkspaceContent
  };
}
