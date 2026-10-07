import { describe, expect, it } from "vitest";
import { appActions, appReducer, createSampleNetworkState, type AppState } from "../store";
import { MemoryLineageDirectory, encodeText, sha256Hex } from "../app/lib/lineage/lineageDirectory";
import { LINEAGE_MANIFEST_FILE_NAME } from "../app/lib/lineage/lineageFormat";
import { exportLineagePackage, normalizeArchivePath, readLineagePackage } from "../app/lib/lineage/lineagePackage";
import { reconcileLineagePackage } from "../app/lib/lineage/lineageReconcile";
import { LineageRepository } from "../app/lib/lineage/lineageRepository";
import { createZipArchive, readZipArchive } from "../app/lib/lineage/zipArchive";
import { FaultyLineageDirectory, createTestClock } from "./helpers/lineage-test-utils";

const PDF_BYTES = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37, 0x0a, 0x00, 0xff, 0x80, 0x7f, 0x0d, 0x0a]);
const BOM_BYTES = encodeText("Ref;Qty\r\nKL-1;4\r\nW-12;12\r\n");

function edited(state: AppState, name: string): AppState {
  const networkId = state.networks.allIds[0]!;
  return appReducer(state, appActions.updateNetwork(networkId, name, state.networks.byId[networkId]!.technicalId, "2026-10-01T08:00:00.000Z"));
}

function cloneDirectory(source: MemoryLineageDirectory, label: string): MemoryLineageDirectory {
  return new MemoryLineageDirectory(label, source.snapshot());
}

describe("zip archive codec", () => {
  it("round-trips arbitrary bytes", async () => {
    const archive = await createZipArchive([
      { path: "root/a.txt", bytes: encodeText("hello ".repeat(200)) },
      { path: "root/b.bin", bytes: PDF_BYTES }
    ]);
    const entries = await readZipArchive(archive);
    expect(entries.map((entry) => entry.path)).toEqual(["root/a.txt", "root/b.bin"]);
    expect(entries[1]!.bytes).toEqual(PDF_BYTES);
  });

  it("enforces limits on decoded bytes and entry counts", async () => {
    const archive = await createZipArchive([{ path: "root/big.txt", bytes: new Uint8Array(50_000) }]);
    await expect(
      readZipArchive(archive, { maxEntries: 10, maxTotalUncompressedBytes: 10_000, maxAttachmentBytes: 100_000, maxCompressionRatio: 100 })
    ).rejects.toMatchObject({ code: "limit-exceeded" });
    await expect(
      readZipArchive(archive, { maxEntries: 10, maxTotalUncompressedBytes: 1_000_000, maxAttachmentBytes: 100_000, maxCompressionRatio: 2 })
    ).rejects.toMatchObject({ code: "limit-exceeded" });
    const many = await createZipArchive([{ path: "a", bytes: PDF_BYTES }, { path: "b", bytes: PDF_BYTES }]);
    await expect(
      readZipArchive(many, { maxEntries: 1, maxTotalUncompressedBytes: 1_000, maxAttachmentBytes: 1_000, maxCompressionRatio: 100 })
    ).rejects.toMatchObject({ code: "limit-exceeded" });
  });

  it("detects forged size metadata", async () => {
    const archive = await createZipArchive([{ path: "x.txt", bytes: encodeText("abc") }], { compress: false });
    const view = new DataView(archive.buffer);
    const centralOffset = view.getUint32(archive.byteLength - 6, true);
    view.setUint32(centralOffset + 24, 2, true);
    await expect(readZipArchive(archive)).rejects.toMatchObject({ code: "malformed" });
  });
});

describe("portable lineage packages", () => {
  it("rejects unsafe archive paths", () => {
    expect(normalizeArchivePath("serie/Versions/a.epe.json")).toBe("serie/Versions/a.epe.json");
    expect(normalizeArchivePath("../evil")).toBeNull();
    expect(normalizeArchivePath("/etc/passwd")).toBeNull();
    expect(normalizeArchivePath("C:/evil")).toBeNull();
    expect(normalizeArchivePath("serie\\..\\evil")).toBeNull();
    expect(normalizeArchivePath("serie//a")).toBeNull();
  });

  it("round-trips working state, history and byte-identical handoff attachments into a clean browser", async () => {
    const source = new MemoryLineageDirectory("pc-a");
    const repository = await LineageRepository.initialize(source, { displayName: "Série", state: createSampleNetworkState() }, { now: createTestClock() });
    const v1 = await repository.createVersion(createSampleNetworkState(), { operationId: "op_1", title: "Initial" });
    const handoff = await repository.createHandoff({
      versionId: v1.versionId,
      recipient: "Supplier A",
      handoffDate: "2026-10-03",
      note: "Prototype run",
      attachments: [
        { fileName: "plan-serie.pdf", bytes: PDF_BYTES, mimeHint: "application/pdf" },
        { fileName: "bom.csv", bytes: BOM_BYTES, mimeHint: "text/csv" }
      ],
      operationId: "op_handoff"
    });
    await repository.saveWorking(edited(createSampleNetworkState(), "Current work"));

    const archive = await exportLineagePackage(source, "serie");
    const read = await readLineagePackage(archive);
    expect(read.ok).toBe(true);
    if (!read.ok) return;

    const clean = new MemoryLineageDirectory("clean-browser");
    for (const [path, bytes] of read.package.files) {
      await clean.writeFile(path, bytes);
    }
    const imported = new LineageRepository(clean);
    const opened = await imported.open();
    expect(opened.issues).toEqual([]);
    expect(opened.working.state).toEqual(repository.getWorking().state);
    expect((await imported.readVersion(v1.versionId)).state).toEqual(createSampleNetworkState());
    const verification = await imported.verifyHandoff(handoff.handoffId);
    expect(verification.complete).toBe(true);
    expect(verification.record.recipient).toBe("Supplier A");
    const pdf = await imported.readAttachment(handoff.handoffId, verification.record.attachments[0]!.attachmentId);
    expect(pdf.bytes).toEqual(PDF_BYTES);
    expect(pdf.attachment.originalFileName).toBe("plan-serie.pdf");
    expect([...(await imported.readAttachment(handoff.handoffId, verification.record.attachments[1]!.attachmentId)).bytes]).toEqual([...BOM_BYTES]);
  });

  it("fails safely on traversal, duplicates, corrupt hashes, missing working payload and future schemas", async () => {
    const source = new MemoryLineageDirectory();
    const repository = await LineageRepository.initialize(source, { displayName: "Série", state: createSampleNetworkState() });
    const v1 = await repository.createVersion(createSampleNetworkState(), { operationId: "op_1" });
    const files = source.snapshot();
    const zip = (entries: Map<string, Uint8Array>, extra: Array<{ path: string; bytes: Uint8Array }> = []) =>
      createZipArchive([...[...entries].map(([path, bytes]) => ({ path: `serie/${path}`, bytes })), ...extra]);

    expect(await readLineagePackage(await zip(files, [{ path: "serie/../evil.txt", bytes: PDF_BYTES }]))).toMatchObject({ ok: false, code: "unsafe-path" });
    expect(await readLineagePackage(await zip(files, [{ path: "serie/VERSIONS/../x", bytes: PDF_BYTES }]))).toMatchObject({ ok: false, code: "unsafe-path" });
    expect(await readLineagePackage(await zip(files, [{ path: `serie/${LINEAGE_MANIFEST_FILE_NAME.toUpperCase()}`, bytes: PDF_BYTES }]))).toMatchObject({ ok: false, code: "duplicate-path" });

    const corrupt = new Map(files);
    corrupt.set(v1.fileName, encodeText("{}"));
    expect(await readLineagePackage(await zip(corrupt))).toMatchObject({ ok: false, code: "digest-mismatch" });

    const noWorking = new Map(files);
    noWorking.delete(repository.getManifest().workingFileName);
    expect(await readLineagePackage(await zip(noWorking))).toMatchObject({ ok: false, code: "missing-working" });

    const future = new Map(files);
    const manifest = JSON.parse(new TextDecoder().decode(files.get(LINEAGE_MANIFEST_FILE_NAME))) as Record<string, unknown>;
    future.set(LINEAGE_MANIFEST_FILE_NAME, encodeText(JSON.stringify({ ...manifest, schemaVersion: 42 })));
    expect(await readLineagePackage(await zip(future))).toMatchObject({ ok: false, code: "future-schema" });

    expect(await readLineagePackage(encodeText("not a zip"))).toMatchObject({ ok: false, code: "not-zip" });
  });

  it("imports an identical package idempotently and never lets an older copy replace newer state", async () => {
    const local = new MemoryLineageDirectory("pc-a");
    const repository = await LineageRepository.initialize(local, { displayName: "Série", state: createSampleNetworkState() });
    await repository.createVersion(createSampleNetworkState(), { operationId: "op_1" });
    const olderArchive = await exportLineagePackage(local, "serie");
    await repository.saveWorking(edited(createSampleNetworkState(), "Newer"));
    await repository.createVersion(edited(createSampleNetworkState(), "Newer"), { operationId: "op_2" });
    const sameArchive = await exportLineagePackage(local, "serie");

    const same = await readLineagePackage(sameArchive);
    if (!same.ok) throw new Error(same.message);
    const firstReport = await reconcileLineagePackage(repository, same.package, "same copy");
    expect(firstReport.addedVersionIds).toEqual([]);
    expect(firstReport.working).toBe("same");
    const secondReport = await reconcileLineagePackage(repository, same.package, "same copy");
    expect(secondReport).toEqual(firstReport);

    const older = await readLineagePackage(olderArchive);
    if (!older.ok) throw new Error(older.message);
    const olderReport = await reconcileLineagePackage(repository, older.package, "old copy");
    expect(olderReport.working).toBe("kept-local");
    expect(repository.getWorking().state.networks.byId[repository.getWorking().state.networks.allIds[0]!]?.name).toBe("Newer");
    expect(repository.getManifest().versions).toHaveLength(2);
  });

  it("fast-forwards only proven ancestry", async () => {
    const pcA = new MemoryLineageDirectory("pc-a");
    const repoA = await LineageRepository.initialize(pcA, { displayName: "Série", state: createSampleNetworkState() });
    const pcB = cloneDirectory(pcA, "pc-b");
    const repoB = new LineageRepository(pcB);
    await repoB.open();
    await repoB.saveWorking(edited(createSampleNetworkState(), "Edited on B"));
    const fromB = await readLineagePackage(await exportLineagePackage(pcB, "serie"));
    if (!fromB.ok) throw new Error(fromB.message);
    const report = await reconcileLineagePackage(repoA, fromB.package, "PC B");
    expect(report.working).toBe("fast-forward");
    expect(repoA.getWorking().revisionId).toBe(repoB.getWorking().revisionId);
  });

  it("retains two offline v006 variants, requires a head choice and continues with v007", async () => {
    const pcA = new MemoryLineageDirectory("pc-a");
    const repoA = await LineageRepository.initialize(pcA, { displayName: "Série", state: createSampleNetworkState() }, { deviceLabel: "PC-A" });
    for (let index = 1; index <= 5; index += 1) {
      await repoA.createVersion(edited(createSampleNetworkState(), `v${index}`), { operationId: `op_${index}` });
    }
    const pcB = cloneDirectory(pcA, "pc-b");
    const repoB = new LineageRepository(pcB, { deviceLabel: "PC-B" });
    await repoB.open();

    const a6 = await repoA.createVersion(edited(createSampleNetworkState(), "A6"), { operationId: "op_a6" });
    const b6 = await repoB.createVersion(edited(createSampleNetworkState(), "B6"), { operationId: "op_b6" });
    expect([a6.displayNumber, b6.displayNumber]).toEqual([6, 6]);

    const fromB = await readLineagePackage(await exportLineagePackage(pcB, "serie"));
    if (!fromB.ok) throw new Error(fromB.message);
    const report = await reconcileLineagePackage(repoA, fromB.package, "PC B");
    expect(report.addedVersionIds).toEqual([b6.versionId]);
    expect(report.working).toBe("divergent");
    expect(repoA.getManifest().versions.filter((entry) => entry.displayNumber === 6)).toHaveLength(2);
    expect(repoA.getManifest().divergentHeads).toHaveLength(1);

    const reopened = await new LineageRepository(pcA).open();
    expect(reopened.issues).toContainEqual({ kind: "divergent-heads", count: 1 });

    const headId = repoA.getManifest().divergentHeads[0]!.headId;
    const chosen = await repoA.chooseWorkingHead(headId);
    expect(chosen.state.networks.byId[chosen.state.networks.allIds[0]!]?.name).toBe("B6");
    expect(repoA.getManifest().divergentHeads).toHaveLength(0);
    expect(repoA.getManifest().recovery.some((entry) => entry.kind === "divergent-head")).toBe(true);

    const v7 = await repoA.createVersion(chosen.state, { operationId: "op_7" });
    expect(v7.displayNumber).toBe(7);
    expect(v7.parentVersionId).toBe(b6.versionId);

    const again = await reconcileLineagePackage(repoA, fromB.package, "PC B");
    expect(again.addedVersionIds).toEqual([]);
  });

  it("quarantines same-ID different-content objects instead of overwriting", async () => {
    const local = new MemoryLineageDirectory();
    const repository = await LineageRepository.initialize(local, { displayName: "Série", state: createSampleNetworkState() });
    const v1 = await repository.createVersion(createSampleNetworkState(), { operationId: "op_1" });
    const original = await local.readFile(v1.fileName);

    const forged = cloneDirectory(local, "forged");
    const tamperedBytes = encodeText(new TextDecoder().decode(original!).replace(/"title": ""/, '"title": "tampered"'));
    await forged.writeFile(v1.fileName, tamperedBytes);
    const manifestRaw = new TextDecoder().decode((await forged.readFile(LINEAGE_MANIFEST_FILE_NAME))!);
    await forged.writeFile(
      LINEAGE_MANIFEST_FILE_NAME,
      encodeText(manifestRaw.replace(v1.contentDigest, await sha256Hex(tamperedBytes)))
    );
    const read = await readLineagePackage(await exportLineagePackage(forged, "serie"));
    if (!read.ok) throw new Error(read.message);
    const report = await reconcileLineagePackage(repository, read.package, "forged");
    expect(report.quarantinedVersionIds).toEqual([v1.versionId]);
    expect(await local.readFile(v1.fileName)).toEqual(original);
    expect(repository.getManifest().recovery.some((entry) => entry.kind === "quarantine")).toBe(true);
  });
});

describe("supplier handoff archives", () => {
  it("does not publish an apparently complete handoff when attachment storage fails, and retries cleanly", async () => {
    const directory = new FaultyLineageDirectory();
    const repository = await LineageRepository.initialize(directory, { displayName: "Protos", state: createSampleNetworkState() });
    const v1 = await repository.createVersion(createSampleNetworkState(), { operationId: "op_1" });
    const versionBytes = await directory.readFile(v1.fileName);
    directory.failWrites((path) => path.includes("/files/02-"));
    const input = {
      versionId: v1.versionId,
      recipient: "Supplier A",
      handoffDate: "2026-10-04",
      attachments: [
        { fileName: "plan.pdf", bytes: PDF_BYTES },
        { fileName: "bom.csv", bytes: BOM_BYTES }
      ],
      operationId: "op_h"
    };
    await expect(repository.createHandoff(input)).rejects.toBeDefined();
    expect(repository.getManifest().handoffs).toHaveLength(0);
    expect(await directory.readFile(v1.fileName)).toEqual(versionBytes);

    const entry = await repository.createHandoff(input);
    expect(entry.attachmentCount).toBe(2);
    expect((await repository.createHandoff(input)).handoffId).toBe(entry.handoffId);
    expect(repository.getManifest().handoffs).toHaveLength(1);
  });

  it("records a handoff without attachments and supersedes instead of overwriting", async () => {
    const directory = new MemoryLineageDirectory();
    const repository = await LineageRepository.initialize(directory, { displayName: "Protos", state: createSampleNetworkState() });
    const v1 = await repository.createVersion(createSampleNetworkState(), { operationId: "op_1" });
    const first = await repository.createHandoff({ versionId: v1.versionId, recipient: "Supplier A", handoffDate: "2026-10-04", attachments: [], operationId: "op_h1" });
    const firstRecord = await directory.readFile(first.recordPath);
    const correction = await repository.createHandoff({
      versionId: v1.versionId,
      recipient: "Supplier A",
      handoffDate: "2026-10-05",
      note: "Corrected BOM",
      attachments: [{ fileName: "bom.csv", bytes: BOM_BYTES }],
      supersedesHandoffId: first.handoffId,
      operationId: "op_h2"
    });
    expect(first.attachmentCount).toBe(0);
    expect(correction.supersedesHandoffId).toBe(first.handoffId);
    expect(await directory.readFile(first.recordPath)).toEqual(firstRecord);
    expect(repository.getManifest().handoffs.map((entry) => entry.handoffId)).toEqual([first.handoffId, correction.handoffId]);
  });

  it("marks missing or corrupt attachment files visibly", async () => {
    const directory = new MemoryLineageDirectory();
    const repository = await LineageRepository.initialize(directory, { displayName: "Protos", state: createSampleNetworkState() });
    const v1 = await repository.createVersion(createSampleNetworkState(), { operationId: "op_1" });
    const entry = await repository.createHandoff({
      versionId: v1.versionId,
      recipient: "Supplier A",
      handoffDate: "2026-10-04",
      attachments: [{ fileName: "plan.pdf", bytes: PDF_BYTES }, { fileName: "bom.csv", bytes: BOM_BYTES }],
      operationId: "op_h"
    });
    const record = await repository.readHandoffRecord(entry.handoffId);
    await directory.removeFile(record.attachments[0]!.storagePath);
    await directory.writeFile(record.attachments[1]!.storagePath, encodeText("changed"));
    const verification = await repository.verifyHandoff(entry.handoffId);
    expect(verification.complete).toBe(false);
    expect(verification.attachments.map((item) => item.status)).toEqual(["missing", "corrupt"]);
    expect((await repository.readVersion(v1.versionId)).state).toEqual(createSampleNetworkState());
  });

  it("rejects handoffs that do not reference a frozen version", async () => {
    const repository = await LineageRepository.initialize(new MemoryLineageDirectory(), { displayName: "Protos", state: createSampleNetworkState() });
    await expect(
      repository.createHandoff({ versionId: "ver_unknown", recipient: "Supplier A", handoffDate: "2026-10-04", attachments: [], operationId: "op" })
    ).rejects.toMatchObject({ code: "not-found" });
  });
});
