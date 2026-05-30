import { type ChangeEvent, type MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AppState, AppStore } from "../../store";
import type { ConfirmDialogRequest } from "../types/confirm-dialog";
import { downloadJsonFile } from "./useNetworkImportExport";
import {
  buildWorkspaceFileName,
  buildWorkspaceFilePayload,
  parseWorkspaceFilePayload,
  serializeWorkspaceFilePayload,
  type WorkspaceFilePayloadV1
} from "../lib/workspaceFile";

type FileSystemPermissionMode = "read" | "readwrite";
type FileSystemPermissionState = "granted" | "denied" | "prompt";

interface WorkspaceFileHandle {
  name: string;
  getFile: () => Promise<File>;
  createWritable: () => Promise<{
    write: (content: Blob) => Promise<void>;
    close: () => Promise<void>;
  }>;
  queryPermission?: (descriptor?: { mode?: FileSystemPermissionMode }) => Promise<FileSystemPermissionState>;
  requestPermission?: (descriptor?: { mode?: FileSystemPermissionMode }) => Promise<FileSystemPermissionState>;
}

interface WorkspaceFilePickerOptions {
  multiple?: boolean;
  types?: Array<{
    description: string;
    accept: Record<string, string[]>;
  }>;
}

interface WorkspaceSaveFilePickerOptions {
  suggestedName: string;
  types: Array<{
    description: string;
    accept: Record<string, string[]>;
  }>;
}

interface WorkspaceFileWindow extends Window {
  showOpenFilePicker?: (options?: WorkspaceFilePickerOptions) => Promise<WorkspaceFileHandle[]>;
  showSaveFilePicker?: (options: WorkspaceSaveFilePickerOptions) => Promise<WorkspaceFileHandle>;
}

export interface WorkspaceFileStorageStatus {
  mode: "local" | "linked";
  label: string;
  fileName: string | null;
  resumeFileName: string | null;
  canResume: boolean;
  resumeStatus: "none" | "available" | "permission-required" | "unavailable";
  fileAvailability: "unknown" | "available" | "unavailable";
  directFileAccessSupported: boolean;
  saveTarget: "local-cache" | "linked-file" | "download";
  lastSavedAtIso: string | null;
  permission: "unknown" | "granted" | "prompt" | "denied" | "unavailable";
  message: string | null;
  conflict: boolean;
  isSaving: boolean;
}

interface UseWorkspaceFileStorageParams {
  store: AppStore;
  replaceStateWithHistory: (state: AppState) => void;
  requestConfirmation: (request: ConfirmDialogRequest) => Promise<boolean>;
  notifyToast: (title: string, options?: { message?: string; variant?: "success" | "info" | "warning" | "error" }) => void;
}

interface UseWorkspaceFileStorageResult {
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

const WORKSPACE_FILE_TYPES = [
  {
    description: "Electrical Plan Editor workspace",
    accept: { "application/json": [".epe.json", ".json"] }
  }
];

const AUTOSAVE_DELAY_MS = 700;
const WORKSPACE_FILE_DB_NAME = "electrical-plan-editor.workspace-file";
const WORKSPACE_FILE_DB_VERSION = 1;
const WORKSPACE_FILE_STORE_NAME = "linked-workspace-file";
const WORKSPACE_FILE_HANDLE_KEY = "last-linked-handle";

function resolveWorkspaceFileWindow(): WorkspaceFileWindow | null {
  return typeof window === "undefined" ? null : (window as WorkspaceFileWindow);
}

function isDirectFileAccessSupported(): boolean {
  const fileWindow = resolveWorkspaceFileWindow();
  return typeof fileWindow?.showOpenFilePicker === "function" && typeof fileWindow.showSaveFilePicker === "function";
}

function openWorkspaceFileDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const request = indexedDB.open(WORKSPACE_FILE_DB_NAME, WORKSPACE_FILE_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(WORKSPACE_FILE_STORE_NAME)) {
        db.createObjectStore(WORKSPACE_FILE_STORE_NAME);
      }
    };
    request.onerror = () => resolve(null);
    request.onsuccess = () => resolve(request.result);
  });
}

async function readStoredWorkspaceFileHandle(): Promise<WorkspaceFileHandle | null> {
  const db = await openWorkspaceFileDb();
  if (db === null) {
    return null;
  }

  return new Promise((resolve) => {
    const transaction = db.transaction(WORKSPACE_FILE_STORE_NAME, "readonly");
    const request = transaction.objectStore(WORKSPACE_FILE_STORE_NAME).get(WORKSPACE_FILE_HANDLE_KEY);
    request.onerror = () => resolve(null);
    request.onsuccess = () => {
      const value: unknown = request.result;
      resolve(typeof value === "object" && value !== null && "getFile" in value ? (value as WorkspaceFileHandle) : null);
    };
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => db.close();
  });
}

async function writeStoredWorkspaceFileHandle(handle: WorkspaceFileHandle): Promise<boolean> {
  const db = await openWorkspaceFileDb();
  if (db === null) {
    return false;
  }

  return new Promise((resolve) => {
    const transaction = db.transaction(WORKSPACE_FILE_STORE_NAME, "readwrite");
    try {
      const request = transaction.objectStore(WORKSPACE_FILE_STORE_NAME).put(handle, WORKSPACE_FILE_HANDLE_KEY);
      request.onerror = () => resolve(false);
    } catch {
      db.close();
      resolve(false);
      return;
    }
    transaction.oncomplete = () => {
      db.close();
      resolve(true);
    };
    transaction.onerror = () => {
      db.close();
      resolve(false);
    };
  });
}

async function clearStoredWorkspaceFileHandle(): Promise<void> {
  const db = await openWorkspaceFileDb();
  if (db === null) {
    return;
  }

  await new Promise<void>((resolve) => {
    const transaction = db.transaction(WORKSPACE_FILE_STORE_NAME, "readwrite");
    transaction.objectStore(WORKSPACE_FILE_STORE_NAME).delete(WORKSPACE_FILE_HANDLE_KEY);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      resolve();
    };
  });
}

function formatSaveTime(iso: string | null): string {
  if (iso === null) {
    return "";
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function buildStatusLabel(status: Omit<WorkspaceFileStorageStatus, "label">): string {
  if (status.conflict) {
    return "Conflict";
  }
  if (status.isSaving) {
    return "Saving";
  }
  if (status.mode === "linked") {
    return status.lastSavedAtIso === null ? "Linked to file" : `Saved ${formatSaveTime(status.lastSavedAtIso)}`;
  }

  return "Local only";
}

function buildWorkspaceFileSummary(payload: WorkspaceFilePayloadV1): string {
  const networkCount = payload.state.networks.allIds.length;
  const activeNetworkName =
    payload.state.activeNetworkId === null
      ? "None"
      : payload.state.networks.byId[payload.state.activeNetworkId]?.name ?? payload.state.activeNetworkId;

  return [
    `Updated: ${payload.updatedAtIso}`,
    `Networks: ${networkCount}`,
    `Active network: ${activeNetworkName}`,
    `Workspace ID: ${payload.workspaceId}`,
    `Revision: ${payload.revisionId}`,
    `App/schema: ${payload.appVersion} / ${payload.appSchemaVersion}`
  ].join("\n");
}

async function readHandleText(handle: WorkspaceFileHandle): Promise<string> {
  const file = await handle.getFile();
  return file.text();
}

async function writeHandleText(handle: WorkspaceFileHandle, content: string): Promise<void> {
  const writable = await handle.createWritable();
  await writable.write(new Blob([content], { type: "application/json" }));
  await writable.close();
}

async function resolveWritePermission(handle: WorkspaceFileHandle): Promise<WorkspaceFileStorageStatus["permission"]> {
  if (typeof handle.queryPermission !== "function" || typeof handle.requestPermission !== "function") {
    return "unknown";
  }

  const descriptor = { mode: "readwrite" as const };
  const queried = await handle.queryPermission(descriptor);
  if (queried === "granted") {
    return "granted";
  }

  const requested = await handle.requestPermission(descriptor);
  return requested;
}

export function useWorkspaceFileStorage({
  store,
  replaceStateWithHistory,
  requestConfirmation,
  notifyToast
}: UseWorkspaceFileStorageParams): UseWorkspaceFileStorageResult {
  const workspaceFileInputRef = useRef<HTMLInputElement | null>(null);
  const linkedHandleRef = useRef<WorkspaceFileHandle | null>(null);
  const lastLoadedPayloadRef = useRef<WorkspaceFilePayloadV1 | null>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isWritingRef = useRef(false);
  const [statusBase, setStatusBase] = useState<Omit<WorkspaceFileStorageStatus, "label">>({
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
    message: "Workspace changes are saved in this browser only.",
    conflict: false,
    isSaving: false
  });
  const status = useMemo<WorkspaceFileStorageStatus>(
    () => ({
      ...statusBase,
      label: buildStatusLabel(statusBase)
    }),
    [statusBase]
  );

  const applyWorkspaceFile = useCallback(
    async (rawJson: string, sourceLabel: string, handle: WorkspaceFileHandle | null): Promise<void> => {
      const parsed = parseWorkspaceFilePayload(rawJson);
      if (parsed.error !== null || parsed.state === null || parsed.payload === null) {
        setStatusBase((current) => ({
          ...current,
          message: parsed.error ?? "Workspace file could not be loaded.",
          conflict: false
        }));
        notifyToast("Workspace file not opened", {
          message: parsed.error ?? "The selected file is not a valid workspace.",
          variant: "error"
        });
        return;
      }

      const shouldReplace = await requestConfirmation({
        title: "Open workspace file",
        message: "Replace the current workspace with the selected file?",
        details: `${sourceLabel}\n\n${buildWorkspaceFileSummary(parsed.payload)}`,
        confirmLabel: "Open file",
        intent: "neutral"
      });
      if (!shouldReplace) {
        return;
      }

      linkedHandleRef.current = null;
      replaceStateWithHistory(parsed.state);
      lastLoadedPayloadRef.current = parsed.payload;
      linkedHandleRef.current = handle;
      const nextPermission = handle === null ? "unavailable" : await resolveWritePermission(handle);
      if (handle !== null) {
        void writeStoredWorkspaceFileHandle(handle);
      }
      setStatusBase({
        mode: handle === null ? "local" : "linked",
        fileName: sourceLabel,
        resumeFileName: handle === null ? null : sourceLabel,
        canResume: handle !== null,
        resumeStatus: handle === null ? "none" : nextPermission === "granted" || nextPermission === "unknown" ? "available" : "permission-required",
        fileAvailability: "available",
        directFileAccessSupported: isDirectFileAccessSupported(),
        saveTarget: handle === null ? "local-cache" : "linked-file",
        lastSavedAtIso: parsed.payload.updatedAtIso,
        permission: nextPermission,
        message:
          handle === null
            ? "Workspace file imported. This browser cannot autosave to that uploaded file."
            : "Workspace file linked. Future changes autosave to this file while permission remains available.",
        conflict: false,
        isSaving: false
      });
      notifyToast("Workspace file opened", {
        message: sourceLabel,
        variant: "success"
      });
    },
    [notifyToast, replaceStateWithHistory, requestConfirmation]
  );

  useEffect(() => {
    void (async () => {
      const storedHandle = await readStoredWorkspaceFileHandle();
      if (storedHandle === null) {
        return;
      }

      setStatusBase((current) => ({
        ...current,
        resumeFileName: storedHandle.name,
        canResume: true,
        resumeStatus: "available",
        fileAvailability: "unknown",
        directFileAccessSupported: isDirectFileAccessSupported(),
        message:
          current.mode === "linked"
            ? current.message
            : `A previous workspace file can be resumed: ${storedHandle.name}.`
      }));
    })();
  }, []);

  const resumeWorkspaceFile = useCallback((): void => {
    void (async () => {
      const handle = await readStoredWorkspaceFileHandle();
      if (handle === null) {
        setStatusBase((current) => ({
          ...current,
          canResume: false,
          resumeFileName: null,
          resumeStatus: "unavailable",
          fileAvailability: "unavailable",
          message: "No previous workspace file handle is available in this browser."
        }));
        notifyToast("Workspace file cannot be resumed", {
          message: "Open the workspace file once to create a resumable link.",
          variant: "warning"
        });
        return;
      }

      try {
        await applyWorkspaceFile(await readHandleText(handle), handle.name, handle);
      } catch {
        setStatusBase((current) => ({
          ...current,
          canResume: true,
          resumeFileName: handle.name,
          fileAvailability: "unavailable",
          message: "The previous workspace file could not be resumed. Try opening it again."
        }));
        notifyToast("Workspace file cannot be resumed", {
          message: "The browser could not read the previous file handle.",
          variant: "error"
        });
      }
    })();
  }, [applyWorkspaceFile, notifyToast]);

  const openWorkspaceFile = useCallback((): void => {
    const fileWindow = resolveWorkspaceFileWindow();
    const openFilePicker = fileWindow?.showOpenFilePicker;
    if (typeof openFilePicker === "function") {
      void (async () => {
        try {
          const [handle] = await openFilePicker({
            multiple: false,
            types: WORKSPACE_FILE_TYPES
          });
          if (handle === undefined) {
            return;
          }
          await applyWorkspaceFile(await readHandleText(handle), handle.name, handle);
        } catch (error) {
          if (!(error instanceof DOMException && error.name === "AbortError")) {
            notifyToast("Workspace file not opened", {
              message: "The file picker could not read the selected workspace.",
              variant: "error"
            });
          }
        }
      })();
      return;
    }

    workspaceFileInputRef.current?.click();
  }, [applyWorkspaceFile, notifyToast]);

  const relinkWorkspaceFile = useCallback((): void => {
    openWorkspaceFile();
  }, [openWorkspaceFile]);

  const handleWorkspaceFileInputChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
      const file = event.target.files?.[0] ?? null;
      event.target.value = "";
      if (file === null) {
        return;
      }

      await applyWorkspaceFile(await file.text(), file.name, null);
    },
    [applyWorkspaceFile]
  );

  const writeCurrentStateToHandle = useCallback(
    async (handle: WorkspaceFileHandle, options?: { ignoreConflict?: boolean }): Promise<"saved" | "conflict" | "failed"> => {
      try {
        const previousPayload = lastLoadedPayloadRef.current;
        if (!options?.ignoreConflict && previousPayload !== null) {
          const currentFile = parseWorkspaceFilePayload(await readHandleText(handle));
          if (
            currentFile.payload !== null &&
            currentFile.payload.revisionId !== previousPayload.revisionId
          ) {
            setStatusBase((current) => ({
              ...current,
              conflict: true,
              isSaving: false,
              message: "The linked workspace file changed outside this tab. Choose which version to keep."
            }));
            return "conflict";
          }
        }

        const nextPayload = buildWorkspaceFilePayload(store.getState(), previousPayload);
        await writeHandleText(handle, serializeWorkspaceFilePayload(nextPayload));
        lastLoadedPayloadRef.current = nextPayload;
        setStatusBase((current) => ({
          ...current,
          mode: "linked",
          fileName: handle.name,
          lastSavedAtIso: nextPayload.updatedAtIso,
          permission: current.permission === "unavailable" ? "unknown" : current.permission,
          conflict: false,
          isSaving: false,
          message: "Workspace file saved."
        }));
        return "saved";
      } catch {
        setStatusBase((current) => ({
          ...current,
          fileAvailability: "unavailable",
          isSaving: false,
          message: "The linked workspace file could not be written. It may be unavailable; local browser persistence remains active."
        }));
        return "failed";
      }
    },
    [store]
  );

  const saveWorkspaceFileAs = useCallback((): void => {
    void (async () => {
      const nowIso = new Date().toISOString();
      const payload = buildWorkspaceFilePayload(store.getState(), lastLoadedPayloadRef.current, nowIso);
      const serialized = serializeWorkspaceFilePayload(payload);
      const fileName = buildWorkspaceFileName(nowIso);
      const fileWindow = resolveWorkspaceFileWindow();

      if (typeof fileWindow?.showSaveFilePicker === "function") {
        try {
          const handle = await fileWindow.showSaveFilePicker({
            suggestedName: fileName,
            types: WORKSPACE_FILE_TYPES
          });
          await writeHandleText(handle, serialized);
          linkedHandleRef.current = handle;
          lastLoadedPayloadRef.current = payload;
          void writeStoredWorkspaceFileHandle(handle);
          const permission = await resolveWritePermission(handle);
          setStatusBase({
            mode: "linked",
            fileName: handle.name,
            resumeFileName: handle.name,
            canResume: true,
            resumeStatus: permission === "granted" || permission === "unknown" ? "available" : "permission-required",
            fileAvailability: "available",
            directFileAccessSupported: isDirectFileAccessSupported(),
            saveTarget: "linked-file",
            lastSavedAtIso: payload.updatedAtIso,
            permission,
            conflict: false,
            isSaving: false,
            message: "Workspace file linked. Future changes autosave to this file while permission remains available."
          });
          notifyToast("Workspace file saved", {
            message: handle.name,
            variant: "success"
          });
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
        }
      }

      const downloaded = downloadJsonFile(fileName, serialized);
      if (!downloaded) {
        notifyToast("Workspace file not saved", {
          message: "File download is not available in this environment.",
          variant: "error"
        });
        return;
      }

      linkedHandleRef.current = null;
      lastLoadedPayloadRef.current = payload;
      setStatusBase((current) => ({
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
        message: "Workspace file downloaded. This browser did not grant direct file autosave access."
      }));
      notifyToast("Workspace file downloaded", {
        message: fileName,
        variant: "success"
      });
    })();
  }, [notifyToast, store]);

  const saveWorkspaceFileNow = useCallback((): void => {
    const handle = linkedHandleRef.current;
    if (handle !== null) {
      void (async () => {
        setStatusBase((current) => ({ ...current, isSaving: true, message: "Saving linked workspace file now." }));
        const result = await writeCurrentStateToHandle(handle, { ignoreConflict: false });
        if (result === "saved") {
          notifyToast("Workspace file saved", {
            message: handle.name,
            variant: "success"
          });
        } else if (result === "conflict") {
          notifyToast("Workspace file conflict", {
            message: "The linked file changed outside this tab.",
            variant: "warning"
          });
        } else {
          notifyToast("Workspace file not saved", {
            message: "The linked file could not be written.",
            variant: "error"
          });
        }
      })();
      return;
    }

    saveWorkspaceFileAs();
  }, [notifyToast, saveWorkspaceFileAs, writeCurrentStateToHandle]);

  const unlinkWorkspaceFile = useCallback((): void => {
    linkedHandleRef.current = null;
    void clearStoredWorkspaceFileHandle();
    setStatusBase({
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
      message: "Workspace changes are saved in this browser only.",
      conflict: false,
      isSaving: false
    });
    notifyToast("Workspace file unlinked", {
      message: "Local browser persistence remains active.",
      variant: "info"
    });
  }, [notifyToast]);

  const openLinkedWorkspaceFile = useCallback((): void => {
    const handle = linkedHandleRef.current;
    if (handle === null || typeof window === "undefined") {
      notifyToast("Workspace file cannot be opened", {
        message: "The browser does not currently have a linked file handle.",
        variant: "warning"
      });
      return;
    }

    void (async () => {
      try {
        const file = await handle.getFile();
        const href = URL.createObjectURL(file);
        const openedWindow = window.open(href, "_blank", "noopener,noreferrer");
        window.setTimeout(() => {
          URL.revokeObjectURL(href);
        }, 60000);
        if (openedWindow === null) {
          notifyToast("Workspace file blocked", {
            message: "The browser blocked opening the linked file in a new tab.",
            variant: "warning"
          });
        }
      } catch {
        notifyToast("Workspace file cannot be opened", {
          message: "The linked file could not be read. It may have been moved or deleted; relink it from Workspace storage.",
          variant: "error"
        });
        setStatusBase((current) => ({
          ...current,
          fileAvailability: "unavailable",
          message: "The linked file could not be read. It may have been moved or deleted; relink it from Workspace storage."
        }));
      }
    })();
  }, [notifyToast]);

  const openResumableWorkspaceFile = useCallback((): void => {
    void (async () => {
      const handle = linkedHandleRef.current ?? await readStoredWorkspaceFileHandle();
      if (handle === null || typeof window === "undefined") {
        notifyToast("Workspace file cannot be opened", {
          message: "No resumable workspace file handle is available in this browser.",
          variant: "warning"
        });
        return;
      }

      try {
        const file = await handle.getFile();
        const href = URL.createObjectURL(file);
        const openedWindow = window.open(href, "_blank", "noopener,noreferrer");
        window.setTimeout(() => {
          URL.revokeObjectURL(href);
        }, 60000);
        if (openedWindow === null) {
          notifyToast("Workspace file blocked", {
            message: "The browser blocked opening the workspace file in a new tab.",
            variant: "warning"
          });
        }
      } catch {
        notifyToast("Workspace file cannot be opened", {
          message: "The resumable file could not be read. It may have been moved or deleted; relink it from Workspace storage.",
          variant: "error"
        });
        setStatusBase((current) => ({
          ...current,
          fileAvailability: "unavailable",
          resumeStatus: "unavailable",
          message: "The resumable file could not be read. It may have been moved or deleted; relink it from Workspace storage."
        }));
      }
    })();
  }, [notifyToast]);

  const loadLinkedFileVersion = useCallback((): void => {
    const handle = linkedHandleRef.current;
    if (handle === null) {
      return;
    }

    void (async () => {
      await applyWorkspaceFile(await readHandleText(handle), handle.name, handle);
    })();
  }, [applyWorkspaceFile]);

  const keepLocalWorkspaceVersion = useCallback((): void => {
    const handle = linkedHandleRef.current;
    if (handle === null) {
      return;
    }

    void (async () => {
      setStatusBase((current) => ({ ...current, isSaving: true, message: "Overwriting linked file with local workspace." }));
      const result = await writeCurrentStateToHandle(handle, { ignoreConflict: true });
      if (result === "failed") {
        notifyToast("Workspace file not saved", {
          message: "The linked file could not be overwritten.",
          variant: "error"
        });
        return;
      }
      notifyToast("Workspace file overwritten", {
        message: handle.name,
        variant: "success"
      });
    })();
  }, [notifyToast, writeCurrentStateToHandle]);

  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current !== null) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return store.subscribe(() => {
      const handle = linkedHandleRef.current;
      if (handle === null || isWritingRef.current) {
        return;
      }

      if (autosaveTimerRef.current !== null) {
        clearTimeout(autosaveTimerRef.current);
      }

      autosaveTimerRef.current = setTimeout(() => {
        const currentHandle = linkedHandleRef.current;
        if (currentHandle === null) {
          return;
        }

        void (async () => {
          isWritingRef.current = true;
          setStatusBase((current) => ({ ...current, isSaving: true, message: current.message }));
          try {
            const result = await writeCurrentStateToHandle(currentHandle);
            if (result === "failed") {
              setStatusBase((current) => ({
                ...current,
                isSaving: false,
                message: "Autosave to the linked workspace file failed. Local browser persistence remains active."
              }));
            }
          } catch {
            setStatusBase((current) => ({
              ...current,
              isSaving: false,
              message: "Autosave to the linked workspace file failed. Local browser persistence remains active."
            }));
          } finally {
            isWritingRef.current = false;
          }
        })();
      }, AUTOSAVE_DELAY_MS);
    });
  }, [store, writeCurrentStateToHandle]);

  return {
    workspaceFileInputRef,
    workspaceFileStatus: status,
    openWorkspaceFile,
    relinkWorkspaceFile,
    resumeWorkspaceFile,
    saveWorkspaceFileNow,
    saveWorkspaceFileAs,
    unlinkWorkspaceFile,
    openLinkedWorkspaceFile,
    openResumableWorkspaceFile,
    loadLinkedFileVersion,
    keepLocalWorkspaceVersion,
    handleWorkspaceFileInputChange
  };
}
