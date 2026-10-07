import type { ReactNode } from "react";
import { HomeWorkspaceLineagesPanel, WorkspaceLineageBar } from "../../components/workspace/WorkspaceLineagePanels";
import type { WorkspaceLineageModel } from "../useWorkspaceLineages";

export interface WorkspaceLineageElements {
  workspaceLineageBar: ReactNode;
  workspaceLineagesPanel: ReactNode;
  /** Ctrl/Cmd+S saves the active named workspace; without one the previous shortcut action is kept. */
  resolveSaveShortcut: (fallback: () => void) => () => void;
}

export function buildWorkspaceLineageElements(model: WorkspaceLineageModel, onResume: () => void): WorkspaceLineageElements {
  return {
    workspaceLineageBar: <WorkspaceLineageBar model={model} />,
    workspaceLineagesPanel: <HomeWorkspaceLineagesPanel model={model} onResume={onResume} />,
    resolveSaveShortcut: (fallback) =>
      model.snapshot.active !== null
        ? () => {
            void model.saveNow();
          }
        : fallback
  };
}
