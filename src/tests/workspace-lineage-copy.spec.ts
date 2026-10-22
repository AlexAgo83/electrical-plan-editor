import { beforeEach, describe, expect, it } from "vitest";
import type { NetworkId } from "../core/entities";
import { appActions, appReducer, createEmptyWorkspaceState, createSampleNetworkState, isWorkspaceEmpty, type AppState } from "../store";
import { MemoryLineageLibraryStore } from "../app/lib/lineage/lineageLibrary";
import { LineageSessionController } from "../app/lib/lineage/lineageSessionController";
import { buildLegacyAdoptionPreview } from "../app/lib/lineage/lineageLegacyImport";
import { parseWorkspaceFilePayload } from "../app/lib/workspaceFile";
import { resetWorkspaceSessionGateForTests } from "../app/lib/workspaceSessionGate";

class FakeHost {
  state: AppState;
  downloads: Array<{ fileName: string; bytes: Uint8Array; mimeType: string }> = [];
  downloadAvailable = true;

  constructor(state: AppState) {
    this.state = state;
  }

  getState = (): AppState => this.state;
  replaceState = (state: AppState): void => {
    this.state = state;
  };
  resetHistory = (): void => undefined;
  isWorkspaceEmpty = (state: AppState): boolean => isWorkspaceEmpty(state);
  downloadBytes = (fileName: string, bytes: Uint8Array, mimeType: string): boolean => {
    if (!this.downloadAvailable) {
      return false;
    }
    this.downloads.push({ fileName, bytes, mimeType });
    return true;
  };
}

function rename(host: FakeHost, controller: LineageSessionController, networkId: NetworkId, name: string): void {
  const previous = host.state;
  host.state = appReducer(
    previous,
    appActions.updateNetwork(networkId, name, previous.networks.byId[networkId]!.technicalId, "2026-10-22T08:00:00.000Z", undefined, {
      planRevision: "C"
    })
  );
  controller.notifyStateChanged(previous, host.state);
}

async function setupSerie() {
  const library = new MemoryLineageLibraryStore({ durable: true });
  const host = new FakeHost(createSampleNetworkState());
  const controller = new LineageSessionController(library, host, { deviceLabel: "PC-A" });
  await controller.initialize();
  const created = await controller.createLineage({ displayName: "Série A", start: "current", storage: "browser", emptyState: createEmptyWorkspaceState() });
  if (!created.ok) throw new Error(created.error);
  return { library, host, controller };
}

function decode(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

describe("Copy current workspace snapshot", () => {
  beforeEach(() => {
    resetWorkspaceSessionGateForTests();
  });

  it("downloads one portable .epe.json with every network and unsaved edits while preserving identity", async () => {
    const { controller, host } = await setupSerie();
    const [firstId, secondId] = host.state.networks.allIds;
    rename(host, controller, firstId!, "Unsaved first");
    rename(host, controller, secondId!, "Unsaved second");
    const before = controller.getSnapshot();
    const downloadsBefore = host.downloads.length;

    const result = controller.copySnapshot();
    expect(result.ok).toBe(true);
    expect(host.downloads).toHaveLength(downloadsBefore + 1);
    const download = host.downloads.at(-1)!;
    expect(download.mimeType).toBe("application/json");
    expect(download.fileName).toMatch(/^serie-a-copy-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.epe\.json$/);

    const parsed = parseWorkspaceFilePayload(decode(download.bytes));
    expect(parsed.error).toBeNull();
    expect(parsed.payload?.workspaceId).toBe(before.active?.workspaceId);
    expect(parsed.payload?.lineage).toEqual({ displayName: "Série A", slug: before.active?.slug });
    expect(parsed.payload?.working?.ancestorRevisionIds.length).toBeGreaterThan(0);
    expect(parsed.payload?.version).toBeUndefined();
    expect(parsed.state?.networks.allIds).toEqual(host.state.networks.allIds);
    expect(parsed.state?.networks.byId[firstId!]?.name).toBe("Unsaved first");
    expect(parsed.state?.networks.byId[secondId!]).toMatchObject({ name: "Unsaved second", planRevision: "C" });

    // Source/session invariants: nothing saved, relinked, versioned, registered or activated.
    const after = controller.getSnapshot();
    expect(after.save).toEqual(before.save);
    expect(after.save.dirty).toBe(true);
    expect(after.records).toEqual(before.records);
    expect(after.active?.workspaceId).toBe(before.active?.workspaceId);
    expect(after.active?.manifest?.versions).toEqual(before.active?.manifest?.versions);
    expect(after.historical).toBeNull();
  });

  it("roundtrips through the existing importers", async () => {
    const { controller, host } = await setupSerie();
    rename(host, controller, host.state.networks.allIds[0] as NetworkId, "Roundtrip");
    expect(controller.copySnapshot().ok).toBe(true);
    const download = host.downloads.at(-1)!;
    const preview = await buildLegacyAdoptionPreview([{ name: download.fileName, bytes: download.bytes }]);
    expect(preview.entries[0]).toMatchObject({
      status: "valid",
      sourceWorkspaceId: controller.getSnapshot().active?.workspaceId,
      networkCount: host.state.networks.allIds.length
    });
  });

  it("copies only the displayed frozen snapshot in historical mode and labels the filename", async () => {
    const { controller, host } = await setupSerie();
    const networkId = host.state.networks.allIds[0] as NetworkId;
    rename(host, controller, networkId, "Frozen v1");
    const created = await controller.createVersion({ title: "Livraison", comment: "", operationId: "op_1" });
    if (!created.ok) throw new Error(created.error);
    rename(host, controller, networkId, "Hidden working draft");
    expect((await controller.openHistorical(created.value.versionId)).ok).toBe(true);
    const before = controller.getSnapshot();

    expect(controller.copySnapshot().ok).toBe(true);
    const download = host.downloads.at(-1)!;
    expect(download.fileName).toMatch(/^serie-a-v001-copy-.*\.epe\.json$/);
    const text = decode(download.bytes);
    expect(text).toContain("Frozen v1");
    expect(text).not.toContain("Hidden working draft");
    const parsed = parseWorkspaceFilePayload(text);
    expect(parsed.payload?.workspaceId).toBe(before.active?.workspaceId);
    expect(parsed.payload?.working).toBeUndefined();
    expect(controller.getSnapshot().historical).toEqual(before.historical);

    controller.returnToWorking();
    expect(host.state.networks.byId[networkId]?.name).toBe("Hidden working draft");
  });

  it("reports failures truthfully and refuses without an active workspace", async () => {
    const library = new MemoryLineageLibraryStore({ durable: true });
    const host = new FakeHost(createSampleNetworkState());
    const controller = new LineageSessionController(library, host);
    await controller.initialize();
    expect(controller.copySnapshot().ok).toBe(false);

    const { controller: active, host: activeHost } = await setupSerie();
    activeHost.downloadAvailable = false;
    const before = active.getSnapshot().save;
    const result = active.copySnapshot();
    expect(result.ok).toBe(false);
    expect(active.getSnapshot().save).toEqual(before);
  });
});

describe("Copy discovery in Settings search", () => {
  it("finds Copy under Workspace storage for named workspaces only", async () => {
    const { getSettingsSections, normalizeSettingsSearch, sectionMatches } = await import("../app/components/settings/settingsSearchModel");
    const storage = (mode: "named" | "legacy") => getSettingsSections(mode).find((section) => section.id === "settings-workspace-storage")!;
    expect(storage("named").labels).toContain("Copy");
    expect(sectionMatches(storage("named"), normalizeSettingsSearch("copy"))).toBeGreaterThan(0);
    expect(storage("legacy").labels).not.toContain("Copy");
  });
});
