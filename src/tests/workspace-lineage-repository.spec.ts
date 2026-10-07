import { describe, expect, it } from "vitest";
import { appActions, appReducer, createEmptyWorkspaceState, createSampleNetworkState, type AppState } from "../store";
import { MemoryLineageDirectory, decodeText, encodeText } from "../app/lib/lineage/lineageDirectory";
import { LINEAGE_MANIFEST_FILE_NAME, WORKING_PREVIOUS_RECOVERY_PATH, parseLineageManifest } from "../app/lib/lineage/lineageFormat";
import { LineageError, LineageRepository } from "../app/lib/lineage/lineageRepository";
import { FaultyLineageDirectory, createTestClock } from "./helpers/lineage-test-utils";

function renamedFirstNetwork(state: AppState, name: string): AppState {
  const networkId = state.networks.allIds[0];
  if (networkId === undefined) {
    throw new Error("sample has no network");
  }
  const network = state.networks.byId[networkId];
  if (network === undefined) {
    throw new Error("sample network missing");
  }
  return appReducer(state, appActions.updateNetwork(networkId, name, network.technicalId, "2026-10-01T08:00:00.000Z"));
}

async function createRepository(directory = new MemoryLineageDirectory(), state: AppState = createSampleNetworkState(), name = "Série") {
  return LineageRepository.initialize(directory, { displayName: name, state }, { now: createTestClock(), deviceLabel: "PC-A" });
}

describe("lineage repository commit protocol", () => {
  it("creates numbered immutable versions only on explicit request", async () => {
    const repository = await createRepository();
    const state = createSampleNetworkState();
    await repository.saveWorking(state);
    await repository.saveWorking(renamedFirstNetwork(state, "Edit 1"));
    expect(repository.getManifest().versions).toHaveLength(0);

    const v1 = await repository.createVersion(state, { operationId: "op_1", title: "Initial" });
    const v2 = await repository.createVersion(renamedFirstNetwork(state, "Edit 2"), { operationId: "op_2", comment: "second" });
    expect([v1.displayNumber, v2.displayNumber]).toEqual([1, 2]);
    expect(v2.parentVersionId).toBe(v1.versionId);
    expect(repository.getWorking().working?.baseVersionId).toBe(v2.versionId);
    expect(v1.fileName).toMatch(/^Versions\/serie-v001-initial-[a-z0-9]{6}\.epe\.json$/);
  });

  it("is idempotent per operation and never duplicates on repeated clicks", async () => {
    const repository = await createRepository();
    const state = createSampleNetworkState();
    const [first, second] = await Promise.all([
      repository.createVersion(state, { operationId: "op_same" }),
      repository.createVersion(state, { operationId: "op_same" })
    ]);
    expect(first.versionId).toBe(second.versionId);
    expect(repository.getManifest().versions).toHaveLength(1);
  });

  it.each([
    ["version snapshot", (path: string) => path.startsWith("Versions/")],
    ["manifest", (path: string) => path === LINEAGE_MANIFEST_FILE_NAME],
    ["working copy", (path: string) => path.endsWith("-travail.epe.json")]
  ])("keeps the previous committed state usable when the %s write fails, and retries without duplicates", async (_label, match) => {
    const directory = new FaultyLineageDirectory();
    const repository = await createRepository(directory as unknown as MemoryLineageDirectory);
    const state = createSampleNetworkState();
    const v1 = await repository.createVersion(state, { operationId: "op_1" });

    directory.failWrites(match);
    await expect(repository.createVersion(renamedFirstNetwork(state, "next"), { operationId: "op_2" })).rejects.toBeDefined();

    const reopened = new LineageRepository(directory, { now: createTestClock("2026-10-02T08:00:00.000Z") });
    const opened = await reopened.open();
    expect(opened.manifest.versions.some((entry) => entry.versionId === v1.versionId)).toBe(true);
    expect(opened.working.workspaceId).toBe(opened.manifest.workspaceId);
    expect((await reopened.readVersion(v1.versionId)).state).toEqual(state);

    const retried = await repository.createVersion(renamedFirstNetwork(state, "next"), { operationId: "op_2" });
    const after = await new LineageRepository(directory).open();
    expect(after.manifest.versions.filter((entry) => entry.operationId === "op_2")).toHaveLength(1);
    expect(retried.displayNumber).toBe(2);
    expect(after.issues.filter((issue) => issue.kind === "orphan-version")).toHaveLength(0);
  });

  it("reports staged orphans after an interrupted publication and adopts them", async () => {
    const directory = new FaultyLineageDirectory();
    const repository = await createRepository(directory as unknown as MemoryLineageDirectory);
    directory.failWrites((path) => path === LINEAGE_MANIFEST_FILE_NAME);
    await expect(repository.createVersion(createSampleNetworkState(), { operationId: "op_x" })).rejects.toBeDefined();

    const reopened = new LineageRepository(directory);
    const opened = await reopened.open();
    expect(opened.issues.some((issue) => issue.kind === "orphan-version")).toBe(true);
    const adopted = await reopened.adoptOrphanVersions();
    expect(adopted).toHaveLength(1);
    expect((await new LineageRepository(directory).open()).issues.some((issue) => issue.kind === "orphan-version")).toBe(false);
  });

  it("recovers an interrupted working-file replacement from the verified prior copy", async () => {
    const directory = new FaultyLineageDirectory();
    const repository = await createRepository(directory as unknown as MemoryLineageDirectory);
    const saved = await repository.saveWorking(renamedFirstNetwork(createSampleNetworkState(), "Saved"));
    expect(saved.status).toBe("saved");

    directory.failWrites((path) => path.endsWith("-travail.epe.json"), { corrupt: true });
    await expect(repository.saveWorking(renamedFirstNetwork(createSampleNetworkState(), "Lost"))).rejects.toBeInstanceOf(LineageError);

    const opened = await new LineageRepository(directory).open();
    expect(opened.issues).toContainEqual({ kind: "working-recovered-from-previous" });
    expect(opened.working.state.networks.byId[opened.working.state.networks.allIds[0]!]?.name).toBe("Saved");
    expect(await directory.readFile(WORKING_PREVIOUS_RECOVERY_PATH)).not.toBeNull();
  });

  it("never reports success when permission is revoked", async () => {
    const directory = new FaultyLineageDirectory();
    const repository = await createRepository(directory as unknown as MemoryLineageDirectory);
    directory.failWrites(() => true, { count: 10 });
    await expect(repository.saveWorking(createSampleNetworkState())).rejects.toBeDefined();
    await expect(repository.createVersion(createSampleNetworkState(), { operationId: "op_denied" })).rejects.toBeDefined();
  });

  it("detects a working copy changed by another writer", async () => {
    const directory = new MemoryLineageDirectory();
    const repository = await createRepository(directory);
    const other = new LineageRepository(directory);
    await other.open();
    await other.saveWorking(renamedFirstNetwork(createSampleNetworkState(), "Other tab"));
    const result = await repository.saveWorking(createSampleNetworkState());
    expect(result.status).toBe("conflict");
  });

  it("restores v002 after v005 by preserving displaced work, then publishes v006 with provenance", async () => {
    const repository = await createRepository();
    const base = createSampleNetworkState();
    const versions = [];
    for (let index = 1; index <= 5; index += 1) {
      versions.push(await repository.createVersion(renamedFirstNetwork(base, `State ${index}`), { operationId: `op_${index}` }));
    }
    const before = repository.getManifest().versions.map((entry) => ({ ...entry }));
    const displaced = renamedFirstNetwork(base, "Unsaved work");
    const v2 = versions[1]!;

    const restored = await repository.restoreVersion(v2.versionId, displaced);
    expect(restored.recovery.kind).toBe("pre-restore");
    const recoveryBytes = await repository.directory.readFile(restored.recovery.fileName);
    expect(decodeText(recoveryBytes!)).toContain("Unsaved work");
    expect(repository.getWorking().working?.restoredFromVersionId).toBe(v2.versionId);

    const v6 = await repository.createVersion(restored.state, { operationId: "op_6" });
    expect(v6.displayNumber).toBe(6);
    expect(v6.parentVersionId).toBe(v2.versionId);
    expect(v6.restoredFromVersionId).toBe(v2.versionId);
    expect(repository.getManifest().versions.slice(0, 5)).toEqual(before);
    for (const version of versions.slice(2)) {
      expect((await repository.readVersion(version.versionId)).entry.contentDigest).toBe(version.contentDigest);
    }
  });

  it("aborts restore without touching the working copy when the recovery write fails", async () => {
    const directory = new FaultyLineageDirectory();
    const repository = await createRepository(directory as unknown as MemoryLineageDirectory);
    const v1 = await repository.createVersion(createSampleNetworkState(), { operationId: "op_1" });
    const workingBefore = repository.getWorking().revisionId;
    directory.failWrites((path) => path.startsWith("Recovery/pre-restore"));
    await expect(repository.restoreVersion(v1.versionId, createEmptyWorkspaceState())).rejects.toBeDefined();
    const opened = await new LineageRepository(directory).open();
    expect(opened.working.revisionId).toBe(workingBefore);
  });

  it("detects corrupted version bytes on lazy read", async () => {
    const directory = new MemoryLineageDirectory();
    const repository = await createRepository(directory);
    const v1 = await repository.createVersion(createSampleNetworkState(), { operationId: "op_1" });
    await directory.writeFile(v1.fileName, encodeText("{\"tampered\":true}"));
    await expect(repository.readVersion(v1.versionId)).rejects.toMatchObject({ code: "corrupt" });
  });

  it("reconstructs the manifest from files and reports missing versions", async () => {
    const directory = new MemoryLineageDirectory();
    const repository = await createRepository(directory);
    const v1 = await repository.createVersion(createSampleNetworkState(), { operationId: "op_1" });
    const v2 = await repository.createVersion(createSampleNetworkState(), { operationId: "op_2" });
    await directory.removeFile(v2.fileName);
    const missing = await new LineageRepository(directory).open();
    expect(missing.issues).toContainEqual({ kind: "version-missing", versionId: v2.versionId, fileName: v2.fileName });

    await directory.removeFile(LINEAGE_MANIFEST_FILE_NAME);
    const reconstructed = await new LineageRepository(directory).open();
    expect(reconstructed.issues).toContainEqual({ kind: "manifest-reconstructed" });
    expect(reconstructed.manifest.versions.map((entry) => entry.versionId)).toEqual([v1.versionId]);
    expect(reconstructed.manifest.displayName).toBe("Série");
  });

  it("refuses to open a future-schema manifest without modifying it", async () => {
    const directory = new MemoryLineageDirectory();
    await createRepository(directory);
    const raw = decodeText((await directory.readFile(LINEAGE_MANIFEST_FILE_NAME))!);
    const future = raw.replace('"schemaVersion": 1', '"schemaVersion": 7');
    await directory.writeFile(LINEAGE_MANIFEST_FILE_NAME, encodeText(future));
    await expect(new LineageRepository(directory).open()).rejects.toMatchObject({ code: "future-schema" });
    expect(decodeText((await directory.readFile(LINEAGE_MANIFEST_FILE_NAME))!)).toBe(future);
  });

  it("renames without changing identity, slug or file names", async () => {
    const directory = new MemoryLineageDirectory();
    const repository = await createRepository(directory);
    await repository.createVersion(createSampleNetworkState(), { operationId: "op_1" });
    const filesBefore = await directory.listFiles();
    const manifest = await repository.rename("Faisceaux série 2027");
    expect(manifest.slug).toBe("serie");
    expect(await directory.listFiles()).toEqual(filesBefore);
    const parsed = parseLineageManifest(decodeText((await directory.readFile(LINEAGE_MANIFEST_FILE_NAME))!));
    expect(parsed.ok && parsed.manifest.displayName).toBe("Faisceaux série 2027");
  });

  it("keeps two lineages fully isolated", async () => {
    const serie = await createRepository(new MemoryLineageDirectory(), createSampleNetworkState(), "Série");
    const protos = await createRepository(new MemoryLineageDirectory(), createEmptyWorkspaceState(), "Protos");
    await serie.createVersion(createSampleNetworkState(), { operationId: "op_1" });
    expect(serie.getManifest().workspaceId).not.toBe(protos.getManifest().workspaceId);
    expect(protos.getManifest().versions).toHaveLength(0);
    expect(protos.getWorking().state).toEqual(createEmptyWorkspaceState());
  });
});
