import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appActions, appReducer, createEmptyWorkspaceState, createSampleNetworkState, isWorkspaceEmpty, type AppState } from "../store";
import {
  FolderLineageDirectory,
  MemoryLineageLibraryStore,
  type FolderDirectoryHandle,
  type FolderFileHandle
} from "../app/lib/lineage/lineageLibrary";
import { LineageSessionController } from "../app/lib/lineage/lineageSessionController";
import { LineageRepository } from "../app/lib/lineage/lineageRepository";
import { describeLineageSaveStatus } from "../app/lib/lineage/lineageStatus";
import { advanceWorkspaceSessionToken, resetWorkspaceSessionGateForTests } from "../app/lib/workspaceSessionGate";

/** In-memory File System Access directory handle with permission simulation. */
class FakeDirectoryHandle implements FolderDirectoryHandle {
  readonly kind = "directory" as const;
  readonly name: string;
  permission: "granted" | "denied" | "prompt" = "granted";
  failWrites = false;
  readonly directories = new Map<string, FakeDirectoryHandle>();
  readonly files = new Map<string, Uint8Array>();

  constructor(name: string) {
    this.name = name;
  }

  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FolderDirectoryHandle> {
    let directory = this.directories.get(name);
    if (directory === undefined) {
      if (options?.create !== true) {
        return Promise.reject(new DOMException("missing", "NotFoundError"));
      }
      directory = new FakeDirectoryHandle(name);
      directory.permission = this.permission;
      this.directories.set(name, directory);
    }
    return Promise.resolve(directory);
  }

  getFileHandle(name: string, options?: { create?: boolean }): Promise<FolderFileHandle> {
    if (!this.files.has(name) && options?.create !== true) {
      return Promise.reject(new DOMException("missing", "NotFoundError"));
    }
    const files = this.files;
    const isWritable = (): boolean => this.permission === "granted" && !this.failWrites;
    return Promise.resolve({
      kind: "file" as const,
      name,
      getFile: () => {
        const bytes = files.get(name) ?? new Uint8Array();
        return Promise.resolve({ arrayBuffer: () => Promise.resolve(bytes.slice().buffer) });
      },
      createWritable: () => {
        if (!isWritable()) {
          return Promise.reject(new DOMException("denied", "NotAllowedError"));
        }
        let buffer = new Uint8Array();
        return Promise.resolve({
          write: (data: Uint8Array | Blob) => {
            buffer = ArrayBuffer.isView(data) ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength).slice() : new Uint8Array();
            return Promise.resolve();
          },
          close: () => {
            files.set(name, buffer);
            return Promise.resolve();
          }
        });
      }
    });
  }

  removeEntry(name: string): Promise<void> {
    this.files.delete(name);
    return Promise.resolve();
  }

  async *values(): AsyncIterable<FolderDirectoryHandle | FolderFileHandle> {
    for (const directory of this.directories.values()) {
      yield directory;
    }
    for (const name of this.files.keys()) {
      yield await this.getFileHandle(name);
    }
  }

  queryPermission(): Promise<"granted" | "denied" | "prompt"> {
    return Promise.resolve(this.permission);
  }

  requestPermission(): Promise<"granted" | "denied" | "prompt"> {
    return Promise.resolve(this.permission);
  }

  deepCopy(name = this.name): FakeDirectoryHandle {
    const copy = new FakeDirectoryHandle(name);
    for (const [fileName, bytes] of this.files) {
      copy.files.set(fileName, bytes.slice());
    }
    for (const [directoryName, directory] of this.directories) {
      copy.directories.set(directoryName, directory.deepCopy());
    }
    return copy;
  }
}

class FakeHost {
  state: AppState;
  constructor(state: AppState) {
    this.state = state;
  }
  getState = (): AppState => this.state;
  replaceState = (state: AppState): void => {
    this.state = state;
  };
  resetHistory = (): void => undefined;
  isWorkspaceEmpty = (state: AppState): boolean => isWorkspaceEmpty(state);
  downloadBytes = (): boolean => true;
}

function named(state: AppState, name: string): AppState {
  const id = state.networks.allIds[0]!;
  return appReducer(state, appActions.updateNetwork(id, name, state.networks.byId[id]!.technicalId, "2026-10-01T08:00:00.000Z"));
}

function networkName(state: AppState): string | undefined {
  const id = state.networks.allIds[0];
  return id === undefined ? undefined : state.networks.byId[id]?.name;
}

let pickerResult: FakeDirectoryHandle | null = null;

describe("folder-backed named workspaces", () => {
  beforeEach(() => {
    resetWorkspaceSessionGateForTests();
    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      value: vi.fn(() => (pickerResult === null ? Promise.reject(new DOMException("cancel", "AbortError")) : Promise.resolve(pickerResult)))
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(window, "showDirectoryPicker");
    pickerResult = null;
  });

  it("writes both lineages under a common parent and reopens the copied parent folder in a clean browser", async () => {
    const parent = new FakeDirectoryHandle("Projets");
    const host = new FakeHost(createSampleNetworkState());
    const controller = new LineageSessionController(new MemoryLineageLibraryStore({ durable: true }), host, { deviceLabel: "PC-A" });
    await controller.initialize();
    expect(controller.getSnapshot().directoryAccessSupported).toBe(true);

    pickerResult = parent;
    expect((await controller.createLineage({ displayName: "Série", start: "current", storage: "folder", emptyState: createEmptyWorkspaceState() })).ok).toBe(true);
    host.state = named(host.state, "Serie v1");
    await controller.createVersion({ title: "Livraison", comment: "", operationId: "op_1" });
    expect(controller.getSnapshot().save.durability).toBe("disk-verified");
    expect((await controller.createLineage({ displayName: "Protos", start: "empty", storage: "folder", emptyState: createEmptyWorkspaceState() })).ok).toBe(true);
    host.state = named(createSampleNetworkState(), "Proto draft");
    await controller.saveNow();

    const serieFolder = parent.directories.get("serie")!;
    expect([...serieFolder.files.keys()].sort()).toEqual(["serie-travail.epe.json", "workspace-manifest.json"]);
    expect([...serieFolder.directories.get("Versions")!.files.keys()][0]).toMatch(/^serie-v001-livraison-[a-z0-9]{6}\.epe\.json$/);
    expect(parent.directories.has("protos")).toBe(true);

    // Another computer: copy of the parent folder, empty browser library.
    const copiedParent = parent.deepCopy("Projets (copie)");
    const otherHost = new FakeHost(createEmptyWorkspaceState());
    const other = new LineageSessionController(new MemoryLineageLibraryStore({ durable: true }), otherHost, { deviceLabel: "PC-B" });
    await other.initialize();
    pickerResult = copiedParent;
    const opened = await other.openFolder();
    expect(opened.ok && opened.value.opened).toHaveLength(2);
    const records = other.getSnapshot().records;
    expect(records.map((record) => record.displayName)).toEqual(["Protos", "Série"]);

    await other.switchTo(records.find((record) => record.displayName === "Série")!.workspaceId);
    expect(networkName(otherHost.state)).toBe("Serie v1");
    expect(other.getSnapshot().active?.manifest?.versions).toHaveLength(1);
    await other.switchTo(records.find((record) => record.displayName === "Protos")!.workspaceId);
    expect(networkName(otherHost.state)).toBe("Proto draft");
  });

  it("never reports a disk save when folder permission is revoked", async () => {
    const parent = new FakeDirectoryHandle("Projets");
    const host = new FakeHost(createSampleNetworkState());
    const controller = new LineageSessionController(new MemoryLineageLibraryStore({ durable: true }), host);
    await controller.initialize();
    pickerResult = parent;
    await controller.createLineage({ displayName: "Série", start: "current", storage: "folder", emptyState: createEmptyWorkspaceState() });
    const folder = parent.directories.get("serie")!;
    folder.failWrites = true;

    const previous = host.state;
    host.state = named(host.state, "after revoke");
    controller.notifyStateChanged(previous, host.state);
    const result = await controller.saveNow();
    expect(result.ok).toBe(false);
    const save = controller.getSnapshot().save;
    expect(save.error).not.toBeNull();
    expect(save.dirty).toBe(true);
    expect(save.localRecovery).toBe("cached");
    const status = describeLineageSaveStatus(controller.getSnapshot());
    expect(status.tone).toBe("danger");
    expect(status.label).not.toMatch(/Saved to folder/);
  });

  it("copies a snapshot of a folder workspace without write access and leaves the folder untouched", async () => {
    const parent = new FakeDirectoryHandle("Projets");
    const host = new FakeHost(createSampleNetworkState());
    const controller = new LineageSessionController(new MemoryLineageLibraryStore({ durable: true }), host);
    await controller.initialize();
    pickerResult = parent;
    await controller.createLineage({ displayName: "Série", start: "current", storage: "folder", emptyState: createEmptyWorkspaceState() });
    const folder = parent.directories.get("serie")!;
    folder.failWrites = true;
    folder.permission = "denied";
    const filesBefore = new Map([...folder.files.entries()].map(([name, bytes]) => [name, new TextDecoder().decode(bytes)]));

    const previous = host.state;
    host.state = named(host.state, "unsaved before copy");
    controller.notifyStateChanged(previous, host.state);
    const saveBefore = controller.getSnapshot().save;

    const result = controller.copySnapshot();
    expect(result.ok).toBe(true);
    expect(result.ok && result.value.fileName).toMatch(/^serie-copy-.*\.epe\.json$/);
    expect(controller.getSnapshot().save).toEqual(saveBefore);
    expect(new Map([...folder.files.entries()].map(([name, bytes]) => [name, new TextDecoder().decode(bytes)]))).toEqual(filesBefore);
  });

  it("keeps the newly initialized child repository when handle readback is unavailable", async () => {
    const library = new MemoryLineageLibraryStore({ durable: true });
    vi.spyOn(library, "readFolderHandle").mockResolvedValue(null);
    const host = new FakeHost(createSampleNetworkState());
    const controller = new LineageSessionController(library, host);
    await controller.initialize();
    pickerResult = new FakeDirectoryHandle("Projects");
    expect((await controller.createLineage({ displayName: "Fresh", start: "current", storage: "folder", emptyState: createEmptyWorkspaceState() })).ok).toBe(true);
    expect(controller.getSnapshot().active?.manifest).not.toBeNull();
    host.state = named(host.state, "immediate edit");
    expect((await controller.saveNow()).ok).toBe(true);
    controller.dispose();
  });

  it("does not overwrite an advanced disk head when reconnecting dirty edits", async () => {
    const library = new MemoryLineageLibraryStore({ durable: true });
    const host = new FakeHost(createSampleNetworkState());
    const controller = new LineageSessionController(library, host);
    await controller.initialize();
    pickerResult = new FakeDirectoryHandle("Projects");
    await controller.createLineage({ displayName: "Fresh", start: "current", storage: "folder", emptyState: createEmptyWorkspaceState() });
    const folder = pickerResult.directories.get("fresh")!;
    const other = new LineageRepository(new FolderLineageDirectory(folder));
    await other.open();
    await other.saveWorking(named(host.state, "external edit"));
    const diskBytes = folder.files.get("fresh-travail.epe.json")!.slice();
    const previous = host.state;
    host.state = named(host.state, "local edit");
    controller.notifyStateChanged(previous, host.state);
    await controller.relinkFolder();
    expect((await controller.saveNow()).ok).toBe(false);
    expect(folder.files.get("fresh-travail.epe.json")).toEqual(diskBytes);
    expect(networkName(host.state)).toBe("local edit");
    expect(controller.getSnapshot().save.conflict).toBe(true);
    controller.dispose();
  });

  async function setupFolder(start: "current" | "empty" = "current") {
    const library = new MemoryLineageLibraryStore({ durable: true });
    const host = new FakeHost(createSampleNetworkState());
    const controller = new LineageSessionController(library, host);
    await controller.initialize();
    const parent = new FakeDirectoryHandle("Projects");
    pickerResult = parent;
    expect((await controller.createLineage({ displayName: "Fresh", start, storage: "folder", emptyState: createEmptyWorkspaceState() })).ok).toBe(true);
    return { library, host, controller, parent, folder: parent.directories.get("fresh")!, id: controller.getSnapshot().active!.workspaceId };
  }

  it.each(["current", "empty"] as const)("reloads a persisted child and saves edits after %s creation", async (start) => {
    const { controller, library, host, folder, id } = await setupFolder(start);
    controller.dispose();
    const reloaded = new LineageSessionController(library, host);
    await reloaded.initialize();
    expect(reloaded.getSnapshot().active?.workspaceId).toBe(id);
    host.state = named(createSampleNetworkState(), "after reload");
    expect((await reloaded.saveNow()).ok).toBe(true);
    const disk = new LineageRepository(new FolderLineageDirectory(folder));
    await disk.open();
    expect(networkName(disk.getWorking().state)).toBe("after reload");
    expect(disk.getManifest().workspaceId).toBe(id);
    reloaded.dispose();
  });

  it.each(["root", "parent"])("reconnects the selected %s without saving dirty content, then saves and autosaves", async (selection) => {
    const { controller, library, host, parent, folder, id } = await setupFolder();
    const previous = host.state;
    host.state = named(host.state, "unsaved");
    controller.notifyStateChanged(previous, host.state);
    const bytes = folder.files.get("fresh-travail.epe.json")!.slice();
    pickerResult = selection === "root" ? folder : parent;
    expect((await controller.relinkFolder(true)).ok).toBe(true);
    expect(await library.readFolderHandle(id)).toBe(folder);
    expect(controller.getSnapshot().active?.folderName).toBe("fresh");
    expect(folder.files.get("fresh-travail.epe.json")).toEqual(bytes);
    expect(controller.getSnapshot().save).toMatchObject({ dirty: true, durability: "none" });
    expect((await controller.saveNow()).ok).toBe(true);
    const before = host.state;
    host.state = named(host.state, "autosaved");
    controller.notifyStateChanged(before, host.state);
    await vi.waitFor(() => expect(controller.getSnapshot().save.dirty).toBe(false), { timeout: 4000 });
    const disk = new LineageRepository(new FolderLineageDirectory(folder));
    await disk.open();
    expect(networkName(disk.getWorking().state)).toBe("autosaved");
    controller.dispose();
  });

  it.each(["prompt", "denied"] as const)("does not prompt after asynchronous stored-handle lookup (%s)", async (permission) => {
    const { controller, folder } = await setupFolder();
    folder.permission = permission;
    const request = vi.spyOn(folder, "requestPermission");
    const picker = vi.mocked(window as unknown as { showDirectoryPicker: ReturnType<typeof vi.fn> }).showDirectoryPicker;
    picker.mockClear();
    expect((await controller.relinkFolder()).ok).toBe(false);
    expect(controller.getSnapshot().save.permission).toBe(permission);
    expect(request).not.toHaveBeenCalled();
    expect(picker).not.toHaveBeenCalled();
    expect(controller.getSnapshot().busy).toBe(false);
    controller.dispose();
  });

  it.each(["missing", "lookup", "query", "stale"])("offers explicit selection after %s handle failure", async (failure) => {
    const { controller, library, folder } = await setupFolder();
    if (failure === "missing") vi.spyOn(library, "readFolderHandle").mockResolvedValue(null);
    if (failure === "lookup") vi.spyOn(library, "readFolderHandle").mockRejectedValue(new Error("lookup failed"));
    if (failure === "query") vi.spyOn(folder, "queryPermission").mockRejectedValueOnce(new DOMException("query failed", "SecurityError"));
    if (failure === "stale") vi.spyOn(folder, "getFileHandle").mockRejectedValueOnce(new DOMException("stale", "NotFoundError"));
    expect((await controller.relinkFolder()).ok).toBe(false);
    expect(controller.getSnapshot().busy).toBe(false);
    pickerResult = folder;
    expect((await controller.relinkFolder(true)).ok).toBe(true);
    controller.dispose();
  });

  it.each(["foreign", "empty", "invalid", "future", "duplicate", "corrupt-working"])("rejects %s candidates without writes or connection changes", async (kind) => {
    const { controller, library, folder, host, id } = await setupFolder();
    const copy = folder.deepCopy("candidate");
    if (kind === "foreign" || kind === "future") {
      const manifest = JSON.parse(new TextDecoder().decode(copy.files.get("workspace-manifest.json"))) as Record<string, unknown>;
      if (kind === "foreign") manifest.workspaceId = "workspace_foreign";
      else manifest.schemaVersion = 999;
      copy.files.set("workspace-manifest.json", new TextEncoder().encode(JSON.stringify(manifest)));
    }
    if (kind === "invalid") copy.files.set("workspace-manifest.json", new TextEncoder().encode("invalid"));
    if (kind === "corrupt-working") copy.files.set("fresh-travail.epe.json", new TextEncoder().encode("invalid"));
    const parent = new FakeDirectoryHandle("parent");
    if (kind === "duplicate") {
      parent.directories.set("one", copy);
      parent.directories.set("two", folder.deepCopy("second"));
    }
    pickerResult = kind === "duplicate" || kind === "empty" ? parent : copy;
    const writes = vi.spyOn(copy, "getFileHandle");
    const state = host.state;
    expect((await controller.relinkFolder(true)).ok).toBe(false);
    expect(await library.readFolderHandle(id)).toBe(folder);
    expect(host.state).toBe(state);
    expect(writes.mock.calls.some(([, options]) => options?.create)).toBe(false);
    expect(controller.getSnapshot().busy).toBe(false);
    controller.dispose();
  });

  it("leaves the old connection intact when candidate handle persistence fails", async () => {
    const { controller, library, folder, id } = await setupFolder();
    pickerResult = folder.deepCopy("copy");
    vi.spyOn(library, "writeFolderHandle").mockRejectedValue(new DOMException("full", "QuotaExceededError"));
    expect((await controller.relinkFolder(true)).ok).toBe(false);
    expect(await library.readFolderHandle(id)).toBe(folder);
    expect(controller.getSnapshot().active?.folderName).toBe("Projects/fresh");
    expect(controller.getSnapshot().busy).toBe(false);
    controller.dispose();
  });

  it("reports cancellation neutrally and distinguishes an unavailable picker", async () => {
    const { controller } = await setupFolder();
    pickerResult = null;
    expect(await controller.relinkFolder(true)).toMatchObject({ ok: false, cancelled: true });
    Reflect.deleteProperty(window, "showDirectoryPicker");
    const unavailable = await controller.relinkFolder(true);
    expect(unavailable).toMatchObject({ ok: false });
    expect(!unavailable.ok && unavailable.error).toMatch(/browser|navigateur/i);
    expect(controller.getSnapshot().busy).toBe(false);
    controller.dispose();
  });

  it("drops a delayed picker after switching workspaces and serializes repeated clicks", async () => {
    const { controller, folder, host } = await setupFolder();
    const folderId = controller.getSnapshot().active!.workspaceId;
    await controller.createLineage({ displayName: "Other", start: "empty", storage: "browser", emptyState: createEmptyWorkspaceState() });
    const otherId = controller.getSnapshot().active!.workspaceId;
    await controller.switchTo(folderId);
    let complete!: (value: FakeDirectoryHandle) => void;
    const picker = vi.fn(() => new Promise<FakeDirectoryHandle>((resolve) => { complete = resolve; }));
    Object.defineProperty(window, "showDirectoryPicker", { configurable: true, value: picker });
    const pending = controller.relinkFolder(true);
    expect(picker).toHaveBeenCalledOnce(); // before any await: activation is still available
    expect((await controller.relinkFolder(true)).ok).toBe(false);
    await controller.switchTo(otherId);
    const state = host.state;
    const save = controller.getSnapshot().save;
    complete(folder);
    expect(await pending).toMatchObject({ ok: false, cancelled: true });
    expect(controller.getSnapshot().active?.workspaceId).toBe(otherId);
    expect(controller.getSnapshot().save).toEqual(save);
    expect(host.state).toBe(state);
    controller.dispose();
  });

  it("blocks reconnect while viewing a historical version", async () => {
    const { controller } = await setupFolder();
    const version = await controller.createVersion({ title: "Frozen", comment: "", operationId: "history" });
    if (!version.ok) throw new Error(version.error);
    await controller.openHistorical(version.value.versionId);
    expect((await controller.relinkFolder(true)).ok).toBe(false);
    expect(controller.getSnapshot().historical).not.toBeNull();
    controller.returnToWorking();
    expect((await controller.relinkFolder()).ok).toBe(true);
    controller.dispose();
  });

  it("keeps both heads for explicit conflict resolution", async () => {
    const { controller, host, folder } = await setupFolder();
    const external = new LineageRepository(new FolderLineageDirectory(folder));
    await external.open();
    await external.saveWorking(named(host.state, "external"));
    const previous = host.state;
    host.state = named(host.state, "local");
    controller.notifyStateChanged(previous, host.state);
    expect((await controller.relinkFolder()).ok).toBe(false);
    const head = controller.getSnapshot().active!.manifest!.divergentHeads[0]!;
    expect((await controller.chooseWorkingHead(head.headId)).ok).toBe(true);
    expect(networkName(host.state)).toBe("local");
    expect((await controller.saveNow()).ok).toBe(true);
    const disk = new LineageRepository(new FolderLineageDirectory(folder));
    await disk.open();
    expect(networkName(disk.getWorking().state)).toBe("local");
    expect(disk.getManifest().recovery.some((entry) => entry.kind === "divergent-head")).toBe(true);
    controller.dispose();
  });

  it("preserves a cached old base across reload instead of rebasing dirty edits onto disk", async () => {
    const { controller, library, host, folder, id } = await setupFolder();
    const external = new LineageRepository(new FolderLineageDirectory(folder));
    await external.open();
    const base = external.getWorking().revisionId;
    host.state = named(host.state, "cached local");
    await library.writeSession({ workspaceId: id, stateJson: JSON.stringify(host.state), baseRevisionId: base, savedAtIso: new Date().toISOString() });
    await external.saveWorking(named(host.state, "external after cache"));
    const disk = folder.files.get("fresh-travail.epe.json")!.slice();
    controller.dispose();
    const reloaded = new LineageSessionController(library, host);
    await reloaded.initialize();
    expect((await reloaded.saveNow()).ok).toBe(false);
    expect((await reloaded.relinkFolder()).ok).toBe(false);
    expect(folder.files.get("fresh-travail.epe.json")).toEqual(disk);
    expect(networkName(host.state)).toBe("cached local");
    expect(reloaded.getSnapshot().active?.manifest?.divergentHeads.length).toBeGreaterThan(0);
    reloaded.dispose();
  });

  it("reports handle persistence failure before creating files and can retry without duplicates", async () => {
    const library = new MemoryLineageLibraryStore({ durable: true });
    const host = new FakeHost(createSampleNetworkState());
    const controller = new LineageSessionController(library, host);
    await controller.initialize();
    pickerResult = new FakeDirectoryHandle("Projects");
    vi.spyOn(library, "writeFolderHandle").mockRejectedValueOnce(new DOMException("quota", "QuotaExceededError"));
    const input = { displayName: "Fresh", start: "current" as const, storage: "folder" as const, emptyState: createEmptyWorkspaceState() };
    expect((await controller.createLineage(input)).ok).toBe(false);
    expect(await library.listRecords()).toHaveLength(0);
    expect(pickerResult.directories.get("fresh")?.files.size).toBe(0);
    expect((await controller.createLineage(input)).ok).toBe(true);
    expect(await library.listRecords()).toHaveLength(1);
    expect(pickerResult.directories.size).toBe(1);
    controller.dispose();
  });

  it("does not claim a verified save after corrupted write readback", async () => {
    const { controller, host, folder } = await setupFolder();
    const previous = host.state;
    host.state = named(host.state, "readback failure");
    controller.notifyStateChanged(previous, host.state);
    const original = folder.getFileHandle.bind(folder);
    vi.spyOn(folder, "getFileHandle").mockImplementation(async (name, options) => {
      const handle = await original(name, options);
      if (options?.create && name === "fresh-travail.epe.json") {
        const writable = await handle.createWritable();
        return { ...handle, createWritable: () => Promise.resolve({
          write: (data) => writable.write(data),
          close: async () => { await writable.close(); folder.files.set(name, new Uint8Array([0])); }
        }) };
      }
      return handle;
    });
    expect((await controller.saveNow()).ok).toBe(false);
    expect(controller.getSnapshot().save).toMatchObject({ dirty: true, durability: "none", localRecovery: "cached" });
    controller.dispose();
  });

  it("releases the saving flag when the session token changes during a save", async () => {
    const { controller, host } = await setupFolder();
    const previous = host.state;
    host.state = named(host.state, "interrupted save");
    controller.notifyStateChanged(previous, host.state);
    // The nested call falls through to the real implementation once this one-shot mock is consumed.
    vi.spyOn(LineageRepository.prototype, "saveWorking").mockImplementationOnce(async function (this: LineageRepository, state) {
      const result = await LineageRepository.prototype.saveWorking.call(this, state);
      advanceWorkspaceSessionToken();
      return result;
    });
    expect(await controller.saveNow()).toMatchObject({ ok: false, cancelled: true });
    expect(controller.getSnapshot().save.saving).toBe(false);
    expect((await controller.saveNow()).ok).toBe(true);
    expect((await controller.relinkFolder()).ok).toBe(true);
    controller.dispose();
  });

  it("reads and lists nested files through the folder adapter", async () => {
    const root = new FakeDirectoryHandle("root");
    const directory = new FolderLineageDirectory(root);
    await directory.writeFile("Handoffs/h1/files/01-plan.pdf", new Uint8Array([1, 2, 3]));
    await directory.writeFile("workspace-manifest.json", new Uint8Array([4]));
    expect(await directory.listFiles()).toEqual(["Handoffs/h1/files/01-plan.pdf", "workspace-manifest.json"]);
    expect([...(await directory.readFile("Handoffs/h1/files/01-plan.pdf"))!]).toEqual([1, 2, 3]);
    expect(await directory.readFile("Versions/missing.epe.json")).toBeNull();
  });
});
