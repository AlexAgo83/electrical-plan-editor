import { describe, expect, it } from "vitest";
import { createEmptyWorkspaceState, createSampleNetworkState } from "../store";
import {
  buildWorkspaceFilePayload,
  parseWorkspaceFilePayload,
  serializeWorkspaceFilePayload,
  WORKSPACE_FILE_PAYLOAD_KIND
} from "../app/lib/workspaceFile";
import {
  allocateNextDisplayNumber,
  buildAttachmentStorageName,
  buildVersionDisplayLabels,
  buildVersionFileName,
  buildWorkingFileName,
  createLineageManifest,
  createLineageSlug,
  formatVersionNumber,
  isSafeSlug,
  parseLineageManifest,
  serializeLineageManifest,
  shortId,
  validateLineageAncestry,
  type LineageVersionEntry
} from "../app/lib/lineage/lineageFormat";

function versionEntry(overrides: Partial<LineageVersionEntry> & Pick<LineageVersionEntry, "versionId" | "displayNumber">): LineageVersionEntry {
  return {
    fileName: `Versions/x-${formatVersionNumber(overrides.displayNumber)}-${shortId(overrides.versionId)}.epe.json`,
    title: "",
    comment: "",
    createdAtIso: "2026-10-01T08:00:00.000Z",
    parentVersionId: null,
    restoredFromVersionId: null,
    revisionId: "rev_x",
    contentDigest: "digest",
    byteLength: 1,
    deviceLabel: null,
    operationId: null,
    provenanceKind: "created",
    orderingDateIso: null,
    originalFileName: null,
    ...overrides
  };
}

describe("workspace lineage format contracts", () => {
  it("builds stable safe slugs that ignore later renames", () => {
    expect(createLineageSlug("Faisceaux Série")).toBe("faisceaux-serie");
    expect(createLineageSlug("Protos")).toBe("protos");
    expect(createLineageSlug("../../etc")).toBe("etc");
    expect(createLineageSlug("***")).toBe("workspace");
    expect(createLineageSlug("Serie", ["serie", "serie-2"])).toBe("serie-3");
    expect(isSafeSlug("serie")).toBe(true);
    expect(isSafeSlug("../serie")).toBe(false);
    expect(buildWorkingFileName("serie")).toBe("serie-travail.epe.json");
  });

  it("names version files with number, label and short ID so offline duplicates never collide", () => {
    const first = buildVersionFileName("serie", 6, "Livraison fournisseur A", "ver_11111111-aaaa");
    const second = buildVersionFileName("serie", 6, "Livraison fournisseur A", "ver_22222222-bbbb");
    expect(first).toBe("Versions/serie-v006-livraison-fournisseur-a-111111.epe.json");
    expect(first).not.toBe(second);
    expect(buildVersionFileName("protos", 12, "", "ver_abcdef12")).toBe("Versions/protos-v012-abcdef.epe.json");
  });

  it("allocates max committed number + 1, never count + 1", () => {
    expect(allocateNextDisplayNumber([])).toBe(1);
    expect(allocateNextDisplayNumber([1, 2, 5])).toBe(6);
    expect(allocateNextDisplayNumber([1, 2, 3, 4, 5, 6, 6])).toBe(7);
  });

  it("disambiguates two distinct v006 entries with short IDs and device labels", () => {
    const labels = buildVersionDisplayLabels([
      versionEntry({ versionId: "ver_aaaaaa01", displayNumber: 5 }),
      versionEntry({ versionId: "ver_bbbbbb02", displayNumber: 6, deviceLabel: "PC-bureau" }),
      versionEntry({ versionId: "ver_cccccc03", displayNumber: 6, deviceLabel: "PC-atelier" })
    ]);
    expect(labels.get("ver_aaaaaa01")).toBe("v005");
    expect(labels.get("ver_bbbbbb02")).toBe("v006 · bbbbbb · PC-bureau");
    expect(labels.get("ver_cccccc03")).toBe("v006 · cccccc · PC-atelier");
  });

  it("validates ancestry without fabricating parents", () => {
    const issues = validateLineageAncestry([
      versionEntry({ versionId: "ver_1", displayNumber: 1 }),
      versionEntry({ versionId: "ver_2", displayNumber: 2, parentVersionId: "ver_1" }),
      versionEntry({ versionId: "ver_3", displayNumber: 3, parentVersionId: "ver_missing" }),
      versionEntry({ versionId: "ver_4", displayNumber: 4, parentVersionId: "ver_2", restoredFromVersionId: "ver_gone" })
    ]);
    expect(issues).toEqual([
      { versionId: "ver_3", kind: "unknown-parent" },
      { versionId: "ver_4", kind: "unknown-restore-source" }
    ]);
  });

  it("round-trips a manifest and rejects future or malformed schemas", () => {
    const manifest = createLineageManifest({ workspaceId: "workspace_1", displayName: "Série", slug: "serie", nowIso: "2026-10-01T08:00:00.000Z" });
    manifest.versions.push(versionEntry({ versionId: "ver_1", displayNumber: 1 }));
    const parsed = parseLineageManifest(serializeLineageManifest(manifest));
    expect(parsed.ok && parsed.manifest).toEqual(manifest);

    const future = parseLineageManifest(JSON.stringify({ ...manifest, schemaVersion: 99 }));
    expect(future.ok ? null : future.errorKind).toBe("future-schema");
    const unsafe = parseLineageManifest(JSON.stringify({ ...manifest, slug: "../evil" }));
    expect(unsafe.ok ? null : unsafe.errorKind).toBe("malformed");
    expect(parseLineageManifest("{").ok).toBe(false);
  });

  it("keeps identity and complete state, including empty workspaces, through schema 2 round-trips", () => {
    for (const state of [createSampleNetworkState(), createEmptyWorkspaceState()]) {
      const payload = buildWorkspaceFilePayload(state, null, "2026-10-01T08:00:00.000Z");
      payload.lineage = { displayName: "Série", slug: "serie" };
      payload.working = { baseVersionId: null, restoredFromVersionId: null, ancestorRevisionIds: [] };
      const parsed = parseWorkspaceFilePayload(serializeWorkspaceFilePayload(payload));
      expect(parsed.error).toBeNull();
      expect(parsed.payload?.workspaceId).toBe(payload.workspaceId);
      expect(parsed.payload?.lineage).toEqual({ displayName: "Série", slug: "serie" });
      expect(parsed.state).toEqual(state);
    }
  });

  it("changes technical revisions on ordinary saves without creating a version", () => {
    const first = buildWorkspaceFilePayload(createSampleNetworkState(), null);
    first.lineage = { displayName: "Série", slug: "serie" };
    const second = buildWorkspaceFilePayload(createSampleNetworkState(), first);
    const third = buildWorkspaceFilePayload(createSampleNetworkState(), second);
    expect(new Set([first.revisionId, second.revisionId, third.revisionId]).size).toBe(3);
    expect(third.version).toBeUndefined();
    expect(third.working?.ancestorRevisionIds.slice(0, 2)).toEqual([second.revisionId, first.revisionId]);
  });

  it("still parses schema 1 files and refuses future schemas without returning state", () => {
    const v1 = { ...buildWorkspaceFilePayload(createSampleNetworkState(), null), schemaVersion: 1 };
    expect(parseWorkspaceFilePayload(JSON.stringify(v1)).error).toBeNull();

    const future = parseWorkspaceFilePayload(JSON.stringify({ ...v1, payloadKind: WORKSPACE_FILE_PAYLOAD_KIND, schemaVersion: 3 }));
    expect(future.errorKind).toBe("future-schema");
    expect(future.state).toBeNull();

    const badVersion = parseWorkspaceFilePayload(JSON.stringify({ ...v1, schemaVersion: 2, version: { versionId: 5 } }));
    expect(badVersion.errorKind).toBe("malformed");
  });

  it("makes version documents standalone with identity and provenance", () => {
    const payload = buildWorkspaceFilePayload(createSampleNetworkState(), null, "2026-10-01T08:00:00.000Z");
    payload.lineage = { displayName: "Protos", slug: "protos" };
    payload.version = {
      versionId: "ver_1",
      displayNumber: 3,
      parentVersionId: "ver_0",
      restoredFromVersionId: null,
      title: "Proto B",
      comment: "Envoi Supplier A",
      createdAtIso: "2026-10-01T08:00:00.000Z",
      deviceLabel: "PC-1",
      operationId: "op_1",
      provenance: { kind: "created" }
    };
    const parsed = parseWorkspaceFilePayload(serializeWorkspaceFilePayload(payload));
    expect(parsed.payload?.version).toEqual(payload.version);
    expect(parsed.payload?.lineage?.displayName).toBe("Protos");
  });

  it("stores attachments under safe names while keeping the original name in metadata", () => {
    expect(buildAttachmentStorageName(0, "Plan Série A.PDF")).toBe("01-plan-serie-a.pdf");
    expect(buildAttachmentStorageName(1, "../../evil")).toBe("02-evil");
  });
});
