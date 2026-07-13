import { translateCurrent as t } from "./i18n";
import type { WorkspaceFilePayloadV1 } from "./workspaceFile";
import {
  isDirectFileAccessSupported,
  type WorkspaceFileHandle,
  type WorkspaceFileStorageStatus
} from "./workspaceFileAccess";

export const AUTOSAVE_DELAY_MS = 700;

export type WorkspaceFileStatusBase = Omit<WorkspaceFileStorageStatus, "label">;

export function createLocalWorkspaceFileStatus(): WorkspaceFileStatusBase {
  return {
    mode: "local",
    fileName: null,
    resumeFileName: null,
    canResume: false,
    resumeStatus: "none",
    fileAvailability: "unknown",
    directFileAccessSupported: isDirectFileAccessSupported(),
    saveTarget: "local-cache",
    lastSavedAtIso: null,
    permission: "unavailable",
    message: t("ui.workspacefilestoragestatusWorkspaceChangesAreSavedInThisBrowserOnly"),
    conflict: false,
    isSaving: false
  };
}

export function createOpenedWorkspaceFileStatus(
  sourceLabel: string,
  handle: WorkspaceFileHandle | null,
  payload: WorkspaceFilePayloadV1,
  permission: WorkspaceFileStatusBase["permission"]
): WorkspaceFileStatusBase {
  return {
    mode: handle === null ? "local" : "linked",
    fileName: sourceLabel,
    resumeFileName: handle === null ? null : sourceLabel,
    canResume: handle !== null,
    resumeStatus: handle === null ? "none" : permission === "granted" || permission === "unknown" ? "available" : "permission-required",
    fileAvailability: "available",
    directFileAccessSupported: isDirectFileAccessSupported(),
    saveTarget: handle === null ? "local-cache" : "linked-file",
    lastSavedAtIso: payload.updatedAtIso,
    permission,
    message:
      handle === null
        ? "Workspace file imported. This browser cannot autosave to that uploaded file."
        : "Workspace file linked. Future changes autosave to this file while permission remains available.",
    conflict: false,
    isSaving: false
  };
}

export function createLinkedWorkspaceFileStatus(
  handleName: string,
  payload: WorkspaceFilePayloadV1,
  permission: WorkspaceFileStatusBase["permission"]
): WorkspaceFileStatusBase {
  return {
    mode: "linked",
    fileName: handleName,
    resumeFileName: handleName,
    canResume: true,
    resumeStatus: permission === "granted" || permission === "unknown" ? "available" : "permission-required",
    fileAvailability: "available",
    directFileAccessSupported: isDirectFileAccessSupported(),
    saveTarget: "linked-file",
    lastSavedAtIso: payload.updatedAtIso,
    permission,
    conflict: false,
    isSaving: false,
    message: t("ui.workspacefilestoragestatusWorkspaceFileLinkedFutureChangesAutosaveToThisFileWhile")
  };
}

export function createDownloadedWorkspaceFileStatus(
  current: WorkspaceFileStatusBase,
  fileName: string,
  payload: WorkspaceFilePayloadV1
): WorkspaceFileStatusBase {
  return {
    ...current,
    mode: "local",
    fileName,
    resumeFileName: current.resumeFileName,
    canResume: current.canResume,
    resumeStatus: current.resumeStatus,
    fileAvailability: current.fileAvailability,
    directFileAccessSupported: isDirectFileAccessSupported(),
    saveTarget: "download",
    lastSavedAtIso: payload.updatedAtIso,
    permission: "unavailable",
    conflict: false,
    isSaving: false,
    message: t("ui.workspacefilestoragestatusWorkspaceFileDownloadedThisBrowserDidNotGrantDirectFile")
  };
}
