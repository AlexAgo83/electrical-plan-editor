import { describe, expect, it } from "vitest";
import { appActions, appReducer, createSampleNetworkState, type AppState } from "../store";
import { buildWorkspaceFilePayload, serializeWorkspaceFilePayload } from "../app/lib/workspaceFile";
import { MemoryLineageDirectory, encodeText } from "../app/lib/lineage/lineageDirectory";
import {
  applyLegacyAdoption,
  buildDefaultLegacyAdoptionPlan,
  buildLegacyAdoptionPreview,
  readFileNameTimestamp,
  validateLegacyAdoptionPlan
} from "../app/lib/lineage/lineageLegacyImport";
import { LineageRepository } from "../app/lib/lineage/lineageRepository";
import { FaultyLineageDirectory } from "./helpers/lineage-test-utils";

function edited(name: string): AppState {
  const state = createSampleNetworkState();
  const networkId = state.networks.allIds[0]!;
  return appReducer(state, appActions.updateNetwork(networkId, name, state.networks.byId[networkId]!.technicalId, "2026-10-01T08:00:00.000Z"));
}

function legacyFile(name: string, state: AppState, updatedAtIso: string | null): { name: string; bytes: Uint8Array } {
  const payload = buildWorkspaceFilePayload(state, null, updatedAtIso ?? "2026-01-01T00:00:00.000Z");
  const raw = JSON.parse(serializeWorkspaceFilePayload(payload)) as Record<string, unknown>;
  raw.schemaVersion = 1;
  if (updatedAtIso === null) {
    delete raw.updatedAtIso;
  }
  return { name, bytes: encodeText(JSON.stringify(raw)) };
}

describe("legacy timestamped workspace adoption", () => {
  it("reads filename timestamps but never invents dates", () => {
    expect(readFileNameTimestamp("electrical-workspace-2026-05-30_10-00-00.epe.json")).toBe("2026-05-30T10:00:00.000Z");
    expect(readFileNameTimestamp("copy of plan.epe.json")).toBeNull();
    expect(readFileNameTimestamp("electrical-workspace-2026-13-45_10-00-00.epe.json")).toBeNull();
  });

  it("previews embedded dates first, filename timestamps second, and keeps undated, tied, duplicate and corrupt files visible", async () => {
    const preview = await buildLegacyAdoptionPreview([
      legacyFile("electrical-workspace-2026-03-01_09-00-00.epe.json", edited("March"), "2026-02-15T09:00:00.000Z"),
      legacyFile("electrical-workspace-2026-01-10_08-00-00.epe.json", edited("January"), null),
      legacyFile("copy.epe.json", edited("Undated"), null),
      legacyFile("same-a.epe.json", edited("Tie"), "2026-04-01T10:00:00.000Z"),
      legacyFile("same-b.epe.json", edited("Tie"), "2026-04-01T10:00:00.000Z"),
      { name: "broken.epe.json", bytes: encodeText("{ nope") }
    ]);
    const byName = new Map(preview.entries.map((entry) => [entry.fileName, entry]));
    expect(preview.entries).toHaveLength(6);
    expect(byName.get("electrical-workspace-2026-03-01_09-00-00.epe.json")).toMatchObject({ dateSource: "embedded-date", suggestedDateIso: "2026-02-15T09:00:00.000Z" });
    expect(byName.get("electrical-workspace-2026-01-10_08-00-00.epe.json")).toMatchObject({ dateSource: "filename-timestamp" });
    expect(byName.get("copy.epe.json")).toMatchObject({ dateSource: null, suggestedDateIso: null });
    expect(byName.get("broken.epe.json")?.status).toBe("invalid");
    expect(byName.get("same-a.epe.json")?.duplicateOfEntryIds).toEqual([byName.get("same-b.epe.json")?.entryId]);
    expect(byName.get("same-a.epe.json")?.tiedWithEntryIds).toHaveLength(1);
    expect(preview.entries.map((entry) => entry.fileName).slice(0, 2)).toEqual([
      "electrical-workspace-2026-01-10_08-00-00.epe.json",
      "electrical-workspace-2026-03-01_09-00-00.epe.json"
    ]);

    const plan = buildDefaultLegacyAdoptionPlan(preview);
    const issues = validateLegacyAdoptionPlan(preview, plan);
    expect(issues).toContainEqual({ kind: "unplaced", entryId: byName.get("copy.epe.json")!.entryId });
    expect(issues).toContainEqual({ kind: "ties-not-reviewed" });
    expect(validateLegacyAdoptionPlan(preview, { ...plan, orderedEntryIds: [...plan.orderedEntryIds, byName.get("broken.epe.json")!.entryId] }))
      .toContainEqual({ kind: "invalid-in-order", entryId: byName.get("broken.epe.json")!.entryId });
  });

  it("assigns separate batches to Series and Prototypes with reviewed order, provenance and untouched originals", async () => {
    const serieFiles = [
      legacyFile("electrical-workspace-2026-01-10_08-00-00.epe.json", edited("S1"), null),
      legacyFile("electrical-workspace-2026-02-10_08-00-00.epe.json", edited("S2"), null),
      legacyFile("undated.epe.json", edited("S0"), null)
    ];
    const protoFiles = [legacyFile("electrical-workspace-2026-03-10_08-00-00.epe.json", edited("P1"), null)];
    const originals = [...serieFiles, ...protoFiles].map((file) => [...file.bytes]);

    const serie = await LineageRepository.initialize(new MemoryLineageDirectory(), { displayName: "Série", state: edited("current") });
    const protos = await LineageRepository.initialize(new MemoryLineageDirectory(), { displayName: "Protos", state: edited("current") });

    const seriePreview = await buildLegacyAdoptionPreview(serieFiles);
    const undated = seriePreview.entries.find((entry) => entry.fileName === "undated.epe.json")!;
    const seriePlan = buildDefaultLegacyAdoptionPlan(seriePreview);
    seriePlan.orderedEntryIds = [undated.entryId, ...seriePlan.orderedEntryIds];
    seriePlan.labels[undated.entryId] = "Avant migration";
    const serieResult = await applyLegacyAdoption(serie, seriePreview, seriePlan, { currentState: edited("current"), preserveDisplacedWork: true });
    expect(serieResult.versions.map((entry) => entry.displayNumber)).toEqual([1, 2, 3]);
    expect(serieResult.versions[0]).toMatchObject({ title: "Avant migration", provenanceKind: "legacy-import", parentVersionId: null, originalFileName: "undated.epe.json" });
    expect(serieResult.workingState?.networks.byId[serieResult.workingState.networks.allIds[0]!]?.name).toBe("S2");
    expect(serie.getManifest().recovery.some((entry) => entry.kind === "pre-restore")).toBe(true);

    const protoPreview = await buildLegacyAdoptionPreview(protoFiles);
    const protoResult = await applyLegacyAdoption(protos, protoPreview, buildDefaultLegacyAdoptionPlan(protoPreview), { currentState: edited("current"), preserveDisplacedWork: true });
    expect(protoResult.versions).toHaveLength(1);
    expect(serie.getManifest().workspaceId).not.toBe(protos.getManifest().workspaceId);

    for (const version of serieResult.versions) {
      const read = await serie.readVersion(version.versionId);
      expect(read.payload.version?.provenance.kind).toBe("legacy-import");
    }
    expect([...serieFiles, ...protoFiles].map((file) => [...file.bytes])).toEqual(originals);

    const appendPreview = await buildLegacyAdoptionPreview([legacyFile("electrical-workspace-2026-04-10_08-00-00.epe.json", edited("S4"), null)]);
    const appendPlan = { ...buildDefaultLegacyAdoptionPlan(appendPreview), workingEntryId: null };
    const appended = await applyLegacyAdoption(serie, appendPreview, appendPlan, { currentState: edited("current"), preserveDisplacedWork: true });
    expect(appended.versions[0]?.displayNumber).toBe(4);
    expect(appended.workingState).toBeNull();
  });

  it("keeps the lineage intact on failed publication and retries without duplicate snapshots", async () => {
    const directory = new FaultyLineageDirectory();
    const repository = await LineageRepository.initialize(directory, { displayName: "Série", state: edited("current") });
    const preview = await buildLegacyAdoptionPreview([
      legacyFile("electrical-workspace-2026-01-10_08-00-00.epe.json", edited("S1"), null),
      legacyFile("electrical-workspace-2026-02-10_08-00-00.epe.json", edited("S2"), null)
    ]);
    const plan = { ...buildDefaultLegacyAdoptionPlan(preview), workingEntryId: null };
    let writes = 0;
    directory.failWrites((path) => path.startsWith("Versions/") && ++writes === 2);
    await expect(applyLegacyAdoption(repository, preview, plan, { currentState: edited("current"), preserveDisplacedWork: true })).rejects.toBeDefined();
    expect((await new LineageRepository(directory).open()).working.state.networks.byId[repository.getWorking().state.networks.allIds[0]!]?.name).toBe("current");

    const result = await applyLegacyAdoption(repository, preview, plan, { currentState: edited("current"), preserveDisplacedWork: true });
    expect(result.versions.map((entry) => entry.displayNumber)).toEqual([1, 2]);
    expect(repository.getManifest().versions).toHaveLength(2);
  });
});
