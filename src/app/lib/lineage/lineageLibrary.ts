/**
 * Local workspace library: per-lineage registry, browser-backed lineage storage, folder handles
 * and lineage-scoped local recovery sessions (IndexedDB). Falls back to an in-memory store when
 * IndexedDB is unavailable; that state is reported as non-durable.
 *
 * A browser cache is never proof of a disk save: folder-mode lineages keep their files on disk
 * and only use the local session as a recovery copy of unsaved work.
 */
import type { LineageDirectory } from "./lineageDirectory";
import { MemoryLineageDirectory } from "./lineageDirectory";

export interface LineageRegistryRecord {
  workspaceId: string;
  displayName: string;
  slug: string;
  storage: "browser" | "folder";
  folderName: string | null;
  createdAtIso: string;
  lastOpenedAtIso: string;
  /** Browser-mode changes not yet exported as a portable package. */
  pendingPortableExport: boolean;
  /** Last package export from this browser; absent on records written before 1.19.2. */
  lastPortableExportIso?: string | null;
  lastDurableSaveIso: string | null;
  versionCount: number;
  latestVersionLabel: string | null;
}

export interface LineageLocalSession {
  workspaceId: string;
  /** Serialized AppState of unsaved working content. */
  stateJson: string;
  baseRevisionId: string | null;
  savedAtIso: string;
}

export interface PreservedLegacySnapshot {
  stateJson: string;
  preservedAtIso: string;
}

export interface FolderDirectoryHandle {
  name: string;
  kind?: "directory";
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FolderDirectoryHandle>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FolderFileHandle>;
  removeEntry?(name: string): Promise<void>;
  values?(): AsyncIterable<FolderDirectoryHandle | FolderFileHandle>;
  queryPermission?(descriptor?: { mode?: "read" | "readwrite" }): Promise<"granted" | "denied" | "prompt">;
  requestPermission?(descriptor?: { mode?: "read" | "readwrite" }): Promise<"granted" | "denied" | "prompt">;
}

export interface FolderFileHandle {
  name: string;
  kind?: "file";
  getFile(): Promise<{ arrayBuffer(): Promise<ArrayBuffer> }>;
  createWritable(): Promise<{ write(data: Uint8Array | Blob): Promise<void>; close(): Promise<void>; abort?: () => Promise<void> }>;
}

export interface LineageLibraryStore {
  /** False when only a non-durable in-memory fallback is available. */
  readonly durable: boolean;
  listRecords(): Promise<LineageRegistryRecord[]>;
  putRecord(record: LineageRegistryRecord): Promise<void>;
  getActiveWorkspaceId(): Promise<string | null>;
  setActiveWorkspaceId(workspaceId: string | null): Promise<void>;
  readSession(workspaceId: string): Promise<LineageLocalSession | null>;
  writeSession(session: LineageLocalSession): Promise<void>;
  clearSession(workspaceId: string): Promise<void>;
  readPreservedLegacySnapshot(): Promise<PreservedLegacySnapshot | null>;
  writePreservedLegacySnapshot(snapshot: PreservedLegacySnapshot | null): Promise<void>;
  readFolderHandle(workspaceId: string): Promise<FolderDirectoryHandle | null>;
  writeFolderHandle(workspaceId: string, handle: FolderDirectoryHandle): Promise<void>;
  browserDirectory(workspaceId: string, label: string): LineageDirectory;
}

export class MemoryLineageLibraryStore implements LineageLibraryStore {
  readonly durable: boolean;
  private records = new Map<string, LineageRegistryRecord>();
  private sessions = new Map<string, LineageLocalSession>();
  private handles = new Map<string, FolderDirectoryHandle>();
  private directories = new Map<string, MemoryLineageDirectory>();
  private activeWorkspaceId: string | null = null;
  private preserved: PreservedLegacySnapshot | null = null;

  constructor(options: { durable?: boolean } = {}) {
    this.durable = options.durable ?? false;
  }

  listRecords(): Promise<LineageRegistryRecord[]> {
    return Promise.resolve([...this.records.values()].map((record) => ({ ...record })));
  }

  putRecord(record: LineageRegistryRecord): Promise<void> {
    this.records.set(record.workspaceId, { ...record });
    return Promise.resolve();
  }

  getActiveWorkspaceId(): Promise<string | null> {
    return Promise.resolve(this.activeWorkspaceId);
  }

  setActiveWorkspaceId(workspaceId: string | null): Promise<void> {
    this.activeWorkspaceId = workspaceId;
    return Promise.resolve();
  }

  readSession(workspaceId: string): Promise<LineageLocalSession | null> {
    const session = this.sessions.get(workspaceId);
    return Promise.resolve(session === undefined ? null : { ...session });
  }

  writeSession(session: LineageLocalSession): Promise<void> {
    this.sessions.set(session.workspaceId, { ...session });
    return Promise.resolve();
  }

  clearSession(workspaceId: string): Promise<void> {
    this.sessions.delete(workspaceId);
    return Promise.resolve();
  }

  readPreservedLegacySnapshot(): Promise<PreservedLegacySnapshot | null> {
    return Promise.resolve(this.preserved);
  }

  writePreservedLegacySnapshot(snapshot: PreservedLegacySnapshot | null): Promise<void> {
    this.preserved = snapshot;
    return Promise.resolve();
  }

  readFolderHandle(workspaceId: string): Promise<FolderDirectoryHandle | null> {
    return Promise.resolve(this.handles.get(workspaceId) ?? null);
  }

  writeFolderHandle(workspaceId: string, handle: FolderDirectoryHandle): Promise<void> {
    this.handles.set(workspaceId, handle);
    return Promise.resolve();
  }

  browserDirectory(workspaceId: string, label: string): LineageDirectory {
    let directory = this.directories.get(workspaceId);
    if (directory === undefined) {
      directory = new MemoryLineageDirectory(label);
      this.directories.set(workspaceId, directory);
    }
    return directory;
  }
}

const LIBRARY_DB_NAME = "electrical-plan-editor.workspace-lineages";
const LIBRARY_DB_VERSION = 1;
const STORE_REGISTRY = "registry";
const STORE_SESSIONS = "sessions";
const STORE_FILES = "files";
const STORE_META = "meta";
const META_ACTIVE = "active-workspace-id";
const META_PRESERVED = "preserved-legacy-snapshot";
const HANDLE_KEY_PREFIX = "folder-handle:";

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function openLibraryDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(LIBRARY_DB_NAME, LIBRARY_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const name of [STORE_REGISTRY, STORE_SESSIONS, STORE_FILES, STORE_META]) {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name);
        }
      }
    };
    request.onerror = () => reject(request.error ?? new Error("IndexedDB unavailable"));
    request.onsuccess = () => resolve(request.result);
  });
}

class IndexedDbLineageDirectory implements LineageDirectory {
  readonly kind = "browser" as const;
  readonly label: string;
  private readonly prefix: string;
  private readonly withStore: <T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>) => Promise<T>;

  constructor(
    workspaceId: string,
    label: string,
    withStore: <T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>) => Promise<T>
  ) {
    this.prefix = `${workspaceId}/`;
    this.label = label;
    this.withStore = withStore;
  }

  async readFile(path: string): Promise<Uint8Array | null> {
    const value = await this.withStore<unknown>("readonly", (store) => store.get(this.prefix + path));
    return value instanceof Uint8Array ? value.slice() : value instanceof ArrayBuffer ? new Uint8Array(value) : null;
  }

  async writeFile(path: string, bytes: Uint8Array): Promise<void> {
    await this.withStore("readwrite", (store) => store.put(bytes.slice(), this.prefix + path));
  }

  async listFiles(): Promise<string[]> {
    const range = IDBKeyRange.bound(this.prefix, `${this.prefix}￿`);
    const keys = await this.withStore<IDBValidKey[]>("readonly", (store) => store.getAllKeys(range));
    return keys.flatMap((key) => (typeof key === "string" ? [key.slice(this.prefix.length)] : [])).sort();
  }

  async removeFile(path: string): Promise<void> {
    await this.withStore("readwrite", (store) => store.delete(this.prefix + path));
  }
}

export class IndexedDbLineageLibraryStore implements LineageLibraryStore {
  readonly durable = true;
  private dbPromise: Promise<IDBDatabase> | null = null;

  private db(): Promise<IDBDatabase> {
    this.dbPromise ??= openLibraryDb();
    return this.dbPromise;
  }

  private async run<T>(storeName: string, mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await this.db();
    const transaction = db.transaction(storeName, mode);
    const result = requestToPromise(operation(transaction.objectStore(storeName)));
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB transaction failed"));
      transaction.onabort = () => reject(transaction.error ?? new DOMException("IndexedDB transaction aborted", "QuotaExceededError"));
    });
    return result;
  }

  async listRecords(): Promise<LineageRegistryRecord[]> {
    return (await this.run<LineageRegistryRecord[]>(STORE_REGISTRY, "readonly", (store) => store.getAll() as IDBRequest<LineageRegistryRecord[]>)) ?? [];
  }

  async putRecord(record: LineageRegistryRecord): Promise<void> {
    await this.run(STORE_REGISTRY, "readwrite", (store) => store.put(record, record.workspaceId));
  }

  async getActiveWorkspaceId(): Promise<string | null> {
    const value = await this.run<unknown>(STORE_META, "readonly", (store) => store.get(META_ACTIVE));
    return typeof value === "string" ? value : null;
  }

  async setActiveWorkspaceId(workspaceId: string | null): Promise<void> {
    if (workspaceId === null) {
      await this.run(STORE_META, "readwrite", (store) => store.delete(META_ACTIVE));
    } else {
      await this.run(STORE_META, "readwrite", (store) => store.put(workspaceId, META_ACTIVE));
    }
  }

  async readSession(workspaceId: string): Promise<LineageLocalSession | null> {
    const value = await this.run<unknown>(STORE_SESSIONS, "readonly", (store) => store.get(workspaceId));
    return typeof value === "object" && value !== null ? (value as LineageLocalSession) : null;
  }

  async writeSession(session: LineageLocalSession): Promise<void> {
    await this.run(STORE_SESSIONS, "readwrite", (store) => store.put(session, session.workspaceId));
  }

  async clearSession(workspaceId: string): Promise<void> {
    await this.run(STORE_SESSIONS, "readwrite", (store) => store.delete(workspaceId));
  }

  async readPreservedLegacySnapshot(): Promise<PreservedLegacySnapshot | null> {
    const value = await this.run<unknown>(STORE_META, "readonly", (store) => store.get(META_PRESERVED));
    return typeof value === "object" && value !== null ? (value as PreservedLegacySnapshot) : null;
  }

  async writePreservedLegacySnapshot(snapshot: PreservedLegacySnapshot | null): Promise<void> {
    if (snapshot === null) {
      await this.run(STORE_META, "readwrite", (store) => store.delete(META_PRESERVED));
    } else {
      await this.run(STORE_META, "readwrite", (store) => store.put(snapshot, META_PRESERVED));
    }
  }

  async readFolderHandle(workspaceId: string): Promise<FolderDirectoryHandle | null> {
    const value = await this.run<unknown>(STORE_META, "readonly", (store) => store.get(HANDLE_KEY_PREFIX + workspaceId));
    return typeof value === "object" && value !== null && "getDirectoryHandle" in value ? (value as FolderDirectoryHandle) : null;
  }

  async writeFolderHandle(workspaceId: string, handle: FolderDirectoryHandle): Promise<void> {
    await this.run(STORE_META, "readwrite", (store) => store.put(handle, HANDLE_KEY_PREFIX + workspaceId));
  }

  browserDirectory(workspaceId: string, label: string): LineageDirectory {
    return new IndexedDbLineageDirectory(workspaceId, label, (mode, operation) => this.run(STORE_FILES, mode, operation));
  }
}

export function createDefaultLineageLibraryStore(): LineageLibraryStore {
  if (typeof indexedDB === "undefined") {
    return new MemoryLineageLibraryStore({ durable: false });
  }
  return new IndexedDbLineageLibraryStore();
}

/** Folder (File System Access API) directory adapter. */
export class FolderLineageDirectory implements LineageDirectory {
  readonly kind = "folder" as const;
  readonly label: string;
  private readonly root: FolderDirectoryHandle;

  constructor(root: FolderDirectoryHandle) {
    this.root = root;
    this.label = root.name;
  }

  private async parentFor(path: string, create: boolean): Promise<{ directory: FolderDirectoryHandle; name: string } | null> {
    const segments = path.split("/");
    const name = segments.pop();
    if (name === undefined || name.length === 0) {
      return null;
    }
    let directory = this.root;
    for (const segment of segments) {
      try {
        directory = await directory.getDirectoryHandle(segment, { create });
      } catch (error) {
        if (!create && error instanceof DOMException && error.name === "NotFoundError") {
          return null;
        }
        throw error;
      }
    }
    return { directory, name };
  }

  async readFile(path: string): Promise<Uint8Array | null> {
    const parent = await this.parentFor(path, false);
    if (parent === null) {
      return null;
    }
    try {
      const handle = await parent.directory.getFileHandle(parent.name);
      return new Uint8Array(await (await handle.getFile()).arrayBuffer());
    } catch (error) {
      if (error instanceof DOMException && (error.name === "NotFoundError" || error.name === "TypeMismatchError")) {
        return null;
      }
      throw error;
    }
  }

  async writeFile(path: string, bytes: Uint8Array): Promise<void> {
    const parent = await this.parentFor(path, true);
    if (parent === null) {
      throw new Error(`Invalid path: ${path}`);
    }
    const handle = await parent.directory.getFileHandle(parent.name, { create: true });
    const writable = await handle.createWritable();
    try {
      await writable.write(bytes);
      await writable.close();
    } catch (error) {
      await writable.abort?.();
      throw error;
    }
  }

  async listFiles(): Promise<string[]> {
    const result: string[] = [];
    const walk = async (directory: FolderDirectoryHandle, prefix: string): Promise<void> => {
      if (directory.values === undefined) {
        return;
      }
      for await (const entry of directory.values()) {
        if ("getDirectoryHandle" in entry) {
          await walk(entry, `${prefix}${entry.name}/`);
        } else {
          result.push(`${prefix}${entry.name}`);
        }
      }
    };
    await walk(this.root, "");
    return result.sort();
  }

  async removeFile(path: string): Promise<void> {
    const parent = await this.parentFor(path, false);
    await parent?.directory.removeEntry?.(parent.name);
  }
}

interface DirectoryPickerWindow {
  showDirectoryPicker?: (options?: { id?: string; mode?: "read" | "readwrite" }) => Promise<FolderDirectoryHandle>;
}

export function isDirectoryAccessSupported(): boolean {
  return typeof window !== "undefined" && typeof (window as unknown as DirectoryPickerWindow).showDirectoryPicker === "function";
}

export async function pickLineageFolder(): Promise<FolderDirectoryHandle | null> {
  const picker = (window as unknown as DirectoryPickerWindow).showDirectoryPicker;
  if (picker === undefined) {
    return null;
  }
  try {
    return await picker({ id: "epe-workspace", mode: "readwrite" });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return null;
    }
    throw error;
  }
}

export async function ensureFolderPermission(handle: FolderDirectoryHandle, request: boolean): Promise<"granted" | "denied" | "prompt"> {
  if (typeof handle.queryPermission !== "function") {
    return "granted";
  }
  const current = await handle.queryPermission({ mode: "readwrite" });
  if (current === "granted" || !request || typeof handle.requestPermission !== "function") {
    return current;
  }
  return handle.requestPermission({ mode: "readwrite" });
}
