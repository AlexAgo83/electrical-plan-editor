import { useCallback, type ReactNode } from "react";
import { HomeWorkspaceLineagesPanel, WorkspaceLineageContextBar, WorkspaceLineageDialogs } from "../../components/workspace/WorkspaceLineagePanels";
import { requestWorkspaceStorageFocus } from "../../lib/workspaceStorageFocus";
import type { ScreenId, SubScreenId } from "../../types/app-controller";
import type { WorkspaceLineageModel } from "../useWorkspaceLineages";

export interface WorkspaceLineageElements {
  /** Compact active-workspace context shown outside Settings (renders nothing without an active named workspace). */
  workspaceLineageBar: ReactNode;
  workspaceLineagesPanel: ReactNode;
  /** The single lineage dialog host, mounted once at app level. */
  workspaceLineageDialogs: ReactNode;
  /** Opens Settings and focuses Workspace storage, or the matching recovery action when a target is given. */
  openWorkspaceStorageSettings: (settingsTargetId?: string) => void;
  /** Ctrl/Cmd+S saves the active named workspace; without one the previous shortcut action is kept. */
  resolveSaveShortcut: (fallback: () => void) => () => void;
}

interface UseWorkspaceLineageElementsParams {
  setActiveScreen: (screen: ScreenId) => void;
  setActiveSubScreen: (subScreen: SubScreenId) => void;
  closeNavigationDrawer: () => void;
  closeOperationsPanel: () => void;
  themeHostClassName: string;
}

export function useWorkspaceLineageElements(
  model: WorkspaceLineageModel,
  { setActiveScreen, setActiveSubScreen, closeNavigationDrawer, closeOperationsPanel, themeHostClassName }: UseWorkspaceLineageElementsParams
): WorkspaceLineageElements {
  const openWorkspaceStorageSettings = useCallback(
    (settingsTargetId?: string) => {
      requestWorkspaceStorageFocus(settingsTargetId);
      setActiveScreen("settings");
      closeNavigationDrawer();
      closeOperationsPanel();
    },
    [closeNavigationDrawer, closeOperationsPanel, setActiveScreen]
  );
  const onResume = (): void => {
    setActiveScreen("modeling");
    setActiveSubScreen("connector");
  };
  return {
    workspaceLineageBar: <WorkspaceLineageContextBar model={model} onManage={openWorkspaceStorageSettings} />,
    workspaceLineagesPanel: <HomeWorkspaceLineagesPanel model={model} onResume={onResume} onManage={() => openWorkspaceStorageSettings()} />,
    workspaceLineageDialogs: <WorkspaceLineageDialogs model={model} themeHostClassName={themeHostClassName} />,
    openWorkspaceStorageSettings,
    resolveSaveShortcut: (fallback) =>
      model.snapshot.active !== null
        ? () => {
            void model.saveNow();
          }
        : fallback
  };
}
