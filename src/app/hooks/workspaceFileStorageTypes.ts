import type { ChangeEvent, MutableRefObject } from "react";
import type { AppState, AppStore } from "../../store";
import type { ConfirmDialogRequest } from "../types/confirm-dialog";
import type { WorkspaceFileStorageStatus } from "../lib/workspaceFileAccess";

export interface UseWorkspaceFileStorageParams {
  store: AppStore;
  replaceStateWithHistory: (state: AppState) => void;
  requestConfirmation: (request: ConfirmDialogRequest) => Promise<boolean>;
  notifyToast: (title: string, options?: { message?: string; variant?: "success" | "info" | "warning" | "error" }) => void;
}

export interface UseWorkspaceFileStorageResult {
  workspaceFileInputRef: MutableRefObject<HTMLInputElement | null>;
  workspaceFileStatus: WorkspaceFileStorageStatus;
  openWorkspaceFile: () => void;
  relinkWorkspaceFile: () => void;
  resumeWorkspaceFile: () => void;
  saveWorkspaceFileNow: () => void;
  saveWorkspaceFileAs: () => void;
  unlinkWorkspaceFile: () => void;
  openLinkedWorkspaceFile: () => void;
  openResumableWorkspaceFile: () => void;
  loadLinkedFileVersion: () => void;
  keepLocalWorkspaceVersion: () => void;
  handleWorkspaceFileInputChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export type UseWorkspaceFileStorageModel = UseWorkspaceFileStorageResult;
