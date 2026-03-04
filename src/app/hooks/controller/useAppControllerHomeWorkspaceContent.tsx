import { useCallback, type ChangeEvent, type ComponentType, type RefObject } from "react";
import type { NetworkImportSummary } from "../../../adapters/portability";
import { createEmptyWorkspaceState, type AppState } from "../../../store";
import type { InteractionMode } from "../../types/app-controller";
import type { ConfirmDialogRequest } from "../../types/confirm-dialog";

type ScreenId = "home" | "networkScope" | "modeling" | "analysis" | "validation" | "settings";
type SubScreenId = "catalog" | "connector" | "splice" | "node" | "segment" | "wire";

type HomeWorkspaceContentProps = Parameters<
  typeof import("../../components/workspace/HomeWorkspaceContent").HomeWorkspaceContent
>[0];

interface UseAppControllerHomeWorkspaceContentParams {
  HomeWorkspaceContentComponent: ComponentType<HomeWorkspaceContentProps>;
  hasActiveNetwork: boolean;
  activeNetworkName: string | null;
  activeNetworkTechnicalId: string | null;
  networkCount: number;
  saveStatus: HomeWorkspaceContentProps["saveStatus"];
  validationIssuesCount: number;
  validationErrorCount: number;
  validationWarningCount: number;
  onOpenImportPicker: () => void;
  importFileInputRef: RefObject<HTMLInputElement | null>;
  onImportFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  importExportStatusMessage: string | null;
  lastImportSummary: NetworkImportSummary | null;
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
  networkCount,
  saveStatus,
  validationIssuesCount,
  validationErrorCount,
  validationWarningCount,
  onOpenImportPicker,
  importFileInputRef,
  onImportFileChange,
  importExportStatusMessage,
  lastImportSummary,
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

  const homeWorkspaceContent = (
    <HomeWorkspaceContentComponent
      hasActiveNetwork={hasActiveNetwork}
      activeNetworkName={activeNetworkName}
      activeNetworkTechnicalId={activeNetworkTechnicalId}
      networkCount={networkCount}
      saveStatus={saveStatus}
      validationIssuesCount={validationIssuesCount}
      validationErrorCount={validationErrorCount}
      validationWarningCount={validationWarningCount}
      onCreateEmptyWorkspace={handleCreateEmptyWorkspace}
      onOpenImportPicker={onOpenImportPicker}
      importFileInputRef={importFileInputRef}
      onImportFileChange={onImportFileChange}
      importExportStatusMessage={importExportStatusMessage}
      lastImportSummary={lastImportSummary}
      onOpenNetworkScope={() => handleWorkspaceScreenChange("networkScope")}
      onOpenModeling={() => {
        handleWorkspaceScreenChange("modeling");
        setActiveSubScreen("connector");
      }}
      onOpenValidation={() => handleWorkspaceScreenChange("validation")}
      onOpenOnboardingHelp={onOpenOnboardingHelp}
    />
  );

  return {
    homeWorkspaceContent
  };
}
