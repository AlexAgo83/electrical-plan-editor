import type { WorkspaceFilePayloadV1 } from "./workspaceFile";

type FileSystemPermissionMode = "read" | "readwrite";
type FileSystemPermissionState = "granted" | "denied" | "prompt";

export interface WorkspaceFileHandle {
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

export const WORKSPACE_FILE_TYPES = [
  {
    description: "Electrical Plan Editor workspace",
    accept: { "application/json": [".epe.json", ".json"] }
  }
];

const WORKSPACE_FILE_DB_NAME = "electrical-plan-editor.workspace-file";
const WORKSPACE_FILE_DB_VERSION = 1;
const WORKSPACE_FILE_STORE_NAME = "linked-workspace-file";
const WORKSPACE_FILE_HANDLE_KEY = "last-linked-handle";

export function resolveWorkspaceFileWindow(): WorkspaceFileWindow | null {
  return typeof window === "undefined" ? null : (window);
}

export function isDirectFileAccessSupported(): boolean {
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

export async function readStoredWorkspaceFileHandle(): Promise<WorkspaceFileHandle | null> {
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

export async function writeStoredWorkspaceFileHandle(handle: WorkspaceFileHandle): Promise<boolean> {
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

export async function clearStoredWorkspaceFileHandle(): Promise<void> {
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

export function buildStatusLabel(status: Omit<WorkspaceFileStorageStatus, "label">): string {
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

export function buildWorkspaceFileSummary(payload: WorkspaceFilePayloadV1): string {
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

export async function readHandleText(handle: WorkspaceFileHandle): Promise<string> {
  const file = await handle.getFile();
  return file.text();
}

export async function writeHandleText(handle: WorkspaceFileHandle, content: string): Promise<void> {
  const writable = await handle.createWritable();
  await writable.write(new Blob([content], { type: "application/json" }));
  await writable.close();
}

export async function resolveWritePermission(handle: WorkspaceFileHandle): Promise<WorkspaceFileStorageStatus["permission"]> {
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

export async function openWorkspaceFileHandleInNewTab(handle: WorkspaceFileHandle): Promise<"opened" | "blocked"> {
  if (typeof window === "undefined") {
    return "blocked";
  }

  const file = await handle.getFile();
  const href = URL.createObjectURL(file);
  const openedWindow = window.open(href, "_blank", "noopener,noreferrer");
  window.setTimeout(() => {
    URL.revokeObjectURL(href);
  }, 60000);
  return openedWindow === null ? "blocked" : "opened";
}
