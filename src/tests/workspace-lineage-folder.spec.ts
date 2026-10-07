import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appActions, appReducer, createEmptyWorkspaceState, createSampleNetworkState, isWorkspaceEmpty, type AppState } from "../store";
import {
  FolderLineageDirectory,
  MemoryLineageLibraryStore,
  type FolderDirectoryHandle,
  type FolderFileHandle
} from "../app/lib/lineage/lineageLibrary";
import { LineageSessionController } from "../app/lib/lineage/lineageSessionController";
import { describeLineageSaveStatus } from "../app/lib/lineage/lineageStatus";
import { resetWorkspaceSessionGateForTests } from "../app/lib/workspaceSessionGate";

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
