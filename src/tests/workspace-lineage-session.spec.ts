import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appActions, appReducer, createEmptyWorkspaceState, createSampleNetworkState, isWorkspaceEmpty, type AppState } from "../store";
import { MemoryLineageLibraryStore, type LineageLocalSession } from "../app/lib/lineage/lineageLibrary";
import { LINEAGE_AUTOSAVE_DELAY_MS, LineageSessionController } from "../app/lib/lineage/lineageSessionController";
import {
  isProjectMutationBlocked,
  isWorkspacePersistenceSuspended,
  resetWorkspaceSessionGateForTests
} from "../app/lib/workspaceSessionGate";

class FakeHost {
  state: AppState;
  historyResets = 0;
  downloads: Array<{ fileName: string; bytes: Uint8Array; mimeType: string }> = [];

  constructor(state: AppState) {
    this.state = state;
  }

  getState = (): AppState => this.state;
  replaceState = (state: AppState): void => {
    this.state = state;
  };
  resetHistory = (): void => {
    this.historyResets += 1;
  };
  isWorkspaceEmpty = (state: AppState): boolean => isWorkspaceEmpty(state);
  downloadBytes = (fileName: string, bytes: Uint8Array, mimeType: string): boolean => {
    this.downloads.push({ fileName, bytes, mimeType });
    return true;
  };
}

function networkName(state: AppState): string | undefined {
  const id = state.networks.allIds[0];
  return id === undefined ? undefined : state.networks.byId[id]?.name;
}

function edit(host: FakeHost, controller: LineageSessionController, name: string): void {
  const previous = host.state;
  const id = previous.networks.allIds[0]!;
  host.state = appReducer(previous, appActions.updateNetwork(id, name, previous.networks.byId[id]!.technicalId, "2026-10-01T08:00:00.000Z"));
  controller.notifyStateChanged(previous, host.state);
}

async function setup(initial: AppState = createSampleNetworkState()) {
  const library = new MemoryLineageLibraryStore({ durable: true });
  const host = new FakeHost(initial);
  const controller = new LineageSessionController(library, host, { deviceLabel: "PC-A" });
  await controller.initialize();
  return { library, host, controller };
}

describe("named workspace session controller", () => {
  beforeEach(() => {
    resetWorkspaceSessionGateForTests();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("preserves the legacy browser workspace on first registry migration and keeps lineages independent", async () => {
    const { controller, host, library } = await setup();
    expect((await controller.createLineage({ displayName: "Série", start: "current", storage: "browser", emptyState: createEmptyWorkspaceState() })).ok).toBe(true);
    expect(await library.readPreservedLegacySnapshot()).not.toBeNull();
    const serieId = controller.getSnapshot().active!.workspaceId;
    edit(host, controller, "Serie edited");
    await controller.saveNow();

    expect((await controller.createLineage({ displayName: "Protos", start: "empty", storage: "browser", emptyState: createEmptyWorkspaceState() })).ok).toBe(true);
    const protosId = controller.getSnapshot().active!.workspaceId;
    expect(host.state).toEqual(createEmptyWorkspaceState());
    expect(controller.getSnapshot().records.map((record) => record.displayName)).toEqual(["Protos", "Série"]);

    expect((await controller.switchTo(serieId)).ok).toBe(true);
    expect(networkName(host.state)).toBe("Serie edited");
    expect((await controller.switchTo(protosId)).ok).toBe(true);
    expect(host.state).toEqual(createEmptyWorkspaceState());
    expect(host.historyResets).toBeGreaterThanOrEqual(4);
  });

  it("ordinary save never creates a version and browser mode initiates a package download", async () => {
    const { controller, host } = await setup();
    await controller.createLineage({ displayName: "Série", start: "current", storage: "browser", emptyState: createEmptyWorkspaceState() });
    edit(host, controller, "Edited");
    expect(controller.getSnapshot().save.dirty).toBe(true);
    const result = await controller.saveNow();
    expect(result.ok).toBe(true);
    const snapshot = controller.getSnapshot();
    expect(snapshot.active?.manifest?.versions).toHaveLength(0);
    expect(snapshot.save).toMatchObject({ dirty: false, durability: "browser-stored", pendingPortableExport: false });
    expect(snapshot.save.downloadInitiatedIso).not.toBeNull();
    expect(host.downloads.at(-1)?.fileName).toMatch(/^serie-.*\.zip$/);
  });

  it("drops a delayed autosave after switching so Series state never lands in Prototypes", async () => {
    vi.useFakeTimers();
    const { controller, host, library } = await setup();
    await controller.createLineage({ displayName: "Série", start: "current", storage: "browser", emptyState: createEmptyWorkspaceState() });
    const serieId = controller.getSnapshot().active!.workspaceId;
    await controller.createLineage({ displayName: "Protos", start: "empty", storage: "browser", emptyState: createEmptyWorkspaceState() });
    const protosId = controller.getSnapshot().active!.workspaceId;
    await controller.switchTo(serieId);

    edit(host, controller, "Serie pending autosave");
    const switching = controller.switchTo(protosId);
    await vi.advanceTimersByTimeAsync(LINEAGE_AUTOSAVE_DELAY_MS * 2);
    await switching;

    expect(host.state).toEqual(createEmptyWorkspaceState());
    const protosSession: LineageLocalSession | null = await library.readSession(protosId);
    expect(protosSession === null || !protosSession.stateJson.includes("Serie pending autosave")).toBe(true);
    await controller.switchTo(serieId);
    expect(networkName(host.state)).toBe("Serie pending autosave");
  });

  it("refuses to switch when unsaved work cannot be preserved", async () => {
    const { controller, host, library } = await setup();
    await controller.createLineage({ displayName: "Série", start: "current", storage: "browser", emptyState: createEmptyWorkspaceState() });
    const serieId = controller.getSnapshot().active!.workspaceId;
    await controller.createLineage({ displayName: "Protos", start: "empty", storage: "browser", emptyState: createEmptyWorkspaceState() });
    await controller.switchTo(serieId);
    edit(host, controller, "Unsaved");
    vi.spyOn(library, "writeSession").mockRejectedValue(new DOMException("full", "QuotaExceededError"));
    const directory = library.browserDirectory(serieId, "Série");
    vi.spyOn(directory, "writeFile").mockRejectedValue(new DOMException("full", "QuotaExceededError"));
    const result = await controller.switchTo(controller.getSnapshot().records.find((record) => record.workspaceId !== serieId)!.workspaceId);
    expect(result.ok).toBe(false);
    expect(networkName(host.state)).toBe("Unsaved");
    expect(controller.getSnapshot().save.durability).not.toBe("disk-verified");
    expect(controller.getSnapshot().save.localRecovery).toBe("failed");
  });

  it("consults v002 read-only after v005, blocks mutations and returns to the original working state", async () => {
    const { controller, host } = await setup();
    await controller.createLineage({ displayName: "Série", start: "current", storage: "browser", emptyState: createEmptyWorkspaceState() });
    const versionIds: string[] = [];
    for (let index = 1; index <= 5; index += 1) {
      edit(host, controller, `State ${index}`);
      const created = await controller.createVersion({ title: `M${index}`, comment: "", operationId: `op_${index}` });
      if (!created.ok) throw new Error(created.error);
      versionIds.push(created.value.versionId);
    }
    edit(host, controller, "Working draft");
    const working = host.state;

    expect((await controller.openHistorical(versionIds[1]!)).ok).toBe(true);
    expect(networkName(host.state)).toBe("State 2");
    expect(isProjectMutationBlocked()).toBe(true);
    expect(isWorkspacePersistenceSuspended()).toBe(true);
    expect(controller.getSnapshot().historical?.label).toBe("v002");
    expect((await controller.saveNow()).ok).toBe(false);
    expect((await controller.createVersion({ title: "x", comment: "", operationId: "op_blocked" })).ok).toBe(false);

    controller.returnToWorking();
    expect(host.state).toBe(working);
    expect(isProjectMutationBlocked()).toBe(false);
  });

  it("resumes from v002 after v005 preserving displaced work, then the next milestone is v006", async () => {
    const { controller, host } = await setup();
    await controller.createLineage({ displayName: "Série", start: "current", storage: "browser", emptyState: createEmptyWorkspaceState() });
    const versionIds: string[] = [];
    for (let index = 1; index <= 5; index += 1) {
      edit(host, controller, `State ${index}`);
      const created = await controller.createVersion({ title: "", comment: "", operationId: `op_${index}` });
      if (!created.ok) throw new Error(created.error);
      versionIds.push(created.value.versionId);
    }
    edit(host, controller, "Displaced draft");
    await controller.openHistorical(versionIds[1]!);
    expect((await controller.restoreFromVersion(versionIds[1]!)).ok).toBe(true);
    expect(networkName(host.state)).toBe("State 2");
    expect(isProjectMutationBlocked()).toBe(false);
    const manifest = controller.getSnapshot().active!.manifest!;
    expect(manifest.recovery.some((entry) => entry.kind === "pre-restore")).toBe(true);
    expect(manifest.versions).toHaveLength(5);
    expect(controller.getSnapshot().active?.restoredFromVersionId).toBe(versionIds[1]);

    edit(host, controller, "Continued from v002");
    const v6 = await controller.createVersion({ title: "", comment: "", operationId: "op_6" });
    expect(v6.ok && v6.value.label).toBe("v006");
    const entry = controller.getSnapshot().active!.manifest!.versions.at(-1)!;
    expect(entry.restoredFromVersionId).toBe(versionIds[1]);
  });

  it("transfers a lineage with its supplier archive into a clean browser and reconciles divergent v006", async () => {
    const pcA = await setup();
    await pcA.controller.createLineage({ displayName: "Série", start: "current", storage: "browser", emptyState: createEmptyWorkspaceState() });
    for (let index = 1; index <= 5; index += 1) {
      edit(pcA.host, pcA.controller, `S${index}`);
      await pcA.controller.createVersion({ title: "", comment: "", operationId: `op_${index}` });
    }
    const pdf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0xff, 0x00]);
    const handoff = await pcA.controller.createHandoff({
      versionId: null,
      freezeTitle: "Livraison",
      recipient: "Supplier A",
      handoffDate: "2026-10-05",
      note: "",
      attachments: [{ fileName: "plan.pdf", bytes: pdf }],
      supersedesHandoffId: null,
      operationId: "op_handoff"
    });
    expect(handoff.ok).toBe(true);
    await pcA.controller.exportPackage();
    const packageBytes = pcA.host.downloads.at(-1)!.bytes;

    const pcB = await setup(createEmptyWorkspaceState());
    const imported = await pcB.controller.importPackage("serie.zip", packageBytes);
    expect(imported.ok && imported.value.created).toBe(true);
    await pcB.controller.switchTo(pcA.controller.getSnapshot().active!.workspaceId);
    expect(pcB.host.state).toEqual(pcA.host.state);
    const handoffId = handoff.ok ? handoff.value.handoffId : "";
    const verification = await pcB.controller.verifyHandoff(handoffId);
    expect(verification.ok && verification.value.complete).toBe(true);
    await pcB.controller.downloadAttachment(handoffId, verification.ok ? verification.value.record.attachments[0]!.attachmentId : "");
    expect([...pcB.host.downloads.at(-1)!.bytes]).toEqual([...pdf]);
    expect(pcB.host.downloads.at(-1)!.mimeType).toBe("application/octet-stream");

    edit(pcA.host, pcA.controller, "A7");
    const a = await pcA.controller.createVersion({ title: "", comment: "", operationId: "op_a" });
    edit(pcB.host, pcB.controller, "B7");
    const b = await pcB.controller.createVersion({ title: "", comment: "", operationId: "op_b" });
    expect(a.ok && a.value.label).toBe("v007");
    expect(b.ok && b.value.label).toBe("v007");

    await pcB.controller.exportPackage();
    const fromB = pcB.host.downloads.at(-1)!.bytes;
    const reconciled = await pcA.controller.importPackage("from-b.zip", fromB);
    expect(reconciled.ok && reconciled.value.report?.working).toBe("divergent");
    const active = pcA.controller.getSnapshot().active!;
    expect(active.manifest!.divergentHeads).toHaveLength(1);
    expect([...active.versionLabels.values()].filter((label) => label.startsWith("v007 ·"))).toHaveLength(2);

    expect((await pcA.controller.chooseWorkingHead(active.manifest!.divergentHeads[0]!.headId)).ok).toBe(true);
    expect(networkName(pcA.host.state)).toBe("B7");
    const next = await pcA.controller.createVersion({ title: "", comment: "", operationId: "op_next" });
    expect(next.ok && next.value.label).toBe("v008");
  });
});
